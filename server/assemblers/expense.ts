import { Expense } from '../models/expense';

const expenseAssembler = (expense: Expense) => {
  return {
    _id: expense._id,
    contact: {
      _id: expense.contact._id,
      name: expense.contact.name
    },
    wallet: {
      _id: expense.wallet._id,
      name: expense.wallet.name
    },
    amount: {
      value: expense.transaction.amount.value,
      currency: {
        _id: expense.transaction.amount.currency._id,
        name: expense.transaction.amount.currency.name,
      }
    },
    city: {
      _id: expense.transaction.city._id,
      name: expense.transaction.city.name,
      countryName: expense.transaction.city.countryName
    },
    happenedAt: expense.transaction.happenedAt,
    description: expense.transaction.description
  };
};

export default expenseAssembler;
