import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygon } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { BrowserRouter } from "react-router-dom";
import { TokenProvider } from "./context/TokenContext.tsx";

const { provider, webSocketProvider } = configureChains(
  [polygon],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiConfig client={client}>
      <BrowserRouter>
        <TokenProvider>
          <App />
        </TokenProvider>
      </BrowserRouter>
    </WagmiConfig>
  </StrictMode>
);
