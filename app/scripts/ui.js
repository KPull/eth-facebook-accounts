UI = function () {

    var registerHandlers = function () {
        $('#eth-facebook-login-btn').on('click', FacebookAccounts.login);
    };

    var subscribeEvents = function () {
        FacebookAccounts.loggedIn(function (login) {
            if (login.status === 'connected') {
                $('#eth-facebook-login-btn').hide();
            } else {
                $('#eth-facebook-login-btn').show();
            }
        });
        FacebookAccounts.accounts(function (accounts) {
            var list = $('#eth-facebook-accounts-list');
            list.empty();

            var buttons = accounts.map(function (account) {
                var button = $('<button type="button" class="list-group-item fb-account-btn" data-fb-account="' + account.id + '"><img src="' + account.thumbnail + '" /> ' + account.name + '</button>');
                // button.on('click', onClickFacebookAccount);
                return button;
            });
            list.append(buttons);
        });
    };

    $(document).ready(function() {
        registerHandlers();
        subscribeEvents();
    });

    return {};
}();