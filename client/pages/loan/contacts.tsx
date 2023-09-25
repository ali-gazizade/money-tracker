import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { Pagination, Space, Table, Typography } from 'antd';

const { Title, Text } = Typography;

interface Loan {
  _id: string;
  contact: {
    _id: string,
    name: string
  };
  loanAmountsToUser: {
    value: string,
    currency: {
      _id: string,
      name: string
    }
  }[]
}

const columns = [
  {
    title: 'Contact',
    dataIndex: ['contact', 'name'],
    key: 'contact'
  },
  {
    title: 'Loan to user',
    key: 'loanAmountsToUser',
    render: (loan: Loan) => {
      const amounts = loan.loanAmountsToUser.filter(e => +e.value > 0);

      return amounts.length
        ? <Space direction="vertical">
          { amounts.map(amount =>
              <Text key={amount.currency._id}>
                {`${amount.value} ${amount.currency.name}`}
              </Text>
          )}
        </Space>
        : <Text>0</Text>
    }
  },
  {
    title: 'Loan to contact',
    key: 'loanAmountsToContact',
    render: (loan: Loan) => {
      const amounts = loan.loanAmountsToUser.filter(e => +e.value < 0);

      return amounts.length
        ? <Space direction="vertical">
          { amounts.map(amount =>
              <Text key={amount.currency._id}>
                {`${Math.abs(+amount.value)} ${amount.currency.name}`}
              </Text>
          )}
        </Space>
        : <Text>0</Text>
    }
  },
];

const Contacts: React.FC = () => {
  const [list, setList] = useState<Loan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const updateList = async () => {
    const res = await axios.get(`/bi/loan/contact_list?page=${currentPage}&limit=${pageSize}`);
    setList(res.data?.loans);
    setTotalCount(res.data?.totalCount);
  };

  useEffect(() => {
    updateList();
  }, [currentPage, pageSize]);

  const onPaginationSizeChange = (current: number, pageSize: number) => {
    setCurrentPage(current);
    setPageSize(pageSize);
  }

  return <Layout>
    <Title className="text-center" level={2}>
      Contact Loans
    </Title>
    <Table pagination={false} columns={columns} dataSource={list} rowKey="_id" />
    <Pagination 
      className="pagination" 
      current={currentPage}
      pageSize={pageSize} 
      total={totalCount}
      showSizeChanger
      onChange={(page) => setCurrentPage(page)}
      onShowSizeChange={onPaginationSizeChange}
    />
  </Layout>;
};

export default Contacts;
