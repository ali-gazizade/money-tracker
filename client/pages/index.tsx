import React, { useState } from 'react';
import { LogoutOutlined, MoneyCollectFilled, SettingOutlined, TransactionOutlined, HomeOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';

const items: MenuProps['items'] = [
  {
    label: 'Home',
    key: 'home',
    icon: <HomeOutlined />,
  },
  {
    label: 'Transactions',
    key: 'transactions',
    icon: <TransactionOutlined />,
    style: { marginLeft: 'auto' },
  },
  {
    label: 'Loans',
    key: 'loans',
    icon: <MoneyCollectFilled />,
    children: [
      {
        label: 'Borrowings',
        key: 'borrowings'
      },
      {
        label: 'Repayments',
        key: 'repayments'
      },
      {
        label: 'Contact List',
        key: 'contact_list'
      },
    ]
  },
  {
    label: 'Settings',
    key: 'SubMenu',
    icon: <SettingOutlined />,
    children: [
      {
        label: 'Contacts',
        key: 'contacts',
      },
      {
        label: 'Wallets',
        key: 'wallets',
      },
      {
        label: 'Currencies',
        key: 'currencies',
      },
      {
        label: 'Cities',
        key: 'cities',
      },
    ],
  },
  {
    label: (
      <a href="bi/auth/logout">
        <LogoutOutlined/> Logout
      </a>
    ),
    key: 'logout'
  },
];

const App: React.FC = () => {
  const [current, setCurrent] = useState('transactions');

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };

  return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} className='navbar-menu' />;
};

export default App;