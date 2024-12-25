const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;
const { parseUnits, formatUnits } = require("viem");
const { sleep } = require("sleep");
const { OneInchProvider } = require("./libs/oneinch.provider");

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
    const response = await OneInchProvider.approveAllowance({
      chainId,
      walletAddress,
      tokenAddress,
    });

    return res.status(200).json({ allowance: response });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/approve/transaction", async (req, res) => {
  const { chainId, tokenAddress } = req.query;

  try {
    const response = await OneInchProvider.approveTransaction({
      chainId,
      tokenAddress,
    });

    return res.status(200).json(response);
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

    const data = await OneInchProvider.executeSwap({
      chainId,
      fromTokenAddress,
      toTokenAddress,
      amount: cryptoAmount,
      fromAddress,
      slippage,
    });

    console.log(data);

    return res.status(200).json({
      toAmount: parseFloat(formatUnits(data.dstAmount, decimals)),
      toAmountInWei: data.dstAmount,
      toAddress: data.tx.to,
      data: data.tx.data,
      gas: data.tx.gas,
      gasPrice: data.tx.gasPrice,
      value: data.tx.value,
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
