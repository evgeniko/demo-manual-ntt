# Wormhole Native Token Transfer Example

This example demonstrates how to initialize and configure Native Token Transfers (NTT) using the Wormhole SDK.

## Prerequisites

- Node.js (v16 or later)
- Solana CLI tools
- Access to Solana RPC endpoint
- Solana wallet with sufficient funds
- Anchor (v0.29.0)

## Configuration

Before running the example, you need to adjust several configuration parameters in `src/index.ts`:

1. **Environment**: Change the environment from "Testnet" to "Mainnet" by modifying the `NETWORK` constant:
```typescript
const NETWORK = "Mainnet"; // or "Testnet"
```

2. **Payer Key**: Update the path to your Solana wallet key file:
```typescript
const payerSecretKey = Uint8Array.from(
  JSON.parse(
    fs.readFileSync(`/path/to/your/wallet.json`, {
      encoding: "utf-8",
    })
  )
);
```

3. **Contract Addresses**: Update the following addresses with your deployed contracts:
```typescript
const NTT_MANAGER_ADDRESS = new anchor.web3.PublicKey("your-ntt-manager-address");
const NTT_TOKEN_ADDRESS = new anchor.web3.PublicKey("your-token-address");
```

4. **RPC Connection**: Update the Solana RPC endpoint if needed:
```typescript
const connection = new anchor.web3.Connection(
  "https://api.mainnet-beta.solana.com", // or your preferred RPC endpoint
  "confirmed"
);
```

5. **Peer Configuration**: Update the manager and transceiver addresses:
```typescript
const remoteMgr: ChainAddress = {
  chain: "BaseSepolia",
  address: new UniversalAddress("your-ntt-manager-address"),
};

const remoteXcvr: ChainAddress = {
  chain: "BaseSepolia",
  address: new UniversalAddress("your-ntt-transceiver-address"),
};
```

## Running the Example

1. Install dependencies:
```bash
npm install
```

2. Run the example:
```bash
npm start
```

## What the Script Does

The script performs the following operations:
1. Initializes the NTT manager with specified parameters
2. Registers the Wormhole transceiver
3. Sets up peer relationships between NTT managers on different chains
4. Configures the transceiver settings

## Important Notes

- Make sure your Solana wallet has sufficient funds for transaction fees
- The script uses the Solana devnet by default. Change the RPC endpoint for mainnet
- All addresses should be valid Solana public keys
- The remote chain addresses should match your deployed contracts on the target chain

## Troubleshooting

If you encounter any issues:
1. Verify your RPC endpoint is accessible
2. Check that your wallet has sufficient funds
3. Ensure all contract addresses are correct
4. Verify the remote chain configuration matches your deployment 