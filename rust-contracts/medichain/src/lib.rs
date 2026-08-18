#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec,
};

// ---------- Data Types ----------

#[contracttype]
#[derive(Clone)]
pub struct MedicalRecord {
    pub cid: String,
    pub title: String,
    pub uploaded_by: Address,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    Doctor(Address),
    Patient(Address),

    // Scalable record storage:
    // Record(patient, record_id) -> MedicalRecord
    Record(Address, u32),
    // RecordCount(patient) -> u32
    RecordCount(Address),

    // Access(patient, doctor) -> bool
    Access(Address, Address),

    // Reward configuration
    Admin,
    RewardToken,
    RewardPerRecord,
}

// ---------- Contract ----------

#[contract]
pub struct MediChainContract;

#[contractimpl]
impl MediChainContract {
    // ============================================================
    // INITIALIZATION
    // ============================================================

    /// Initialize the MediChain contract.
    ///
    /// This can only be called once.
    /// The reward token and reward amount are controlled by the
    /// contract instead of being supplied by every user.
    pub fn initialize(
        env: Env,
        admin: Address,
        reward_token: Address,
        reward_per_record: i128,
    ) {
        admin.require_auth();

        assert!(reward_per_record > 0, "invalid reward");

        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "already initialized"
        );

        env.storage()
            .instance()
            .set(&DataKey::Admin, &admin);

        env.storage()
            .instance()
            .set(&DataKey::RewardToken, &reward_token);

        env.storage()
            .instance()
            .set(&DataKey::RewardPerRecord, &reward_per_record);

