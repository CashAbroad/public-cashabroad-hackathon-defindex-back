const {onRequest} = require("firebase-functions/v2/https");
const {DeFindexClient} = require("../.core/services/defindex");
const Joi = require("joi");

const {
  Operation,
  TransactionBuilder,
  Networks,
  Keypair,
} = require("stellar-sdk");

const walletAddress = process.env.DEFINDEX_USER_PK;
const walletSecret = process.env.DEFINDEX_USER_SK;

const schema = Joi.object({
  amount: Joi.number().required(),
});

exports.deposit = onRequest({cors: true}, async (req, res) => {
  console.log("ejecutando yield-deposit");
  try {
    const {amount} = Joi.attempt(req.body, schema);
    const amountWithDecimals = Operation._toXDRAmount(
        amount.toString()).toString();
    console.log("Amount with 7 decimals: ", amountWithDecimals);
    const defindexClient = new DeFindexClient();
    const {
      xdr: unsignedTransaction,
    } = await defindexClient.post("deposit",
        {
          amounts: [Number(amountWithDecimals)],
          from: walletAddress,
          invest: true,
          slippageBps: 100,
        },
    );
    const signedXDR = await signTransaction(unsignedTransaction);
    console.log("Transactions after sign: ", signedXDR);
    const {hash} = await defindexClient.send(signedXDR);
    res.status(200).send({
      success: true,
      tx: {
        hash: hash,
      },
    });
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).send({success: false, message: error.details[0].message});
    } else {
      res.status(400).send({success: false, message: error.message || error});
    }
  }
});

/**
 * function to sign xdr transaction
 * @param {string} txXDR
 * @return {string}
 */
async function signTransaction(txXDR) {
  console.log("XDR before sign: ", txXDR);
  const networkPassphrase = Networks.PUBLIC;
  try {
    const keyPair = Keypair.fromSecret(walletSecret);
    const tx = await TransactionBuilder.fromXDR(txXDR, networkPassphrase);
    console.log(tx);
    await tx.sign(keyPair);
    const signedXDR = await tx.toXDR();
    return signedXDR;
  } catch (error) {
    throw new Error(error);
  }
}


