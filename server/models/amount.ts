import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { Currency } from './currency';

class Amount {
  @prop({ required: true })
  _value!: number;

  @prop({ ref: () => Currency, required: true })
  currency!: Ref<Currency>;

  get value(): string {
    return this._value.toFixed(2);
  }
}

const AmountModel = getModelForClass(Amount);

export default AmountModel;

export { Amount };
