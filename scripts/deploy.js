// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(" Deploying contracts with:", deployer.address);
  console.log(" Initial balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy Blaze NFT (latest version)
  const Blaze = await ethers.getContractFactory("Blaze");
  const blaze = await Blaze.deploy(
    "ipfs://QmBase/",          // baseURI
    ethers.parseEther("0.01")  // mint price
  );
  await blaze.waitForDeployment();
  console.log("Blaze deployed to:", await blaze.getAddress());

  // Deploy Marketplace (latest version)
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    deployer.address,  // feeRecipient
    250                // feeBps (2.5%)
  );
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
