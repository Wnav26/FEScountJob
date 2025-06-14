import { Card, Col, Row, Statistic, Progress, Alert, Typography, Table, Divider, Tag, Badge, Avatar, List, Tooltip } from "antd";
import CountUp from 'react-countup';
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { 
    UserOutlined, 
    FileOutlined, 
    BankOutlined, 
    CheckCircleOutlined, 
    ClockCircleOutlined, 
    CloseCircleOutlined,
    RiseOutlined,
    FallOutlined,
    TeamOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    FireOutlined,
    TrophyOutlined,
    StarOutlined
} from '@ant-design/icons';
import { callFetchUser } from "@/config/api";
import { callFetchJob } from "@/config/api";
import { callFetchCompany } from "@/config/api";
import { callFetchResume } from "@/config/api";

const { Title, Paragraph, Text } = Typography;

interface DashboardData {
    totalUsers: number;
    totalJobs: number;
    totalCompanies: number;
    totalResumes: number;
    pendingResumes: number;
    approvedResumes: number;
    rejectedResumes: number;
    recentJobs: any[];
    activeJobs: number;
    inactiveJobs: number;
    topCompanies: any[];
    jobsByLocation: any[];
    jobsByLevel: any[];
    recentResumes: any[];
    monthlyStats: {
        users: number;
        jobs: number;
        resumes: number;
        companies: number;
    };
}

