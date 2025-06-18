import { useState, useEffect } from 'react';

export const useEthPrice = () => {
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=mxn'
        );
        const data = await response.json();
        setEthPrice(data.ethereum.mxn);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const convertMXNtoETH = (mxnAmount: number) => {
    return mxnAmount / ethPrice;
  };

  const convertETHtoMXN = (ethAmount: number) => {
    return ethAmount * ethPrice;
  };

  return { ethPrice, loading, convertMXNtoETH, convertETHtoMXN };
};