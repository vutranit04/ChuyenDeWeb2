# BÁO CÁO ĐỒ ÁN MÔN HỌC - HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ MINHVU STORE

Hệ thống Website thương mại điện tử chuyên kinh doanh sản phẩm Laptop và Thiết bị Công nghệ cao cấp. Đồ án được thiết kế và phát triển theo mô hình ứng dụng phân lớp hiện đại: **Backend RESTful API (Spring Boot)** kết hợp với 2 phân hệ **Frontend Client & Admin (React.js)**.

---

## 🛠️ Công Nghệ Sử Dụng (Technology Stack)

### 1. Phân hệ Backend (API Server)
*   **Ngôn ngữ**: Java 17.
*   **Framework**: Spring Boot 3.x.
*   **Bảo mật & Xác thực**: Spring Security, JSON Web Token (JWT) cho Admin/Staff, và cơ chế xác thực session-storage cho Khách hàng.
*   **Quản lý & Lưu trữ dữ liệu**:
    *   **Spring Data JPA**: Quản lý các thực thể (Entities), ánh xạ ORM (Object-Relational Mapping) tự động.
    *   **Hibernate**: Cung cấp công cụ ORM và sinh cấu trúc bảng tự động (`ddl-auto: update`).
    *   **MySQL**: Cơ sở dữ liệu quan hệ (RDBMS) lưu trữ thông tin sản phẩm, đơn hàng, khách hàng.
*   **Gửi Email tự động**: `spring-boot-starter-mail` (Sử dụng giao thức SMTP kết nối với Gmail App Password để gửi thư khôi phục mật khẩu và hóa đơn điện tử).
*   **Khác**: Lombok (rút gọn code Boilerplate), Springdoc OpenAPI (Tự động sinh tài liệu API Swagger UI).

### 2. Phân hệ Frontend (Cửa hàng & Quản trị)
*   **Công cụ build**: Vite (tối ưu hóa tốc độ tải trang và đóng gói ứng dụng).
*   **Thư viện lõi**: React.js (v18.x).
*   **Định tuyến**: React Router DOM (v6.x) hỗ trợ phân luồng các trang không tải lại (Single Page Application - SPA).
*   **Kết nối API**: Axios Client (cấu hình Interceptors xử lý Header, Base URL).
*   **Giao diện & Tiện ích**:
    *   **Vanilla CSS** (Phần Cửa hàng `minhvu-store`): Tối ưu CSS thuần mang lại giao diện đặc trưng và mượt mà.
    *   **Tailwind CSS** (Phần Quản trị `admin-dashboard`): Framework CSS tiện ích giúp xây dựng nhanh bảng điều khiển quản trị trực quan.
    *   **Swiper.js**: Thư viện chạy Banner Slider mượt mà tích hợp các hiệu ứng Fade, Autoplay.
    *   **React Icons & FontAwesome**: Bộ icon Vector sắc nét.
    *   **React Hot Toast**: Thư viện hiển thị thông báo popup đẹp mắt, trực quan.

---

## 🗄️ Cấu Trúc Cơ Sở Dữ Liệu (Database Schema)

Hệ thống bao gồm 10 bảng dữ liệu chính được thiết kế chuẩn hóa quan hệ (1-N, N-N) để quản lý toàn bộ luồng vận hành:

### 1. Bảng `users` (Quản trị viên & Nhân viên)
*   Lưu trữ tài khoản truy cập vào trang Quản trị Admin Dashboard.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `user_id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Mã định danh quản trị viên |
| `username` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Tên đăng nhập |
| `password` | `VARCHAR(255)` | `NOT NULL` | Mật khẩu (Mã hóa Bcrypt) |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Họ và tên quản trị viên |
| `email` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Địa chỉ email quản trị |
| `role` | `VARCHAR(20)` | `NOT NULL` | Quyền hạn: `ADMIN` hoặc `STAFF` |
| `created_at` | `DATETIME` | `NOT NULL` | Ngày giờ tạo tài khoản |

### 2. Bảng `customers` (Khách hàng)
*   Lưu trữ thông tin tài khoản của khách hàng mua sắm tại storefront.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `customer_id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Mã định danh khách hàng |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Họ và tên khách hàng |
| `email` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Email đăng ký (dùng làm tài khoản đăng nhập) |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Số điện thoại |
| `password` | `VARCHAR(255)` | `NOT NULL` | Mật khẩu đăng nhập (Mã hóa Bcrypt) |

