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
	public fun createReceipt(merchant: address, amount: u64, ctx: &mut TxContext) {
		let receipt = Receipt {
			id: object::new(ctx),
			merchant: merchant,
			amount: amount,
		};
		
		// transfer::share_object(receipt);
		transfer::public_transfer(receipt, ctx.sender());

		event::emit(ReceiptCreated {
			merchant: merchant,
			amount: amount,
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
		Dynamic Object Field
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

/*

packageID:			0x36a6995ea851800c90ad73e55852e4de032104957ef9cadfff11c543e7c54333
walletAddress:	0x7c9aadae6eca7fca07aafc749d4e84c2416dbd69f5f965114383e3b233186e6f

// Create Receipt
sui client call --package 0x36a6995ea851800c90ad73e55852e4de032104957ef9cadfff11c543e7c54333 --module resuipt_contracts --function createReceipt --args "0x7c9aadae6eca7fca07aafc749d4e84c2416dbd69f5f965114383e3b233186e6f" "42"


receiptId:			0x526ee8e650de62d0d7f0e5ad4fa445bdea64f815c7a5ccea3c9401d42341efc7

// Add Item to Receipt
sui client call --package 0x36a6995ea851800c90ad73e55852e4de032104957ef9cadfff11c543e7c54333 --module resuipt_contracts --function addItemToReceipt --args "0x526ee8e650de62d0d7f0e5ad4fa445bdea64f815c7a5ccea3c9401d42341efc7" "milk" "24"

*/