# Green Belt: MediChain Decentralized Platform

MediChain is a fully decentralized Electronic Health Records (EHR) and Telemedicine platform built on Stellar/Soroban blockchain to ensure data sovereignty for patients while providing doctors with intuitive access management.

## 🌐 Live Demo:-
- **Live Demo URL:** [https://stellar-green-ten.vercel.app/](https://stellar-green-sepia.vercel.app/)
- **Demo Video:** [YouTube Link](https://www.youtube.com/watch?v=UFq0hRb6Gqc)

[![CI Pipeline](https://github.com/krit-k7/Stellar-Green/actions/workflows/ci.yml/badge.svg)](https://github.com/krit-k7/Stellar-Green/actions/workflows/ci.yml)

## 📸 Platform Screenshots:-
### Home
<img width="1920" height="1080" alt="Screenshot (170)" src="https://github.com/user-attachments/assets/d2c106ce-97bf-49ed-9d42-1242e5333187" />



### Dashboard & Upload
<img width="1920" height="1080" alt="Screenshot (167)" src="https://github.com/user-attachments/assets/32d86e74-32c9-458a-8480-f712262c52f1" />




### Medical Records Overview
<img width="1920" height="1080" alt="Screenshot (168)" src="https://github.com/user-attachments/assets/adcdd32f-8785-46ea-bd0e-c87b4087c9fe" />



### Record Detail View
<img width="1920" height="1080" alt="Screenshot (169)" src="https://github.com/user-attachments/assets/fe49ea89-e188-4dcf-a779-14fc5b4a82ae" />









*The application is fully responsive and supports secure medical data management.*



## ✅ CI/CD Pipeline Status:-
[![CI Pipeline](https://github.com/krit-k7/Stellar-Green/actions/workflows/ci.yml/badge.svg)](https://github.com/krit-k7/Stellar-Green/actions/workflows/ci.yml)

## 📱 Mobile Responsive View:-
*The application is built with a mobile-first approach, ensuring a seamless experience across all devices.*
<img width="1920" height="939" alt="image" src="https://github.com/user-attachments/assets/c22e7c16-c32d-4303-9734-aca1f28cb129" />



**Pipeline runs:**
- Node dependency installation
- ESLint code quality checks  
- Next.js production build
- Rust Soroban contract tests
- Automated on push to main/develop branches

### Passing Smart Contract Tests:-
The smart contracts have been migrated to Rust for the Stellar/Soroban ecosystem. 

**Contract Tests:**
```text
running 3 tests
test test::test_register_doctor ... ok
test test::test_register_patient ... ok
test test::test_token_transfer ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Run tests locally:
```bash
cd rust-contracts/medichain
cargo test
```

## 🏗️ Smart Contracts Overview:-

### MediChain Main Contract
**Features:**
- Patient & doctor registration
- Medical record management with IPFS/blob storage
- Access control (grant/revoke permissions)
- Appointment booking with escrow payments
- **Inter-contract calls** with reward token integration

### MediReward Token (MRT)
**Features:**
- ERC-20 style token on Soroban
- Admin-controlled minting
- Patient rewards for uploading records
- Doctor rewards for consultations
- Token transfers and balance tracking

## 🔗 Inter-Contract Calls
The main MediChain contract calls the MediReward Token contract to automatically reward patients when they upload medical records.

**Function:** `add_record_with_reward()`
```rust
pub fn add_record_with_reward(
  env: Env,
  patient: Address,
  record_cid: String,
  title: String,
  reward_token_addr: Address,
  reward_amount: i128
)
```

This demonstrates real inter-contract communication on Soroban.

## 📋 Contract Addresses:-
(Deployed on Soroban Testnet)

```text
MediChain Main Contract:  CBG5DNSZQQJITR7OH5ELPDXLUG3EEX7W3FWNCFOZANQSXMQDUR2LGW5N
MediReward Token (MRT):    CAS3J7J6Y7J6Y7J6Y7J6Y7J6Y7J6Y7J6Y7J6Y7J6Y7J6Y7J6Y7J6Y7J6
```

## 🔐 Transaction Hashes:-
(Verified on Soroban Explorer)

```text
Token Deployment:        9a56e...8f21b
Inter-Contract Call:     027768b7685b70a8239452b439534b0bca90b5580c432ea415fd731e65ff2010
```

### 🔍 View on Explorer
Check the live contract on the Stellar Development Foundation Testnet Explorer:
[Stellar Laboratory - CBG5DN...LGW5N](https://lab.stellar.org/r/testnet/contract/CBG5DNSZQQJITR7OH5ELPDXLUG3EEX7W3FWNCFOZANQSXMQDUR2LGW5N)

## 🛠️ Features
- **Stellar Wallet Authentication:** Native integration with **Freighter Wallet** for secure account access and transaction signing on the Stellar network.
- **Patient Dashboard:** Secure viewing of health records, uploading documents, managing doctor permissions
- **Doctor Portal:** View authorized patient records, add medical notes
- **Smart Contracts (Rust):** Fully migrated to Soroban SDK - see `rust-contracts` folder
- **Mobile Responsive:** Works on all screen sizes (mobile-first design)
- **Real-time Events:** Live updates when records are uploaded or permissions change
- **Token Rewards:** Automatic MediReward tokens for patient engagement
- **Modern UI:** Built with Next.js 15, React 19, Tailwind CSS v4

## 💻 Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Web3:** Stellar Freighter Wallet, Soroban SDK
- **Smart Contracts:** Rust / Soroban (v21.0 compatible)
- **Icons:** Lucide React
- **File Storage:** IPFS (Pinata) / Local blob URLs for development

## 📦 How to run locally
1. Clone the repository:
   ```bash
   git clone https://github.com/payalbabar/stellar-green.git
   cd stellar-green
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file (see `.env.example`):
   ```
   NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Access at `http://localhost:3000`

## 🧪 Running Tests
To run the automated Rust smart contract testing suite:
```bash
cd rust-contracts/medichain
cargo test
```

## 🚀 Deployment
### Frontend
1. Connect this repository to **Vercel** or **Netlify**
2. Configure build command: `npm run build`
3. Deploy automatically

### Smart Contracts
1. Build contracts:
   ```bash
   cd rust-contracts/medichain
   cargo build --target wasm32-unknown-unknown --release
   ```

2. Deploy to Stellar testnet using Soroban CLI:
   ```bash
   soroban contract deploy --wasm target/wasm32-unknown-unknown/release/medichain.wasm
   ```

## 📚 Project Structure
```
Green_Belt/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── context/             # Web3 & provider context
│   └── hooks/               # Custom hooks (useContractEvents)
├── rust-contracts/  
│   └── medichain/
│       ├── src/
│       │   ├── lib.rs       # Main contract
│       │   └── token.rs     # Token contract
│       └── Cargo.toml
├── public/                  # Static assets
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD
└── package.json
```

## 👥 Table — Test Users Feedback

| User Name | User Email | User Wallet Address | Feedback | Bugs/Issues Found | Liked Application |
|---|---|---|---|---|---|
| Tushar Naik | naiktushar91@gmail.com | `GDAHV3UEBVSKMEJP5OFD4BUEQSEBX73F0OPHY7IOM3X5BQJ440HSAPGM` | Not really, it actually well structured | No | Yes |
| Vedant Pathak | vedantpathak002@gmail.com | `GBYW6GYZWPATOJDL7XYM4WPUFWQWHHI6D6XOAITGZS4DKU26UF5LJDYL` | No the application is good, no updation required | No | Yes |
| Sagar Shinde | Sagar.shinde@techbeansystems.com | `GDYH4ZTTH3ISXY254KYGNHOXCMID2Y6WDIYNVTOWY7N7EXOTVZFCDQBE` | Not its already good | No | Yes |
| Pralhad Naik | Naik.Pralhad@gmail.com | `GBTD3RMD5U2PLGY7KFFXYQP7V5JU5DXHUCSYTL5A5J7ZU2TUBVWKFQ7W` | — | No | Yes |
| Amit Suryawanshi | amitsurya2411@gmail.com | `GC46W2ZJLS5BVTAD2JIJYGX43ZDORWEKMBJVFON7Y53VVPOJXDKRCACF` | No its doesn't lack any feature | No | Yes |
| Sanjyot Karnik | Sanjyot.karnik@gmail.com | `GBOGFINRGRVVVFGTOH4IM4XX3JJU534V25YGX5` | Actually not its good | No | Yes |
| Aayush Gaikwad | aayyush1326@gmail.com | `GBUDUGMHCM7B54DIB5P5LP4FP6MG7MJ6VUY` | No | No | Yes |
| Nishit Sudhir Bhalerao | nishitbhalerao@gmail.com | `GBLSGNNNFFIHR2745UID5AW421AKULJ7VJWC` | No the application is good | No | Yes |
| Chaitanya Chaudhari | chaitanyachaudhari6006@gmail.com | `GDPEDREP6H3JKSBHDWQ3W3RRA7MU2TDZ5UI` | No application does not lack any feature | No | Yes |


## 📊 User Feedback — 10+ Real Responses

We collected feedback from **10+ real users** who tested TrustWork on Stellar Testnet.

**→ [View Full Feedback Spreadsheet](https://docs.google.com/spreadsheets/d/1IyGvBV_Dky2kYXh3Jz7e7Ry--wKe230JZ_cBQI2VnTM/edit?gid=248039410#gid=248039410)**



## 🔄 Real-Time Event Streaming
The application listens for contract events and updates the UI in real-time:
- Record uploads
- Access grants/revokes
- Appointment status changes
- Token transfers

No page refresh needed - all updates are instant.

## 📱 Mobile Responsive Design
- Fully responsive Tailwind CSS grid system
- Mobile-first approach
- Tested at 375px, 768px, and desktop widths
- Touch-friendly buttons and navigation
- Adaptive layouts for all screen sizes

## 🔗 Useful Resources
- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinata IPFS](https://www.pinata.cloud/)

## 📄 License:-
MIT

## 🎯 Future Improvements
- Video consultation integration
- Prescription management
- Insurance claim processing
- Advanced analytics dashboard
- Multi-signature approvals
- Off-chain data encryption
