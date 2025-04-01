import React, { useEffect, useState } from "react";
import './ListUser.css';
import { RoleSelectItemDTO, UserItemDTO, useUser } from "../../..";
import { Button, convertDateToTimeSpan, Loading, OutletContextProp, Pagination } from "../../../../shared";
import { useOutletContext } from "react-router-dom";
const ListUser = () => {
    const { apiLoading, getUsersAsList, getRolesOfUser } = useUser();
    const { isApiReady } = useOutletContext<OutletContextProp>();

    const [totalRecord, setTotalRecord] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(5);
    const [name, setName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [roleId, setRoleId] = useState<number>(-1);
    const [isActivated, setIsActivated] = useState<boolean>(true);
    const [users, setUsers] = useState<UserItemDTO[]>([]);
    const [roles, setRoles] = useState<RoleSelectItemDTO[]>([]);


    const load = async () => {
        const res = await getUsersAsList({
            page,size,name,userName,email,roleId,isActivated,
        });
        if (res) {
            setUsers(res.data);
            setTotalPage(res.totalPage);
            setTotalRecord(res.totalRecord);
        }

        setRoles(await getRolesOfUser());
    }

    const filter = () => {
        setPage(1);
        load();
    }

    const reset = async () => {
        setName('');
        setUserName('');
        setEmail('');
        setIsActivated(true);
        setRoleId(-1);
        setPage(1);
    }

    useEffect(() => {
        if(isApiReady) load();
    }, [page, isApiReady]);

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
                <label htmlFor="">Đã kích hoạt</label>
                <input type="checkbox" checked={isActivated}
                    onClick={e => setIsActivated(v => !v)} className="mx-2"/>
                {/* Roles */}
                <select className="me-2" value={roleId}
                    onChange={e => setRoleId(Number(e.target.value))}>
                    <option value="-1">-- Tất cả vai trò --</option>
                    { roles.map(e => <option value={e.id}>{e.name}</option>) }
                </select>
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
                <div className="flex-fill"></div>
            </div>

            <div className="d-flex mt-2">
                <label className="fw-bolder">Tìm thấy {totalRecord} kết quả</label>
            </div>

            <Loading isShow={apiLoading}/>
            <table className="w-100 mt-2">
                <thead>
                    <tr>
                        <th className="w-auto">#</th>
                        <th>Tên</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th style={{width: '120px'}}>Trạng thái</th>
                        <th>Quyền</th>
                        <th>Đăng nhập</th>
                        <th>Tùy chọn</th>
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
                                { !e.isActivated && <div className="tag tag-not-activated">Chưa kích hoạt</div> }
                            </td>
                            <td>{e.roles.join(',')}</td>
                            <td>{convertDateToTimeSpan(e.lastLogin)}</td>
                            <td>
                                <div className="d-flex action align-items-center">
                                    <i className='bx bx-message-rounded-dots'></i>
                                    <i className='bx bx-lock-alt'></i>
                                    <i className='bx bx-info-circle'></i>
                                </div>
                            </td>
                        </tr>
                    </>) }
                </tbody>
            </table>

            <div className="d-flex justify-content-center mt-4">
                <Pagination page={page} total={totalPage} onPageChange={p => setPage(p)}/>
            </div>
        </div>
    );
}

export default ListUser;