import toast from "react-hot-toast";


const showSuccessToast = (msg: string, duration: number = 1200) => {
    toast.dismiss();
    toast.success(msg, { duration: duration })
}
const showInfoToast = (msg: string, duration: number = 1200) => {
    toast.dismiss();
    toast(msg, {
        icon: "ℹ️", // Thêm icon cho info toast
        duration: duration,
    });
}
const showErrorToast = (msg: string, duration: number = 1200) => {
    // toast.dismiss();
    toast.error(msg, { duration: duration })
}

export { showSuccessToast, showErrorToast, showInfoToast }

