// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

//    __
//   |  |                     __
//   |  |                    |  |                    (_'_)
//   |  |__    ___     ___   |  |_  __     __  ____    _  __  _
//   |     \  /   \   /   \  |   _| \  \ /  / | '  \  | | \ \/ /
//   |  |  | |  |  | |  |  | |  |_   \, v  /  |  |  | | |  >  <
//   |_____/  \___/   \___/   \___|    /  /   | .__/  |_| /_/\_\
//                                    /  /    | |
//                                   /__/     |_|

//ALERT: tokenID starts at 0
//CHECK: better one mint func or 2 ?
//CHECK: 10 mint max for WL or all ?

contract BootyPix is ERC721A, PaymentSplitter {
    /** Cost of the tokens before token 3556 */
    uint256 public constant FIRST_PHASE_COST = 0.0069 ether;
    /** Cost of the tokens after token 3555 */
    uint256 public constant SECOND_PHASE_COST = 0.0096 ether;
    /** Max supply */
    uint256 public constant MAX_SUPPLY = 5_555;
    /**Maximum amount of token to mint per transaction and per wallet */
    uint256 public constant MAX_PER_WALLET = 10;
    /** merkleRoot of the whitelist */
    bytes32 private merkleRoot;
    /**Reveal state */
    bool public revealed;
    /** lock the possibility to change sale Status */
    bool public lock;
        /** owner of the contract to call restricted function*/
    address private owner;
    /**Uri of the tokens when not revealed */
    string public nonRevealedUri;
    /**Base Uri */
    string private baseURI_;

    Status private saleStatus;


    enum Status {
        DEACTIVATED,
        WHITELIST,
        PUBLIC
    }

    mapping(address => bool) private whitelistClaimed;
    mapping(address => uint) mintPerAddress;

    /** Notifiy on opening reveal */
    event Revealed(bool _revealed);
    /** Notify when sale status change */
    event StatusChange(Status _StatusChange);
    /**Notify when an address redeems its free mint */
    event Redeem(address indexed _user, bool indexed _reedemed);

    ///@notice modifier to allow only owner to call restricted functions
    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    //CHECK: is sale open on deployment or manually activated
    constructor(
        string memory baseUri_,
        string memory _nonRevealedUri,
        address[] memory _payees,
        uint[] memory _shares,
        bytes32 _merkleRoot
    ) payable ERC721A("BootyPix", "BTP") PaymentSplitter(_payees, _shares) {
        baseURI_ = baseUri_;
        nonRevealedUri = _nonRevealedUri;
        owner = _payees[0];
        merkleRoot = _merkleRoot;
        _mintERC2309(_payees[0], 355);
        _mintERC2309(_payees[1], 100);
        _mintERC2309(_payees[2], 100);
    }

    //==========================================
    //             METADATA
    //==========================================

    ///@notice returns the base URI
    function _baseURI() internal view override returns (string memory) {
        if (!revealed) return nonRevealedUri;
        else return baseURI_;
    }

    function baseURI() external returns(string memory){}

    /// @notice Sets the base metadata URI
    /// @param _newBaseUri The new URI
    function setBaseUri(string calldata _newBaseUri) external {
        baseURI_ = _newBaseUri;
    }

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token. Take non revealed metadata into account
     * @notice
     * @param tokenId tokenId
     */
    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        if (!_exists(_tokenId)) revert URIQueryForNonexistentToken();

        if (!revealed) return nonRevealedUri;
        string memory baseExtension = ".json";
        return
            bytes(baseURI_).length != 0
                ? string(
                    abi.encodePacked(baseURI_, _toString(_tokenId), baseExtension)
                )
                : "";
    }

    //==============================================
    //           SALE STATUS
    //==============================================

    ///@notice activate reveal
    ///emits a {Revealed} event
    function reveal() external onlyOwner {
        revealed = true;
        emit Revealed(true);
    }

    function lockSaleStatus() external onlyOwner 
    {
        require(saleStatus == Status.PUBLIC, "sale is not active");//CHECK: ?
        lock = true;
    }

    ///@notice activate or deactivate sale for safety purposes
    ///emits a {StatusChange} event
    function changeSaleStatus(
        Status _status
    ) external onlyOwner returns (Status) {
        require(!lock, "sale status is locked");
        saleStatus = _status;
        emit StatusChange(saleStatus);
        return saleStatus;
    }

    //========================================
    //         MINT
    //========================================

    ///@notice mints the number of tokens. Limited to 5 per transaction. taking into account first mint per address (once) for free
    /// or free 5 mints if allowed
    ///@param _amount the amount of tokens to mint
    ///emits a {Transfer} event for each new token
    function mint(uint _amount) external payable {
        require(saleStatus == Status.PUBLIC, "public sale not active");
        require(
            mintPerAddress[msg.sender] + _amount <= MAX_PER_WALLET,
            "only 10 mint per address"
        );
        require(totalSupply() + _amount <= MAX_SUPPLY, "amount exceeds supply");
        require(_amount >= 1, "cannot be 0");
        require(msg.value == _amount * SECOND_PHASE_COST, "not enough funds");
        mintPerAddress[msg.sender] += _amount;
        _safeMint(msg.sender, _amount);
    }

    ///@notice mints only for whitelisted addresses. 10 mints per address max
    ///@param _amount amount to be minted
    ///@param _merkleProof bytes32 merkleProof to verify that user is whitelisted
    ///emits a {Redeem} event when free mint is reedemed. One time per address
    ///emits a {Transfer} event for each new token
    function whitelistMint(
        uint256 _amount,
        bytes32[] calldata _merkleProof
    ) external payable {
        require(_amount >= 1, "cannot be 0 amount");
        require(saleStatus == Status.WHITELIST, "WL not active");
        require(
            mintPerAddress[msg.sender] + _amount <= MAX_PER_WALLET,
            "only 10 mint per address"
        );
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(_merkleProof, merkleRoot, leaf),
            "invalid proof"
        );
        uint amountToPay = _amount;
        if (!whitelistClaimed[msg.sender]) {
            amountToPay -= 1;
            whitelistClaimed[msg.sender] = true;
            emit Redeem(msg.sender, true);
        }
        require(
            msg.value == amountToPay * FIRST_PHASE_COST,
            "not the right amount"
        );
        mintPerAddress[msg.sender] += _amount;
        whitelistClaimed[msg.sender] = true;
        _safeMint(msg.sender, _amount);
    }

    //=======================================
    //          GETTERS
    //=======================================

    function checkStatus() external view returns(Status s){
        s = saleStatus;
    }

    function remainingMints(address _user) external view returns(uint m){
        m = 10 - mintPerAddress[_user];
    }

    function checkIfRedeemed(address _user) external view returns(bool r){
        r = whitelistClaimed[_user];
    }
    //CHECK: is wihtelisted view ?

    function releasing(address account) public {
        super.release(payable(account));
    }
}
