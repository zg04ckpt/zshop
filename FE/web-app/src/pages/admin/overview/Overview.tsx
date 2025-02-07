import React from "react";
import './Overview.css';

const Overview = () => {
    return (
        <div className="overview">

            <select name="" id="" className="my-2">
                <option value="">Hôm nay</option>
                <option value="">Hôm qua</option>
                <option value="">Tháng này</option>
                <option value="customer">Tùy chỉnh</option>
            </select>

            <div className="row">
                {/* Left */}
                <div className="col-6">
                    <table>
                        <tbody>
                            <tr>
                                <th>Lượt truy cập:</th>
                                <td>23000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Right */}
                <div className="col-6">
                    <table>
                        <tbody>
                            <tr>
                                <th>Lượt mua:</th>
                                <td>230</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            

        </div>
    );
}

export default Overview;