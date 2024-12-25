import { createContext } from "react";
import { Token } from "../models/Token";

export interface ITokenContext {
  tokens: Token[];
  tokenLoading: boolean;
  reloadTokens: () => void;
}

export const TokenContext = createContext<ITokenContext | undefined>(undefined);
