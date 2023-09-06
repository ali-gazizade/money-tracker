import { Transfer } from '../models/transfer';

const transferAssembler = (transfer: Transfer) => {
  return {
    _id: transfer._id,
    from: {
      _id: transfer.from._id,
      name: transfer.from.name
    },
    to: {
      _id: transfer.to._id,
      name: transfer.to.name
    },
    amount: {
      value: transfer.transactionBase.amount.value,
      currency: {
        _id: transfer.transactionBase.amount.currency._id,
        name: transfer.transactionBase.amount.currency.name,
      }
    },
    city: {
      _id: transfer.transactionBase.city._id,
      name: transfer.transactionBase.city.name,
      countryName: transfer.transactionBase.city.countryName
    },
    happenedAt: transfer.transactionBase.happenedAt,
    description: transfer.transactionBase.description
  };
};

export default transferAssembler;
