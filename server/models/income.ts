import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import BaseDocument from './base';
import { TransactionBase } from './transactionBase';
import { Wallet } from './wallet';
import { Contact } from './contact';

class Income extends BaseDocument {
  @prop({ ref: () => TransactionBase, required: true })
  transactionBase!: Ref<TransactionBase>;

  @prop({ ref: () => Contact, required: true })
  from!: Ref<Contact>;

  @prop({ ref: () => Wallet, required: true })
  to!: Ref<Wallet>;
}

const IncomeModel = getModelForClass(Income);

export default IncomeModel;

export { Income };
