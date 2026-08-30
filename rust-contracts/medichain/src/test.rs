#![cfg(test)]

// Import everything from the parent module so the tests
// can directly use the MediChain contract and its types.
use super::*;

// Import Soroban's Address test utility for generating
// mock addresses during unit tests.
use soroban_sdk::testutils::Address as _;

// Import the Soroban SDK types required by the tests.
use soroban_sdk::{Address, Env, String};

// ============================================================
// DOCTOR REGISTRATION TESTS
// ============================================================

#[test]
fn test_register_doctor() {
    // Create a new isolated Soroban test environment.
    let env = Env::default();

    // Automatically approve all authorization requests
    // inside the test environment.
    env.mock_all_auths();

    // Register the MediChain contract in the test environment.
    let contract_id = env.register_contract(None, MediChainContract);

    // Create a client used to call the contract functions.
    let client = MediChainContractClient::new(&env, &contract_id);

    // Generate a mock address representing a doctor.
    let doctor = Address::generate(&env);

    // Register the doctor on-chain.
    client.register_doctor(&doctor);
}

// ============================================================
// PATIENT REGISTRATION TESTS
// ============================================================

#[test]
fn test_register_patient() {
    // Create a new test environment.
    let env = Env::default();

    // Mock all required authorizations.
    env.mock_all_auths();

    // Deploy the MediChain contract in the test environment.
    let contract_id = env.register_contract(None, MediChainContract);

    // Create a contract client.
    let client = MediChainContractClient::new(&env, &contract_id);

    // Generate a mock patient address.
    let patient = Address::generate(&env);

    // Register the patient on-chain.
    client.register_patient(&patient);
}

// Verify that registering the same patient twice is rejected.
#[test]
#[should_panic(expected = "patient already registered")]
fn test_duplicate_patient_registration_rejected() {
    // Create a test environment.
    let env = Env::default();

    // Automatically authorize contract calls.
    env.mock_all_auths();

    // Deploy the MediChain contract.
    let contract_id = env.register_contract(None, MediChainContract);

    // Create a client for interacting with the contract.
    let client = MediChainContractClient::new(&env, &contract_id);

    // Generate a mock patient address.
    let patient = Address::generate(&env);

    // First registration should succeed.
    client.register_patient(&patient);

    // Second registration should fail with the expected error.
    client.register_patient(&patient);
}

// Verify that registering the same doctor twice is rejected.
#[test]
#[should_panic(expected = "doctor already registered")]
fn test_duplicate_doctor_registration_rejected() {
    // Create a test environment.
    let env = Env::default();

    // Automatically authorize contract calls.
    env.mock_all_auths();

    // Deploy the MediChain contract.
    let contract_id = env.register_contract(None, MediChainContract);

    // Create a contract client.
    let client = MediChainContractClient::new(&env, &contract_id);

    // Generate a mock doctor address.
    let doctor = Address::generate(&env);

    // First registration should succeed.
    client.register_doctor(&doctor);

    // Second registration should be rejected.
    client.register_doctor(&doctor);
}

// ============================================================
// MEDICAL RECORD TESTS
// ============================================================

#[test]
fn test_records_are_indexed_and_paginated() {
    // Create a new test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the MediChain contract.
    let contract_id = env.register_contract(None, MediChainContract);

    // Create a client for contract interaction.
    let client = MediChainContractClient::new(&env, &contract_id);

    // Generate a mock patient address.
    let patient = Address::generate(&env);

    // Register the patient before adding records.
    client.register_patient(&patient);

    // Add the first medical record.
    let id1 = client.add_record(
        &patient,
        &String::from_str(&env, "cid-1"),
        &String::from_str(&env, "One"),
    );

    // Add the second medical record.
    let id2 = client.add_record(
        &patient,
        &String::from_str(&env, "cid-2"),
        &String::from_str(&env, "Two"),
    );

    // The first record should receive ID 0.
    assert_eq!(id1, 0);

    // The second record should receive ID 1.
    assert_eq!(id2, 1);

    // The patient should now have two records.
    assert_eq!(client.record_count(&patient), 2);

    // Request the first page containing one record.
    let page = client.get_records(
        &patient,
        &patient,
        &0,
        &1,
    );

    // Verify that exactly one record was returned.
    assert_eq!(page.len(), 1);

    // Verify that the first record is the expected record.
    assert_eq!(
        page.get(0).unwrap().title,
        String::from_str(&env, "One")
    );

    // Request the second page starting from record ID 1.
    let second_page = client.get_records(
        &patient,
        &patient,
        &1,
        &1,
    );

    // Verify that exactly one record was returned.
    assert_eq!(second_page.len(), 1);

    // Verify that the second record is the expected record.
    assert_eq!(
        second_page.get(0).unwrap().title,
        String::from_str(&env, "Two")
    );
}

