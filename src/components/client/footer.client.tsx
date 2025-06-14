
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, LinkedinOutlined, GithubOutlined } from '@ant-design/icons';
import { Button, Row, Col, Divider } from 'antd';
import styles from '../../styles/footer.module.scss';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <div className={styles.footerSection}>
                            <h3>Về chúng tôi</h3>
                            <p>JobHunter là nền tảng kết nối nhà tuyển dụng và người tìm việc hàng đầu, giúp bạn tìm kiếm công việc mơ ước một cách dễ dàng và hiệu quả.</p>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <div className={styles.footerSection}>
                            <h3>Liên kết nhanh</h3>
                            <ul className={styles.footerLinks}>
                                <li><a href="#">Trang chủ</a></li>
                                <li><a href="#">Tìm việc làm</a></li>
                                <li><a href="#">Công ty</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Liên hệ</a></li>
                            </ul>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <div className={styles.footerSection}>
                            <h3>Liên hệ</h3>
                            <p>Email: contact@jobhunter.com</p>
                            <p>Điện thoại: +84 123 456 789</p>
                            <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <div className={styles.footerSection}>
                            <h3>Theo dõi chúng tôi</h3>
                            <div className={styles.socialIcons}>
                                <a href="#" className={styles.socialIcon}><FacebookOutlined /></a>
                                <a href="#" className={styles.socialIcon}><TwitterOutlined /></a>
                                <a href="#" className={styles.socialIcon}><InstagramOutlined /></a>
                                <a href="#" className={styles.socialIcon}><LinkedinOutlined /></a>
                                <a href="#" className={styles.socialIcon}><GithubOutlined /></a>
                            </div>
                            <div className={styles.fakeButtons}>
                                <Button type="primary" className={styles.fakeButton}>Đăng ký nhận tin</Button>
                                <Button className={styles.fakeButton}>Tải ứng dụng</Button>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Divider className={styles.footerDivider} />
                <div className={styles.footerBottom}>
                    <p>&copy; {new Date().getFullYear()} JobHunter. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;