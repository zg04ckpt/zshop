export const endpoints = {
	auth: {
		register: "/auth/register",
		confirmEmail: "/auth/confirm-email",
		requestResendConfirmEmailCode: "/auth/resend-confirm-mail-auth-code",
		login: "/auth/login",
		loginInfo: "/auth/login/info",
		logout: "/auth/logout",
		refresh: "/auth/refresh",
		sendResetPassCode: "/auth/send-reset-pass-auth-code",
		resetPassword: "/auth/reset-password",
		googleLogin: (returnUrl: string) => `/auth/google/login?returnUrl=${encodeURIComponent(returnUrl)}`,
	},
	book: {
		root: "/books",
		detail: (id: string) => `/books/${id}`,
		reviews: (id: string, page: number, size: number) => `/books/${id}/reviews?pageIndex=${page}&pageSize=${size}`,
		createReview: "/books/review",
		topSell: "/books/top-sell",
		explorer: "/books/explorer",
		newest: "/books/newest",
		purchased: "/books/purchased",
		categories: "/books/categories",
		topCategories: "/books/categories/top-sell",
	},
	bookManagement: {
		root: "/management/book",
		detail: (id: string) => `/management/book/${id}`,
		categories: "/management/book/categories",
		category: (id: number) => `/management/book/categories/${id}`,
	},
	cart: {
		root: "/cart",
		items: "/cart/items",
		item: (bookId: string) => `/cart/items/${bookId}`,
		pay: "/cart/pay",
	},
	order: {
		root: "/payment/orders",
		create: (bookId: string) => `/payment/orders?bookId=${bookId}`,
		history: "/payment/orders/history",
		historyDetail: (orderId: string) => `/payment/orders/history/${orderId}/detail`,
		confirm: (orderId: string) => `/payment/orders/${orderId}/confirm`,
		pay: (orderId: string) => `/payment/orders/${orderId}/pay`,
		cancel: (orderId: string) => `/payment/orders/${orderId}/cancel`,
		booksInOrder: (orderId: string) => `/payment/orders/${orderId}/books`,
	},
	orderManagement: {
		root: "/management/payment/orders",
		setStatus: (orderId: string) => `/management/payment/orders/${orderId}/status`,
		cancelRequests: "/management/payment/cancel-order-requests",
		cancelRequest: (requestId: number, isAccepted: boolean) =>
			`/management/payment/cancel-order-requests/${requestId}?isAccepted=${isAccepted}`,
	},
	user: {
		profile: "/user/profile",
		address: "/user/address",
		addressDetail: (id: string) => `/user/address/${id}`,
		addressSetDefault: (id: string) => `/user/address/${id}/set-default`,
		addressConfig: "/user/address/config",
	},
	userManagement: {
		root: "/management/user",
		roles: "/management/user/roles",
	},
	voucher: {
		root: "/vouchers",
		detail: (id: string) => `/vouchers/${id}`
	},
	voucherManagement: {
		root: "/management/vouchers",
		delete: (id: string) => "/management/vouchers/" + id,
		changeActivation: (id: string) => `/management/vouchers/${id}/change-activation`
	},
};