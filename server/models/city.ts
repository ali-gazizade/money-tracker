import { prop, getModelForClass } from '@typegoose/typegoose';
import BaseModel from './base';

class City extends BaseModel {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  countryName!: string;

  @prop({ required: true })
  active!: boolean;
}

const CityModel = getModelForClass(City);

export default CityModel;

export { City };
