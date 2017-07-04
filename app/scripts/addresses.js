var Addresses = function() {
    var handlers = {
        update: []
    };

    var previousAddresses = [];

    var triggerEvent = function(eventType, event) {
        handlers[eventType].forEach(function(handler) {
            handler(event);
        });
    };

    var refresh = function() {
        var freshAddresses = web3.eth.accounts;
        if (freshAddresses !== previousAddresses) {
            triggerEvent('update', {
                oldAddresses: previousAddresses,
                addresses: freshAddresses
            });
            previousAddresses = freshAddresses;
        }
    };

    var onUpdate = function(handler) {
        if (typeof (handler) !== 'function') {
            throw 'handler must be a function';
        }
        handlers.update.push(handler);
    };

    return {
        refresh: refresh,
        onUpdate: onUpdate
    };
};

fbEth.EthAccounts = Addresses();