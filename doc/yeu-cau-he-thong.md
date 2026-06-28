### 3.2. Xác định yêu cầu hệ thống

#### 3.2.1. Yêu cầu chức năng
Dựa trên quy trình nghiệp vụ, em phân tích và thiết kế hệ thống với các chức năng cụ thể được phân chia theo 3 vai trò (Actor) chính: Bệnh nhân, Bác sĩ và Quản trị viên.

**1. Đối với Bệnh nhân (Patient)**
- **Tra cứu & Tương tác:** Xem danh sách chuyên khoa, dịch vụ, bác sĩ và đọc tin tức y khoa mà không cần đăng nhập. Tương tác với Chatbot AI để giải đáp thắc mắc cơ bản.
- **Quản lý tài khoản:** Đăng ký, đăng nhập và cập nhật hồ sơ cá nhân.
- **Đặt lịch & Quản lý lịch hẹn:** Chủ động chọn chuyên khoa, dịch vụ, bác sĩ và khung giờ trống để tạo lịch hẹn. Theo dõi danh sách lịch hẹn và có thể hủy/dời lịch theo quy định.
- **Theo dõi bệnh án & Phản hồi:** Tra cứu lại hồ sơ bệnh án, đơn thuốc sau khi khám và đánh giá (Review) chất lượng phục vụ của bác sĩ.
- **Nhận thông báo:** Nhận thông báo hệ thống và Email tự động về trạng thái đặt lịch.

**2. Đối với Bác sĩ (Doctor)**
- **Quản lý hồ sơ & Lịch làm việc:** Cập nhật thông tin chuyên môn cá nhân. Chủ động thiết lập lịch làm việc hàng tuần, mở/đóng các khung giờ khám.
- **Tiếp nhận khám bệnh:** Xem danh sách bệnh nhân đã đặt lịch trong ngày, quản lý quy trình khám (Chờ khám, Đang khám, Đã khám xong).
- **Cập nhật bệnh án:** Nhập kết quả chẩn đoán và đơn thuốc điện tử trực tiếp lên hệ thống lưu vào hồ sơ bệnh nhân.
- **Chia sẻ kiến thức:** Đăng tải các bài viết chuyên môn y khoa (chờ duyệt) lên hệ thống.

**3. Đối với Quản trị viên / Lễ tân (Admin)**
- **Quản lý danh mục & Tài khoản:** Thêm, sửa, xóa danh mục chuyên khoa, dịch vụ; và quản lý toàn bộ tài khoản người dùng (phân quyền, khóa/mở tài khoản).
- **Điều phối lịch hẹn (Nghiệp vụ Lễ tân):** Tiếp nhận và giám sát toàn bộ lịch hẹn của phòng khám. Hỗ trợ phân công lại bác sĩ (Assign Doctor) khi có sự cố đột xuất để đảm bảo quy trình khám trơn tru.
- **Kiểm duyệt nội dung:** Phê duyệt hoặc từ chối các bài viết do bác sĩ đăng tải.
- **Thống kê & Báo cáo:** Theo dõi biểu đồ doanh thu, tỷ lệ hoàn thành/hủy lịch hẹn và đánh giá hiệu suất của từng bác sĩ/chuyên khoa.

#### 3.2.2. Yêu cầu phi chức năng
- **Bảo mật & Phân quyền:** Phân quyền chặt chẽ thông qua chuẩn JWT (JSON Web Token). Mật khẩu người dùng bắt buộc mã hóa một chiều (Hash) để đảm bảo an toàn dữ liệu y tế.
- **Hiệu năng & Khả năng mở rộng:** Tốc độ phản hồi nhanh, chịu tải tốt và thiết kế theo kiến trúc chuẩn giúp dễ dàng bảo trì, nâng cấp thêm chức năng trong tương lai.
- **Tính sẵn sàng:** Hệ thống hoạt động liên tục 24/7, tự động xử lý các tác vụ nền như gửi Email nhắc lịch.
- **Giao diện thân thiện (UX/UI):** Thiết kế tối giản, trực quan và tương thích tốt (Responsive) trên cả điện thoại lẫn máy tính, giúp bệnh nhân thao tác đặt lịch dễ dàng nhất.

### 3.3. Xác định tác nhân và phân quyền người dùng
Từ các phân tích trên, em xác định hệ thống có 3 tác nhân tham gia với các mức độ phân quyền như sau:
1. **Bệnh nhân (Patient):** Là người sử dụng dịch vụ. Chỉ có quyền truy cập và thao tác trên dữ liệu cá nhân của mình (đặt lịch, xem bệnh án, đánh giá) và tương tác với Chatbot.
2. **Bác sĩ (Doctor):** Là người cung cấp dịch vụ chuyên môn. Có quyền quản lý lịch làm việc cá nhân, xem hồ sơ bệnh án của các bệnh nhân được phân công khám. Không có quyền can thiệp vào lịch của bác sĩ khác.
3. **Quản trị viên / Lễ tân (Admin):** Là vai trò điều phối hệ thống. Có toàn quyền quản trị danh mục, tài khoản, kiểm duyệt nội dung. Đặc biệt, đóng vai trò như một **Lễ tân phòng khám** để điều phối toàn bộ lịch hẹn, phân công bác sĩ và xem báo cáo tài chính tổng thể.
