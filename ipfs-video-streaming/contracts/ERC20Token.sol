pragma solidity ^0.4.18;

import './SimpleToken.sol';

contract ERC20Token is SimpleToken {
    string public name;                   
    uint8 public decimals;              
    string public symbol;              
    string public version = 'H1.0';  

    function ERC20Token() {
        balances[msg.sender] = 100000;               
        totalSupply = 100000;               
        name = "IS";                               
        decimals = 0;   
        symbol = "IS";       
    }

    function approveAndCall(address _spender, uint256 _value, bytes _extraData) returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);

        if(!_spender
            .call(bytes4(bytes32(sha3("receiveApproval(address,uint256,address,bytes)"))), 
             msg.sender, _value, this, _extraData)) {
            throw;
        }
        
        return true;
    }
}