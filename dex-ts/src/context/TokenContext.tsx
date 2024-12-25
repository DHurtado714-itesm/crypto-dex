import React, { createContext, useCallback, useEffect, useState } from "react";
import { Token } from "../models/Token";
import { getTokenList } from "../services/tokens";

export interface ITokenContext {
  tokens: Token[];
  tokenLoading: boolean;
  reloadTokens: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TokenContext = createContext<ITokenContext | undefined>(undefined);

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

      setTokens(data);
    } catch (error) {
      console.error(error);
    } finally {
      setTokenLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetTokens();
  }, [handleGetTokens]);

  return (
    <TokenContext.Provider
      value={{ tokens, tokenLoading, reloadTokens: handleGetTokens }}
    >
      {tokenLoading ? <div>Loading...</div> : children}
    </TokenContext.Provider>
  );
};
