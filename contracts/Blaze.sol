// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title Blaze — simple ERC721 for my portfolio
/// @notice Minting is owner-only by default via ownerMint(), but public mint() allows anyone with a mint price.
/// @dev Users can now provide their own metadata URI on mint. Base URI still works for owner mints if needed.
contract Blaze is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId = 1;
    string private _baseTokenURI;
    uint256 public mintPrice;

    // Store per-token URIs if user sets them
    mapping(uint256 => string) private _tokenURIs;

    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event BaseURIUpdated(string newBaseURI);
    event MintPriceUpdated(uint256 newPrice);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(string memory baseURI_, uint256 initialMintPrice)
        ERC721("Blaze", "BLZ")
        Ownable(msg.sender) // OZ v5 requires initialOwner
    {
        _baseTokenURI = baseURI_;
        mintPrice = initialMintPrice;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Public mint with custom metadata URI
    function mint(string calldata tokenURI_) external payable returns (uint256 tokenId) {
        require(msg.value >= mintPrice, "Insufficient ETH for mint");
        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        // save metadata URI
        _tokenURIs[tokenId] = tokenURI_;

        emit Minted(msg.sender, tokenId, tokenURI_);

        uint256 over = msg.value - mintPrice;
        if (over > 0) {
            (bool ok, ) = payable(msg.sender).call{value: over}("");
            require(ok, "refund failed");
        }
    }

    /// @notice Owner mint (with optional URI, can fallback to baseURI)
    function ownerMint(address to, string calldata tokenURI_) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = tokenURI_;
        emit Minted(to, tokenId, tokenURI_);
    }

    /// @notice Override tokenURI to return per-token URI if set; otherwise fallback to baseURI + id
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_ownerOf(tokenId) != address(0), "Nonexistent token");

    string memory customURI = _tokenURIs[tokenId];
    if (bytes(customURI).length > 0) {
        return customURI;
    }

    // fallback: base + id
    return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
}


    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    function withdraw() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No balance");
        (bool ok, ) = payable(owner()).call{value: bal}("");
        require(ok, "withdraw failed");
        emit Withdrawn(owner(), bal);
    }

    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    receive() external payable {}
    fallback() external payable {}
}
