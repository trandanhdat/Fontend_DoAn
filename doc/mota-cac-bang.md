# Mô Tả Cơ Bản Các Bảng Dữ Liệu (Database Tables Description)

Dưới đây là mô tả ngắn gọn, súc tích về vai trò của từng bảng trong cơ sở dữ liệu để bạn có thể sử dụng đưa vào báo cáo đồ án:

## 1. Nhóm Quản lý Người Dùng & Phân Quyền
- **`ApplicationUser`**: Bảng gốc quản lý thông tin tài khoản dùng để đăng nhập hệ thống. Chứa các thông tin cơ bản: Tên, Email, Mật khẩu (đã mã hóa Hash), Số điện thoại, và trạng thái xác thực.
- **`ApplicationRole`**: Bảng quản lý các vai trò phân quyền trong hệ thống (VD: Admin, Doctor, Patient).
- **`RefreshToken`**: Bảng lưu trữ mã thông báo làm mới (refresh token), giúp duy trì phiên đăng nhập bảo mật và tự động cấp lại phiên làm việc mà không cần bắt người dùng đăng nhập lại liên tục.

## 2. Nhóm Đối tượng Y Tế (Hồ Sơ)
- **`Doctor`**: Bảng mở rộng từ `ApplicationUser`, chuyên lưu trữ hồ sơ nghiệp vụ của Bác sĩ. Bao gồm: số giấy phép hành nghề, bằng cấp, số năm kinh nghiệm, phí tư vấn và điểm đánh giá trung bình.
- **`Patient`**: Bảng mở rộng từ `ApplicationUser`, lưu trữ thông tin y tế nền tảng của Bệnh nhân như: ngày sinh, nhóm máu, tiền sử dị ứng, các bệnh mãn tính và thông tin người liên hệ khẩn cấp.

## 3. Nhóm Dịch Vụ & Chuyên Khoa
- **`Specialty`**: Bảng danh mục các Chuyên khoa y tế (ví dụ: Khoa Nhi, Răng Hàm Mặt, Da liễu, Tâm lý học).
- **`Service`**: Bảng quản lý danh sách các Dịch vụ khám bệnh cụ thể thuộc về các Chuyên khoa, quy định rõ mức giá và thời lượng khám của từng dịch vụ.

## 4. Nhóm Quản lý Lịch Khám & Cuộc Hẹn
- **`DoctorSchedule`**: Bảng cấu hình khung thời gian làm việc cố định hàng tuần của bác sĩ (ví dụ: Thứ 2 từ 8h-12h).
- **`TimeSlot`**: Các ca khám / khung giờ cụ thể được sinh ra từ Lịch làm việc để bệnh nhân có thể chọn và đặt chỗ. Giúp tránh việc đặt trùng giờ nhau.
- **`Appointment`**: **Bảng trung tâm của hệ thống**. Lưu trữ chi tiết một Cuộc hẹn khám bệnh: kết nối Bệnh nhân với Bác sĩ, đặt tại Khung giờ nào, dùng Dịch vụ gì, và theo dõi trạng thái hiện tại (Chờ xác nhận, Đã hoàn thành, Đã hủy).

## 5. Nhóm Kết Quả & Phản Hồi
- **`MedicalRecord`**: Hồ sơ bệnh án điện tử. Được sinh ra sau khi kết thúc cuộc hẹn, chứa các thông tin do bác sĩ điền vào: Chẩn đoán, Triệu chứng, Hướng điều trị, và Ngày tái khám.
- **`Review`**: Bảng lưu trữ điểm đánh giá (1-5 sao) và nhận xét của bệnh nhân dành cho bác sĩ sau khi trải nghiệm xong cuộc hẹn.

## 6. Nhóm Thông Tin & Truyền Thông (Tin tức / AI)
- **`Article`**: Bảng lưu trữ các Bài viết, Tin tức, Cẩm nang y khoa do bác sĩ hoặc quản trị viên viết để chia sẻ kiến thức.
- **`ArticleView`**: Bảng thống kê chi tiết lượt truy cập của người dùng vào các bài viết (để đếm view và phân tích dữ liệu).
- **`ChatbotLog`**: Bảng ghi lại lịch sử trò chuyện giữa người dùng và Trợ lý ảo (Chatbot AI). Giúp phân tích ý định người dùng và cải thiện chất lượng AI.

## 7. Nhóm Hệ Thống Cơ Sở (Hỗ trợ)
- **`EmailLog`**: Bảng ghi nhận lịch sử và trạng thái của các Email tự động được hệ thống phát đi (vd: Email khôi phục mật khẩu, Email nhắc lịch khám).
- **`Notification`**: Bảng quản lý các thông báo trong ứng dụng (In-app notification) để báo cho người dùng biết khi có lịch hẹn mới, có kết quả khám, v.v.
