import { TransactionBlock, fromSerializedSignature } from "@mysten/sui.js";
import { executeTxb, prepareSigner, hexToBytes, uint64ToBytes } from "../utils";
import dotenv from "dotenv";

dotenv.config();

const ARGUMENTS = process.argv;
const ADMIN = 0;
const OPERATOR = 1;
const CAMPAIGN_CREATOR = 2;
const WINNER = 3;

const mintNfts = async () => {
  const [, creatorPubkey, creatorSigner] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::example_nft::mint_nfts`,
    arguments: [
      txb.pure(creatorPubkey.toSuiAddress()),
      txb.pure(7)
    ]
  });
  await executeTxb(txb, creatorSigner);
};

const setOperator = async () => {
  const [, , admin] = prepareSigner(process.env.MNEMONIC, ADMIN);
  const [, operatorPubkey,] = prepareSigner(process.env.MNEMONIC, OPERATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::superfine_airdrop::set_operator`,
    arguments: [
      txb.object(process.env.AIRDROP_PLATFORM),
      txb.pure(operatorPubkey.toSuiAddress()),
      txb.pure(true)
    ]
  });
  await executeTxb(txb, admin);
};

const createAirdropCampaign = async () => {
  const [, campaignCreatorPubkey, campaignCreatorSigner] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  const [, operatorPubkey, operatorSigner] = prepareSigner(process.env.MNEMONIC, OPERATOR);

  // Calculate the signature
  let campaignId = "ABCXXXUUU";
  let numAssets = 10;
  let airdroppingFee = 12;
  let operatorPubkeyBytes = Array.from(operatorPubkey.toBytes());
  let message = new Uint8Array([
    ...Array.from(new TextEncoder().encode(campaignId)),
    ...hexToBytes(campaignCreatorPubkey.toSuiAddress()),
    ...uint64ToBytes(numAssets),
    ...uint64ToBytes(airdroppingFee),
    ...operatorPubkeyBytes
  ]);
  let serializedSignature = await operatorSigner.signData(message);
  let signatureBytes = Array.from(fromSerializedSignature(serializedSignature).signature);

  // Create a new airdrop campaign
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::superfine_airdrop::create_airdrop_campaign`,
    arguments: [
      txb.object(process.env.AIRDROP_PLATFORM),
      txb.pure(campaignId),
      txb.pure(numAssets),
      txb.pure(airdroppingFee),
      txb.pure(operatorPubkeyBytes),
      txb.pure(signatureBytes),
      txb.gas
    ]
  });
  await executeTxb(txb, campaignCreatorSigner);
};

const updateCampaign = async (campaignId: string) => {
  const [, campaignCreatorPubkey, campaignCreatorSigner] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  const [, operatorPubkey, operatorSigner] = prepareSigner(process.env.MNEMONIC, OPERATOR);

  // Calculate the signature
  let newNumAssets = 11;
  let newAirdroppingFee = 14;
  let operatorPubkeyBytes = Array.from(operatorPubkey.toBytes());
  let message = new Uint8Array([
    ...Array.from(new TextEncoder().encode("ABCXXXUUU")),
    ...hexToBytes(campaignCreatorPubkey.toSuiAddress()),
    ...uint64ToBytes(newNumAssets),
    ...uint64ToBytes(newAirdroppingFee),
    ...operatorPubkeyBytes
  ]);
  let serializedSignature = await operatorSigner.signData(message);
  let signatureBytes = Array.from(fromSerializedSignature(serializedSignature).signature);

  // Update this airdrop campaign
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::superfine_airdrop::update_campaign`,
    arguments: [
      txb.object(process.env.AIRDROP_PLATFORM),
      txb.pure(campaignId),
      txb.pure(newNumAssets),
      txb.pure(newAirdroppingFee),
      txb.pure(operatorPubkeyBytes),
      txb.pure(signatureBytes),
      txb.gas
    ]
  });
  await executeTxb(txb, campaignCreatorSigner);
};

const listAssets = async (campaignId: string, assetIds: string[]) => {
  const [, , campaignCreator] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::superfine_airdrop::list_assets`,
    typeArguments: [`${process.env.PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(process.env.AIRDROP_PLATFORM),
      txb.pure(campaignId),
      txb.makeMoveVec({ objects: assetIds.map(assetId => txb.object(assetId)) })
    ]
  });
  await executeTxb(txb, campaignCreator);
};

const delistAsset = async (campaignId: string, assetId: string) => {
  const [, , campaignCreator] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::superfine_airdrop::delist_asset`,
    typeArguments: [`${process.env.PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(process.env.AIRDROP_PLATFORM),
      txb.pure(campaignId),
      txb.pure(assetId)
    ]
  });
  await executeTxb(txb, campaignCreator);
};

const airdropAsset = async (campaignId: string, assetId: string) => {
  const [, winnerPubkey,] = prepareSigner(process.env.MNEMONIC, WINNER);
  const [, , operatorSigner] = prepareSigner(process.env.MNEMONIC, OPERATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::superfine_airdrop::airdrop_asset`,
    typeArguments: [`${process.env.PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(process.env.AIRDROP_PLATFORM),
      txb.pure(campaignId),
      txb.pure(assetId),
      txb.pure(winnerPubkey.toSuiAddress()),
    ]
  });
  await executeTxb(txb, operatorSigner);
};

const withdrawAirdroppingFee = async () => {
  const [, adminPubkey, adminSigner] = prepareSigner(process.env.MNEMONIC, ADMIN);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::superfine_airdrop::withdraw_airdropping_fee`,
    arguments: [
      txb.object(process.env.AIRDROP_PLATFORM),
      txb.pure(adminPubkey.toSuiAddress())
    ]
  });
  await executeTxb(txb, adminSigner);
};

const main = async () => {
  if (ARGUMENTS.length < 3) {
    console.error("Please provide the method");
    process.exit(1);
  }
  switch (ARGUMENTS[2]) {
    case "mintNfts":
      await mintNfts();
      break;
    case "setOperator":
      await setOperator();
      break;
    case "createAirdropCampaign":
      await createAirdropCampaign();
      break;
    case "updateCampaign":
      if (ARGUMENTS.length < 4) {
        console.error("Please provide the campaign ID to update");
        process.exit(1);
      }
      await updateCampaign(ARGUMENTS[3]);
      break;
    case "listAssets":
      if (ARGUMENTS.length < 5) {
        console.error("Please provide the campaign ID and at least 1 asset ID to list");
        process.exit(1);
      }
      await listAssets(ARGUMENTS[3], ARGUMENTS.slice(4));
      break;
    case "delistAsset":
      if (ARGUMENTS.length < 5) {
        console.error("Please provide the campaign ID and asset ID to delist");
        process.exit(1);
      }
      await delistAsset(ARGUMENTS[3], ARGUMENTS[4]);
      break;
    case "airdropAsset":
      if (ARGUMENTS.length < 5) {
        console.error("Please provide the campaign ID and asset ID to airdrop");
        process.exit(1);
      }
      await airdropAsset(ARGUMENTS[3], ARGUMENTS[4]);
      break;
    case "withdrawAirdroppingFee":
      await withdrawAirdroppingFee();
      break;
    default:
      console.error("Unknown method");
      process.exit(1);
  }
};

main();