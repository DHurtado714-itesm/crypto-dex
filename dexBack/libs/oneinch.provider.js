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

export const OneInchProvider = {
  approveAllowance,
  approveTransaction,
  executeSwap,
};
