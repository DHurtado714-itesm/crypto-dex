import { useContext } from "react";
import { ITokenContext, TokenContext } from "../context/TokenContext";

export const useTokenContext = (): ITokenContext => {
  const context = useContext(TokenContext);

  if (!context) {
    throw new Error("useTokenContext must be used within a TokenProvider");
  }

  return context;
};
