## How to interact with the modules

### SuperfineAirdrop

```shell
# The campaign creator prepares some NFTs to airdrop
$ ts-node scripts/call/airdrop.ts mintNfts

# The admin sets an operator
$ ts-node scripts/call/airdrop.ts setOperator

# The campaign creator creates an airdropping campaign
$ ts-node scripts/call/airdrop.ts createAirdropCampaign

# The campaign creator updates his campaign
$ ts-node scripts/call/airdrop.ts updateCampaign

# The campaign creator lists some assets to his campaign
$ ts-node scripts/call/airdrop.ts listAssets <campaign-id> <some-asset-ids>

# The campaign creator delists an asset from his campaign
$ ts-node scripts/call/airdrop.ts delistAsset <campaign-id> <asset-id>

# The operator airdrops an asset to the campaign winner
$ ts-node scripts/call/airdrop.ts airdropAsset <campaign-id> <asset-id>

# The admins withdraw the airdropping fee stored in the module
$ ts-node scripts/call/airdrop.ts withdrawAirdroppingFee
```

### SuperfineClaim

```shell
# The campaign creator prepares some NFTs to airdrop
$ ts-node scripts/call/claim.ts mintNfts

# The admin sets an operator
$ ts-node scripts/call/claim.ts setOperator

# The campaign creator list some assets to airdrop
$ ts-node scripts/call/claim.ts listAssets <some-asset-ids>

# The campaign creator delist an asset
$ ts-node scripts/call/claim.ts delistAsset <asset-id>

# The campaign winner claim his reward
$ ts-node scripts/call/claim.ts claimAsset <asset-id>
```