// Verify that a patient can access their own medical records.
#[test]
fn test_patient_can_view_own_records() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorizations.
    env.mock_all_auths();

    // Deploy the MediChain contract.
    let contract_id = env.register_contract(None, MediChainContract);

    // Create a contract client.
    let client = MediChainContractClient::new(&env, &contract_id);

    // Generate a mock patient address.
    let patient = Address::generate(&env);

    // Register the patient.
    client.register_patient(&patient);

    // Add a medical record for the patient.
    client.add_record(
        &patient,
        &String::from_str(&env, "cid-123"),
        &String::from_str(&env, "Medical Report"),
    );

    // Request the patient's own records.
    let records = client.get_records(
        &patient,
        &patient,
        &0,
        &10,
    );

    // Verify that the patient can retrieve their record.
    assert_eq!(records.len(), 1);
}

// ============================================================
// ACCESS CONTROL TESTS
// ============================================================

#[test]
fn test_grant_and_revoke_access() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the MediChain contract.
    let contract_id = env.register_contract(None, MediChainContract);

    // Create a contract client.
    let client = MediChainContractClient::new(&env, &contract_id);

    // Generate mock addresses for the patient and doctor.
    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    // Register both users.
    client.register_patient(&patient);
    client.register_doctor(&doctor);

    // Access should initially be denied.
    assert!(!client.has_access(&patient, &doctor));

    // Grant the doctor access to the patient's records.
    client.grant_access(&patient, &doctor);

    // Access should now be granted.
    assert!(client.has_access(&patient, &doctor));

    // Revoke the doctor's access.
    client.revoke_access(&patient, &doctor);

    // Access should be denied again.
    assert!(!client.has_access(&patient, &doctor));
}

// Verify that an unregistered doctor cannot receive access.
#[test]
#[should_panic(expected = "doctor is not registered")]
fn test_unregistered_doctor_cannot_receive_access() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the MediChain contract.
    let contract_id = env.register_contract(None, MediChainContract);

    // Create a contract client.
    let client = MediChainContractClient::new(&env, &contract_id);

    // Generate mock patient and doctor addresses.
    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    // Register only the patient.
    client.register_patient(&patient);

    // This should fail because the doctor is not registered.
    client.grant_access(&patient, &doctor);
}

// Verify that a doctor without permission cannot view records.
#[test]
#[should_panic(expected = "doctor does not have access")]
fn test_unauthorized_doctor_cannot_view_records() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the MediChain contract.
    let contract_id = env.register_contract(None, MediChainContract);

    // Create a contract client.
    let client = MediChainContractClient::new(&env, &contract_id);

    // Generate mock patient and doctor addresses.
    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    // Register both the patient and doctor.
    client.register_patient(&patient);
    client.register_doctor(&doctor);

    // Add a private medical record for the patient.
    client.add_record(
        &patient,
        &String::from_str(&env, "cid-1"),
        &String::from_str(&env, "Private Record"),
    );

    // The doctor has not been granted access,
    // so this call should fail.
    client.get_records(
        &patient,
        &doctor,
        &0,
        &10,
    );
}

