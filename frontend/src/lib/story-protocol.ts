/**
 * Story Protocol License Terms Utilities
 * Following Story Protocol documentation exactly
 * https://docs.story.foundation/developers/tutorials/register-stability-images
 */

import { LicenseTerms, WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";
import { parseEther, zeroAddress } from "viem";

export interface LicenseFormData {
  type: string; // "standard", "commercial", "exclusive"
  price: string; // USD amount
  usage: string; // "single", "multiple", "unlimited"
  territory: string; // "worldwide", "us", "eu", "custom"
}

// Story Protocol's deployed smart contract addresses
// From: https://docs.story.foundation/developers/deployed-smart-contracts
const ROYALTY_POLICY_LAP = "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E";

/**
 * Convert USD to WIP tokens using parseEther (Story Protocol standard)
 * Following Story Protocol documentation for token conversion
 */
export function convertUSDToWIP(usdAmount: string): bigint {
  const usd = Number.parseFloat(usdAmount) || 0;
  // For demo: 1 USD = 1 WIP token (in production, use price oracle)
  return parseEther(usd.toString());
}

/**
 * Map license type to revenue share percentage
 * Following Story Protocol commercial licensing patterns
 */
export function getLicenseRevShare(licenseType: string): number {
  switch (licenseType) {
    case "standard":
      return 5; // 5% revenue share for standard licenses (Story Protocol example)
    case "commercial":
      return 10; // 10% revenue share for commercial licenses
    case "exclusive":
      return 25; // 25% revenue share for exclusive licenses
    default:
      return 5;
  }
}

/**
 * Convert license form data to Story Protocol LicenseTerms
 * Following exact Story Protocol LicenseTerms structure from documentation
 * https://docs.story.foundation/developers/tutorials/register-stability-images
 */
export function convertLicenseFormToStoryTerms(licenseData: LicenseFormData): LicenseTerms {
  const { type, price } = licenseData;

  // Following Story Protocol's commercialRemixTerms example exactly
  const commercialRemixTerms: LicenseTerms = {
    transferable: true,
    royaltyPolicy: ROYALTY_POLICY_LAP, // RoyaltyPolicyLAP address from Story Protocol docs
    defaultMintingFee: convertUSDToWIP(price), // Using parseEther as per docs
    expiration: BigInt(0),
    commercialUse: type === "commercial" || type === "exclusive",
    commercialAttribution: true, // must give us attribution
    commercializerChecker: zeroAddress,
    commercializerCheckerData: zeroAddress,
    commercialRevShare: getLicenseRevShare(type), // revenue share percentage
    commercialRevCeiling: BigInt(0),
    derivativesAllowed: type !== "exclusive", // Exclusive licenses don't allow derivatives
    derivativesAttribution: true,
    derivativesApproval: type === "exclusive", // Exclusive requires approval
    derivativesReciprocal: type === "standard", // Standard licenses require reciprocal terms
    derivativeRevCeiling: BigInt(0),
    currency: WIP_TOKEN_ADDRESS, // Using Story Protocol's WIP_TOKEN_ADDRESS
    uri: "", // PIL document URI (can be added later)
  };

  return commercialRemixTerms;
}

/**
 * Get license summary for display
 * Following Story Protocol token display patterns
 */
export function getLicenseSummary(licenseData: LicenseFormData): string {
  const terms = convertLicenseFormToStoryTerms(licenseData);
  const wipAmount = Number(terms.defaultMintingFee) / 10 ** 18;

  return `${
    licenseData.type.charAt(0).toUpperCase() + licenseData.type.slice(1)
  } License: ${wipAmount} WIP tokens, ${terms.commercialRevShare}% revenue share`;
}
