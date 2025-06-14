import { callFetchJob } from '@/config/api';
import { convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined, ArrowRightOutlined, FireOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin, Tag } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import { sfIn, sfEqual, sfGe, sfLe } from "spring-filter-query-builder";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);


interface IProps {
    showPagination?: boolean;
}

const JobCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, filter, sortQuery, location]);

    const fetchJob = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        //check query string
        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills");
        const queryLevel = searchParams.get("level");
        const querySalary = searchParams.get("salary");
        
        if (queryLocation || querySkills || queryLevel || querySalary) {
            let filterParts = [];
            
            // Xử lý tìm kiếm theo location
            if (queryLocation) {
                filterParts.push(sfIn("location", queryLocation.split(",")).toString());
            }

            // Xử lý tìm kiếm theo skills
            if (querySkills) {
                filterParts.push(sfIn("skills", querySkills.split(",")).toString());
            }
            
            // Xử lý tìm kiếm theo level
            if (queryLevel) {
                filterParts.push(sfIn("level", queryLevel.split(",")).toString());
            }
            
            // Xử lý tìm kiếm theo salary
            if (querySalary) {
                const salaryRanges = querySalary.split(",");
                const salaryConditions = [];
                
                for (const range of salaryRanges) {
                    const [min, max] = range.split("-").map(Number);
                    if (min !== undefined && max !== undefined) {
                        // Sử dụng sfGe và sfLe để tạo điều kiện lọc theo khoảng lương
                        const minCondition = sfGe("salary", min).toString();
                        const maxCondition = sfLe("salary", max).toString();
                        salaryConditions.push(`(${minCondition} and ${maxCondition})`);
                    }
                }
                
                if (salaryConditions.length > 0) {
                    filterParts.push(`(${salaryConditions.join(" or ")})`);
                }
            }
            
            // Kết hợp tất cả điều kiện tìm kiếm
            if (filterParts.length > 0) {
                const q = filterParts.join(" and ");
                query += `&filter=${encodeURIComponent(q)}`;
            }
        }

        const res = await callFetchJob(query);
        if (res && res.data) {
            // Sắp xếp: active lên trên, inactive xuống dưới
            const sortedJobs = [...res.data.result].sort((a, b) => {
                if (a.active === b.active) return 0;
                return a.active ? -1 : 1; // active = true lên trên, active = false xuống dưới
            });
            
            setDisplayJob(sortedJobs);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false);
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

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item.id}`)
    }

    return (
        <div className={`${styles["card-job-section"]}`}>
            <div className={`${styles["job-content"]}`}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <div className={styles["section-header"]}>
                                    <span className={styles["title"]}>
                                        <FireOutlined style={{ color: '#ff4d4f', marginRight: '10px' }} />
                                        Công Việc Mới Nhất
                                    </span>
                                </div>
                                {!showPagination &&
                                    <Link to="job" className={styles["view-all-link"]}>
                                        <span>Xem tất cả</span>
                                        <ArrowRightOutlined />
                                    </Link>
                                }
                            </div>
                        </Col>

                        {displayJob?.map(item => {
                            return (
                                <Col span={24} md={12} key={item.id}>
                                    <Card 
                                        className={styles["job-card"]}
                                        hoverable
                                        onClick={() => handleViewDetailJob(item)}
                                    >
                                        <div className={styles["card-job-content"]}>
                                            <div className={styles["card-job-left"]}>
                                                <img
                                                    alt={item?.company?.name || "Company logo"}
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.company?.logo}`}
                                                />
                                                <div className={styles["company-name"]}>{item?.company?.name}</div>
                                            </div>
                                            <div className={styles["card-job-right"]}>
                                                <div className={styles["job-title"]}>{item.name}</div>
                                                <div className={styles["job-meta"]}>
                                                    <div className={styles["job-location"]}>
                                                        <EnvironmentOutlined className={styles["job-icon"]} />
                                                        <span>{getLocationName(item.location)}</span>
                                                    </div>
                                                    <div className={styles["job-salary"]}>
                                                        <ThunderboltOutlined className={styles["job-icon"]} />
                                                        <span>{(item.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</span>
                                                    </div>
                                                </div>
                                                <div className={styles["job-footer"]}>
                                                    <div className={styles["job-tags-container"]}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "6px" }}>
                                                            <Tag 
                                                                color={item.active ? "success" : "error"}
                                                                className={styles["job-tag"]}
                                                            >
                                                                {item.active ? "Đang tuyển" : "Đã hết hạn"}
                                                            </Tag>
                                                            {item.level && (
                                                                <Tag color="blue" className={styles["job-tag"]}>
                                                                    {item.level}
                                                                </Tag>
                                                            )}
                                                        </div>
                                                        <div className={styles["job-skills"]}>
                                                            {item.skills && item.skills.slice(0, 3).map((skill, index) => (
                                                                <Tag 
                                                                    key={index} 
                                                                    color="warning" 
                                                                    className={styles["job-tag"]}
                                                                >
                                                                    {skill.name}
                                                                </Tag>
                                                            ))}
                                                            {item.skills && item.skills.length > 3 && (
                                                                <Tag color="default" className={styles["job-tag"]}>
                                                                    +{item.skills.length - 3}
                                                                </Tag>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={styles["job-time"]}>
                                                        {item.updatedAt ? dayjs(item.updatedAt).locale('en').fromNow() : dayjs(item.createdAt).locale('en').fromNow()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            )
                        })}


                        {(!displayJob || displayJob && displayJob.length === 0)
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

export default JobCard;