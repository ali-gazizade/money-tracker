import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { Amount } from './amount';

class Wallet {
  @prop({ required: true })
  name!: string;

  @prop({ ref: () => Amount, required: true })
  firstTimeAmount!: Ref<Amount>;

  @prop({ required: true })
  active!: boolean;
}

const WalletModel = getModelForClass(Wallet);

export default WalletModel;
