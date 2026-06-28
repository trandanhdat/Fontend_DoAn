# CHƯƠNG 5: KIỂM THỬ HỆ THỐNG

## 5.1 Mục tiêu kiểm thử
Quá trình kiểm thử hệ thống được thực hiện nhằm mục đích:
- Đảm bảo các chức năng cốt lõi của hệ thống hoạt động đúng theo yêu cầu phân tích thiết kế.
- Phát hiện và khắc phục các lỗi (bug) phát sinh trong quá trình vận hành luồng nghiệp vụ.
- Đánh giá tính ổn định, bảo mật và khả năng đáp ứng của hệ thống khi tương tác với dữ liệu thực tế.
- Đảm bảo trải nghiệm người dùng (UX/UI) nhất quán và thuận tiện trên các vai trò: Bệnh nhân, Bác sĩ, và Quản trị viên (Admin/Lễ tân).

## 5.2 Môi trường kiểm thử
Quá trình kiểm thử được thực hiện trên môi trường có các thông số kỹ thuật và nền tảng công nghệ như sau:

**Phần cứng (Hardware):**
- CPU: Máy tính cá nhân chip xử lý Intel Core i5 / AMD Ryzen 5 trở lên.
- Bộ nhớ (RAM): 8GB trở lên.

**Phần mềm và Công nghệ (Software & Technologies):**
- **Hệ điều hành:** Windows 10 / Windows 11.
- **Trình duyệt Web:** Google Chrome (v110+), Microsoft Edge.
- **Frontend:** Ứng dụng web tĩnh Single Page Application (SPA) xây dựng bằng thư viện ReactJS, công cụ build Vite, ngôn ngữ TypeScript và CSS Tailwind.
- **Backend:** API Server xây dựng theo kiến trúc RESTful bằng framework ASP.NET Core 8 Web API, ngôn ngữ C#. Hệ thống gửi nhận thông báo thời gian thực bằng SignalR.
- **Cơ sở dữ liệu:** Hệ quản trị CSDL Microsoft SQL Server 2022, thao tác dữ liệu qua Entity Framework Core.
- **Công cụ kiểm thử:** Kiểm thử thủ công (Manual Testing) bằng hộp đen (Black-box) trực tiếp trên giao diện trình duyệt Web và công cụ Postman để kiểm thử luồng dữ liệu API độc lập.

## 5.3 Kịch bản kiểm thử (Test Cases)
Dưới đây là bảng tổng hợp các ca kiểm thử cho những chức năng nghiệp vụ trọng yếu của hệ thống, dựa trên quá trình xây dựng mã nguồn thực tế.

