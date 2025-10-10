/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useContractRead, useWriteContract, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { marketplaceConfig, blazeConfig } from "../config/contracts";
import MotionWrapper from "../components/MotionWrapper";
import NFTCard from "../components/NFTCard";
import { slideUp, fadeIn } from "../animations/slideUp";
import { staggerList } from "../animations/staggerList";

export default function Marketplace() {
  const { isConnected, address } = useAccount();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("price");
  const { writeContract } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const [buyingTokenId, setBuyingTokenId] = useState(null);
  const [buyError, setBuyError] = useState(null);

  // Get total supply to check for NFTs
  const { data: totalSupply } = useContractRead({
    address: blazeConfig.address,
    abi: blazeConfig.abi,
    functionName: "totalSupply",
  });

  // Get all NFTs and their listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      
      try {
        // For demo purposes, create some sample listings
        const sampleListings = [
          {
            tokenId: 1,
            seller: "0x1234...5678",
            price: "10000000000000000", // 0.01 ETH in wei
            active: true,
            name: "Blaze #1",
            image: "/placeholder.png"
          },
          {
            tokenId: 2,
            seller: "0x8765...4321",
            price: "15000000000000000", // 0.015 ETH in wei
            active: true,
            name: "Blaze #2",
            image: "/placeholder.png"
          },
          {
            tokenId: 3,
            seller: "0x1111...2222",
            price: "20000000000000000", // 0.02 ETH in wei
            active: true,
            name: "Blaze #3",
            image: "/placeholder.png"
          }
        ];

        setListings(sampleListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleBuy = async (tokenId, price) => {
    try {
      setBuyError(null);
      setBuyingTokenId(tokenId);
      try { switchChain?.({ chainId: sepolia.id }); } catch (e) { console.warn("switchChain warn:", e); }
      const txHash = await writeContract({
        address: marketplaceConfig.address,
        abi: marketplaceConfig.abi,
        functionName: "buy",
        args: [blazeConfig.address, tokenId],
        value: BigInt(price),
        chainId: sepolia.id
      });
      console.log("Buy tx hash:", txHash);
    } catch (e) {
      console.error("Buy failed:", e);
      setBuyError(e?.shortMessage || e?.message || String(e));
    } finally {
      setBuyingTokenId(null);
    }
  };

  const handleLike = (tokenId) => {
    // Implement like functionality
    console.log("Liked token:", tokenId);
  };

  // Filter and sort listings
  const filteredListings = listings.filter(listing => {
    if (filter === "active") return listing.active;
    if (filter === "my-listings") return listing.seller === address;
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === "price") return Number(a.price) - Number(b.price);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <MotionWrapper>
      <motion.div 
        variants={slideUp()}
        initial="hidden"
        animate="show"
      >
        <h2 className="page-heading">Marketplace</h2>
        <p className="page-subtitle">Discover and trade unique NFTs</p>
      </motion.div>

      {!isConnected ? (
        <motion.div 
          className="empty-state"
          variants={fadeIn("up", 0.1)}
          initial="hidden"
          animate="show"
        >
          <div className="empty-icon">🔌</div>
          <h3>Connect Your Wallet</h3>
          <p>Please connect your wallet to view and trade NFTs</p>
        </motion.div>
      ) : (
        <>
          {/* Filters and Search */}
          <motion.div 
            className="marketplace-controls"
            variants={slideUp(0.1)}
            initial="hidden"
            animate="show"
          >
            <div className="filter-group">
              <label>Filter:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All NFTs</option>
                <option value="active">Active Listings</option>
                <option value="my-listings">My Listings</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
            </div>
          </motion.div>

          {/* Listings Grid */}
          {loading ? (
            <motion.div 
              className="listings-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              variants={staggerList}
              initial="hidden"
              animate="show"
            >
              {[...Array(6)].map((_, i) => (
                <NFTCard 
                  key={i}
                  isLoading={true}
                  name="Loading..."
                  price="0 ETH"
                />
              ))}
            </motion.div>
          ) : sortedListings.length === 0 ? (
            <motion.div 
              className="empty-state"
              variants={fadeIn("up", 0.1)}
              initial="hidden"
              animate="show"
            >
              <div className="empty-icon">🔍</div>
              <h3>No NFTs Found</h3>
              <p>No listings match your current filters</p>
            </motion.div>
          ) : (
            <motion.div 
              className="listings-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              variants={staggerList}
              initial="hidden"
              animate="show"
            >
              {sortedListings.map((listing, i) => (
                <NFTCard
                  key={listing.tokenId || i}
                  name={listing.name}
                  price={`${(Number(listing.price) / 1e18).toFixed(4)} ETH`}
                  seller={listing.seller}
                  image={listing.image}
                  onBuy={() => handleBuy(listing.tokenId, listing.price)}
                  onLike={() => handleLike(listing.tokenId)}
                  isLiked={false}
                  isLoading={buyingTokenId === listing.tokenId}
                />
              ))}
            </motion.div>
          )}

          {/* Stats */}
          <motion.div 
            className="marketplace-stats"
            variants={fadeIn("up", 0.2)}
            initial="hidden"
            animate="show"
          >
            <div className="stat-item">
              <span className="stat-label">Total NFTs:</span>
              <span className="stat-value">{totalSupply?.toString() || "0"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Listings:</span>
              <span className="stat-value">{filteredListings.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Floor Price:</span>
              <span className="stat-value">0.01 ETH</span>
            </div>
          </motion.div>
          {buyError && (
            <div className="error-message" style={{ marginTop: 12 }}>
              <strong>Transaction failed:</strong> {String(buyError)}
            </div>
          )}
        </>
      )}
    </MotionWrapper>
  );
}