/project-name
├── /public              # Tài nguyên tĩnh
│   ├── index.html       # File HTML chính
│   ├── favicon.ico      # Biểu tượng
│   └── manifest.json    # Cấu hình PWA
├── /src                 # Thư mục mã nguồn chính
│   ├── /modules         # Các module tính năng
│   │   ├── /auth        # Module xác thực
│   │   │   ├── components/     # Component của module auth
│   │   │   │   └── LoginForm.tsx
│   │   │   ├── pages/          # Trang liên quan đến auth
│   │   │   │   └── Login.tsx
│   │   │   ├── services/       # Logic dịch vụ (API calls)
│   │   │   │   └── authApi.ts
│   │   │   ├── types/          # Định nghĩa type
│   │   │   │   └── auth.ts
│   │   │   ├── hooks/          # Custom hooks
│   │   │   │   └── useAuth.ts
│   │   │   └── index.ts        # Xuất các thành phần chính
│   │   ├── /dashboard   # Module bảng điều khiển
│   │   │   ├── components/     # Component của dashboard
│   │   │   ├── pages/          # Trang dashboard
│   │   │   ├── services/       # API cho dashboard
│   │   │   ├── types/          # Type cho dashboard
│   │   │   └── index.ts
│   │   └── /shared      # Module chia sẻ chung (tái sử dụng)
│   │       ├── components/     # Button, Input, v.v.
│   │       ├── hooks/          # Hook chung
│   │       ├── utils/          # Hàm tiện ích
│   │       └── index.ts
│   ├── /assets          # Tài nguyên (ảnh, font, v.v.)
│   ├── /routes          # Cấu hình định tuyến
│   │   └── index.tsx    # Router chính
│   ├── /store           # Quản lý trạng thái toàn cục
│   │   └── index.ts     # Redux/Zustand store
│   ├── App.tsx          # Component gốc
│   ├── index.tsx        # Điểm vào chính
│   └── styles           # CSS/SCSS toàn cục
├── .gitignore           # File bỏ qua khi commit
├── package.json         # Dependencies và script
├── tsconfig.json        # Cấu hình TypeScript
└── README.md            # Tài liệu dự án