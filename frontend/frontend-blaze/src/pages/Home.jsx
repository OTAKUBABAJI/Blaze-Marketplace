/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useAccount, useContractRead } from "wagmi";
import { blazeConfig } from "../config/contracts";
import MotionWrapper from "../components/MotionWrapper";
import { slideUp, fadeIn } from "../animations/slideUp";
import { staggerList } from "../animations/staggerList";

export default function Home() {
  const { isConnected } = useAccount();
  
  // Get contract stats
  const { data: totalSupply } = useContractRead({
    address: blazeConfig.address,
    abi: blazeConfig.abi,
    functionName: "totalSupply",
  });

  const { data: mintPrice } = useContractRead({
    address: blazeConfig.address,
    abi: blazeConfig.abi,
    functionName: "mintPrice",
  });

  return (
    <MotionWrapper>
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-content"
          variants={slideUp()}
          initial="hidden"
          animate="show"
        >
          <h1 className="hero-title">
            Discover, Create & Trade
            <span className="gradient-text"> Unique NFTs</span>
          </h1>
          <p className="hero-subtitle">
            The ultimate marketplace for digital collectibles on Ethereum Sepolia. 
            Mint, buy, and sell NFTs with ease.
          </p>
          <div className="hero-actions">
            <motion.button 
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Trading
            </motion.button>
            <motion.button 
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div 
          className="hero-visual"
          variants={slideUp(0.2)}
          initial="hidden"
          animate="show"
        >
          <div className="nft-showcase">
            <div className="nft-card-hero">
              <div className="nft-image-placeholder"></div>
              <div className="nft-info">
                <h3>Blaze #1</h3>
                <p>0.01 ETH</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <motion.div 
          className="stats-grid"
          variants={staggerList}
          initial="hidden"
          animate="show"
        >
          <motion.div className="stat-card" variants={fadeIn("up", 0.1)}>
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>{totalSupply?.toString() || "0"}</h3>
              <p>Total NFTs</p>
            </div>
          </motion.div>
          
          <motion.div className="stat-card" variants={fadeIn("up", 0.2)}>
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{mintPrice ? `${(Number(mintPrice) / 1e18).toFixed(4)} ETH` : "0.01 ETH"}</h3>
              <p>Mint Price</p>
            </div>
          </motion.div>
          
          <motion.div className="stat-card" variants={fadeIn("up", 0.3)}>
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>1.2K+</h3>
              <p>Active Users</p>
            </div>
          </motion.div>
          
          <motion.div className="stat-card" variants={fadeIn("up", 0.4)}>
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>99.9%</h3>
              <p>Uptime</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <motion.h2 
          className="section-title"
          variants={slideUp()}
          initial="hidden"
          animate="show"
        >
          Why Choose Blaze?
        </motion.h2>
        
        <motion.div 
          className="features-grid"
          variants={staggerList}
          initial="hidden"
          animate="show"
        >
          <motion.div className="feature-card" variants={fadeIn("up", 0.1)}>
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Instant transactions with low gas fees on Sepolia testnet</p>
          </motion.div>
          
          <motion.div className="feature-card" variants={fadeIn("up", 0.2)}>
            <div className="feature-icon">🔒</div>
            <h3>Secure & Trusted</h3>
            <p>Built with OpenZeppelin standards and audited smart contracts</p>
          </motion.div>
          
          <motion.div className="feature-card" variants={fadeIn("up", 0.3)}>
            <div className="feature-icon">🎨</div>
            <h3>Custom Metadata</h3>
            <p>Mint NFTs with your own IPFS metadata and unique properties</p>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      {isConnected && (
        <motion.section 
          className="cta-section"
          variants={slideUp()}
          initial="hidden"
          animate="show"
        >
          <h2>Ready to Start Trading?</h2>
          <p>Connect your wallet and explore the marketplace</p>
          <motion.button 
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/marketplace'}
          >
            Explore Marketplace
          </motion.button>
        </motion.section>
      )}
    </MotionWrapper>
  );
}