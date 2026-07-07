# 🏥 Med Clinical - Frontend (Hệ thống Quản lý Phòng Khám)

Đây là kho lưu trữ mã nguồn Frontend cho Hệ thống Quản lý Phòng Khám (Med Clinical) - Đồ án tốt nghiệp.

## 🚀 Công nghệ sử dụng
- **ReactJS (TypeScript)** với **Vite** (Build tool siêu tốc)
- **Tailwind CSS** (Tùy biến Giao diện)
- **React Router DOM** (Điều hướng trang)
- **Zustand** (Quản lý State toàn cục cho Authentication)
- **TanStack React Query** (Quản lý trạng thái fetching dữ liệu từ API)
- **React Hook Form** (Quản lý biểu mẫu)
- **Lucide React** (Bộ icon hiện đại)

## ✨ Các tính năng chính
- **Giao diện thân thiện (Responsive UI):** Giao diện tương thích trên cả máy tính và thiết bị di động (Mobile Menu).
- **Luồng đặt lịch (Booking Flow):** Bệnh nhân có thể tìm kiếm bác sĩ, xem chi tiết và tiến hành đặt lịch thông qua các màn hình dạng Stepper (Từng bước).
- **Xử lý mượt mà khi lỗi đặt lịch:** Tích hợp logic xử lý mã lỗi HTTP 400 từ Backend, tự động tải lại danh sách giờ rảnh nếu có người khác đặt trùng lịch.
- **Tích hợp Chatbot AI:** Một Widget Chatbot nằm góc màn hình giúp người dùng tương tác với trợ lý ảo y tế.
- **Trang Dashboard đa quyền hạn:** Giao diện thay đổi tự động tương ứng dựa theo vai trò đăng nhập: Bệnh nhân (Patient), Bác sĩ (Doctor), và Quản trị viên (Admin).

## 🛠 Cách Cài đặt và Chạy dự án

1. **Clone dự án về máy:**
   ```bash
   git clone <url-repository>
   cd clinic-management
   ```

2. **Cài đặt các gói thư viện (Dependencies):**
   ```bash
   npm install
   # hoặc dùng yarn: yarn install
   ```

3. **Cấu hình Biến môi trường:**
   Đảm bảo cấu hình đường dẫn API trỏ về Backend ASP.NET Core của bạn (Thông thường tại `http://localhost:5000` hoặc tương tự).

4. **Chạy dự án trên máy phát triển (Dev Server):**
   ```bash
   npm run dev
   ```
   *Mở trình duyệt và truy cập vào link (thường là `http://localhost:5173`).*

5. **Build cho môi trường Production:**
   ```bash
   npm run build
   ```

## 📈 Kiến trúc thư mục (Gitflow)
Dự án được quản lý theo mô hình **Gitflow Workflow**:
- `main` / `master`: Nhánh chứa code hoàn thiện, dùng để release.
- `develop`: Nhánh gom các tính năng chuẩn bị release.
- `feature/*`: Các nhánh con dùng để phát triển các tính năng riêng lẻ (VD: `feature/optimistic-concurrency-booking`).
