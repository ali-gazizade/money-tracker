import { Wallet } from '../models/wallet';

const walletAssembler = (wallet: Wallet) => {
  return {
    _id: wallet._id,
    name: wallet.name,
    firstTimeAmounts: wallet.firstTimeAmounts.map(firstTimeAmount => ({
      value: firstTimeAmount.value,
      currency: !firstTimeAmount.currency
      ? null
      : typeof firstTimeAmount.currency === 'object'
        ? {
          _id: firstTimeAmount.currency._id,
          name: firstTimeAmount.currency.name,
        }
        : firstTimeAmount.currency
    }))
  };
};

export default walletAssembler;
