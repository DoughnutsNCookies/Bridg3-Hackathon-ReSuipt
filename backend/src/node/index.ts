import { Transaction } from "@mysten/sui/transactions";
import express, { Request } from "express";
import "dotenv/config";
import { EnokiClient } from "@mysten/enoki";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { toB64 } from "@mysten/sui/utils";
import crypto from "crypto";

interface SponsorTxCreateReceipt {
  address: string;
}

const PORT = 8080;
const packageId =
  "0x0e7eece840c080abf86ab05e45c0893cbfbf20ee682dda96c647c6f001ffd1c3";
const app = express();

app.use(express.json());

const enokiClient = new EnokiClient({
  apiKey: process.env.ENOKI_PIRVATE_KEY as string,
});
const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.post(
  "/sponsorTxCreateReceipt",
  async (req: Request<{}, {}, SponsorTxCreateReceipt>, res) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::resuipt_contracts::createReceipt`,
      arguments: [tx.object(req.body.address)],
    });

    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    const sponsoredTransactionRes =
      await enokiClient.createSponsoredTransaction({
        network: "testnet",
        transactionKindBytes: toB64(txBytes),
        sender: req.body.address,
        allowedMoveCallTargets: [
          `${packageId}::resuipt_contracts::createReceipt`,
        ],
        allowedAddresses: [req.body.address],
      });
    res.send(sponsoredTransactionRes);
  }
);

app.post("/sponsorTxAddItemToReceipt", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Listening on part ${PORT}`);
});
