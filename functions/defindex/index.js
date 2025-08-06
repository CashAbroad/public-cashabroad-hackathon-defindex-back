const {deposit} = require("./deposit");
const {getBalance} = require("./getBalance");
const {withdraw} = require("./withdraw");

exports.getBalance = getBalance;
exports.withdraw = withdraw;
exports.deposit = deposit;
