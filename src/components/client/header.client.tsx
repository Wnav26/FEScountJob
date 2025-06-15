import { useState, useEffect } from 'react';
import { AppstoreAddOutlined, CodeOutlined, ContactsOutlined, FireOutlined, LogoutOutlined, MenuFoldOutlined, RiseOutlined, TwitterOutlined, SearchOutlined, BankOutlined } from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, MenuProps, Space, message, Button } from 'antd';
import { Menu, ConfigProvider } from 'antd';
import styles from '@/styles/client.module.scss';
import { isMobile } from 'react-device-detect';
import { FaReact, FaBriefcase } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';

const Header = (props: any) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

    const [current, setCurrent] = useState('home');
    const location = useLocation();

    const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);

    useEffect(() => {
        setCurrent(location.pathname);
    }, [location])

    const items: MenuProps['items'] = [
        {
            label: <Link to={'/job'}>Việc Làm IT</Link>,
            key: '/job',
            icon: <SearchOutlined />,
        },
        {
            label: <Link to={'/company'}>Top Công ty IT</Link>,
            key: '/company',
            icon: <BankOutlined />,
        },
        {
            label: <Link to={'http://localhost:4174/'}>Tạo CV bằng AI</Link>,
            key: '/cv-ai',
            icon: <AppstoreAddOutlined />,
        }
    ];



    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
    };

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    const itemsDropdown = [
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => setOpenManageAccount(true)}
            >Quản lý tài khoản</label>,
            key: 'manage-account',
            icon: <ContactsOutlined />
        },
        ...(user.role?.permissions?.length ? [{
            label: <Link
                to={"/admin"}
            >Trang Quản Trị</Link>,
            key: 'admin',
            icon: <FireOutlined />
        },] : []),

        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
            icon: <LogoutOutlined />
        },
    ];

    const itemsMobiles = [...items, ...itemsDropdown];

    return (
        <>
            <div className={styles["header-section"]}>
                <div className={styles["container"]}>
                    {!isMobile ?
                        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
                            <div className={styles['brand']} onClick={() => navigate('/')} title='Trang Chủ'>
                                <div className={styles['logo-container']}>
                                    <FaBriefcase className={styles['logo-icon']} />
                                    <span className={styles['logo-text']}>JobHunter</span>
                                </div>
                            </div>
                            <div className={styles['top-menu']}>
                                <ConfigProvider
                                    theme={{
                                        token: {
                                            colorPrimary: '#fff',
                                            colorBgContainer: 'transparent',
                                            colorText: 'rgba(255, 255, 255, 0.9)',
                                            colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
                                            colorBorder: 'transparent',
                                            colorSplit: 'transparent',
                                        },
                                        components: {
                                            Menu: {
                                                horizontalItemSelectedColor: '#fff',
                                                horizontalItemHoverColor: '#fff',
                                                horizontalItemSelectedBg: 'rgba(255, 255, 255, 0.15)',
                                                horizontalItemHoverBg: 'rgba(255, 255, 255, 0.1)',
                                                itemSelectedBg: 'rgba(255, 255, 255, 0.15)',
                                                itemHoverBg: 'rgba(255, 255, 255, 0.1)',
                                                itemSelectedColor: '#fff',
                                                itemHoverColor: '#fff',
                                                itemColor: 'rgba(255, 255, 255, 0.9)',
                                                iconSize: 16,
                                                fontSize: 15,
                                                itemHeight: 50,
                                                horizontalLineHeight: '50px',
                                            }
                                        }
                                    }}
                                >
                                    <Menu
                                        selectedKeys={[current]}
                                        mode="horizontal"
                                        items={items}
                                        className={styles['main-menu']}
                                    />
                                </ConfigProvider>
                                <div className={styles['extra']}>
                                    {isAuthenticated === false ?
                                        <div className={styles['auth-buttons']}>
                                            <Button type="text" onClick={() => navigate('/login')} className={styles['login-btn']}>
                                                Đăng Nhập
                                            </Button>
                                            <Button type="primary" onClick={() => navigate('/register')} className={styles['register-btn']}>
                                                Đăng Ký
                                            </Button>
                                        </div>
                                        :
                                        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                            <Space style={{ cursor: "pointer" }} className={styles['user-dropdown']}>
                                                <span className={styles['welcome-text']}>Xin chào, {user?.name}</span>
                                                <Avatar className={styles['user-avatar']}> 
                                                    {user?.name?.substring(0, 2)?.toUpperCase()} 
                                                </Avatar>
                                            </Space>
                                        </Dropdown>
                                    }

                                </div>

                            </div>
                        </div>
                        :
                        <div className={styles['header-mobile']}>
                            <div className={styles['mobile-logo']}>
                                <FaBriefcase className={styles['mobile-logo-icon']} />
                                <span className={styles['mobile-logo-text']}>JobHunter</span>
                            </div>
                            <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
                        </div>
                    }
                </div>
            </div>
            <Drawer title="Chức năng"
                placement="right"
                onClose={() => setOpenMobileMenu(false)}
                open={openMobileMenu}
            >
                <Menu
                    onClick={onClick}
                    selectedKeys={[current]}
                    mode="vertical"
                    items={itemsMobiles}
                />
            </Drawer>
            <ManageAccount
                open={openMangeAccount}
                onClose={setOpenManageAccount}
            />
        </>
    )
};

export default Header;