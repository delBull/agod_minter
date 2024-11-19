interface Window {
    ethereum?: {
        request: (args: {
            method: string;
            params?: any[];
        }) => Promise<any>;
        isMetaMask?: boolean;
        on?: (event: string, callback: (params: any) => void) => void;
        removeListener?: (event: string, callback: (params: any) => void) => void;
    };
}

interface EthereumProvider {
    request: (args: {
        method: string;
        params?: any[];
    }) => Promise<any>;
    isMetaMask?: boolean;
    on?: (event: string, callback: (params: any) => void) => void;
    removeListener?: (event: string, callback: (params: any) => void) => void;
}

declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}

export {};
