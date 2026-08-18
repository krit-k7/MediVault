#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, String};

#[test]
fn test_register_doctor() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MediChainContract);
    let client = MediChainContractClient::new(&env, &contract_id);

    let doctor = Address::generate(&env);

    client.register_doctor(&doctor);
}

#[test]
fn test_register_patient() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MediChainContract);
    let client = MediChainContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);

    client.register_patient(&patient);
}

#[test]
#[should_panic(expected = "patient already registered")]
fn test_duplicate_patient_registration_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MediChainContract);
    let client = MediChainContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);

    client.register_patient(&patient);
    client.register_patient(&patient);
}

#[test]
#[should_panic(expected = "doctor already registered")]
fn test_duplicate_doctor_registration_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MediChainContract);
    let client = MediChainContractClient::new(&env, &contract_id);

    let doctor = Address::generate(&env);

    client.register_doctor(&doctor);
    client.register_doctor(&doctor);
}

#[test]
fn test_records_are_indexed_and_paginated() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MediChainContract);
    let client = MediChainContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);

    client.register_patient(&patient);

    let id1 = client.add_record(
        &patient,
        &String::from_str(&env, "cid-1"),
        &String::from_str(&env, "One"),
    );

    let id2 = client.add_record(
        &patient,
        &String::from_str(&env, "cid-2"),
        &String::from_str(&env, "Two"),
    );

    assert_eq!(id1, 0);
    assert_eq!(id2, 1);
    assert_eq!(client.record_count(&patient), 2);

    let page = client.get_records(
        &patient,
        &patient,
        &0,
        &1,
    );

    assert_eq!(page.len(), 1);
    assert_eq!(page.get(0).unwrap().title, String::from_str(&env, "One"));

    let second_page = client.get_records(
        &patient,
        &patient,
        &1,
        &1,
    );

    assert_eq!(second_page.len(), 1);
    assert_eq!(
        second_page.get(0).unwrap().title,
        String::from_str(&env, "Two")
    );
}

#[test]
fn test_patient_can_view_own_records() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MediChainContract);
    let client = MediChainContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);

    client.register_patient(&patient);

    client.add_record(
        &patient,
        &String::from_str(&env, "cid-123"),
        &String::from_str(&env, "Medical Report"),
    );

    let records = client.get_records(
        &patient,
        &patient,
        &0,
        &10,
    );

    assert_eq!(records.len(), 1);
}

#[test]
fn test_grant_and_revoke_access() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MediChainContract);
    let client = MediChainContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    client.register_patient(&patient);
    client.register_doctor(&doctor);

    assert!(!client.has_access(&patient, &doctor));

    client.grant_access(&patient, &doctor);

    assert!(client.has_access(&patient, &doctor));

    client.revoke_access(&patient, &doctor);

    assert!(!client.has_access(&patient, &doctor));
}

#[test]
#[should_panic(expected = "doctor is not registered")]
fn test_unregistered_doctor_cannot_receive_access() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MediChainContract);
    let client = MediChainContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    client.register_patient(&patient);

    client.grant_access(&patient, &doctor);
}

#[test]
#[should_panic(expected = "doctor does not have access")]
fn test_unauthorized_doctor_cannot_view_records() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MediChainContract);
    let client = MediChainContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    client.register_patient(&patient);
    client.register_doctor(&doctor);

    client.add_record(
        &patient,
        &String::from_str(&env, "cid-1"),
        &String::from_str(&env, "Private Record"),
    );

    client.get_records(
        &patient,
        &doctor,
        &0,
        &10,
    );
}

#[test]
fn test_authorized_doctor_can_view_records() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MediChainContract);
    let client = MediChainContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    client.register_patient(&patient);
    client.register_doctor(&doctor);

    client.add_record(
        &patient,
        &String::from_str(&env, "cid-1"),
        &String::from_str(&env, "Private Record"),
    );

    client.grant_access(&patient, &doctor);

    let records = client.get_records(
        &patient,
        &doctor,
        &0,
        &10,
    );

    assert_eq!(records.len(), 1);
    assert_eq!(
        records.get(0).unwrap().title,
        String::from_str(&env, "Private Record")
    );
}

