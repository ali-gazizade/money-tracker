import { Wallet } from '../models/wallet';

const walletAssembler = (wallet: Wallet) => {
  return {
    _id: wallet._id,
    name: wallet.name,
    initialAmounts: wallet.initialAmounts.map(initialAmount => ({
      value: initialAmount.value,
      currency: !initialAmount.currency
      ? null
      : typeof initialAmount.currency === 'object'
        ? {
          _id: initialAmount.currency._id,
          name: initialAmount.currency.name,
        }
        : initialAmount.currency
    }))
  };
};

export default walletAssembler;
