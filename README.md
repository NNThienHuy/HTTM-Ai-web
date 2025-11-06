# **AI Laptop & Electronics Recommendation Platform · Next.js · Tailwind CSS · TypeScript · Laravel · k-NN** 🧠💻

**PTIT E-commerce** là một nền tảng **AI gợi ý mua laptop & thiết bị điện tử** được xây dựng với kiến trúc full-stack hiện đại:

* **Frontend:** Next.js + TypeScript + Tailwind CSS
* **Backend:** Laravel RESTful API
* **AI Engine:** Thuật toán k-NN (K-Nearest Neighbors) để gợi ý sản phẩm tối ưu giữa **hiệu năng** và **giá thành**

Hiện tại hệ thống **tập trung vào mảng laptop**, nhưng kiến trúc đã được thiết kế sẵn để dễ dàng mở rộng sang:

* Màn hình máy tính
* PC lắp ráp
* Thiết bị văn phòng
* Gaming gear
* Thiết bị điện tử khác

Dự án hướng tới:

* Một **AI-first eCommerce platform**: không chỉ hiển thị sản phẩm, mà **hiểu** nhu cầu người dùng.
* Một **mã nguồn mở thực chiến** để:

  * Làm portfolio cá nhân.
  * Làm đồ án tốt nghiệp, nghiên cứu ứng dụng AI.
  * Làm nền tảng phát triển sản phẩm thương mại trong tương lai.

Hoàn toàn **miễn phí**, có thể fork, chỉnh sửa, sử dụng cho cá nhân hoặc doanh nghiệp.

---

## 🎯 Triết lý & Mục tiêu

1. **AI là trung tâm**
   Gợi ý sản phẩm dựa trên dữ liệu, không chỉ lọc theo giá / RAM / thương hiệu.

2. **Laptop là sản phẩm chiến lược hiện tại**

   * Tập trung xâu chuỗi hiệu năng CPU/GPU/RAM/SSD/màn hình với giá thành.
   * Giúp người dùng chọn **“đúng nhu cầu – đúng ngân sách”**.

3. **Mở rộng sang hệ sinh thái điện tử**

   * Mô hình dữ liệu & kiến trúc cho phép thêm nhiều loại sản phẩm mà vẫn tái sử dụng cùng core AI.

4. **Kiến trúc rõ ràng, dễ nâng cấp**

   * FE/BE tách biệt.
   * Có thể trích xuất AI thành service riêng khi cần scale.

---

## 🧠 AI Recommendation Engine – Gợi ý mua laptop thông minh

### Bài toán

Người dùng thường gặp các câu hỏi:

* “20–25 triệu nên mua laptop nào lập trình, không bị yếu sau 2–3 năm?”
* “Laptop nào vừa chơi game ổn vừa làm đồ hoạ không lag?”
* “Sinh viên cần máy nhẹ, pin tốt nhưng không quá đắt?”

Thay vì đưa ra một list dài sản phẩm, **HTTM-Ai-web**:

* Phân tích cấu hình + giá.
* Sử dụng **k-NN** để tìm những lựa chọn **gần với nhu cầu tối ưu**.

### Cách hệ thống hoạt động (tổng quan)

1. **Xây dựng vector đặc trưng cho từng laptop**
   Ví dụ:

   ```text
   [cpu_score, gpu_score, ram_gb, ssd_gb, screen_quality, weight, battery_score, price]
   ```

2. **Nhận input từ người dùng**

   * Ngân sách.
   * Mục đích sử dụng:

     * Học tập / Văn phòng
     * Lập trình
     * Đồ họa / Edit video
     * Gaming
     * AI/ML / Data
   * Ưu tiên:

     * Nhẹ
     * Pin trâu
     * Màn đẹp
     * Hiệu năng tối đa trong tầm giá

3. **Áp dụng k-NN**

   * Tính khoảng cách giữa “profile nhu cầu” và các laptop trong dataset.
   * Chọn ra `k` ứng viên gần nhất.
   * Có thể áp dụng **trọng số theo mục đích**:

     * Gaming → ưu GPU.
     * Dev → ưu CPU/RAM.
     * Design → ưu màn hình + GPU.
     * Mobile user → ưu nhẹ + pin.

4. **Trả về gợi ý có thể giải thích**

   * Nhóm gợi ý:

     * “Tối ưu chi phí / hiệu năng”
     * “Hiệu năng cao hơn một chút nếu muốn đầu tư dài hạn”
     * “Cân bằng tất cả các yếu tố”
   * Kèm giải thích ngắn gọn:

     * Vì sao gợi ý này phù hợp.

### Mở rộng sang các sản phẩm điện tử khác

Cùng một engine có thể áp dụng cho:

