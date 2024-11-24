import { Chain } from "thirdweb/chains";

export const fantomChain: Chain = {
    id: 250,
    name: "Fantom Opera",
    rpc: "https://250.rpc.thirdweb.com",
    nativeCurrency: {
        decimals: 18,
        name: "Fantom",
        symbol: "FTM",
    },
    blockExplorers: [{
        name: "FTMScan",
        url: "https://ftmscan.com",
        apiUrl: "https://api.ftmscan.com"
    }],
    // Omitimos la propiedad testnet ya que es mainnet
} as const;
