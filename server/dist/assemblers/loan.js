"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loanAssembler = (loan) => {
    return {
        _id: loan._id,
        contact: {
            _id: loan.contact._id,
            name: loan.contact.name
        },
        loanAmountsToUser: loan.loanAmountsToUser.map(e => ({
            value: e.value,
            currency: !e.currency
                ? null
                : typeof e.currency === 'object'
                    ? {
                        _id: e.currency._id,
                        name: e.currency.name,
                    }
                    : e.currency
        }))
    };
};
exports.default = loanAssembler;
