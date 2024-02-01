const { network, ethers } = require("hardhat")

module.exports = async ({ deployments }) => {
    const chainId = network.config.chainId

    console.log("----------------------------------------------------")

    // Basic NFT
    const basicNftDeployment = await deployments.get("BasicNft")
    const basicNft = await ethers.getContractAt(
        basicNftDeployment.abi,
        basicNftDeployment.address
    )
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`)

    // Random IPFS NFT
    const randomIpfsNftDeployment = await deployments.get("RandomIpfsNft")
    const randomIpfsNft = await ethers.getContractAt(
        randomIpfsNftDeployment.abi,
        randomIpfsNftDeployment.address
    )
    const mintFee = await randomIpfsNft.getMintFee()
    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
    // Need to listen for response
    await new Promise(async (resolve, reject) => {
        setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000) // 5 minute timeout time
        // setup listener for our event
        randomIpfsNft.once("NftMinted", async () => {
            console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)
            resolve()
        })
        if (chainId == 31337) {
            const requestId = randomIpfsNftMintTxReceipt.logs[1].args.requestId.toString()
            const vrfCoordinatorV2MockDeployment = await deployments.get("VRFCoordinatorV2Mock")
            const vrfCoordinatorV2Mock = await ethers.getContractAt(
                vrfCoordinatorV2MockDeployment.abi,
                vrfCoordinatorV2MockDeployment.address
            )
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.target)
        }
    })

    // Dynamic SVG  NFT
    const highValue = ethers.parseEther("2500")
    const dynamicSvgNftDeployment = await deployments.get("DynamicSvgNft")
    const dynamicSvgNft = await ethers.getContractAt(
        dynamicSvgNftDeployment.abi,
        dynamicSvgNftDeployment.address
    )
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)
}

module.exports.tags = ["all", "mint"]
