pragma solidity ^0.4.18;

contract LikeVideo {
    address[16] private fans;
    
    // Like video
    function like(uint videoId) public returns (uint) {
        require(videoId >= 0);
        fans[videoId] = msg.sender;
        
        return videoId;
    }
  
    // Retrieving the fans
    function getFans() public view returns (address[16]) {
        return fans;
    }
}