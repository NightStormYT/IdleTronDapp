pragma solidity ^0.4.20;

contract DiceGame
{
    address public devAddress;

    bool public isContractWake = false;

    mapping (address => uint256) public safeTron;
    mapping (address => uint256) public rewardedMicroTron;
    mapping (address => uint256) private ethBalance;

    mapping (address => uint256) public lastGooSaveTime;
    mapping (address => uint256) public lastSaveTime;
    
    uint256 public microTronProduciton;
    uint256 public buyCount = 0;

    constructor() {
        devAddress = msg.sender;
        lastSaveTime[msg.sender] = lastGooSaveTime[msg.sender];
    }

    function isPlayerTheDev(address player, address dev) public view returns (bool)
    {
        if (player != dev)
            return false;
        return true;
    }

    function getDevAddress() public view returns (address) { return address(devAddress);}

    function buyTron2(address player) external payable {
        require((msg.value / 1000000) < address(player).balance);
        uint256 tempTron = (msg.value / 1000000);
        uint256 tempFee =  devFee(msg.value / 1000000);

        uint256 microTronBought = tempTron - tempFee;

        safeTron[devAddress] += tempFee;
        safeTron[player] += microTronBought;

        if (buyCount == 0)
            lastSaveTime[player] = block.timestamp;

        buyCount += 1;
        updatePlayersMicroTron(player);
    }

    function microTronToTron(address player) public view returns (uint256) { return SafeMath.div((getMyMicroTron(player) * 100) - devFee(getMyMicroTron(player) * 100), 1000000);}

    function sellMicroTron(address player) external payable{
        require(getMyMicroTron(player) >= 0);
        require(microTronToTron(player) < address(this).balance);
        require(player != 0x0);
        updatePlayersMicroTron(player);
        uint256 microTronToSell = getMyMicroTron(player) - devFee(getMyMicroTron(player));

        msg.sender.transfer(microTronToTron(player) * 1000000);

        rewardedMicroTron[player] -= microTronToSell + devFee(getMyMicroTron(player));
        ethBalance[player] += microTronToSell;


        rewardedMicroTron[player] = 0;
        safeTron[devAddress] += devFee(getMyMicroTron(player));
        lastSaveTime[player] = block.timestamp;
    }

    function devFee(uint256 amount) public pure returns (uint256) { return SafeMath.div(SafeMath.mul(amount,5),100);}

    function seedMarket () public payable { isContractWake = true;}

    function getBalance(address player) public view returns (uint256) { return address(player).balance / 1000000;}

    function getContractAddress() public view returns (address) { return address(this);}

    function getPlayerAddress() public view returns (address) { return address(msg.sender);}

    function getContractBalance() public view returns (uint256) {
        uint256 bal = address(this).balance;
        return SafeMath.div(bal, 1000000);
    }

    function getMyTron2(address player) public view returns (uint256) { return safeTron[player];}

    function getMyMicroTron(address player) public view returns (uint256) { return balanceOfUnclaimedMicroTron(player) + rewardedMicroTron[player];}

    function balanceOfUnclaimedMicroTron(address player) internal constant returns (uint256)
    {
        uint256 lastSave = lastSaveTime[player];
        if (lastSave > 0 && lastSave < block.timestamp)
            return (getProduction(player) * (block.timestamp - lastSave)) / 100;
        return 0;
    }

    function updatePlayersMicroTron(address player) internal
    {
        uint256 gooGain = balanceOfUnclaimedMicroTron(player);
        lastSaveTime[player] = block.timestamp;
        rewardedMicroTron[player] += gooGain;
    }

    function getProduction(address player) public view returns (uint256) { return SafeMath.div(SafeMath.mul(safeTron[player], 5), 4);}
}

library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }
  
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }
  
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }
  
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}