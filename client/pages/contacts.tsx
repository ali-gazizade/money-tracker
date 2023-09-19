import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout';
import axios from 'axios';
import { AutoComplete, Button, Card, Input, Modal, Pagination, Popconfirm, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Contact {
  _id: string;
  name: string;
}

const Contacts: React.FC = () => {
  const [list, setList] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [modalTitle, setModalTitle] = useState('New Contact');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const updateList = async () => {
    const res = await axios.get(`bi/contact/list?page=${currentPage}&limit=${pageSize}`);
    setList(res.data?.contacts);
    setTotalCount(res.data?.totalCount);
  }

  useEffect(() => {
    updateList();
  }, [currentPage, pageSize]);

  const showCreateModal = () => {
    setModalTitle('New Contact');
    setId(null);
    setName('');
    setIsModalOpen(true);
  };

  const showUpdateModal = async (id: string) => {
    setModalTitle('Update Contact');
    const item: Contact | undefined = list.find(e => e._id === id);
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
      await axios.post('bi/contact/create', {
        name
      });
      message.success('Successfully created');
      updateList();
      setIsModalOpen(false);
    } else { // Update
      await axios.put('bi/contact/update/' + id, {
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
    await axios.put('bi/contact/update/' + id, { active: false });
    message.success('Successfully deleted');
    updateList();
  };

  const onPaginationSizeChange = (current: number, pageSize: number) => {
    setCurrentPage(current);
    setPageSize(pageSize);
  }

  return <>
    <Modal width={350} title={modalTitle} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <Input placeholder="Name" value={name} onChange={onNameChange} className="form-field" />
    </Modal>
    <Layout>
      <Title className="text-center" level={2}>
        Contacts
        <Button size="large" className="add-btn" onClick={showCreateModal}>
          <PlusOutlined />
        </Button>
      </Title>
      <Space size={[16, 16]} wrap>
        {list.map(e => (
          <Card
            title={
              <Space size={[4, 4]} direction="vertical">
                <Text>
                  { e.name }
                </Text>
              </Space>
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

export default Contacts;
