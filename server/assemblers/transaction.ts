import { Expense } from '../models/expense';
import { Income } from '../models/income';
import { Transfer } from '../models/transfer';

const transactionAssembler = (transaction: Expense | Income | Transfer) => {
  return {
    _id: transaction._id,
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

export default transactionAssembler;
