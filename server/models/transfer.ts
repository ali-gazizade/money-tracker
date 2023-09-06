import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import BaseDocument from './base';
import { TransactionBase } from './transactionBase';
import { Wallet } from './wallet';

class Transfer extends BaseDocument {
  @prop({ ref: () => TransactionBase, required: true })
  transactionBase!: Ref<TransactionBase>;

  @prop({ ref: () => Wallet, required: true })
  from!: Ref<Wallet>;

  @prop({ ref: () => Wallet, required: true })
  to!: Ref<Wallet>;
}

const TransferModel = getModelForClass(Transfer);

export default TransferModel;

export { Transfer };
