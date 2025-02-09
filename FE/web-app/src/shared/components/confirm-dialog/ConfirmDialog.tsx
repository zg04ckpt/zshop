import React from 'react'
import './ConfirmDialog.css'
import { useDispatch, useSelector } from 'react-redux'
import { ConfirmDialogState, hideConfirm } from './confirm-dialog.slice'
import { AppDispatch, RootState } from '../../stores/redux-toolkit.store'
import Button from '../button/Button'

const ConfirmDialog = () => {
  const state: ConfirmDialogState = useSelector((state: RootState) => state.confirmDialog);
  const dispatch: AppDispatch = useDispatch();
  return (
    <>
      { state.show && (
        <div className='confirm-dialog cover-all-bg'>
            <div className='card card-body rounded-0 p-3 position-absolute start-50 translate-middle-x'>
              <label className='text-center'>{state.message}</label>
              <div className='d-flex justify-content-center mt-3'>
                
                <Button label="Hủy" pxWidth={100} onClick={() => {
                    state.onReject();
                    dispatch(hideConfirm());
                  }}></Button>

                <Button label="Xác nhận" pxWidth={100} blackTheme={true} className='ms-2' onClick={() => {
                    state.onConfirm();
                    dispatch(hideConfirm());
                  }}></Button>

              </div>
            </div>
        </div>
      )}
    </>
  )
}

export default ConfirmDialog;