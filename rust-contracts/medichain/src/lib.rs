#![no_std]

// Import required Soroban SDK types and macros.
use soroban_sdk::{
    contract,
    contractimpl,
    contracttype,
    symbol_short,
    Address,
    Env,
    String,
    Vec,
};

// ---------- Data Types ----------

// Represents a single medical record stored on-chain.
#[contracttype]
#[derive(Clone)]
pub struct MedicalRecord {
    // IPFS/content identifier of the medical document.
    pub cid: String,

    // Human-readable title of the medical record.
    pub title: String,

    // Address of the patient who uploaded the record.
    pub uploaded_by: Address,

    // Ledger timestamp at which the record was created.
    pub created_at: u64,
}

// Defines all storage keys used by the MediChain contract.
#[contracttype]
pub enum DataKey {
    // Stores whether a doctor is registered.
    Doctor(Address),

    // Stores whether a patient is registered.
    Patient(Address),

    // Scalable record storage:
    // Record(patient, record_id) -> MedicalRecord
    Record(Address, u32),

    // Stores the total number of records owned by a patient.
    // RecordCount(patient) -> u32
    RecordCount(Address),

    // Stores whether a doctor has access to a patient's records.
    // Access(patient, doctor) -> bool
    Access(Address, Address),

    // Reward configuration.
    // Stores the contract administrator.
    Admin,

    // Stores the reward token contract address.
    RewardToken,

    // Stores the number of tokens rewarded for each record.
    RewardPerRecord,
}

// ---------- Contract ----------