const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        totalUsers: 0,
        totalJobs: 0,
        totalCompanies: 0,
        totalResumes: 0,
        pendingResumes: 0,
        approvedResumes: 0,
        rejectedResumes: 0,
        recentJobs: [],
        activeJobs: 0,
        inactiveJobs: 0,
        topCompanies: [],
        jobsByLocation: [],
        jobsByLevel: [],
        recentResumes: [],
        monthlyStats: {
            users: 0,
            jobs: 0,
            resumes: 0,
            companies: 0
        }
    });

    const user = useAppSelector(state => state.account.user);
    const isSuperAdmin = user?.role?.name === "SUPER_ADMIN";

    const formatter = (value: number | string) => {
        return (
            <CountUp end={Number(value)} separator="," />
        );
    };

    useEffect(() => {
        if (isSuperAdmin) {
            fetchDashboardData();
        }
    }, [isSuperAdmin]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch users
            const usersResponse = await callFetchUser("current=1&pageSize=1");
            const totalUsers = usersResponse?.data?.meta?.total || 0;

            // Fetch jobs
            const jobsResponse = await callFetchJob("current=1&pageSize=10");
            const totalJobs = jobsResponse?.data?.meta?.total || 0;
            const recentJobs = jobsResponse?.data?.result || [];
            
            // Count active/inactive jobs
            const activeJobs = recentJobs.filter(job => job.active).length;
            const inactiveJobs = recentJobs.filter(job => !job.active).length;

            // Fetch companies
            const companiesResponse = await callFetchCompany("current=1&pageSize=5");
            const totalCompanies = companiesResponse?.data?.meta?.total || 0;
            const topCompanies = companiesResponse?.data?.result || [];

            // Fetch resumes
            const resumesResponse = await callFetchResume("current=1&pageSize=100");
            const resumes = resumesResponse?.data?.result || [];
            const totalResumes = resumesResponse?.data?.meta?.total || 0;
            const recentResumes = resumes.slice(0, 5);

            // Count resumes by status
            const pendingResumes = resumes.filter(resume => resume.status === "PENDING").length;
            const approvedResumes = resumes.filter(resume => resume.status === "APPROVED").length;
            const rejectedResumes = resumes.filter(resume => resume.status === "REJECTED").length;

            // Generate location data (simulated)
            const locations = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
            const jobsByLocation = locations.map(location => ({
                location,
                count: Math.floor(Math.random() * 50) + 10
            })).sort((a, b) => b.count - a.count);

            // Generate level data (simulated)
            const levels = ["Intern", "Fresher", "Junior", "Middle", "Senior", "Leader"];
            const jobsByLevel = levels.map(level => ({
                level,
                count: Math.floor(Math.random() * 40) + 5
            })).sort((a, b) => b.count - a.count);

            // Generate monthly stats (simulated growth)
            const monthlyStats = {
                users: Math.floor(Math.random() * 50) + 10,
                jobs: Math.floor(Math.random() * 30) + 5,
                resumes: Math.floor(Math.random() * 40) + 15,
                companies: Math.floor(Math.random() * 10) + 2
            };

            setDashboardData({
                totalUsers,
                totalJobs,
                totalCompanies,
                totalResumes,
                pendingResumes,
                approvedResumes,
                rejectedResumes,
                recentJobs,
                activeJobs,
                inactiveJobs,
                topCompanies,
                jobsByLocation,
                jobsByLevel,
                recentResumes,
                monthlyStats
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'PENDING': return '#faad14';
            case 'APPROVED': return '#52c41a';
            case 'REJECTED': return '#f5222d';
            default: return '#1890ff';
        }
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'PENDING': return <ClockCircleOutlined />;
            case 'APPROVED': return <CheckCircleOutlined />;
            case 'REJECTED': return <CloseCircleOutlined />;
            default: return null;
        }
    };

    const getLevelColor = (level: string) => {
        switch(level) {
            case 'Intern': return '#13c2c2';
            case 'Fresher': return '#52c41a';
            case 'Junior': return '#1890ff';
            case 'Middle': return '#722ed1';
            case 'Senior': return '#eb2f96';
            case 'Leader': return '#fa8c16';
            default: return '#1890ff';
        }
    };

    const jobColumns = [
        {
            title: 'Job Title',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Company',
            dataIndex: ['company', 'name'],
            key: 'company',
            render: (text: string, record: any) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {record.company?.logo ? (
                        <Avatar src={record.company.logo} size="small" style={{ marginRight: 8 }} />
                    ) : (
                        <Avatar icon={<BankOutlined />} size="small" style={{ marginRight: 8 }} />
                    )}
                    {text}
                </div>
            )
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            render: (text: string) => (
                <span>
                    <EnvironmentOutlined style={{ marginRight: 5, color: '#ff4d4f' }} />
                    {text}
                </span>
            )
        },
        {
            title: 'Salary',
            dataIndex: 'salary',
            key: 'salary',
            render: (salary: number) => (
                <span>
                    <DollarOutlined style={{ color: '#52c41a', marginRight: 5 }} />
                    {salary?.toLocaleString()} VND
                </span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            render: (active: boolean) => (
                active ? 
                <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag> : 
                <Tag color="error" icon={<CloseCircleOutlined />}>Inactive</Tag>
            ),
        },
    ];

    if (!isSuperAdmin) {
        return (
            <div style={{ padding: '30px 20px' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '30px', color: '#1890ff' }}>
                    <TrophyOutlined style={{ marginRight: '10px', color: '#52c41a' }} />
                    Chào mừng đến với JobHunter
                </Title>
                
                {/* Banner chính */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    borderRadius: '12px',
                    padding: '30px',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '30px',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)'
                }}>
                    <Title level={3} style={{ color: 'white', margin: 0 }}>
                        Cảm ơn bạn đã sử dụng JobHunter
                    </Title>
                    <Paragraph style={{ fontSize: '16px', color: 'white', marginTop: '15px' }}>
                        Chúng tôi rất vui khi bạn đã lựa chọn JobHunter làm nền tảng tuyển dụng và tìm kiếm việc làm.
                        Hệ thống của chúng tôi được thiết kế để mang lại trải nghiệm tốt nhất cho cả nhà tuyển dụng và người tìm việc.
                    </Paragraph>
                </div>
                
                {/* Tính năng nổi bật */}
                <Title level={4} style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <StarOutlined style={{ color: '#faad14', marginRight: '8px' }} />
                    Tính năng nổi bật
                </Title>
                
                <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
                    <Col span={8}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                borderRadius: '8px',
                                height: '100%',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                                background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <Avatar size={64} style={{ backgroundColor: '#1890ff' }}>
                                    <SearchOutlined style={{ fontSize: '32px' }} />
                                </Avatar>
                            </div>
                            <Statistic 
                                title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Tìm kiếm việc làm</span>} 
                                value="Dễ dàng" 
                                valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                            />
                            <Paragraph style={{ marginTop: '10px' }}>
                                Tìm kiếm công việc phù hợp với kỹ năng và mong muốn của bạn một cách nhanh chóng và hiệu quả.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                borderRadius: '8px',
                                height: '100%',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                                background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <Avatar size={64} style={{ backgroundColor: '#52c41a' }}>
                                    <FileOutlined style={{ fontSize: '32px' }} />
                                </Avatar>
                            </div>
                            <Statistic 
                                title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Quản lý hồ sơ</span>} 
                                value="Hiệu quả" 
                                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                            />
                            <Paragraph style={{ marginTop: '10px' }}>
                                Quản lý hồ sơ cá nhân và theo dõi trạng thái ứng tuyển của bạn một cách chuyên nghiệp.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                borderRadius: '8px',
                                height: '100%',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                                background: 'linear-gradient(135deg, #fff2e8 0%, #ffd8bf 100%)'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <Avatar size={64} style={{ backgroundColor: '#fa8c16' }}>
                                    <BankOutlined style={{ fontSize: '32px' }} />
                                </Avatar>
                            </div>
                            <Statistic 
                                title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Kết nối doanh nghiệp</span>} 
                                value="Nhanh chóng" 
                                valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
                            />
                            <Paragraph style={{ marginTop: '10px' }}>
                                Kết nối với các doanh nghiệp hàng đầu và nhận được cơ hội việc làm phù hợp nhất.
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>
                
                {/* Thống kê */}
                <Title level={4} style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <RiseOutlined style={{ color: '#722ed1', marginRight: '8px' }} />
                    Thống kê ấn tượng
                </Title>
                
                <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
                    <Col span={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                textAlign: 'center',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                            }}
                        >
                            <Statistic
                                title="Nhà tuyển dụng"
                                value={500}
                                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                textAlign: 'center',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                            }}
                        >
                            <Statistic
                                title="Ứng viên"
                                value={10000}
                                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: '#52c41a' }}
                                formatter={value => `${value.toLocaleString()}+`}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                textAlign: 'center',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                            }}
                        >
                            <Statistic
                                title="Việc làm"
                                value={2000}
                                prefix={<FileOutlined style={{ color: '#fa8c16' }} />}
                                valueStyle={{ color: '#fa8c16' }}
                                formatter={value => `${value.toLocaleString()}+`}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                textAlign: 'center',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                            }}
                        >
                            <Statistic
                                title="Tỷ lệ thành công"
                                value={85}
                                suffix="%"
                                prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>
                
                {/* Lĩnh vực nổi bật */}
                <Title level={4} style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <FireOutlined style={{ color: '#f5222d', marginRight: '8px' }} />
                    Lĩnh vực nổi bật
                </Title>
                
                <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
                    <Col span={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                textAlign: 'center',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                                background: '#e6f7ff'
                            }}
                        >
                            <Avatar size={50} style={{ backgroundColor: '#1890ff', marginBottom: '10px' }}>IT</Avatar>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Công nghệ thông tin</div>
                            <Tag color="blue" style={{ marginTop: '10px' }}>450+ việc làm</Tag>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                textAlign: 'center',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                                background: '#f6ffed'
                            }}
                        >
                            <Avatar size={50} style={{ backgroundColor: '#52c41a', marginBottom: '10px' }}>MKT</Avatar>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Marketing</div>
                            <Tag color="green" style={{ marginTop: '10px' }}>320+ việc làm</Tag>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                textAlign: 'center',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                                background: '#fff2e8'
                            }}
                        >
                            <Avatar size={50} style={{ backgroundColor: '#fa8c16', marginBottom: '10px' }}>FIN</Avatar>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Tài chính</div>
                            <Tag color="orange" style={{ marginTop: '10px' }}>280+ việc làm</Tag>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                textAlign: 'center',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                                background: '#f9f0ff'
                            }}
                        >
                            <Avatar size={50} style={{ backgroundColor: '#722ed1', marginBottom: '10px' }}>HR</Avatar>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Nhân sự</div>
                            <Tag color="purple" style={{ marginTop: '10px' }}>210+ việc làm</Tag>
                        </Card>
                    </Col>
                </Row>
                
                {/* Hỗ trợ */}
                <Card 
                    bordered={false} 
                    style={{ 
                        borderRadius: '12px',
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                        background: 'linear-gradient(135deg, #f0f5ff 0%, #d6e4ff 100%)',
                        marginBottom: '30px'
                    }}
                >
                    <Row align="middle" gutter={24}>
                        <Col span={16}>
                            <Title level={4} style={{ marginTop: 0 }}>Cần hỗ trợ?</Title>
                            <Paragraph>
                                Nếu bạn cần hỗ trợ hoặc có bất kỳ câu hỏi nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
                                Chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.
                            </Paragraph>
                            <div>
                                <Tag icon={<MailOutlined />} color="blue">support@jobhunter.com</Tag>
                                <Tag icon={<PhoneOutlined />} color="green" style={{ marginLeft: '8px' }}>1900 1234</Tag>
                            </div>
                        </Col>
                        <Col span={8} style={{ textAlign: 'center' }}>
                            <Avatar size={100} icon={<CustomerServiceOutlined />} style={{ backgroundColor: '#1890ff' }} />
                        </Col>
                    </Row>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                    <CalendarOutlined /> {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Tag>
            </div>
            
            {/* Monthly Growth Stats */}
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <Card 
                        title={<span><RiseOutlined style={{ color: '#52c41a' }} /> Tăng trưởng trong tháng</span>} 
                        bordered={false} 
                        loading={loading}
                        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={6}>
                                <Card bordered={false} style={{ backgroundColor: '#e6f7ff', borderRadius: '8px' }}>
                                    <Statistic
                                        title="Người dùng mới"
                                        value="12%"
                                        valueStyle={{ color: '#1890ff' }}
                                        prefix={<TeamOutlined />}
                                        suffix={<RiseOutlined style={{ fontSize: '16px' }} />}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card bordered={false} style={{ backgroundColor: '#f6ffed', borderRadius: '8px' }}>
                                    <Statistic
                                        title="Công việc mới"
                                        value="8%"
                                        valueStyle={{ color: '#52c41a' }}
                                        prefix={<FileOutlined />}
                                        suffix={<RiseOutlined style={{ fontSize: '16px' }} />}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card bordered={false} style={{ backgroundColor: '#fff2e8', borderRadius: '8px' }}>
                                    <Statistic
                                        title="Hồ sơ mới"
                                        value="15%"
                                        valueStyle={{ color: '#fa8c16' }}
                                        prefix={<FileOutlined />}
                                        suffix={<RiseOutlined style={{ fontSize: '16px' }} />}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card bordered={false} style={{ backgroundColor: '#f9f0ff', borderRadius: '8px' }}>
                                    <Statistic
                                        title="Công ty mới"
                                        value="5%"
                                        valueStyle={{ color: '#722ed1' }}
                                        prefix={<BankOutlined />}
                                        suffix={<RiseOutlined style={{ fontSize: '16px' }} />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
            
            {/* Stats Cards */}
            <Row gutter={[20, 20]} style={{ marginTop: '20px' }}>
                <Col span={24} md={6}>
                    <Card 
                        bordered={false} 
                        loading={loading}
                        style={{ 
                            borderRadius: '8px', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            color: 'white'
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'white' }}>Tổng người dùng</span>}
                            value={dashboardData.totalUsers}
                            formatter={formatter}
                            valueStyle={{ color: 'white' }}
                            prefix={<UserOutlined style={{ color: 'white' }} />}
                        />
                    </Card>
                </Col>
                <Col span={24} md={6}>
                    <Card 
                        bordered={false} 
                        loading={loading}
                        style={{ 
                            borderRadius: '8px', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                            color: 'white'
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'white' }}>Tổng công việc</span>}
                            value={dashboardData.totalJobs}
                            formatter={formatter}
                            valueStyle={{ color: 'white' }}
                            prefix={<FileOutlined style={{ color: 'white' }} />}
                        />
                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                            <Tag color="green" style={{ margin: 0 }}>
                                <CheckCircleOutlined /> {dashboardData.activeJobs} Active
                            </Tag>
                            <Tag color="red" style={{ margin: 0 }}>
                                <CloseCircleOutlined /> {dashboardData.inactiveJobs} Inactive
                            </Tag>
                        </div>
                    </Card>
                </Col>
                <Col span={24} md={6}>
                    <Card 
                        bordered={false} 
                        loading={loading}
                        style={{ 
                            borderRadius: '8px', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                            background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                            color: 'white'
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'white' }}>Tổng công ty</span>}
                            value={dashboardData.totalCompanies}
                            formatter={formatter}
                            valueStyle={{ color: 'white' }}
                            prefix={<BankOutlined style={{ color: 'white' }} />}
                        />
                    </Card>
                </Col>
                <Col span={24} md={6}>
                    <Card 
                        bordered={false} 
                        loading={loading}
                        style={{ 
                            borderRadius: '8px', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                            background: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
                            color: 'white'
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'white' }}>Tổng hồ sơ</span>}
                            value={dashboardData.totalResumes}
                            formatter={formatter}
                            valueStyle={{ color: 'white' }}
                            prefix={<FileOutlined style={{ color: 'white' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Resume Status and Location Stats */}
            <Row gutter={[20, 20]} style={{ marginTop: '20px' }}>
                <Col span={24} md={12}>
                    <Card 
                        title={<span><FileOutlined style={{ color: '#1890ff' }} /> Trạng thái hồ sơ</span>} 
                        bordered={false}
                        loading={loading}
                        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Card bordered={false} style={{ backgroundColor: '#fffbe6', borderRadius: '8px' }}>
                                    <Statistic
                                        title="Đang chờ"
                                        value={dashboardData.pendingResumes}
                                        valueStyle={{ color: '#faad14' }}
                                        prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                                    />
                                    <Progress 
                                        percent={dashboardData.totalResumes ? Math.round((dashboardData.pendingResumes / dashboardData.totalResumes) * 100) : 0} 
                                        strokeColor="#faad14" 
                                        showInfo={false}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card bordered={false} style={{ backgroundColor: '#f6ffed', borderRadius: '8px' }}>
                                    <Statistic
                                        title="Đã duyệt"
                                        value={dashboardData.approvedResumes}
                                        valueStyle={{ color: '#52c41a' }}
                                        prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                    />
                                    <Progress 
                                        percent={dashboardData.totalResumes ? Math.round((dashboardData.approvedResumes / dashboardData.totalResumes) * 100) : 0} 
                                        strokeColor="#52c41a" 
                                        showInfo={false}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card bordered={false} style={{ backgroundColor: '#fff1f0', borderRadius: '8px' }}>
                                    <Statistic
                                        title="Từ chối"
                                        value={dashboardData.rejectedResumes}
                                        valueStyle={{ color: '#f5222d' }}
                                        prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
                                    />
                                    <Progress 
                                        percent={dashboardData.totalResumes ? Math.round((dashboardData.rejectedResumes / dashboardData.totalResumes) * 100) : 0} 
                                        strokeColor="#f5222d" 
                                        showInfo={false}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col span={24} md={12}>
                    <Card 
                        title={<span><EnvironmentOutlined style={{ color: '#ff4d4f' }} /> Công việc theo địa điểm</span>} 
                        bordered={false}
                        loading={loading}
                        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
                    >
                        <List
                            dataSource={dashboardData.jobsByLocation}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar style={{ backgroundColor: '#ff4d4f' }}><EnvironmentOutlined /></Avatar>}
                                        title={item.location}
                                    />
                                    <div>
                                        <Progress 
                                            percent={Math.round((item.count / dashboardData.jobsByLocation.reduce((acc, curr) => acc + curr.count, 0)) * 100)} 
                                            strokeColor="#ff4d4f" 
                                            format={percent => `${percent}%`}
                                            style={{ width: 120 }}
                                        />
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Job Levels and Top Companies */}
            <Row gutter={[20, 20]} style={{ marginTop: '20px' }}>
                <Col span={24} md={12}>
                    <Card 
                        title={<span><StarOutlined style={{ color: '#722ed1' }} /> Công việc theo cấp độ</span>} 
                        bordered={false}
                        loading={loading}
                        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
                    >
                        {dashboardData.jobsByLevel.map(item => (
                            <div key={item.level} style={{ marginBottom: 15 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <Text strong>{item.level}</Text>
                                    <Text>{Math.round((item.count / dashboardData.jobsByLevel.reduce((acc, curr) => acc + curr.count, 0)) * 100)}%</Text>
                                </div>
                                <Progress 
                                    percent={100} 
                                    strokeColor={getLevelColor(item.level)}
                                    showInfo={false}
                                    strokeWidth={12}
                                    trailColor="#f0f0f0"
                                    style={{ width: `${Math.max(30, Math.round((item.count / dashboardData.jobsByLevel.reduce((acc, curr) => acc + curr.count, 0)) * 100))}%` }}
                                />
                            </div>
                        ))}
                    </Card>
                </Col>
                <Col span={24} md={12}>
                    <Card 
                        title={<span><FireOutlined style={{ color: '#fa8c16' }} /> Công ty hàng đầu</span>} 
                        bordered={false}
                        loading={loading}
                        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={dashboardData.topCompanies}
                            renderItem={(company, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            company.logo ? 
                                            <Avatar src={company.logo} size="large" /> : 
                                            <Avatar icon={<BankOutlined />} size="large" style={{ backgroundColor: ['#1890ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96'][index % 5] }} />
                                        }
                                        title={<Text strong>{company.name}</Text>}
                                        description={company.address}
                                    />
                                    <div>
                                        <Tag color="orange" icon={<FireOutlined />}>Top {index + 1}</Tag>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Recent Jobs */}
            <Row gutter={[20, 20]} style={{ marginTop: '20px' }}>
                <Col span={24}>
                    <Card 
                        title={<span><FileOutlined style={{ color: '#52c41a' }} /> Công việc gần đây</span>} 
                        bordered={false} 
                        loading={loading}
                        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
                    >
                        <Table 
                            dataSource={dashboardData.recentJobs} 
                            columns={jobColumns} 
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            style={{ overflowX: 'auto' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Recent Resumes */}
            <Row gutter={[20, 20]} style={{ marginTop: '20px' }}>
                <Col span={24}>
                    <Card 
                        title={<span><FileOutlined style={{ color: '#1890ff' }} /> Hồ sơ gần đây</span>} 
                        bordered={false} 
                        loading={loading}
                        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={dashboardData.recentResumes}
                            renderItem={(resume) => (
                                <List.Item
                                    actions={[
                                        <Tag 
                                            color={getStatusColor(resume.status)} 
                                            icon={getStatusIcon(resume.status)}
                                        >
                                            {resume.status}
                                        </Tag>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                                        title={<Text strong>{resume.email}</Text>}
                                        description={
                                            <div>
                                                <Text type="secondary">
                                                    <CalendarOutlined style={{ marginRight: 5 }} />
                                                    {new Date(resume.createdAt).toLocaleDateString('vi-VN')}
                                                </Text>
                                                {resume.jobId && typeof resume.jobId === 'object' && (
                                                    <Tag color="blue" style={{ marginLeft: 10 }}>
                                                        {resume.jobId.name}
                                                    </Tag>
                                                )}
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// Thêm các icon cần thiết vào import
import { 
    SearchOutlined,
    MailOutlined,
    PhoneOutlined,
    CustomerServiceOutlined
} from '@ant-design/icons';

export default DashboardPage;