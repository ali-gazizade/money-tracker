import { Ref, prop } from '@typegoose/typegoose';
import { Document } from 'mongoose';
import { User } from './user';

class BaseModel extends Document {
  @prop({ ref: () => User, required: true })
  user!: Ref<User>;
}

export default BaseModel;