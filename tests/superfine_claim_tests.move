#[test_only]
module superfine::superfine_claim_tests {
	use sui::test_scenario;
	use sui::object::ID;
	use sui::address;
	use superfine::superfine_claim::{Self, ClaimingPlatform};
	use superfine::example_nft::{Self, ExampleNft};
	use std::debug;

	#[test]
	public fun test_claim_assets() {
		let admin = @0xA;
		let operator = address::from_bytes(x"defbb0174ab3d1943fb093a8234596d35b8a39b8b82c7a83145715fb5dcd2adf");
		let campaign_creator = @0xB;
		let winner = @0xC;
		let listing_id: ID;
		
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

		// Mint an NFT to list
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let ctx = test_scenario::ctx(scenario);
			example_nft::mint_nft(ctx);
		};

		// List this NFT
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let platform_value = test_scenario::take_shared<ClaimingPlatform>(scenario);
			let platform = &mut platform_value;
			let nft = test_scenario::take_from_sender<ExampleNft>(scenario);
			let ctx = test_scenario::ctx(scenario);
			listing_id = superfine_claim::list_asset<ExampleNft>(platform, nft, ctx);
			test_scenario::return_shared(platform_value);
		};

		// Delist this NFT
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let platform_value = test_scenario::take_shared<ClaimingPlatform>(scenario);
			let platform = &mut platform_value;
			let ctx = test_scenario::ctx(scenario);
			superfine_claim::delist_asset<ExampleNft>(platform, listing_id, ctx);
			test_scenario::return_shared(platform_value);
		};

		// List this NFT again
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let platform_value = test_scenario::take_shared<ClaimingPlatform>(scenario);
			let platform = &mut platform_value;
			let nft = test_scenario::take_from_sender<ExampleNft>(scenario);
			let ctx = test_scenario::ctx(scenario);
			listing_id = superfine_claim::list_asset(platform, nft, ctx);
			test_scenario::return_shared(platform_value);
		};

		// The winner claims this NFT
		test_scenario::next_tx(scenario, winner);
		{
			let platform_value = test_scenario::take_shared<ClaimingPlatform>(scenario);
			let platform = &mut platform_value;
			let ctx = test_scenario::ctx(scenario);
			debug::print(&listing_id);

			// Prepare the signature
			superfine_claim::claim_asset<ExampleNft>(
				platform,
				b"ABCXYZXXX",
				campaign_creator,
				listing_id,
				x"fa0786941b2cdde034b1f1d75e3079dc1058a5c1b59a1f33962c8bd5e12376b4",
				x"35e30f7c90e6ad0f42cc865d0c57e8dda5e29cbb6a460a5397ecc7438b5d75bad837c45aaa1e4337fcb6423fa71fdf7cb9e5c6bc7358121dc41c11bc06120009",
				ctx,
			);
			test_scenario::return_shared(platform_value);
		};
		test_scenario::end(scenario_value);
	}
}