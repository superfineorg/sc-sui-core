import { TransactionBlock, fromSerializedSignature } from "@mysten/sui.js";
import { executeTxb, prepareSigner, hexToBytes, uint64ToBytes } from "../utils";
import dotenv from "dotenv";

dotenv.config();

const PACKAGE = "0x6df7cffe4fee7f51a793d8388a53c5d23912533d4aab22c116615b3d7ae86297";
const AIRDROP_PLATFORM = "0x0b949e62db75b3fe1e2922982e723e431a04c1f7bb1b6950f6235141ab9523f9";
const ADMIN = 0;
const WINNER = 0;
const CAMPAIGN_CREATOR = 0;
const OPERATOR = 0;

const mintNfts = async () => {
  const [, creatorPubkey, creatorSigner] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE}::example_nft::mint_nfts`,
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
    target: `${PACKAGE}::superfine_airdrop::set_operator`,
    arguments: [
      txb.object(AIRDROP_PLATFORM),
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
    target: `${PACKAGE}::superfine_airdrop::create_airdrop_campaign`,
    arguments: [
      txb.object(AIRDROP_PLATFORM),
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

const updateCampaign = async () => {
  const [, campaignCreatorPubkey, campaignCreatorSigner] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  const [, operatorPubkey, operatorSigner] = prepareSigner(process.env.MNEMONIC, OPERATOR);

  // Calculate the signature
  let campaignId = "ABCXXXUUU";
  let newNumAssets = 11;
  let newAirdroppingFee = 14;
  let operatorPubkeyBytes = Array.from(operatorPubkey.toBytes());
  let message = new Uint8Array([
    ...Array.from(new TextEncoder().encode(campaignId)),
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
    target: `${PACKAGE}::superfine_airdrop::update_campaign`,
    arguments: [
      txb.object(AIRDROP_PLATFORM),
      txb.pure("0x2d4d696f17103ce763278f47d94a97778010bd9973d6ab814533a012e12b16a4"),
      txb.pure(newNumAssets),
      txb.pure(newAirdroppingFee),
      txb.pure(operatorPubkeyBytes),
      txb.pure(signatureBytes),
      txb.gas
    ]
  });
  await executeTxb(txb, campaignCreatorSigner);
};

const listAssets = async () => {
  const [, , campaignCreator] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE}::superfine_airdrop::list_assets`,
    typeArguments: [`${PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(AIRDROP_PLATFORM),
      txb.pure("0xd23071b164ffdd93cf515575cc32666908824e62c6fe6bb8636f3842a0edc680"),
      txb.makeMoveVec({
        objects: [
          txb.object("0x6c00df4569cab1cef5374827f2ccd20b8374240e571950c8e9b6410d2c34cb28"),
          txb.object("0x7a960ff225b1734bbbfa3df1dfc78a8d52dcd0d8286c9b5b58a2229231011235")
        ]
      })
    ]
  });
  await executeTxb(txb, campaignCreator);
};

const delistAsset = async () => {
  const [, , campaignCreator] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE}::superfine_airdrop::delist_asset`,
    typeArguments: [`${PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(AIRDROP_PLATFORM),
      txb.pure("0xd23071b164ffdd93cf515575cc32666908824e62c6fe6bb8636f3842a0edc680"),
      txb.pure("0x6c00df4569cab1cef5374827f2ccd20b8374240e571950c8e9b6410d2c34cb28")
    ]
  });
  await executeTxb(txb, campaignCreator);
};

const airdropAsset = async () => {
  const [, winnerPubkey,] = prepareSigner(process.env.MNEMONIC, WINNER);
  const [, , operatorSigner] = prepareSigner(process.env.MNEMONIC, OPERATOR);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE}::superfine_airdrop::airdrop_asset`,
    typeArguments: [`${PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(AIRDROP_PLATFORM),
      txb.pure("0xd23071b164ffdd93cf515575cc32666908824e62c6fe6bb8636f3842a0edc680"), // Campaign ID
      txb.pure("0x7a960ff225b1734bbbfa3df1dfc78a8d52dcd0d8286c9b5b58a2229231011235"), // Asset ID
      txb.pure(winnerPubkey.toSuiAddress()),
    ]
  });
  await executeTxb(txb, operatorSigner);
};

const withdrawAirdroppingFee = async () => {
  const [, adminPubkey, adminSigner] = prepareSigner(process.env.MNEMONIC, ADMIN);
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE}::superfine_airdrop::withdraw_airdropping_fee`,
    arguments: [
      txb.object(AIRDROP_PLATFORM),
      txb.pure(adminPubkey.toSuiAddress())
    ]
  });
  await executeTxb(txb, adminSigner);
};

withdrawAirdroppingFee();