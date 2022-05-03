const ARTIFACT = require( `../../artifacts/contracts/mocks/tokens/WAR.sol/WAR.json` )
// **************************************
// *****           IMPORT           *****
// **************************************
	const { TEST_ACTIVATION } = require( `../test-activation-module` )
	const {
		CST,
		USER1,
		USER2,
		USER_NAMES,
		PROXY_USER,
		TOKEN_OWNER,
		OTHER_OWNER,
		CONTRACT_DEPLOYER,
	} = require( `../test-var-module` )

	const chai = require( `chai` )
	const chaiAsPromised = require( `chai-as-promised` )
	chai.use( chaiAsPromised )
	const expect = chai.expect

	const { ethers, waffle } = require( `hardhat` )
	const { loadFixture, deployContract } = waffle

	const {
		getTestCasesByFunction,
		generateTestCase
	} = require( `../fail-test-module` )

	const {
		INTERFACE_ID,
		shouldSupportInterface,
	} = require( `../utils/behavior.ERC165` )

	const {
		ERC721ReceiverError,
		HOLDER_ARTIFACT,
		NON_HOLDER_ARTIFACT,
		shouldRevertWhenRequestedTokenDoesNotExist,
		shouldRevertWhenCallerIsNotApproved,
		shouldRevertWhenTransferingToNonERC721Receiver,
		shouldRevertWhenTransferingToNullAddress,
		shouldBehaveLikeERC721BatchBeforeMint,
		shouldBehaveLikeERC721BatchAfterMint,
	} = require( `../ERC721/behavior.ERC721Batch` )

	const {
		shouldBehaveLikeERC721BatchMetadata,
	} = require( `../ERC721/behavior.ERC721BatchMetadata` )

	const {
		shouldBehaveLikeERC721BatchEnumerableBeforeMint,
		shouldBehaveLikeERC721BatchEnumerableAfterMint,
	} = require( `../ERC721/behavior.ERC721BatchEnumerable` )

	const {
		shouldBehaveLikeIOwnable,
		shouldRevertWhenCallerIsNotContractOwner,
	} = require( `../utils/behavior.IOwnable` )

	const {
		SALE_STATE,
		shouldBehaveLikeIPausable,
		shouldEmitSaleStateChangedEvent,
		shouldRevertWhenSaleStateIsNotClose,
		shouldRevertWhenSaleStateIsNotPreSale,
		shouldRevertWhenSaleStateIsNotSale,
	} = require( `../utils/behavior.IPausable` )

	const {
		normalize,
		generateRoot,
		getProof,
		shouldRevertWhenWitelistIsNotSet,
		shouldRevertWhenWhitelistIsConsumed,
		shouldRevertWhenNotWhitelisted,
	} = require( `../utils/behavior.IWhitelistable` )
// **************************************

