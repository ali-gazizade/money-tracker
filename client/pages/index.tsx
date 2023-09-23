import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { Card, Space, Statistic, Typography } from 'antd';
import Currency from '@/interfaces/Currency';

const { Title } = Typography;

interface DashboardData {
  expense: number,
  income: number,
  balance: number,
  currency: Currency
};

const App: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  const updateData = async () => {
    const res = await axios.get('bi/dashboard/totals');
    setData(res.data);
  }

  useEffect(() => {
    updateData();
  }, []);

  return <Layout>
    <Space size={[16, 16]} style={{ padding: 24 }} wrap>
      <Card bordered={false} style={{ backgroundColor: '#e6f4ff' }}>
        <Statistic
          title="Balance"
          value={`${data?.balance} ${data?.currency?.name}`}
        />
      </Card>
      <Card bordered={false} style={{ backgroundColor: '#fff2f0' }}>
        <Statistic
          title="Expense"
          value={`${data?.expense} ${data?.currency?.name}`}
        />
      </Card>
      <Card bordered={false} style={{ backgroundColor: '#f6ffed' }}>
        <Statistic
          title="Income"
          value={`${data?.income} ${data?.currency?.name}`}
        />
      </Card>
    </Space>
  </Layout>;
};

export default App;
