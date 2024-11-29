import { Chain } from "thirdweb/chains";

export const baseChain: Chain = {
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
    // Omitimos la propiedad testnet ya que es mainnet
} as const;