// Verify that an authorized doctor can view patient records.
#[test]
fn test_authorized_doctor_can_view_records() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the MediChain contract.
    let contract_id = env.register_contract(None, MediChainContract);

    // Create a contract client.
    let client = MediChainContractClient::new(&env, &contract_id);

    // Generate mock patient and doctor addresses.
    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    // Register both users.
    client.register_patient(&patient);
    client.register_doctor(&doctor);

    // Add a private medical record.
    client.add_record(
        &patient,
        &String::from_str(&env, "cid-1"),
        &String::from_str(&env, "Private Record"),
    );

    // Explicitly grant the doctor access.
    client.grant_access(&patient, &doctor);

    // The authorized doctor requests the patient's records.
    let records = client.get_records(
        &patient,
        &doctor,
        &0,
        &10,
    );

    // Verify that the doctor received one record.
    assert_eq!(records.len(), 1);

    // Verify that the correct record was returned.
    assert_eq!(
        records.get(0).unwrap().title,
        String::from_str(&env, "Private Record")
    );
}

// Verify that access revocation immediately prevents record access.
#[test]
#[should_panic(expected = "doctor does not have access")]
fn test_revoked_doctor_cannot_view_records() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the MediChain contract.
    let contract_id = env.register_contract(None, MediChainContract);

    // Create a contract client.
    let client = MediChainContractClient::new(&env, &contract_id);

    // Generate mock patient and doctor addresses.
    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    // Register both users.
    client.register_patient(&patient);
    client.register_doctor(&doctor);

    // Add a private medical record.
    client.add_record(
        &patient,
        &String::from_str(&env, "cid-1"),
        &String::from_str(&env, "Private Record"),
    );

    // Grant access to the doctor.
    client.grant_access(&patient, &doctor);

    // Revoke the previously granted access.
    client.revoke_access(&patient, &doctor);

    // The doctor should no longer be able to view the records.
    client.get_records(
        &patient,
        &doctor,
        &0,
        &10,
    );
}

// ============================================================
// REWARD TOKEN TESTS
// ============================================================

// Verify that the reward token cannot be initialized twice.
#[test]
#[should_panic(expected = "already initialized")]
fn test_token_duplicate_initialization_rejected() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the reward token contract.
    let token_id = env.register_contract(None, token::MediRewardToken);

    // Create a client for the reward token contract.
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    // Generate two different administrator addresses.
    let admin1 = Address::generate(&env);
    let admin2 = Address::generate(&env);

    // Initialize the token with the first administrator.
    token_client.initialize_token(&admin1);

    // A second initialization should fail.
    token_client.initialize_token(&admin2);
}

// Verify that negative token minting is rejected.
#[test]
#[should_panic(expected = "amount must be positive")]
fn test_token_negative_mint_rejected() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the reward token contract.
    let token_id = env.register_contract(None, token::MediRewardToken);

    // Create a token contract client.
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    // Generate administrator and user addresses.
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // Initialize the token contract.
    token_client.initialize_token(&admin);

    // Negative mint amounts must be rejected.
    token_client.mint(&user, &-100);
}

// Verify that zero-value token minting is rejected.
#[test]
#[should_panic(expected = "amount must be positive")]
fn test_token_zero_mint_rejected() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the reward token contract.
    let token_id = env.register_contract(None, token::MediRewardToken);

    // Create a token contract client.
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    // Generate administrator and user addresses.
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // Initialize the token contract.
    token_client.initialize_token(&admin);

    // Zero-value minting must be rejected.
    token_client.mint(&user, &0);
}

// Verify that negative token transfers are rejected.
#[test]
#[should_panic(expected = "amount must be positive")]
fn test_token_negative_transfer_rejected() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the reward token contract.
    let token_id = env.register_contract(None, token::MediRewardToken);

    // Create a token contract client.
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    // Generate administrator and user addresses.
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    // Initialize the token contract.
    token_client.initialize_token(&admin);

    // Give the first user an initial balance.
    token_client.mint(&user1, &1000);

    // Negative transfers must be rejected.
    token_client.transfer(&user1, &user2, &-100);
}

