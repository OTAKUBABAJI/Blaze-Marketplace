const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let deployer, user1, user2, feeRecipient, blaze, marketplace;

  beforeEach(async () => {
    [deployer, user1, user2, feeRecipient] = await ethers.getSigners();

    // Deploy Blaze NFT
    const Blaze = await ethers.getContractFactory("Blaze");
    blaze = await Blaze.deploy("ipfs://base/", ethers.parseEther("0.01"));
    await blaze.waitForDeployment();

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(feeRecipient.address, 250); // 2.5% fee
    await marketplace.waitForDeployment();

    // Mint NFT for user1 (with URI, required in new Blaze)
    await blaze.connect(user1).mint("ipfs://token1.json", { value: ethers.parseEther("0.01") });

    // Approve marketplace
    await blaze.connect(user1).approve(marketplace.target, 1);
  });

  it("seller can list an NFT", async () => {
    await marketplace.connect(user1).createListing(blaze.target, 1, ethers.parseEther("0.1"));

    const listing = await marketplace.getListing(blaze.target, 1);
    expect(listing.active).to.equal(true);
    expect(listing.seller).to.equal(user1.address);
    expect(listing.price).to.equal(ethers.parseEther("0.1"));
  });

  it("seller can cancel listing", async () => {
    await marketplace.connect(user1).createListing(blaze.target, 1, ethers.parseEther("0.1"));
    await marketplace.connect(user1).cancelListing(blaze.target, 1);

    const listing = await marketplace.getListing(blaze.target, 1);
    expect(listing.active).to.equal(false);
    expect(await blaze.ownerOf(1)).to.equal(user1.address);
  });

  it("buyer can purchase a listed NFT", async () => {
    await marketplace.connect(user1).createListing(blaze.target, 1, ethers.parseEther("0.1"));

    await marketplace.connect(user2).buy(blaze.target, 1, { value: ethers.parseEther("0.1") });

    const listing = await marketplace.getListing(blaze.target, 1);
    expect(listing.active).to.equal(false);
    expect(await blaze.ownerOf(1)).to.equal(user2.address);
  });

  it("seller can withdraw proceeds after sale", async () => {
    await marketplace.connect(user1).createListing(blaze.target, 1, ethers.parseEther("0.1"));

    await marketplace.connect(user2).buy(blaze.target, 1, { value: ethers.parseEther("0.1") });

    const proceedsBefore = await marketplace.getProceeds(user1.address);
    expect(proceedsBefore).to.be.closeTo(ethers.parseEther("0.0975"), ethers.parseEther("0.0001")); // 2.5% fee taken

    const tx = await marketplace.connect(user1).withdrawProceeds();
    await tx.wait();

    const proceedsAfter = await marketplace.getProceeds(user1.address);
    expect(proceedsAfter).to.equal(0);
  });

  it("owner can update fee settings", async () => {
    await marketplace.setFee(500, deployer.address); // change to 5% fee

    const tx = await marketplace.feeBps();
    const recipient = await marketplace.feeRecipient();

    expect(tx).to.equal(500);
    expect(recipient).to.equal(deployer.address);
  });
});
