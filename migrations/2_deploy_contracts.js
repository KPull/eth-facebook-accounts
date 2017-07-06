var FacebookAccounts = artifacts.require("./FacebookAccounts.sol");

module.exports = function(deployer) {
  deployer.deploy(FacebookAccounts, 9999);
};
