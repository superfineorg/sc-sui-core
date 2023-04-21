import { TransactionBlock, fromSerializedSignature } from "@mysten/sui.js";
import { executeTxb, prepareSigner, hexToBytes } from "../utils";
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
      txb.pure(10)
    ]
  });
  await executeTxb(txb, creatorSigner);
};

const setOperator = async () => {
  const [, , admin] = prepareSigner(process.env.MNEMONIC, ADMIN);
  const [, operatorPubkey,] = prepareSigner(process.env.MNEMONIC, OPERATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::superfine_claim::set_operator`,
    arguments: [
      txb.object(process.env.CLAIMING_PLATFORM),
      txb.pure(operatorPubkey.toSuiAddress()),
      txb.pure(true)
    ]
  });
  await executeTxb(txb, admin);
};

const listAssets = async (assetIds: string[]) => {
  const [, , campaignCreator] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::superfine_claim::list_assets`,
    typeArguments: [`${process.env.PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(process.env.CLAIMING_PLATFORM),
      txb.makeMoveVec({ objects: assetIds.map(assetId => txb.object(assetId)) })
    ]
  });
  await executeTxb(txb, campaignCreator);
};

const delistAsset = async (listingId: string) => {
  const [, , campaignCreator] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::superfine_claim::delist_asset`,
    typeArguments: [`${process.env.PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(process.env.CLAIMING_PLATFORM),
      txb.pure(listingId)
    ]
  });
  await executeTxb(txb, campaignCreator);
};

const claimAsset = async (listingId: string) => {
  const [, winnerPubkey, winner] = prepareSigner(process.env.MNEMONIC, WINNER);
  const [, campaignCreatorPubkey,] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  const [, operatorPubkey, operatorSigner] = prepareSigner(process.env.MNEMONIC, OPERATOR);

  // Calculate the signature
  let campaignId = "ABCXYZZZZ";
  let operatorPubkeyBytes = Array.from(operatorPubkey.toBytes());
  let message = new Uint8Array([
    ...Array.from(new TextEncoder().encode(campaignId)),
    ...hexToBytes(campaignCreatorPubkey.toSuiAddress()),
    ...hexToBytes(winnerPubkey.toSuiAddress()),
    ...hexToBytes(listingId),
    ...operatorPubkeyBytes
  ]);
  let serializedSignature = await operatorSigner.signData(message);
  let signatureBytes = Array.from(fromSerializedSignature(serializedSignature).signature);

  // Claim this asset
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${process.env.PACKAGE}::superfine_claim::claim_asset`,
    typeArguments: [`${process.env.PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(process.env.CLAIMING_PLATFORM),
      txb.pure(campaignId),
      txb.pure(campaignCreatorPubkey.toSuiAddress()),
      txb.pure(listingId),
      txb.pure(operatorPubkeyBytes),
      txb.pure(signatureBytes)
    ]
  });
  await executeTxb(txb, winner);
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
    case "listAssets":
      if (ARGUMENTS.length < 4) {
        console.error("Please provide at least 1 asset ID to list");
        process.exit(1);
      }
      await listAssets(ARGUMENTS.slice(3));
      break;
    case "delistAsset":
      if (ARGUMENTS.length < 4) {
        console.error("Please provide the listing ID to delist");
        process.exit(1);
      }
      await delistAsset(ARGUMENTS[3]);
      break;
    case "claimAsset":
      if (ARGUMENTS.length < 4) {
        console.error("Please provide the listing ID to claim the asset");
        process.exit(1);
      }
      await claimAsset(ARGUMENTS[3]);
      break;
    default:
      console.error("Unknown method");
      process.exit(1);
  }
};

main();