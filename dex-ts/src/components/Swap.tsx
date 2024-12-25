import { useState, ChangeEvent, useEffect } from "react";
import { Input, Popover, Radio, Modal, RadioChangeEvent, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { getTokenPrices } from "../services/tokens";
import axios from "axios";
import { ChainId } from "../constants";
import { Token } from "../models/Token";
import { useSendTransaction, useWaitForTransaction } from "wagmi";
import { Hex } from "viem";
import { useTokenContext } from "../hooks/useTokenContext";
import SearchBar from "./common/SearchBar";

interface ISwapProps {
  isConnected: boolean;
  address?: string;
}

function Swap({ address, isConnected }: ISwapProps) {
  const { tokens, isTokenLoading } = useTokenContext();
  const [messageApi, contextHolder] = message.useMessage();

  const [searchQuery, setSearchQuery] = useState("");
  const [slippage, setSlippage] = useState<number>(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState<string | null>(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState<string | null>(null);
  const [tokenOne, setTokenOne] = useState<Token | null>(null);
  const [tokenTwo, setTokenTwo] = useState<Token | null>(null);
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

  const { data, sendTransaction } = useSendTransaction({
    mode: "prepared",
    request: {
      from: address,
      to: String(txDetails.to) as Hex,
      data: String(txDetails.data),
      value: String(txDetails.value),
      gasLimit: String(txDetails.gasLimit),
    },
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
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
    if (!tokenOne || !tokenTwo) return;
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
    if (!tokenOne || !tokenTwo) return;
    resetInputValues();

    if (changeToken === 1) {
      setTokenOne(tokens[i]);
      fetchPrices(tokens[i].address, tokenTwo.address);
    } else {
      setTokenTwo(tokens[i]);
      fetchPrices(tokenOne.address, tokens[i].address);
    }

    setIsOpen(false);
  }

  function resetInputValues() {
    setPrices({ tokenOne: 0, tokenTwo: 0, ratio: 0 });
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
  }

  async function fetchPrices(one: string, two: string) {
    setTimeout(async () => {
      const response = await getTokenPrices(one, two);
      setPrices(response);
    }, 3000);
  }

  async function fetchDexSwap() {
    if (!tokenOne || !tokenTwo || !address) return;

    const response = await axios.get(
      `http://localhost:3001/approve/allowance?chainId=${ChainId.POLYGON}&tokenAddress=${tokenOne.address}&walletAddress=${address}`
    );

    if (response.data.allowance === "0") {
      setTimeout(async () => {
        const approve = await axios.get(
          `http://localhost:3001/approve/transaction?chainId=${ChainId.POLYGON}&tokenAddress=${tokenOne.address}`
        );

        setTxDetails(approve.data);
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
    if (!isTokenLoading && tokens && tokens.length >= 2) {
      setTokenOne(tokens[0]);
      setTokenTwo(tokens[1]);
      fetchPrices(tokens[0].address, tokens[1].address);
    }
  }, [isTokenLoading, tokens]);

  useEffect(() => {
    if (shouldSendTransaction && isConnected && sendTransaction) {
      sendTransaction();
      setShouldSendTransaction(false);
    }
  }, [shouldSendTransaction, isConnected, sendTransaction]);

  useEffect(() => {
    messageApi.destroy();

    if (isLoading) {
      messageApi.open({
        type: "loading",
        content: "Transaction is being processed...",
        duration: 0,
      });
    }
  }, [isLoading]);

  useEffect(() => {
    messageApi.destroy();

    if (isSuccess) {
      messageApi.open({
        type: "success",
        content: "Transaction successful!",
        duration: 1.5,
      });
    } else if (txDetails.to) {
      messageApi.open({
        type: "error",
        content: "Transaction failed!",
        duration: 1.5,
      });
    }
  }, [isSuccess]);

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

  const filteredTokens = tokens?.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isTokenLoading) {
    return (
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Loading tokens...</h4>
        </div>
      </div>
    );
  }

  if (!tokenOne || !tokenTwo) {
    return (
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>No tokens available</h4>
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title={
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or symbol..."
          />
        }
      >
        <div className="modalContent">
          {filteredTokens?.map((e: Token, i: number) => {
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
        <div
          className="swapButton"
          onClick={isConnected ? fetchDexSwap : undefined}
          style={{
            cursor: isConnected ? "pointer" : "not-allowed",
            opacity: isConnected ? 1 : 0.5,
          }}
        >
          Swap
        </div>
      </div>
    </>
  );
}

export default Swap;
