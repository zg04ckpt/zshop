import React, { useEffect, useState } from "react";
import '../../styles/pages/ManageUser.css';
import { useOutletContext } from "react-router-dom";
import { OutletContextProp } from "../../types/base";
import { RoleSelectItemDTO, UserItemDTO } from "../../types/user";
import { changeUserActive, deleteUser, getRoles, getUsers } from "../../api";
import Button from "../../components/Button";
import { convertDateToTimeSpan } from "../../utils/helper";
import Pagination from "../../components/Pagination";
import { showErrorToast, showInfoToast, showSuccessToast } from "../../utils";
import { AppDispatch, endLoadingStatus, startLoadingStatus, useAppContext } from "../../stores";
import { useDispatch } from "react-redux";

export const ManageUser = () => {
    const context = useAppContext();
    const dispatch = useDispatch<AppDispatch>();
    const { isApiReady } = useOutletContext<OutletContextProp>();

    const [totalRecord, setTotalRecord] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(5);
    const [name, setName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [roleId, setRoleId] = useState<number>(-1);
    // const [isActivated, setIsActivated] = useState<boolean>(true);
    const [users, setUsers] = useState<UserItemDTO[]>([]);
    const [roles, setRoles] = useState<RoleSelectItemDTO[]>([]);


    const load = async () => {
        dispatch(startLoadingStatus());
        const res = await getUsers({
            pageIndex: page,pageSize: size,name,userName,email,roleId,
        });
        if (res.isSuccess) {
            setUsers(res.data!.items!);
            setTotalPage(res.data!.totalPages);
            setTotalRecord(res.data!.totalItems);
        }

        setRoles((await getRoles()).data!);
        dispatch(endLoadingStatus());
    }

    const filter = () => {
        setPage(1);
        load();
    }

    const reset = async () => {
        setName('');
        setUserName('');
        setEmail('');
        // setIsActivated(true);
        setRoleId(-1);
        setPage(1);
    }

    useEffect(() => {
        if(isApiReady) load();
    }, [page, isApiReady]);

    const handleOnChangeActive = async (e: UserItemDTO) => {
        dispatch(startLoadingStatus());
        console.log(e);
        const res = await changeUserActive(e.id, !e.isActivated);
        if (res.isSuccess) {
            showSuccessToast("Cập nhật trạng thái thành công!");
            setUsers(prev => prev.map(u => {
                if (u.id != e.id) return u;
                return {
                    ... u,
                    isActivated: !u.isActivated
                }
            }));
        } else {
            showErrorToast(res.message || "Cập nhật trạng thái thất bại");
        }
        dispatch(endLoadingStatus());
    }

    const handleOnDeleteUser = (e: UserItemDTO) => {
        context?.showConfirmDialog({
            message: "Xác nhận xóa người dùng? Mọi thông tin liên quan đến người dùng này sẽ biến mất",
            onConfirm: async () => {
                dispatch(startLoadingStatus());
                const res = await deleteUser(e.id);
                if (res.isSuccess) {
                    showSuccessToast("Xóa người dùng thành công");
                    setUsers(prev => ([... prev.filter(u => u.id != e.id)]));
                } else {
                    showErrorToast(res.message || "Xóa người dùng thất bại");
                }
                dispatch(endLoadingStatus());
            },
            onReject: () => {}
        });
    }

    return (
        <div className="user-management position-relative">
            {/* Top action */}
            <div className="d-flex mt-2 align-items-center">
                <input type="text" placeholder="Nhập tên" className="me-2" value={name}
                    onChange={e => setName(e.target.value)}/>
                <input type="text" placeholder="Nhập username" className="me-2" value={userName}
                    onChange={e => setUserName(e.target.value)}/> 
                <input type="text" placeholder="Nhập email" className="me-2" value={email}
                    onChange={e => setEmail(e.target.value)}/>
                {/* Is activated */}
                {/* <label htmlFor="">Đã kích hoạt</label>
                <input type="checkbox" checked={isActivated}
                    onClick={e => setIsActivated(v => !v)} className="mx-2"/> */}
                {/* Roles */}
                <select className="me-2" value={roleId}
                    onChange={e => setRoleId(Number(e.target.value))}>
                    <option value="-1">-- Tất cả vai trò --</option>
                    { roles.map(e => <option value={e.id}>{e.name}</option>) }
                </select>
                
                <div className="flex-fill"></div>
            </div>
            <div className="d-flex mt-2 align-items-center">
                {/* Size */}
                <label htmlFor="">Số kết quả / trang</label>
                <select className="me-3 ms-2" value={size} 
                    onChange={e => setSize(Number(e.target.value))}>
                    <option value="5">5 </option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
                <Button label="Lọc" blackTheme onClick={() => filter()} icon={<i className='bx bxs-filter-alt'></i>}></Button>
                <Button label="Reset" onClick={() => reset()} className="ms-2"></Button>
            </div>

            <div className="d-flex mt-2">
                <label className="fw-bolder">Tìm thấy {totalRecord} kết quả</label>
            </div>

            <div className="card card-body rounded-0 pt-0">
                <table className="w-100">
                    <thead>
                        <tr>
                            <th className="w-auto">#</th>
                            <th>Tên</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th style={{width: '120px'}}>Trạng thái</th>
                            <th>Quyền</th>
                            <th>Đăng nhập</th>
                            <th>#</th>
                        </tr>
                    </thead>
                    <tbody>
                        { users.map((e, index) => <>
                            <tr>
                                <td>{index + 1 + (page-1) * size}</td>
                                <td>{e.fullName}</td>
                                <td>{e.userName}</td>
                                <td>{e.email}</td>
                                <td className="align-content-center">
                                    { e.isActivated && <div className="tag tag-activated">Đã kích hoạt</div> }
                                    { !e.isActivated && <div className="tag tag-not-activated">Đã khóa</div> }
                                </td>
                                <td>{e.roles.join(',')}</td>
                                <td>{convertDateToTimeSpan(e.lastLogin)}</td>
                                <td>
                                    <div className="d-flex action align-items-center dropdown">
                                        <i className='bx bx-info-circle' data-bs-toggle="dropdown"></i>
                                        <ul className="dropdown-menu">
                                            <li onClick={() => handleOnChangeActive(e)}><a className="dropdown-item" href="#">{e.isActivated? "Khóa tài khoản":"Mở tài khoản"}</a></li>
                                            <li onClick={() => handleOnDeleteUser(e)}><a className="dropdown-item" href="#">Xóa tài khoản</a></li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        </>) }
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-center mt-4">
                <Pagination page={page} total={totalPage} onPageChange={p => setPage(p)}/>
            </div>
        </div>
    );
}