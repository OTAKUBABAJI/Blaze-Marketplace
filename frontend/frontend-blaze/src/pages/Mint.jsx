/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useAccount, useWriteContract, useContractRead, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { motion } from "framer-motion";
import { blazeConfig } from "../config/contracts";
import MotionWrapper from "../components/MotionWrapper";
import { slideUp, fadeIn } from "../animations/slideUp";
import { uploadImageAndMetadata } from "../config/ipfs";

export default function Mint() {
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uri, setUri] = useState("");
  const [mintSuccess, setMintSuccess] = useState(false);

  // Get mint price from contract
  const { data: mintPrice } = useContractRead({
    address: blazeConfig.address,
    abi: blazeConfig.abi,
    functionName: "mintPrice",
  });

  const { writeContract } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMint = async () => {
    try {
      // Instrumentation
      const hasToken = !!import.meta.env.VITE_PINATA_JWT;
      console.log("Mint clicked. Has Pinata JWT:", hasToken, "file:", !!file);
      if (!hasToken) {
        alert("VITE_PINATA_JWT is missing. Add it to .env and restart dev server.");
        return;
      }

      // Basic wallet & network checks
      if (!(window?.ethereum)) {
        alert("No Ethereum provider found. Please install MetaMask.");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }).catch(() => []);
      if (!accounts || accounts.length === 0) {
        alert("Please connect your wallet in MetaMask.");
        return;
      }
      // Ensure Sepolia
      try { switchChain?.({ chainId: sepolia.id }); } catch (switchErr) { console.warn("Network switch warning:", switchErr); }

      // Prefer uploading the selected file (ensures POST is sent) if present
      if (file) {
        if (!name.trim()) return alert("Please enter a name");
        setUploading(true);
        console.log("Starting upload to Pinata...");
        const { imageCid, imageUri, metadataCid, metadataUri } = await uploadImageAndMetadata({ file, name: name.trim(), description });
        console.log("Pinata upload complete:", { imageCid, imageUri, metadataCid, metadataUri });
        console.log("Preparing to call mint with:", { metadataUri });
        setUri(metadataUri);
        setIsLoading(true);
        const valueWei = (typeof mintPrice === "bigint" && mintPrice > 0n)
          ? mintPrice
          : 10000000000000000n; // 0.01 ETH fallback
        console.log("Calling contract.mint with value:", valueWei.toString());
        try {
          const txHash = await writeContract({
            address: blazeConfig.address,
            abi: blazeConfig.abi,
            functionName: "mint",
            args: [metadataUri],
            value: valueWei,
            chainId: sepolia.id
          });
          console.log("Mint tx hash:", txHash);
          setMintSuccess(true);
          setUri("");
          setName("");
          setDescription("");
          setFile(null);
          setTimeout(() => setMintSuccess(false), 5000);
        } catch (e) {
          console.error("Mint write failed:", e);
          setError(e);
          alert(`Mint transaction failed: ${e?.shortMessage || e?.message || e}`);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Otherwise, mint directly with provided URI
      if (uri.trim()) {
        console.log("Minting directly with provided URI:", uri.trim());
        setIsLoading(true);
        const valueWei = (typeof mintPrice === "bigint" && mintPrice > 0n)
          ? mintPrice
          : 10000000000000000n;
        try {
          const txHash = await writeContract({
            address: blazeConfig.address,
            abi: blazeConfig.abi,
            functionName: "mint",
            args: [uri.trim()],
            value: valueWei,
            chainId: sepolia.id
          });
          console.log("Mint tx hash:", txHash);
          setMintSuccess(true);
          setTimeout(() => setMintSuccess(false), 5000);
        } catch (e) {
          console.error("Mint write failed:", e);
          setError(e);
          alert(`Mint transaction failed: ${e?.shortMessage || e?.message || e}`);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      alert("Please select an image file or provide a metadata URI");
    } catch (e) {
      console.error("Upload/Mint failed", e);
      alert(`Upload/Mint failed: ${e?.message || e}`);
    } finally {
      setUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <MotionWrapper>
        <motion.div 
          className="empty-state"
          variants={fadeIn("up", 0.1)}
          initial="hidden"
          animate="show"
        >
          <div className="empty-icon">🔌</div>
          <h3>Connect Your Wallet</h3>
          <p>Please connect your wallet to mint NFTs</p>
        </motion.div>
      </MotionWrapper>
    );
  }

  return (
    <MotionWrapper>
      <motion.div variants={slideUp()} initial="hidden" animate="show">
        <h2 className="page-heading">Mint NFT</h2>
        <p className="page-subtitle">Create your unique digital collectible</p>
        {!import.meta.env.VITE_PINATA_JWT && (
          <p className="error" style={{marginTop: "0.5rem"}}>
            Pinata JWT missing. Set VITE_PINATA_JWT in .env to enable uploads.
          </p>
        )}
      </motion.div>

      <motion.div 
        className="mint-form"
        variants={slideUp(0.1)}
        initial="hidden"
        animate="show"
      >
        <div className="form-group">
          <label className="form-label" htmlFor="image">Upload Image</label>
          <input id="image" type="file" accept="image/*" className="input" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <p className="form-help">We will upload the image + JSON to IPFS for you</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="name">Name</label>
          <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Blaze #1" />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="desc">Description</label>
          <input id="desc" className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A blazing hot NFT" />
        </div>

        <div className="form-group">
          <label htmlFor="uri" className="form-label">Or paste metadata URI (optional)</label>
          <input
            id="uri"
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="ipfs://... (if you have your own)"
            className="input"
          />
          <p className="form-help">Leave empty to auto-upload and mint like OpenSea</p>
        </div>

        <motion.button
          onClick={handleMint}
          disabled={isLoading || uploading || (!uri.trim() && !file)}
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {uploading ? "Uploading..." : (isLoading ? "Minting..." : `Mint NFT (${mintPrice ? `${(Number(mintPrice) / 1e18).toFixed(4)} ETH` : "0.01 ETH"})`)}
        </motion.button>

        {mintSuccess && (
          <motion.div 
            className="success-message"
            variants={fadeIn("up", 0.1)}
            initial="hidden"
            animate="show"
          >
            <div className="success-icon">✅</div>
            <h3>NFT Minted Successfully!</h3>
            <p>Your NFT has been minted and added to your collection</p>
          </motion.div>
        )}

        {error && (
          <motion.div 
            className="error-message"
            variants={fadeIn("up", 0.1)}
            initial="hidden"
            animate="show"
          >
            <div className="error-icon">❌</div>
            <h3>Minting Failed</h3>
            <p>Error: {String(error?.message ?? error)}</p>
          </motion.div>
        )}
      </motion.div>
    </MotionWrapper>
  );
}