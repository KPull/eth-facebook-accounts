Api = function () {

    var asyncSendClaim = function (fbToken, fbAccount, ethAccount) {
        return new Promise(function (resolve, reject) {
            $.post("http://localhost:8000", {
                fbToken: fbToken,
                fbAccount: fbAccount,
                ethAccount: ethAccount
            }, 'json').then(function (data) {
                resolve(data);
            }, function (error) {
                reject(error);
            });
        });
    };

    return {
        asyncSendClaim: asyncSendClaim
    };
}();