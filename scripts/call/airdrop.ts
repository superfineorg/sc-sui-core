import { TransactionBlock, fromSerializedSignature } from "@mysten/sui.js";
import { executeTxb, prepareSigner, hexToBytes, uint64ToBytes } from "../utils";
import dotenv from "dotenv";

dotenv.config();

const PACKAGE = "0x8859979fe832f85f31a76965f940ab7885adda92e9cf94ffc422f3b75f0a606c";
const AIRDROP_PLATFORM = "0xc2b119f5fdeca4f0a90679306a85f37be732a24786ca02aeafe043f2f346842b";
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
  let [coin] = txb.splitCoins(txb.gas, [txb.pure(airdroppingFee)]);
  txb.moveCall({
    target: `${PACKAGE}::superfine_airdrop::create_airdrop_campaign`,
    arguments: [
      txb.object(AIRDROP_PLATFORM),
      txb.pure(campaignId),
      txb.pure(numAssets),
      txb.pure(airdroppingFee),
      txb.pure(operatorPubkeyBytes),
      txb.pure(signatureBytes),
      coin
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
  let [coin] = txb.splitCoins(txb.gas, [txb.pure(newAirdroppingFee)]);
  txb.moveCall({
    target: `${PACKAGE}::superfine_airdrop::update_campaign`,
    arguments: [
      txb.object(AIRDROP_PLATFORM),
      txb.pure(campaignId),
      txb.pure(newNumAssets),
      txb.pure(newAirdroppingFee),
      txb.pure(operatorPubkeyBytes),
      txb.pure(signatureBytes),
      coin
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
      txb.makeMoveVec({
        objects: [
          txb.object("0xd984c13f4e5d0588f8de5ca2cf0f758813f9c8e453b8c705547f40e2cae1ee83")
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
      txb.pure("0xd42aed59635ff6c24440def0d18c34eea35558219b22dcc88340a1202fc141c0")
    ]
  });
  await executeTxb(txb, campaignCreator);
};

const airdropAsset = async () => {
  const [, winnerPubkey, winner] = prepareSigner(process.env.MNEMONIC, WINNER);
  const [, campaignCreatorPubkey,] = prepareSigner(process.env.MNEMONIC, CAMPAIGN_CREATOR);
  const [, operatorPubkey, operatorSigner] = prepareSigner(process.env.MNEMONIC, OPERATOR);

  // Calculate the signature
  let listingId = "0x35e54878b0d4f3ad0781fefaa3cbe6bd42523b18dda393be092600fdbc6afcdb";
  let operatorPubkeyBytes = Array.from(operatorPubkey.toBytes());
  let message = new Uint8Array([
    ...Array.from(new TextEncoder().encode("ABCXYZZZZ")),
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
    target: `${PACKAGE}::superfine_airdrop::airdrop_asset`,
    typeArguments: [`${PACKAGE}::example_nft::ExampleNft`],
    arguments: [
      txb.object(AIRDROP_PLATFORM),
      txb.pure("0xd42aed59635ff6c24440def0d18c34eea35558219b22dcc88340a1202fc141c0"), // Campaign ID
      txb.pure("0xd42aed59635ff6c24440def0d18c34eea35558219b22dcc88340a1202fc141c0"), // Asset ID
      txb.pure(winnerPubkey.toSuiAddress()),
    ]
  });
  await executeTxb(txb, winner);
};

airdropAsset();