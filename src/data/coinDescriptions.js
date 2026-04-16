const coinDescriptions = {
  BTC: {
    name: "Bitcoin",
    desc: "Bitcoin is the first and most well-known cryptocurrency, created in 2009 by the pseudonymous Satoshi Nakamoto. It operates on a decentralized peer-to-peer network using blockchain technology, enabling secure, transparent transactions without intermediaries. Bitcoin has a fixed supply of 21 million coins, making it a deflationary digital asset often compared to digital gold.",
    website: "https://bitcoin.org",
    launched: "2009",
    maxSupply: "21,000,000",
  },
  ETH: {
    name: "Ethereum",
    desc: "Ethereum is a decentralized blockchain platform that enables smart contracts and decentralized applications (dApps). Created by Vitalik Buterin in 2015, it introduced programmable blockchain functionality. Ethereum transitioned to Proof of Stake with 'The Merge' in 2022, significantly reducing energy consumption. ETH is used for transaction fees (gas) and staking.",
    website: "https://ethereum.org",
    launched: "2015",
    maxSupply: "Unlimited",
  },
  USDT: {
    name: "Tether",
    desc: "Tether (USDT) is the largest stablecoin by market capitalization, pegged 1:1 to the US dollar. It provides traders with a stable store of value within the crypto ecosystem, enabling quick transfers between exchanges without converting to fiat currency. USDT is available on multiple blockchains including Ethereum, Tron, and Solana.",
    website: "https://tether.to",
    launched: "2014",
    maxSupply: "Dynamic",
  },
  USDC: {
    name: "USD Coin",
    desc: "USD Coin (USDC) is a fully-reserved stablecoin pegged to the US dollar, issued by Circle and Coinbase. Each USDC token is backed by $1 held in reserve, with regular attestations by independent accounting firms. USDC is widely used in DeFi, payments, and as a trading pair on exchanges.",
    website: "https://www.circle.com/usdc",
    launched: "2018",
    maxSupply: "Dynamic",
  },
  XRP: {
    name: "XRP",
    desc: "XRP is the native cryptocurrency of the XRP Ledger, designed for fast, low-cost cross-border payments. Created by Ripple Labs, XRP can settle transactions in 3-5 seconds with minimal fees. It is used by financial institutions for liquidity solutions and international money transfers.",
    website: "https://xrpl.org",
    launched: "2012",
    maxSupply: "100,000,000,000",
  },
  SOL: {
    name: "Solana",
    desc: "Solana is a high-performance blockchain known for its speed and low transaction costs. It uses a unique Proof of History consensus mechanism combined with Proof of Stake, enabling thousands of transactions per second. Solana hosts a growing ecosystem of DeFi, NFT, and Web3 applications.",
    website: "https://solana.com",
    launched: "2020",
    maxSupply: "Unlimited",
  },
  ADA: {
    name: "Cardano",
    desc: "Cardano is a proof-of-stake blockchain platform founded by Charles Hoskinson, a co-founder of Ethereum. It emphasizes peer-reviewed research and evidence-based development. Cardano supports smart contracts and aims to provide a more secure and scalable infrastructure for decentralized applications.",
    website: "https://cardano.org",
    launched: "2017",
    maxSupply: "45,000,000,000",
  },
  DOGE: {
    name: "Dogecoin",
    desc: "Dogecoin started as a meme cryptocurrency in 2013 but has grown into a widely recognized digital asset. Based on Litecoin's codebase, it features fast block times and low fees. Dogecoin has a strong community and gained mainstream attention through endorsements from high-profile figures.",
    website: "https://dogecoin.com",
    launched: "2013",
    maxSupply: "Unlimited",
  },
  DOT: {
    name: "Polkadot",
    desc: "Polkadot is a multi-chain blockchain protocol that enables different blockchains to interoperate. Founded by Ethereum co-founder Gavin Wood, it allows for cross-chain transfers of data and assets. Polkadot uses a relay chain and parachains architecture for scalability and specialization.",
    website: "https://polkadot.network",
    launched: "2020",
    maxSupply: "Unlimited",
  },
  AVAX: {
    name: "Avalanche",
    desc: "Avalanche is a fast, low-cost blockchain platform for decentralized applications and custom blockchain networks. It uses a novel consensus protocol that achieves finality in under 2 seconds. Avalanche supports the Ethereum Virtual Machine, making it easy for developers to port Ethereum dApps.",
    website: "https://avax.network",
    launched: "2020",
    maxSupply: "720,000,000",
  },
};

export const getCoinDescription = (symbol) => {
  const upper = (symbol || '').toUpperCase();
  return coinDescriptions[upper] || null;
};

export default coinDescriptions;
