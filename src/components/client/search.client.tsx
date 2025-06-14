import { Button, Col, Form, Row, Select, notification, Typography } from 'antd';
import { EnvironmentOutlined, MonitorOutlined, SearchOutlined, DollarOutlined, TrophyOutlined } from '@ant-design/icons';
import { LOCATION_LIST, LEVEL_LIST, SALARY_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { callFetchAllSkill } from '@/config/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';

const { Title } = Typography;

const SearchClient = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [optionsSkills, setOptionsSkills] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (location.search) {
            const queryLocation = searchParams.get("location");
            const querySkills = searchParams.get("skills");
            const queryLevel = searchParams.get("level");
            const querySalary = searchParams.get("salary");
            
            if (queryLocation) {
                form.setFieldValue("location", queryLocation.split(","))
            }
            if (querySkills) {
                form.setFieldValue("skills", querySkills.split(","))
            }
            if (queryLevel) {
                form.setFieldValue("level", queryLevel.split(","))
            }
            if (querySalary) {
                form.setFieldValue("salary", querySalary.split(","))
            }
        }
    }, [location.search])

    useEffect(() => {
        fetchSkill();
    }, [])

    const fetchSkill = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;

        const res = await callFetchAllSkill(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => {
                return {
                    label: item.name as string,
                    value: item.id + "" as string
                }
            }) ?? [];
            setOptionsSkills(arr);
        }
    }

    const onFinish = async (values: any) => {
        let query = "";
        if (values?.location?.length) {
            query = `location=${values?.location?.join(",")}`;
        }
        if (values?.skills?.length) {
            query = query ? query + `&skills=${values?.skills?.join(",")}` : `skills=${values?.skills?.join(",")}`;
        }
        if (values?.level?.length) {
            query = query ? query + `&level=${values?.level?.join(",")}` : `level=${values?.level?.join(",")}`;
        }
        if (values?.salary?.length) {
            query = query ? query + `&salary=${values?.salary?.join(",")}` : `salary=${values?.salary?.join(",")}`;
        }

        if (!query) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: "Vui lòng chọn ít nhất một tiêu chí để tìm kiếm"
            });
            return;
        }
        navigate(`/job?${query}`);
    }

    return (
        <ProForm
            form={form}
            onFinish={onFinish}
            submitter={{
                render: () => <></>
            }}
            className={styles["search-form"]}
        >
            <Row gutter={[20, 20]} align="middle">
                <Col span={24}>
                    <Title level={2} className={styles["search-title"]}>
                        <SearchOutlined className={styles["search-icon"]} /> Tìm Việc Làm IT Phù Hợp Với Bạn
                    </Title>
                </Col>
                <Col span={24} md={12}>
                    <ProForm.Item
                        name="skills"
                        className={styles["search-item"]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            suffixIcon={null}
                            style={{ width: '100%' }}
                            placeholder={
                                <>
                                    <MonitorOutlined /> Tìm theo kỹ năng (React, Node.js, Java...)
                                </>
                            }
                            optionLabelProp="label"
                            options={optionsSkills}
                            className={styles["search-select"]}
                            size="large"
                            maxTagCount={2}
                        />
                    </ProForm.Item>
                </Col>
                <Col span={12} md={4}>
                    <ProForm.Item
                        name="location"
                        className={styles["search-item"]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            suffixIcon={null}
                            style={{ width: '100%' }}
                            placeholder={
                                <>
                                    <EnvironmentOutlined /> Địa điểm...
                                </>
                            }
                            optionLabelProp="label"
                            options={optionsLocations}
                            className={styles["search-select"]}
                            size="large"
                            maxTagCount={1}
                        />
                    </ProForm.Item>
                </Col>
                <Col span={12} md={4}>
                    <ProForm.Item
                        name="level"
                        className={styles["search-item"]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            suffixIcon={null}
                            style={{ width: '100%' }}
                            placeholder={
                                <>
                                    <TrophyOutlined /> Cấp độ...
                                </>
                            }
                            optionLabelProp="label"
                            options={LEVEL_LIST}
                            className={styles["search-select"]}
                            size="large"
                            maxTagCount={1}
                        />
                    </ProForm.Item>
                </Col>
                <Col span={12} md={4}>
                    <ProForm.Item
                        name="salary"
                        className={styles["search-item"]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            suffixIcon={null}
                            style={{ width: '100%' }}
                            placeholder={
                                <>
                                    <DollarOutlined /> Mức lương...
                                </>
                            }
                            optionLabelProp="label"
                            options={SALARY_LIST}
                            className={styles["search-select"]}
                            size="large"
                            maxTagCount={1}
                        />
                    </ProForm.Item>
                </Col>
                <Col span={24} md={24} style={{ textAlign: 'center' }}>
                    <Button 
                        type='primary' 
                        onClick={() => form.submit()} 
                        size="large" 
                        className={styles["search-button"]}
                        icon={<SearchOutlined />}
                        style={{ minWidth: '150px' }}
                    >
                        Tìm kiếm
                    </Button>
                </Col>
            </Row>
        </ProForm>
    )
}
export default SearchClient;