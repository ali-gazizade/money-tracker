import { prop, getModelForClass } from '@typegoose/typegoose';

class Currency {
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
