const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;
const axios = require("axios");
const { parseUnits, formatUnits } = require("viem");
const { sleep } = require("sleep");

app.use(cors());
app.use(express.json());

app.get("/tokenPrice", async (req, res) => {
  try {
    const { query } = req;

    const responseOne = await Moralis.EvmApi.token.getTokenPrice({
      chain: "0x89",
      address: query.addressOne,
    });

    const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
      chain: "0x89",
      address: query.addressTwo,
    });

    const usdPrices = {
      tokenOne: responseOne.raw.usdPrice,
      tokenTwo: responseTwo.raw.usdPrice,
      ratio: responseOne.raw.usdPrice / responseTwo.raw.usdPrice,
    };

    return res.status(200).json(usdPrices);
  } catch (error) {
    console.error(error);
  }
});

app.get("/approve/allowance", async (req, res) => {
  const { chainId, walletAddress, tokenAddress } = req.query;

  try {
    const response = await axios.get(
      `https://api.1inch.dev/swap/v6.0/${chainId}/approve/allowance`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
        params: {
          tokenAddress: tokenAddress,
          walletAddress: walletAddress,
        },
      }
    );

    return res.status(200).json({ allowance: response.data.allowance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/approve/transaction", async (req, res) => {
  const { chainId, tokenAddress } = req.query;

  try {
    const response = await axios.get(
      `https://api.1inch.dev/swap/v6.0/${chainId}/approve/transaction`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
        params: {
          tokenAddress: tokenAddress,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/swap", async (req, res) => {
  const {
    chainId,
    fromTokenAddress,
    decimals,
    toTokenAddress,
    amount,
    fromAddress,
    slippage,
  } = req.query;

  const cryptoAmount = parseUnits(amount, decimals);

  try {
    sleep(1); // Sleep for 1 second to allow for the transaction to be approved
    console.log(req.query);
    const { data } = await axios.get(
      `https://api.1inch.dev/swap/v6.0/${chainId}/swap`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
        params: {
          src: fromTokenAddress,
          dst: toTokenAddress,
          amount: cryptoAmount.toString(),
          from: fromAddress,
          slippage: 1,
          origin: fromAddress,
        },
      }
    );

    console.log(data);

    return res.status(200).json({
      toAmount: parseFloat(formatUnits(data.dstAmount, decimals)),
      toAddress: data.tx.to,
      data: data.tx.data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
