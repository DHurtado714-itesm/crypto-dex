import axios from "axios";

const oneInchApiBaseUrl = "https://api.1inch.dev/swap/v6.0";
const headers = {
  Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
};

// Rate limiting variables
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 1 second in milliseconds

// Helper function to handle rate limiting
async function rateLimitRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  lastRequestTime = Date.now();
}

async function approveAllowance(params) {
  try {
    await rateLimitRequest();
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
    await rateLimitRequest();
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
    await rateLimitRequest();
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
    await rateLimitRequest();
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

async function getTokensPricesByAddress(params) {
  try {
    await rateLimitRequest();
    const url = `https://api.1inch.dev/price/v1.1/${params.chainId}`;

    const config = {
      headers,
    };

    const body = {
      tokens: [params.addressOne, params.addressTwo],
      currency: "USD",
    };

    const response = await axios.post(url, body, config);

    return {
      tokenOne: response.data[params.addressOne],
      tokenTwo: response.data[params.addressTwo],
      ratio:
        response.data[params.addressOne] / response.data[params.addressTwo],
    };
  } catch (error) {
    console.error(error);
    return "Internal Server Error";
  }
}

export const OneInchProvider = {
  approveAllowance,
  approveTransaction,
  executeSwap,
  getTokenListByChainId,
  getTokensPricesByAddress,
};
