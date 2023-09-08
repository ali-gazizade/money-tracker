import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import BaseDocument from './base';
import { TransactionBase } from './transactionBase';
import { Contact } from './contact';
import { Amount } from './amount';

enum BorrowerType {
  Contact = 'Contact',
  User = 'User'
}

class Borrowing extends BaseDocument {
  @prop({ ref: () => Amount, required: true })
  amount!: Ref<Amount>;

  @prop({ ref: () => Contact, required: true })
  contact!: Ref<Contact>;

  @prop({ enum: BorrowerType, required: true })
  borrowerType!: BorrowerType;

  @prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @prop({ type: Date })
  borrowedAt!: Date;

  @prop({ type: Date })
  repaymentExpectedAt!: Date;

  @prop({ required: true })
  description!: string;

  @prop({ ref: () => TransactionBase })
  bindedTransactionBase!: Ref<TransactionBase>;
}

const BorrowingModel = getModelForClass(Borrowing);

export default BorrowingModel;

export { Borrowing };
