#[test_only]
module superfine::superfine_airdrop_tests {
	use std::debug;
	use sui::test_scenario;
	use sui::object::ID;
	use sui::address;
	use sui::coin::{Self, Coin};
	use sui::sui::SUI;
	use sui::pay;
	use sui::object;
	use superfine::superfine_airdrop::{Self, AirdropPlatform};
	use superfine::example_nft::{Self};

	#[test]
	public fun test_airdrop_assets() {
		let admin = @0xA;
		let operator = address::from_bytes(x"defbb0174ab3d1943fb093a8234596d35b8a39b8b82c7a83145715fb5dcd2adf");
		let campaign_creator = @0xB;
		// let winner = @0xC;
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
			debug::print(&asset_ids);
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
				3,
				7,
				x"fa0786941b2cdde034b1f1d75e3079dc1058a5c1b59a1f33962c8bd5e12376b4",
				x"d31611a2a7dfb4af63c8f92d60d5fbae0f53fd47314a41626f73effcf4d3da2f06c926508847f1aa44fc5b78d480623b7f0f43a9ed6bb697989545e651ba9801",
				&mut coin,
				ctx
			);
			assert!(coin::value(&coin) == 993, 0);
			test_scenario::return_to_sender(scenario, coin);
			test_scenario::return_shared(platform_value);
		};

		test_scenario::end(scenario_value);
	}
}