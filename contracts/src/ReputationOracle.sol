// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReputationOracle
 * @notice Manages agent reputation scores with Filecoin-anchored proofs
 * @dev Reputation scores are calculated off-chain and stored with CID proofs
 */
contract ReputationOracle {
    struct Reputation {
        uint256 totalScore;
        string historyCID;        // Filecoin CID containing action history
        string proofOfHistoryCID; // Filecoin CID containing proof data
        bytes32 proofHash;        // SHA-256 Merkle root of action history
        uint256 lastCalculated;
        uint256 actionCount;
    }

    struct ScoreBreakdown {
        uint256 codeContributions;
        uint256 blockchainActivity;
        uint256 agentInteractions;
        uint256 uptime;
    }

    // Mapping from agent address to reputation
    mapping(address => Reputation) public reputations;
    
    // Detailed score breakdown (optional, for transparency)
    mapping(address => ScoreBreakdown) public scoreBreakdowns;
    
    // Authorized updaters (off-chain reputation calculators)
    mapping(address => bool) public authorizedUpdaters;
    
    // Owner
    address public owner;

    // Events
    event ReputationUpdated(
        address indexed agentAddress,
        uint256 newScore,
        string historyCID,
        string proofCID,
        uint256 timestamp
    );
    
    event UpdaterAuthorized(address indexed updater, bool authorized);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedUpdaters[msg.sender] = true;
    }

    /**
     * @notice Update an agent's reputation with Filecoin proof
     * @param agentAddress The agent whose reputation to update
     * @param totalScore The calculated reputation score
     * @param historyCID Filecoin CID containing the action history
     * @param proofCID Filecoin CID containing proof-of-history data
     * @param actionCount Number of actions in the history
     */
    function updateReputation(
        address agentAddress,
        uint256 totalScore,
        string memory historyCID,
        string memory proofCID,
        uint256 actionCount
    ) external onlyAuthorized {
        _updateReputation(agentAddress, totalScore, historyCID, proofCID, bytes32(0), actionCount);
    }

    /**
     * @notice Update an agent's reputation with Filecoin proof and on-chain proof hash
     * @param agentAddress The agent whose reputation to update
     * @param totalScore The calculated reputation score
     * @param historyCID Filecoin CID containing the action history
     * @param proofCID Filecoin CID containing proof-of-history data
     * @param proofHash SHA-256 Merkle root of the action history (for on-chain verification)
     * @param actionCount Number of actions in the history
     */
    function updateReputationWithProof(
        address agentAddress,
        uint256 totalScore,
        string memory historyCID,
        string memory proofCID,
        bytes32 proofHash,
        uint256 actionCount
    ) external onlyAuthorized {
        require(proofHash != bytes32(0), "Proof hash required");
        _updateReputation(agentAddress, totalScore, historyCID, proofCID, proofHash, actionCount);
    }

    function _updateReputation(
        address agentAddress,
        uint256 totalScore,
        string memory historyCID,
        string memory proofCID,
        bytes32 proofHash,
        uint256 actionCount
    ) internal {
        require(agentAddress != address(0), "Invalid agent address");
        require(bytes(historyCID).length > 0, "History CID required");
        require(bytes(proofCID).length > 0, "Proof CID required");

        reputations[agentAddress] = Reputation({
            totalScore: totalScore,
            historyCID: historyCID,
            proofOfHistoryCID: proofCID,
            proofHash: proofHash,
            lastCalculated: block.timestamp,
            actionCount: actionCount
        });

        emit ReputationUpdated(
            agentAddress,
            totalScore,
            historyCID,
            proofCID,
            block.timestamp
        );
    }

    /**
     * @notice Update detailed score breakdown
     * @param agentAddress The agent to update
     * @param codeContributions Score from code contributions
     * @param blockchainActivity Score from on-chain activity
     * @param agentInteractions Score from agent interactions
     * @param uptime Score from uptime/availability
     */
    function updateScoreBreakdown(
        address agentAddress,
        uint256 codeContributions,
        uint256 blockchainActivity,
        uint256 agentInteractions,
        uint256 uptime
    ) external onlyAuthorized {
        require(agentAddress != address(0), "Invalid agent address");

        scoreBreakdowns[agentAddress] = ScoreBreakdown({
            codeContributions: codeContributions,
            blockchainActivity: blockchainActivity,
            agentInteractions: agentInteractions,
            uptime: uptime
        });
    }

    /**
     * @notice Authorize or deauthorize a reputation updater
     * @param updater Address to authorize/deauthorize
     * @param authorized True to authorize, false to revoke
     */
    function setAuthorizedUpdater(address updater, bool authorized) external onlyOwner {
        require(updater != address(0), "Invalid updater address");
        authorizedUpdaters[updater] = authorized;
        emit UpdaterAuthorized(updater, authorized);
    }

    /**
     * @notice Get agent's reputation
     * @param agentAddress Agent to query
     * @return reputation The reputation struct
     */
    function getReputation(address agentAddress) external view returns (Reputation memory) {
        return reputations[agentAddress];
    }

    /**
     * @notice Get agent's score breakdown
     * @param agentAddress Agent to query
     * @return breakdown The score breakdown struct
     */
    function getScoreBreakdown(address agentAddress) external view returns (ScoreBreakdown memory) {
        return scoreBreakdowns[agentAddress];
    }

    /**
     * @notice Get agent's total reputation score
     * @param agentAddress Agent to query
     * @return score The total reputation score
     */
    function getScore(address agentAddress) external view returns (uint256) {
        return reputations[agentAddress].totalScore;
    }

    /**
     * @notice Verify proof CID exists for an agent
     * @param agentAddress Agent to check
     * @return hasproof True if agent has a proof CID
     */
    function hasProof(address agentAddress) external view returns (bool) {
        return bytes(reputations[agentAddress].proofOfHistoryCID).length > 0;
    }

    /**
     * @notice Verify a proof hash matches the stored on-chain commitment
     * @param agentAddress Agent to verify
     * @param claimedProofHash The Merkle root hash to check
     * @return valid True if the hash matches the stored proof
     */
    function verifyProofHash(address agentAddress, bytes32 claimedProofHash) external view returns (bool) {
        return reputations[agentAddress].proofHash != bytes32(0) &&
               reputations[agentAddress].proofHash == claimedProofHash;
    }

    /**
     * @notice Get the stored proof hash for an agent
     * @param agentAddress Agent to query
     * @return hash The stored Merkle root hash (bytes32(0) if none)
     */
    function getProofHash(address agentAddress) external view returns (bytes32) {
        return reputations[agentAddress].proofHash;
    }
}
