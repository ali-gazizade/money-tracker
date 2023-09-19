import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout';
import axios from 'axios';
import { Button, Card, Input, Modal, Popconfirm, Space, Switch, Tooltip, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, SelectOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Currency {
  _id: string;
  name: string;
  isDefault: boolean;
}

const Currencies: React.FC = () => {
  const [list, setList] = useState<Currency[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const updateList = async () => {
    const res = await axios.get('bi/currency/list');
    setList(res.data);
  }

  useEffect(() => {
    updateList();
  }, []);

  const showCreateModal = () => {
    setId(null);
    setName('');
    setIsDefault(false);
    setIsModalOpen(true);
  };

  const showUpdateModal = async (id: string) => {
    const item: Currency | undefined = list.find(e => e._id === id);
    if (!item) {
      message.error('Item not found from the list');
      return;
    }
    setId(id);
    setName(item.name);
    setIsDefault(item.isDefault);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!id) { // Create
      await axios.post('bi/currency/create', {
        name, isDefault
      });
      message.success('Successfully created');
      updateList();
      setIsModalOpen(false);
    } else { // Update
      await axios.put('bi/currency/update/' + id, {
        name, isDefault
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

  const onIsDefaultChange = (checked: boolean) => {
    setIsDefault(checked);
  }

  const confirmDelete = async (id: string) => {
    await axios.put('bi/currency/update/' + id, { active: false });
    message.success('Successfully deleted');
    updateList();
  };

  return <>
    <Modal width={350} title="New Currency" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <Input placeholder="Name" value={name} onChange={onNameChange} className="form-field" />
      <div className="form-field">
        <Text>Default: </Text>
        <Switch checked={isDefault} onChange={onIsDefaultChange} />
      </div>
    </Modal>
    <Layout>
      <Title className="text-center" level={2}>
        Currencies
        <Button size="large" className="add-btn" onClick={showCreateModal}>
          <PlusOutlined />
        </Button>
      </Title>
      <Space size={[16, 16]} wrap>
        {list.map(e => (
          <Card
            title={
              <Text>
                { e.isDefault
                  ? <Tooltip title="Default">
                    <SelectOutlined />
                  </Tooltip>
                  : null
                }
                { ' ' + e.name }
              </Text>
            }
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

export default Currencies;
