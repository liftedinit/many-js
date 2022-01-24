export var TransactionType;
(function (TransactionType) {
    TransactionType[TransactionType["transactionSend"] = 0] = "transactionSend";
    TransactionType[TransactionType["transactionMint"] = 1] = "transactionMint";
    TransactionType[TransactionType["transactionBurn"] = 2] = "transactionBurn";
})(TransactionType || (TransactionType = {}));
export var Order;
(function (Order) {
    Order[Order["indeterminate"] = 0] = "indeterminate";
    Order[Order["ascending"] = 1] = "ascending";
    Order[Order["descending"] = 2] = "descending";
})(Order || (Order = {}));
