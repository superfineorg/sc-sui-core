import { TransactionBlock } from "@mysten/sui.js";
import { executeTxb, prepareSigner } from "../utils";
import dotenv from "dotenv";

dotenv.config();

const PACKAGE = "0x4003ce8020e59cedf1a024f537f2d34a1025adbb86ef8f49c7ece9564b85bd18";
const CLAIMING_PLATFORM = "0x6638fcace8e39faf9889cb4870868b75e3b41e3070f39ab24eceb250f49c5022";
const ADMIN = 0;
const WINNER = 0;
const CAMPAIGN_CREATOR = 0;
const OPERATOR = 0;

const mintNfts = async () => {
  const [, creatorAddress, creatorSigner] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE}::example_nft::mint_nfts`,
    arguments: [
      txb.pure(creatorAddress),
      txb.pure(8)
    ]
  });
  await executeTxb(txb, creatorSigner);
};

const setOperators = async () => {
  const [, , admin] = prepareSigner(process.env.MNEMONIC, ADMIN);
  const [, operator,] = prepareSigner(process.env.MNEMONIC, OPERATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE}::superfine_claim::set_operator`,
    arguments: [
      txb.object(CLAIMING_PLATFORM),
      txb.pure(operator),
      txb.pure(true)
    ]
  });
  await executeTxb(txb, admin);
};

const listAssets = async () => {
  const [, , campaignCreator] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE}::superfine_claim::list_assets`,
    typeArguments: [`${PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(CLAIMING_PLATFORM),
      txb.makeMoveVec({
        objects: [
          txb.object("0xb2d1fefebac03b6cab92f2a21fa4b3aa0a65061392111a3142f1ddb309aedb31")
        ]
      })
    ]
  });
  await executeTxb(txb, campaignCreator);
};

const delistAssets = async () => {
  const [, , campaignCreator] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE}::superfine_claim::delist_assets`,
    typeArguments: [`${PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(CLAIMING_PLATFORM),
      txb.makeMoveVec({
        objects: [
          txb.object("0x0bb50da2e25d5b22a9a40fc7f55c20aa4278b218ad36d871cc2f0839a863c406")
        ]
      })
    ]
  });
  await executeTxb(txb, campaignCreator);
};

const claimAssets = async () => {
  const [, , winner] = prepareSigner(process.env.MNEMONIC, WINNER);
  const [, campaignCreator,] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE}::superfine_claim::claim_assets`,
    typeArguments: [`${PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(CLAIMING_PLATFORM),
      txb.pure("ABCXYZZZZ"),
      txb.pure(campaignCreator),
      txb.makeMoveVec({
        objects: [
          txb.pure("0x92612443c35b589507316b420a4a9d9d0b87851482e9aa58fe53044d91a9b2cf")
        ]
      }),
      txb.pure(""),
      txb.pure("")
    ]
  });
  await executeTxb(txb, winner);
};

delistAssets();