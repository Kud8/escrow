pragma solidity 0.4.18;

contract Escrow {
    address public owner;
    address public buyer;
    address public seller;
    bool public buyerOk = false;
    bool public sellerOk = false;
    uint public balance = 0;
    uint public start;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    modifier onlyBuyer() {
        require(msg.sender == buyer);
        _;
    }

    function Escrow(address _buyer, address _seller) public {
        buyer = _buyer;
        seller = _seller;
        owner = msg.sender;
        start = now;
    }

    function deposit() external payable onlyBuyer {
        balance += msg.value;
    }

    function accept() external {
        if (msg.sender == buyer) {
            buyerOk = true;
        }
        if (msg.sender == seller) {
            sellerOk = true;
        }

        if (buyerOk && sellerOk) {
            // owner.transfer(balance / 100);
            selfdestruct(seller);
        } else if (buyerOk && !sellerOk && now > start + 30 days) {
            selfdestruct(buyer);
        }
    }

    function cancel() external {
        if (msg.sender == buyer){
            buyerOk = false;
        }
        if (msg.sender == seller){
            sellerOk = false;
        }

        if (!buyerOk && !sellerOk){
            selfdestruct(buyer);
        }
    }

    function kill() external onlyOwner {
        selfdestruct(buyer);
    }
}
