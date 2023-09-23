interface Currency {
  _id: string;
  name: string;
  isDefault: boolean;
  exchangeRate: number;
}

export default Currency;