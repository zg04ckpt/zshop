import toast from "react-hot-toast";


const showSuccessToast = (msg: string) => {
    toast.dismiss();
    toast.success(msg, { duration: 1200 })
}
const showInfoToast = (msg: string) => {
    toast.dismiss();
    toast(msg, {
        icon: "ℹ️", // Thêm icon cho info toast
        duration: 1200,
    });
}
const showErrorToast = (msg: string) => {
    // toast.dismiss();
    toast.error(msg, { duration: 1200 })
}

export { showSuccessToast, showErrorToast, showInfoToast }

