// V1ta Protocol Knowledge Base for AI Search

export const V1TA_KNOWLEDGE_BASE = `
# V1ta Protocol Knowledge Base

## Overview
V1ta is a Solana-native, fully on-chain stablecoin protocol. It allows users to mint VUSD (V1ta USD) stablecoin through collateralized debt positions (CDPs).

## Core Concept
- **Type**: Decentralized stablecoin protocol
- **Blockchain**: Solana
- **Stablecoin**: VUSD (pegged to $1 USD)
- **Mechanism**: Collateralized Debt Positions (CDPs)
- **Philosophy**: "Money without masters" - Pure collateral, pure code, pure Solana

## Key Features

### 1. Capital Efficiency
- **Minimum Collateral Ratio**: 110%
- Significantly more efficient than competitors (150-200% ratios)
- **Example**: Lock $1,000 SOL → Borrow ~$909 VUSD
- **Efficiency**: 1.8x more capital efficient than legacy systems

### 2. Zero Interest Borrowing
- **Borrow Fee**: 0.5% (one-time)
- **Interest Rate**: 0% (zero recurring fees)
- No ongoing interest payments on borrowed VUSD

### 3. Instant Redemption
- Anyone can redeem VUSD for equivalent collateral value at any time
- Creates natural arbitrage incentives to maintain $1 peg
- On-chain redemption mechanism ensures price stability
- **Liquidation Penalty**: 5%

### 4. Speed & Performance
- Sub-second transaction finality
- Minimal fees on Solana network
- Real-time price updates from dual oracles

## Supported Collateral
1. **SOL** - Native Solana token
2. **jitoSOL** - Jito liquid staking token
3. **mSOL** - Marinade liquid staking token

## Technical Architecture

### Oracles
- **Dual Oracle System**: Pyth Network + Switchboard
- **Staleness Detection**: 60-second threshold
- **LST Valuation**: Uses actual stake rates from smart contracts
- Protects positions during market volatility

### Stability Mechanism
- **Stability Pool**: Users deposit VUSD to absorb liquidated debt
- **Incentive**: Earn liquidation penalties and collateral gains
- **Formula**: ∆VUSD → ∆Collateral

### Liquidations
- **Trigger**: When collateral ratio falls below 110%
- **Process**: Stability Pool absorbs debt, claims collateral
- **Protection**: Dual oracle system prevents false liquidations

## Protocol Parameters
- **Min Collateral Ratio**: 110%
- **Borrow Fee**: 0.5%
- **Liquidation Penalty**: 5%
- **Interest Rate**: 0%
- **Network**: Solana (Devnet for testing)

## User Features

### Borrow
- Deposit SOL/jitoSOL/mSOL as collateral
- Mint VUSD against collateral (up to 110% ratio)
- Pay one-time 0.5% borrow fee
- No recurring interest

### Redeem
- Exchange VUSD for underlying collateral
- Instant on-chain redemption
- Helps maintain $1 peg through arbitrage

### Stability Pool
- Deposit VUSD to support protocol stability
- Earn from liquidations
- Absorb liquidated debt positions

### Positions Management
- View your active borrows
- Monitor collateral ratio
- Add/remove collateral
- Repay debt

## Ecosystem Integration
- **marginfi**: Flash liquidity integration
- **Drift Protocol**: VUSD as collateral for derivatives trading

## Comparisons

### vs USDC/USDT
- **V1ta**: Decentralized, crypto-backed
- **USDC/USDT**: Centralized, USD-backed, bank dependencies

### vs MakerDAO
- **V1ta**: No governance token, fully on-chain
- **MakerDAO**: Governance-dependent, slower finality

### vs Traditional Lending
- **V1ta**: 110% collateral ratio, 0% interest
- **Traditional**: 150-200% ratios, ongoing interest

## Navigation & Pages

### Main Pages
- **/ (Home/Borrow)**: Main borrowing interface
- **/positions**: View and manage your positions
- **/stability**: Stability pool interface
- **/redeem**: Redeem VUSD for collateral
- **/liquidations**: View liquidation opportunities
- **/portfolio**: Portfolio overview
- **/analytics**: Protocol analytics and stats
- **/history**: Transaction history

### Key Actions
1. **Connect Wallet**: Click "Connect Wallet" button (top right)
2. **Borrow VUSD**: Go to home page, deposit collateral, specify amount
3. **Manage Position**: Navigate to /positions
4. **Join Stability Pool**: Go to /stability, deposit VUSD
5. **Redeem**: Go to /redeem, exchange VUSD for collateral

## Documentation
- **Docs URL**: https://docs.v1ta.xyz
- **GitHub**: https://github.com/v1ta-labs
- **Community**: https://t.me/v1ta_fi
- **Twitter**: https://x.com/v1ta_fi

## Technical Details

### Smart Contracts
- Fully audited on Solana
- Pure on-chain execution
- No upgradeability (immutable after deployment)

### Formulas
1. **Collateralization Ratio**: CR = Collateral Value / Debt Value
2. **Max Borrow**: Max VUSD = (Collateral Value) / 1.10
3. **Liquidation Price**: Price where CR < 110%
4. **Redemption Price**: Based on Total Collateral Ratio (TCR)

### Risk Parameters
- **Health Factor**: Collateral Ratio / 110%
- **Safe Zone**: CR > 150%
- **Warning Zone**: CR between 110-150%
- **Liquidation Zone**: CR < 110%

## Common Questions

**Q: What is VUSD?**
A: VUSD is V1ta's decentralized stablecoin, pegged to $1 USD, backed by crypto collateral.

**Q: How do I borrow VUSD?**
A: Connect wallet, deposit SOL/jitoSOL/mSOL, and mint VUSD at 110% collateral ratio.

**Q: What happens if my collateral ratio drops below 110%?**
A: Your position becomes eligible for liquidation. The stability pool will absorb your debt.

**Q: Is there interest on borrowed VUSD?**
A: No! Only a one-time 0.5% borrow fee. Zero recurring interest.

**Q: How is the $1 peg maintained?**
A: Through instant on-chain redemptions that create arbitrage opportunities.

**Q: What wallets are supported?**
A: All Solana wallets (Phantom, Backpack, Solflare, etc.) via WalletConnect.

**Q: Is V1ta audited?**
A: Yes, smart contracts are audited. Protocol is currently in devnet testing phase.

**Q: What is the Stability Pool?**
A: A pool of VUSD deposits that absorbs liquidated debt and earns liquidation rewards.

## Status
- **Current Phase**: Devnet Testing
- **Production**: Not yet launched (coming soon)
- **Version**: v0
`;

export const SEARCH_SYSTEM_PROMPT = `You are an AI assistant for V1ta Protocol, a decentralized stablecoin platform on Solana.

Your role is to help users by:
1. Answering questions about V1ta protocol, VUSD, borrowing, liquidations, etc.
2. Helping users navigate the app (tell them which page to go to)
3. Explaining how features work
4. Providing quick access to relevant information

Guidelines:
- Be concise and helpful
- Use the knowledge base to answer accurately
- When directing users to pages, use the exact URLs (/, /positions, /stability, etc.)
- Format responses in markdown
- Include relevant formulas when discussing technical aspects
- Always be accurate - if you don't know something, say so

Knowledge Base:
${V1TA_KNOWLEDGE_BASE}
`;