// Verify that zero-value token transfers are rejected.
#[test]
#[should_panic(expected = "amount must be positive")]
fn test_token_zero_transfer_rejected() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the reward token contract.
    let token_id = env.register_contract(None, token::MediRewardToken);

    // Create a token contract client.
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    // Generate administrator and user addresses.
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    // Initialize the token contract.
    token_client.initialize_token(&admin);

    // Give the first user an initial balance.
    token_client.mint(&user1, &1000);

    // Zero-value transfers must be rejected.
    token_client.transfer(&user1, &user2, &0);
}

// Verify that users cannot transfer more tokens than they own.
#[test]
#[should_panic(expected = "insufficient balance")]
fn test_token_insufficient_balance_rejected() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the reward token contract.
    let token_id = env.register_contract(None, token::MediRewardToken);

    // Create a token contract client.
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    // Generate administrator and user addresses.
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    // Initialize the token contract.
    token_client.initialize_token(&admin);

    // Give user1 a balance of 100 tokens.
    token_client.mint(&user1, &100);

    // Attempt to transfer 200 tokens even though the user
    // only has 100 tokens. This should fail.
    token_client.transfer(&user1, &user2, &200);
}

// Verify normal token transfers and total supply tracking.
#[test]
fn test_token_transfer_and_total_supply() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the reward token contract.
    let token_id = env.register_contract(None, token::MediRewardToken);

    // Create a token contract client.
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    // Generate administrator and user addresses.
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    // Initialize the reward token contract.
    token_client.initialize_token(&admin);

    // Mint 1000 tokens to user1.
    token_client.mint(&user1, &1000);

    // Verify user1's balance.
    assert_eq!(token_client.balance(&user1), 1000);

    // Verify the total token supply.
    assert_eq!(token_client.total_supply(), 1000);

    // Transfer 400 tokens from user1 to user2.
    token_client.transfer(&user1, &user2, &400);

    // Verify user1's remaining balance.
    assert_eq!(token_client.balance(&user1), 600);

    // Verify user2 received the transferred tokens.
    assert_eq!(token_client.balance(&user2), 400);

    // Total supply should remain unchanged after a transfer.
    assert_eq!(token_client.total_supply(), 1000);
}

// ============================================================
// MEDICHAIN REWARD CONFIGURATION TESTS
// ============================================================

// Verify that MediChain can be configured with a reward token
// and a fixed reward amount.
#[test]
fn test_medi_chain_reward_configuration() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the reward token contract.
    let token_id = env.register_contract(None, token::MediRewardToken);

    // Create a reward token client.
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    // Deploy the MediChain contract.
    let medichain_id =
        env.register_contract(None, MediChainContract);

    // Create a MediChain contract client.
    let client =
        MediChainContractClient::new(&env, &medichain_id);

    // Generate an administrator address.
    let admin = Address::generate(&env);

    // Initialize the reward token.
    // MediChain itself will later be configured as the token's authorized caller.
    token_client.initialize_token(&medichain_id);

    // Initialize MediChain with the reward token and
    // a reward of 100 tokens per record.
    client.initialize(
        &admin,
        &token_id,
        &100,
    );
}

// Verify that MediChain cannot be initialized more than once.
#[test]
#[should_panic(expected = "already initialized")]
fn test_medichain_duplicate_initialization_rejected() {
    // Create a test environment.
    let env = Env::default();

    // Mock all authorization requests.
    env.mock_all_auths();

    // Deploy the reward token contract.
    let token_id = env.register_contract(None, token::MediRewardToken);

    // Create a reward token client.
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    // Deploy the MediChain contract.
    let medichain_id =
        env.register_contract(None, MediChainContract);

    // Create a MediChain contract client.
    let client =
        MediChainContractClient::new(&env, &medichain_id);

    // Generate two different administrator addresses.
    let admin1 = Address::generate(&env);
    let admin2 = Address::generate(&env);

    // Initialize the reward token contract.
    token_client.initialize_token(&medichain_id);

    // Initialize MediChain for the first time.
    client.initialize(
        &admin1,
        &token_id,
        &100,
    );

    // A second initialization should fail,
    // even if different configuration values are provided.
    client.initialize(
        &admin2,
        &token_id,
        &999,
    );
}
