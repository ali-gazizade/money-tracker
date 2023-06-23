import { prop, getModelForClass } from '@typegoose/typegoose';
import { Document } from 'mongoose';

class Contact extends Document {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  active!: boolean;
}

const ContactModel = getModelForClass(Contact);

export default ContactModel;

export { Contact };