// **************************************
// *****       TEST VARIABLES       *****
// **************************************
	// For contract interface
	const CONTRACT_INTERFACE = {
		NAME : `WAR`,
		ERRORS : {
			IERC721_APPROVE_OWNER                       : `IERC721_APPROVE_OWNER`,
			IERC721_CALLER_NOT_APPROVED                 : `IERC721_CALLER_NOT_APPROVED`,
			IERC721_INVALID_APPROVAL_FOR_ALL            : `IERC721_INVALID_APPROVAL_FOR_ALL`,
			IERC721_INVALID_TRANSFER                    : `IERC721_INVALID_TRANSFER`,
			IERC721_NONEXISTANT_TOKEN                   : `IERC721_NONEXISTANT_TOKEN`,
			IERC721_NON_ERC721_RECEIVER                 : `IERC721_NON_ERC721_RECEIVER`,
			IERC721Enumerable_INDEX_OUT_OF_BOUNDS       : `IERC721Enumerable_INDEX_OUT_OF_BOUNDS`,
			IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS : `IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS`,
			ERC721Receiver_PANIC                        : `panic code`,
			ERC721Receiver_ERROR                        : `custom error`,
			ERC721Receiver_MESSAGE                      : `Mock_ERC721Receiver: reverting`,
		},
		EVENTS : {
			Approval             : `Approval`,
			ApprovalForAll       : `ApprovalForAll`,
			ConsecutiveTransfer  : `ConsecutiveTransfer`,
			OwnershipTransferred : `OwnershipTransferred`,
			SaleStateChanged     : `SaleStateChanged`,
			Transfer             : `Transfer`,
		},
		METHODS : {
			// **************************************
			// *****           PUBLIC           *****
			// **************************************
				approve              : {
					SIGNATURE          : `approve(address,uint256)`,
					PARAMS             : [ `to_`, `tokenId_` ],
				},
				mintPresale          : {
					SIGNATURE          : `mintPresale(bytes32[])`,
					PARAMS             : [ `proof_` ]
				}
				mintSale             : {
					SIGNATURE          : `mintSale(uint256)`,
					PARAMS             : [ `qty_` ]
				}
				safeTransferFrom     : {
					SIGNATURE          : `safeTransferFrom(address,address,uint256)`,
					PARAMS             : [ `from_`, `to_`, `tokenId_` ],
				},
				safeTransferFrom_ol  : {
					SIGNATURE          : `safeTransferFrom(address,address,uint256,bytes)`,
					PARAMS             : [ `from_`, `to_`, `tokenId_`, `data_` ],
				},
				setApprovalForAll    : {
					SIGNATURE          : `setApprovalForAll(address,bool)`,
					PARAMS             : [ `operator_`, `approved_` ],
				},
				transferFrom         : {
					SIGNATURE          : `transferFrom(address,address,uint256)`,
					PARAMS             : [ `from_`, `to_`, `tokenId_` ],
				},
			// **************************************

			// **************************************
			// *****       CONTRACT_OWNER       *****
			// **************************************
				addProxyRegistry     : {
					SIGNATURE          : `addProxyRegistry(address)`,
					PARAMS             : [ `proxyRegistryAddress_` ]
				}
				airdrop              : {
					SIGNATURE          : `airdrop(address[],uint256[])`,
					PARAMS             : [ `accounts_`, `amounts_` ]
				}
				setBaseURI           : {
					SIGNATURE          : `setBaseURI(string)`,
					PARAMS             : [ `baseURI_` ]
				}
				setSaleState         : {
					SIGNATURE          : `setSaleState(SaleState)`,
					PARAMS             : [ `newState_` ]
				}
				setWhitelist         : {
					SIGNATURE          : `setWhitelist(bytes32)`,
					PARAMS             : [ `root_` ]
				}
				transferOwnership    : {
					SIGNATURE          : `transferOwnership(address)`,
					PARAMS             : [ `newOwner_` ],
				},
				withdraw             : {
					SIGNATURE          : `withdraw()`,
					PARAMS             : []
				}
			// **************************************

			// **************************************
			// *****            VIEW            *****
			// **************************************
				balanceOf            : {
					SIGNATURE          : `balanceOf(address)`,
					PARAMS             : [ `tokenOwner_` ],
				},
				getApproved          : {
					SIGNATURE          : `getApproved(uint256)`,
					PARAMS             : [ `tokenId_` ],
				},
				isApprovedForAll     : {
					SIGNATURE          : `isApprovedForAll(address,address)`,
					PARAMS             : [ `tokenOwner_`, `operator_` ],
				},
				name                 : {
					SIGNATURE          : `name()`,
					PARAMS             : [],
				},
				owner                : {
					SIGNATURE          : `owner()`,
					PARAMS             : [],
				},
				ownerOf              : {
					SIGNATURE          : `ownerOf(uint256)`,
					PARAMS             : [ `tokenId_` ],
				},
				saleState            : {
					SIGNATURE          : `saleState()`,
					PARAMS             : [],
				},
				supportsInterface    : {
					SIGNATURE          : `supportsInterface(bytes4)`,
					PARAMS             : [ `interfaceId_` ],
				},
				symbol               : {
					SIGNATURE          : `symbol()`,
					PARAMS             : [],
				},
				tokenByIndex         : {
					SIGNATURE          : `tokenByIndex(uint256)`,
					PARAMS             : [ `index_` ],
				},
				tokenOfOwnerByIndex  : {
					SIGNATURE          : `tokenOfOwnerByIndex(address,uint256)`,
					PARAMS             : [ `tokenOwner_`, `index_` ],
				},
				tokenURI             : {
					SIGNATURE          : `tokenURI(uint256)`,
					PARAMS             : [ `index_` ],
				},
				totalSupply          : {
					SIGNATURE          : `totalSupply()`,
					PARAMS             : [],
				},
			// **************************************
		},
	}

	// INIT
	const INIT_SUPPLY             = 0
	// TARGET TOKEN
	const FIRST_TOKEN             = 1
	const SECOND_TOKEN            = 2
	const TARGET_TOKEN            = 4
	// TOKEN OWNER
	const TOKEN_OWNER_INIT_SUPPLY = 6
	const TOKEN_OWNER_MORE_SUPPLY = 3
	const TOKEN_OWNER_SUPPLY      = TOKEN_OWNER_INIT_SUPPLY + TOKEN_OWNER_MORE_SUPPLY
	const TOKEN_OWNER_FIRST       = FIRST_TOKEN
	const TOKEN_OWNER_LAST        = TOKEN_OWNER_FIRST + TOKEN_OWNER_INIT_SUPPLY - 1
	// OTHER OWNER
	const OTHER_OWNER_SUPPLY      = 1
	const OTHER_OWNER_FIRST       = TOKEN_OWNER_LAST + 1
	const OTHER_OWNER_LAST        = OTHER_OWNER_FIRST + OTHER_OWNER_SUPPLY - 1
	// NON EXISTENT
	const LAST_TOKEN              = FIRST_TOKEN + INIT_SUPPLY + TOKEN_OWNER_SUPPLY + OTHER_OWNER_SUPPLY - 1
	const UNMINTED_TOKEN          = TOKEN_OWNER_SUPPLY + OTHER_OWNER_SUPPLY + 10
	// METADATA
	const INIT_BASE_URI           = `https://api.exemple.com/`
	const NEW_BASE_URI            = `https://exemple.com/api/`
	// AIRDROP
	const AIRDROP1                = 1
	const AIRDROP2                = 2

	const TEST_DATA = {
		// TEST NAME
		NAME : `WAR`,
		// TEST EVENTS
		EVENTS : {
			Approval             : true,
			ApprovalForAll       : true,
			OwnershipTransferred : true,
			SaleStateChanged     : true,
			Transfer             : true,
		},
		// TEST METHODS
		METHODS : {
			// **************************************
			// *****           PUBLIC           *****
			// **************************************
				approve             : true,
				mintPresale         : true,
				mintSale            : true,
				safeTransferFrom    : true,
				safeTransferFrom_ol : true,
				setApprovalForAll   : true,
				transferFrom        : true,
			// **************************************

			// **************************************
			// *****       CONTRACT_OWNER       *****
			// **************************************
				addProxyRegistry    : true,
				airdrop             : true,
				setBaseURI          : true,
				setSaleState        : true,
				setWhitelist        : true,
				transferOwnership   : true,
				withdraw            : true,
			// **************************************

			// **************************************
			// *****            VIEW            *****
			// **************************************
				balanceOf           : true,
				getApproved         : true,
				isApprovedForAll    : true,
				name                : true,
				owner               : true,
				ownerOf             : true,
				saleState           : true,
				supportsInterface   : true,
				symbol              : true,
				tokenByIndex        : true,
				tokenOfOwnerByIndex : true,
				tokenURI            : true,
				totalSupply         : true,
			// **************************************
		},
		// SUPPLY
		INIT_SUPPLY                 : INIT_SUPPLY,
		MINTED_SUPPLY               : INIT_SUPPLY + TOKEN_OWNER_SUPPLY + OTHER_OWNER_SUPPLY,
		// TARGET TOKEN
		FIRST_TOKEN                 : FIRST_TOKEN,
		SECOND_TOKEN                : SECOND_TOKEN,
		LAST_TOKEN                  : LAST_TOKEN,
		TARGET_TOKEN                : INIT_SUPPLY + TARGET_TOKEN,
		UNMINTED_TOKEN              : INIT_SUPPLY + UNMINTED_TOKEN,
		// TOKEN OWNER
		TOKEN_OWNER_INIT_SUPPLY     : TOKEN_OWNER_INIT_SUPPLY,
		TOKEN_OWNER_MORE_SUPPLY     : TOKEN_OWNER_MORE_SUPPLY,
		TOKEN_OWNER_SUPPLY          : TOKEN_OWNER_SUPPLY,
		TOKEN_OWNER_FIRST           : INIT_SUPPLY + FIRST_TOKEN,
		TOKEN_OWNER_LAST            : INIT_SUPPLY + LAST_TOKEN,
		TOKEN_OWNER_INDEX_SECOND    : FIRST_TOKEN + TOKEN_OWNER_INIT_SUPPLY + OTHER_OWNER_SUPPLY + 1,
		// OTHER OWNER
		OTHER_OWNER_SUPPLY          : OTHER_OWNER_SUPPLY,
		OTHER_OWNER_FIRST           : INIT_SUPPLY + OTHER_OWNER_FIRST,
		OTHER_OWNER_LAST            : INIT_SUPPLY + OTHER_OWNER_LAST,
		// METADATA
		INIT_BASE_URI               : INIT_BASE_URI,
		NEW_BASE_URI                : NEW_BASE_URI,
		// ENUMERABLE
		INDEX_ZERO                  : 0,
		INDEX_SECOND                : TOKEN_OWNER_INIT_SUPPLY + OTHER_OWNER_SUPPLY,
		TARGET_INDEX                : INIT_SUPPLY + TARGET_TOKEN,
		OUT_OF_BOUNDS_INDEX         : INIT_SUPPLY + UNMINTED_TOKEN,
		// PRICE
		WL_PRICE                    : ethers.BigNumber.from( `40000000000000000` ),
		PUBLIC_PRICE                : ethers.BigNumber.from( `50000000000000000` ),
		// AIRDROP
		AIRDROP1                    : AIRDROP1,
		AIRDROP2                    : AIRDROP2,
		// WHITELIST
	  ACCESS_LIST        : {
	    "0x0010e29271bbca7abfbbbda1bdec668720cca795": 1,
	    "0x001709b366bb85f0fb2cC4eF18833392EBBA5756": 1,
	    "0x003018F3b836e952775C07E9b7BCde83b519a299": 1,
	    "0x00673506c19116893bdffa587d5ef968affe6a99": 1,
	    "0x009E7c27d5e3A1a4eB94b1ffCB258Eea12E17d1a": 1,
	    "0x00a139733aD9A7D6DEb9e5B7E2C6a01122b17747": 1,
	  },
		// CONSTRUCTOR PARAMETERS
		PARAMS : {
			baseURI_    : INIT_BASE_URI,
			symbol_     : `NFT`,
			name_       : `NFT Token`,
		},
		// INTERFACES
		INTERFACES : [
			`IERC165`,
			`IERC721`,
			`IERC721Metadata`,
			`IERC721Enumerable`,
		],
		// MINT OUT
		MINT_OUT : {
			MINT_QTY : 100,
			MAX_BATCH : 100,
			MAX_SUPPLY : 100 + AIRDROP1 + AIRDROP2,
		}
	}

	let test_to
	let test_qty
	let test_contract_params

	let users = {}
	let contract
	let proxy_contract
	let test_proxy_contract_params