### 3. Bảng `categories` (Danh mục sản phẩm)
*   Quản lý các nhóm danh mục sản phẩm (Ví dụ: Laptop, Chuột, Bàn phím).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `category_id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Mã danh mục |
| `category_name`| `VARCHAR(100)`| `NOT NULL` | Tên danh mục |
| `image` | `VARCHAR(255)`| `NULL` | Tên tệp tin ảnh đại diện danh mục |

### 4. Bảng `products` (Sản phẩm)
*   Lưu trữ thông tin chi tiết của sản phẩm Laptop và linh kiện.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `product_id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Mã sản phẩm |
| `product_name`| `VARCHAR(255)`| `NOT NULL` | Tên sản phẩm |
| `price` | `DECIMAL(18,2)`| `NOT NULL` | Giá bán lẻ của sản phẩm |
| `stock_quantity`|`INT` | `NOT NULL` | Số lượng sản phẩm còn trong kho |
| `image` | `VARCHAR(255)`| `NULL` | Ảnh đại diện của sản phẩm |
| `description` | `TEXT` | `NULL` | Mô tả chi tiết cấu hình sản phẩm |
| `status` | `BIT` | `NOT NULL`, `DEFAULT 1` | Trạng thái hiển thị (`1`: Hoạt động, `0`: Ẩn) |
| `category_id` | `BIGINT` | `FOREIGN KEY` -> `categories` | Liên kết với danh mục sản phẩm |

### 5. Bảng `shipping_addresses` (Địa chỉ nhận hàng)
*   Mỗi khách hàng có thể lưu nhiều địa chỉ giao hàng khác nhau.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `address_id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Mã địa chỉ |
| `customer_id` | `BIGINT` | `FOREIGN KEY` -> `customers` | Liên kết với khách hàng sở hữu |
| `contact_name`| `VARCHAR(100)`| `NOT NULL` | Tên người nhận hàng |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Số điện thoại nhận hàng |
| `specific_address`|`VARCHAR(255)`|`NOT NULL` | Số nhà, ngõ ngách, tỉnh thành cụ thể |
| `is_default` | `BIT` | `DEFAULT 0` | Địa chỉ mặc định (`1`: Có, `0`: Không) |

### 6. Bảng `orders` (Đơn hàng)
*   Lưu trữ thông tin tổng quát của giao dịch mua sắm.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `order_id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Mã đơn hàng |
| `customer_id` | `BIGINT` | `FOREIGN KEY` -> `customers` | Liên kết với khách hàng đặt |
| `address_id` | `BIGINT` | `FOREIGN KEY` -> `shipping_addresses` | Liên kết với thông tin địa chỉ giao nhận |
| `order_date` | `DATETIME` | `NOT NULL` | Ngày giờ khởi tạo đơn hàng |
| `total_amount`| `DECIMAL(18,2)`|`NOT NULL` | Tổng tiền thanh toán đơn hàng |
| `status` | `VARCHAR(50)` | `NOT NULL` | Trạng thái đơn hàng: `Chờ duyệt`, `Đang giao`, `Đã giao`, `Đã hủy` |
| `note` | `TEXT` | `NULL` | Ghi chú từ khách hàng |

### 7. Bảng `order_details` (Chi tiết đơn hàng)
*   Bảng trung gian thể hiện chi tiết từng mặt hàng và số lượng nằm trong một đơn hàng.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `order_detail_id`|`BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Mã chi tiết đơn hàng |
| `order_id` | `BIGINT` | `FOREIGN KEY` -> `orders` | Thuộc về đơn hàng nào |
| `product_id` | `BIGINT` | `FOREIGN KEY` -> `products` | Liên kết với sản phẩm đặt |
| `quantity` | `INT` | `NOT NULL` | Số lượng sản phẩm mua |
| `total_price` | `DECIMAL(18,2)`|`NOT NULL` | Thành tiền của sản phẩm đó (`Đơn giá * Số lượng`) |
| `description` | `VARCHAR(255)`| `NULL` | Ghi chú/Mô tả phụ cho dòng hàng |

### 8. Bảng `banners` (Banner quảng cáo)
*   Lưu trữ hình ảnh quảng cáo hiển thị slide trình chiếu đầu trang chủ.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `banner_id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Mã banner |
| `title` | `VARCHAR(255)`| `NOT NULL` | Tiêu đề banner |
| `image_url` | `VARCHAR(255)`| `NOT NULL` | Đường dẫn tệp ảnh banner |
| `link_url` | `VARCHAR(255)`| `NULL` | Đường dẫn liên kết khi nhấn vào banner |
| `status` | `BIT` | `NOT NULL`, `DEFAULT 1` | Trạng thái kích hoạt hiển thị |

