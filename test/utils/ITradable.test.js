const ARTIFACT = require( `../../artifacts/contracts/mocks/utils/Mock_ITradable.sol/Mock_ITradable.json` )
const PROXY = require( `../../artifacts/contracts/mocks/external/Mock_ProxyRegistry.sol/Mock_ProxyRegistry.json` )
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
// **************************************

// **************************************
// *****       TEST VARIABLES       *****
// **************************************
	// For contract data
	const CONTRACT = {
		NAME : `Mock_ITradable`,
		METHODS : {
			isRegisteredProxy : {
				SIGNATURE       : `isRegisteredProxy(address,address)`,
				PARAMS          : [ `tokenOwner_`, `operator_` ],
			},
			addProxyRegistry  : {
				SIGNATURE       : `addProxyRegistry(address)`,
				PARAMS          : [ `proxyRegistryAddress_` ],
			},
		},
	}

	const TEST_DATA = {
		NAME : `ITradable`,
		METHODS : {
			isRegisteredProxy : true,
			addProxyRegistry  : true,
		}
	}

	let users = {}
	let contract
	let proxy_contract
	let test_proxy_contract_params
// **************************************

// **************************************
// *****          FIXTURES          *****
// **************************************
	async function fixture () {
		const [
			test_user1,
			test_user2,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_proxy_contract_params = []
		test_proxy_contract = await deployContract( test_contract_deployer, PROXY, test_proxy_contract_params )
		await test_proxy_contract.deployed()
		await test_proxy_contract.setProxy( test_token_owner.address, test_proxy_user.address )

		test_contract_params = [
			test_proxy_contract.address
		]
		test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		return {
			test_user1,
			test_user2,
			test_contract,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_proxy_contract,
			test_contract_deployer,
		}
	}
// **************************************

// **************************************
// *****        TEST  SUITES        *****
// **************************************
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

					defaultArgs = {}
					defaultArgs [ CONTRACT.METHODS.isRegisteredProxy.SIGNATURE ] = {
						err  : null,
						args : [
							users[ TOKEN_OWNER ].address,
							users[ PROXY_USER ].address,
						]
					}
					defaultArgs [ CONTRACT.METHODS.addProxyRegistry.SIGNATURE ] = {
						err  : null,
						args : [
							test_proxy_contract.address,
						]
					}
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

	async function shouldBehaveLikeMock_ITradable ( fixture, TEST, CONTRACT ) {
		describe( `Should behave like ITradable`, function () {
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

				describe( CONTRACT.METHODS.addProxyRegistry.SIGNATURE, function () {
					if ( TEST.METHODS.addProxyRegistry ) {
						it( `Setting up a proxy registry`, async function () {
							const proxyRegistryAddress = proxy_contract.address
							await expect(
								contract.connect( users[ CONTRACT_DEPLOYER ] )
												.addProxyRegistry( proxyRegistryAddress )
							).to.be.fulfilled
						})
					}
				})

				describe( CONTRACT.METHODS.isRegisteredProxy.SIGNATURE, function () {
					if ( TEST.METHODS.isRegisteredProxy ) {
						beforeEach( async function () {
							const proxyRegistryAddress = proxy_contract.address
							await contract.connect( users[ CONTRACT_DEPLOYER ] )
														.addProxyRegistry( proxyRegistryAddress )
						})

						it( `${ USER_NAMES[ PROXY_USER ] } is a registered proxy for ${ USER_NAMES[ TOKEN_OWNER ] }`, async function () {
							const tokenOwner = users[ TOKEN_OWNER ].address
							const operator   = users[ PROXY_USER ].address
							expect(
								await contract.isRegisteredProxy( tokenOwner, operator )
							).to.be.true
						})

						it( `${ USER_NAMES[ PROXY_USER ] } is not a registerd proxy for ${ USER_NAMES[ CONTRACT_DEPLOYER ] }`, async function () {
							const tokenOwner = users[ CONTRACT_DEPLOYER ].address
							const operator   = users[ PROXY_USER ].address
							expect(
								await contract.isRegisteredProxy( tokenOwner, operator )
							).to.be.false
						})
					}
				})
			}
		})
	}
// **************************************

// **************************************
// *****          TEST RUN          *****
// **************************************
describe( TEST_DATA.NAME, function () {
	if ( TEST_ACTIVATION[ TEST_DATA.NAME ] ) {
		testInvalidInputs( fixture, TEST_DATA, CONTRACT )
		shouldBehaveLikeMock_ITradable( fixture, TEST_DATA, CONTRACT )
	}
})
