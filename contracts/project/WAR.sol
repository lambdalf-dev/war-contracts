// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../tokens/ERC721/Reg_ERC721Batch.sol';
import '../utils/IMerkleWhitelistable.sol';
import '../utils/IOwnable.sol';
import '../utils/IPausable.sol';
import '../utils/ITradable.sol';

contract WAR is Reg_ERC721Batch, IMerkleWhitelistable, IOwnable, IPausable, ITradable {
	error NFT_ARRAY_LENGTH_MISMATCH( uint256 len1, uint256 len2 );
	error NFT_NO_ETHER_BALANCE();
	error NFT_INCORRECT_PRICE( uint256 amountReceived, uint256 amountExpected );
	error NFT_MAX_SUPPLY( uint256 qtyRequested, uint256 currentSupply, uint256 maxSupply );
	error NFT_MAX_RESERVE( uint256 qtyRequested, uint256 reserveLeft );

	constructor(
		string name_,
		string symbol_,
		string baseURI_
	) {
		_initERC721Metadata( name_, symbol_, baseURI_ )
	}

	// **************************************
	// *****          INTERNAL          *****
	// **************************************
	// **************************************

	// **************************************
	// *****           PUBLIC           *****
	// **************************************
		function mintPresale( bytes32[] memory proof_ ) {
			_mint( _msgSender(), 1 );
		}

		function mintSale( uint256 qty_ ) {
			_mint( _msgSender(), qty_ );
		}
	// **************************************

	// **************************************
	// *****       CONTRACT_OWNER       *****
	// **************************************
		function addProxyRegistry( address proxyRegistryAddress_ ) {
			_addProxyRegistry( proxyRegistryAddress_ );
		}

		function airdrop( address[] memory accounts_, uint256[] memory amounts_ ) {}

		function setBaseURI( string memory baseURI_ ) {
			_setBaseURI( baseURI_ );
		}

		function setSaleState( SaleState newState_ ) {
			_setSaleState( newState_ );
		}	

		function setWhitelist( bytes32 root_ ) {
			_setWhitelist( root_ );
		}

		function withdraw() {}
	// **************************************

	// **************************************
	// *****            VIEW            *****
	// **************************************
	// **************************************
}
