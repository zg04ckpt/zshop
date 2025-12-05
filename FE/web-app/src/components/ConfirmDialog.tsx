import React from 'react'
import '../styles/components/ConfirmDialog.css'
import { useAppContext } from '../stores';
import Button from './Button';

export interface ConfirmDialogModel {
  message: string;
  onConfirm: () => void;
  onReject: () => void;
}

const ConfirmDialog = () => {
  const { confirmDialogData, hideConfirmDialog } = useAppContext()!;
  return (
    <>
      { confirmDialogData && (
        <div className='confirm-dialog cover-all-bg'>
            <div className='card card-body rounded-0 p-3 position-absolute start-50 translate-middle-x'>
              <label className='text-center'>{confirmDialogData.message}</label>
              <div className='d-flex justify-content-center mt-3'>
                
                <Button label="Hủy" pxWidth={100} onClick={() => {
                    confirmDialogData.onReject();
                    hideConfirmDialog();
                  }}></Button>

                <Button label="Xác nhận" pxWidth={100} blackTheme={true} className='ms-2' onClick={() => {
                    confirmDialogData.onConfirm();
                    hideConfirmDialog();
                  }}></Button>

              </div>
            </div>
        </div>
      )}
    </>
  )
}

export default ConfirmDialog;