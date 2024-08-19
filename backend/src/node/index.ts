import { Transaction } from "@mysten/sui/transactions";
import express, { Request } from "express";
import "dotenv/config";
import { EnokiClient } from "@mysten/enoki";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { toB64 } from "@mysten/sui/utils";
import cors from "cors";
import { packageId } from "../deployed-objects.json";

interface SponsorTxCreateReceiptBody {
  address: string;
}

interface SponsorTxAddItemBodyArgs {
  objectId: string;
  itemName: string;
  itemPrice: number;
}

interface SponsorTxAddItemBody {
  args: SponsorTxAddItemBodyArgs[];
  address: string;
}

interface ExecuteTxBody {
  digest: string;
  signature: string;
  isLast: boolean;
}

interface sponsorTxCreateReceiptWithItemsBody {
  customerAddress: string;
  merchantAddress: string;
  itemNames: string[];
  itemPrices: number[];
  itemCount: number;
}

const PORT = 8080;
const app = express();

app.use(express.json());

app.use(cors({ origin: "*" }));

const enokiClient = new EnokiClient({
  apiKey: process.env.ENOKI_PRIVATE_KEY as string,
});
const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

app.get("/", (req, res) => {
  req.body;
  res.send("Hello world");
});

app.post(
  "/sponsorTxCreateReceipt",
  async (req: Request<{}, {}, SponsorTxCreateReceiptBody>, res) => {
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

app.post("/executeTx", async (req: Request<{}, {}, ExecuteTxBody>, res) => {
  setTimeout(() => console.log("wait for 1 sec"), 1000);

  const executeTransactionRes = await enokiClient.executeSponsoredTransaction({
    digest: req.body.digest,
    signature: req.body.signature,
  });

  if (!req.body.isLast) {
    const txb = await suiClient.getTransactionBlock({
      digest: executeTransactionRes.digest,
      options: { showEffects: true },
    });
    if (!txb.effects) return res.send("Failed txb.effects");
    if (!txb.effects.created) return res.send("Failed txb.effects.created");

    res.send({ objectId: txb.effects.created[0].reference.objectId });
    return;
  }
  res.send("OK");
});

app.post(
  "/sponsorTxAddItem",
  async (req: Request<{}, {}, SponsorTxAddItemBody>, res) => {
    const tx = new Transaction();

    for (let arg of req.body.args) {
      tx.moveCall({
        target: `${packageId}::resuipt_contracts::addItemToReceipt`,
        arguments: [
          tx.object(arg.objectId),
          tx.pure.string(arg.itemName),
          tx.pure.u64(arg.itemPrice),
        ],
      });
    }

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
          `${packageId}::resuipt_contracts::addItemToReceipt`,
        ],
        allowedAddresses: [req.body.address],
      });
    res.send(sponsoredTransactionRes);
  }
);

app.post(
  "/sponsorTxCreateReceiptWithItems",
  async (req: Request<{}, {}, sponsorTxCreateReceiptWithItemsBody>, res) => {
    const {
      customerAddress,
      merchantAddress,
      itemNames,
      itemPrices,
      itemCount,
    } = req.body;

    console.log(req.body);

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::resuipt_contracts::createReceiptWithItems`,
      arguments: [
        tx.object(merchantAddress),
        tx.pure.vector("string", itemNames),
        tx.pure.vector("u64", itemPrices),
        tx.pure.u64(itemCount),
      ],
    });

    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    const sponsoredTransactionRes =
      await enokiClient.createSponsoredTransaction({
        network: "testnet",
        transactionKindBytes: toB64(txBytes),
        sender: customerAddress,
        allowedMoveCallTargets: [
          `${packageId}::resuipt_contracts::createReceiptWithItems`,
        ],
        allowedAddresses: [customerAddress],
      });
    res.send(sponsoredTransactionRes);
  }
);

app.listen(PORT, () => {
  console.log(`Listening on part ${PORT}`);
});
