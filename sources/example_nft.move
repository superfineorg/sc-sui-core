module superfine::example_nft {
	use sui::object::{Self, UID};
	use sui::tx_context::{Self, TxContext};
	use sui::transfer;

	struct ExampleNft has key, store {
		id: UID
	}

	public fun mint_nft(ctx: &mut TxContext) {
		transfer::transfer(
			ExampleNft { id: object::new(ctx) },
			tx_context::sender(ctx)
		);
	}
}