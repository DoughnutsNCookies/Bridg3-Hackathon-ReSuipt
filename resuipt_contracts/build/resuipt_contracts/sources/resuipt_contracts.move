/// Module: resuipt_contracts
module resuipt_contracts::resuipt_contracts {
	
	use sui::event;
	use sui::dynamic_field as field;
	// use sui::dynamic_object_field as ofield;

	public struct Receipt has key, store {
		id: UID,
		merchant: address,
		amount: u64,
	}

	public struct ReceiptCreated has copy, drop {
		merchant: address,
		amount: u64,
	}

	public struct Item has store {
		price: u64,
	}

	/*
		Customer
		Creates a receipt
	*/
	public fun createReceipt(merchant: address, ctx: &mut TxContext) {
		let receipt = Receipt {
			id: object::new(ctx),
			merchant: merchant,
			amount: 0,
		};
		
		// transfer::share_object(receipt);
		transfer::public_transfer(receipt, ctx.sender());

		event::emit(ReceiptCreated {
			merchant: merchant,
			amount: 0,
		});
	}

	/*
		Used by addItemToReceipt
		Increases the amount of the receipt by the price of the item
	*/
	fun increaseAmount(receipt: &mut Receipt, price: u64) {
		receipt.amount = receipt.amount + price;
	}

	/*
		Customer will call from merchant's API
		Dynamic Field
		Addes an item to the receipt
	*/
	public fun addItemToReceipt(receipt: &mut Receipt, name: vector<u8>, price: u64) {
		let item = Item {
			price: price
		};

		field::add(&mut receipt.id, name, item);
		increaseAmount(receipt, price);
	}
}