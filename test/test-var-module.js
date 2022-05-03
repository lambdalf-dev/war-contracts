// For common constants
const CST = {
	// ETHERS JS
	ETH                : ethers.constants.EtherSymbol,
	ONE_ETH            : ethers.constants.WeiPerEther,
	ADDRESS_ZERO       : ethers.constants.AddressZero,
	HASH_ZERO          : ethers.constants.HashZero,
	NUMBER_ZERO        : ethers.constants.Zero,
	NUMBER_ONE         : ethers.constants.One,
	NUMBER_TWO         : ethers.constants.Two,
	MAX_UINT256        : ethers.constants.MaxUint256,
}

const USER1             = 'USER1'
const USER2             = 'USER2'
const PROXY_USER        = 'PROXY_USER'
const TOKEN_OWNER       = 'TOKEN_OWNER'
const OTHER_OWNER       = 'OTHER_OWNER'
const CONTRACT_DEPLOYER = 'CONTRACT_DEPLOYER'

const USER_NAMES = {
	USER1             : 'User1',
	USER2             : 'User2',
	PROXY_USER        : 'ProxyUser',
	TOKEN_OWNER       : 'TokenOwner',
	OTHER_OWNER       : 'OtherOwner',
	CONTRACT_DEPLOYER : 'ContractDeployer',
}

module.exports = {
	CONTRACT_DEPLOYER,
	OTHER_OWNER,
	TOKEN_OWNER,
	PROXY_USER,
	USER_NAMES,
	USER2,
	USER1,
	CST,
}
