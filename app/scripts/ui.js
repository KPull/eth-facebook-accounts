UI = function () {

    var selections = {
        facebookAccount: null,
        ethereumAccount: null
    };

    var registerHandlers = function () {
        $('#eth-facebook-login-btn').on('click', FacebookAccounts.login);
        $('#eth-facebook-logout-btn').on('click', FacebookAccounts.logout);
    };

    var updateFacebookSelectionVisuals = function () {
        $('button.fb-account-btn.active').removeClass('active');
        $('button.fb-account-btn[data-fb-account="' + selections.facebookAccount + '"]').addClass('active');

        if (selections.facebookAccount && selections.ethereumAccount) {
            $('#link-accounts-btn').removeAttr("disabled");
        } else {
            $('#link-accounts-btn').attr("disabled", "disabled");
        }
    };

    var updateEthereumSelectionVisuals = function() {
        $('button.eth-address-btn.active').removeClass('active');
        $('button.eth-address-btn[data-eth-address="' + selections.ethereumAccount + '"]').addClass('active');
    };

    var retainSelection = function (selectionType, options) {
        if (selections[selectionType] && !options.some(function (option) {
                return option === selections[selectionType];
            })) {
            selections[selectionType] = null;
        }
    };

    var onClickFacebookAccount = function() {
        selections.facebookAccount = $(this).attr("data-fb-account");
        updateFacebookSelectionVisuals();
    };

    var onClickEthereumAccount = function() {
        selections.ethereumAccount = $(this).attr("data-eth-address");
        updateEthereumSelectionVisuals();
    };

    var subscribeEvents = function () {
        FacebookAccounts.loggedIn(function (login) {
            if (login.status === 'connected') {
                $('#eth-facebook-login-btn').hide();
                $('#eth-facebook-logout-btn').show();
            } else {
                $('#eth-facebook-login-btn').show();
                $('#eth-facebook-logout-btn').hide();
            }
        });
        FacebookAccounts.accounts(function (accounts) {
            var list = $('#eth-facebook-accounts-list');
            list.empty();

            var buttons = accounts.map(function (account) {
                var button = $('<button type="button" class="list-group-item fb-account-btn" data-fb-account="' + account.id + '"><img src="' + account.thumbnail + '" /> ' + account.name + '</button>');
                button.on('click', onClickFacebookAccount);
                return button;
            });
            list.append(buttons);

            retainSelection('facebookAccount', accounts);
            updateFacebookSelectionVisuals();
        });
        Ethereum.accounts(function(accounts) {
            var list = $('#eth-addresses-list');
            list.empty();

            var buttons = accounts.map(function (address) {
                var button = $('<button type="button" class="eth-address-btn list-group-item" data-eth-address="' + address +'">' + address + '</button>');
                button.on('click', onClickEthereumAccount);
                return button;
            });
            list.append(buttons);

            retainSelection('ethereumAccount', accounts);
            updateEthereumSelectionVisuals();
        });
    };

    $(document).ready(function () {
        registerHandlers();
        subscribeEvents();
    });

    return {};
}();