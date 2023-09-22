import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout';
import axios from 'axios';
import { Button, Modal, Pagination, Select, Space, Table, Tag, Typography, message } from 'antd';
import Wallet from '@/interfaces/Wallet';
import Contact from '@/interfaces/Contact';
import DebounceSelect from '@/components/DebounceSelect';
import SelectValue from '@/interfaces/SelectValue';
import Amount from '@/components/amount';
import AmountInterface from '@/interfaces/Amount';
import { Currency } from './currencies';
import City from '@/interfaces/City';
import TextArea from 'antd/es/input/TextArea';

const { Title, Text } = Typography;

interface Transaction {
  _id: string;
  to: {
    _id: string,
    name: string
  };
  from: {
    _id: string,
    name: string
  },
  amount: {
    value: string,
    currency: {
      _id: string,
      name: string,
    }
  },
  city: {
    _id: string,
    name: string,
    countryName: string
  },
  happenedAt: string,
  description: string
}

const columns = [
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (e: string) => <Tag
      color={ e === 'Expense'
        ? 'red'
        : e === 'Income'
          ? 'green'
          : e === 'Transfer'
            ? 'yellow'
            : 'volcano'
      }
    >
      {e}
    </Tag>
  },
  {
    title: 'From',
    dataIndex: ['from', 'name'],
    key: 'from'
  },
  {
    title: 'To',
    dataIndex: ['to', 'name'],
    key: 'to'
  },
  {
    title: 'Amount',
    dataIndex: ['amount', 'value'],
    key: 'amount',
  },
  {
    title: 'City',
    dataIndex: ['city', 'name'],
    key: 'city',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  }
];

const Transactions: React.FC = () => {
  const [list, setList] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [from, setFrom] = useState<SelectValue>({ value: '', label: '' });
  const [to, setTo] = useState<SelectValue>({ value: '', label: '' });
  const [amount, setAmount] = useState<AmountInterface>({ value: '0', currency: '' });
  const [city, setCity] = useState<SelectValue>({ value: '', label: '' });
  const [description, setDescription] = useState('');
  const [modalTitle, setModalTitle] = useState('New Transaction');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [walletOptions, setWalletOptions] = useState<SelectValue[]>([]);
  const [contactOptions, setContactOptions] = useState<SelectValue[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const updateList = async () => {
    const res = await axios.get(`bi/transaction/list?page=${currentPage}&limit=${pageSize}`);
    setList(res.data?.transactions);
    setTotalCount(res.data?.totalCount);
  };

  const updateCurrencies = async () => {
    const res = await axios.get('bi/currency/list');
    setCurrencies(res.data);

    const defaultCurrencyId = res.data.find((e: Currency) => e.isDefault)?._id;
    setAmount({ value: '0', currency: defaultCurrencyId });
  }

  const updateWalletOptions = async () => {
    const res = await axios.get(`bi/wallet/list`);
    if (res.data) {
      const wallets: Wallet[] = res.data;
      const options = wallets.map(e => ({
        value: e._id,
        label: e.name
      }));
      setWalletOptions(options);
    } else {
      setWalletOptions([]);
    }
  };

  useEffect(() => {
    updateList();
    updateCurrencies();
    updateWalletOptions();
  }, [currentPage, pageSize]);

  const showCreateModal = () => {
    setModalTitle('New Transaction');
    setFrom({ value: '', label: '' });
    setTo({ value: '', label: '' });
    setAmount({ ...amount, value: '0' });
    setCity({ value: '', label: '' });
    setDescription('');
    setContactOptions([]);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    // await axios.post('bi/transaction/create', { // Todo uncomment
    //   from, to, city, description
    // });
    console.log({ from, to, amount, city, description });
    message.success('Successfully created');
    updateList();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e?.target?.value);
  }

  const onPaginationSizeChange = (current: number, pageSize: number) => {
    setCurrentPage(current);
    setPageSize(pageSize);
  }

  const fetchContactsList = async (value: string) => {
    return axios.get(`bi/contact/list?page=1&limit=10&name=${value}`)
      .then(res => {
        const contacts: Contact[] = res.data?.contacts;
        if (contacts) {
          return contacts.map(e => ({
            value: e._id,
            label: e.name
          }));
        } else {
          return [];
        }
      });
  };

  const fetchCitiesList = async (value: string) => {
    return axios.get(`bi/city/list?page=1&limit=10&name=${value}`)
      .then(res => {
        const cities: City[] = res.data?.cities;
        if (cities) {
          return cities.map(e => ({
            value: e._id,
            label: e.name
          }));
        } else {
          return [];
        }
      });
  };

  return <>
    <Modal width={350} title={modalTitle} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <Text strong>From: </Text>
      <Select
        placeholder="Select a wallet"
        options={walletOptions}
        value={from}
        onChange={(value, e) => {
          if (!Array.isArray(e)) setFrom({ value: e?.value, label: e?.label || '' })
        }}
        className="form-field"
      />
      <Text strong>To: </Text>
      <DebounceSelect
        showSearch
        value={to}
        placeholder="Select a contact"
        fetchOptions={fetchContactsList}
        onChange={e => {
          if (!Array.isArray(e)) setTo({ value: e?.value, label: e?.label || '' })
        }}
        className="form-field"
      />
      <div className="text-center">
        <Amount
          value={amount.value}
          currencies={currencies}
          selectedCurrencyId={amount.currency}
          onValueChange={value => setAmount({ ...amount, value: value || '0' })} // Value always number, if null then 0
          onCurrencyChange={currency => setAmount({ ...amount, currency: currency })}
        />
      </div>
      <Text strong>City: </Text>
      <DebounceSelect
        showSearch
        value={city}
        placeholder="Select a city"
        fetchOptions={fetchCitiesList}
        onChange={e => {
          if (!Array.isArray(e)) setCity({ value: e?.value, label: e?.label || '' })
        }}
        className="form-field"
      />
      <TextArea
        rows={2}
        placeholder="Write a description"
        value={description}
        onChange={onDescriptionChange}
      />
    </Modal>
    <Layout>
      <Title className="text-center" level={2}>
        Transactions
        <br/>
        <Space wrap className="text-center">
          <Button style={{ backgroundColor: '#cf1322' }} type="primary" size="large" className="add-btn" onClick={showCreateModal}>
            Add Expense
          </Button>
          <Button style={{ backgroundColor: '#389e0d' }} type="primary" size="large" className="add-btn" onClick={showCreateModal}>
            Add Income
          </Button>
          <Button style={{ backgroundColor: '#d4b106' }} type="primary" size="large" className="add-btn" onClick={showCreateModal}>
            Add Transfer
          </Button>
        </Space>
      </Title>
      <Table pagination={false} columns={columns} dataSource={list} />
      <Pagination 
        className="pagination" 
        current={currentPage}
        pageSize={pageSize} 
        total={totalCount}
        showSizeChanger
        onChange={(page) => setCurrentPage(page)}
        onShowSizeChange={onPaginationSizeChange}
      />
    </Layout>
  </>;
};

export default Transactions;
