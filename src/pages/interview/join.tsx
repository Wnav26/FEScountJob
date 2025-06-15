import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Form, Input, Alert, Space, Spin, Result } from 'antd';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { VideoCameraOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import JitsiMeetComponent from '@/components/admin/interview/JitsiMeetComponent';

const { Title, Text } = Typography;

interface Interview {
  id: string;
  resumeId: string;
  resumeEmail: string;
  jobName: string;
  scheduledTime: Date;
  duration: number;
  meetingId: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: Date;
}

const JoinInterviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  // Lấy thông tin từ URL query params
  const queryParams = new URLSearchParams(location.search);
  const meetingId = queryParams.get('meetingId');
  const email = queryParams.get('email');
  const jobName = queryParams.get('job');
  const scheduledTime = queryParams.get('time');
  const duration = queryParams.get('duration');

  useEffect(() => {
    // Nếu có đầy đủ thông tin từ query params, sử dụng thông tin đó
    if (meetingId && email && scheduledTime && duration) {
      const interviewFromParams: Interview = {
        id: id || 'direct',
        resumeId: 'direct',
        resumeEmail: email,
        jobName: jobName || 'Interview',
        scheduledTime: new Date(scheduledTime),
        duration: parseInt(duration),
        meetingId: meetingId,
        status: 'SCHEDULED', // Now TypeScript knows this is the specific union type
        createdAt: new Date()
      };
      setInterview(interviewFromParams);
      setLoading(false);
      return;
    }

    // Nếu không có thông tin từ query params, tìm kiếm trong localStorage
    if (!id) {
      setError('Mã phòng phỏng vấn không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      const interviews = JSON.parse(localStorage.getItem('interviews') || '[]');
      const foundInterview = interviews.find((item: Interview) => item.id === id);
      
      if (!foundInterview) {
        setError('Không tìm thấy phòng phỏng vấn');
      } else if (foundInterview.status !== 'SCHEDULED') {
        setError(`Phòng phỏng vấn đã ${foundInterview.status === 'COMPLETED' ? 'kết thúc' : 'bị hủy'}`);
      } else {
        setInterview(foundInterview);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tìm kiếm phòng phỏng vấn');
      console.error('Error fetching interview:', err);
    }
    
    setLoading(false);
  }, [id, meetingId, email, scheduledTime, duration, jobName]);

  const isInterviewActive = (interview: Interview) => {
    if (!interview.scheduledTime) return false;
    
    const now = dayjs();
    const scheduledTime = dayjs(interview.scheduledTime);
    const endTime = scheduledTime.add(interview.duration || 30, 'minute');
    
    // Phỏng vấn đang diễn ra nếu thời gian hiện tại nằm trong khoảng từ 
    // 15 phút trước giờ phỏng vấn đến thời điểm kết thúc
    return now.isAfter(scheduledTime.subtract(15, 'minute')) && now.isBefore(endTime);
  };

  const handleJoin = (values: { name: string }) => {
    setDisplayName(values.name);
    setIsJoining(true);
    setIsJoined(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải thông tin phòng phỏng vấn..." />
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Không thể tham gia phòng phỏng vấn"
        subTitle={error}
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        ]}
      />
    );
  }

  if (!interview) {
    return (
      <Result
        status="404"
        title="Không tìm thấy phòng phỏng vấn"
        subTitle="Phòng phỏng vấn không tồn tại hoặc đã bị xóa"
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        ]}
      />
    );
  }

  const isActive = isInterviewActive(interview);

  if (!isActive) {
    return (
      <Result
        status="info"
        title="Phòng phỏng vấn chưa sẵn sàng"
        subTitle={`Phòng phỏng vấn sẽ mở 15 phút trước thời gian đã hẹn: ${dayjs(interview.scheduledTime).format('DD/MM/YYYY HH:mm')}`}
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
          <Button key="refresh" onClick={() => window.location.reload()}>
            Làm mới
          </Button>
        ]}
      />
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card
        title={
          <Title level={3}>
            <VideoCameraOutlined style={{ marginRight: 12 }} />
            Tham gia phỏng vấn trực tuyến
          </Title>
        }
      >
        {!isJoined ? (
          <div>
            <Card style={{ marginBottom: 20 }}>
              <Space direction="vertical" size="middle">
                <Space>
                  <UserOutlined />
                  <Text strong>Ứng viên:</Text> {interview.resumeEmail}
                </Space>
                <Space>
                  <Text strong>Vị trí ứng tuyển:</Text> {interview.jobName}
                </Space>
                <Space>
                  <CalendarOutlined />
                  <Text strong>Thời gian:</Text> {dayjs(interview.scheduledTime).format('DD/MM/YYYY HH:mm')}
                </Space>
                <Space>
                  <ClockCircleOutlined />
                  <Text strong>Thời lượng:</Text> {interview.duration} phút
                </Space>
              </Space>
            </Card>

            <Alert
              message="Lưu ý trước khi tham gia phỏng vấn"
              description={
                <ul>
                  <li>Đảm bảo bạn đang ở nơi yên tĩnh, không bị làm phiền</li>
                  <li>Kiểm tra camera và microphone hoạt động tốt</li>
                  <li>Chuẩn bị sẵn CV và các tài liệu cần thiết</li>
                  <li>Trang phục lịch sự, phù hợp với buổi phỏng vấn</li>
                </ul>
              }
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />

            <Form onFinish={handleJoin} layout="vertical">
              <Form.Item
                name="name"
                label="Tên của bạn"
                rules={[{ required: true, message: 'Vui lòng nhập tên của bạn' }]}
              >
                <Input placeholder="Nhập tên đầy đủ của bạn" prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" icon={<VideoCameraOutlined />}>
                  Tham gia phỏng vấn ngay
                </Button>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <div>
            <Alert
              message="Bạn đã tham gia phòng phỏng vấn"
              description="Vui lòng cho phép trình duyệt truy cập camera và microphone của bạn. Bạn có thể tắt/bật camera và microphone sau khi tham gia."
              type="success"
              showIcon
              style={{ marginBottom: 20 }}
            />
            
            <JitsiMeetComponent
              roomName={interview.meetingId}
              displayName={displayName}
              onClose={() => navigate('/')}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default JoinInterviewPage;