// **************************************

// **************************************
// *****          FIXTURES          *****
// **************************************
	async function noMintFixture() {
		[
			test_user1,
			test_user2,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_contract_params = [
			TEST_DATA.PARAMS.initSupply_,
			TEST_DATA.PARAMS.baseURI_,
			TEST_DATA.PARAMS.symbol_,
			TEST_DATA.PARAMS.name_,
		]
		let test_contract = await deployContract(
			test_contract_deployer,
			ARTIFACT,
			test_contract_params
		)
		await test_contract.deployed()

		return {
			test_user1,
			test_user2,
			test_contract,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
		}
	}

	async function mintFixture() {
		[
			test_user1,
			test_user2,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_contract_params = [
			TEST_DATA.PARAMS.initSupply_,
			TEST_DATA.PARAMS.baseURI_,
			TEST_DATA.PARAMS.symbol_,
			TEST_DATA.PARAMS.name_,
		]
		let test_contract = await deployContract(
			test_contract_deployer,
			ARTIFACT,
			test_contract_params
		)
		await test_contract.deployed()

		test_qty = TEST_DATA.TOKEN_OWNER_INIT_SUPPLY
		test_to  = test_token_owner.address
		await test_contract.connect( test_token_owner )
											 .mint( test_to, test_qty )

		test_qty = TEST_DATA.OTHER_OWNER_SUPPLY
		test_to  = test_other_owner.address
		await test_contract.connect( test_other_owner )
											 .mint( test_to, test_qty )

		test_qty = TEST_DATA.TOKEN_OWNER_MORE_SUPPLY
		test_to  = test_token_owner.address
		await test_contract.connect( test_token_owner )
											 .mint( test_to, test_qty )

		return {
			test_user1,
			test_user2,
			test_contract,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
		}
	}
// **************************************

// **************************************
// *****        TEST  SUITES        *****
// **************************************
	async function shouldRevertWhenIncorrectAmountPaid ( promise, amountReceived, amountExpected, error = `NFT_INCORRECT_PRICE` ) {
		await expect( promise ).to.be.revertedWith(
			`${ error }(${ amountReceived }, ${ amountExpected })`
		)
	}

	async function shouldRevertWhenMintedOut ( promise, qtyRequested, currentSupply, maxSupply, error = `NFT_MAX_SUPPLY` ) {
		await expect( promise ).to.be.revertedWith(
			`${ error }(${ qtyRequested }, ${ currentSupply }, ${ maxSupply })`
		)
	}

	async function shouldRevertWhenReserveDepleted ( promise, qtyRequested, reserveLeft, error = `NFT_MAX_RESERVE` ) {
		await expect( promise ).to.be.revertedWith(
			`${ error }(${ qtyRequested }, ${ reserveLeft })`
		)
	}

	function testInvalidInputs ( fixture, TEST, CONTRACT ) {
		describe( `Invalid inputs`, function () {
			if ( TEST_ACTIVATION.INVALID_INPUT ) {
				beforeEach( async function () {
					const {
						test_user1,
						test_user2,
						test_contract,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract = test_contract
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer

					defaultArgs = {}
					// **************************************
					// *****           PUBLIC           *****
					// **************************************
						defaultArgs[ CONTRACT.METHODS.approve.SIGNATURE ] = {
							err  : null,
							args : [
								users[ USER1 ].address,
								TEST.FIRST_TOKEN,
							],
						}
						defaultArgs [ CONTRACT.METHODS.mint.SIGNATURE ] = {
							err  : null,
							args : [
								5,
							],
						}
						defaultArgs[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ] = {
							err  : null,
							args : [
								users[ TOKEN_OWNER ].address,
								users[ USER1 ].address,
								TEST.FIRST_TOKEN,
							],
						}
						defaultArgs[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ] = {
							err  : null,
							args : [
								users[ TOKEN_OWNER ].address,
								users[ USER1 ].address,
								TEST.FIRST_TOKEN,
								`0x`,
							],
						}
						defaultArgs[ CONTRACT.METHODS.setApprovalForAll.SIGNATURE ] = {
							err  : null,
							args : [
								users[ TOKEN_OWNER ].address,
								true,
							],
						}
						defaultArgs[ CONTRACT.METHODS.transferFrom.SIGNATURE ] = {
							err  : null,
							args : [
								users[ TOKEN_OWNER ].address,
								users[ USER1 ].address,
								TEST.FIRST_TOKEN,
							],
						}
					// **************************************

					// **************************************
					// *****       CONTRACT_OWNER       *****
					// **************************************
						defaultArgs[ CONTRACT.METHODS.setBaseURI.SIGNATURE ] = {
							err  : null,
							args : [
								TEST.NEW_BASE_URI,
							],
						}
					// **************************************

					// **************************************
					// *****            VIEW            *****
					// **************************************
						defaultArgs[ CONTRACT.METHODS.balanceOf.SIGNATURE ] = {
							err  : null,
							args : [
								users[ TOKEN_OWNER ].address,
							],
						}
						defaultArgs[ CONTRACT.METHODS.getApproved.SIGNATURE ] = {
							err  : null,
							args : [
								TEST.FIRST_TOKEN,
							],
						}
						defaultArgs[ CONTRACT.METHODS.isApprovedForAll.SIGNATURE ] = {
							err  : null,
							args : [
								users[ TOKEN_OWNER ].address,
								users[ USER1 ].address,
							],
						}
						defaultArgs[ CONTRACT.METHODS.name.SIGNATURE ] = {
							err  : null,
							args : [],
						}
						defaultArgs[ CONTRACT.METHODS.ownerOf.SIGNATURE ] = {
							err  : null,
							args : [
								TEST.FIRST_TOKEN,
							],
						}
						defaultArgs[ CONTRACT.METHODS.supportsInterface.SIGNATURE ] = {
							err  : null,
							args : [
								INTERFACE_ID.IERC165,
							]
						}
						defaultArgs[ CONTRACT.METHODS.symbol.SIGNATURE ] = {
							err  : null,
							args : [],
						}
						defaultArgs[ CONTRACT.METHODS.tokenURI.SIGNATURE ] = {
							err  : null,
							args : [
								TEST.FIRST_TOKEN,
							],
						}
						defaultArgs[ CONTRACT.METHODS.tokenByIndex.SIGNATURE ] = {
							err  : null,
							args : [
								TEST.INDEX_ZERO,
							],
						}
						defaultArgs[ CONTRACT.METHODS.tokenOfOwnerByIndex.SIGNATURE ] = {
							err  : null,
							args : [
								users[ TOKEN_OWNER ].address,
								TEST.INDEX_ZERO,
							],
						}
						defaultArgs[ CONTRACT.METHODS.totalSupply.SIGNATURE ] = {
							err  : null,
							args : [],
						}
					// **************************************
				})

				Object.entries( CONTRACT.METHODS ).forEach( function( [ prop, val ] ) {
					describe( val.SIGNATURE, function () {
						const testSuite = getTestCasesByFunction( val.SIGNATURE, val.PARAMS )

						testSuite.forEach( testCase => {
							it( testCase.test_description, async function () {
								await generateTestCase( contract, testCase, defaultArgs, prop, val )
							})
						})
					})
				})
			}
		})
	}

	function shouldBehaveLikeNFTAtDeploy ( fixture, TEST, CONTRACT  ) {
		describe( `Should behave like NFT at deploy`, function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_user1,
						test_user2,
						test_contract,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****       CONTRACT_OWNER       *****
				// **************************************
					describe( CONTRACT.METHODS.addProxyRegistry.SIGNATURE, function () {
						if ( TEST.METHODS.addProxyRegistry ) {
							it( `Transaction initiated by a regular user should be reverted`, async function () {
								const proxyRegistryAddress = proxy_contract.address
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.addProxyRegistry( proxyRegistryAddress ),
									users[ USER1 ].address
								)
							})
						}
					})

					describe( CONTRACT.METHODS.airdrop.SIGNATURE, function () {
						if ( TEST.METHODS.airdrop ) {
							it( `Transaction initiated by a regular user should be reverted`, async function () {
								const accounts = [
									users[ USER1 ].address,
									users[ USER2 ].address,
								]
								const amounts = [
									TEST.AIRDROP1,
									TEST.AIRDROP2,
								]
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.airdrop( accounts, amounts ),
									users[ USER1 ].address
								)
							})

							it( `Inputing arrays of different lengths should be reverted`, async function () {
								const accounts = [
									users[ USER1 ].address,
									users[ USER2 ].address,
								]
								const amounts = [
									TEST.AIRDROP1,
								]
								await expect(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.airdrop( accounts, amounts )
								).to.be.revertedWith( `${ CONTRACT.ERRORS.NFT_ARRAY_LENGTH_MISMATCH }(${ accounts.length }, ${ amounts.length })` )
							})

							describe( `${ USER_NAMES[ CONTRACT_DEPLOYER ] } airdrops a few tokens`, async function () {
								beforeEach( async function () {
									const accounts = [
										users[ USER1 ].address,
										users[ USER2 ].address,
									]
									const amounts = [
										TEST.AIRDROP1,
										TEST.AIRDROP2,
									]
									await shouldEmitTransferEvent(
										contract.connect( users[ CONTRACT_DEPLOYER ] )
														.airdrop( accounts, amounts ),
										contract,
										CST.ADDRESS_ZERO,
										users[ USER1 ].address,
										TEST.FIRST_TOKEN
									)
								})

								it( `Balance of ${ USER_NAMES[ USER1 ] } should be ${ TEST.AIRDROP1 }`, async function () {
									const tokenOwner = users[ USER1 ].address
									expect(
										await contract.balanceOf( tokenOwner )
									).to.equal( TEST.AIRDROP1 )
								})

								it( `Balance of ${ USER_NAMES[ USER2 ] } should be ${ TEST.AIRDROP2 }`, async function () {
									const tokenOwner = users[ USER2 ].address
									expect(
										await contract.balanceOf( tokenOwner )
									).to.equal( TEST.AIRDROP2 )
								})
							})
						}
					})

					describe( CONTRACT.METHODS.setBaseURI.SIGNATURE, function () {
						if ( TEST.METHODS.setBaseURI ) {
							it( `Transaction initiated by a regular user should be reverted`, async function () {
								const baseURI = TEST.NEW_BASE_URI
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.setBaseURI( baseURI ),
									users[ USER1 ].address
								)
							})
						}
					})

					describe( CONTRACT.METHODS.setSaleState.SIGNATURE, function () {
						if ( TEST.METHODS.setSaleState ) {
							it( `Transaction initiated by a regular user should be reverted`, async function () {
								const newState = CST.SALE_STATE.SALE
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.setSaleState( newState ),
									users[ USER1 ].address
								)
							})
						}
					})

					describe( CONTRACT.METHODS.setWhitelist.SIGNATURE, function () {
						if ( TEST.METHODS.setWhitelist ) {
							it( `Transaction initiated by a regular user should be reverted`, async function () {
								const root = TEST.PASS_ROOT
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.setWhitelist( root ),
									users[ USER1 ].address
								)
							})
						}
					})

					describe( CONTRACT.METHODS.withdraw.SIGNATURE, function () {
						if ( TEST.METHODS.withdraw ) {
							it( `Transaction initiated by a regular user should be reverted`, async function () {
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.withdraw(),
									users[ USER1 ].address
								)
							})

							it( `Withdraw with no funds in the contract should be reverted`, async function () {
								await expect (
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.withdraw()
								).to.be.revertedWith( `NFT_NO_ETHER_BALANCE()` )
							})
						}
					})
				// **************************************

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.mintPreSale.SIGNATURE, function () {
						if ( TEST.METHODS.mintPreSale ) {
							it( `Transaction initiated with sale state CLOSE should be reverted`, async function () {
								const passMax   = TEST.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, TEST.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = TEST.TOKEN_OWNER_WL
								const tx_params = {
									value : TEST.PARAMS.wlMintPrice_.mul( qty )
								}
								await shouldRevertWhenSaleStateIsNotPreSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSale( qty, pass, flag, passMax, tx_params )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mintSale.SIGNATURE, function () {
						if ( TEST.METHODS.mintSale ) {
							it( `Transaction initiated with sale state CLOSE should be reverted`, async function () {
								const qty       = TEST.TOKEN_OWNER_SUPPLY
								const tx_params = {
									value : TEST.PUBLIC_PRICE.mul( qty )
								}
								await shouldRevertWhenSaleStateIsNotSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintSale( qty, tx_params )
								)
							})
						}
					})
				// **************************************

				// **************************************
				// *****            VIEW            *****
				// **************************************
					describe( CONTRACT.METHODS.balanceOf.SIGNATURE, function () {
						if ( TEST.METHODS.balanceOf ) {
							it( `Users should own 0 tokens`, async function () {
								const tokenOwner = users[ USER1 ].address
								expect(
									await contract.balanceOf( tokenOwner )
								).to.equal( 0 )
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeCCFoundersKeysAfterSettingProxy ( fixture, TEST ) {
		describe( `Should behave like CCFoundersKeys after setting proxy`, function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_user1,
						test_user2,
						test_contract,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****            VIEW            *****
				// **************************************
					describe( CONTRACT.METHODS.isApprovedForAll.SIGNATURE, function () {
						if ( TEST.METHODS.isApprovedForAll ) {
							it( `Despite not being expressely authorized, ${ USER_NAMES[ PROXY_USER ] } can manage tokens on behalf of ${ USER_NAMES[ TOKEN_OWNER ] }`, async function () {
								const tokenOwner = users[ TOKEN_OWNER ].address
								const operator   = users[ PROXY_USER ].address
								expect(
									await contract.isApprovedForAll( tokenOwner, operator )
								).to.be.true
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeCCFoundersKeysAfterSettingPreSale ( fixture, TEST ) {
		describe( `Should behave like CCFoundersKeys after setting preSale`, function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_user1,
						test_user2,
						test_contract,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.mintPreSale.SIGNATURE, function () {
						if ( TEST.METHODS.mintPreSale ) {
							it( `Transaction initiated with sale state CLOSE and whitelist unset should be reverted`, async function () {
								accesslist = TEST.ACCESS_LIST
								accesslist[ users[ TOKEN_OWNER ].address ] = 1
								merkleTree = generateRoot( accesslist )
								maxPass = getProof ( merkleTree.tree, users[ TOKEN_OWNER ].address, merkleProof )

								const account   = users[ USER1 ].address
								const proof     = merkleProof
								const qty       = 1
								const value     = TEST.WL_PRICE.mul( qty )
								const tx_params = {
									value : value
								}
								await shouldRevertWhenWitelistIsNotSet(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSale( proof, tx_params )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mintSale.SIGNATURE, function () {
						if ( TEST.METHODS.mintSale ) {
							it( `Transaction initiated with sale state PRESALE should be reverted`, async function () {
								const qty       = TEST.TOKEN_OWNER_SUPPLY
								const value     = TEST.PUBLIC_PRICE.mul( qty )
								const tx_params = {
									value : value
								}
								await shouldRevertWhenSaleStateIsNotSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintSale( qty, tx_params )
								)
							})
						}
					})
				// **************************************

				// **************************************
				// *****       CONTRACT_OWNER       *****
				// **************************************
					describe( CONTRACT.METHODS.setWhitelist.SIGNATURE, function () {
						if ( TEST.METHODS.setWhitelist ) {
							it( `Transaction initiated with sale state PRESALE should be reverted`, async function () {
								const root = TEST.PASS_ROOT
								await shouldRevertWhenSaleStateIsNotClose(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.setWhitelist( root )
								)
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeCCFoundersKeysAfterSettingWhitelist ( fixture, TEST ) {
		describe( `Should behave like CCFoundersKeys after setting whitelist`, function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_user1,
						test_user2,
						test_contract,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.mintPreSale.SIGNATURE, function () {
						if ( TEST.METHODS.mintPreSale ) {
							it( `Non whitelisted user trying to mint presale tokens should be reverted`, async function () {
								accesslist = TEST.ACCESS_LIST
								accesslist[ users[ TOKEN_OWNER ].address ] = 1
								merkleTree = generateRoot( accesslist )
								maxPass = getProof ( merkleTree.tree, users[ TOKEN_OWNER ].address, merkleProof )

								const account   = users[ USER1 ].address
								const proof     = merkleProof
								const qty       = 1
								const value     = TEST.WL_PRICE.mul( qty )
								const tx_params = {
									value : value
								}
								await shouldRevertWhenNotWhitelisted(
									contract.connect( users[ USER1 ] )
													.mintPreSale( proof, tx_params ),
									account
								)
							})

							it( `Whitelisted user trying to mint presale tokens without paying enough should be reverted with ` + CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE, async function () {
								accesslist = TEST.ACCESS_LIST
								accesslist[ users[ TOKEN_OWNER ].address ] = 1
								merkleTree = generateRoot( accesslist )
								maxPass = getProof ( merkleTree.tree, users[ TOKEN_OWNER ].address, merkleProof )

								const account   = users[ TOKEN_OWNER ].address
								const proof     = merkleProof
								const qty       = 1
								const value     = TEST.WL_PRICE.mul( qty )
								const tx_params = {
									value : 0
								}
								await shouldRevertWhenIncorrectAmountPaid(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSale( qty, pass, flag, passMax ),
									0,
									value
								)
							})

							it( `Whitelisted user trying to mint presale tokens by paying too much should be reverted with ` + CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE, async function () {
								accesslist = TEST.ACCESS_LIST
								accesslist[ users[ TOKEN_OWNER ].address ] = 1
								merkleTree = generateRoot( accesslist )
								maxPass = getProof ( merkleTree.tree, users[ TOKEN_OWNER ].address, merkleProof )

								const account   = users[ TOKEN_OWNER ].address
								const proof     = merkleProof
								const qty       = 1
								const value     = TEST.WL_PRICE.mul( qty )
								const tx_params = {
									value : value + 1
								}
								await shouldRevertWhenIncorrectAmountPaid(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSale( qty, pass, flag, passMax ),
									value + 1,
									value
								)
							})

							describe( `Whitelisted user consumes all their whitelist spot`, function () {
								beforeEach( async function () {
									accesslist = TEST.ACCESS_LIST
									accesslist[ users[ TOKEN_OWNER ].address ] = 1
									merkleTree = generateRoot( accesslist )
									maxPass = getProof ( merkleTree.tree, users[ TOKEN_OWNER ].address, merkleProof )

									const account   = users[ TOKEN_OWNER ].address
									const proof     = merkleProof
									const qty       = 1
									const value     = TEST.WL_PRICE.mul( qty )
									const tx_params = {
										value : value
									}
									await shouldEmitTransferEvent(
										contract.connect( users[ TOKEN_OWNER ] )
														.mintPreSale( qty, pass, flag, passMax ),
										contract,
										CST.ADDRESS_ZERO,
										account,
										TEST.INIT_SUPPLY + qty
									)
								})

								it( `Whitelisted user trying to mint more presale tokens should be reverted`, async function () {
									accesslist = TEST.ACCESS_LIST
									accesslist[ users[ TOKEN_OWNER ].address ] = 1
									merkleTree = generateRoot( accesslist )
									maxPass = getProof ( merkleTree.tree, users[ TOKEN_OWNER ].address, merkleProof )

									const account   = users[ TOKEN_OWNER ].address
									const proof     = merkleProof
									const qty       = 1
									const value     = TEST.WL_PRICE.mul( qty )
									const tx_params = {
										value : value
									}
									await shouldRevertWhenWhitelistIsConsumed(
										contract.connect( users[ OTHER_OWNER ] )
														.mintPreSale( qty, pass, flag, passMax, tx_params ),
										account
									)
								})
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeNFTAfterSettingSale ( fixture, TEST, CONTRACT ) {
		describe( `Should behave like NFT after setting sale state to SALE`, function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_user1,
						test_user2,
						test_contract,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract = test_contract
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.mintSale.SIGNATURE, function () {
						if ( TEST.METHODS.mintSale ) {
							it( `${ USER_NAMES[ TOKEN_OWNER ] } mints 1 token`, async function() {
								const qty       = 1
								const from      = CST.ADDRESS_ZERO
								const to        = users[ TOKEN_OWNER ].address
								const tokenId   = TEST.INIT_SUPPLY + qty
								const value     = TEST.PUBLIC_PRICE.mul( qty )
								const tx_params = {
									value : value
								}
								await shouldEmitTransferEvent(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintSale( qty, tx_params ),
									contract,
									from,
									to,
									tokenId
								)

								expect(
									await contract.ownerOf( TEST.FIRST_TOKEN )
								).to.equal( to )

								expect(
									await contract.ownerOf( tokenId )
								).to.equal( to )

								expect(
									await contract.balanceOf( to )
								).to.equal( qty )
							})

							it( `${ USER_NAMES[ TOKEN_OWNER ] } mints 2 token`, async function() {
								const qty       = 2
								const from      = CST.ADDRESS_ZERO
								const to        = users[ TOKEN_OWNER ].address
								const tokenId   = TEST.INIT_SUPPLY + qty
								const value     = TEST.PUBLIC_PRICE.mul( qty )
								const tx_params = {
									value : value
								}
								await shouldEmitTransferEvent(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintSale( qty, tx_params ),
									contract,
									from,
									to,
									tokenId
								)

								expect(
									await contract.ownerOf( TEST.FIRST_TOKEN )
								).to.equal( to )

								expect(
									await contract.ownerOf( tokenId )
								).to.equal( to )

								expect(
									await contract.balanceOf( to )
								).to.equal( qty )
							})

							it( `${ USER_NAMES[ TOKEN_OWNER ] } mints ${ TEST.MAX_BATCH } token`, async function() {
								const qty       = TEST.MAX_BATCH
								const from      = CST.ADDRESS_ZERO
								const to        = users[ TOKEN_OWNER ].address
								const tokenId   = TEST.INIT_SUPPLY + qty
								const value     = TEST.PUBLIC_PRICE.mul( qty )
								const tx_params = {
									value : value
								}
								await shouldEmitTransferEvent(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintSale( qty, tx_params ),
									contract,
									from,
									to,
									tokenId
								)

								expect(
									await contract.ownerOf( TEST.FIRST_TOKEN )
								).to.equal( to )

								expect(
									await contract.ownerOf( tokenId )
								).to.equal( to )

								expect(
									await contract.balanceOf( to )
								).to.equal( qty )
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeNFTAfterMint ( fixture, TEST, CONTRACT ) {
		describe( `Should behave like NFT after minting some tokens`, function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_user1,
						test_user2,
						test_contract,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract = test_contract
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****            VIEW            *****
				// **************************************
					describe( CONTRACT.METHODS.balanceOf.SIGNATURE, function () {
						if ( TEST.METHODS.balanceOf ) {
							it( `${ USER_NAMES[ TOKEN_OWNER ] } should own ${ TEST.TOKEN_OWNER_SUPPLY } tokens`, async function () {
								const tokenOwner = users[ TOKEN_OWNER ].address
								expect(
									await contract.balanceOf( tokenOwner )
								).to.equal( TEST.TOKEN_OWNER_SUPPLY )
							})

							it( `${ USER_NAMES[ OTHER_OWNER ] } should own ${ TEST.OTHER_OWNER_SUPPLY } tokens`, async function () {
								const tokenOwner = users[ OTHER_OWNER ].address
								expect(
									await contract.balanceOf( tokenOwner )
								).to.equal( TEST.OTHER_OWNER_STAKED )
							})
						}
					})
				// **************************************

				// **************************************
				// *****       CONTRACT_OWNER       *****
				// **************************************
					describe( CONTRACT.METHODS.setBaseURI.SIGNATURE, function () {
						if ( TEST.METHODS.setBaseURI ) {
							it( `First token URI should now be "${ TEST.NEW_BASE_URI }${ TEST.FIRST_TOKEN }"`, async function () {
								const baseURI = TEST.NEW_BASE_URI
								await contract.connect( users[ CONTRACT_DEPLOYER ] )
															.setBaseURI( baseURI )

								const tokenId = TEST.FIRST_TOKEN
								expect(
									await contract.tokenURI( tokenId )
								).to.equal( baseURI + tokenId )
							})
						}
					})

					describe( CONTRACT.METHODS.withdraw.SIGNATURE, function () {
						if ( TEST.METHODS.withdraw ) {
							it( `Withdrawal should be fulfilled`, async function () {
								expect(
									await contract.connect( users[ CONTRACT_DEPLOYER ] )
																.withdraw()
								).to.be.fulfilled
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeCCFoundersKeysAfterMintingOutNotReserved ( fixture, TEST ) {
		describe( `Should behave like CCFoundersKeys after minting out`, function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_user1,
						test_user2,
						test_contract,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer

					expect(
						await contract.totalSupply()
					).to.equal( TEST.MINT_OUT.MINT_QTY )

					expect(
						await contract.MAX_SUPPLY()
					).to.equal( TEST.MINT_OUT.PARAMS.maxSupply_ )
				})

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.mintSale.SIGNATURE, function () {
						if ( TEST.METHODS.mint ) {
							it( `Trying to mint when minted out should be reverted`, async function () {
								const qty       = 1
								const value     = TEST.PUBLIC_PRICE
								const supply    = TEST.MINT_OUT.MINT_QTY
								const maxSupply = TEST.MINT_OUT.MAX_SUPPLY
								const tx_params = {
									value : value
								}
								await shouldRevertWhenMintedOut(
									contract.connect( users[ USER1 ] )
													.mintSale( qty, tx_params ),
									qty,
									supply,
									maxSupply
								)
							})
						}
					})

					describe( `Reverting sale state to PRESALE`, function () {
						beforeEach( async function () {
							const newState = CST.SALE_STATE.PRESALE
							await contract.connect( users[ CONTRACT_DEPLOYER ] )
														.setSaleState( newState )
						})

						describe( CONTRACT.METHODS.mintPreSale.SIGNATURE, function () {
							if ( TEST.METHODS.mintPreSale ) {
								it( `Trying to mintPreSale tokens should be reverted with ` + CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY, async function () {
									accesslist = TEST.ACCESS_LIST
									accesslist[ users[ TOKEN_OWNER ].address ] = 1
									merkleTree = generateRoot( accesslist )
									maxPass = getProof ( merkleTree.tree, users[ TOKEN_OWNER ].address, merkleProof )

									const account   = users[ TOKEN_OWNER ].address
									const proof     = merkleProof
									const qty       = 1
									const value     = TEST.WL_PRICE.mul( qty )
									const supply    = TEST.MINT_OUT.MINT_QTY
									const maxSupply = TEST.MINT_OUT.MAX_SUPPLY
									const tx_params = {
										value : value
									}
									await shouldRevertWhenMintedOut(
										contract.connect( users[ TOKEN_OWNER ] )
														.mintPreSale( proof, tx_params ),
										qty,
										supply,
										maxSupply
									)
								})
							}
						})
					})
				// **************************************

				// **************************************
				// *****       CONTRACT_OWNER       *****
				// **************************************
					describe( CONTRACT.METHODS.airdrop.SIGNATURE, function () {
						if ( TEST.METHODS.airdrop ) {
							describe( `Airdopping the remaining reserved tokens`, function () {
								beforeEach( async function () {
									const accounts = [
										users[ USER1 ].address,
										users[ USER2 ].address,
									]
									const amounts  = [
										TEST.AIRDROP1,
										TEST.AIRDROP2,
									]
									await contract.connect( users[ CONTRACT_DEPLOYER ] )
																.airdrop( accounts, amounts )
								})

								it( `Airdrop when reserve depleted should be reverted`, async function () {
									const accounts = [ users[ TOKEN_OWNER ].address, ]
									const amounts  = [ 1, ]
									const qty      = 1
									const reserve  = 0
									await shouldRevertWhenReserveDepleted(
										contract.connect( users[ CONTRACT_DEPLOYER ] )
														.airdrop( accounts, amounts ),
										qty,
										reserve
									)
								})
							})
						}
					})
				// **************************************
			}
		})
	}
// **************************************

// **************************************
// *****          TEST RUN          *****
// **************************************
describe( TEST_DATA.NAME, function () {
	if ( TEST_ACTIVATION[ TEST_DATA.NAME ] ) {
		testInvalidInputs( noMintFixture, TEST_DATA, CONTRACT_INTERFACE )
		shouldSupportInterface( noMintFixture, TEST_DATA.INTERFACES, CONTRACT_INTERFACE )
		shouldBehaveLikeERC721BatchBeforeMint( noMintFixture, TEST_DATA, CONTRACT_INTERFACE )
		shouldBehaveLikeERC721BatchEnumerableBeforeMint( noMintFixture, TEST_DATA, CONTRACT_INTERFACE )
		shouldBehaveLikeWARBeforeMint( noMintFixture, TEST_DATA, CONTRACT_INTERFACE )
		shouldBehaveLikeERC721BatchAfterMint( mintFixture, TEST_DATA, CONTRACT_INTERFACE )
		shouldBehaveLikeERC721BatchMetadata( mintFixture, TEST_DATA, CONTRACT_INTERFACE )
		shouldBehaveLikeERC721BatchEnumerableAfterMint( mintFixture, TEST_DATA, CONTRACT_INTERFACE )
		shouldBehaveLikeWARAfterMint( mintFixture, TEST_DATA, CONTRACT_INTERFACE )
	}
})
