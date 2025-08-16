
import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from "alchemy-sdk";

// ✅ Single Alchemy instance for the whole file
const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY!,
  network: Network.ETH_MAINNET, // or the network you need
});

export async function getTokenBirthdate(contractAddress: string): Promise<Date> {
  // Step 1: Get the first transfer or deployment event
  const tx = await alchemy.core.getAssetTransfers({
    fromAddress: "0x0000000000000000000000000000000000000000", // mint/creation
    toAddress: contractAddress,
    category: [
      AssetTransfersCategory.EXTERNAL,
      AssetTransfersCategory.ERC20,
      AssetTransfersCategory.ERC721,
      AssetTransfersCategory.ERC1155,
    ],
    maxCount: 1,
    order: SortingOrder.ASCENDING, // earliest transaction
  });

  if (!tx.transfers.length) {
    throw new Error("Could not find deployment transaction for this token");
  }

  const deploymentTx = tx.transfers[0];
  const blockNumber = parseInt(deploymentTx.blockNum, 16); // hex → number

  // Step 2: Get block timestamp
  const block = await alchemy.core.getBlock(blockNumber);
  return new Date(block.timestamp * 1000); // JS datetime
}

// // Example usage
// (async () => {
//   try {
//     const birthdate = await getTokenBirthdate("0xYourTokenAddressHere");
//     console.log("Token deployed on:", birthdate);
//   } catch (err) {
//     console.error(err);
//   }
// })();
