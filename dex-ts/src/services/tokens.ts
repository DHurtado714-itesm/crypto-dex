import axios from "axios";
import { Token } from "../models/Token";

export async function getTokenPrices(one: string, two: string) {
  const res = await axios.get("http://localhost:3001/tokenPrice", {
    params: { addressOne: one, addressTwo: two },
  });

  console.log(res.data);

  return res.data;
}

export async function getTokenList(): Promise<Token[]> {
  const res = await axios.get("http://localhost:3001/token/list");

  return res.data.data;
}
