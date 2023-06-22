import { prop, getModelForClass } from '@typegoose/typegoose';

class City {
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
