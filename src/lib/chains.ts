import { Chain } from "thirdweb/chains";


export const baseChain = {
    id: 8453,
    name: "Base Mainnet",
    rpc: "https://mainnet.base.org",
    nativeCurrency: {
        decimals: 18,
        name: "Base",
        symbol: "ETH",
    },
    blockExplorers: [{
        name: "BaseScan",
        url: "https://base.blockscout.com/",
    }],
} as Chain;

export const BaseSepoliaTestnet: Chain = {
  id: 84532,
  name: "Base Sepolia Testnet",
  rpc: "https://84532.rpc.thirdweb.com",
  nativeCurrency: { decimals: 18, name: "Sepolia Ether (ETH)", symbol: "ETH" },
  blockExplorers: [{ name: "Basescan", url: "https://sepolia.basescan.org/" }],
} as const;