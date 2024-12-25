import axios from "axios";
import { Token } from "../models/Token";

export async function getTokenPrices(one: string, two: string) {
  const res = await axios.get("http://localhost:3001/token/price", {
    params: { addressOne: one, addressTwo: two },
  });

  return res.data;
}

export async function getTokenList(): Promise<Token[]> {
  try {
    const response = await axios.get("http://localhost:3001/token/list");

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.error("Unexpected data structure:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch tokens:", error);
    return [];
  }
}
