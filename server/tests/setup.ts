import AmountModel from "../models/amount";
import CurrencyModel from "../models/currency";
import WalletModel from "../models/wallet";

beforeAll(async () => {
  await WalletModel.deleteMany({});
  await AmountModel.deleteMany({});
  await CurrencyModel.deleteMany({});

  const currency1 = await CurrencyModel.create({ name: 'AZN', isDefault: true, active: true });
  const currency2 = await CurrencyModel.create({ name: 'USD', isDefault: false, active: true });
  await CurrencyModel.create({ name: 'EUR', isDefault: false, active: true });
  await CurrencyModel.create({ name: 'TL', isDefault: false, active: false });

  const amount1 = await AmountModel.create({ value: '1.00', currency: currency1._id });
  const amount2 = await AmountModel.create({ value: '21.50', currency: currency2._id });
  const amount3 = await AmountModel.create({ value: '152', currency: currency2._id });

  await WalletModel.create({ name: 'Wallet 1', firstTimeAmounts: [amount1, amount2] });
  await WalletModel.create({ name: 'Wallet 2', firstTimeAmounts: [amount3] });
  await WalletModel.create({ name: 'Wallet 3', firstTimeAmounts: [] });
});
