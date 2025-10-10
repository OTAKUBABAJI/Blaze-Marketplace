Blaze NFT Marketplace

Blaze is a fast, modern NFT dApp built for creators and collectors. You can connect your wallet, mint your own NFTs (complete with images and metadata stored on IPFS via Pinata), and explore a clean marketplace — all running smoothly on the Sepolia testnet. It’s simple to set up, quick to use, and designed for developers who want to learn or showcase NFT minting and trading.

=> What You Can Do

Connect your wallet with MetaMask using RainbowKit + wagmi

Mint NFTs — upload an image, auto-generate metadata, and mint it directly to the blockchain

Explore the marketplace — browse NFTs and simulate buy/sell transactions

Enjoy a smooth UI with animations, responsiveness, and a clean layout

=> Tech Stack

Frontend: React + Vite, wagmi v2, RainbowKit, Framer Motion, and custom CSS

Smart Contracts: Solidity + OpenZeppelin (ERC-721) with Hardhat

IPFS: Pinata (JWT authentication)

=> Project Structure
contracts/             # Blaze.sol (ERC-721) and Marketplace.sol
frontend/frontend-blaze/ # React frontend (Vite + wagmi + RainbowKit)
scripts/               # Hardhat deployment scripts
test/                  # Hardhat test files

=> Prerequisites

Node.js 18 or newer

MetaMask browser extension

Sepolia test ETH

A Pinata JWT (free account works perfectly)

=> Setup (Frontend)

Create a .env file inside frontend/frontend-blaze/

Add your environment variables, including your Pinata JWT

Run the app using your preferred package manager (npm run dev or yarn dev)

=> Minting Flow (How It Works)

Connect your wallet from the top-right corner.

Head to Mint, upload your image, and enter a name + description.

The app uploads your image and metadata JSON to IPFS using Pinata.

It then calls mint(ipfs://<metadata_cid>) on Blaze.sol with the current mint price.

Confirm the MetaMask transaction prompt to mint your NFT.

Visit the Marketplace page to view your NFT and try the buy flow.

=> Contracts Overview
Blaze.sol

Implements ERC-721

mint(string tokenURI_) function with a configurable mint price

setMintPrice, setBaseURI, and withdraw functions for admin

Optional base URI for owner mints

Marketplace.sol

Simple list, cancel, and buy functions

Built-in fee and proceeds tracking

Uses ERC721Holder for safe transfers

=> Common Issues

No MetaMask prompt?
Check you’re on Sepolia, your wallet is connected, and you have enough test ETH.

IPFS upload failing?
Make sure VITE_PINATA_JWT is valid and restart the dev server after editing .env.

Testing locally?
You can mock IPFS uploads by setting VITE_USE_MOCK_IPFS=true.

=>Roadmap Ideas

Real marketplace listings via events or subgraph

Profile page showing owned NFTs

Batch minting and royalty support

Collection-level customization

Dark/light mode toggle

=> License

MIT — Free to use, modify, and share.

If you run into any issues, feel free to open an issue or reach out.
Happy minting