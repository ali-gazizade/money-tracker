import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { Amount } from './amount';
import BaseDocument from './base';

class Wallet extends BaseDocument {
  @prop({ required: true })
  name!: string;

  @prop({ ref: () => Amount, type: () => [Amount], required: true })
  initialAmounts!: Ref<Amount>[];

  @prop({ default: true })
  active!: boolean;
}

const WalletModel = getModelForClass(Wallet);

export default WalletModel;

export { Wallet };
