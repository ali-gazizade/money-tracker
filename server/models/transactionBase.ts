import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import BaseDocument from './base';
import { Amount } from './amount';
import { City } from './city';

class TransactionBase extends BaseDocument {
  @prop({ ref: () => Amount, required: true })
  amount!: Ref<Amount>;

  @prop({ ref: () => City, required: true })
  city!: Ref<City>;

  @prop({ type: Date, default: Date.now })
  happenedAt!: Date;
  
  @prop({ required: true })
  description!: string;
}

const TransactionBaseModel = getModelForClass(TransactionBase);

export default TransactionBaseModel;

export { TransactionBase };
