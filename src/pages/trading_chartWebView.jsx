import React from "react";
import TradingChart from "../components/spotTrading/TradingChart";
import { useSearchParams } from "react-router-dom";

const TradingChartWebView = () => {
  // Read ?coin_pair_id=1 from the URL
  const [searchParams] = useSearchParams();
  const coinPairId = searchParams.get("coin_pair_id") || "1";

  // You can pass this to TradingChart as a prop
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <TradingChart selectedCoinPairId={coinPairId} />
    </div>
  );
};

export default TradingChartWebView;
