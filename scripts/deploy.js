// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const addr1 = 0x00;
  const addr2 = 0x00;
  const addr3 = 0x00;
  const unrevealedUri = "";
  const baseUri = "";

  const Booty = await hre.ethers.getContractFactory("BootyPix");
  const booty = await Booty.deploy(baseUri, unrevealedUri, [addr1, addr2, addr3], [50, 25, 25]);

  await booty.deployed();

  console.log(
    `BootyPix contract deployed to ${booty.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
