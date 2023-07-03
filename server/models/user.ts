import { prop, getModelForClass } from '@typegoose/typegoose';
import { Document } from 'mongoose';

class User extends Document {
  @prop({ required: true })
  name!: string;

  @prop({ required: true, unique: true })
  username!: string;

  @prop({ required: true })
  password!: string;
}

const UserModel = getModelForClass(User);

export default UserModel;

export { User };
