import { useState, useEffect } from 'react';
import { Card, List, Avatar, Button, Input, message, Popconfirm, Typography, Divider, Empty } from 'antd';
import { CommentOutlined, EditOutlined, DeleteOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { callCreateComment, callFetchCommentsByJobId, callUpdateComment, callDeleteComment } from '@/config/api';
import { IResCommentDTO } from '@/types/backend';
import { useAppSelector } from '@/redux/hooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import styles from '@/styles/client.module.scss';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { TextArea } = Input;
const { Text } = Typography;

interface CommentSectionProps {
    jobId: string;
}

const CommentSection = ({ jobId }: CommentSectionProps) => {
    const [comments, setComments] = useState<IResCommentDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);

    useEffect(() => {
        fetchComments();
    }, [jobId]);

    const fetchComments = async () => {
        if (!jobId) return;
        
        setLoading(true);
        try {
            const res = await callFetchCommentsByJobId(jobId);
            if (res?.data) {
                setComments(res.data);
            }
        } catch (error) {
            message.error('Không thể tải bình luận');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) {
            message.warning('Vui lòng nhập nội dung bình luận');
            return;
        }

        setSubmitting(true);
        try {
            const res = await callCreateComment(jobId, newComment.trim());
            if (res?.data) {
                message.success('Đã thêm bình luận');
                setNewComment('');
                fetchComments(); // Refresh comments
            }
        } catch (error) {
            message.error('Không thể thêm bình luận');
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className={styles["comment-section"]}>
            <Divider style={{ borderColor: '#e0e0e0', opacity: 0.6, margin: '32px 0 24px 0' }} />

            {/* Label 1: Viết bình luận */}
            <div className={styles["comment-label"]} style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>
                Viết bình luận
            </div>
            <div className={styles["comment-content"]} style={{ marginTop: 0 }}>
                {/* Comment Input */}
                {isAuthenticated ? (
                    <div className={styles["comment-input-section"]}>
                        <div className={styles["comment-input-wrapper"]}>
                            <Avatar 
                                size={48} 
                                icon={<UserOutlined />}
                                className={styles["comment-avatar"]}
                            >
                                {user?.name?.substring(0, 2)?.toUpperCase()}
                            </Avatar>
                            <div className={styles["comment-input-content"]}>
                                <TextArea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Chia sẻ suy nghĩ của bạn về công việc này..."
                                    autoSize={{ minRows: 4, maxRows: 8 }}
                                    className={styles["comment-textarea"]}
                                />
                                <div className={styles["comment-actions"]}>
                                    <div className={styles["comment-actions-left"]}>
                                        <Text type="secondary" className={styles["comment-hint"]}>
                                            Hãy bình luận một cách lịch sự và xây dựng
                                        </Text>
                                    </div>
                                    <div className={styles["comment-actions-right"]}>
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            loading={submitting}
                                            onClick={handleSubmitComment}
                                            disabled={!newComment.trim()}
                                            className={styles["comment-submit-btn"]}
                                        >
                                            Đăng bình luận
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles["comment-login-prompt"]}>
                        <div className={styles["login-prompt-content"]}>
                            <UserOutlined className={styles["login-prompt-icon"]} />
                            <div>
                                <Text className={styles["login-prompt-text"]}>
                                    Đăng nhập để tham gia thảo luận
                                </Text>
                                <div className={styles["login-prompt-actions"]}>
                                    <a href="/login" className={styles["login-link"]}> Đăng nhập </a>
                                    <span>hoặc</span>
                                    <a href="/register" className={styles["register-link"]}> Đăng ký</a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Label 2: Các bình luận */}
                <div className={styles["comment-label"]} style={{ fontWeight: 600, fontSize: 18, margin: '32px 0 16px 0' }}>
                    Bình luận ({comments.length})
                </div>
                {/* Comments List */}
                <div className={styles["comments-list"]}>
                    {comments.length === 0 ? (
                        <div className={styles["empty-comments"]}>
                            <CommentOutlined className={styles["empty-icon"]} />
                            <Text type="secondary" className={styles["empty-text"]}>
                                Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ ý kiến!
                            </Text>
                        </div>
                    ) : (
                        <div className={styles["comments-container"]}>
                            {comments.map((comment) => (
                                <div key={comment.id} className={styles["comment-item"]} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, marginBottom: 16, background: '#fff' }}>
                                    <div className={styles["comment-header-info"]}>
                                        <Avatar 
                                          size={40} 
                                          style={{ backgroundColor: '#1890ff', color: '#fff' }}
                                          icon={<UserOutlined />}
                                          className={styles["comment-user-avatar"]}
                                        >
                                          {(comment.username && comment.username.trim() !== '' ? comment.username.substring(0, 2).toUpperCase() : 'NA')}
                                        </Avatar>
                                        <div className={styles["comment-meta"]}>
                                            <Text strong className={styles["comment-username"]}>
                                                {comment.username && comment.username.trim() !== ''
                                                    ? comment.username
                                                    : 'Người dùng ẩn danh'}
                                            </Text>
                                        </div>
                                        <div className={styles["comment-meta-right"]}>
                                            <Text type="secondary" className={styles["comment-time"]}>
                                                {dayjs(comment.createdAt).locale('vi').fromNow()}
                                            </Text>
                                        </div>
                                    </div>
                                    <div className={styles["comment-body"]}>
                                        <div className={styles["comment-text-container"]}>
                                            <span className={styles["comment-text"]}>
                                                {comment.content}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentSection;