import React, { useState } from 'react';
import { InputNumber, Select, Space } from 'antd';
import Currency from '../interfaces/Currency';

interface AmountProps {
  value: string;
  currencies: Currency[];
  selectedCurrencyId: string;
  onValueChange: (value: string | null) => void;
  onCurrencyChange: (value: string, option: { value: string; label: string; } | { value: string; label: string; }[]) => void;
}

const Amount: React.FC<AmountProps> = ({ value, currencies, selectedCurrencyId, onValueChange, onCurrencyChange }) => {
  const [options] = useState(currencies.map(e => ({ value: e._id, label: e.name })));

  return <Space wrap>
    <InputNumber
      value={value}
      onChange={onValueChange}
    />
    <Select
      value={selectedCurrencyId}
      onChange={onCurrencyChange}
      options={options}
    />
  </Space>;
};

export default Amount;