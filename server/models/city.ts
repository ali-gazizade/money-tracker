import { prop, getModelForClass } from '@typegoose/typegoose';
import BaseDocument from './base';

class City extends BaseDocument {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  countryName!: string;

  @prop({ default: true })
  active!: boolean;
}

const CityModel = getModelForClass(City);

export default CityModel;

export { City };
