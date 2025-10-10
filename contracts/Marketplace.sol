// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract Marketplace is ReentrancyGuard, Ownable, ERC721Holder {
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    // nftContract => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;
    mapping(address => uint256) public proceeds;

    uint256 public feeBps = 250; // 2.5% default fee
    address public feeRecipient;

    event Listed(address indexed nft, uint256 indexed tokenId, address indexed seller, uint256 price);
    event Cancelled(address indexed nft, uint256 indexed tokenId, address indexed seller);
    event Sold(address indexed nft, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event ProceedsWithdrawn(address indexed account, uint256 amount);
    event FeeUpdated(uint256 newBps, address newRecipient);

    constructor(address _feeRecipient, uint256 _feeBps) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        require(_feeBps <= 2000, "Fee too high");
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
    }

    /// @notice List an NFT for sale
    function createListing(address nft, uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price can't be zero");
        require(nft != address(0), "Invalid NFT contract");

        IERC721 token = IERC721(nft);
        require(token.ownerOf(tokenId) == msg.sender, "You are not the owner");

        // Transfer NFT to marketplace
        token.safeTransferFrom(msg.sender, address(this), tokenId);

        listings[nft][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit Listed(nft, tokenId, msg.sender, price);
    }

    /// @notice Cancel an NFT listing
    function cancelListing(address nft, uint256 tokenId) external nonReentrant {
        Listing storage l = listings[nft][tokenId];
        require(l.active, "NFT is not listed");
        require(l.seller == msg.sender || msg.sender == owner(), "Not authorized");

        l.active = false;

        IERC721(nft).safeTransferFrom(address(this), l.seller, tokenId);

        emit Cancelled(nft, tokenId, l.seller);
    }

    /// @notice Buy a listed NFT
    function buy(address nft, uint256 tokenId) external payable nonReentrant {
        Listing storage l = listings[nft][tokenId];
        require(l.active, "NFT not listed");
        require(msg.value == l.price, "Incorrect ETH sent");

        uint256 price = l.price;
        l.active = false;

        // Fee & seller proceeds
        uint256 fee = (price * feeBps) / 10000;
        uint256 sellerAmount = price - fee;

        proceeds[l.seller] += sellerAmount;
        if (fee > 0) {
            proceeds[feeRecipient] += fee;
        }

        // Transfer NFT to buyer
        IERC721(nft).safeTransferFrom(address(this), msg.sender, tokenId);

        emit Sold(nft, tokenId, msg.sender, price);
    }

    /// @notice Withdraw proceeds from sales
    function withdrawProceeds() external nonReentrant {
        uint256 amount = proceeds[msg.sender];
        require(amount > 0, "No proceeds");
        proceeds[msg.sender] = 0;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Withdraw failed");
        emit ProceedsWithdrawn(msg.sender, amount);
    }

    /// @notice Update marketplace fee
    function setFee(uint256 newBps, address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        require(newBps <= 2000, "Fee too high");
        feeBps = newBps;
        feeRecipient = newRecipient;
        emit FeeUpdated(newBps, newRecipient);
    }

    /// @notice Get listing info
    function getListing(address nft, uint256 tokenId) external view returns (Listing memory) {
        return listings[nft][tokenId];
    }

    /// @notice Get user proceeds
    function getProceeds(address account) external view returns (uint256) {
        return proceeds[account];
    }

    receive() external payable {}
    fallback() external payable {}
}
