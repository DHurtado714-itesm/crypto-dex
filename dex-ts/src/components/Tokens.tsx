import { useTokenContext } from "../hooks/useTokenContext";
import { Token } from "../models/Token";

function Tokens() {
  const { tokens } = useTokenContext();

  return (
    <div className="tokenBox">
      <div className="tradeBoxHeader">
        <h2>Available Tokens</h2>
      </div>
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
          {tokens.map((token: Token) => (
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
  );
}

export default Tokens;
