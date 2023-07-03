import { prop, getModelForClass } from '@typegoose/typegoose';
import BaseModel from './base';

class Contact extends BaseModel {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  active!: boolean;
}

const ContactModel = getModelForClass(Contact);

export default ContactModel;

export { Contact };
