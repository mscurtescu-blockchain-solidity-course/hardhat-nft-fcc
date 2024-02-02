const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const fs= require("fs")

const LO_SVG = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" })
const HI_SVG = fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" })

const SVG_IMAGE_URI_PREFIX = "data:image/svg+xml;base64,"
const TOKEN_URI_PREFIX = "data:application/json;base64,"

const HIGH_VALUE = ethers.parseEther("1") // 1 dollar per ether

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Dynamic SVG NFT Unit Tests", function () {
        let dynamicSvgNft, deployer, mockV3Aggregator

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["mocks", "dynamicsvg"])

            const dynamicSvgNftDeployment = await deployments.get("DynamicSvgNft")
            dynamicSvgNft = await ethers.getContractAt(
                dynamicSvgNftDeployment.abi,
                dynamicSvgNftDeployment.address
            )

            const mockV3AggregatorDeployment = await deployments.get("MockV3Aggregator")
            mockV3Aggregator = await ethers.getContractAt(
                mockV3AggregatorDeployment.abi,
                mockV3AggregatorDeployment.address
            )
        })

        describe("constructor", () => {
            it("sets starting values correctly", async function () {
                const loSVG = await dynamicSvgNft.getLowSVG()
                const hiSVG = await dynamicSvgNft.getHighSVG()
                const priceFeed = await dynamicSvgNft.getPriceFeed()
                assertLoSvgImageURI(loSVG)
                assertHiSvgImageURI(hiSVG)
                assert.equal(priceFeed, mockV3Aggregator.target)
            })
        })

        describe("mintNft", () => {
            it("emits an event and creates the NFT", async function () {
                await expect(dynamicSvgNft.mintNft(HIGH_VALUE)).to.emit(
                    dynamicSvgNft,
                    "CreatedNFT"
                ).withArgs(0, HIGH_VALUE);
                const tokenCounter = await dynamicSvgNft.getTokenCounter()
                assert.equal(tokenCounter.toString(), "1")
                const tokenURI = await dynamicSvgNft.tokenURI(0)
                assertHiTokenURI(tokenURI)
            })
            it("shifts the token uri to lower when the price doesn't surpass the highvalue", async function () {
                const highValue = ethers.parseEther("100000000") // $100,000,000 dollar per ether. Maybe in the distant future this test will fail...
                const txResponse = await dynamicSvgNft.mintNft(highValue)
                await txResponse.wait(1)
                const tokenURI = await dynamicSvgNft.tokenURI(0)
                assertLoTokenURI(tokenURI)
            })
        })

        describe("getTokenCounter", () => {
            it("Has token counter at zero after contract creation", async function () {
                const counter = await dynamicSvgNft.getTokenCounter()

                assert.equal(counter, 0)
            })
            it("Increments by one after minting", async function () {
                let counter = await dynamicSvgNft.getTokenCounter()
                assert.equal(counter, 0)

                let txResponse = await dynamicSvgNft.mintNft(HIGH_VALUE)
                await txResponse.wait(1)

                counter = await dynamicSvgNft.getTokenCounter()
                assert.equal(counter, 1)

                txResponse = await dynamicSvgNft.mintNft(HIGH_VALUE)
                await txResponse.wait(1)

                counter = await dynamicSvgNft.getTokenCounter()
                assert.equal(counter, 2)
            })
        })
    })

function assertSvgImageURI(imageUri) {
    assert.isString(imageUri)
    assert.isTrue(imageUri.startsWith(SVG_IMAGE_URI_PREFIX))
}

function assertTokenURI(tokenUri) {
    assert.isString(tokenUri)
    assert.isTrue(tokenUri.startsWith(TOKEN_URI_PREFIX))
}

function decodeSvgImageURI(imageUri) {
    assertSvgImageURI(imageUri)

    let b64svg = imageUri.substring(SVG_IMAGE_URI_PREFIX.length)

    return atob(b64svg)
}

function decodeTokenURI(tokenUri) {
    assertTokenURI(tokenUri)

    let b64json = tokenUri.substring(TOKEN_URI_PREFIX.length)
    let json = atob(b64json)

    return JSON.parse(json)
}

function assertLoSvgImageURI(imageUri) {
    let svg = decodeSvgImageURI(imageUri)

    assert.equal(svg, LO_SVG)
}

function assertHiSvgImageURI(imageUri) {
    let svg = decodeSvgImageURI(imageUri)

    assert.equal(svg, HI_SVG)
}

function assertTokenAttributes(token) {
    assert.equal(token.name, "Dynamic SVG NFT")
    assert.equal(token.description, "An NFT that changes based on the Chainlink Feed")
    assert.isArray(token.attributes)
    assert.equal(token.attributes.length, 1)
    assert.equal(token.attributes[0].trait_type, "coolness")
    assert.equal(token.attributes[0].value, 100)
}

function assertLoTokenURI(tokenUri) {
    let token = decodeTokenURI(tokenUri)

    assertTokenAttributes(token)

    assertLoSvgImageURI(token.image)
}

function assertHiTokenURI(tokenUri) {
    let token = decodeTokenURI(tokenUri)

    assertTokenAttributes(token)

    assertHiSvgImageURI(token.image)
}
