Ethereum = function() {

    var _accounts = [];
    var _accounts_handlers = [];
    var accounts = function () {
        if (arguments.length == 0) {
            return _accounts;
        } else if (typeof(arguments[0]) === 'function') {
            _accounts_handlers.push(arguments[0]);
            arguments[0](_accounts);
        } else {
            var oldValue = _accounts;
            var newValue = arguments[0];
            _accounts = arguments[0];
            _accounts_handlers.forEach(function (handler) {
                handler(newValue, oldValue);
            });
        }
    };

    accounts(web3.eth.accounts);

    return {
        accounts: accounts
    };

}();