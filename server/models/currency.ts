import { prop, getModelForClass } from '@typegoose/typegoose';
import BaseDocument from './base';

class Currency extends BaseDocument {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  isDefault!: boolean;

  @prop({ default: 1 })
  _exchangeRate!: number;
  
  @prop({ required: true })
  active!: boolean;

  get exchangeRate(): number {
    return +this._exchangeRate.toFixed(5);
  }

  set exchangeRate(newValue: string) {
    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue)) {
      this._exchangeRate = parsedValue;
    }
  }
}

const CurrencyModel = getModelForClass(Currency);

export default CurrencyModel;

export { Currency };
