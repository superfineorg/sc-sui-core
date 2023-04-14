#[test_only]
module superfine::superfine_airdrop_tests {
	use std::vector;
	use sui::test_scenario;
	use sui::object::ID;
	use sui::address;
	use sui::coin::{Self, Coin};
	use sui::sui::SUI;
	use sui::pay;
	use sui::object;
	use superfine::superfine_airdrop::{Self, AirdropPlatform};
	use superfine::example_nft::{Self, ExampleNft};

	#[test]
	public fun test_airdrop_assets() {
		let admin = @0xA;
		let operator = address::from_bytes(x"defbb0174ab3d1943fb093a8234596d35b8a39b8b82c7a83145715fb5dcd2adf");
		let campaign_creator = @0xB;
		let winner = @0xC;
		let asset_ids: vector<ID>;
		let coin_id: ID;
		let campaign_id: ID;

		// Admin initializes the platform
		let scenario_value = test_scenario::begin(admin);
		let scenario = &mut scenario_value;
		{
			let ctx = test_scenario::ctx(scenario);
			superfine_airdrop::test_init(ctx);
		};

		// Admin sets the operator
		test_scenario::next_tx(scenario, admin);
		{
			let platform_value = test_scenario::take_shared<AirdropPlatform>(scenario);
			let platform = &mut platform_value;
			let ctx = test_scenario::ctx(scenario);
			superfine_airdrop::set_operator(platform, operator, true, ctx);
			test_scenario::return_shared(platform_value);
		};

		// Mint some coins to use and some NFTs to airdrop
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let ctx = test_scenario::ctx(scenario);
			let initial_coin = coin::mint_for_testing<SUI>(1000, ctx);
			coin_id = object::id(&initial_coin);
			pay::keep(initial_coin, ctx);
			asset_ids = example_nft::mint_nfts(campaign_creator, 10, ctx);
		};

		// The campaign creator creates a new campaign
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let platform_value = test_scenario::take_shared<AirdropPlatform>(scenario);
			let platform = &mut platform_value;
			let coin = test_scenario::take_from_sender_by_id<Coin<SUI>>(scenario, coin_id);
			let ctx = test_scenario::ctx(scenario);
			campaign_id = superfine_airdrop::create_airdrop_campaign(
				platform,
				b"ABCXYZXXX",
				10,
				4,
				x"fa0786941b2cdde034b1f1d75e3079dc1058a5c1b59a1f33962c8bd5e12376b4",
				x"b0d04093b8b660fa4dfead604f65cd5213a94459a3ecde8dc3ff175e4ea71d86a12419e86d347bd5a3a42fe66936d972334ae66ed043ec97343c5d0266c15904",
				&mut coin,
				ctx
			);
			assert!(coin::value(&coin) == 996, 0);
			test_scenario::return_to_sender(scenario, coin);
			test_scenario::return_shared(platform_value);
		};

		// The campaign creator updates his campaign
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let platform_value = test_scenario::take_shared<AirdropPlatform>(scenario);
			let platform = &mut platform_value;
			let coin = test_scenario::take_from_sender_by_id<Coin<SUI>>(scenario, coin_id);
			let ctx = test_scenario::ctx(scenario);
			superfine_airdrop::update_campaign(
				platform,
				campaign_id,
				11,
				7,
				x"fa0786941b2cdde034b1f1d75e3079dc1058a5c1b59a1f33962c8bd5e12376b4",
				x"39ab1790e2faa2b85a95cbef5b97e3a5e80f95e3a2745e576f4db40a4248a126da5b0f531dbe629c6722912d4b17ae5b09516716072c41a9d19d34c6a5ff4601",
				&mut coin,
				ctx
			);
			assert!(coin::value(&coin) == 993, 0);
			test_scenario::return_to_sender(scenario, coin);
			test_scenario::return_shared(platform_value);
		};

		// The campaign creator lists some NFTs to airdrop
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let platform_value = test_scenario::take_shared<AirdropPlatform>(scenario);
			let platform = &mut platform_value;
			let assets = vector::empty<ExampleNft>();
			while (vector::length(&asset_ids) > 0) {
				let asset_id = vector::pop_back(&mut asset_ids);
				vector::push_back(&mut assets, test_scenario::take_from_sender_by_id<ExampleNft>(scenario, asset_id));
			};
			let ctx = test_scenario::ctx(scenario);
			asset_ids = superfine_airdrop::list_assets(
				platform,
				campaign_id,
				assets,
				ctx
			);
			test_scenario::return_shared(platform_value);
		};

		// The campaign creator delists these NFTs
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let platform_value = test_scenario::take_shared<AirdropPlatform>(scenario);
			let platform = &mut platform_value;
			let ctx = test_scenario::ctx(scenario);
			superfine_airdrop::delist_assets<ExampleNft>(
				platform,
				campaign_id,
				asset_ids,
				ctx
			);
			test_scenario::return_shared(platform_value);
		};

		// The campaign creator lists these NFTs again
		test_scenario::next_tx(scenario, campaign_creator);
		{
			let platform_value = test_scenario::take_shared<AirdropPlatform>(scenario);
			let platform = &mut platform_value;
			let assets = vector::empty<ExampleNft>();
			while (vector::length(&asset_ids) > 0) {
				let asset_id = vector::pop_back(&mut asset_ids);
				vector::push_back(&mut assets, test_scenario::take_from_sender_by_id<ExampleNft>(scenario, asset_id));
			};
			let ctx = test_scenario::ctx(scenario);
			asset_ids = superfine_airdrop::list_assets(
				platform,
				campaign_id,
				assets,
				ctx
			);
			test_scenario::return_shared(platform_value);
		};

		// The operator airdrops these NFTs to the winner
		test_scenario::next_tx(scenario, operator);
		{
			let platform_value = test_scenario::take_shared<AirdropPlatform>(scenario);
			let platform = &mut platform_value;
			let ctx = test_scenario::ctx(scenario);
			superfine_airdrop::airdrop_assets<ExampleNft>(
				platform,
				campaign_id,
				asset_ids,
				winner,
				ctx
			);
			test_scenario::return_shared(platform_value);
		};

		test_scenario::end(scenario_value);
	}
}