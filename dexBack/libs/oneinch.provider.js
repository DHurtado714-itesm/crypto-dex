import axios from "axios";

const oneInchApiBaseUrl = "https://api.1inch.dev/swap/v6.0";
const headers = {
  Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
};

async function approveAllowance(params) {
  try {
    const response = await axios.get(
      `${oneInchApiBaseUrl}/${params.chainId}/approve/allowance`,
      {
        headers,
        params: {
          tokenAddress: params.tokenAddress,
          walletAddress: params.walletAddress,
        },
      }
    );

    return response.data.allowance;
  } catch (error) {
    console.error(error);
    return "Internal Server Error";
  }
}

async function approveTransaction(params) {
  try {
    const response = await axios.get(
      `${oneInchApiBaseUrl}/${params.chainId}/approve/transaction`,
      {
        headers,
        params: {
          tokenAddress: params.tokenAddress,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    return "Internal Server Error";
  }
}

async function executeSwap(params) {
  try {
    const response = await axios.get(
      `${oneInchApiBaseUrl}/${params.chainId}/swap`,
      {
        headers,
        params: {
          fromTokenAddress: params.fromTokenAddress,
          toTokenAddress: params.toTokenAddress,
          amount: params.amount,
          fromAddress: params.fromAddress,
          slippage: params.slippage,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    return "Internal Server Error";
  }
}

let tokenListCache = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let lastCacheTime = null;
let lastTokenChainId = null;

async function getTokenListByChainId(chainId) {
  try {
    if (
      tokenListCache &&
      lastCacheTime &&
      lastTokenChainId === chainId &&
      Date.now() - lastCacheTime < CACHE_DURATION
    ) {
      console.log("Returning cached token list");
      return tokenListCache;
    }

    // If no cache or expired, fetch new data
    console.log("Fetching fresh token list");
    const response = await axios.get(`${oneInchApiBaseUrl}/${chainId}/tokens`, {
      headers,
    });

    const tokens = Object.entries(response.data.tokens).map(
      ([address, token]) => ({
        name: token.name,
        ticker: token.symbol,
        img: token.logoURI,
        address: token.address,
        decimals: token.decimals,
      })
    );

    tokenListCache = tokens;
    lastCacheTime = Date.now();
    lastTokenChainId = chainId;

    return tokens;
  } catch (error) {
    console.error("Error fetching token list:", error);
    if (tokenListCache) {
      console.log("Returning cached token list due to error");
      return tokenListCache;
    }
  }
}

export const OneInchProvider = {
  approveAllowance,
  approveTransaction,
  executeSwap,
  getTokenListByChainId,
};
