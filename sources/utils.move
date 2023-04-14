module superfine::utils {
	use std::vector;
	use sui::address;
	use sui::hash;

	public fun u64_to_bytes(value: u64): vector<u8> {
		let result = vector::empty<u8>();
		let i = 0;
		while (i < 8) {
			vector::push_back(&mut result, ((value - ((value >> 8) << 8)) as u8));
			value = value >> 8;
			i = i + 1;
		};
		vector::reverse(&mut result);
		result
	}

	public fun pubkey_to_address(pubkey: vector<u8>): address {
		let scheme: u8 = 0; // ED25519 scheme
		let data = &mut vector::empty<u8>();
		vector::push_back(data, scheme);
		vector::append(data, pubkey);
		address::from_bytes(hash::blake2b256(data))
	}
}