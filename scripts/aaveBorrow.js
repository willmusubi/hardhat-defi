const { getNamedAccounts, ethers, network } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");
const { networkConfig } = require("../helper-hardhat-config");

async function main() {
    // 1. Get Weth
    // the protocol treats everything as an ERC20Toekn
    await getWeth();
    const { deployer } = await getNamedAccounts();

    // 2. Get the Lending Pool
    const lendingPool = await getLendingPool(deployer);
    wethTokenAddress = networkConfig[network.config.chainId].wethToken;
    lendingPoolAddress = lendingPool.address;

    // 3. Approve
    await approveErc20(
        wethTokenAddress,
        lendingPoolAddress, // lending pool is the spender here
        AMOUNT,
        deployer
    );

    // 4. Deposit
    // address asset,
    // uint256 amount,
    // address onBehalfOf,
    // uint16 referralCode

    console.log("Depositing...");
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log("Deposited");

    // 5. Borrow, After deposit, we have collaterals to borrow
    // Before borrow, we need to figure out how much we have borrow, and the amount of collacterals that allows us to borrow how much
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        deployer
    );
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

async function approveErc20(
    erc20Address,
    spenderAddress,
    amountToSpend,
    account
) {
    const ERC20Toekn = await ethers.getContractAt(
        "IERC20",
        erc20Address,
        account
    );
    const txResponse = await ERC20Toekn.approve(spenderAddress, amountToSpend);
    await txResponse.wait(1);
    console.log("Approved!");
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account);
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);
    return { availableBorrowsETH, totalDebtETH };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
