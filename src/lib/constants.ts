/**
 * Contract addresses
 */
export const CONTRACTS = {
    TOKEN: "0xFC5fc05E5146f258A29654c03d351d4a61a856DC",  // AGOD Token
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"   // USDC en Base
};

/**
 * Chain configuration
 */
export const CHAIN_CONFIG = {
    ID: 8453,  // Base Mainnet
    CURRENCY: {
        ADDRESS: CONTRACTS.USDC,
        DECIMALS: 6,
        SYMBOL: "USDC"
    }
};

/**
 * Token configuration
 */
export const TOKEN_CONFIG = {
    PRICE_PER_TOKEN: BigInt(7000),  // 0.007 USDC
    GAS_SETTINGS: {
        MAX_FEE_PER_GAS: BigInt(30000000000),      // 30 gwei
        MAX_PRIORITY_FEE_PER_GAS: BigInt(1500000000) // 1.5 gwei
    }
};

/**
 * Default token ID (not used for ERC20)
 */
export const defaultTokenId = 0n;

/**
 * Default chain ID
 */
export const defaultChainId = 8453;

/**
 * Default token contract address
 */
export const defaultTokenContractAddress = 0xFC5fc05E5146f258A29654c03d351d4a61a856DC;

/**
 * Test data:
 * ERC1155: 0xFC5fc05E5146f258A29654c03d351d4a61a856DC | 8453 | 1n
 * ERC721: 0xf20d41960b58A1f6868e83cf25FFDA5E8C766317 | 11155111
 * ERC20: 0xdE60bd7Bc4FFb32A5A705723e111f3B5097958E9 | 11155111
 */