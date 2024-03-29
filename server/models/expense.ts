import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import BaseDocument from './base';
import { TransactionBase } from './transactionBase';
import { Wallet } from './wallet';
import { Contact } from './contact';

class Expense extends BaseDocument {
  @prop({ ref: () => TransactionBase, required: true })
  transactionBase!: Ref<TransactionBase>;

  @prop({ ref: () => Wallet, required: true })
  from!: Ref<Wallet>;

  @prop({ ref: () => Contact, required: true })
  to!: Ref<Contact>;
}

const ExpenseModel = getModelForClass(Expense);

export default ExpenseModel;

export { Expense };
