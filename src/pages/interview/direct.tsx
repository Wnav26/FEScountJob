import React, { useState } from 'react';
import { Card, Typography, Button, Form, Input, Space, Row, Col } from 'antd';
import { VideoCameraOutlined, UserOutlined } from '@ant-design/icons';
import JitsiMeetComponent from '@/components/admin/interview/JitsiMeetComponent';

const { Title, Text } = Typography;

const DirectInterviewPage = () => {
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = (values: { roomName: string; displayName: string }) => {
    setRoomName(values.roomName);
    setDisplayName(values.displayName);
    setIsJoined(true);
  };

  const handleLeave = () => {
    setIsJoined(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card
        title={
          <Title level={3}>
            <VideoCameraOutlined style={{ marginRight: 12 }} />
            Phòng họp trực tuyến
          </Title>
        }
      >
        {!isJoined ? (
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} md={12}>
              <Form onFinish={handleJoin} layout="vertical">
                <Form.Item
                  name="roomName"
                  label="Tên phòng họp"
                  rules={[{ required: true, message: 'Vui lòng nhập tên phòng họp' }]}
                >
                  <Input 
                    placeholder="Nhập tên phòng họp (ví dụ: interview-123)" 
                    prefix={<VideoCameraOutlined />} 
                  />
                </Form.Item>

                <Form.Item
                  name="displayName"
                  label="Tên của bạn"
                  rules={[{ required: true, message: 'Vui lòng nhập tên của bạn' }]}
                >
                  <Input 
                    placeholder="Nhập tên đầy đủ của bạn" 
                    prefix={<UserOutlined />} 
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    icon={<VideoCameraOutlined />}
                    block
                  >
                    Tham gia phòng họp
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        ) : (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Text strong>Phòng họp:</Text>
              <Text>{roomName}</Text>
              <Button onClick={handleLeave}>Rời phòng</Button>
            </Space>
            
            <JitsiMeetComponent
              roomName={roomName}
              displayName={displayName}
              onClose={handleLeave}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default DirectInterviewPage;