import fs from "fs"
import path from "path"
import { PinataSDK } from "pinata-web3"

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
})

export async function uploadJSONToIPFS(jsonMetadata: any): Promise<string> {
  const { IpfsHash } = await pinata.upload.json(jsonMetadata)
  return IpfsHash
}

// could use this to upload music (audio files) to IPFS
export async function uploadFileToIPFS(
  filePath: string,
  fileName: string,
  fileType: string,
): Promise<string> {
  const fullPath = path.join(process.cwd(), filePath)
  const blob = new Blob([fs.readFileSync(fullPath)])
  const file = new File([blob], fileName, { type: fileType })
  const { IpfsHash } = await pinata.upload.file(file)
  return IpfsHash
}

// Upload binary data (images) to IPFS
export async function uploadBinaryToIPFS(
  binaryData: Buffer,
  fileName: string,
  fileType: string,
): Promise<string> {
  const blob = new Blob([binaryData], { type: fileType })
  const file = new File([blob], fileName, { type: fileType })
  const { IpfsHash } = await pinata.upload.file(file)
  return IpfsHash
}
