import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { Currency } from './currency';
import { Document } from 'mongoose';

class Amount extends Document {
  @prop({ required: true })
  _value!: number;

  @prop({ ref: () => Currency, required: true })
  currency!: Ref<Currency>;

  get value(): string {
    return this._value.toFixed(2);
  }

  set value(newValue: string) {
    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue)) {
      this._value = parsedValue;
    }
  }
}

const AmountModel = getModelForClass(Amount);

export default AmountModel;

export { Amount };
