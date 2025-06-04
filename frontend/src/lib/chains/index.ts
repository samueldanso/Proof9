// Story Protocol Aeneid Testnet
export const storyAeneid = {
  id: 17001, // Story Aeneid testnet chain ID
  name: "Story Protocol Aeneid",
  network: "story-aeneid",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://rpc.story-testnet.xyz"] },
    default: { http: ["https://rpc.story-testnet.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Story Explorer",
      url: "https://explorer.story-testnet.xyz",
    },
  },
  testnet: true,
};

// Story Protocol Mainnet
export const storyMainnet = {
  id: 1708, // Story Protocol Mainnet chain ID
  name: "Story Protocol Mainnet",
  network: "story-mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://rpc.story.xyz"] },
    default: { http: ["https://rpc.story.xyz"] },
  },
  blockExplorers: {
    default: { name: "Story Explorer", url: "https://explorer.story.xyz" },
  },
};
