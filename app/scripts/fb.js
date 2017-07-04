FacebookAccounts = function() {

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

    var _loggedIn = 'unavailable';
    var _loggedIn_handlers = [];
    var loggedIn = function () {
        if (arguments.length == 0) {
            return _loggedIn;
        } else if (typeof(arguments[0]) === 'function') {
            _loggedIn_handlers.push(arguments[0]);
            arguments[0](_loggedIn);
        } else {
            var oldValue = _accounts;
            var newValue = arguments[0];
            _loggedIn = arguments[0];
            _loggedIn_handlers.forEach(function (handler) {
                handler(newValue, oldValue);
            });
        }
    };

    var asyncDownloadFbSdk = function () {
        return new Promise(function (resolve, reject) {
            $.getScript('//connect.facebook.net/en_US/sdk.js')
                .done(resolve)
                .fail(reject);
        });
    };

    var initFB = function () {
        FB.init({
            appId: '',
            version: 'v2.7'
        });
    };

    var subscribeToLoginEvents = function () {
        FB.Event.subscribe('auth.login', onFBLogin);
        FB.Event.subscribe('auth.logout', onFBLogout);
    };

    var asyncGetMyAccount = function () {
        return new Promise(function (resolve, reject) {
            FB.api('/me', 'GET', {"fields": "picture,name"}, function (response) {
                if (!response || response.error) {
                    reject();
                } else {
                    resolve([{
                        id: response.id,
                        name: response.name,
                        thumbnail: response.picture.data.url,
                        accessToken: FB.getAccessToken()
                    }]);
                }
            });
        });
    };

    var asyncGetMyManagedPages = function () {
        return new Promise(function (resolve, reject) {
            FB.api('/me/accounts', 'GET', {"fields": "picture,name,access_token"}, function (response) {
                if (!response || response.error) {
                    reject();
                } else {
                    resolve(response.data.map(function (page) {
                        return {
                            id: page.id,
                            name: page.name,
                            thumbnail: page.picture.data.url,
                            accessToken: page.access_token
                        }
                    }));
                }
            });
        });
    };

    var asyncGetAllAccounts = function () {
        return Promise.all([asyncGetMyAccount(), asyncGetMyManagedPages()])
            .then(function (accountLists) {
                var list = accountLists[0].concat(accountLists[1]);
                accounts(list);
                return list;
            });
    };

    var asyncPerformLogin = function () {
        return new Promise(function (resolve, reject) {
            FB.login(function (response) {
                if (!response || response.error) {
                    reject();
                } else {
                    resolve(response);
                }
            }, {
                scope: 'pages_show_list'
            });
        });
    };

    var onFBLogin = function (response) {
        loggedIn(response);
        asyncGetAllAccounts();
    };

    var onFBLogout = function (response) {
        loggedIn(response);
        accounts([]);
    };

    var asyncGetLoginStatus = function () {
        return new Promise(function (resolve, reject) {
            FB.getLoginStatus(function (response) {
                if (!response || response.error) {
                    reject();
                } else {
                    loggedIn(response);
                    resolve(response);
                }
            });
        });
    };

    asyncDownloadFbSdk()
        .then(initFB)
        .then(subscribeToLoginEvents)
        .then(asyncGetLoginStatus)
        .then(function (response) {
            if (response.status === 'connected') {
                return asyncGetAllAccounts();
            }
        });

    return {
        accounts: accounts,
        loggedIn: loggedIn,
        login: asyncPerformLogin
    };

}();