import { City } from '../models/city';

const cityAssembler = (city: City) => {
  return {
    _id: city._id,
    name: city.name,
    countryName: city.countryName
  };
};

export default cityAssembler;
