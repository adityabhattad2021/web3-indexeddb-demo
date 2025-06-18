// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UserProfile
 * @notice This contract only handles essential user data and posts
 */
contract UserProfile {
    struct Profile {
        string username;
        string bio;
        uint256 createdAt;
        bool exists;
    }
    
    struct Post {
        uint256 id;
        address author;
        string title;
        string content;
        uint256 createdAt;
        bool exists;
    }
    
    mapping(address => Profile) public profiles;
    mapping(uint256 => Post) public posts;
    mapping(address => uint256[]) public userPosts;
    
    uint256 public nextPostId = 1;
    uint256[] public allPostIds;
    
    event ProfileCreated(address indexed user, string username);
    event PostCreated(uint256 indexed postId, address indexed author, string title);
    
    /**
     * @dev Create a user profile
     */
    function createProfile(string memory _username, string memory _bio) external {
        require(!profiles[msg.sender].exists, "Profile already exists");
        require(bytes(_username).length > 0, "Username required");
        
        profiles[msg.sender] = Profile({
            username: _username,
            bio: _bio,
            createdAt: block.timestamp,
            exists: true
        });
        
        emit ProfileCreated(msg.sender, _username);
    }
    
    /**
     * @dev Create a post (requires profile)
     */
    function createPost(string memory _title, string memory _content) external {
        require(profiles[msg.sender].exists, "Profile required");
        require(bytes(_title).length > 0, "Title required");
        
        uint256 postId = nextPostId++;
        
        posts[postId] = Post({
            id: postId,
            author: msg.sender,
            title: _title,
            content: _content,
            createdAt: block.timestamp,
            exists: true
        });
        
        userPosts[msg.sender].push(postId);
        allPostIds.push(postId);
        
        emit PostCreated(postId, msg.sender, _title);
    }
    
    /**
     * @dev Get user profile
     */
    function getProfile(address _user) external view returns (
        string memory username,
        string memory bio,
        uint256 createdAt,
        bool exists
    ) {
        Profile memory profile = profiles[_user];
        return (profile.username, profile.bio, profile.createdAt, profile.exists);
    }
    
    /**
     * @dev Get all post IDs (for client-side pagination)
     */
    function getAllPostIds() external view returns (uint256[] memory) {
        return allPostIds;
    }
    
    /**
     * @dev Get post details
     */
    function getPost(uint256 _postId) external view returns (
        uint256 id,
        address author,
        string memory title,
        string memory content,
        uint256 createdAt,
        bool exists
    ) {
        Post memory post = posts[_postId];
        return (post.id, post.author, post.title, post.content, post.createdAt, post.exists);
    }
    
    /**
     * @dev Get user's post IDs
     */
    function getUserPosts(address _user) external view returns (uint256[] memory) {
        return userPosts[_user];
    }
    
    /**
     * @dev Check if user has profile
     */
    function hasProfile(address _user) external view returns (bool) {
        return profiles[_user].exists;
    }
}