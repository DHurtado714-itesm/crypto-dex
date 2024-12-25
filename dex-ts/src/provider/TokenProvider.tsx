import { useState, useCallback, useEffect } from "react";
import { TokenContext } from "../context/TokenContext";
import { Token } from "../models/Token";
import { getTokenList } from "../services/tokens";

interface ITokenProviderProps {
  children: React.ReactNode;
}

export const TokenProvider = ({ children }: ITokenProviderProps) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokenLoading, setTokenLoading] = useState<boolean>(false);

  const handleGetTokens = useCallback(async () => {
    setTokenLoading(true);
    try {
      const data = await getTokenList();

      if (data && Array.isArray(data) && data.length > 0) {
        setTokens(data);
      } else {
        console.error("Fetched data is empty or not an array:", data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTokenLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetTokens();
  }, [handleGetTokens]);

  useEffect(() => {
    console.log("Tokens updated in state:", tokens);
  }, [tokens]);

  return (
    <TokenContext.Provider
      value={{ tokens, tokenLoading, reloadTokens: handleGetTokens }}
    >
      {tokenLoading ? <div>Loading...</div> : children}
    </TokenContext.Provider>
  );
};
