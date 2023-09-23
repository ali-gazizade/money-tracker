import { Currency } from '../models/currency';

const currencyAssembler = (currency: Currency) => {
  return {
    _id: currency._id,
    name: currency.name,
    isDefault: currency.isDefault,
    exchangeRate: currency.exchangeRate || currency._exchangeRate
  };
};

export default currencyAssembler;
