/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import React, { useState } from "react";
import { slideUp } from "../animations/slideUp";

export default function NFTCard({ 
  image = "/placeholder.png", 
  name = "NFT", 
  price = "0.01 ETH",
  seller = "0x...",
  onBuy,
  onLike,
  isLiked = false,
  isLoading = false
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div 
      variants={slideUp()} 
      className="nft-card" 
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="nft-image-container">
        {isLoading ? (
          <div className="nft-image-skeleton"></div>
        ) : imageError ? (
          <div className="nft-image-placeholder">
            <span className="nft-placeholder-icon">🔥</span>
          </div>
        ) : (
          <img 
            src={image} 
            alt={name} 
            className="nft-image"
            onError={() => setImageError(true)}
          />
        )}
        <div className="nft-overlay">
          <motion.button 
            className="nft-like-btn"
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isLiked ? "❤️" : "🤍"}
          </motion.button>
        </div>
      </div>
      
      <div className="nft-body">
        <div className="nft-header">
          <h3 className="nft-name">{name}</h3>
          <div className="nft-price">{price}</div>
        </div>
        
        <div className="nft-seller">
          <span className="nft-seller-label">Seller:</span>
          <span className="nft-seller-address">{seller}</span>
        </div>
        
        <div className="nft-actions">
          <motion.button 
            className="nft-buy-btn"
            onClick={(e) => {
              e.stopPropagation();
              onBuy?.();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Buy Now"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}