// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721 {

    uint256 private s_tokenCounter;
    string private s_loImageURI;
    string private s_hiImageURI;
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) private s_tokenIdToHighValues;

    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";

    event CreatedNFT(uint256 indexed tokenId, int256 hiValue);

    constructor(address priceFeedAddress, string memory loSvg, string memory hiSvg)  ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        s_loImageURI = svgToImageURI(loSvg);
        s_hiImageURI = svgToImageURI(hiSvg);
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(svg));
        return string.concat(base64EncodedSvgPrefix, svgBase64Encoded);
    }

    function mintNft(int256 hiValue) public {
        uint256 newTokenId = s_tokenCounter;
        s_tokenCounter += 1;

        _safeMint(msg.sender, newTokenId);
        s_tokenIdToHighValues[newTokenId] = hiValue;

        emit CreatedNFT(newTokenId, hiValue);
    }

    /*
     * This function does not exist in @openzeppelin/contracts version 5.
     */
    function _exists(uint256 tokenId) public view returns (bool) {
        return address(0) != _ownerOf(tokenId);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) {
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = s_loImageURI;
        if (price >= s_tokenIdToHighValues[tokenId]) {
            imageURI = s_hiImageURI;
        }

        return
            string.concat(
                _baseURI(),
                Base64.encode(
                    bytes(
                        string.concat(
                            '{"name":"',
                            name(), // You can add whatever name here
                            '", "description":"An NFT that changes based on the Chainlink Feed", ',
                            '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                            imageURI,
                            '"}'
                        )
                    )
                )
            );
    }

    function getLowSVG() public view returns (string memory) {
        return s_loImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return s_hiImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}