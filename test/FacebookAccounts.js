contract('FacebookAccounts', function(accounts) {
    it('should have no balance', function(done) {
        var contract = FacebookAccounts.deployed();

        contract.verificationPrice.call().then(function(price) {
            assert.equal(price.valueOf(), 599, 'price should be 599');
        }).then(done).catch(done);
    })
});