### 9. Bảng `category_posts` (Danh mục tin tức)
*   Lưu trữ các phân loại danh mục cho các bài viết.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `category_post_id`|`BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Mã danh mục tin |
| `name` | `VARCHAR(100)`| `NOT NULL` | Tên danh mục tin tức |
| `description` | `VARCHAR(255)`| `NULL` | Mô tả về danh mục tin |

### 10. Bảng `posts` (Bài viết / Tin tức)
*   Các bài viết công nghệ, tư vấn chọn laptop, khuyến mãi.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `post_id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Mã bài viết |
| `title` | `VARCHAR(255)`| `NOT NULL` | Tiêu đề bài viết |
| `summary` | `VARCHAR(500)`| `NOT NULL` | Tóm tắt nội dung bài viết |
| `content` | `TEXT` | `NOT NULL` | Nội dung đầy đủ bài viết |
| `image` | `VARCHAR(255)`| `NULL` | Ảnh đại diện bài viết |
| `created_date`| `DATETIME` | `NOT NULL` | Ngày tạo bài viết |
| `category_post_id`|`BIGINT` | `FOREIGN KEY` -> `category_posts` | Thuộc danh mục bài viết nào |

---

## 🚀 Các Tính Năng Đã Hoàn Thiện

Hệ thống đã được nâng cấp đồng bộ các tính năng cao cấp phục vụ trải nghiệm người dùng và quản lý:

### 1. Phân hệ Cửa hàng (Customer Storefront)
*   **Trang chủ Hiện đại**:
    *   Khung banner trình chiếu (Swiper Slider) thiết kế tỷ lệ vàng 380px máy tính / 180px điện thoại, bo góc tròn và đổ bóng mịn.
    *   Tích hợp công nghệ **Lớp phủ nền mờ (Blurred Background)** cho phép tự động căn giữa các ảnh banner nhỏ mà không gây vỡ/méo hình. Toàn bộ banner đóng vai trò là liên kết điều hướng nhấp chọn trực tiếp.
    *   Tiêu đề banner được hiển thị bằng một badge kính mờ (glassmorphism) tinh tế ở góc dưới lề trái.
    *   Các khu vực **Sản phẩm mới nhất** và **Sản phẩm bán chạy nhất** được truy xuất động trực tiếp từ cơ sở dữ liệu.
*   **Thẻ sản phẩm chuẩn E-Commerce**:
    *   Lưới sản phẩm căn chỉnh thẳng tắp bằng Flexbox, tiêu đề giới hạn tối đa 2 dòng (`height: 2.8em`) giúp tránh hoàn toàn hiện tượng lệch dòng.
    *   Hỗ trợ hai nút bấm song song: **Mua ngay** (tự động thêm vào giỏ và chuyển hướng tới trang thanh toán) và **Thêm vào giỏ** (icon xe đẩy nhỏ gọn).
    *   Tự động đồng bộ số lượng tồn kho: Nút bấm chuyển trạng thái thành "Hết hàng" hoặc "Đạt tối đa" khi vượt quá số lượng trong kho.
*   **Quản lý Giỏ hàng & Kho hàng**:
    *   Kiểm tra số lượng tồn kho thời gian thực ở cả trang ngoài, giỏ hàng phụ (drawer) và trang thanh toán.
    *   Hiệu ứng chuyển động (Animation) cho giỏ hàng trống: Icon xe đẩy nhấp nhô bồng bềnh (`float`) kết hợp vòng tròn phát sáng lan tỏa (`pulse-glow`) cực kỳ bắt mắt.
*   **Gửi Email tự động (SMTP Gmail)**:
    *   **Quên mật khẩu**: Khách hàng chỉ cần điền Email đăng ký, hệ thống tự động sinh ngẫu nhiên mật khẩu tạm thời 8 ký tự, mã hóa lưu vào DB và gửi thư thông báo về email của khách.
    *   **Đặt hàng thành công**: Gửi email hóa đơn dạng bảng HTML sang trọng chi tiết thông tin đơn hàng, thông tin giao nhận và danh sách sản phẩm kèm giá tiền VND.
*   **Quản lý Đơn hàng cá nhân**:
    *   Xem lịch sử đơn hàng, chi tiết sản phẩm đã đặt và hỗ trợ nút **Hủy đơn hàng** trực tiếp khi đơn hàng đang ở trạng thái "Chờ duyệt" (tự động hoàn lại số lượng tồn kho sản phẩm).

