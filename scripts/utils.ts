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

// const getObjectsInfo = (provider, objectIds) =>
//   provider.getObjectBatch(objectIds).then((info) => {
//     return info.map((el) => {
//       if (el) {
//         return {
//           owner: el.details.owner.AddressOwner,
//           data: el.details.data.fields,
//           type: el.details.data.type,
//         };
//       }
//     });
//   });

// export const processTxResults = async (txResults, provider) => {
//   if (txResults.EffectsCert.effects.effects.created) {
//     const created = txResults.EffectsCert.effects.effects.created.map((item) => item.reference.objectId);
//     await wait(2000);
//     const createdInfo = await provider.getObjectBatch(created);
//     let packageObjectId = false;
//     let createdObjects = [];

//     createdInfo.forEach((item) => {
//       if (item.details.data?.dataType === "package") {
//         packageObjectId = item.details.reference.objectId;
//       } else {
//         createdObjects.push({ type: item.details.data?.type, objectId: item.details.reference?.objectId, owner: item.details.owner.AddressOwner || item.details.owner.ObjectOwner });
//       }
//     });
//     return [packageObjectId, createdObjects];
//   }
//   return [null, null];
// };

// export const getItemByType = (collectionObjects: SuiObject[], type: string) => {
//   return collectionObjects.find(object => object.type.includes(type))?.id;
// };


// export const wait = (timeout) => new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve();
//   }, timeout);
// });

// export const getUserCoins = async (provider, objects, price) => {
//   const items = [];
//   objects.forEach((item) => {
//     if (item.type == "0x2::coin::Coin<0x2::sui::SUI>") {
//       items.push(item.objectId);
//     }
//   });
//   const suiObjects = await getObjectsInfo(provider, items);
//   let diff = Number.MAX_VALUE;
//   let bestIndex = 0;
//   suiObjects.forEach((suiCoin, index) => {
//     const thisDiff = parseInt(suiCoin.data.balance) - price;
//     if (thisDiff >= 0 && diff >= 0 && thisDiff < diff) {
//       diff = thisDiff;
//       bestIndex = index;
//     }
//   });
//   return suiObjects[bestIndex];
// };

// const getAllCoins = async (provider, objects, price) => {
//   const items = [];
//   objects.forEach((item) => {
//     if (item.type == "0x2::coin::Coin<0x2::sui::SUI>") {
//       items.push(item.objectId);
//     }
//   });
//   const suiObjects = await getObjectsInfo(provider, items);
//   return suiObjects;
// };

// module.exports = { getAllCoins, getObjectsInfo, getUserCoins, processTxResults, getItemByType, wait };