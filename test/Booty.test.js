require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");



// "address": "0x382387bd1953dC4F2a1324b3cC7fAFc8E0c774aF"
// "proof": ['0x0c4e5ed11720453de5a7c9d2a54fb9a810ce8a57ed9f35847cbfd1bbb64c4ed5', '0x674952d3a023122d830819d1d6ed9bb968b5ed7541b267ce92a25e5ccee257a0', '0xcaaf730a4cc31a7dd34b413f682b41c7c139fa2fc908a7d8822288f33208ade0']


// "address": "0x4eb173b2A73875921FaCbf9e048C4B71Ec8C8818"
// "proof":   ['0xc280481c71cc0d7a64989f95ea0f192dac9db2eca13f929d9177b8aa2dceeda6', '0x91c7527e7f4ecab8b83cebf976ab3c6df06e179c0b7e21e50bdec6fc36c4efee', '0xcaaf730a4cc31a7dd34b413f682b41c7c139fa2fc908a7d8822288f33208ade0']


// "address": "0x162664FaeFa35e253d46c0B92aA0fd92f8DF452a"
// "proof":  ['0xd2b4f36138891075f92c7cff0c4380201806c9e07c39aa766f7845d3e71be883']


// "address": "0x2b7970BD023CA7E25068ccE9742531c8225CcF32"
// "proof":   ['0x2d4f92b511104f24f5ffc453cb13029156eaf189ead2b7e8a74a0949bd09cfb2', '0x674952d3a023122d830819d1d6ed9bb968b5ed7541b267ce92a25e5ccee257a0', '0xcaaf730a4cc31a7dd34b413f682b41c7c139fa2fc908a7d8822288f33208ade0']


// "address": "0xf2689f8D42A9Fa8381F331512aE95c4aa8202935"
// "proof": ['0x75206d366d2853fb63bef1bfe523e5daa74da7525f982950124f92931a0ac960', '0x91c7527e7f4ecab8b83cebf976ab3c6df06e179c0b7e21e50bdec6fc36c4efee', '0xcaaf730a4cc31a7dd34b413f682b41c7c139fa2fc908a7d8822288f33208ade0']

//root : 93d6aaa55d823f34fbdd20c65ca0d5b346df34c332cd813025b65bb4462d30dc



