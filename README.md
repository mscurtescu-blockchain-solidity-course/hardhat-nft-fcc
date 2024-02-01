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
