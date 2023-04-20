#[test_only]
module superfine::superfine_claim_tests {
	use std::vector;
	use sui::test_scenario;
	use sui::object::ID;
	use sui::address;
	use superfine::superfine_claim::{Self, ClaimingPlatform};
	use superfine::example_nft::{Self, ExampleNft};

	#[test]
	public fun test_claim_assets() {
		let admin = @0xA;
		let operator = address::from_bytes(x"b69ce65027f5fb6660e64412b30e750009c7e8c38927fc78041917cc673494cd");
		let campaign_creator = address::from_bytes(x"b69ce65027f5fb6660e64412b30e750009c7e8c38927fc78041917cc673494cd");
		let winner = address::from_bytes(x"b69ce65027f5fb6660e64412b30e750009c7e8c38927fc78041917cc673494cd");
		let listing_ids: vector<ID>;
		let asset_ids: vector<ID>;
		
		// Admin initializes the platform
		let scenario_value = test_scenario::begin(admin);
		let scenario = &mut scenario_value;
		{
			let ctx = test_scenario::ctx(scenario);
			superfine_claim::test_init(ctx);
		};

		// Admin sets the operator
		test_scenario::next_tx(scenario, admin);
		{
			let platform_value = test_scenario::take_shared<ClaimingPlatform>(scenario);
			let platform = &mut platform_value;
			let ctx = test_scenario::ctx(scenario);
			superfine_claim::set_operator(platform, operator, true, ctx);
			test_scenario::return_shared(platform_value);
		};

		// Mint some NFTs to list
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let ctx = test_scenario::ctx(scenario);
			asset_ids = example_nft::mint_nfts(campaign_creator, 10, ctx);
		};

		// List these NFTs
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let platform_value = test_scenario::take_shared<ClaimingPlatform>(scenario);
			let platform = &mut platform_value;
			let assets = vector::empty<ExampleNft>();
			while (vector::length(&asset_ids) > 0) {
				let asset_id = vector::pop_back(&mut asset_ids);
				vector::push_back(&mut assets, test_scenario::take_from_sender_by_id<ExampleNft>(scenario, asset_id));
			};
			let ctx = test_scenario::ctx(scenario);
			listing_ids = superfine_claim::list_assets<ExampleNft>(platform, assets, ctx);
			test_scenario::return_shared(platform_value);
		};

		// Delist these NFTs
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let platform_value = test_scenario::take_shared<ClaimingPlatform>(scenario);
			let platform = &mut platform_value;
			let ctx = test_scenario::ctx(scenario);
			superfine_claim::delist_asset<ExampleNft>(platform, *vector::borrow(&listing_ids, 3), ctx);
			test_scenario::return_shared(platform_value);
		};

		// The winner claims this NFT
		test_scenario::next_tx(scenario, winner);
		{
			let platform_value = test_scenario::take_shared<ClaimingPlatform>(scenario);
			let platform = &mut platform_value;
			let ctx = test_scenario::ctx(scenario);
			superfine_claim::claim_asset<ExampleNft>(
				platform,
				b"ABCXYZZZZ",
				campaign_creator,
				*vector::borrow(&listing_ids, 7),
				x"47e0f5c2321e5c0692fd098a8a4ab6601fbe8e9ad651139cc00b3a802c691541",
				x"738fc1b426519159769df404333cf8c34cb3ee5723609d3b9e0feacd891e9e491ec53a8e4d2122f14725369f331e8a18a0085d6e978bb5e7a17140f3f1101f01",
				ctx,
			);
			test_scenario::return_shared(platform_value);
		};
		test_scenario::end(scenario_value);
	}
}