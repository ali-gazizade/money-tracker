import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Divider, Space, Statistic, Typography } from 'antd';
import Currency from '@/interfaces/Currency';

const { Title, Text } = Typography;

interface TotalsData {
  expense: number,
  income: number,
  balance: number
};

interface LoansData {
  loanAmountToUser: number,
  loanAmountToContacts: number
};

interface Wallet {
  _id: string,
  name: string,
  currentAmounts: {
    currencyId: string,
    currencyName: string,
    total: number
  }[]
};

const Dashboard: React.FC = () => {
  const [totalsData, setTotalsData] = useState<TotalsData | null>(null);
  const [loansData, setLoansData] = useState<LoansData | null>(null);
  const [walletsData, setWalletsData] = useState<Wallet[]>([]);
  const [currency, setCurrency] = useState<Currency | null>(null);

  const updateData = async () => {
    const totalsRes = await axios.get('/bi/dashboard/totals');
    setTotalsData(totalsRes.data);

    const loansRes = await axios.get('/bi/dashboard/loan');
    setLoansData(loansRes.data);

    const defCurrencyRes = await axios.get('/bi/currency/default');
    setCurrency(defCurrencyRes.data);

    const walletsRes = await axios.get('/bi/dashboard/wallet_list');
    setWalletsData(walletsRes.data?.wallets || []);
  }

  useEffect(() => {
    updateData();
  }, []);

  return <>
    <Title className="text-center" level={2}>
      Dashboard
    </Title>
    <Space size={[16, 16]} style={{ padding: 24 }} wrap>
      <Card bordered={false} style={{ backgroundColor: '#e6f4ff' }}>
        <Statistic
          title="Balance"
          value={`${totalsData?.balance} ${currency?.name}`}
        />
      </Card>
      <Card bordered={false} style={{ backgroundColor: '#fff2f0' }}>
        <Statistic
          title="Expense"
          value={`${totalsData?.expense} ${currency?.name}`}
        />
      </Card>
      <Card bordered={false} style={{ backgroundColor: '#f6ffed' }}>
        <Statistic
          title="Income"
          value={`${totalsData?.income} ${currency?.name}`}
        />
      </Card>
    </Space>
    <Space size={[48, 48]} style={{ padding: 24 }} wrap>
      <Card bordered={false} style={{ backgroundColor: '#f0f5ff' }}>
        <Statistic
          title="Loan to Contacts"
          value={`${loansData?.loanAmountToContacts} ${currency?.name}`}
        />
      </Card>
      <Card bordered={false} style={{ backgroundColor: '#e6fffb' }}>
        <Statistic
          title="Loan to me"
          value={`${loansData?.loanAmountToUser} ${currency?.name}`}
        />
      </Card>
    </Space>
    <Divider orientation="left">Wallets</Divider>
    <Space size={[48, 48]} style={{ padding: 24 }} wrap>
      { walletsData.map(wallet =>
        <Card
          title={ wallet.name }
          bordered={false}
          key={wallet._id}
        >
          <Space
            size={[8, 8]}
            direction={ wallet.currentAmounts.length > 3 ? 'vertical' : 'horizontal' }
          >
            { wallet.currentAmounts.map(amount =>
              <React.Fragment key={amount.currencyId}>
                <Text>{amount.total} {amount.currencyName}</Text>
                <br />
              </React.Fragment>
            )}
          </Space>
        </Card>
      )}
    </Space>
  </>;
};

export default Dashboard;
