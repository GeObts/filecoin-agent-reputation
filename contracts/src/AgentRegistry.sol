// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @notice Registry for AI agent identities with Filecoin-anchored metadata
 * @dev Maps agent addresses to their identity CIDs stored on Filecoin
 */
contract AgentRegistry {
    struct AgentIdentity {
        address owner;
        string identityCID;      // Filecoin CID pointing to identity document
        string currentStateCID;  // Filecoin CID pointing to current state
        uint256 registeredAt;
        uint256 lastUpdated;
        bool isActive;
    }

    // Mapping from agent address to their identity
    mapping(address => AgentIdentity) public agents;
    
    // Array of all registered agent addresses
    address[] public agentList;
    
    // Events
    event AgentRegistered(
        address indexed agentAddress,
        address indexed owner,
        string identityCID,
        uint256 timestamp
    );
    
    event AgentUpdated(
        address indexed agentAddress,
        string newStateCID,
        uint256 timestamp
    );
    
    event AgentDeactivated(
        address indexed agentAddress,
        uint256 timestamp
    );

    /**
     * @notice Register a new agent with Filecoin-backed identity
     * @param agentAddress The address of the agent to register
     * @param identityCID Filecoin CID containing the agent's identity document
     */
    function registerAgent(
        address agentAddress,
        string memory identityCID
    ) external {
        require(agentAddress != address(0), "Invalid agent address");
        require(bytes(identityCID).length > 0, "Identity CID cannot be empty");
        require(!agents[agentAddress].isActive, "Agent already registered");

        agents[agentAddress] = AgentIdentity({
            owner: msg.sender,
            identityCID: identityCID,
            currentStateCID: "",
            registeredAt: block.timestamp,
            lastUpdated: block.timestamp,
            isActive: true
        });

        agentList.push(agentAddress);

        emit AgentRegistered(agentAddress, msg.sender, identityCID, block.timestamp);
    }

    /**
     * @notice Update agent's state CID (only owner can update)
     * @param agentAddress The agent address to update
     * @param newStateCID New Filecoin CID pointing to updated state
     */
    function updateAgentState(
        address agentAddress,
        string memory newStateCID
    ) external {
        require(agents[agentAddress].isActive, "Agent not registered");
        require(agents[agentAddress].owner == msg.sender, "Only owner can update");
        require(bytes(newStateCID).length > 0, "State CID cannot be empty");

        agents[agentAddress].currentStateCID = newStateCID;
        agents[agentAddress].lastUpdated = block.timestamp;

        emit AgentUpdated(agentAddress, newStateCID, block.timestamp);
    }

    /**
     * @notice Deactivate an agent (only owner)
     * @param agentAddress The agent to deactivate
     */
    function deactivateAgent(address agentAddress) external {
        require(agents[agentAddress].isActive, "Agent not active");
        require(agents[agentAddress].owner == msg.sender, "Only owner can deactivate");

        agents[agentAddress].isActive = false;

        emit AgentDeactivated(agentAddress, block.timestamp);
    }

    /**
     * @notice Get agent identity information
     * @param agentAddress The agent to query
     * @return identity The agent's identity struct
     */
    function getAgent(address agentAddress) external view returns (AgentIdentity memory) {
        return agents[agentAddress];
    }

    /**
     * @notice Get total number of registered agents
     */
    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    /**
     * @notice Check if an agent is registered and active
     */
    function isAgentActive(address agentAddress) external view returns (bool) {
        return agents[agentAddress].isActive;
    }
}
