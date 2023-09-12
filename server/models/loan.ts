import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import BaseDocument from './base';
import { Contact } from './contact';
import { Amount } from './amount';

class Loan extends BaseDocument {
  @prop({ ref: () => Contact, required: true, unique: true })
  contact!: Ref<Contact>;

  @prop({ ref: () => Amount, type: () => [Amount], required: true })
  loanAmountsToUser!: Ref<Amount>[];

  @prop({ default: 0 })
  version!: number;
}

const LoanModel = getModelForClass(Loan, {
  schemaOptions: {
    versionKey: false
  }
});

export default LoanModel;

export { Loan };
