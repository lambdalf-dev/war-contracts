# Medieval Warfare NFT

This project contains the Solidity smart contracts for the Medieval Warfare NFT.

Commands:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
npx hardhat coverage
npx hardhat run scripts/deploy.js
node scripts/deploy.js
```

Note that this implementation is not compatible with random access. Tokens are minted sequentially, and it is not possible to reserve a specific range for a desired purpose.
Because of that, Enumeration is rendered very unefficient and should therefore only be used to read data but not within functions that could update the state of the blockchain.
