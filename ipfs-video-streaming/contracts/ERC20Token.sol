pragma solidity ^0.4.18;

import './SimpleToken.sol';

contract ERC20Token is SimpleToken {
   
   function () {
        //if ether is sent to this address, send it back.
        throw;
    }
    string public name;                   
    uint8 public decimals;              
    string public symbol;              
    string public version = '1.0';  

    function ERC20Token() {
        balances[msg.sender] = 1000000;               
        totalSupply = 1000000;               
        name = "Is Token";                               
        decimals = 3;   
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