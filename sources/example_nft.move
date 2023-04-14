module superfine::example_nft {
	use std::vector;
	use sui::object::{Self, ID, UID};
	use sui::tx_context::TxContext;
	use sui::transfer;

	struct ExampleNft has key, store {
		id: UID
	}

	public fun mint_nfts(
		recipient: address,
		quantity: u64,
		ctx: &mut TxContext
	): vector<ID> {
		let i = 0;
		let nft_ids = vector::empty<ID>();
		while (i < quantity) {
			let nft = ExampleNft { id: object::new(ctx) };
			let nft_id = object::id(&nft);
			transfer::transfer(nft, recipient);
			vector::push_back(&mut nft_ids, nft_id);
			i = i + 1;
		};
		nft_ids
	}
}