import AmountModel from "../models/amount";
import CurrencyModel from "../models/currency";
import WalletModel from "../models/wallet";

beforeAll(async () => {
  await WalletModel.deleteMany({});
  await AmountModel.deleteMany({});
  await CurrencyModel.deleteMany({});
});
