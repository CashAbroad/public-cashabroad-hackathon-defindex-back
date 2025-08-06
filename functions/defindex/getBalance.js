const {onRequest} = require("firebase-functions/v2/https");
const {DeFindexClient} = require("../.core/services/defindex");
const {
  Operation,
  Horizon,
} = require("stellar-sdk");
const currency = require("currency.js");


const serverUrl = process.env.STELLAR_SERVER_PRODUCTION;
const server = new Horizon.Server(serverUrl);
const walletAddress = process.env.DEFINDEX_USER_PK;

/**
 * Returns the acumulated yield, balance and apy from a vault
 */
exports.getBalance = onRequest({cors: true}, async (req, res) => {
  try {
    const {balance} = await getBalanceFromWallet();
    const defindexClient = new DeFindexClient();
    const {underlyingBalance} = await defindexClient.get("balance", {
      from: walletAddress,
    });
    const yieldBalance = Operation._fromXDRAmount(underlyingBalance);
    const {apy} = await defindexClient.get("apy");
    res.status(200).send({
      success: true,
      yield: {
        accYield: currency(yieldBalance, {precision: 5}),
        walletBalance: currency(balance, {precision: 4}),
        apy: currency(apy, {precision: 2}),
      },
    });
  } catch (error) {
    res.status(400).send({success: false, message: error.message || error});
  }
});

/**
 * this function get de balance of USDC from the wallet that use for this case
 */
async function getBalanceFromWallet() {
  try {
    const account = await server.loadAccount(walletAddress);
    const usdcBalance = account.balances.find(
        (b) => b.asset_code == "USDC",
    );
    console.log(usdcBalance)
    return usdcBalance;
  } catch (error) {
    throw new Error(error);
  }
}