        env.events().publish(
            (symbol_short!("contract"), symbol_short!("init")),
            admin,
        );
    }

    // ============================================================
    // REGISTRATION
    // ============================================================

    /// Register a doctor on-chain.
    pub fn register_doctor(env: Env, doctor: Address) {
        doctor.require_auth();

        let key = DataKey::Doctor(doctor.clone());

        let already_registered: bool = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(false);

        assert!(!already_registered, "doctor already registered");

        env.storage()
            .persistent()
            .set(&key, &true);

        env.events().publish(
            (symbol_short!("doctor"), symbol_short!("registered")),
            doctor,
        );
    }

    /// Register a patient on-chain.
    pub fn register_patient(env: Env, patient: Address) {
        patient.require_auth();

        let key = DataKey::Patient(patient.clone());

        let already_registered: bool = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(false);

        assert!(!already_registered, "patient already registered");

        env.storage()
            .persistent()
            .set(&key, &true);

        env.events().publish(
            (symbol_short!("patient"), symbol_short!("registered")),
            patient,
        );
    }

    // ============================================================
    // MEDICAL RECORDS
    // ============================================================

    /// Add one medical record.
    ///
    /// Each record gets its own storage key:
    ///
    /// Record(patient, record_id) -> MedicalRecord
    ///
    /// This avoids reading and rewriting the patient's entire
    /// record collection whenever a new record is added.
    pub fn add_record(
        env: Env,
        patient: Address,
        record_cid: String,
        title: String,
    ) -> u32 {
        patient.require_auth();

        Self::require_registered_patient(&env, &patient);
        Self::validate_record_input(&record_cid, &title);

        let count_key = DataKey::RecordCount(patient.clone());

        let record_id: u32 = env
            .storage()
            .persistent()
            .get(&count_key)
            .unwrap_or(0);

        let next_id = record_id
            .checked_add(1)
            .unwrap_or_else(|| panic!("record count overflow"));

        let record = MedicalRecord {
            cid: record_cid,
            title,
            uploaded_by: patient.clone(),
            created_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(
                &DataKey::Record(patient.clone(), record_id),
                &record,
            );

        env.storage()
            .persistent()
            .set(&count_key, &next_id);

        env.events().publish(
            (symbol_short!("record"), symbol_short!("created")),
            (patient, record_id),
        );

        record_id
    }

    /// Return the total number of records owned by a patient.
    pub fn record_count(env: Env, patient: Address) -> u32 {
        Self::require_registered_patient(&env, &patient);

        env.storage()
            .persistent()
            .get(&DataKey::RecordCount(patient))
            .unwrap_or(0)
    }

    /// Get a bounded page of medical records.
    ///
    /// `viewer` must either be the patient or a doctor who has
    /// been explicitly granted access by the patient.
    pub fn get_records(
        env: Env,
        patient: Address,
        viewer: Address,
        start: u32,
        limit: u32,
    ) -> Vec<MedicalRecord> {
        Self::require_can_view(&env, &patient, &viewer);

        // Prevent unnecessarily large reads.
        assert!(limit > 0, "limit must be positive");
        assert!(limit <= 50, "limit too large");

        let count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::RecordCount(patient.clone()))
            .unwrap_or(0);

        if start >= count {
            return Vec::new(&env);
        }

        let requested_end = start
            .checked_add(limit)
            .unwrap_or(u32::MAX);

        let end = core::cmp::min(requested_end, count);

        let mut result = Vec::new(&env);

        for id in start..end {
            if let Some(record) = env
                .storage()
                .persistent()
                .get::<DataKey, MedicalRecord>(
                    &DataKey::Record(patient.clone(), id),
                )
            {
                result.push_back(record);
            }
        }

        result
    }

    // ============================================================
    // ACCESS CONTROL
    // ============================================================

    /// Grant a registered doctor access to a patient's records.
    pub fn grant_access(
        env: Env,
        patient: Address,
        doctor: Address,
    ) {
        patient.require_auth();

        Self::require_registered_patient(&env, &patient);
        Self::require_registered_doctor(&env, &doctor);

        env.storage()
            .persistent()
            .set(
                &DataKey::Access(patient.clone(), doctor.clone()),
                &true,
            );

        env.events().publish(
            (symbol_short!("access"), symbol_short!("granted")),
            (patient, doctor),
        );
    }

    /// Revoke a doctor's access.
    pub fn revoke_access(
        env: Env,
        patient: Address,
        doctor: Address,
    ) {
        patient.require_auth();

        Self::require_registered_patient(&env, &patient);

        env.storage()
            .persistent()
            .remove(&DataKey::Access(
                patient.clone(),
                doctor.clone(),
            ));

        env.events().publish(
            (symbol_short!("access"), symbol_short!("revoked")),
            (patient, doctor),
        );
    }

    /// Check whether a doctor has access to a patient's records.
    pub fn has_access(
        env: Env,
        patient: Address,
        doctor: Address,
    ) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Access(patient, doctor))
            .unwrap_or(false)
    }

    // ============================================================
    // REWARD SYSTEM
    // ============================================================

    /// Add a medical record and reward the patient.
    ///
    /// IMPORTANT:
    /// The caller can no longer provide the token address or
    /// reward amount. Both are controlled by initialization.
    pub fn add_record_with_reward(
        env: Env,
        patient: Address,
        record_cid: String,
        title: String,
    ) -> u32 {
        patient.require_auth();

        Self::require_registered_patient(&env, &patient);

        let record_id = Self::add_record(
            env.clone(),
            patient.clone(),
            record_cid,
            title,
        );

        let token: Address = env
            .storage()
            .instance()
            .get(&DataKey::RewardToken)
            .unwrap_or_else(|| panic!("contract not initialized"));

        let amount: i128 = env
            .storage()
            .instance()
            .get(&DataKey::RewardPerRecord)
            .unwrap_or_else(|| panic!("reward not configured"));

        assert!(amount > 0, "invalid reward");

        let token_client =
            crate::token::MediRewardTokenClient::new(&env, &token);

        token_client.mint(&patient, &amount);

        env.events().publish(
            (symbol_short!("reward"), symbol_short!("minted")),
            (patient, amount),
        );

        record_id
    }

    // ============================================================
    // INTERNAL VALIDATION / AUTHORIZATION
    // ============================================================

    fn require_registered_patient(
        env: &Env,
        patient: &Address,
    ) {
        let registered: bool = env
            .storage()
            .persistent()
            .get(&DataKey::Patient(patient.clone()))
            .unwrap_or(false);

        assert!(registered, "patient is not registered");
    }

    fn require_registered_doctor(
        env: &Env,
        doctor: &Address,
    ) {
        let registered: bool = env
            .storage()
            .persistent()
            .get(&DataKey::Doctor(doctor.clone()))
            .unwrap_or(false);

        assert!(registered, "doctor is not registered");
    }

    /// Verify that the viewer is allowed to read the patient's data.
    ///
    /// Patient:
    ///     patient.require_auth()
    ///
    /// Doctor:
    ///     doctor.require_auth()
    ///     doctor must be registered
    ///     patient must have granted access
    fn require_can_view(
        env: &Env,
        patient: &Address,
        viewer: &Address,
    ) {
        Self::require_registered_patient(env, patient);

        // Patient can always view their own records.
        if viewer == patient {
            viewer.require_auth();
            return;
        }

        // Otherwise the viewer must be a registered doctor.
        Self::require_registered_doctor(env, viewer);

        // And the patient must have granted access.
        let access = env
            .storage()
            .persistent()
            .get::<DataKey, bool>(
                &DataKey::Access(
                    patient.clone(),
                    viewer.clone(),
                ),
            )
            .unwrap_or(false);

        assert!(access, "doctor does not have access");

        viewer.require_auth();
    }

    /// Basic validation before writing record data to storage.
    fn validate_record_input(
        record_cid: &String,
        title: &String,
    ) {
        assert!(record_cid.len() > 0, "CID cannot be empty");
        assert!(title.len() > 0, "title cannot be empty");

        // Keep individual inputs bounded.
        assert!(record_cid.len() <= 200, "CID too long");
        assert!(title.len() <= 200, "title too long");
    }
}

pub mod token;

#[cfg(test)]
mod test;
