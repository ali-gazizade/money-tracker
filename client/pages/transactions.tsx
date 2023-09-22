import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { Button, Modal, Pagination, Select, Space, Table, Tag, Typography, message, Input } from 'antd';
import Wallet from '@/interfaces/Wallet';
import Contact from '@/interfaces/Contact';
import DebounceSelect from '@/components/DebounceSelect';
import SelectValue from '@/interfaces/SelectValue';
import Amount from '@/components/Amount';
import AmountInterface from '@/interfaces/Amount';
import { Currency } from './currencies';
import City from '@/interfaces/City';
import TransactionType from '@/enums/TransactionType';

const { Title, Text } = Typography;
const { TextArea } = Input;

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
      color={ e === TransactionType.Expense
        ? 'red'
        : e === TransactionType.Income
          ? 'green'
          : e === TransactionType.Transfer
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [walletOptions, setWalletOptions] = useState<SelectValue[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [type, setType] = useState<TransactionType>(TransactionType.Expense);

  const updateList = async () => {
    const res = await axios.get(`bi/transaction/list?page=${currentPage}&limit=${pageSize}`);
    setList(res.data?.transactions);
    setTotalCount(res.data?.totalCount);

    if (res.data?.transactions?.length) { // Set the last used city as default
      const lastUsedCity = res.data.transactions[0].city;
      setCity({ value: lastUsedCity._id, label: lastUsedCity.name });
    }
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
    setFrom({ value: '', label: '' });
    setTo({ value: '', label: '' });
    setAmount({ ...amount, value: '0' });
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    await axios.post(`bi/transaction/create/${type.toLowerCase()}`, {
      from: from.value,
      to: to.value,
      amount,
      city: city.value,
      description
    });
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

  const onFromChange = (from: SelectValue | SelectValue[]) => {
    if (!Array.isArray(from)) setFrom({
      value: from?.value, label: from?.label || ''
    })
  };

  const onToChange = (to: SelectValue | SelectValue[]) => {
    if (!Array.isArray(to)) setTo({
      value: to?.value, label: to?.label || ''
    })
  };

  const onCityChange = (city: SelectValue | SelectValue[]) => {
    if (!Array.isArray(city)) {
      setCity({ value: city?.value, label: city?.label || '' });
    }
  };

  return <>
    <Modal width={350} title={`New ${type}`} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <Text strong>From: </Text>
      { type === TransactionType.Income
        ? <DebounceSelect
          showSearch
          value={from}
          placeholder="Select a contact"
          fetchOptions={fetchContactsList}
          onChange={onFromChange}
          className="form-field"
        />
        : <Select
          placeholder="Select a wallet"
          options={walletOptions}
          value={from}
          onChange={(value, e) => onFromChange(e)}
          className="form-field"
        />
      }
      <Text strong>To: </Text>
      { type === TransactionType.Expense
        ? <DebounceSelect
          showSearch
          value={to}
          placeholder="Select a contact"
          fetchOptions={fetchContactsList}
          onChange={onToChange}
          className="form-field"
        />
        : <Select
          placeholder="Select a wallet"
          options={walletOptions}
          value={to}
          onChange={(value, e) => onToChange(e)}
          className="form-field"
        />
      }
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
        onChange={ onCityChange }
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
          <Button
            style={{ backgroundColor: '#cf1322' }}
            type="primary"
            size="large"
            className="add-btn"
            onClick={() => {
              setType(TransactionType.Expense);
              showCreateModal();
            }}
          >
            Add Expense
          </Button>
          <Button
            style={{ backgroundColor: '#389e0d' }}
            type="primary"
            size="large"
            className="add-btn"
            onClick={() => {
              setType(TransactionType.Income);
              showCreateModal();
            }}
          >
            Add Income
          </Button>
          <Button
            style={{ backgroundColor: '#d4b106' }}
            type="primary"
            size="large"
            className="add-btn"
            onClick={() => {
              setType(TransactionType.Transfer);
              showCreateModal();
            }}
          >
            Add Transfer
          </Button>
        </Space>
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
    </Layout>
  </>;
};

export default Transactions;