* **Màn hình:** độ phân giải, tần số quét, kích thước, panel, giá.
* **PC / linh kiện:** hiệu năng tổng hợp, TDP, độ tương thích, giá.
* **Thiết bị văn phòng:** độ bền, tính năng, chi phí.

Chỉ cần:

* Định nghĩa vector đặc trưng mới.
* Thêm dataset.
* Dùng lại pipeline k-NN + logic gợi ý.

---

## 🔍 Tổng quan

* **Monorepo** gồm:

  * `FE/` – Web app giao diện người dùng (Next.js + TailwindCSS + TypeScript).
  * `BE/` – API backend (Laravel, RESTful, sẵn sàng tích hợp Sanctum JWT / Token).
* Phù hợp cho:

  * Sinh viên, fresher, junior muốn có **1 project full-stack tử tế**.
  * Demo phỏng vấn Backend / Frontend / Fullstack.
  * Làm nền tảng nâng cấp lên hệ thống thật.

---

## 🧩 Công nghệ sử dụng

### Frontend (`/FE`)

* **Next.js** (App Router)
* **TypeScript**
* **Tailwind CSS**
* **Zustand** – quản lý state nhẹ, dễ mở rộng.
* **React Hot Toast** – hiển thị thông báo.
* **React Icons** – bộ icon nhanh gọn.
* **React Slick / Slick Carousel** – slider, banner.
* **Zod** – sẵn nền tảng validate form.
* Cấu trúc component tách nhỏ, dễ tái sử dụng.

### Backend (`/BE`)

* **Laravel** (phiên bản mới, PHP 8+)
* RESTful API
* Hỗ trợ:

  * Tích hợp **Laravel Sanctum** / token-based auth.
  * Mở rộng module: Sản phẩm, Danh mục, Đơn hàng, Người dùng, Giỏ hàng,...
  * Queue, Mail, Cache, Migration,… (theo tiêu chuẩn Laravel).

---

## 📁 Cấu trúc thư mục

```bash
HTTM-Ai-web/
├── FE/                      # Frontend - Next.js, Tailwind, TS
│   ├── app/                 # App Router, layout, page
│   ├── components/          # Component UI tái sử dụng
│   ├── public/              # Ảnh, icon, logo
│   ├── utils/, hooks/, ...  # Hàm tiện ích, custom hooks, store (tùy mở rộng)
│   ├── tailwind.config.js
│   └── package.json
├── BE/                      # Backend - Laravel
│   ├── app/                 # Models, Controllers, Services, ...
│   ├── config/
│   ├── database/            # migrations, seeders, factories
│   ├── routes/              # api.php, web.php
│   ├── .env.example
│   └── composer.json
└── README.md
```

---

## ✨ Tính năng Frontend (hiện có & định hướng)

Tùy theo tiến độ triển khai, FE bao gồm hoặc hướng tới:

### Trang chủ & điều hướng

* Banner / Hero giới thiệu.
* Menu danh mục sản phẩm.
* Khu vực sản phẩm nổi bật.
* Newsletter / form nhận thông tin.
* Header + Footer chuẩn eCommerce.

### Sản phẩm & giỏ hàng

* Danh sách sản phẩm:

  * Hiển thị theo grid, có hình ảnh, tên, giá, rating.
* Trang chi tiết sản phẩm:

  * Thông tin sản phẩm, mô tả, trạng thái kho.
  * Nút **Thêm vào giỏ**, **Mua ngay** (logic có thể cập nhật backend sau).
* Input số lượng, xử lý tăng giảm.
* Phân trang / lọc / sắp xếp (sẵn nền để tích hợp API).

### Wishlist & UX

* Thêm / bỏ sản phẩm yêu thích.
* Icon trái tim, hiệu ứng nhỏ giúp UX “mượt” hơn.
* Hiển thị tồn kho / độ gấp rút (Urgency text).

### Dashboard / Admin

Cấu trúc FE cho phép dễ dàng:

* Thêm layout riêng cho Admin.
* Bảng quản lý sản phẩm.
* Bảng quản lý đơn hàng, thống kê.
* Notification bell / card.
* Có thể kết hợp React Chart/ApexCharts để dựng dashboard.

---

## 🔐 Backend – Định hướng & sử dụng

`/BE` là nền Laravel sẵn sàng:

* Cấu hình `.env.example` mẫu.
* Có thể:

  * Tạo API:

    * `GET /api/products`
    * `GET /api/products/{id}`
    * `POST /api/cart`
    * `POST /api/orders`
    * …
  * Tích hợp **Sanctum** để:

    * Đăng ký / đăng nhập.
    * Bảo vệ route cần xác thực.
* Migrate + Seeder:

  * Tạo dữ liệu mẫu sản phẩm, danh mục.

---

## 🚀 Hướng dẫn cài đặt & chạy dự án

### 1. Clone repo

```bash
git clone https://github.com/NNThienHuy/HTTM-Ai-web.git
cd HTTM-Ai-web
```

