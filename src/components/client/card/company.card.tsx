import { callFetchCompany } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { Card, Col, Divider, Empty, Pagination, Row, Spin, Button } from 'antd';
import { ArrowRightOutlined, CrownOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';

interface IProps {
    showPagination?: boolean;
}

const CompanyCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(4);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize, filter, sortQuery]);

    const fetchCompany = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchCompany(query);
        if (res && res.data) {
            setDisplayCompany(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }


    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: ICompany) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/company/${slug}?id=${item.id}`)
        }
    }

    return (
        <div className={`${styles["company-section"]}`}>
            <div className={styles["company-content"]}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <div className={styles["section-header"]}>
                                    <span className={styles["title"]}>
                                        <CrownOutlined style={{ color: '#faad14', marginRight: '10px' }} />
                                        Nhà Tuyển Dụng Hàng Đầu
                                    </span>
                                </div>
                                {!showPagination &&
                                    <Link to="company" className={styles["view-all-link"]}>
                                        <span>Xem tất cả</span>
                                        <ArrowRightOutlined />
                                    </Link>
                                }
                            </div>
                        </Col>

                        {displayCompany?.map(item => {
                            return (
                                <Col span={24} md={6} key={item.id}>
                                    <Card
                                        onClick={() => handleViewDetailJob(item)}
                                        hoverable
                                        className={styles["company-card"]}
                                    >
                                        <div className={styles["company-logo"]}>
                                            <img
                                                alt={item.name || "Company logo"}
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.logo}`}
                                            />
                                        </div>
                                        <div className={styles["company-info"]}>
                                            <h3 className={styles["company-title"]}>{item.name}</h3>
                                            <div className={styles["company-jobs"]}>
                                                <span>{Math.floor(Math.random() * 20) + 1} việc làm đang tuyển</span>
                                            </div>
                                            <Button 
                                                type="primary" 
                                                ghost 
                                                className={styles["company-button"]}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            )
                        })}

                        {(!displayCompany || displayCompany && displayCompany.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                    {showPagination && <>
                        <div style={{ marginTop: 30 }}></div>
                        <Row style={{ display: "flex", justifyContent: "center" }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                            />
                        </Row>
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default CompanyCard;