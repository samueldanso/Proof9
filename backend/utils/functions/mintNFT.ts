import { Address } from "viem"
import { defaultNftContractAbi } from "../abi/defaultNftContractAbi"
import { account, publicClient, walletClient } from "../config"
import { NFTContractAddress } from "../utils"

export async function mintNFT(
  to: Address,
  uri: string,
): Promise<number | undefined> {
  console.log("Minting a new NFT...")

  const { request } = await publicClient.simulateContract({
    address: NFTContractAddress,
    functionName: "mintNFT",
    args: [to, uri],
    abi: defaultNftContractAbi,
  })
  const hash = await walletClient.writeContract({
    ...request,
    account: account,
  })
  const { logs } = await publicClient.waitForTransactionReceipt({
    hash,
  })
  if (logs[0].topics[3]) {
    return Number.parseInt(logs[0].topics[3], 16)
  }
}