describe("Bootypix", function () {

  before(async function () {
    const [
      owner,
      shareHolder1,
      shareHolder2,
      shareHolder3,
      acc1,
      acc2,
      bank
    ] = await ethers.getSigners();

    const baseURI =  "https://ipfs.io/ipfs/QmY7LBuaHukdmwSrrLqR1b5q4RnRcGW5PCjNc89XPAc3U9/" ;
    const nonRevealURI = "https://ipfs.io/ipfs/QmNxLnbYt5UHD6URWTo8CaeqggLHf8MvWW8n7tDHHHkDTa/";

    const WL1 = await ethers.getImpersonatedSigner("0x382387bd1953dC4F2a1324b3cC7fAFc8E0c774aF");
    const WL2 = await ethers.getImpersonatedSigner("0x4eb173b2A73875921FaCbf9e048C4B71Ec8C8818");
    const WL3 = await ethers.getImpersonatedSigner("0x162664FaeFa35e253d46c0B92aA0fd92f8DF452a");
    const WL4 = await ethers.getImpersonatedSigner("0x2b7970BD023CA7E25068ccE9742531c8225CcF32");
    const merkleRoot = "0x93d6aaa55d823f34fbdd20c65ca0d5b346df34c332cd813025b65bb4462d30dc";

    global.owner = owner;
    global.shareHolder1 = shareHolder1;
    global.shareHolder2 = shareHolder2;
    global.shareHolder3 = shareHolder3;
    global.WL1 = WL1;
    global.WL2 = WL2;
    global.WL3 = WL3;
    global.WL4 = WL4;
    global.acc1 = acc1;
    global.acc2 = acc2;

    const N721A = await ethers.getContractFactory("BootyPix");
    const bootypix = await N721A.deploy(
      baseURI,
      nonRevealURI,
      [shareHolder1.address, shareHolder2.address, shareHolder3.address],
      [50, 25, 25],
      merkleRoot
    );
    await bootypix.deployed();
    global.bootypix = bootypix;

    await bank.sendTransaction({
      to: WL1.address,
      value: ethers.utils.parseEther("10"), // Sends exactly 1.0 ether
    });

    await bank.sendTransaction({
      to: WL2.address,
      value: ethers.utils.parseEther("10"), // Sends exactly 1.0 ether
    });

    await bank.sendTransaction({
      to: WL3.address,
      value: ethers.utils.parseEther("10"), // Sends exactly 1.0 ether
    });

    await bank.sendTransaction({
      to: WL4.address,
      value: ethers.utils.parseEther("10"), // Sends exactly 1.0 ether
    });

  });

  describe("Deployment", function () {
    it("should have name, symbol", async function () {
      expect(await bootypix.name()).to.equal("BootyPix");
      expect(await bootypix.symbol()).to.equal("BTP");
    });
    it("should have supply = 555", async () => {
      expect(await bootypix.totalSupply()).to.equal(555);
    });
    it("should have sh1 with 355 tokens, sh2 100, sh3 100", async () => {
      expect(await bootypix.ownerOf(1)).to.equal(shareHolder1.address);
      expect(await bootypix.ownerOf(354)).to.equal(shareHolder1.address);
      expect(await bootypix.balanceOf(shareHolder1.address)).to.equal(355);

      expect(await bootypix.ownerOf(356)).to.equal(shareHolder2.address);
      expect(await bootypix.ownerOf(454)).to.equal(shareHolder2.address);
      expect(await bootypix.balanceOf(shareHolder2.address)).to.equal(100);

      expect(await bootypix.ownerOf(456)).to.equal(shareHolder3.address);
      expect(await bootypix.ownerOf(554)).to.equal(shareHolder3.address);
      expect(await bootypix.balanceOf(shareHolder3.address)).to.equal(100);
    });
    it("should have sh1 with 50% shares, sh2 25%, sh3 25%", async () => {
      expect(await bootypix.totalShares()).to.equal(100);

      expect(await bootypix.shares(shareHolder1.address)).to.equal(50);
      expect(await bootypix.shares(shareHolder2.address)).to.equal(25);
      expect(await bootypix.shares(shareHolder3.address)).to.equal(25);
    });
    it("should have status be DEACTIVATED", async () => {
      expect(await bootypix.checkStatus()).to.equal(0)
    })
    // it("should have activeSale not active", async function () {});
    // it("should have activeSale active", async function () {});
  });

  describe("Minting", function () {

    describe("Whitelist", function () {
      it("should revert on WL not active", async function () {
        await expect( bootypix.connect(WL1).whitelistMint(5, ['0x0c4e5ed11720453de5a7c9d2a54fb9a810ce8a57ed9f35847cbfd1bbb64c4ed5', '0x674952d3a023122d830819d1d6ed9bb968b5ed7541b267ce92a25e5ccee257a0', '0xcaaf730a4cc31a7dd34b413f682b41c7c139fa2fc908a7d8822288f33208ade0'])).to.be.revertedWith("WL not active")
      });
      it("should open WL", async () => {
        await bootypix.connect(shareHolder1).changeSaleStatus(1)
        expect(await bootypix.checkStatus()).to.equal(1)
      })
      it("should revert on address non WL", async function () {
      await expect(bootypix.connect(acc1).whitelistMint(5, ['0x0c4e5ed11720453de5a7c9d2a54fb9a810ce8a57ed9f35847cbfd1bbb64c4ed5', '0x674952d3a023122d830819d1d6ed9bb968b5ed7541b267ce92a25e5ccee257a0', '0xcaaf730a4cc31a7dd34b413f682b41c7c139fa2fc908a7d8822288f33208ade0'])).to.be.revertedWith("invalid proof")
      });
      it("should revert if amount is 0", async function () {
        await expect(bootypix.connect(WL1).whitelistMint( 0, ['0x0c4e5ed11720453de5a7c9d2a54fb9a810ce8a57ed9f35847cbfd1bbb64c4ed5', '0x674952d3a023122d830819d1d6ed9bb968b5ed7541b267ce92a25e5ccee257a0', '0xcaaf730a4cc31a7dd34b413f682b41c7c139fa2fc908a7d8822288f33208ade0'], {value: ethers.utils.parseEther("0.0276")})).to.be.revertedWith("cannot be 0 amount")

      });
      it("should revert if not the right value is sent", async function () {
        await expect( bootypix.connect(WL1).whitelistMint( 5, ['0x0c4e5ed11720453de5a7c9d2a54fb9a810ce8a57ed9f35847cbfd1bbb64c4ed5', '0x674952d3a023122d830819d1d6ed9bb968b5ed7541b267ce92a25e5ccee257a0', '0xcaaf730a4cc31a7dd34b413f682b41c7c139fa2fc908a7d8822288f33208ade0'], {value: ethers.utils.parseEther("1")})).to.be.revertedWith("not the right amount")
      });
      it("should succesfully mint 5 NFT with 1 redeem", async function () {
        await bootypix.connect(WL1).whitelistMint( 5, ['0x0c4e5ed11720453de5a7c9d2a54fb9a810ce8a57ed9f35847cbfd1bbb64c4ed5', '0x674952d3a023122d830819d1d6ed9bb968b5ed7541b267ce92a25e5ccee257a0', '0xcaaf730a4cc31a7dd34b413f682b41c7c139fa2fc908a7d8822288f33208ade0'], {value: ethers.utils.parseEther("0.0276")})
        //CHECK: events
        expect(await bootypix.balanceOf(WL1.address)).to.equal(5);
      });
      it("should successfully mint 5 NFT without redeem", async function () {
        await bootypix.connect(WL1).whitelistMint( 4, ['0x0c4e5ed11720453de5a7c9d2a54fb9a810ce8a57ed9f35847cbfd1bbb64c4ed5', '0x674952d3a023122d830819d1d6ed9bb968b5ed7541b267ce92a25e5ccee257a0', '0xcaaf730a4cc31a7dd34b413f682b41c7c139fa2fc908a7d8822288f33208ade0'], {value: ethers.utils.parseEther("0.0276")})
        expect(await bootypix.balanceOf(WL1.address)).to.equal(9);
      });
      it("should have WL address redemmed return true", async function () {
        expect(await bootypix.checkIfRedeemed(WL1.address)).to.be.equal(true)
      });
      it("should revert if minting more than 10 per wallet", async function () {
        await expect(bootypix.connect(WL1).whitelistMint( 5, ['0x0c4e5ed11720453de5a7c9d2a54fb9a810ce8a57ed9f35847cbfd1bbb64c4ed5', '0x674952d3a023122d830819d1d6ed9bb968b5ed7541b267ce92a25e5ccee257a0', '0xcaaf730a4cc31a7dd34b413f682b41c7c139fa2fc908a7d8822288f33208ade0'], {value: ethers.utils.parseEther("0.0345")})).to.be.revertedWith("only 10 mint per address")
      });
    });

    describe("Mint", function () {
      it("should have WL on", async function () {
        expect(await bootypix.checkStatus()).to.equal(1)
      });
      it("should revert with public sale not active", async function () {
        await expect(bootypix.connect(acc1).mint( 5, {value: ethers.utils.parseEther("0.0345")})).to.be.revertedWith("public sale not active")
      });
      it("should open public mint", async function () {
        await bootypix.connect(shareHolder1).changeSaleStatus(2)
        expect(await bootypix.checkStatus()).to.equal(2)
      });
      it("should revert if not the right value is sent", async function () {
        await expect(bootypix.connect(acc1).mint( 5, {value: ethers.utils.parseEther("0.0069")})).to.be.revertedWith("not enough funds")

      });
      it("should revert if more than 10 per tx", async function () {
        await expect(bootypix.connect(acc1).mint( 11, {value: ethers.utils.parseEther("0.0069")})).to.be.revertedWith("only 10 mint per address")

      });
      it("should succesfully mint 5 + 4", async function () {
        await bootypix.connect(acc1).mint( 5, {value: ethers.utils.parseEther("0.048")})
        expect(await bootypix.balanceOf(acc1.address)).to.equal(5);
        await bootypix.connect(acc1).mint( 4, {value: ethers.utils.parseEther("0.0384")})
        expect(await bootypix.balanceOf(acc1.address)).to.equal(9);
      });
      it("should revert if minting more than 10 per wallet", async function () {
        await expect(bootypix.connect(acc1).mint( 2, {value: ethers.utils.parseEther("0.0192")})).to.be.revertedWith("only 10 mint per address")
      });
      it("should have second account mint 10", async () => {
        await bootypix.connect(acc2).mint( 10, {value: ethers.utils.parseEther("0.096")})
        expect(await bootypix.balanceOf(acc2.address)).to.equal(10);
      })
    });
  });

  describe("Reveal", function() {
    it("should return unrevealed URI", async () => {
      expect(await bootypix.tokenURI(5)).to.be.equal("https://ipfs.io/ipfs/QmNxLnbYt5UHD6URWTo8CaeqggLHf8MvWW8n7tDHHHkDTa/")
    })
    it("should reveal and return tokenURI", async ()=> {
      await bootypix.connect(shareHolder1).reveal()
      expect(await bootypix.tokenURI(5)).to.be.equal("https://ipfs.io/ipfs/QmY7LBuaHukdmwSrrLqR1b5q4RnRcGW5PCjNc89XPAc3U9/5.json")
    })
  })

  describe("Withdrawals", function () {
    it("should have a balance of", async function () {
    expect( await ethers.provider.getBalance(bootypix.address)).to.be.equal(ethers.utils.parseEther("0.2376"))
    });
    it("should have SH1 withdraw 50%", async function () {
      await bootypix.releasing(shareHolder1.address)
      expect( await ethers.provider.getBalance(bootypix.address)).to.be.equal(ethers.utils.parseEther("0.1188"))

    });
    it("should have SH2 withdraw 25%", async function () {
      await bootypix.releasing(shareHolder2.address)
      expect( await ethers.provider.getBalance(bootypix.address)).to.be.equal(ethers.utils.parseEther("0.0594"))

    });
    it("should have SH3 withdraw 25%", async function () {
      await bootypix.releasing(shareHolder3.address)
      expect( await ethers.provider.getBalance(bootypix.address)).to.be.equal(ethers.utils.parseEther("0"))

    });
    it("", async function () {});
  });
});
