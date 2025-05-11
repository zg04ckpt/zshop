import React, { useContext, useEffect, useState } from "react";
import './Cart.css';
import { AppDispatch, Button, defaultImageUrl, endLoadingStatus, OutletContextProp, showErrorToast, showInfoToast, showSuccessToast, startLoadingStatus, useAppContext } from "../../../shared";
import { CartDTO, CartListItemDTO } from "../../types/cart";
import { useDispatch } from "react-redux";
import { Await, useNavigate, useOutletContext } from "react-router-dom";
import { getCartApi, payCartApi, removeBookFromCartApi } from "../../services/cartApi";
import { sum } from "lodash";

type SelectCartItem = CartListItemDTO & {
    isSelected: boolean,
}

const Cart = () => {
    const dispatch = useDispatch<AppDispatch>();
    const appContext = useAppContext();
    const { isApiReady } = useOutletContext<OutletContextProp>();
    const navigate = useNavigate();

    const [cart, setCart] = useState<CartDTO|null>(null);
    const [items, setItems] = useState<SelectCartItem[]>([]);

    const init = async () => {
        dispatch(startLoadingStatus());
        const res = await getCartApi();
        if (res.isSuccess) {
            setCart(res.data!);
            setItems(res.data!.items.map(e => ({... e, isSelected: false})));
        } else {
            showErrorToast(res.message!);
        }
        dispatch(endLoadingStatus());
    }

    const pay = async () => {
        const itemsToPay = items.filter(e => e.isSelected).map(e => ({
            bookId: e.bookId,
            quantity: e.quantity
        }));

        if (itemsToPay.length == 0) {
            showInfoToast("Vui lòng chọn ít nhất 1 vật phẩm");
            return;
        }

        dispatch(startLoadingStatus());
        const res = await payCartApi({
            items: itemsToPay
        });
        if (res.isSuccess) {
            // Redirect to confirm page
            navigate(`/order?id=${res.data!}`);
        } else {
            showErrorToast(res.message!);
        }
        dispatch(endLoadingStatus());
    }

    const removeCartItem = async (bookId: string) => {
        appContext?.showConfirmDialog({
            message: "Xác nhận bỏ sách này khỏi giỏ hàng?",
            onConfirm: async () => {
                dispatch(startLoadingStatus());
                const res = await removeBookFromCartApi(bookId);
                if (res.isSuccess) {
                    showSuccessToast(res.message!);
                    setItems(prev => prev.filter(e => e.bookId != bookId));
                } else {
                    showErrorToast(res.message!);
                }
                dispatch(endLoadingStatus());
            },
            onReject: () => {}
        })
        
    }

    useEffect(() => {
        if(isApiReady) init();
    }, [isApiReady]);

    return (
        <div className="cart">
            <h4 className="my-3 label ps-2">Giỏ hàng</h4>
            { cart && <>
                <div className="row g-2">
                    {/* Product list */}
                    <div className="col-md-8">
                        <div className="card card-body rounded-0 p-2">
                            <div className="d-flex align-items-center ps-2">
                                <small><i>(Đã chọn {items.filter(e => e.isSelected).length})</i></small>
                            </div>
                            <table className="table pb-0">
                                <thead>
                                    <tr>
                                        <th style={{width: '10px'}}>
                                            <input type="checkbox" title="Chọn tất" onChange={event => {
                                                setItems(prev => prev.map(b => ({...b, isSelected: event.target.checked})))
                                            }}/>
                                        </th>
                                        <th style={{width: '100px'}}>Bìa</th>
                                        <th>Tên sách</th>
                                        <th style={{width: '100px'}}>Số lượng</th>
                                        <th style={{width: '120px'}}>Đơn giá</th>
                                        <th style={{width: '120px'}}>Thay đổi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    { items.map(e => <>
                                        <tr>
                                            <td><input type="checkbox" checked={e.isSelected} onChange={event => {
                                                setItems(prev => prev.map(b => {
                                                    if (b.bookId == e.bookId) {
                                                        return {...b, isSelected: event.target.checked}
                                                    }
                                                    return b;
                                                }))
                                            }}/></td>
                                            <td><img src={e.bookCover} alt="" /></td>
                                            <td>{e.bookTitle}</td>
                                            <td>x{e.quantity}</td>
                                            <td>{(e.quantity * e.price).toLocaleString('vn')} VNĐ</td>
                                            <td>
                                                <div className="d-flex change-action">
                                                    <i className='bx bx-plus' onClick={() => {
                                                        setItems(prev => prev.map(i => {
                                                            if (i.bookId === e.bookId) {
                                                                return {...i, quantity: i.quantity + 1};
                                                            }
                                                            return i;
                                                        }))
                                                    }}></i>
                                                    <i className='bx bx-minus' onClick={() => {
                                                        if (e.quantity == 1) return;
                                                        setItems(prev => prev.map(i => {
                                                            if (i.bookId === e.bookId) {
                                                                return {...i, quantity: i.quantity - 1};
                                                            }
                                                            return i;
                                                        }))
                                                    }}></i>
                                                    <i className='bx bx-trash-alt' onClick={() => removeCartItem(e.bookId)}></i>
                                                </div>
                                            </td>
                                        </tr>
                                    </>) }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="col-md-4">
                        <div className="card card-body position-sticky rounded-0 py-2 px-3 d-flex flex-column"
                        style={{top: '60px'}}>
                            <h5 className="fw-light">Thanh toán</h5>
                            { items.map(e => {
                                if (e.isSelected) {
                                    return <>
                                        <div className="d-flex mt-2 align-items-center">
                                            <i className="fa-solid fa-check me-2"></i>
                                            <div>{e.bookTitle}</div>
                                            <div className="flex-fill"></div>
                                            <div>x{e.quantity}</div>
                                        </div>
                                    </>
                                }
                            }) }
                            <hr />
                            <div className="d-flex mb-4 align-items-center">
                                <i className="fa-solid fa-money-check me-2"></i>
                                <div>Tổng tiền</div>
                                <div className="flex-fill"></div>
                                <div className="mx-2">{sum(items.map(e => {
                                    if (e.isSelected) {
                                        return e.price * e.quantity;
                                    }
                                    return 0;
                                })).toLocaleString('vn')} VNĐ</div>
                            </div>
                            <div className="d-flex justify-content-center mb-2">
                                <Button blackTheme pxWidth={160} pxSize={16} onClick={() => pay()} label="Mua ngay"></Button>
                            </div>
                        </div>
                    </div>
                </div>   
            </> }
        </div>
    );
}

export default Cart;