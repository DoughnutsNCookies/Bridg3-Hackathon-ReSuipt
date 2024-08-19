import "dotenv/config";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/sui.js/utils";
import { SuiClient, SuiObjectChange } from "@mysten/sui.js/client";
import path, { dirname } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { writeFileSync } from "fs";

console.log("Reading from .env...");
const privKey = process.env.VITE_WALLET_PRIVATE_KEY;
if (!privKey) {
  console.error("No private key provided");
  process.exit(1);
}
const suiURL = process.env.VITE_SUI_URL;
if (!suiURL) {
  console.error("No SUI URL provided");
  process.exit(1);
}

const pathToScripts = dirname(fileURLToPath(import.meta.url));

const keypair = Ed25519Keypair.fromSecretKey(fromB64(privKey).slice(1));
const client = new SuiClient({
  url: suiURL,
});

console.log("Building the contract...");
const pathToContracts = path.join(pathToScripts, "../../resuipt_contracts");
const { modules, dependencies } = JSON.parse(
  execSync(
    `sui move build --dump-bytecode-as-base64 --path ${pathToContracts}`,
    {
      encoding: "utf-8",
    }
  )
);

console.log("Deploying contracts...");
console.log(`Deploying from ${keypair.toSuiAddress()}`);

const deployTrx = new TransactionBlock();
const [upgrade_cap] = deployTrx.publish({
  modules,
  dependencies,
});
deployTrx.transferObjects(
  [upgrade_cap],
  deployTrx.pure(keypair.toSuiAddress())
);
const { objectChanges, balanceChanges } =
  await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: deployTrx,
    options: {
      showBalanceChanges: true,
      showEffects: true,
      showEvents: true,
      showInput: false,
      showObjectChanges: true,
      showRawInput: false,
    },
  });

console.log("Deployed successfully!");

if (!balanceChanges) {
  console.error("No balance changes");
  process.exit(1);
}
if (!objectChanges) {
  console.error("No object changes");
  process.exit(1);
}

function parseAmount(amount: string): number {
  return parseInt(amount) / 1_000_000_000;
}
console.log(
  `Spent ${Math.abs(parseAmount(balanceChanges[0].amount))} SUI on deploy`
);

const publishedChange = objectChanges.find(
  (change) => change.type == "published"
);
if (publishedChange?.type !== "published") {
  console.error("Did not find correct published change");
  process.exit(1);
}

const deployedAddress: any = {
  packageId: publishedChange.packageId,
};
console.log(objectChanges);

// const find_id_by_type = (changes: SuiObjectChange[], type: string) => {
//   const object_change = changes.find(
//     (change) => change.type == "created" && change.objectType == type
//   );
//   if (object_change?.type == "created") {
//     return object_change.objectId;
//   }
// };

// const clicksType = `${publishedChange.packageId}::resuipt_contracts::Receipt`;
// const clicksID = find_id_by_type(objectChanges, clicksType);
// if (!clicksID) {
//   console.error("Did not find receipt object");
//   process.exit(1);
// }
// deployedAddress.clicksId = clicksID;

const deployedPath = path.join(pathToScripts, "../src/deployed-objects.json");
writeFileSync(deployedPath, JSON.stringify(deployedAddress, null, 2));
