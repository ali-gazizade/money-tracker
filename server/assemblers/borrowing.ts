import { Borrowing } from '../models/borrowing';

const borrowingAssembler = (borrowing: Borrowing) => {
  return {
    _id: borrowing._id,
    contact: {
      _id: borrowing.contact._id,
      name: borrowing.contact.name
    },
    amount: {
      value: borrowing.amount.value,
      currency: {
        _id: borrowing.amount.currency._id,
        name: borrowing.amount.currency.name,
      }
    },
    borrowerType: borrowing.borrowerType,
    createdAt: borrowing.createdAt,
    borrowedAt: borrowing.borrowedAt,
    repaymentExpectedAt: borrowing.repaymentExpectedAt,
    description: borrowing.description,
    bindedTransactionBaseId: borrowing.bindedTransactionBase?._id
  };
};

export default borrowingAssembler;
