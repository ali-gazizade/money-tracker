import { Expense } from '../models/expense';

const expenseAssembler = (expense: Expense) => {
  return {
    _id: expense._id,
    to: {
      _id: expense.to._id,
      name: expense.to.name
    },
    from: {
      _id: expense.from._id,
      name: expense.from.name
    },
    amount: {
      value: expense.transactionBase.amount.value,
      currency: {
        _id: expense.transactionBase.amount.currency._id,
        name: expense.transactionBase.amount.currency.name,
      }
    },
    city: {
      _id: expense.transactionBase.city._id,
      name: expense.transactionBase.city.name,
      countryName: expense.transactionBase.city.countryName
    },
    happenedAt: expense.transactionBase.happenedAt,
    description: expense.transactionBase.description
  };
};

export default expenseAssembler;
