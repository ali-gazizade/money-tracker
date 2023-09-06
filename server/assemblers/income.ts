import { Income } from '../models/income';

const incomeAssembler = (income: Income) => {
  return {
    _id: income._id,
    from: {
      _id: income.from._id,
      name: income.from.name
    },
    to: {
      _id: income.to._id,
      name: income.to.name
    },
    amount: {
      value: income.transactionBase.amount.value,
      currency: {
        _id: income.transactionBase.amount.currency._id,
        name: income.transactionBase.amount.currency.name,
      }
    },
    city: {
      _id: income.transactionBase.city._id,
      name: income.transactionBase.city.name,
      countryName: income.transactionBase.city.countryName
    },
    happenedAt: income.transactionBase.happenedAt,
    description: income.transactionBase.description
  };
};

export default incomeAssembler;
