export var TransactionType;
(function (TransactionType) {
    TransactionType[TransactionType["send"] = 0] = "send";
    TransactionType[TransactionType["mint"] = 1] = "mint";
    TransactionType[TransactionType["burn"] = 2] = "burn";
})(TransactionType || (TransactionType = {}));
export var Order;
(function (Order) {
    Order[Order["indeterminate"] = 0] = "indeterminate";
    Order[Order["ascending"] = 1] = "ascending";
    Order[Order["descending"] = 2] = "descending";
})(Order || (Order = {}));
