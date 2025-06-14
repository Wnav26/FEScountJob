import { Divider, Row, Col, Card, Statistic, Button, Typography } from 'antd';
import { UserOutlined, BankOutlined, ThunderboltOutlined, RocketOutlined, ArrowRightOutlined, FireOutlined, CrownOutlined } from '@ant-design/icons';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';
import { useState } from 'react';
import ManageAccount from '@/components/client/modal/manage.account';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const HomePage = () => {
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleFindJobs = () => {
        navigate('/job');
    };

    const handleSubscribe = () => {
        setIsOpenModal(true);
    };

    return (
        <div className={`${styles["home-section"]}`}>
            {/* Hero Banner Section */}
            <div className={styles["hero-banner"]}>
                <div className={styles["container"]}>
                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} md={14}>
                            <div className={styles["hero-content"]}>
                                <h1>Tìm kiếm công việc IT mơ ước của bạn</h1>
                                <p>Khám phá hàng ngàn cơ hội việc làm hấp dẫn từ các công ty công nghệ hàng đầu</p>
                                <div className={styles["hero-buttons"]}>
                                    <Button 
                                        type="primary" 
                                        size="large" 
                                        icon={<ThunderboltOutlined />}
                                        onClick={handleFindJobs}
                                    >
                                        Tìm việc ngay
                                    </Button>
                                    <Button 
                                        size="large"
                                        onClick={handleSubscribe}
                                    >
                                        Đăng ký nhận thông báo
                                    </Button>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={10}>
                            <div className={styles["hero-image"]}>
                                <img src="/hero-image.svg" alt="Job Hunter" />
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
            
            {/* Modal đăng ký nhận thông báo */}
            <ManageAccount 
                open={isOpenModal} 
                onClose={() => setIsOpenModal(false)} 
            />

            {/* Search Section with Card Wrapper */}
            <div className={styles["container"]}>
                <div className={styles["search-section"]}>
                    <Card className={styles["search-card"]} bordered={false}>
                        <SearchClient />
                    </Card>
                </div>

                {/* Stats Section */}
                <div className={styles["stats-section"]}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={6}>
                            <Card className={styles["stat-card"]}>
                                <Statistic 
                                    title="Ứng viên" 
                                    value={5000} 
                                    prefix={<UserOutlined />} 
                                    suffix="+" 
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={6}>
                            <Card className={styles["stat-card"]}>
                                <Statistic 
                                    title="Công ty" 
                                    value={300} 
                                    prefix={<BankOutlined />} 
                                    suffix="+" 
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={6}>
                            <Card className={styles["stat-card"]}>
                                <Statistic 
                                    title="Việc làm" 
                                    value={1200} 
                                    prefix={<ThunderboltOutlined />} 
                                    suffix="+" 
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={6}>
                            <Card className={styles["stat-card"]}>
                                <Statistic 
                                    title="Tuyển dụng thành công" 
                                    value={850} 
                                    prefix={<RocketOutlined />} 
                                    suffix="+" 
                                />
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Featured Companies */}
                <div className={styles["featured-section"]}>
                    <CompanyCard />
                </div>

                {/* Newsletter Section */}
                <div className={styles["newsletter-section"]}>
                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} md={12}>
                            <div className={styles["newsletter-content"]}>
                                <h2>Đăng ký nhận thông báo việc làm mới</h2>
                                <p>Nhận thông báo về các cơ hội việc làm IT phù hợp với kỹ năng của bạn</p>
                                <div className={styles["newsletter-form"]}>
                                    <input 
                                        type="email" 
                                        placeholder="Nhập email của bạn..." 
                                        className={styles["newsletter-input"]}
                                    />
                                    <Button 
                                        type="primary" 
                                        size="large"
                                        className={styles["newsletter-button"]}
                                        onClick={handleSubscribe}
                                    >
                                        Đăng ký
                                    </Button>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div className={styles["newsletter-image"]}>
                                <img src="/newsletter-image.svg" alt="Newsletter" />
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Popular Skills Section */}
                <div className={styles["skills-section"]}>
                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <h2 className={styles["section-title"]}>Kỹ năng IT được tìm kiếm nhiều nhất</h2>
                        </Col>
                        <Col span={24}>
                            <div className={styles["skills-grid"]}>
                                {['React', 'Node.js', 'Java', 'Python', 'Angular', 'Vue.js', 'PHP', 'C#', 'JavaScript', 'TypeScript', 'Docker', 'AWS'].map((skill, index) => (
                                    <div key={index} className={styles["skill-tag"]}>
                                        <span>{skill}</span>
                                        <small>{Math.floor(Math.random() * 500) + 100} việc làm</small>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Why Choose Us Section */}
                <div className={styles["why-choose-section"]}>
                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <h2 className={styles["section-title"]}>Tại sao chọn Job Hunter?</h2>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className={styles["feature-card"]}>
                                <div className={styles["feature-icon"]}>
                                    <ThunderboltOutlined />
                                </div>
                                <h3>Cập nhật nhanh chóng</h3>
                                <p>Thông tin việc làm mới nhất được cập nhật hàng ngày từ các nhà tuyển dụng hàng đầu</p>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className={styles["feature-card"]}>
                                <div className={styles["feature-icon"]}>
                                    <UserOutlined />
                                </div>
                                <h3>Hồ sơ chuyên nghiệp</h3>
                                <p>Tạo hồ sơ nổi bật để thu hút sự chú ý của nhà tuyển dụng trong lĩnh vực IT</p>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className={styles["feature-card"]}>
                                <div className={styles["feature-icon"]}>
                                    <RocketOutlined />
                                </div>
                                <h3>Cơ hội phát triển</h3>
                                <p>Kết nối với các công ty công nghệ hàng đầu và mở ra cơ hội phát triển sự nghiệp</p>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Latest Jobs */}
                <div className={styles["jobs-section"]}>
                    <JobCard />
                </div>
            </div>
        </div>
    )
}

export default HomePage;