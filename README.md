# Lesson 14: Hardhat NFTs (EVERYTHING you need to know about NFTs)

Lesson 14 from the Web3, Full Stack Solidity, Smart Contract & Blockchain - Beginner to Expert ULTIMATE
Course | Javascript Edition:
https://github.com/smartcontractkit/full-blockchain-solidity-course-js#lesson-14-hardhat-nfts-everything-you-need-to-know-about-nfts

Official code at:
https://github.com/PatrickAlphaC/hardhat-nft-fcc

## Plan

Create three contracts:

1. Basic NFT
2. Random IPFS NFT
3. Dynamic SVG NFT

## NFT Links

1. Basic NFT
   - https://testnets.opensea.io/collection/dogie-1341
   - https://sepolia.etherscan.io/address/0xd54Bc984baF6790356c744e72C21C5fa623dE73b#code
2. Random IPFS NFT
   - https://testnets.opensea.io/collection/random-ipfs-nft-151
   - https://sepolia.etherscan.io/address/0x874C2566c2Bf8299BDF317be3Ef9F16555A13C66#code
3. Dynamic SVG NFT
   - https://testnets.opensea.io/collection/dynamic-svg-nft-193
   - https://sepolia.etherscan.io/address/0x2e25CABE4B61242fc68a141552f8c574264331B8#code

## Notes

* using `hardhat-toolbox` instead of `hardhat-waffle`
  * which forces the usage of `ethers` version 6 instead of version 5 
* using `@openzeppelin/contracts` version 5 instead of 4
  * which required the implementation of `_exists`
* replaced
    ```javascript
    basicNft = await ethers.getContract("BasicNft")
    ```
  with
    ```javascript
    const basicNftDeployment = await deployments.get("BasicNft")
    basicNft = await ethers.getContractAt(
        basicNftDeployment.abi,
        basicNftDeployment.address
    )
    ```
* added `Ownable` constructor call to `RandomIpfsNft`:
    ```javascript
    Ownable(msg.sender)
    ```
* replaced `.address` with `.target` on deployed contract instances
* replaced `transactionReceipt.events` with `transactionReceipt.logs`
* replaced `ethers.utils.parseEther` with `ethers.parseEther`
* replaced `.sub` with `-`
* replaced `.revertedWith(<error_class_name>)` with `revertedWithCustomError(<deployed_contract>, <error_class_name>)`
