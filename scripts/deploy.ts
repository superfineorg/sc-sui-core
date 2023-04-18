import { TransactionBlock } from "@mysten/sui.js";
import fs from "fs/promises";
import { prepareSigner, SuiObject } from "./utils";
import { execSync } from "child_process";

const MODULE = "SuiSmartContracts";
const DEPLOY_INFO_PATH = "./deployed_modules/output.json";

const deploy = async () => {
  const [provider, , signer] = prepareSigner(process.env.MNEMONIC);
  const compiledResult: { modules: string[], dependencies: string[]; } = JSON.parse(
    execSync(
      `sui move build --dump-bytecode-as-base64`,
      { encoding: "utf-8" },
    ),
  );

  try {
    // Prepare a transaction block
    let txb = new TransactionBlock();
    txb.publish(compiledResult);

    // Execute this transaction block and analyze the response
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
    const createdObjectIds = txResponse.effects.created.map(item => item.reference.objectId);
    const createdInfo = await provider.multiGetObjects({
      ids: createdObjectIds,
      options: { showContent: true, showType: true, showOwner: true }
    });

    let packageObjectId: string;
    let createdObjects: SuiObject[];

    createdInfo.forEach(item => {
      if (item.data.type === "package")
        packageObjectId = item.data.objectId;
      else
        createdObjects.push({
          type: item.data.type,
          id: item.data.objectId,
          owner: item.data.owner
        });
    });

    // Save the result
    const deployed = JSON.parse(await fs.readFile(DEPLOY_INFO_PATH, { encoding: "utf8" }));
    deployed[MODULE] = { packageObjectId, createdObjects };
    await fs.writeFile(DEPLOY_INFO_PATH, JSON.stringify(deployed, null, "\t"));
  } catch (err) {
    console.log("ERROR", err);
  }
};

deploy();