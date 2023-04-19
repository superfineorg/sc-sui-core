import { TransactionBlock } from "@mysten/sui.js";
import { executeTxb, prepareSigner } from "../utils";
import dotenv from "dotenv";

dotenv.config();

const PACKAGE = "0xae0b7f836e19277032079739d7d69f77f75774fd56b387425685005b8e716243";
const CLAIMING_PLATFORM = "0xb9e6439e92e3ae4099a6e86e660b3399074b2c05d3ae08d979ea3c1bc7f05cb6";
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
      txb.pure(7)
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
          txb.object("0x6d2233189e4483e17c4b1d3389928a6f987a7cd0cce7f479425face85048ab65")
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
          txb.pure("0x95e2d8389c5534899edcadcf5c6eab623e73791a7c20896db1864117c6589385")
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