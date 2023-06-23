import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { Amount } from './amount';
import { Document } from 'mongoose';

class Wallet extends Document {
  @prop({ required: true })
  name!: string;

  @prop({ ref: () => Amount, type: () => [Amount], required: true })
  firstTimeAmounts!: Ref<Amount>[];

  @prop({ default: true })
  active!: boolean;
}

const WalletModel = getModelForClass(Wallet);

export default WalletModel;

export { Wallet };
