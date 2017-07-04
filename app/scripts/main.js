var selectedEthAddress = null;
var onClickEthAccount = function (event) {
    selectedEthAddress = $(this).attr('data-eth-address');
    $('button.eth-address-btn').removeClass('active');
    $('button.eth-address-btn[data-eth-address="' + selectedEthAddress + '"]').addClass('active');
};

var selectedFacebookAccount = null;
var onClickFacebookAccount = function (event) {
    selectedFacebookAccount = $(this).attr('data-fb-account');
    $('button.fb-account-btn').removeClass('active');
    $('button.fb-account-btn[data-fb-account="' + selectedFacebookAccount + '"]').addClass('active');
};

$(document).ready(function () {
    $.ajaxSetup({cache: true});

    web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

    fbEth.EthAccounts.onUpdate(function (event) {
        var list = $('#eth-addresses-list');
        var buttons = event.addresses.map(function (address) {
            var button = $('<button type="button" class="eth-address-btn list-group-item" data-eth-address="' + address +'">' + address + '</button>');
            button.on('click', onClickEthAccount);
            return button;
        });
        list.empty();
        list.append(buttons);
    });
    fbEth.EthAccounts.refresh();
});

fbEth = {};