### 2. Phân hệ Quản trị (Admin Dashboard)
*   **Quản lý đơn hàng nâng cao**:
    *   Xem danh sách, lọc trạng thái, cập nhật trạng thái đơn hàng.
    *   Nút "Chỉnh sửa" được đưa vào bên trong Modal xem chi tiết để bố cục bảng tinh gọn hơn.
    *   Hỗ trợ tăng giảm số lượng sản phẩm, cập nhật tổng tiền trực tiếp hoặc xóa sản phẩm trong đơn hàng.
*   **Quản lý Banner**:
    *   Loại bỏ hoàn toàn trường `position` không dùng đến trên cả giao diện Admin, Backend Model, Service và cơ sở dữ liệu để tinh gọn hóa dữ liệu.

---

## 🛠️ Hướng Dẫn Cấu Hình & Cài Đặt

### 1. Cấu hình cơ sở dữ liệu & Email (Backend)
Mở file [application.yml](src/main/resources/application.yml) và cập nhật các thông số kết nối:

```yaml
spring:
  # Cấu hình Cơ sở dữ liệu MySQL
  datasource:
    url: jdbc:mysql://localhost:3306/spring_demo?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
    username: MSI         
    password:               

  # Cấu hình SMTP gửi thư (Dành cho quên mật khẩu & đặt hàng)
  mail:
    host: smtp.gmail.com
    port: 587
    username: vutranit04@gmail.com   # Email gửi thư
    password: dwfacvtomlhfllcb       # Mật khẩu ứng dụng (App Password) của Gmail
```

---

## 🏃 Hướng Dẫn Chạy Dự Án

### Bước 1: Khởi chạy Backend (Spring Boot)
Di chuyển vào thư mục gốc của dự án và chạy lệnh sau bằng PowerShell hoặc CMD:
```bash
# Sử dụng Maven Wrapper đi kèm dự án để chạy
.\mvnw.cmd spring-boot:run
```
*   Ứng dụng Backend sẽ chạy tại cổng: `http://localhost:8080`
*   Giao diện Swagger tài liệu API: `http://localhost:8080/swagger-ui/index.html`

### Bước 2: Khởi chạy Trang Cửa hàng (`minhvu-store`)
Mở một terminal mới, di chuyển vào thư mục `minhvu-store` và chạy:
```bash
cd minhvu-store
npm run dev
```
*   Ứng dụng Cửa hàng dành cho khách hàng sẽ chạy tại: `http://localhost:5173`

### Bước 3: Khởi chạy Trang Quản trị (`admin-dashboard`)
Mở một terminal mới, di chuyển vào thư mục `admin-dashboard` và chạy:
```bash
cd admin-dashboard
npm run dev
```
*   Giao diện trang quản lý của Admin sẽ chạy tại: `http://localhost:5174`

---

## 🗄️ Cấu Trúc Thư Mục Chính

```
spring-demo/
│
├── src/main/java/com/minhvu/spring_demo/  <-- Backend Java Source Code
│   ├── controller/      # REST API Controllers (Customer, Product, Order, Banner...)
│   ├── entity/          # JPA Entities (Customer, Product, Order, OrderDetail...)
│   ├── repository/      # Spring Data JPA Repositories
│   └── service/         # Business Logic (OrderService, EmailService, BannerService...)
│
├── src/main/resources/
│   └── application.yml  # File cấu hình MySQL, Mail SMTP, Port, JWT...
│
├── minhvu-store/        # Phân hệ khách hàng (React.js Frontend)
│   ├── src/components/  # Layouts (Header, Footer, ProductCard, BannerSlider...)
│   ├── src/pages/       # Pages (HomePage, CartPage, ForgotPasswordPage, RegisterPage...)
│   └── src/App.css      # Custom stylesheet chính cho toàn store
│
└── admin-dashboard/     # Phân hệ quản trị (React.js Admin Dashboard)
    ├── src/components/  # Views quản lý (OrdersView, BannersView, CustomersView...)
    └── src/App.jsx      # Thiết lập routing quản trị
```

---

## 🔒 Tài Khoản Demo Mặc Định
*   **Trang Admin**: Truy cập `http://localhost:5174/` đăng nhập với tài khoản admin hệ thống.
*   **Đăng nhập khách hàng**: Trên trang `minhvu-store`, có thể đăng ký tài khoản mới hoặc đăng nhập bằng Email khách hàng đã tồn tại (hệ thống tự động đồng bộ). Mật khẩu phục hồi qua email sẽ được gửi trực tiếp đến địa chỉ email đăng ký.
