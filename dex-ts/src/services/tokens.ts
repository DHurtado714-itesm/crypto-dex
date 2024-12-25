import axios from "axios";

export async function getTokenPrices(one: string, two: string) {
  const res = await axios.get("http://localhost:3001/tokenPrice", {
    params: { addressOne: one, addressTwo: two },
  });

  console.log(res.data);

  return res.data;
}
