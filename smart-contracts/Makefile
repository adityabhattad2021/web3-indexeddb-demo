RPC_URL := 127.0.0.1:8545
VERBOSITY := -vvvv
BROADCAST := --broadcast
LEGACY := --legacy

FORGE_SCRIPT := forge script



deploy-user-profile:
	$(FORGE_SCRIPT) script/Deploy.s.sol:UserProfileScript --rpc-url $(RPC_URL) $(VERBOSITY) $(BROADCAST) $(LEGACY)



help:
	@echo "Available targets:"
	@echo "  deploy-user-profile: Deploy the UserProfile contract"
	@echo "  help: Show this help message"

.PHONY: deploy-user-profile help