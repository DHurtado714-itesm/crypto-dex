import { useState, ChangeEvent, useEffect } from "react";
import tokenList from "../tokenList.json";
import { Input, Popover, Radio, Modal, RadioChangeEvent } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { getTokenPrices } from "../services/tokens";
import axios from "axios";
import { ChainId } from "../constants";
import { Token } from "../models/Token";
import { useSendTransaction } from "wagmi";
import { Hex } from "viem";

interface ISwapProps {
  isConnected: boolean;
  address?: string;
}

function Swap({ address, isConnected }: ISwapProps) {
  const [slippage, setSlippage] = useState<number>(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState<string | null>(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState<string | null>(null);
  const [tokenOne, setTokenOne] = useState<Token>(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState<Token>(tokenList[1]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [changeToken, setChangeToken] = useState<number>(1);
  const [shouldSendTransaction, setShouldSendTransaction] =
    useState<boolean>(false);
  const [prices, setPrices] = useState({ tokenOne: 0, tokenTwo: 0, ratio: 0 });
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null,
    gasLimit: null,
    gasPrice: null,
  });

  const { sendTransaction } = useSendTransaction({
    mode: "prepared",
    request: {
      from: address,
      to: String(txDetails.to) as Hex,
      data: String(txDetails.data),
      value: String(txDetails.value),
      gasLimit: String(txDetails.gasLimit),
    },
  });

  function handleSlippage(e: RadioChangeEvent) {
    setSlippage(e.target.value);
  }

  function changeAmount(e: ChangeEvent<HTMLInputElement>) {
    setTokenOneAmount(e.target.value);

    if (e.target.value && prices) {
      setTokenTwoAmount((parseFloat(e.target.value) * prices.ratio).toFixed(2));
    } else {
      setTokenTwoAmount(null);
    }
  }

  function switchTokens() {
    resetInputValues();

    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);

    fetchPrices(two.address, one.address);
  }

  function openModal(asset: number) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i: number) {
    resetInputValues();

    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address);
    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address);
    }

    setIsOpen(false);
  }

  function resetInputValues() {
    setPrices({ tokenOne: 0, tokenTwo: 0, ratio: 0 });
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
  }

  async function fetchPrices(one: string, two: string) {
    const response = await getTokenPrices(one, two);

    setPrices(response);
  }

  async function fetchDexSwap() {
    const response = await axios.get(
      `http://localhost:3001/approve/allowance?chainId=${ChainId.POLYGON}&tokenAddress=${tokenOne.address}&walletAddress=${address}`
    );

    if (response.data.allowance === "0") {
      setTimeout(async () => {
        const approve = await axios.get(
          `http://localhost:3001/approve/transaction?chainId=${ChainId.POLYGON}&tokenAddress=${tokenOne.address}`
        );

        setTxDetails(approve.data);
        console.log("not approved");
      }, 1000);
      return;
    }

    const txnResponse = await axios.get(
      `http://localhost:3001/swap?chainId=${ChainId.POLYGON}&fromTokenAddress=${tokenOne.address}&decimals=${tokenOne.decimals}&toTokenAddress=${tokenTwo.address}&amount=${tokenOneAmount}&fromAddress=${address}&slippage=${slippage}`
    );

    setTokenTwoAmount(txnResponse.data.toAmount);
    setTxDetails({
      to: txnResponse.data.toAddress,
      data: txnResponse.data.data,
      value: txnResponse.data.value,
      gasLimit: txnResponse.data.gas,
      gasPrice: txnResponse.data.gasPrice,
    });
    setShouldSendTransaction(true);
  }

  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address);
  }, []);

  useEffect(() => {
    if (txDetails.to) {
      console.log(txDetails);
    }
  }, [txDetails]);

  useEffect(() => {
    if (shouldSendTransaction && isConnected && sendTransaction) {
      sendTransaction();
      setShouldSendTransaction(false);
    }
  }, [shouldSendTransaction, isConnected, sendTransaction]);

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippage}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e: Token, i: number) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount || ""}
            onChange={changeAmount}
          />
          <Input placeholder="0" value={tokenTwoAmount || ""} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetTwoLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        <div className="swapButton" onClick={fetchDexSwap}>
          Swap
        </div>
      </div>
    </>
  );
}

export default Swap;
