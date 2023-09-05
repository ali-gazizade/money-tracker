import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import BaseDocument from './base';
import { Transaction } from './transaction';
import { Wallet } from './wallet';
import { Contact } from './contact';

class Expense extends BaseDocument {
  @prop({ ref: () => Transaction, required: true })
  transaction!: Ref<Transaction>;

  @prop({ ref: () => Wallet, required: true })
  wallet!: Ref<Wallet>;

  @prop({ ref: () => Contact, required: true })
  contact!: Ref<Contact>;
}

const ExpenseModel = getModelForClass(Expense);

export default ExpenseModel;

export { Expense };
