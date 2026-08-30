// Import the required Soroban SDK macros and types.
use soroban_sdk::{
    contract,
    contractimpl,
    contracttype,
    symbol_short,
    Address,
    Env,
};

// ============================================================
// TOKEN STORAGE KEYS
// ============================================================

// Defines the keys used to store token-related data.
#[contracttype]
pub enum TokenDataKey {
    // Stores the address authorized to mint tokens.
    Admin,

    // Stores the token balance for a specific address.
    Balance(Address),

    // Stores the total number of tokens currently in circulation.
    TotalSupply,
}

// ============================================================
// REWARD TOKEN CONTRACT
// ============================================================

// Main smart contract for the MediReward token.
#[contract]
pub struct MediRewardToken;

#[contractimpl]
impl MediRewardToken {
    // ============================================================
    // TOKEN INITIALIZATION
    // ============================================================

    /// Initialize the token contract.
    ///
    /// Initialization is allowed only once.
    /// The admin should normally be the MediChain contract address,
    /// so that only MediChain can mint rewards.
    pub fn initialize_token(env: Env, admin: Address) {
        // Prevent the token contract from being initialized more than once.
        assert!(
            !env.storage().instance().has(&TokenDataKey::Admin),
            "already initialized"
        );

        // Store the authorized admin/minter address.
        env.storage()
            .instance()
            .set(&TokenDataKey::Admin, &admin);

        // Initialize the total token supply to zero.
        env.storage()
            .instance()
            .set(&TokenDataKey::TotalSupply, &0i128);
    }

    // ============================================================
    // TOKEN MINTING
    // ============================================================

    /// Mint new tokens.
    ///
    /// Only the configured admin/minter can call this.
    /// The amount must be strictly positive.
    pub fn mint(
        env: Env,
        to: Address,
        amount: i128,
    ) {
        // Prevent zero or negative amounts from being minted.
        assert!(amount > 0, "amount must be positive");

        // Retrieve the configured admin/minter address.
        let admin: Address = env
            .storage()
            .instance()
            .get(&TokenDataKey::Admin)
            .unwrap_or_else(|| panic!("token not initialized"));

        // Require authorization from the configured admin.
        admin.require_auth();

        // Create the storage key for the recipient's balance.
        let balance_key = TokenDataKey::Balance(to.clone());

        // Retrieve the recipient's current balance.
        // If no balance exists, start from zero.
        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&balance_key)
            .unwrap_or(0);

        // Add the newly minted amount to the recipient's balance.
        // checked_add prevents integer overflow.
        let new_balance = current_balance
            .checked_add(amount)
            .unwrap_or_else(|| panic!("balance overflow"));

        // Retrieve the current total token supply.
        let total_supply: i128 = env
            .storage()
            .instance()
            .get(&TokenDataKey::TotalSupply)
            .unwrap_or(0);

        // Increase the total supply by the minted amount.
        // checked_add prevents integer overflow.
        let new_total_supply = total_supply
            .checked_add(amount)
            .unwrap_or_else(|| panic!("total supply overflow"));

        // Save the recipient's updated balance.
        env.storage()
            .persistent()
            .set(&balance_key, &new_balance);

        // Save the updated total token supply.
        env.storage()
            .instance()
            .set(
                &TokenDataKey::TotalSupply,
                &new_total_supply,
            );

        // Emit an event showing that new tokens were minted.
        env.events().publish(
            (symbol_short!("token"), symbol_short!("mint")),
            (to, amount),
        );
    }

    // ============================================================
    // TOKEN TRANSFER
    // ============================================================

    /// Transfer tokens between two addresses.
    ///
    /// The sender must authorize the operation.
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) {
        // Transfers must always contain a positive amount.
        assert!(amount > 0, "amount must be positive");

        // Require authorization from the sender.
        from.require_auth();

        // Create storage keys for the sender and recipient balances.
        let from_key = TokenDataKey::Balance(from.clone());
        let to_key = TokenDataKey::Balance(to.clone());

        // Retrieve the sender's current balance.
        // If no balance exists, treat it as zero.
        let from_balance: i128 = env
            .storage()
            .persistent()
            .get(&from_key)
            .unwrap_or(0);

        // Make sure the sender has enough tokens to complete the transfer.
        assert!(
            from_balance >= amount,
            "insufficient balance"
        );

        // Retrieve the recipient's current balance.
        // If no balance exists, start from zero.
        let to_balance: i128 = env
            .storage()
            .persistent()
            .get(&to_key)
            .unwrap_or(0);

        // Subtract the transferred amount from the sender.
        // checked_sub prevents integer underflow.
        let new_from_balance = from_balance
            .checked_sub(amount)
            .unwrap_or_else(|| panic!("balance underflow"));

        // Add the transferred amount to the recipient.
        // checked_add prevents integer overflow.
        let new_to_balance = to_balance
            .checked_add(amount)
            .unwrap_or_else(|| panic!("balance overflow"));

        // Store the sender's updated balance.
        env.storage()
            .persistent()
            .set(
                &from_key,
                &new_from_balance,
            );

        // Store the recipient's updated balance.
        env.storage()
            .persistent()
            .set(
                &to_key,
                &new_to_balance,
            );

        // Emit an event recording the token transfer.
        env.events().publish(
            (symbol_short!("token"), symbol_short!("transfer")),
            (from, to, amount),
        );
    }

    // ============================================================
    // BALANCE QUERY
    // ============================================================

    /// Return the balance of an address.
    pub fn balance(
        env: Env,
        id: Address,
    ) -> i128 {
        // Retrieve the balance associated with the address.
        // Return zero when the address has no stored balance.
        env.storage()
            .persistent()
            .get(&TokenDataKey::Balance(id))
            .unwrap_or(0)
    }

    // ============================================================
    // TOTAL SUPPLY QUERY
    // ============================================================

    /// Return the total token supply.
    pub fn total_supply(env: Env) -> i128 {
        // Retrieve the total number of tokens currently minted.
        // Return zero if the supply has not been initialized.
        env.storage()
            .instance()
            .get(&TokenDataKey::TotalSupply)
            .unwrap_or(0)
    }
}
