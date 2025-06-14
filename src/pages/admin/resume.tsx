import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IResume } from "@/types/backend";
import { ActionType, ProColumns, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Space, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteResume } from "@/config/api";
import queryString from 'query-string';
import { fetchResume } from "@/redux/slice/resumeSlide";
import ViewDetailResume from "@/components/admin/resume/view.resume";
import { ALL_PERMISSIONS } from "@/config/permissions";
import Access from "@/components/share/access";
import { sfIn } from "spring-filter-query-builder";
import { EditOutlined } from "@ant-design/icons";

const ResumePage = () => {
    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.resume.isFetching);
    const meta = useAppSelector(state => state.resume.meta);
    const resumes = useAppSelector(state => state.resume.result);
    const dispatch = useAppDispatch();

    const [dataInit, setDataInit] = useState<IResume | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const handleDeleteResume = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteResume(id);
            if (res && res.data) {
                message.success('Xóa Resume thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IResume>[] = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 50,
            render: (text, record, index, action) => {
                return (
                    <a href="#" onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        {record.id}
                    </a>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            sorter: true,
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        PENDING: 'PENDING',
                        REVIEWING: 'REVIEWING',
                        APPROVED: 'APPROVED',
                        REJECTED: 'REJECTED',
                    }}
                    placeholder="Chọn level"
                />
            ),
        },

        {

            title: 'Tên Job',
            dataIndex: ['job', 'name'],  // Truyền đúng key là job.name
            sorter: true,


        },
        {
            title: 'Company',
            dataIndex: "companyName",
            hideInSearch: true,
            sorter: true,
        },

        {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'UpdatedAt',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'CV',
            dataIndex: "",
            render(value, record, index) {
                return (
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${record?.url}`}
                        target="_blank"
                    >Xem CV</a>
                )
            },
            hideInSearch: true,
        },
        {

            title: 'Actions',
            hideInSearch: true,
            width: 100,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setOpenViewDetail(true);
                            setDataInit(entity);
                        }}
                    />

                    {/* <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa resume"}
                        description={"Bạn có chắc chắn muốn xóa resume này ?"}
                        onConfirm={() => handleDeleteResume(entity.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <span style={{ cursor: "pointer", margin: "0 10px" }}>
                            <DeleteOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#ff4d4f',
                                }}
                            />
                        </span>
                    </Popconfirm> */}
                </Space>
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        let parts: string[] = [];  // Mảng chứa các phần điều kiện lọc

        // Thêm điều kiện lọc cho tên Job nếu có
        if (clone.jobName) {
            parts.push(`job.name ~ '${clone.jobName}'`);  // Tìm kiếm theo tên job
            delete clone.jobName;  // Xóa jobName khỏi clone sau khi đã xử lý
        }

        // Thêm điều kiện lọc cho trạng thái (status) nếu có
        if (clone?.status?.length) {
            parts.push(sfIn("status", clone.status).toString());  // Lọc theo trạng thái
            delete clone.status;  // Xóa status khỏi clone sau khi đã xử lý
        }

        // Nếu có điều kiện lọc (parts), kết hợp chúng thành một chuỗi filter
        if (parts.length > 0) {
            clone.filter = parts.join(' and ');  // Kết hợp các điều kiện lọc với 'and'
        } else {
            delete clone.filter;  // Nếu không có filter nào, xóa thuộc tính filter
        }

        // Phân trang (thêm page và size)
        clone.page = clone.current;
        clone.size = clone.pageSize;

        // Xóa các trường không cần thiết sau khi xử lý (current, pageSize)
        delete clone.current;
        delete clone.pageSize;

        // Chuyển các tham số thành query string
        let temp = queryString.stringify(clone);

        // Xử lý sắp xếp (sort)
        let sortBy = "";
        const fields = ["status", "createdAt", "updatedAt"];  // Các trường có thể sắp xếp

        // Nếu có sort, xử lý và lấy tham số sắp xếp
        if (sort) {
            for (const field of fields) {
                if (sort[field]) {
                    sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
                    break;  // Dừng lại sau khi tìm thấy một điều kiện sort
                }
            }
        }

        // Nếu không có sort, mặc định sort theo `updatedAt`
        if (!sortBy) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;  // Trả về query string hoàn chỉnh
    }


    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.RESUMES.GET_PAGINATE}
            >
                <DataTable<IResume>
                    actionRef={tableRef}
                    headerTitle="Danh sách Resumes"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={resumes}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchResume({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <></>
                        );
                    }}
                />
            </Access>
            <ViewDetailResume
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={reloadTable}
            />
        </div >
    )
}

export default ResumePage;