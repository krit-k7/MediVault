#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec, symbol_short};

#[contracttype]
#[derive(Clone)]
pub struct MedicalRecord {
    pub cid: String,
    pub title: String,
    pub uploaded_by: Address,
}

#[contracttype]
pub enum DataKey {
    Doctor(Address),
    Patient(Address),
    Records(Address),
    Access(Address, Address), // (patient, doctor)
}

#[contract]
pub struct MediChainContract;

#[contractimpl]
impl MediChainContract {
    pub fn register_doctor(env: Env, doctor: Address) {
        doctor.require_auth();
        env.storage().persistent().set(&DataKey::Doctor(doctor.clone()), &true);
        env.events().publish((symbol_short!("doc_reg"),), doctor);
    }

    pub fn register_patient(env: Env, patient: Address) {
        patient.require_auth();
        env.storage().persistent().set(&DataKey::Patient(patient.clone()), &true);
        env.events().publish((symbol_short!("pat_reg"),), patient);
    }

    pub fn add_record(env: Env, patient: Address, record_cid: String, title: String) {
        patient.require_auth();
        let key = DataKey::Records(patient.clone());
        let mut records: Vec<MedicalRecord> = env.storage().persistent()
            .get(&key).unwrap_or(Vec::new(&env));
        records.push_back(MedicalRecord { cid: record_cid, title, uploaded_by: patient.clone() });
        env.storage().persistent().set(&key, &records);
        env.events().publish((symbol_short!("rec_add"),), patient);
    }

    pub fn grant_access(env: Env, patient: Address, doctor: Address) {
        patient.require_auth();
        env.storage().persistent().set(&DataKey::Access(patient, doctor), &true);
    }

    pub fn revoke_access(env: Env, patient: Address, doctor: Address) {
        patient.require_auth();
        env.storage().persistent().remove(&DataKey::Access(patient, doctor));
    }

    /// Inter-contract call: adds a record then rewards the patient via the token contract
    pub fn add_record_with_reward(
        env: Env,
        patient: Address,
        record_cid: String,
        title: String,
        reward_token_addr: Address,
        reward_amount: i128,
    ) {
        patient.require_auth();
        Self::add_record(env.clone(), patient.clone(), record_cid, title);

        let token_client = crate::token::MediRewardTokenClient::new(&env, &reward_token_addr);
        token_client.mint(&patient, &reward_amount);
    }
}

pub mod token;

mod test;
