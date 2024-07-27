import { SuiClient, SuiObjectResponse } from "@mysten/sui/client";
import { useState } from "react";
import dayjs from "dayjs";

interface PastReceiptsData {
  name: string;
  price: number;
}

export interface PastReceipt {
  timestamp: string;
  txDigest: string;
  merchant: string;
  data: PastReceiptsData[];
}

const DECODER = new TextDecoder("utf-8");

const usePastReceipts = (client: SuiClient) => {
  const [pastReceipts, setPastReceipts] = useState<PastReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getPastReceipts = async (walletAddress: string) => {
    if (walletAddress === "") return;

    setIsLoading(true);

    walletAddress =
      "0x744f9472a847e597375f4213375f2911babbfb3ded6910041c17ac9c7fe24398";

    const ownedObjects = await client.getOwnedObjects({
      owner: `${walletAddress}`,
    });

    const objectArr: SuiObjectResponse[] = [];
    for (let data of ownedObjects.data) {
      if (!data.data) continue;
      objectArr.push(
        await client.getObject({
          id: data.data.objectId,
          options: {
            showContent: true,
            showDisplay: true,
            showPreviousTransaction: true,
          },
        })
      );
    }

    const pastReceiptsRes: PastReceipt[] = [];

    for (let data of objectArr) {
      if (!data.data) continue;
      if (!((data.data.content as any).type as string).includes("Receipt"))
        continue;

      const merchant = (data.data.content as any).fields.merchant;

      const df = await client.getDynamicFields({
        parentId: `${data.data.objectId}`,
      });

      if (df.data.length === 0) continue;

      const txb = await client.getTransactionBlock({
        digest: data.data.previousTransaction as string,
      });

      const pastReceiptsDataRes: PastReceiptsData[] = [];
      for (let dfData of df.data) {
        const objectId = dfData.objectId;
        const obj = await client.getObject({
          id: objectId,
          options: { showContent: true },
        });
        if (!obj.data) continue;
        const content = obj.data.content as any;
        const name = DECODER.decode(new Uint8Array(content.fields.name));
        const price = Number(content.fields.value.fields.price);
        pastReceiptsDataRes.push({ name, price });
      }
      pastReceiptsRes.push({
        timestamp: dayjs(Number(txb.timestampMs)).format("DD/MM/YYYY HH:mm:ss"),
        txDigest: txb.digest,
        merchant: merchant,
        data: pastReceiptsDataRes,
      });
    }

    setPastReceipts(pastReceiptsRes);

    setIsLoading(false);
  };

  return { pastReceipts, getPastReceipts, isLoading };
};

export default usePastReceipts;
