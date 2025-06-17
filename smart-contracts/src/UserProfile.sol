// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UserProfile
 * @dev A simple smart contract for managing user profiles and preferences
 */
contract UserProfile {
    struct Profile {
        string username;
        string bio;
        string avatarUrl;
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
    }
    
    struct Preferences {
        string theme; // "light", "dark", "auto"
        string language; // "en", "es", "fr", etc.
        bool notifications;
        uint256 updatedAt;
    }
    
    mapping(address => Profile) public profiles;
    mapping(address => Preferences) public preferences;
    mapping(address => bool) public hasProfile;
    
    address[] public users;
    
    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user, string username);
    event PreferencesUpdated(address indexed user, string theme);
    
    modifier onlyProfileOwner() {
        require(hasProfile[msg.sender], "Profile does not exist");
        _;
    }
    
    /**
     * @dev Create a new user profile
     * @param _username The username for the profile
     * @param _bio A short biography
     * @param _avatarUrl URL to the user's avatar image
     */
    function createProfile(
        string memory _username,
        string memory _bio,
        string memory _avatarUrl
    ) external {
        require(!hasProfile[msg.sender], "Profile already exists");
        require(bytes(_username).length > 0, "Username cannot be empty");
        
        profiles[msg.sender] = Profile({
            username: _username,
            bio: _bio,
            avatarUrl: _avatarUrl,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true
        });
        
        // Set default preferences
        preferences[msg.sender] = Preferences({
            theme: "auto",
            language: "en",
            notifications: true,
            updatedAt: block.timestamp
        });
        
        hasProfile[msg.sender] = true;
        users.push(msg.sender);
        
        emit ProfileCreated(msg.sender, _username);
    }
    
    /**
     * @dev Update user profile information
     */
    function updateProfile(
        string memory _username,
        string memory _bio,
        string memory _avatarUrl
    ) external onlyProfileOwner {
        require(bytes(_username).length > 0, "Username cannot be empty");
        
        Profile storage profile = profiles[msg.sender];
        profile.username = _username;
        profile.bio = _bio;
        profile.avatarUrl = _avatarUrl;
        profile.updatedAt = block.timestamp;
        
        emit ProfileUpdated(msg.sender, _username);
    }
    
    /**
     * @dev Update user preferences
     */
    function updatePreferences(
        string memory _theme,
        string memory _language,
        bool _notifications
    ) external onlyProfileOwner {
        Preferences storage prefs = preferences[msg.sender];
        prefs.theme = _theme;
        prefs.language = _language;
        prefs.notifications = _notifications;
        prefs.updatedAt = block.timestamp;
        
        emit PreferencesUpdated(msg.sender, _theme);
    }
    
    /**
     * @dev Get user profile
     */
    function getProfile(address _user) external view returns (
        string memory username,
        string memory bio,
        string memory avatarUrl,
        uint256 createdAt,
        uint256 updatedAt,
        bool isActive
    ) {
        require(hasProfile[_user], "Profile does not exist");
        Profile memory profile = profiles[_user];
        return (
            profile.username,
            profile.bio,
            profile.avatarUrl,
            profile.createdAt,
            profile.updatedAt,
            profile.isActive
        );
    }
    
    /**
     * @dev Get user preferences
     */
    function getPreferences(address _user) external view returns (
        string memory theme,
        string memory language,
        bool notifications,
        uint256 updatedAt
    ) {
        require(hasProfile[_user], "Profile does not exist");
        Preferences memory prefs = preferences[_user];
        return (
            prefs.theme,
            prefs.language,
            prefs.notifications,
            prefs.updatedAt
        );
    }
    
    /**
     * @dev Get total number of users
     */
    function getUserCount() external view returns (uint256) {
        return users.length;
    }
    
    /**
     * @dev Get user at specific index
     */
    function getUserAtIndex(uint256 _index) external view returns (address) {
        require(_index < users.length, "Index out of bounds");
        return users[_index];
    }
    
    /**
     * @dev Check if user has a profile
     */
    function userHasProfile(address _user) external view returns (bool) {
        return hasProfile[_user];
    }
}