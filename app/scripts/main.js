var downloadFBLib = function () {
    return new Promise(function (resolve, reject) {
        $.getScript('//connect.facebook.net/en_US/sdk.js', function () {
            $('#loginbutton,#feedbutton').removeAttr('disabled');
            resolve();
        });
    });
};

var initFB = function () {
    FB.init({
        appId: '',
        version: 'v2.7'
    });
};

var getLoginStatus = function (response) {
    return new Promise(function (resolve, reject) {
        FB.getLoginStatus(function (response) {
            resolve(response);
        });
    });
};

function loginAndGetFacebookAccounts() {
    return new Promise(function (resolve, reject) {
        FB.login(function (response) {
            if (response.authResponse) {
                resolve();
            } else {
                reject();
            }
        });
    }).then(function () {
        return requestFacebookAccounts();
    });
}

var requestFacebookAccounts = function () {
    return Promise.all([new Promise(function (resolve, reject) {
        FB.api('/me', 'GET', {"fields": "picture,name"}, function (response) {
            resolve([{
                id: response.id,
                name: response.name,
                thumbnail: response.picture.data.url,
                accessToken: FB.getAccessToken()
            }]);
        });
    }), new Promise(function (resolve, reject) {
        FB.api('/me/accounts', 'GET', {"fields": "picture,name,access_token"}, function (response) {
            resolve(response.data.map(function (page) {
                return {
                    id: page.id,
                    name: page.name,
                    thumbnail: page.picture.data.url,
                    accessToken: page.access_token
                }
            }));
        });
    })]).then(function (accountLists) {
        return accountLists[0].concat(accountLists[1]);
    });
};

var retrieveFacebookAccounts = function (response) {
    if (response.status === 'connected') {
        return requestFacebookAccounts();
    } else {
        return loginAndGetFacebookAccounts();
    }
};

var displayFacebookAccounts = function (accounts) {
    var list = $('#eth-facebook-accounts-list');
    list.empty();

    var buttons = accounts.map(function (account) {
        var button = $('<button type="button" class="list-group-item fb-account-btn" data-fb-account="' + account.id + '"><img src="' + account.thumbnail + '" /> ' + account.name + '</button>');
        button.on('click', onClickFacebookAccount);
        return button;
    });
    list.append(buttons);
};

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

    downloadFBLib()
        .then(initFB)
        .then(getLoginStatus)
        .then(retrieveFacebookAccounts)
        .then(displayFacebookAccounts);

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