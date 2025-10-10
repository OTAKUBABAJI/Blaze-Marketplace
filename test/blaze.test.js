const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blaze NFT", function () {
  let deployer, user1, user2, Blaze, blaze;

  beforeEach(async () => {
    [deployer, user1, user2] = await ethers.getSigners();

    Blaze = await ethers.getContractFactory("Blaze");
    blaze = await Blaze.deploy("ipfs://base/", ethers.parseEther("0.01"));
    await blaze.waitForDeployment();
  });

  it("should deploy with correct baseURI and mint price", async () => {
    expect(await blaze.nextTokenId()).to.equal(1);
    expect(await blaze.mintPrice()).to.equal(ethers.parseEther("0.01"));
  });

  it("owner can mint to any address with custom URI", async () => {
    await blaze.ownerMint(user1.address, "ipfs://custom/1.json");
    expect(await blaze.ownerOf(1)).to.equal(user1.address);
    expect(await blaze.tokenURI(1)).to.equal("ipfs://custom/1.json");
  });

  it("public mint requires enough ETH", async () => {
    await expect(
      blaze.connect(user1).mint("ipfs://user1/1.json", { value: ethers.parseEther("0.001") })
    ).to.be.revertedWith("Insufficient ETH for mint");

    await blaze.connect(user1).mint("ipfs://user1/1.json", { value: ethers.parseEther("0.01") });
    expect(await blaze.ownerOf(1)).to.equal(user1.address);
    expect(await blaze.tokenURI(1)).to.equal("ipfs://user1/1.json");
  });

  it("public mint refunds overpayment", async () => {
    const balanceBefore = await ethers.provider.getBalance(user1.address);

    const txResponse = await blaze.connect(user1).mint("ipfs://user1/overpay.json", { value: ethers.parseEther("0.05") });
    const receipt = await txResponse.wait();

    const effectiveGasPrice =
      receipt.effectiveGasPrice ?? txResponse.effectiveGasPrice ?? txResponse.gasPrice ?? 0n;
    const gas = receipt.gasUsed * effectiveGasPrice;

    const balanceAfter = await ethers.provider.getBalance(user1.address);

    // balance difference should be close to mint price
    expect(balanceBefore - balanceAfter + gas).to.be.closeTo(
      ethers.parseEther("0.01"),
      ethers.parseEther("0.001")
    );
  });

  it("owner can update baseURI and mint price", async () => {
    await blaze.setBaseURI("ipfs://newbase/");
    await blaze.setMintPrice(ethers.parseEther("0.02"));

    expect(await blaze.mintPrice()).to.equal(ethers.parseEther("0.02"));

    await blaze.ownerMint(user1.address, "");
    // since empty URI was passed, it falls back to base + id
    expect(await blaze.tokenURI(1)).to.equal("ipfs://newbase/1");
  });

  it("owner can withdraw ETH", async () => {
    await blaze.connect(user1).mint("ipfs://user1/pay.json", { value: ethers.parseEther("0.01") });

    const balBefore = await ethers.provider.getBalance(deployer.address);

    const txResponse = await blaze.withdraw();
    const receipt = await txResponse.wait();

    const effectiveGasPrice =
      receipt.effectiveGasPrice ?? txResponse.effectiveGasPrice ?? txResponse.gasPrice ?? 0n;
    const gas = receipt.gasUsed * effectiveGasPrice;

    const balAfter = await ethers.provider.getBalance(deployer.address);

    expect(balAfter).to.equal(balBefore + ethers.parseEther("0.01") - gas);
  });
});
