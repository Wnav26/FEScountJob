import React, { useState } from 'react';
import { Modal, Form, DatePicker, InputNumber, Button, message, notification, Input, Alert, Typography, Space, Divider } from 'antd';
import { CopyOutlined, MailOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// Hàm tạo ID ngẫu nhiên thay thế cho uuid
const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

interface ScheduleInterviewProps {
  open: boolean;
  onClose: () => void;
  resumeId: string;
  resumeEmail: string;
  jobName: string;
  onSuccess: (interviewData: any) => void;
}

const { Text, Paragraph } = Typography;

const ScheduleInterview: React.FC<ScheduleInterviewProps> = ({
  open,
  onClose,
  resumeId,
  resumeEmail,
  jobName,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createdInterview, setCreatedInterview] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Tạo dữ liệu phỏng vấn
      const interviewId = generateRandomId();
      const interviewData = {
        id: interviewId,
        resumeId: resumeId,
        resumeEmail: resumeEmail,
        jobName: jobName,
        scheduledTime: values.scheduledTime.toDate(),
        duration: values.duration,
        meetingId: `interview-${resumeId}-${Date.now()}`,
        status: 'SCHEDULED',
        notes: values.notes || '',
        createdAt: new Date(),
      };
      
      // Lưu vào localStorage
      const interviews = JSON.parse(localStorage.getItem('interviews') || '[]');
      interviews.push(interviewData);
      localStorage.setItem('interviews', JSON.stringify(interviews));
      
      // Hiển thị thông tin thành công và link tham gia
      setCreatedInterview(interviewData);
      setShowSuccess(true);
      
      // Thông báo thành công
      message.success('Đã lên lịch phỏng vấn thành công!');
      
      // Gọi callback onSuccess
      onSuccess(interviewData);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setCreatedInterview(null);
    setShowSuccess(false);
    form.resetFields();
    onClose();
  };
  
  const getInterviewLink = (interview: any) => {
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
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('Đã sao chép vào clipboard');
      },
      () => {
        message.error('Không thể sao chép. Vui lòng thử lại.');
      }
    );
  };

  const disabledDate = (current: dayjs.Dayjs) => {
    // Không cho phép chọn ngày trong quá khứ
    return current && current < dayjs().startOf('day');
  };

  const disabledTime = (now: dayjs.Dayjs | null) => {
    if (!now) return {};
    const hours = now.hour();
    const minutes = now.minute();
    const currentDate = dayjs().startOf('day');
    
    if (now.isSame(currentDate, 'day')) {
      return {
        disabledHours: () => Array.from({ length: dayjs().hour() }, (_, i) => i),
        disabledMinutes: (selectedHour: number) => {
          if (selectedHour === dayjs().hour()) {
            return Array.from({ length: dayjs().minute() + 1 }, (_, i) => i);
          }
          return [];
        }
      };
    }
    
    return {};
  };

  return (
    <Modal
      title="Lên lịch phỏng vấn"
      open={open}
      onCancel={handleClose}
      footer={showSuccess ? [
        <Button key="close" onClick={handleClose}>
          Đóng
        </Button>
      ] : [
        <Button key="cancel" onClick={handleClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Lên lịch
        </Button>
      ]}
      width={700}
    >
      {!showSuccess ? (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            duration: 30
          }}
        >
          <Form.Item
            label="Ứng viên"
          >
            <div>{resumeEmail}</div>
          </Form.Item>
          
          <Form.Item
            label="Vị trí ứng tuyển"
          >
            <div>{jobName}</div>
          </Form.Item>
          
          <Form.Item
            name="scheduledTime"
            label="Thời gian phỏng vấn"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian phỏng vấn!' }]}
          >
            <DatePicker 
              showTime={{ format: 'HH:mm' }} 
              format="DD/MM/YYYY HH:mm"
              disabledDate={disabledDate}
              disabledTime={disabledTime}
              style={{ width: '100%' }}
              placeholder="Chọn ngày và giờ"
            />
          </Form.Item>
          
          <Form.Item
            name="duration"
            label="Thời lượng (phút)"
            rules={[{ required: true, message: 'Vui lòng nhập thời lượng phỏng vấn!' }]}
          >
            <InputNumber 
              min={15} 
              max={120} 
              step={15} 
              style={{ width: '100%' }}
              placeholder="Nhập thời lượng phỏng vấn"
            />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea 
              rows={4}
              placeholder="Nhập ghi chú cho buổi phỏng vấn (không bắt buộc)"
            />
          </Form.Item>
        </Form>
      ) : (
        <div>
          <Alert
            message="Đã lên lịch phỏng vấn thành công!"
            description="Bạn có thể gửi link tham gia phỏng vấn cho ứng viên qua email."
            type="success"
            showIcon
            style={{ marginBottom: 20 }}
          />
          
          <Divider orientation="left">Thông tin phỏng vấn</Divider>
          
          <div style={{ marginBottom: 20 }}>
            <Space direction="vertical" size="small">
              <Space>
                <Text strong>Ứng viên:</Text> 
                <Text>{createdInterview?.resumeEmail}</Text>
              </Space>
              <Space>
                <Text strong>Vị trí ứng tuyển:</Text> 
                <Text>{createdInterview?.jobName}</Text>
              </Space>
              <Space>
                <Text strong>Thời gian:</Text> 
                <Text>{dayjs(createdInterview?.scheduledTime).format('DD/MM/YYYY HH:mm')}</Text>
              </Space>
              <Space>
                <Text strong>Thời lượng:</Text> 
                <Text>{createdInterview?.duration} phút</Text>
              </Space>
            </Space>
          </div>
          
          <Divider orientation="left">Link tham gia phỏng vấn</Divider>
          
          <div style={{ marginBottom: 20 }}>
            <Paragraph>
              <Text strong>Link dành cho ứng viên:</Text>
            </Paragraph>
            <div style={{ display: 'flex', marginBottom: 10 }}>
              <Input 
                value={getInterviewLink(createdInterview)} 
                readOnly 
                style={{ marginRight: 10 }}
              />
              <Button 
                icon={<CopyOutlined />} 
                onClick={() => copyToClipboard(getInterviewLink(createdInterview))}
              >
                Sao chép
              </Button>
            </div>
            <Paragraph>
              <Text type="secondary">
                Gửi link này cho ứng viên để họ có thể tham gia phỏng vấn vào thời gian đã hẹn.
              </Text>
            </Paragraph>
          </div>
          
          <Divider orientation="left">Gửi email cho ứng viên</Divider>
          
          <div>
            <Button 
              type="primary" 
              icon={<MailOutlined />}
              onClick={() => {
                const subject = encodeURIComponent(`Lịch phỏng vấn vị trí ${createdInterview?.jobName}`);
                const body = encodeURIComponent(
                  `Xin chào,\n\n` +
                  `Bạn đã được lên lịch phỏng vấn cho vị trí ${createdInterview?.jobName}.\n\n` +
                  `Thời gian: ${dayjs(createdInterview?.scheduledTime).format('DD/MM/YYYY HH:mm')}\n` +
                  `Thời lượng: ${createdInterview?.duration} phút\n\n` +
                  `Vui lòng truy cập link sau để tham gia phỏng vấn vào thời gian đã hẹn:\n` +
                  `${getInterviewLink(createdInterview)}\n\n` +
                  `Lưu ý: Link phỏng vấn sẽ được kích hoạt 15 phút trước giờ hẹn.\n\n` +
                  `Trân trọng,\n` +
                  `Đội tuyển dụng`
                );
                window.open(`mailto:${createdInterview?.resumeEmail}?subject=${subject}&body=${body}`);
              }}
            >
              Soạn email thông báo
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ScheduleInterview;