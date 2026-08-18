use soroban_sdk::{
    contract,
    contractimpl,
    contracttype,
    symbol_short,
    Address,
    Env,
};

#[contracttype]
pub enum TokenDataKey {
    Admin,
    Balance(Address),
    TotalSupply,
}

#[contract]
pub struct MediRewardToken;

#[contractimpl]
impl MediRewardToken {
    /// Initialize the token contract.
    ///
    /// Initialization is allowed only once.
    /// The admin should normally be the MediChain contract address,
    /// so that only MediChain can mint rewards.
    pub fn initialize_token(env: Env, admin: Address) {
        assert!(
            !env.storage().instance().has(&TokenDataKey::Admin),
            "already initialized"
        );

        env.storage()
            .instance()
            .set(&TokenDataKey::Admin, &admin);

        env.storage()
            .instance()
            .set(&TokenDataKey::TotalSupply, &0i128);
    }

    /// Mint new tokens.
    ///
    /// Only the configured admin/minter can call this.
    /// The amount must be strictly positive.
    pub fn mint(
        env: Env,
        to: Address,
        amount: i128,
    ) {
        assert!(amount > 0, "amount must be positive");

        let admin: Address = env
            .storage()
            .instance()
            .get(&TokenDataKey::Admin)
            .unwrap_or_else(|| panic!("token not initialized"));

        admin.require_auth();

        let balance_key = TokenDataKey::Balance(to.clone());

        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&balance_key)
            .unwrap_or(0);

        let new_balance = current_balance
            .checked_add(amount)
            .unwrap_or_else(|| panic!("balance overflow"));

        let total_supply: i128 = env
            .storage()
            .instance()
            .get(&TokenDataKey::TotalSupply)
            .unwrap_or(0);

        let new_total_supply = total_supply
            .checked_add(amount)
            .unwrap_or_else(|| panic!("total supply overflow"));

        env.storage()
            .persistent()
            .set(&balance_key, &new_balance);

        env.storage()
            .instance()
            .set(
                &TokenDataKey::TotalSupply,
                &new_total_supply,
            );

        env.events().publish(
            (symbol_short!("token"), symbol_short!("mint")),
            (to, amount),
        );
    }

    /// Transfer tokens between two addresses.
    ///
    /// The sender must authorize the operation.
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) {
        assert!(amount > 0, "amount must be positive");

        from.require_auth();

        let from_key = TokenDataKey::Balance(from.clone());
        let to_key = TokenDataKey::Balance(to.clone());

        let from_balance: i128 = env
            .storage()
            .persistent()
            .get(&from_key)
            .unwrap_or(0);

        assert!(
            from_balance >= amount,
            "insufficient balance"
        );

        let to_balance: i128 = env
            .storage()
            .persistent()
            .get(&to_key)
            .unwrap_or(0);

        let new_from_balance = from_balance
            .checked_sub(amount)
            .unwrap_or_else(|| panic!("balance underflow"));

        let new_to_balance = to_balance
            .checked_add(amount)
            .unwrap_or_else(|| panic!("balance overflow"));

        env.storage()
            .persistent()
            .set(
                &from_key,
                &new_from_balance,
            );

        env.storage()
            .persistent()
            .set(
                &to_key,
                &new_to_balance,
            );

        env.events().publish(
            (symbol_short!("token"), symbol_short!("transfer")),
            (from, to, amount),
        );
    }

    /// Return the balance of an address.
    pub fn balance(
        env: Env,
        id: Address,
    ) -> i128 {
        env.storage()
            .persistent()
            .get(&TokenDataKey::Balance(id))
            .unwrap_or(0)
    }

    /// Return the total token supply.
    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&TokenDataKey::TotalSupply)
            .unwrap_or(0)
    }
}
