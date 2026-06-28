# DANH SÁCH CÁC THƯ VIỆN & CÔNG NGHỆ CHÍNH TRONG DỰ ÁN

Tài liệu này giải thích rõ ràng **mục đích sử dụng của từng thư viện (package)** được cài đặt trong dự án để bạn nắm vững khi hội đồng hỏi "Code này dùng thư viện gì để chạy?".

---

## 1. THƯ VIỆN BACKEND (C# ASP.NET Core 9.0)
*(Xem file `DoAnToNghiep.csproj`)*

*   **`Microsoft.EntityFrameworkCore.SqlServer` (v9.0)**: Thư viện ORM cốt lõi. Giúp viết code C# thao tác với cơ sở dữ liệu thay vì phải viết các câu lệnh SQL thuần (SELECT, INSERT) thủ công.
*   **`Microsoft.AspNetCore.Identity.EntityFrameworkCore` (v9.0)**: Thư viện quản lý Người dùng & Phân quyền. Xử lý toàn bộ logic: Đăng ký, Đăng nhập, Băm (Hash) mật khẩu và cấp quyền (Role Admin, Doctor, Patient).
*   **`Microsoft.AspNetCore.Authentication.JwtBearer` (v9.0)**: Thư viện tạo và xác thực Token JWT. Giúp bảo mật API, chặn những ai chưa đăng nhập không cho phép truy cập.
*   **`AutoMapper` (v13.0)**: Thư viện copy dữ liệu. Dùng để tự động "đổ" dữ liệu từ `Model` gốc (có chứa thông tin nhạy cảm) sang `DTO` (đối tượng an toàn trả về cho Frontend) siêu nhanh gọn.
*   **`FluentValidation` (v12.1)**: Thư viện kiểm tra tính hợp lệ của dữ liệu đầu vào. Ví dụ: Bắt buộc email phải đúng định dạng, mật khẩu phải dài hơn 6 ký tự ngay tại tầng Backend.
*   **`Serilog.AspNetCore` (v9.0)**: Thư viện ghi log (nhật ký hệ thống). Giúp lưu lại lỗi hoặc lịch sử truy cập ra file `.txt` hoặc cửa sổ console để dễ debug.
*   **`MailKit` (v4.16)**: Thư viện dùng để gửi Email tự động (Ví dụ: gửi email nhắc lịch khám).
*   **`Swashbuckle.AspNetCore` (v6.9)**: Thư viện tạo giao diện Swagger. Tự động sinh ra tài liệu API (API Documentation) và giao diện test API trên trình duyệt.

---

## 2. THƯ VIỆN FRONTEND (ReactJS & TypeScript)
*(Xem file `package.json`)*

### Nhóm Giao diện (UI & Styling)
*   **`tailwindcss` (v3.4)**: Thư viện viết CSS nhanh. Cung cấp các class dựng sẵn (như `p-4`, `text-center`, `md:flex`) để style trực tiếp trong HTML thay vì tạo file CSS rời.
*   **`lucide-react`**: Bộ thư viện cung cấp các Icon vector (SVG) đẹp mắt, nhẹ và hiện đại dùng xuyên suốt các nút bấm của web.
*   **`@radix-ui/react-...`**: Các thư viện làm component nâng cao (Modal, Dropdown, Select). Nó xử lý các chức năng phức tạp như nhấn ra ngoài thì tắt pop-up, tính toán vị trí hiển thị hợp lý.
*   **`react-hot-toast`**: Thư viện hiển thị thông báo "Nổi" (Toast Notification) ở góc màn hình (ví dụ báo màu xanh khi "Đăng nhập thành công").

### Nhóm Xử lý Data & State (Logic)
*   **`@tanstack/react-query` (v5.56)**: Thư viện "thần thánh" chuyên dùng gọi API. Nó giúp hiển thị tự động trạng thái `Đang tải (Loading)`, lưu cache dữ liệu để web chạy siêu mượt, và tự động gọi lại API khi dữ liệu thay đổi.
*   **`zustand` (v4.5)**: Thư viện quản lý biến toàn cục (Global State). Dùng để lưu trữ thông tin User đang đăng nhập, giúp mọi trang trong React đều có thể biết được User là ai.
*   **`axios`**: Thư viện gửi HTTP Request (GET, POST, PUT, DELETE) lên Backend ASP.NET Core. Thay thế cho hàm `fetch` mặc định vì nó dễ dùng hơn.

### Nhóm Xử lý Form
*   **`react-hook-form`**: Thư viện quản lý Form nhập liệu. Tránh tình trạng web bị giật (lag) khi người dùng gõ chữ vào các ô input dài như Hồ sơ bệnh án.
*   **`zod`**: Thư viện bắt lỗi (Validation) trên Frontend. Kết hợp với Hook Form để báo chữ màu đỏ nếu user quên nhập trường bắt buộc.

### Nhóm Tiện ích khác
*   **`react-router-dom`**: Thư viện chuyển trang (Routing) không cần tải lại trình duyệt. Tạo cảm giác mượt mà như dùng App điện thoại (SPA - Single Page Application).
*   **`date-fns`**: Thư viện tính toán ngày tháng năm. Dùng để xử lý các lịch hẹn (cộng trừ giờ, hiển thị đúng định dạng DD/MM/YYYY).
*   **`@tiptap/react`**: Thư viện Text Editor. Cung cấp thanh công cụ soạn thảo văn bản (In đậm, In nghiêng) cho Bác sĩ khi họ viết bài báo y khoa.

---

## 3. THƯ VIỆN & CÔNG NGHỆ BỔ TRỢ (AI Chatbot)
*   **Google Gemini API**: Gói API trí tuệ nhân tạo (LLM). Backend gọi API này để lấy phản hồi câu hỏi y tế từ AI, đồng thời dùng chức năng **Function Calling** để bảo AI tự động ra quyết định Hủy lịch hẹn thay cho con người.
*   **Web Speech API (Trình duyệt gốc)**: Công nghệ nhận diện giọng nói (Speech-to-Text) có sẵn của trình duyệt. Không cần cài thêm thư viện ngoài, giúp bệnh nhân thu âm thẳng qua micro điện thoại/máy tính để hỏi AI.