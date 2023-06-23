import { prop, getModelForClass } from '@typegoose/typegoose';
import { Document } from 'mongoose';

class Currency extends Document {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  isDefault!: boolean;
  
  @prop({ required: true })
  active!: boolean;
}

const CurrencyModel = getModelForClass(Currency);

export default CurrencyModel;

export { Currency };