---

### 2. Setup Backend (Laravel)

```bash
cd BE

# Cài dependencies
composer install

# Tạo file cấu hình môi trường
cp .env.example .env

# Thiết lập APP_KEY
php artisan key:generate
```

#### Cấu hình database

**Tuỳ chọn 1 – SQLite (nhanh, đơn giản)**

```bash
touch database/database.sqlite
```

Trong `.env`:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/HTTM-Ai-web/BE/database/database.sqlite
```

**Tuỳ chọn 2 – MySQL**

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=httm_ai
DB_USERNAME=root
DB_PASSWORD=your_password
```

Chạy migration (khi đã định nghĩa schema):

```bash
php artisan migrate
```

Chạy server:

```bash
php artisan serve
# Mặc định: http://127.0.0.1:8000
```

---

### 3. Setup Frontend (Next.js)

```bash
cd FE

# Cài dependencies
npm install
# hoặc
yarn
# hoặc
pnpm install
```

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NODE_ENV=development
NEXTAUTH_SECRET="12D16C923BA17672F89B18C1DB22A"
NEXTAUTH_URL=http://localhost:3000
```

Chạy dev:

```bash
npm run dev
# http://localhost:3000
```

Build & run production:

```bash
npm run build
npm start
```

---

## ⚙️ Các script hữu ích

### Frontend (`/FE`)

```bash
npm run dev       # Chạy chế độ phát triển
npm run build     # Build production
npm run start     # Chạy build đã build
npm run lint      # (nếu có) check code style
```

### Backend (`/BE`)

```bash
php artisan serve         # Chạy server
php artisan migrate       # Chạy migration
php artisan db:seed       # Seed dữ liệu (nếu cấu hình)
php artisan queue:work    # Queue (nếu dùng)
```

---

## 🧱 Định hướng kiến trúc & best practices

Dự án hướng đến:

* **Tách biệt FE/BE rõ ràng**:

  * FE chỉ gọi API qua `NEXT_PUBLIC_API_BASE_URL`.
  * Không trộn logic backend vào FE.
* **Dễ mở rộng microservice**:

  * Backend hiện là 1 service Laravel.
  * Có thể tách thành nhiều service (user, order, product) trong tương lai.
* **Code sạch, có thể dùng làm mẫu**:

  * Tách components nhỏ, rõ chức năng.
  * Tên file / folder có ý nghĩa.
  * Có thể bổ sung:

    * `hooks/`
    * `services/`
    * `store/`
    * `types/`
    * `utils/`
   
* **AI**:

  * Viết rõ pipeline.
  * Giữ khả năng thay thế k-NN bằng model khác trong tương lai.

---

## 🧪 Kiểm thử (gợi ý)

Tuỳ nhóm phát triển có thể thêm:

* **Frontend**

  * React Testing Library / Jest.
* **Backend**

  * PHPUnit / Pest cho test API.
* **Postman / Thunder Client**

  * Bộ collection API cho BE.

---

## 📝 Quy ước commit (khuyến nghị)

Để repo gọn và chuyên nghiệp hơn, có thể dùng:

```text
feat: thêm chức năng mới
fix: sửa bug
refactor: chỉnh lại code, không đổi behavior
style: format, đổi tên biến, không ảnh hưởng logic
docs: cập nhật tài liệu / README
chore: việc lặt vặt (config, build, ...)
```

Ví dụ:

```bash
git commit -m "feat: thêm trang chi tiết sản phẩm"
git commit -m "fix: sửa lỗi hiển thị giá khuyến mãi"
```

---

## 📌 Roadmap (gợi ý phát triển tiếp)

* [ ] Hoàn thiện API sản phẩm, giỏ hàng, đơn hàng trong BE.
* [ ] Kết nối FE với API BE (hiện thực giỏ hàng, checkout).
* [ ] Tích hợp xác thực (đăng ký / đăng nhập / profile).
* [ ] Thêm trang quản trị (admin):

  * Quản lý sản phẩm.
  * Quản lý đơn hàng.
* [ ] Thêm AI gợi ý sản phẩm (recommendation / search thông minh).
* [ ] Thêm unit test & e2e test.

---

## 🤝 Đóng góp

Rất hoan nghênh mọi người đóng góp:

1. Fork repo.
2. Tạo branch mới:

   ```bash
   git checkout -b feature/ten-chuc-nang
   ```
3. Commit rõ ràng.
4. Tạo Pull Request mô tả ngắn gọn thay đổi.

---

## 📜 License

Có thể sử dụng mã nguồn cho:

* Học tập.
* Demo portfolio.
* Làm base cho dự án riêng.

---

## 📬 Liên hệ

* **Owner:** `Binnndev`
* Mọi câu hỏi / góp ý: tạo **Issue** trên GitHub.