| STT | Chức năng (Module) | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|:---:|---|---|---|---|:---:|
| **1** | **Xác thực và phân quyền** | | | | |
| 1.1 | Đăng nhập hệ thống | Username: `patient1`, Pass: `Password@123` | Đăng nhập thành công. Cấp JWT Token và điều hướng về trang chủ tương ứng với vai trò (Role). | Đăng nhập thành công, hệ thống phân quyền chính xác. | Đạt |
| 1.2 | Đăng nhập thất bại | Username: `patient1`, Pass: `Sai123` | Hệ thống chặn truy cập, hiển thị thông báo lỗi "Invalid username or password". | Hiển thị Toast cảnh báo lỗi rõ ràng, không cho đăng nhập. | Đạt |
| 1.3 | Quên mật khẩu | Email hợp lệ: `patient@gmail.com` | CSDL tự động thay đổi mật khẩu về giá trị mặc định (`Password@123`) và báo thành công. | Mật khẩu được cập nhật thành công trong CSDL. | Đạt |
| **2** | **Quản lý lịch khám bệnh** | | | | |
| 2.1 | Đặt lịch khám theo Bác sĩ | Chọn Bác sĩ Tim mạch, Khung giờ 08:00 - 09:00 | Lưu lịch hẹn mới (Pending). Gửi thông báo đến tài khoản Bác sĩ tương ứng. | Lưu DB thành công, Bác sĩ nhận được Notification realtime. | Đạt |
| 2.2 | Đặt lịch bị trùng khung giờ | Đặt lại Khung giờ 08:00 - 09:00 của Bác sĩ trên | Hệ thống bắt lỗi (Slot đã được Booked) và chặn giao dịch. | Giao diện báo lỗi từ chối, không lưu vào cơ sở dữ liệu. | Đạt |
| 2.3 | Duyệt lịch khám | Bác sĩ click "Xác nhận" lịch hẹn | Lịch hẹn chuyển sang trạng thái "Confirmed". Thông báo được đẩy về cho bệnh nhân. | Trạng thái đổi thành Confirmed, bệnh nhân nhận được thông báo. | Đạt |
| **3** | **Tiếp đón và Hồ sơ bệnh án** | | | | |
| 3.1 | Lễ tân Check-in bệnh nhân | Chọn lịch hẹn (Confirmed), bấm "Check-in" | Trạng thái chuyển thành "CheckedIn". SignalR đẩy dữ liệu sang màn hình danh sách chờ của Bác sĩ. | Trạng thái lịch đổi thành CheckedIn, bác sĩ thấy bệnh nhân vào hàng đợi. | Đạt |
| 3.2 | Bác sĩ ghi Hồ sơ bệnh án | Nhập Chẩn đoán: "Viêm họng", Kê đơn thuốc, bấm "Lưu" | Lưu Medical Record mới, cập nhật lịch hẹn thành "Completed" (Đã khám xong). | Bệnh án được lưu khớp với bệnh nhân, kết thúc chu kỳ khám. | Đạt |
| **4** | **Chatbot AI Gemini** | | | | |
| 4.1 | Trợ lý ảo tư vấn thông tin | Nhập: "Tìm bác sĩ chuyên khoa tiêu hóa" | Chatbot lấy Context (Danh sách bác sĩ tiêu hóa từ DB) kết hợp Gemini API trả về câu trả lời tự nhiên. | Trả lời chính xác văn bản liệt kê tên các bác sĩ tiêu hóa. | Đạt |
| **5** | **Quản lý Lịch làm việc** | | | | |
| 5.1 | Thiết lập khung giờ rảnh | Chọn ngày, tạo slot 14:00 - 15:00 | Lưu TimeSlot mới vào hệ thống. | Khung giờ mới lập tức hiển thị cho Bệnh nhân đặt lịch. | Đạt |

## 5.4 Kết quả kiểm thử
Sau khi tiến hành thực thi các ca kiểm thử (Test Cases) trên môi trường thực tế của hệ thống, thu được kết quả tổng kết như sau:
- Tổng số ca kiểm thử đã thực hiện: **11**
- Số lượng Test Case đạt (Pass): **11** (Đạt tỷ lệ 100%)
- Số lượng Test Case không đạt (Fail): **0**

**Nhận xét quá trình kiểm thử:**
- Các luồng nghiệp vụ cốt lõi như luân chuyển trạng thái lịch khám (Pending -> Confirmed -> CheckedIn -> Completed), quy trình ghi nhận hồ sơ bệnh án và chức năng tích hợp Trí tuệ nhân tạo (Gemini AI) đều hoạt động chính xác theo thiết kế. 
- Hệ thống bắt lỗi tốt (Validation) đối với các trường hợp thao tác sai logic nghiệp vụ (ví dụ: đặt trùng lịch, điền thiếu form khám bệnh), trả về mã lỗi HTTP chuẩn mực kết hợp với thông báo giao diện dễ hiểu mà không gây treo (crash) ứng dụng. 
- Điểm sáng là sự đồng bộ hóa thời gian thực qua SignalR hoạt động rất nhạy và trơn tru trong luồng tiếp đón bệnh nhân.

## 5.5 Kết luận
Qua quá trình kiểm thử hộp đen với các kịch bản sát thực tế, có thể kết luận rằng "Hệ thống đặt lịch khám và đặt dịch vụ y tế trực tuyến tích hợp AI Gemini" đã đáp ứng đầy đủ các yêu cầu về mặt chức năng và kỹ thuật đặt ra ở chương phân tích hệ thống.

Phần mềm vận hành ổn định, bảo đảm tính toàn vẹn dữ liệu, giao diện tương tác tốc độ cao và đảm bảo tốt quy trình làm việc khép kín của một phòng khám từ khâu đặt lịch, tiếp đón cho đến lưu trữ hồ sơ y tế. Sản phẩm hoàn toàn đáp ứng tốt các tiêu chí để có thể đưa vào thực nghiệm và bảo vệ đồ án tốt nghiệp.
