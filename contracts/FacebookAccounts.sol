pragma solidity ^0.4.11;

contract FacebookAccounts {
    
    struct Claim {
        
        /** Whether a claim is active by this address */
        bool active;
        
        /** Timestamp when the claim was made */
        uint timestamp;
        
        /** The amount of ether paid to make this claim */
        uint paid;
        
        /** Whether the fee is still in escrow */ 
        bool escrowed;
        
    }
    
    struct FacebookAccountToken {
        /** Which addresses have claimed (NOT VERIFIED YET) to own said Facebook account */
        mapping(address => Claim) claims;
        
        /** Which addresses own the specified Facebook page */
        mapping(address => bool) isOwned;
    }
    
    /** The owner of this contract who is allowed to withdraw money from it */
    address public owner;
    
    /** Specifies which addresses are allowed to complete the verification process */
    mapping(address => bool) public verifier;
    
    /** Maps facebook account IDs to Ethereum addresses. */
    mapping(string => FacebookAccountToken) facebookAccounts;
    
    /** Amount of money withdrawable by the owner of the contract */
    uint256 public ownerBalance;
    
    /** Amount of ether available for withdrawal as refunds */
    mapping(address => uint) public refundableBalance;
    
    /** Amount of ether needed to make a claim to a Facebook Account */
    uint256 public verificationPrice;
    
    /** Makes sure that the message sender is allowed to verify accounts */
    modifier hasVerificationPermission() {
        assert(msg.sender == owner || verifier[msg.sender]);
        _;
    }
    
    modifier byOwner() {
        assert(msg.sender == owner);
        _;
    }
    
    function FacebookAccounts(uint _verificationPrice) {
        owner = msg.sender;
        verificationPrice = _verificationPrice;
    }
    
    function changeVerificationPrice(uint _verificationPrice) byOwner {
        verificationPrice = _verificationPrice;
    }
    
    function changeContractOwner(address _owner) byOwner {
        owner = _owner;
    }
    
    function addVerifier(address _verifier) byOwner {
        verifier[_verifier] = true;
    }
    
    function removeVerifier(address _verifier) byOwner {
        verifier[_verifier] = false;
    }
    
    /** Claim that the specified Facebook account belongs to the sender of the message */
    function claimAccount(string _account) payable {
        var fbAccount = facebookAccounts[_account];
        var claim = fbAccount.claims[msg.sender];
        assert(!claim.active);
        assert(!fbAccount.isOwned[msg.sender]);
        assert(msg.value == verificationPrice);
        
        facebookAccounts[_account].claims[msg.sender] = Claim({
            active: true,
            timestamp: now,
            paid: verificationPrice,
            escrowed: true
        });
    }
    
    /** 
     * Verifiers acknowledge that the claim has been received and that the funds
     * can be released from escrow
     */
    function acknowledgeClaim(string _account, address _claimant) hasVerificationPermission {
        var claim = facebookAccounts[_account].claims[_claimant];
        assert(claim.active);
        assert(claim.escrowed);
        claim.escrowed = false;
        ownerBalance += claim.paid;
    }
    
    /**
     * Mark a claim as inactive and refund money back to the claimant.
     * If the funds were still held in escrow (ie. the claim was not acknowledged), the refund will
     * be made available immediately for withdrawal.
     * Otherwise, the refund is taken from the owner's balance or, in case the owner doesn't have enough
     * funds deposited, the refund must be sent in with this transaction.
     */
    function refundClaim(string _account, address _claimant) hasVerificationPermission payable {
        var claim = facebookAccounts[_account].claims[_claimant];
        assert(claim.active);
        if (!claim.escrowed) {
            if (ownerBalance >= claim.paid) {
                ownerBalance -= claim.paid;
            } else {
                assert(msg.value == claim.paid);
            }
        }
        refundableBalance[_claimant] += claim.paid;
        facebookAccounts[_account].claims[_claimant].active = false;
    }
    
    function askForRefund(string _account) {
        var claim = facebookAccounts[_account].claims[msg.sender];
        assert(claim.active);
        assert(claim.escrowed);
        assert(claimEligibleForRefund(_account, msg.sender));
        claim.active = false;
        assert(msg.sender.send(claim.paid));
    }
    
    function completeVerification(string _account, address _claimant) hasVerificationPermission {
        var fbAccount = facebookAccounts[_account];
        var claim = fbAccount.claims[_claimant];
        assert(claim.active);
        assert(!claim.escrowed);
        claim.active = false;
        fbAccount.isOwned[_claimant] = true;
    }
    
    function revokeAccountOwnership(string _account) {
        var fbAccount = facebookAccounts[_account];
        assert(fbAccount.isOwned[msg.sender]);
        fbAccount.isOwned[msg.sender] = false;
    }
    
    function withdrawRefund() {
        assert(refundableBalance[msg.sender] > 0);
        var amount = refundableBalance[msg.sender];
        refundableBalance[msg.sender] = 0;
        assert(msg.sender.send(amount));
    }
    
    function withdrawOwnerBalance(uint256 amount) byOwner {
        assert(amount <= ownerBalance);
        ownerBalance -= amount;
        assert(owner.send(amount));
    }
    
    function depositOwnerBalance() byOwner payable {
        ownerBalance += msg.value;
    }
    
    function isAccountOwnedByAddress(string _account, address _owner) constant returns (bool) {
        return facebookAccounts[_account].isOwned[_owner];
    }
    
    function claimEligibleForRefund(string _account, address _claimant) private returns (bool) {
        var claim = facebookAccounts[_account].claims[_claimant];
        return (now > claim.timestamp + 24 hours);
    }
    
}
