import { prop, getModelForClass } from '@typegoose/typegoose';
import BaseDocument from './base';

class Contact extends BaseDocument {
  @prop({ required: true })
  name!: string;

  @prop({ default: true })
  active!: boolean;
}

const ContactModel = getModelForClass(Contact);

export default ContactModel;

export { Contact };
