import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { Currency } from './currency';
import BaseDocument from './base';

class Amount extends BaseDocument {
  @prop({ required: true })
  _value!: number;

  @prop({ ref: () => Currency, required: true })
  currency!: Ref<Currency>;

  get value(): string {
    return this._value.toFixed(2);
  }

  set value(newValue: string) {
    const parsedValue = parseFloat(parseFloat(newValue).toFixed(2));
    if (!isNaN(parsedValue)) {
      this._value = parsedValue;
    }
  }
}

const AmountModel = getModelForClass(Amount);

export default AmountModel;

export { Amount };
