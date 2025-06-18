RPC_URL := 127.0.0.1:8545
VERBOSITY := -vvvv
BROADCAST := --broadcast
LEGACY := --legacy

FORGE_SCRIPT := forge script
-include .env



deploy-user-profile:
	$(FORGE_SCRIPT) script/Deploy.s.sol:UserProfileScript --rpc-url $(RPC_URL) $(VERBOSITY) $(BROADCAST) $(LEGACY)

deploy-user-profile-polygon-testnet:
	$(FORGE_SCRIPT) script/Deploy.s.sol:UserProfileScript --rpc-url ${POLYGON_AMOY_RPC_URL} --private-key ${PRIVATE_KEY} ${BROADCAST} --verify --etherscan-api-key ${ETHERSCAN_API_KEY} $(LEGACY) -vvvv


help:
	@echo "Available targets:"
	@echo "  deploy-user-profile: Deploy the UserProfile contract"
	@echo "  help: Show this help message"

.PHONY: deploy-user-profile help