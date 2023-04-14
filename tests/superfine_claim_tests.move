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
		let operator = address::from_bytes(x"defbb0174ab3d1943fb093a8234596d35b8a39b8b82c7a83145715fb5dcd2adf");
		let campaign_creator = @0xB;
		let winner = @0xC;
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
			asset_ids = superfine_claim::delist_assets<ExampleNft>(platform, listing_ids, ctx);
			test_scenario::return_shared(platform_value);
		};

		// List this NFT again
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
			listing_ids = superfine_claim::list_assets(platform, assets, ctx);
			test_scenario::return_shared(platform_value);
		};

		// The winner claims this NFT
		test_scenario::next_tx(scenario, winner);
		{
			let platform_value = test_scenario::take_shared<ClaimingPlatform>(scenario);
			let platform = &mut platform_value;
			let ctx = test_scenario::ctx(scenario);
			superfine_claim::claim_assets<ExampleNft>(
				platform,
				b"ABCXYZXXX",
				campaign_creator,
				listing_ids,
				x"fa0786941b2cdde034b1f1d75e3079dc1058a5c1b59a1f33962c8bd5e12376b4",
				x"f104848bba9208e78bbad3650836b754eaffc32abaab36a0cc36bac13bbc4723fdf19b1c1559e9c68ce8bb07143e1a35a6a1580ad0e82a370e32ea69767c0b0b",
				ctx,
			);
			test_scenario::return_shared(platform_value);
		};
		test_scenario::end(scenario_value);
	}
}