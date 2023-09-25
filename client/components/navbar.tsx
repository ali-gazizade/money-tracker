import React, { useState } from 'react';
import { LogoutOutlined, MoneyCollectFilled, SettingOutlined, TransactionOutlined, HomeOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/router';

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = router.pathname.replace('/', '') || 'home';
  const [current, setCurrent] = useState(pathname);

  const items: MenuProps['items'] = [
    {
      label: 'Dashboard',
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
      label: 'Loan',
      key: 'loan',
      icon: <MoneyCollectFilled />,
      children: [
        {
          label: 'Borrowings',
          key: 'loan/borrowings'
        },
        {
          label: 'Repayments',
          key: 'loan/repayments'
        },
        {
          label: 'Contacts',
          key: 'loan/contacts'
        },
      ]
    },
    {
      label: 'Settings',
      key: 'settings',
      icon: <SettingOutlined />,
      children: [
        {
          label: 'Contacts',
          key: 'settings/contacts',
        },
        {
          label: 'Wallets',
          key: 'settings/wallets',
        },
        {
          label: 'Currencies',
          key: 'settings/currencies',
        },
        {
          label: 'Cities',
          key: 'settings/cities',
        },
      ],
    },
    {
      label: (
        <a href="bi/auth/logout">
          <LogoutOutlined/> Logout
        </a>
      ),
      key: 'logout',
      onClick: (e) => {
        e.domEvent.preventDefault();
        setCookie('login', '');
        router.push('login');
      }
    },
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
    if (e.key !== 'logout') {
      router.push(e.key === 'home' ? '/' : ('/' + e.key));
    }
  };

  return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} className='navbar-menu' />;
};

export default Navbar;