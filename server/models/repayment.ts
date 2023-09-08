import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import BaseDocument from './base';
import { TransactionBase } from './transactionBase';
import { Contact } from './contact';
import { Amount } from './amount';

enum RepayerType {
  Contact = 'Contact',
  User = 'User'
}

class Repayment extends BaseDocument {
  @prop({ ref: () => Amount, required: true })
  amount!: Ref<Amount>;

  @prop({ ref: () => Contact, required: true })
  contact!: Ref<Contact>;

  @prop({ enum: RepayerType, required: true })
  RepayerType!: RepayerType;

  @prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @prop({ type: Date })
  repaidAt!: Date;

  @prop({ required: true })
  description!: string;

  @prop({ ref: () => TransactionBase })
  bindedTransactionBase!: Ref<TransactionBase>;
}

const RepaymentModel = getModelForClass(Repayment);

export default RepaymentModel;

export { Repayment };
