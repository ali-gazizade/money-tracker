"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const currencyAssembler = (currency) => {
    return {
        _id: currency._id,
        name: currency.name,
        isDefault: currency.isDefault,
        exchangeRate: currency.exchangeRate || currency._exchangeRate
    };
};
exports.default = currencyAssembler;