#[test]
#[should_panic(expected = "doctor does not have access")]
fn test_revoked_doctor_cannot_view_records() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MediChainContract);
    let client = MediChainContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    client.register_patient(&patient);
    client.register_doctor(&doctor);

    client.add_record(
        &patient,
        &String::from_str(&env, "cid-1"),
        &String::from_str(&env, "Private Record"),
    );

    client.grant_access(&patient, &doctor);
    client.revoke_access(&patient, &doctor);

    client.get_records(
        &patient,
        &doctor,
        &0,
        &10,
    );
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_token_duplicate_initialization_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let token_id = env.register_contract(None, token::MediRewardToken);
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    let admin1 = Address::generate(&env);
    let admin2 = Address::generate(&env);

    token_client.initialize(&admin1);
    token_client.initialize(&admin2);
}

#[test]
#[should_panic(expected = "amount must be positive")]
fn test_token_negative_mint_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let token_id = env.register_contract(None, token::MediRewardToken);
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    token_client.initialize(&admin);

    token_client.mint(&user, &-100);
}

#[test]
#[should_panic(expected = "amount must be positive")]
fn test_token_zero_mint_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let token_id = env.register_contract(None, token::MediRewardToken);
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    token_client.initialize(&admin);

    token_client.mint(&user, &0);
}

#[test]
#[should_panic(expected = "amount must be positive")]
fn test_token_negative_transfer_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let token_id = env.register_contract(None, token::MediRewardToken);
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    token_client.initialize(&admin);
    token_client.mint(&user1, &1000);

    token_client.transfer(&user1, &user2, &-100);
}

#[test]
#[should_panic(expected = "amount must be positive")]
fn test_token_zero_transfer_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let token_id = env.register_contract(None, token::MediRewardToken);
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    token_client.initialize(&admin);
    token_client.mint(&user1, &1000);

    token_client.transfer(&user1, &user2, &0);
}

#[test]
#[should_panic(expected = "insufficient balance")]
fn test_token_insufficient_balance_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let token_id = env.register_contract(None, token::MediRewardToken);
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    token_client.initialize(&admin);
    token_client.mint(&user1, &100);

    token_client.transfer(&user1, &user2, &200);
}

#[test]
fn test_token_transfer_and_total_supply() {
    let env = Env::default();
    env.mock_all_auths();

    let token_id = env.register_contract(None, token::MediRewardToken);
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    token_client.initialize(&admin);

    token_client.mint(&user1, &1000);

    assert_eq!(token_client.balance(&user1), 1000);
    assert_eq!(token_client.total_supply(), 1000);

    token_client.transfer(&user1, &user2, &400);

    assert_eq!(token_client.balance(&user1), 600);
    assert_eq!(token_client.balance(&user2), 400);
    assert_eq!(token_client.total_supply(), 1000);
}

#[test]
fn test_medi_chain_reward_configuration() {
    let env = Env::default();
    env.mock_all_auths();

    let token_id = env.register_contract(None, token::MediRewardToken);
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    let medichain_id =
        env.register_contract(None, MediChainContract);
    let client =
        MediChainContractClient::new(&env, &medichain_id);

    let admin = Address::generate(&env);

    token_client.initialize(&medichain_id);

    client.initialize(
        &admin,
        &token_id,
        &100,
    );
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_medichain_duplicate_initialization_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let token_id = env.register_contract(None, token::MediRewardToken);
    let token_client =
        token::MediRewardTokenClient::new(&env, &token_id);

    let medichain_id =
        env.register_contract(None, MediChainContract);
    let client =
        MediChainContractClient::new(&env, &medichain_id);

    let admin1 = Address::generate(&env);
    let admin2 = Address::generate(&env);

    token_client.initialize(&medichain_id);

    client.initialize(
        &admin1,
        &token_id,
        &100,
    );

    client.initialize(
        &admin2,
        &token_id,
        &999,
    );
}
