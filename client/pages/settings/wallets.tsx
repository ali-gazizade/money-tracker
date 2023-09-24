import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { Button, Card, Input, Modal, Popconfirm, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Amount from '@/components/Amount';
import AmountInterface from '@/interfaces/Amount';
import { Currency } from './currencies';
import Wallet from '@/interfaces/Wallet';

const { Title, Text } = Typography;

let idIndex = 1; // Temporary id for keys

const Wallets: React.FC = () => {
  const [list, setList] = useState<Wallet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [modalTitle, setModalTitle] = useState('New Wallet');
  const [initialAmounts, setInitialAmounts] = useState<AmountInterface[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const updateList = async () => {
    const res = await axios.get('/bi/wallet/list');
    setList(res.data);
  }

  const updateCurrencies = async () => {
    const res = await axios.get('/bi/currency/list');
    setCurrencies(res.data);
  }

  useEffect(() => {
    updateCurrencies();
    updateList();
  }, []);

  const showCreateModal = () => {
    setModalTitle('New Wallet');
    setId(null);
    setName('');
    setInitialAmounts([]);
    setIsModalOpen(true);
  };

  const showUpdateModal = async (id: string) => {
    setModalTitle('Update Wallet');
    const item: Wallet | undefined = list.find(e => e._id === id);
    if (!item) {
      message.error('Item not found from the list');
      return;
    }
    setId(id);
    setName(item.name);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!id) { // Create
      await axios.post('/bi/wallet/create', {
        name,
        initialAmounts: initialAmounts.map(e => ({
          value: e.value,
          currency: e.currency
        }))
      });
      message.success('Successfully created');
      updateList();
      setIsModalOpen(false);
    } else { // Update
      await axios.put('/bi/wallet/update/' + id, {
        name
      });
      message.success('Successfully updated');
      updateList();
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e?.target?.value);
  }

  const confirmDelete = async (id: string) => {
    await axios.put('/bi/wallet/update/' + id, { active: false });
    message.success('Successfully deleted');
    updateList();
  };

  const addInitialAmount = () => {
    if (!initialAmounts.length) {
      const defaultCurrencyId = currencies.find(e => e.isDefault)?._id || ''; // There must be at least 1 default
      setInitialAmounts([...initialAmounts, { value: '0.00', currency: defaultCurrencyId, _id: idIndex + '' }]);
      idIndex++;
    } else if (initialAmounts.length < currencies.length) {
      const anyCurrencyId = currencies.find(e => !initialAmounts.find(a => e._id === a.currency))?._id || ''; // Will find an id and won't be empty
      setInitialAmounts([...initialAmounts, { value: '0.00', currency: anyCurrencyId, _id: idIndex + '' }]);
      idIndex++;
    }
  };

  const removeInitialAmount = (id: string) => {
    setInitialAmounts(initialAmounts.filter((e) => e._id !== id));
  };

  const changeInitialAmountValue = (id: string, value: string) => {
    setInitialAmounts(initialAmounts.map((e) => (
      e._id === id ? { ...e, value } : e
    )));
  };

  const changeInitialAmountCurrency = (id: string, value: string) => {
    setInitialAmounts(initialAmounts
      .filter(e => e.currency !== value) // Make the currency unique for each amount by deleting the previous amount with the same currency
      .map((e) => (
        e._id === id ? { ...e, currency: value } : e
    )));
  };

  return <>
    <Modal width={350} title={modalTitle} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <Input placeholder="Name" value={name} onChange={onNameChange} className="form-field" />
      { !!id ||
        <Space wrap direction="vertical" style={{ width: '100%' }}>
          <div className="text-center"><Text strong>Initial Amounts:</Text></div>
          {
            initialAmounts.map((e) =>
              <div key={e._id} className="text-center">
                <Amount
                  value={e.value}
                  currencies={currencies}
                  selectedCurrencyId={e.currency}
                  onValueChange={value => changeInitialAmountValue(e._id || '', value || '0')} // Value always number, if null then 0
                  onCurrencyChange={value => changeInitialAmountCurrency(e._id || '', value)}
                />
                <Button danger type="primary" size="middle" onClick={() => removeInitialAmount(e._id || '')} style={{ marginLeft: '8px' }}>
                  <DeleteOutlined />
                </Button>
              </div>
            )
          }
          { initialAmounts.length < currencies.length &&
            <div className="text-center">
              <Button size="middle" onClick={addInitialAmount}>
                <PlusOutlined />
              </Button>
            </div>
          }
        </Space>
      }
    </Modal>
    <Layout>
      <Title className="text-center" level={2}>
        Wallets
        <Button size="large" className="add-btn" onClick={showCreateModal}>
          <PlusOutlined />
        </Button>
      </Title>
      <Space size={[16, 16]} wrap>
        {list.map(e => (
          <Card
            title={ e.name }
            bordered={false}
            key={e._id}
          >
            <Space size={[8, 8]}>
              <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => showUpdateModal(e._id)} />
              <Popconfirm
                title="Delete the item"
                description="Are you sure to delete this item?"
                onConfirm={() => confirmDelete(e._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger type="primary" shape="circle" icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          </Card>
        ))}
      </Space>
    </Layout>
  </>;
};

export default Wallets;
