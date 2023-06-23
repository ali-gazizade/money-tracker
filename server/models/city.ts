import { prop, getModelForClass } from '@typegoose/typegoose';
import { Document } from 'mongoose';

class City extends Document {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  country_name!: string;

  @prop({ required: true })
  active!: boolean;
}

const CityModel = getModelForClass(City);

export default CityModel;

export { City };
