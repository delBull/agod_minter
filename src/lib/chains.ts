import { Chain } from "thirdweb/chains";

export const sepoliaChain: Chain = {
    id: 11155111,
    name: "Sepolia",
    // Use Infura's public RPC URL for better reliability
    rpc: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    nativeCurrency: {
        decimals: 18,
        name: "Sepolia Ether",
        symbol: "ETH",
    },
    blockExplorers: [{
        name: "Etherscan",
        url: "https://sepolia.etherscan.io",
        apiUrl: "https://api-sepolia.etherscan.io"
    }],
    testnet: true
};
