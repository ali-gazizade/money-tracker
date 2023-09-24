import Navbar from "./Navbar";
import { useRouter } from "next/router";
import { getCookie } from 'cookies-next';
import { useEffect, useState } from "react";
import { Spin, Layout as AntLayout, Divider } from "antd";

const { Footer } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const login = getCookie('login');
  const [spin, setSpin] = useState(true);

  useEffect(() => {
    if (login != '1') {
      router.push('login');
    } else {
      setSpin(false);
    }
  }, []);

  return (
    spin
      ? <div className="spin-container">
        <Spin tip="Loading" size="large">
          <div className="content" />
        </Spin>
        </div>
      : <div>
        <AntLayout className="layout">
          <Navbar />
          <main>{children}</main>
        </AntLayout>
        <Footer className="footer">
          <Divider />
          Made by Ali Gazizade
        </Footer>
      </div>
  );
};

export default Layout;