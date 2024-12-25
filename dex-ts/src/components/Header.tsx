import Logo from "../assets/logo.svg";
import Polygon from "../assets/polygon.svg";
import { Link } from "react-router-dom";

interface IHeaderProps {
  isConnected: boolean;
  address?: string;
  connect: () => void;
}

function Header({ connect, isConnected, address }: IHeaderProps) {
  return (
    <header>
      <div className="leftH">
        <img src={Logo} alt="logo" className="logo"></img>
        <Link to="/" className="link">
          <div className="headerItem">Swap</div>
        </Link>
        <Link to="/tokens" className="link">
          <div className="headerItem">Tokens</div>
        </Link>
      </div>
      <div className="rightH">
        <div className="headerItem">
          <img src={Polygon} alt="eth" className="eth" />
          Polygon
        </div>
        <div className="connectButton" onClick={connect}>
          {isConnected && address
            ? address.slice(0, 4) + "..." + address.slice(38)
            : "Connect"}
        </div>{" "}
      </div>
    </header>
  );
}

export default Header;
