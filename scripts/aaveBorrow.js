const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth } = require("../scripts/getWeth");
const { networkConfig } = require("../helper-hardhat-config");

async function main() {
    // the protocol treats everything as an ERC20Toekn
    await getWeth();
    const { deployer } = await getNamedAccounts();

    const lendingPool = await getLendingPool(deployer);
    console.log(`LendingPool Address ${lendingPool.address}`);
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[network.config.chainId].lendingPoolAddressesProvider,
        account
    );
    const lendingPoolAddress =
        await lendingPoolAddressesProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    );
    return lendingPool;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
