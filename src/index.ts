import * as anchor from "@coral-xyz/anchor";
import {
  AccountAddress,
  ChainAddress,
  ChainContext,
  Signer,
  UniversalAddress,
  Wormhole,
  contracts,
  signSendWait,
} from "@wormhole-foundation/sdk";
import {
  SolanaAddress,
  SolanaPlatform,
  getSolanaSignAndSendSigner,
} from "@wormhole-foundation/sdk-solana";
import * as fs from "fs";

import { IdlVersion, NTT, SolanaNtt } from "@wormhole-foundation/sdk-solana-ntt";

// TODO: Change to "Mainnet" for production
const NETWORK = "Testnet";

(async function () {
  // TODO: Replace with your wallet key file path
  const payerSecretKey = Uint8Array.from(
    JSON.parse(
      fs.readFileSync(`/path/to/your/wallet.json`, {
        encoding: "utf-8",
      })
    )
  );
  
  // TODO: Replace with your deployed contract addresses
  const NTT_MANAGER_ADDRESS = new anchor.web3.PublicKey("YOUR_NTT_MANAGER_ADDRESS");
  const NTT_TOKEN_ADDRESS = new anchor.web3.PublicKey("YOUR_TOKEN_ADDRESS");

  const payer = anchor.web3.Keypair.fromSecretKey(payerSecretKey);
  const CORE_BRIDGE_ADDRESS = contracts.coreBridge(NETWORK, "Solana");

  const w = new Wormhole(NETWORK, [SolanaPlatform], {
    chains: { Solana: { contracts: { coreBridge: CORE_BRIDGE_ADDRESS } } },
  });

  // TODO: Update RPC endpoint for production
  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  const ctx: ChainContext<typeof NETWORK, "Solana"> = w
    .getPlatform("Solana")
    .getChain("Solana", connection);

  let ntt: SolanaNtt<typeof NETWORK, "Solana">;
  let signer: Signer;
  let sender: AccountAddress<"Solana">;

  signer = await getSolanaSignAndSendSigner(connection, payer, {
    // debug: true,
  });
  sender = Wormhole.parseAddress("Solana", signer.address());

  const VERSION: IdlVersion = "2.0.0";
  const emitter = NTT.transceiverPdas(NTT_MANAGER_ADDRESS).emitterAccount();
  ntt = new SolanaNtt(
    NETWORK,
    "Solana",
    connection,
    {
      ...ctx.config.contracts,
      ntt: {
        token: NTT_TOKEN_ADDRESS.toBase58(),
        manager: NTT_MANAGER_ADDRESS.toBase58(),
        transceiver: {
          wormhole: emitter.toBase58(),
        },
      },
    },
    VERSION
  );

  const initTxs = ntt.initialize(sender, {
    mint: NTT_TOKEN_ADDRESS,
    outboundLimit: 100000000n,
    mode: "burning",
  });
  await signSendWait(ctx, initTxs, signer);

  const registerTxs = ntt.registerWormholeTransceiver({
    payer: new SolanaAddress(payer.publicKey),
    owner: new SolanaAddress(payer.publicKey),
  });
  await signSendWait(ctx, registerTxs, signer);

  // TODO: adjust manager & transceiver addresses of the peer
  const remoteMgr: ChainAddress = {
    chain: "BaseSepolia",
    address: new UniversalAddress("YOUR_REMOTE_MANAGER_ADDRESS"),
  };

  // Set manager peer
  const setPeerTxs = ntt.setPeer(remoteMgr, 18, 1000000n, sender);
  await signSendWait(ctx, setPeerTxs, signer);

  const remoteXcvr: ChainAddress = {
    chain: "BaseSepolia",
    address: new UniversalAddress("YOUR_REMOTE_TRANSCEIVER_ADDRESS"),
  };
  const setXcvrPeerTxs = ntt.setWormholeTransceiverPeer(
    remoteXcvr,
    sender
  );
  await signSendWait(ctx, setXcvrPeerTxs, signer);
})().catch((e) => console.error(e));
