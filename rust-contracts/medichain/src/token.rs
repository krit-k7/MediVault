use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
pub enum TokenDataKey {
    Admin,
    Balance(Address),
}

#[contract]
pub struct MediRewardToken;

#[contractimpl]
impl MediRewardToken {
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&TokenDataKey::Admin, &admin);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&TokenDataKey::Admin).unwrap();
        admin.require_auth();
        let key = TokenDataKey::Balance(to.clone());
        let balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(balance + amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_key = TokenDataKey::Balance(from.clone());
        let to_key = TokenDataKey::Balance(to.clone());
        let from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        assert!(from_balance >= amount, "insufficient balance");
        let to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        env.storage().persistent().set(&from_key, &(from_balance - amount));
        env.storage().persistent().set(&to_key, &(to_balance + amount));
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage().persistent().get(&TokenDataKey::Balance(id)).unwrap_or(0)
    }
}
