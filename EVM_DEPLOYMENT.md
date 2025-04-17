# Native Token Transfers Deployment Guide

This guide explains how to deploy the native token transfers contracts across different chains.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Access to RPC endpoints for the target chains
- Private key for deployment (stored securely in environment variables)

## Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/wormhole-foundation/native-token-transfers.git
cd native-token-transfers
```

## Contract Deployment

### EVM Chains Deployment

To deploy the contracts on EVM chains, use the following forge script command:

```bash
forge script --via-ir script/DeployWormholeNtt.s.sol \
  --rpc-url $BASE_RPC_URL \
  --sig "run(address,address,address,address,uint8,uint8)" \
  <core-bridge-address> \
  <token-address> \
  <relayer-address> \
  <deployer-address> \
  <decimals> \
  <chain-id> \
  --broadcast \
  --private-key $FORGE_PKEY \
  -vvvv \
  --skip-simulation
```

#### Example Values

Here's an example with actual values:

```bash
forge script --via-ir script/DeployWormholeNtt.s.sol \
  --rpc-url $BASE_RPC_URL \
  --sig "run(address,address,address,address,uint8,uint8)" \
  0x79A1027a6A159502049F10906D333EC57E95F083 \
  <token-address> \
  0x617cdc0cBb84441741443AB3c299F703D0171fA5 \
  0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE \
  18 \
  1 \
  --broadcast \
  --private-key $FORGE_PKEY \
  -vvvv \
  --skip-simulation
```

#### Parameter Explanation

1. **Core Bridge Address**: The Wormhole core bridge contract address for the target chain. You can find these addresses in the [Wormhole SDK constants](https://github.com/wormhole-foundation/wormhole-sdk-ts/blob/ab661a7076962b406b29dbeb1479e104c24b0f29/core/base/src/constants/contracts/core.ts#L6).
   - Example: `0x79A1027a6A159502049F10906D333EC57E95F083`

2. **Token Address**: The address of the token you want to enable for transfers.
   - This needs to be specified by the user based on their token.

3. **Relayer Address**: The relayer contract address for the target chain. These addresses can be found in the [Wormhole relayer constants](https://github.com/wormhole-foundation/wormhole/blob/425b48bdea975185f1d24d432e4928dfc9f82fe4/sdk/js/src/relayer/consts.ts#L95).
   - Example: `0x617cdc0cBb84441741443AB3c299F703D0171fA5`

4. **Deployer Address**: The address that will be used to deploy the contracts. This should be based on the configuration in the [CLI source](https://github.com/wormhole-foundation/native-token-transfers/blob/3311787ab22087f5c10ab08edb6a2a5e3f7afd77/cli/src/index.ts#L1122).
   - Example: `0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE`

5. **Decimals**: The number of decimal places for the token (e.g., 18 for most ERC20 tokens).
   - Example: `18`

6. **Chain ID**: The unique identifier for the target chain.
   - Example: `1`

### Environment Variables

Before running the deployment script, ensure you have set the following environment variables:
- `BASE_RPC_URL`: The RPC endpoint for the target chain
- `FORGE_PKEY`: Your deployment private key

## Configuration Steps

After deploying the contracts, you need to configure them using the `WormholeNttConfig.json` file. This file contains all the necessary configuration parameters for both the Transceiver and NTT Manager contracts.

### Create WormholeNttConfig.json

Create a configuration file named `WormholeNttConfig.json` for the ConfigureWormholeNtt.s.sol script. Here's an example with two EVM chains:

```json
{
  "contracts": [
    {
      "chainId": 10004,
      "decimals": 18,
      "inboundLimit": 100000000000000000000,
      "isEvmChain": true,
      "isSpecialRelayingEnabled": false,
      "isWormholeRelayingEnabled": true,
      "nttManager": "0x0000000000000000000000003cfb62fe2f82a19ebde80c4755b6bf35506becd9",
      "wormholeTransceiver": "0x000000000000000000000000d0090658e43d38e81eb00cd53abd9ea4db0cfbf5"
    },
    {
      "chainId": 10005,
      "decimals": 18,
      "inboundLimit": 100000000000000000000,
      "isEvmChain": true,
      "isSpecialRelayingEnabled": false,
      "isWormholeRelayingEnabled": true,
      "nttManager": "0x000000000000000000000000930a98903de7e09e7f622f6d3a3831a8fbbdaa60",
      "wormholeTransceiver": "0x000000000000000000000000e6a6345709216a0aae984685148dc00b2cc6d1fe"
    }
  ]
}
```

Important notes about the configuration:
1. All addresses in the config must be prefixed with `0x000000000000000000000000`
2. The `chainId` should match the target chain's ID
3. `inboundLimit` should be specified in the token's smallest unit (wei for EVM chains)
4. `isSpecialRelayingEnabled` is only needed for Solana deployments
5. `isWormholeRelayingEnabled` should be set to `true` for all chains
6. `isEvmChain` should be set to `true` for EVM-based chains

The configuration file handles:
- Transceiver settings (`isEvmChain`, `isWormholeRelayingEnabled`, `isSpecialRelayingEnabled`)
- NTT Manager peer relationships (through the `nttManager` addresses in the config)
- Chain-specific parameters (decimals, inbound limits)

After creating this configuration file, you can run the ConfigureWormholeNtt.s.sol script to apply all the necessary configurations across the chains.

### Environment Setup

1. Set the Wormhole chain ID environment variable:
```bash
set -x RELEASE_WORMHOLE_CHAIN_ID 10004
```

## Foundry Configuration

1. Update your `foundry.toml` to allow access to the configuration file:
```toml
fs_permissions = [
  { access = "read", path = "./cfg" },
  { access = "read", path = "./test/payloads" }
]
```

## Running the Configuration Script

Run the ConfigureWormholeNtt script with:
```bash
forge script --via-ir script/ConfigureWormholeNtt.s.sol \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --private-key $FORGE_PKEY
```

Upon successful execution, you should see output similar to:
```
Wormhole relaying enabled for chain 10005
Wormhole peer set for chain 10005
EVM chain set for chain 10005
Peer set for chain 10005
```

## Verification

To verify the on-chain configuration for a specific NTT manager, use the ntt clone command:
```bash
ntt clone Testnet OptimismSepolia 0x930a98903de7e09E7F622F6d3a3831a8fBbDAa60
```

This will show you the current state of the NTT manager and its configuration on the chain.

## Common Issues

### Simulation Errors
If you encounter simulation errors during script execution, you can try one of these options:

1. Add the `--skip-simulation` flag to your forge command:
```bash
forge script --via-ir script/ConfigureWormholeNtt.s.sol \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --private-key $FORGE_PKEY \
  --skip-simulation
```

2. Or add the following to your `foundry.toml`:
```toml
evm_version = "cancun"
```

### Configuration Verification
If the ntt clone command shows unexpected values:
1. Double-check the addresses in your WormholeNttConfig.json
2. Verify that the chain IDs match your deployment
3. Ensure the inbound limits are correctly formatted
4. Check that all required flags are set to true/false as needed

### Deployment Issues
If the deployment script fails:
1. Verify your RPC endpoint is accessible
2. Check that your private key has sufficient funds
3. Ensure all addresses are valid for the target chain
4. Verify the chain ID matches your deployment target 