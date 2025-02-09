import React from "react";
import './AccountInfo.css';
import testLogo from "../../../../assets/images/test-img.jpg";
import Button from "../../../components/button/Button";

const AccountInfo = () => {
    return (
        <div className="account-info">
            <div className="card card-body rounded-0 ">
                <div className="row">

                    {/* Image */}
                    <div className="col-2 text-center">
                        <img src={testLogo} alt="" />
                        <Button className="mt-2" label="Đổi ảnh" onClick={() => {}}></Button>
                    </div>

                    <div className="col-10">
                        <table className="table table-borderless">
                            <tbody>
                                {/* Username */}
                                <tr>
                                    <th>Tên tài khoản:</th>
                                    <td>nguyencao142</td>
                                </tr>
                                {/* Email */}
                                <tr>
                                    <th>Email:</th>
                                    <td><input type="text" value={'nguyen1402ckasd@gmail.com'}/></td>
                                </tr>
                                {/* Phonenumber */}
                                <tr>
                                    <th>Số điện thoại:</th>
                                    <td><input type="text" value={'0333333333'}/></td>
                                </tr>
                                {/* Sex */}
                                <tr>
                                    <th>Giới tính:</th>
                                    <td>
                                        <select name="" id="">
                                            <option value="">Nam</option>
                                            <option value="">Nữ</option>
                                            <option value="" selected>Khác</option>
                                        </select>
                                    </td>
                                </tr>
                                {/* DOB */}
                                <tr>
                                    <th>Ngày sinh:</th>
                                    <td><input type="date" name="" id="" /></td>
                                </tr>
                            </tbody>
                        </table>

                        <Button className="w-auto" label="Lưu thay đổi" onClick={() => {}}></Button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AccountInfo;