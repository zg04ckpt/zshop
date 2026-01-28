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
		root: "/books/manage",
		detail: (id: string) => `/books/manage/${id}`,
		categories: "/books/manage/categories",
		category: (id: number) => `/books/manage/categories/${id}`,
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
		root: "/payment/manage/orders",
		setStatus: (orderId: string) => `/payment/manage/orders/${orderId}/status`,
		cancelRequests: "/payment/manage/cancel-order-requests",
		cancelRequest: (requestId: number, isAccepted: boolean) =>
			`/payment/manage/cancel-order-requests/${requestId}?isAccepted=${isAccepted}`,
	},
	user: {
		profile: "/user/profile",
		address: "/user/address",
		addressDetail: (id: string) => `/user/address/${id}`,
		addressSetDefault: (id: string) => `/user/address/${id}/set-default`,
		addressConfig: "/user/address/config",
	},
	userManagement: {
		root: "/user/manage",
		roles: "/user/manage/roles",
		delete: (id: string) => `/user/manage/${id}`,
		changeActive: `/user/manage/change-active`,
	},
	voucher: {
		root: "/vouchers",
		detail: (id: string) => `/vouchers/${id}`
	},
	voucherManagement: {
		root: "/vouchers/manage",
		delete: (id: string) => "/vouchers/manage/" + id,
		changeActivation: (id: string) => `/vouchers/manage/${id}/change-activation`
	},
	chat: {
		startConversation: "/chats",
		existingConversation: "/chats/existing-conversation",
		startAnonymousConversation: "/chats/start-anonymous",
		listAllConversation: (index: Number) => `/chats/manage?index=${index}`,
		getConversation: (id: string) => `/chats/manage/${id}`,
		deleteConversations: `/chats/manage/delete`,
	},
	backup: {
		getListSnapshots: "/backups",
		createSnapshot: "/backups",
		deleteSnapshot: "/backups/delete",
		applySnapshot: "/backups/apply",
	}
};