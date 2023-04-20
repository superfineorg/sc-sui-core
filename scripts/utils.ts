import {
  Ed25519Keypair,
  Ed25519PublicKey,
  JsonRpcProvider,
  RawSigner,
  SignerWithProvider,
  TransactionBlock,
  testnetConnection
} from "@mysten/sui.js";

export type SuiObject = {
  type: string,
  id: string,
  owner: {
    AddressOwner: string;
  } | {
    ObjectOwner: string;
  } | {
    Shared: {
      initial_shared_version: number;
    };
  } | "Immutable" | undefined;
};

export type SuiPackage = {
  packageObjectId: string;
  createdObjects: SuiObject[];
};

export const prepareSigner = (mnemonic: string, addressIndex: number = 0): [
  JsonRpcProvider,
  Ed25519PublicKey,
  RawSigner
] => {
  const keypair = Ed25519Keypair.deriveKeypair(mnemonic, `m/44'/784'/0'/0'/${addressIndex}'`);
  const provider = new JsonRpcProvider(testnetConnection);
  return [
    provider,
    keypair.getPublicKey(),
    new RawSigner(keypair, provider)
  ];
};

export const executeTxb = async (txb: TransactionBlock, signer: SignerWithProvider) => {
  try {
    let gas = await signer.getGasCostEstimation({ transactionBlock: txb });
    txb.setGasBudget(gas);
    const txResponse = await signer.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      options: { showEffects: true, showEvents: true },
      requestType: "WaitForEffectsCert"
    });
    if (txResponse.effects?.status?.status === "failure") {
      console.log("ERROR", txResponse);
      return;
    }
    console.log("RESPONSE", txResponse);
    txResponse.events.forEach(event => console.log("# EVENT", event.parsedJson));
  } catch (err) {
    console.log("ERR", err);
  }
};

export const hexToBytes = (hexString: string): number[] => {
  return Array.from(Buffer.from(hexString.replace("0x", ""), "hex"));
};

export const uint64ToBytes = (value: number): number[] => {
  let result: number[] = [];
  for (let i = 0; i < 8; i++) {
    result.push(value - ((value >> 8) << 8));
    value >>= 8;
  }
  return result.reverse();
};