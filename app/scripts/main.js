web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

$(document).ready(function () {
    $.ajaxSetup({cache: true});
});