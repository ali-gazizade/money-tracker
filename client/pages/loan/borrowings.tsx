import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { Button, Modal, Pagination, Select, Table, Typography, message, Input } from 'antd';
import Contact from '@/interfaces/Contact';
import DebounceSelect from '@/components/DebounceSelect';
import SelectValue from '@/interfaces/SelectValue';
import Amount from '@/components/Amount';
import AmountInterface from '@/interfaces/Amount';
import { Currency } from '../settings/currencies';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Borrowing {
  _id: string;
  contact: {
    _id: string,
    name: string
  };
  amount: {
    value: string,
    currency: {
      _id: string,
      name: string,
    }
  };
  borrowerType: 'Contact' | 'User';
  description: string
}

const columns = [
  {
    title: 'Borrower type',
    dataIndex: 'borrowerType',
    key: 'borrowerType',
  },
  {
    title: 'Contact',
    dataIndex: ['contact', 'name'],
    key: 'contact'
  },
  {
    title: 'Amount',
    key: 'amount',
    render: (e: Borrowing) =>
      e.amount.value + ' ' + e.amount.currency.name
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  }
];

const Borrowings: React.FC = () => {
  const [list, setList] = useState<Borrowing[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contact, setContact] = useState<SelectValue>({ value: '', label: '' });
  const [amount, setAmount] = useState<AmountInterface>({ value: '0', currency: '' });
  const [borrowerType, setBorrowerType] = useState('Contact');
  const [description, setDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const updateList = async () => {
    const res = await axios.get(`/bi/loan/list/borrowing?page=${currentPage}&limit=${pageSize}`);
    setList(res.data?.borrowings);
    setTotalCount(res.data?.totalCount);
  };

  const updateCurrencies = async () => {
    const res = await axios.get('/bi/currency/list');
    setCurrencies(res.data);

    const defaultCurrencyId = res.data.find((e: Currency) => e.isDefault)?._id;
    setAmount({ value: '0', currency: defaultCurrencyId });
  }

  useEffect(() => {
    updateList();
    updateCurrencies();
  }, [currentPage, pageSize]);

  const showCreateModal = () => {
    setContact({ value: '', label: '' });
    setAmount({ ...amount, value: '0' });
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    await axios.post(`/bi/loan/create/borrowing`, {
      contact: contact.value,
      amount,
      borrowerType,
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
    return axios.get(`/bi/contact/list?page=1&limit=10&name=${value}`)
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

  const onContactChange = (from: SelectValue | SelectValue[]) => {
    if (!Array.isArray(from)) setContact({
      value: from?.value, label: from?.label || ''
    })
  };

  return <>
    <Modal width={350} title={`New Borrowing`} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <Text strong>Contact: </Text>
      <DebounceSelect
        showSearch
        value={contact}
        placeholder="Select the contact"
        fetchOptions={fetchContactsList}
        onChange={onContactChange}
        className="form-field"
      />
      <div className="text-center form-field">
        <Amount
          value={amount.value}
          currencies={currencies}
          selectedCurrencyId={amount.currency}
          onValueChange={value => setAmount({ ...amount, value: value || '0' })} // Value always number, if null then 0
          onCurrencyChange={currency => setAmount({ ...amount, currency: currency })}
        />
      </div>
      <Text strong>Borrower: </Text>
      <Select
        options={[{ value: 'Contact', label: 'Contact' }, { value: 'User', label: 'User' }]}
        value={borrowerType}
        onChange={(value) => setBorrowerType(value)}
        className="form-field"
      />
      <TextArea
        rows={2}
        placeholder="Write a description"
        value={description}
        onChange={onDescriptionChange}
        className="form-field"
      />
    </Modal>
    <Layout>
      <Title className="text-center" level={2}>
        Borrowings
        <Button size="large" className="add-btn" onClick={showCreateModal}>
          <PlusOutlined />
        </Button>
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

export default Borrowings;
