import { prop, getModelForClass } from '@typegoose/typegoose';

class Contact {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  active!: boolean;
}

const ContactModel = getModelForClass(Contact);

export default ContactModel;

export { Contact };
