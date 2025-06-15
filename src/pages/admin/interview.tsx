import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Modal, message, notification, Tooltip, Space, Card, Input, DatePicker, Typography, Badge, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, VideoCameraOutlined, SearchOutlined, CalendarOutlined, ClockCircleOutlined, UserOutlined, MailOutlined, ShareAltOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import JitsiMeetComponent from '@/components/admin/interview/JitsiMeetComponent';
import { useAppSelector } from '@/redux/hooks';

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

const InterviewPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [isJitsiModalOpen, setIsJitsiModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [emailSearch, setEmailSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<dayjs.Dayjs | null>(null);
  
  const userInfo = useAppSelector(state => state.account.user);
  
  useEffect(() => {
    fetchInterviews();
  }, []);
  
  const fetchInterviews = () => {
    setLoading(true);
    try {
      // Lấy dữ liệu từ localStorage
      const storedInterviews = JSON.parse(localStorage.getItem('interviews') || '[]');
      setInterviews(storedInterviews);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách phỏng vấn'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteInterview = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa lịch phỏng vấn',
      content: 'Bạn có chắc chắn muốn xóa lịch phỏng vấn này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        try {
          const updatedInterviews = interviews.filter(interview => interview.id !== id);
          localStorage.setItem('interviews', JSON.stringify(updatedInterviews));
          setInterviews(updatedInterviews);
          message.success('Xóa lịch phỏng vấn thành công');
        } catch (error) {
          console.error('Error deleting interview:', error);
          notification.error({
            message: 'Lỗi',
            description: 'Không thể xóa lịch phỏng vấn'
          });
        }
      }
    });
  };
  
  const handleJoinInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsJitsiModalOpen(true);
  };
  
  const getInterviewLink = (interview: Interview) => {
    // Tạo link với query params để có thể truy cập từ bất kỳ trình duyệt nào
    const baseUrl = `${window.location.origin}/interview/join/${interview.id}`;
    const params = new URLSearchParams();
    params.append('meetingId', interview.meetingId);
    params.append('email', interview.resumeEmail);
    params.append('job', interview.jobName);
    params.append('time', new Date(interview.scheduledTime).toISOString());
    params.append('duration', interview.duration.toString());
    
    return `${baseUrl}?${params.toString()}`;
  };
  
  const copyInterviewLink = (interview: Interview) => {
    const link = getInterviewLink(interview);
    navigator.clipboard.writeText(link).then(
      () => {
        message.success('Link phỏng vấn đã được sao chép vào clipboard');
      },
      () => {
        message.error('Không thể sao chép link. Vui lòng thử lại.');
      }
    );
  };
  
  const handleUpdateStatus = (id: string, status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      const updatedInterviews = interviews.map(interview => 
        interview.id === id ? { ...interview, status } : interview
      );
      localStorage.setItem('interviews', JSON.stringify(updatedInterviews));
      setInterviews(updatedInterviews);
      message.success(`Cập nhật trạng thái thành công`);
    } catch (error) {
      console.error('Error updating interview status:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể cập nhật trạng thái phỏng vấn'
      });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'blue';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };
  
  const isInterviewActive = (interview: Interview) => {
    if (!interview.scheduledTime) return false;
    
    const now = dayjs();
    const scheduledTime = dayjs(interview.scheduledTime);
    const endTime = scheduledTime.add(interview.duration || 30, 'minute');
    
    // Phỏng vấn đang diễn ra nếu thời gian hiện tại nằm trong khoảng từ 
    // 15 phút trước giờ phỏng vấn đến thời điểm kết thúc
    return now.isAfter(scheduledTime.subtract(15, 'minute')) && now.isBefore(endTime);
  };
  
  const filteredInterviews = interviews.filter(interview => {
    const matchesEmail = emailSearch
      ? interview.resumeEmail.toLowerCase().includes(emailSearch.toLowerCase())
      : true;
      
    const matchesJob = jobSearch
      ? interview.jobName.toLowerCase().includes(jobSearch.toLowerCase())
      : true;
      
    const matchesDate = dateFilter
      ? dayjs(interview.scheduledTime).format('YYYY-MM-DD') === dateFilter.format('YYYY-MM-DD')
      : true;
      
    return matchesEmail && matchesJob && matchesDate;
  });
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text: string) => <span>{text.substring(0, 8)}...</span>,
    },
    {
      title: 'Candidate',
      dataIndex: 'resumeEmail',
      key: 'resumeEmail',
    },
    {
      title: 'Job',
      dataIndex: 'jobName',
      key: 'jobName',
    },
    {
      title: 'Interview Time',
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
      render: (scheduledTime: Date) => dayjs(scheduledTime).format('DD/MM/YYYY HH:mm'),
      sorter: (a: Interview, b: Interview) => 
        dayjs(a.scheduledTime).valueOf() - dayjs(b.scheduledTime).valueOf(),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration} minutes`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Interview) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Scheduled', value: 'SCHEDULED' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Cancelled', value: 'CANCELLED' },
      ],
      onFilter: (value: string | number | boolean, record: Interview) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Interview) => (
        <Space size="small">
          <Tooltip title={isInterviewActive(record) ? 'Join interview' : 'Not time for interview yet'}>
            <Button
              type="primary"
              icon={<VideoCameraOutlined />}
              onClick={() => handleJoinInterview(record)}
              disabled={!isInterviewActive(record) || record.status !== 'SCHEDULED'}
            >
              Join
            </Button>
          </Tooltip>
          
          <Tooltip title="Copy interview link to share">
            <Button
              icon={<ShareAltOutlined />}
              onClick={() => copyInterviewLink(record)}
            >
              Share
            </Button>
          </Tooltip>
          
          <Button
            onClick={() => handleUpdateStatus(record.id, 'COMPLETED')}
            disabled={record.status !== 'SCHEDULED'}
          >
            Complete
          </Button>
          
          <Button
            danger
            onClick={() => handleUpdateStatus(record.id, 'CANCELLED')}
            disabled={record.status !== 'SCHEDULED'}
          >
            Cancel
          </Button>
          
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteInterview(record.id)}
          />
        </Space>
      ),
    },
  ];
  
  const { Title } = Typography;

  return (
    <div>
      <Card 
        title={
          <Title level={4} style={{ margin: 0 }}>
            <VideoCameraOutlined style={{ marginRight: 8 }} />
            Online Interview Management
          </Title>
        } 
        style={{ marginBottom: 20 }}
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="Search by email"
            prefix={<SearchOutlined />}
            value={emailSearch}
            onChange={e => setEmailSearch(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Input
            placeholder="Search by job"
            prefix={<SearchOutlined />}
            value={jobSearch}
            onChange={e => setJobSearch(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <DatePicker
            placeholder="Filter by date"
            onChange={setDateFilter}
            format="DD/MM/YYYY"
            style={{ width: 200 }}
            allowClear
          />
          <Button 
            type="primary" 
            onClick={fetchInterviews}
          >
            Refresh
          </Button>
        </div>
        
        {filteredInterviews.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredInterviews}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            bordered
            rowClassName={(record) => {
              if (isInterviewActive(record) && record.status === 'SCHEDULED') {
                return 'active-interview-row';
              }
              return '';
            }}
          />
        ) : (
          <Empty 
            description={
              <span>
                No interviews scheduled yet. Please schedule interviews from the Resume management page.
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
      
      <style>
        {`
          .active-interview-row {
            background-color: #e6f7ff;
          }
        `}
      </style>
      
      <Modal
        title={
          <Space>
            <VideoCameraOutlined style={{ color: '#1890ff' }} />
            <span>Online Interview Room</span>
          </Space>
        }
        open={isJitsiModalOpen}
        onCancel={() => setIsJitsiModalOpen(false)}
        footer={null}
        width={1000}
        destroyOnClose
        centered
      >
        {selectedInterview && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Space direction="vertical" size="small">
                <Space>
                  <UserOutlined />
                  <strong>Candidate:</strong> {selectedInterview.resumeEmail}
                </Space>
                <Space>
                  <CalendarOutlined />
                  <strong>Time:</strong> {dayjs(selectedInterview.scheduledTime).format('DD/MM/YYYY HH:mm')}
                </Space>
                <Space>
                  <ClockCircleOutlined />
                  <strong>Duration:</strong> {selectedInterview.duration} minutes
                </Space>
                <Space>
                  <strong>Job:</strong> {selectedInterview.jobName}
                </Space>
                <Space style={{ marginTop: 8 }}>
                  <Input 
                    value={getInterviewLink(selectedInterview)} 
                    readOnly 
                    addonAfter={
                      <Tooltip title="Copy link">
                        <CopyOutlined 
                          onClick={() => copyInterviewLink(selectedInterview)} 
                          style={{ cursor: 'pointer' }}
                        />
                      </Tooltip>
                    }
                    style={{ width: '100%' }}
                  />
                </Space>
              </Space>
            </Card>
            
            <JitsiMeetComponent
              roomName={selectedInterview.meetingId}
              displayName={userInfo?.name || 'HR Manager'}
              onClose={() => setIsJitsiModalOpen(false)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InterviewPage;