#![cfg(test)]
use super::*;
use soroban_sdk::testutils::Address as _;

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
fn test_token_transfer() {
    let env = Env::default();
    env.mock_all_auths();
    let token_id = env.register_contract(None, token::MediRewardToken);
    let token_client = token::MediRewardTokenClient::new(&env, &token_id);
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    token_client.initialize(&admin);
    token_client.mint(&user1, &1000);
    token_client.transfer(&user1, &user2, &400);

    assert_eq!(token_client.balance(&user1), 600);
    assert_eq!(token_client.balance(&user2), 400);
}
