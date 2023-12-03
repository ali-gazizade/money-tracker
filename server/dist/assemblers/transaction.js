"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transactionAssembler = (transaction) => {
    return {
        _id: transaction._id,
        type: transaction.from?.initialAmounts && transaction.to?.initialAmounts // From and To are wallets
            ? 'Transfer'
            : transaction.from?.initialAmounts // From is a wallet
                ? 'Expense'
                : transaction.to?.initialAmounts // To is a wallet,
                    ? 'Income'
                    : 'Unknown',
        to: {
            _id: transaction.to._id,
            name: transaction.to.name
        },
        from: {
            _id: transaction.from._id,
            name: transaction.from.name
        },
        amount: {
            value: transaction.transactionBase.amount.value,
            currency: {
                _id: transaction.transactionBase.amount.currency._id,
                name: transaction.transactionBase.amount.currency.name,
            }
        },
        city: {
            _id: transaction.transactionBase.city._id,
            name: transaction.transactionBase.city.name,
            countryName: transaction.transactionBase.city.countryName
        },
        happenedAt: transaction.transactionBase.happenedAt,
        description: transaction.transactionBase.description
    };
};
exports.default = transactionAssembler;
