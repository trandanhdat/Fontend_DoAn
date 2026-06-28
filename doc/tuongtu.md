# Phân tích chức năng hệ thống dựa trên mã nguồn thực tế

Dựa trên việc phân tích cấu trúc mã nguồn Backend (ASP.NET Core) và Frontend (ReactJS), hệ thống Quản lý phòng khám đã được xây dựng và triển khai hoàn thiện với các phân hệ chức năng lõi như sau. Các chức năng dưới đây đều được ánh xạ trực tiếp từ các Controller (API) và Pages (Giao diện người dùng) trong mã nguồn.

## 1. Phân hệ Xác thực và Định danh (Authentication Module)
Hệ thống triển khai cơ chế xác thực dựa trên JSON Web Token (JWT) thông qua `AuthController`. Các chức năng trên giao diện (`src/pages/auth`) bao gồm:
*   **Đăng nhập (LoginPage):** Cho phép người dùng xác thực thông tin. Hệ thống tự động phân luồng (Routing) người dùng về các Dashboard tương ứng dựa trên vai trò (Role: Patient, Doctor, Admin, Receptionist).
*   **Đăng ký (RegisterPage):** Cho phép bệnh nhân mới tạo tài khoản truy cập.
*   **Quản lý Mật khẩu:** Hỗ trợ tính năng "Quên mật khẩu" (`ForgotPasswordPage`) và "Đặt lại mật khẩu" (`ResetPasswordPage`) qua luồng xác thực an toàn.

## 2. Phân hệ Khách (Guest) và Bệnh nhân (Patient Module)
Bệnh nhân là đối tượng trung tâm của hệ thống với các nghiệp vụ tự phục vụ toàn diện (`src/pages/patient` và `src/pages/public`).

**Nhóm chức năng Tra cứu công khai (Public):**
*   **Tra cứu Bác sĩ & Chuyên khoa:** Hiển thị danh sách bác sĩ (`DoctorListPage`), chi tiết hồ sơ năng lực của bác sĩ (`DoctorDetailPage`) và phân loại theo chuyên khoa (`SpecialtyListPage`).
*   **Cổng thông tin Y tế:** Bệnh nhân có thể xem các tin tức, bài viết chuyên môn do bác sĩ biên soạn (`ArticleListPage`, `ArticleDetailPage`).

**Nhóm chức năng Dành cho Bệnh nhân đã đăng nhập:**
*   **Đặt lịch khám trực tuyến:** Hệ thống hỗ trợ đặt lịch linh hoạt (Booking) theo Bác sĩ hoặc Chuyên khoa mong muốn (`BookAppointmentPage`, `GeneralBookingPage`). Thời gian hiển thị được lấy trực tiếp từ lịch trống thực tế của bác sĩ.
*   **Quản lý lịch hẹn:** Bệnh nhân theo dõi trạng thái các lịch hẹn (`MyAppointments`), xem chi tiết (`AppointmentDetailPage`) và có quyền hủy lịch hẹn khi chưa được hệ thống đưa vào trạng thái xử lý.
*   **Hồ sơ sức khỏe điện tử:** Xem lại toàn bộ lịch sử khám bệnh, bao gồm chẩn đoán, đơn thuốc và lời dặn từ bác sĩ (`MedicalHistoryPage`). Dữ liệu được truy xuất qua `MedicalRecordController`.
*   **Quản lý tài khoản:** Cập nhật thông tin cá nhân, ảnh đại diện (`ProfilePage`).

## 3. Phân hệ Bác sĩ (Doctor Module)
Giao diện dành riêng cho Bác sĩ (`src/pages/doctor`) tập trung vào công tác chuyên môn và quản lý thời gian.
*   **Quản lý Lịch làm việc (DoctorSchedulePage):** Cho phép bác sĩ chủ động thiết lập, mở hoặc đóng các khung giờ khám bệnh (Time slots) trong tuần. Dữ liệu này trực tiếp quyết định thời gian bệnh nhân có thể đặt lịch.
*   **Quản lý Cuộc hẹn (DoctorAppointmentsPage):** Theo dõi danh sách bệnh nhân đã đặt lịch thành công với mình theo từng ngày.
*   **Quản lý Bệnh án (Medical Records):** Đây là nghiệp vụ lõi. Bác sĩ tiến hành khám, ghi nhận chẩn đoán, kê đơn thuốc và hẹn ngày tái khám (`CreateMedicalRecordPage`, `PatientRecordsPage`).
*   **Xuất bản nội dung:** Bác sĩ có quyền đóng góp kiến thức chuyên môn thông qua việc tạo và quản lý các bài viết y tế (`DoctorArticlesPage`).

## 4. Phân hệ Lễ tân và Quản trị viên (Admin/Reception Module)
Đây là phân hệ vận hành và quản lý tổng thể (`src/pages/admin`).
*   **Nghiệp vụ Lễ tân (ReceptionPage):** Nơi nhân viên Lễ tân tiếp nhận, xác nhận (Duyệt) hoặc từ chối các lịch hẹn mới từ bệnh nhân. Giao diện được thiết kế tối ưu với các Modal xử lý nhanh (`ReceptionModals`).
*   **Quản trị Người dùng:** Thêm, sửa, xóa, phân quyền và khóa tài khoản của bệnh nhân, bác sĩ hoặc nhân viên khác (`UserManagementPage`, `DoctorManagementPage`).
*   **Quản lý Danh mục Y tế:** Quản trị viên trực tiếp duy trì dữ liệu hệ thống bao gồm danh sách Chuyên khoa (`SpecialtyManagementPage`) và Bảng giá Dịch vụ (`ServiceManagementPage`).
*   **Thống kê & Báo cáo:** Cung cấp bảng điều khiển (`AdminDashboardPage`) hiển thị các chỉ số hoạt động tổng quan của phòng khám.

## 5. Tích hợp Trí tuệ nhân tạo (AI Chatbot Integration)
Đây là tính năng nâng cao nổi bật của hệ thống. Dựa trên `ChatbotWidget.tsx` (Frontend) và `ChatbotController.cs` (Backend):
*   **Hỗ trợ đa phương thức:** Tích hợp Web Speech API cho phép người dùng giao tiếp với Chatbot bằng giọng nói (Voice-to-text) hoặc văn bản.
*   **Xử lý bằng LLM (Google Gemini):** AI có khả năng hiểu ngữ cảnh, tư vấn chọn chuyên khoa phù hợp với triệu chứng.
*   **Thao tác tự động (Function Calling):** AI có khả năng truy xuất cơ sở dữ liệu để tìm kiếm lịch trống và tự động gọi hàm thay đổi trạng thái (Ví dụ: Hủy lịch hẹn) ngay trong khung chat mà không cần người dùng thao tác tay.

*Lưu ý: Tất cả các chức năng trên đều được xác nhận có tồn tại giao diện Frontend tương ứng, được kết nối với Backend API và thao tác trực tiếp với cơ sở dữ liệu SQL Server.*