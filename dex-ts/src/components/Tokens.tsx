import { useState } from "react";
import { useTokenContext } from "../hooks/useTokenContext";
import { Token } from "../models/Token";
import SearchBar from "./common/SearchBar";

function Tokens() {
  const { tokens } = useTokenContext();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = tokens?.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tokenBox">
      <div
        className="tradeBoxHeader"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Available Tokens on Polygon</h2>
        <div style={{ width: "300px" }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tokens..."
          />
        </div>
      </div>
      <div className="tableWrapper">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>Token</th>
              <th>Name</th>
              <th>Ticker</th>
              <th>Address</th>
              <th>Decimals</th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens?.map((token: Token) => (
              <tr key={token.address}>
                <td>
                  <img
                    src={token.img}
                    alt={token.ticker}
                    className="tokenIcon"
                  />
                </td>
                <td>{token.name}</td>
                <td className="muted">{token.ticker}</td>
                <td className="address muted">{token.address}</td>
                <td className="muted">{token.decimals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Tokens;