// Main MediChain smart contract.
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
        // Require authorization from the administrator.
        admin.require_auth();

        // The reward amount must always be greater than zero.
        assert!(reward_per_record > 0, "invalid reward");

        // Prevent the contract from being initialized more than once.
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "already initialized"
        );

        // Store the administrator address in contract instance storage.
        env.storage()
            .instance()
            .set(&DataKey::Admin, &admin);

        // Store the reward token contract address.
        env.storage()
            .instance()
            .set(&DataKey::RewardToken, &reward_token);

        // Store the fixed reward amount per medical record.
        env.storage()
            .instance()
            .set(&DataKey::RewardPerRecord, &reward_per_record);

        // Emit an event confirming that the contract was initialized.
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
        // Require the doctor's authorization before registration.
        doctor.require_auth();

        // Create the storage key for this doctor.
        let key = DataKey::Doctor(doctor.clone());

        // Check whether the doctor is already registered.
        let already_registered: bool = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(false);

        // Prevent duplicate doctor registration.
        assert!(!already_registered, "doctor already registered");

        // Store the doctor's registration status.
        env.storage()
            .persistent()
            .set(&key, &true);

        // Emit an event indicating successful doctor registration.
        env.events().publish(
            (symbol_short!("doctor"), symbol_short!("reg")),
            doctor,
        );
    }

    /// Register a patient on-chain.
    pub fn register_patient(env: Env, patient: Address) {
        // Require the patient's authorization before registration.
        patient.require_auth();

        // Create the storage key for this patient.
        let key = DataKey::Patient(patient.clone());

        // Check whether the patient is already registered.
        let already_registered: bool = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(false);

        // Prevent duplicate patient registration.
        assert!(!already_registered, "patient already registered");

        // Store the patient's registration status.
        env.storage()
            .persistent()
            .set(&key, &true);

        // Emit an event indicating successful patient registration.
        env.events().publish(
            (symbol_short!("patient"), symbol_short!("reg")),
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
        // Only the patient can add a record to their account.
        patient.require_auth();

        // The patient must already be registered.
        Self::require_registered_patient(&env, &patient);

        // Validate the CID and title before storing the record.
        Self::validate_record_input(&record_cid, &title);

        // Create the storage key used to track the patient's record count.
        let count_key = DataKey::RecordCount(patient.clone());

        // Get the current number of records.
        // If no records exist yet, start from ID 0.
        let record_id: u32 = env
            .storage()
            .persistent()
            .get(&count_key)
            .unwrap_or(0);

        // Calculate the next record count safely.
        let next_id = record_id
            .checked_add(1)
            .unwrap_or_else(|| panic!("record count overflow"));

        // Create the medical record object.
        let record = MedicalRecord {
            // Store the document's CID.
            cid: record_cid,

            // Store the record title.
            title,

            // Store the patient address as the uploader.
            uploaded_by: patient.clone(),

            // Store the current ledger timestamp.
            created_at: env.ledger().timestamp(),
        };

        // Store the individual medical record using the patient
        // address and record ID as the storage key.
        env.storage()
            .persistent()
            .set(
                &DataKey::Record(patient.clone(), record_id),
                &record,
            );

        // Update the patient's total record count.
        env.storage()
            .persistent()
            .set(&count_key, &next_id);

        // Emit an event indicating that a new record was created.
        env.events().publish(
            (symbol_short!("record"), symbol_short!("created")),
            (patient, record_id),
        );

        // Return the ID assigned to the newly created record.
        record_id
    }

    /// Return the total number of records owned by a patient.
    pub fn record_count(env: Env, patient: Address) -> u32 {
        // Make sure the patient is registered.
        Self::require_registered_patient(&env, &patient);

        // Return the stored record count.
        // If no count exists, return zero.
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
        // Verify that the viewer is authorized to access the records.
        Self::require_can_view(&env, &patient, &viewer);

        // Prevent unnecessarily large reads.
        assert!(limit > 0, "limit must be positive");
        assert!(limit <= 50, "limit too large");

        // Get the total number of records belonging to the patient.
        let count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::RecordCount(patient.clone()))
            .unwrap_or(0);

        // If the requested starting position is outside the record
        // range, return an empty vector.
        if start >= count {
            return Vec::new(&env);
        }

        // Calculate the requested ending position safely.
        let requested_end = start
            .checked_add(limit)
            .unwrap_or(u32::MAX);

        // Make sure we never read beyond the total record count.
        let end = core::cmp::min(requested_end, count);

        // Create a vector to store the records returned to the viewer.
        let mut result = Vec::new(&env);

        // Iterate through the requested record range.
        for id in start..end {
            // Try to load each medical record from persistent storage.
            if let Some(record) = env
                .storage()
                .persistent()
                .get::<DataKey, MedicalRecord>(
                    &DataKey::Record(patient.clone(), id),
                )
            {
                // Add the record to the result vector.
                result.push_back(record);
            }
        }

        // Return the requested page of medical records.
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
        // Only the patient can grant access to their records.
        patient.require_auth();

        // Make sure the patient is registered.
        Self::require_registered_patient(&env, &patient);

        // Make sure the doctor is registered.
        Self::require_registered_doctor(&env, &doctor);

        // Store permission for this patient-doctor pair.
        env.storage()
            .persistent()
            .set(
                &DataKey::Access(patient.clone(), doctor.clone()),
                &true,
            );

        // Emit an event indicating that access was granted.
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
        // Only the patient can revoke access.
        patient.require_auth();

        // Make sure the patient is registered.
        Self::require_registered_patient(&env, &patient);

        // Remove the access permission from persistent storage.
        env.storage()
            .persistent()
            .remove(&DataKey::Access(
                patient.clone(),
                doctor.clone(),
            ));

        // Emit an event indicating that access was revoked.
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
        // Read the stored access permission.
        // Return false if no permission exists.
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
        // Require the patient's authorization.
        patient.require_auth();

        // Make sure the patient is registered.
        Self::require_registered_patient(&env, &patient);

        // Add the medical record first.
        // The returned value is the newly created record ID.
        let record_id = Self::add_record(
            env.clone(),
            patient.clone(),
            record_cid,
            title,
        );

        // Retrieve the configured reward token address.
        let token: Address = env
            .storage()
            .instance()
            .get(&DataKey::RewardToken)
            .unwrap_or_else(|| panic!("contract not initialized"));

        // Retrieve the configured reward amount.
        let amount: i128 = env
            .storage()
            .instance()
            .get(&DataKey::RewardPerRecord)
            .unwrap_or_else(|| panic!("reward not configured"));

        // Make sure the configured reward amount is valid.
        assert!(amount > 0, "invalid reward");

        // Create a client for interacting with the reward token contract.
        let token_client =
            crate::token::MediRewardTokenClient::new(&env, &token);

        // Mint the configured reward amount to the patient.
        token_client.mint(&patient, &amount);

        // Emit an event indicating that the reward was minted.
        env.events().publish(
            (symbol_short!("reward"), symbol_short!("minted")),
            (patient, amount),
        );

        // Return the medical record ID.
        record_id
    }

    // ============================================================
    // INTERNAL VALIDATION / AUTHORIZATION
    // ============================================================

    // Verify that a patient is registered.
    fn require_registered_patient(
        env: &Env,
        patient: &Address,
    ) {
        // Read the patient's registration status.
        let registered: bool = env
            .storage()
            .persistent()
            .get(&DataKey::Patient(patient.clone()))
            .unwrap_or(false);

        // Stop execution if the patient is not registered.
        assert!(registered, "patient is not registered");
    }

    // Verify that a doctor is registered.
    fn require_registered_doctor(
        env: &Env,
        doctor: &Address,
    ) {
        // Read the doctor's registration status.
        let registered: bool = env
            .storage()
            .persistent()
            .get(&DataKey::Doctor(doctor.clone()))
            .unwrap_or(false);

        // Stop execution if the doctor is not registered.
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
        // The patient whose records are being requested
        // must be registered.
        Self::require_registered_patient(env, patient);

        // Patient can always view their own records.
        if viewer == patient {
            // Require authentication from the patient.
            viewer.require_auth();

            // Authorization is complete for the patient.
            return;
        }

        // Otherwise the viewer must be a registered doctor.
        Self::require_registered_doctor(env, viewer);

        // Read the patient's permission for this doctor.
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

        // The doctor must have explicit permission from the patient.
        assert!(access, "doctor does not have access");

        // Require authentication from the doctor.
        viewer.require_auth();
    }

    /// Basic validation before writing record data to storage.
    fn validate_record_input(
        record_cid: &String,
        title: &String,
    ) {
        // CID must not be empty.
        assert!(record_cid.len() > 0, "CID cannot be empty");

        // Record title must not be empty.
        assert!(title.len() > 0, "title cannot be empty");

        // Keep individual inputs bounded.
        // This prevents unnecessarily large values from being stored.
        assert!(record_cid.len() <= 200, "CID too long");
        assert!(title.len() <= 200, "title too long");
    }
}

// Import the token module containing the reward token contract.
pub mod token;

// Enable the test module only when compiling tests.
#[cfg(test)]
mod test;
