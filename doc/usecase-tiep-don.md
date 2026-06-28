# Đặc tả Use Case: Tiếp đón bệnh nhân (Nghiệp vụ Lễ tân)

**Mã Use Case:** UC-ADMIN-01
**Tên Use Case:** Tiếp đón và Điều phối bệnh nhân
**Tác nhân (Actor):** Quản trị viên / Lễ tân (Admin)
**Mô tả tóm tắt:** Use Case này bao gồm toàn bộ các nghiệp vụ của Lễ tân tại quầy để tiếp đón bệnh nhân đến khám và xử lý các tình huống phát sinh liên quan đến lịch hẹn trong ngày.

## 1. Các luồng sự kiện chính (Basic Flows)
Use Case tổng quát "Tiếp đón bệnh nhân" được phân rã thành 4 kịch bản (scenarios) chi tiết tương ứng với các API đã được cài đặt dưới hệ thống:

### 1.1. Tra cứu danh sách khám (View Appointments)
- Admin mở màn hình "Tiếp đón bệnh nhân".
- Hệ thống tự động tải và hiển thị danh sách toàn bộ bệnh nhân đã đặt lịch trong ngày hôm nay.
- Admin có thể tìm kiếm theo tên hoặc số điện thoại khi có bệnh nhân tới quầy đọc thông tin.

### 1.2. Xác nhận bệnh nhân đã đến (Check-in)
- **Tình huống:** Bệnh nhân đến phòng khám đúng giờ.
- **Hành động:** Admin tìm tên bệnh nhân trong danh sách và bấm nút "Đã đến".
- **Hệ thống:** Cập nhật trạng thái lịch hẹn từ `Confirmed` (Đã xác nhận) sang `CheckedIn` (Đã check-in/Chờ khám) và ghi nhận thời gian `CheckInTime`. Danh sách chờ của Bác sĩ sẽ ngay lập tức hiện tên bệnh nhân này.

### 1.3. Đánh dấu lỡ hẹn (Mark No-show)
- **Tình huống:** Đã quá giờ khám quy định nhưng bệnh nhân không xuất hiện.
- **Hành động:** Admin chọn lịch hẹn và bấm nút "Lỡ hẹn".
- **Hệ thống:** Cập nhật trạng thái lịch hẹn thành `NoShow` để giải phóng khung giờ, đồng thời ghi chú lại để cảnh báo nếu bệnh nhân này đặt lịch vào lần sau.

### 1.4. Phân công lại bác sĩ (Assign Doctor)
- **Tình huống:** Bác sĩ A bị ốm đột xuất, Lễ tân cần chuyển bệnh nhân sang cho Bác sĩ B đang rảnh.
- **Hành động:** Admin thao tác chọn Bác sĩ B (cùng chuyên khoa) và khung giờ trống của Bác sĩ B.
- **Hệ thống:** Đổi `DoctorId` của cuộc hẹn sang Bác sĩ B. Bệnh nhân sẽ được khám bình thường mà không bị gián đoạn.

---

## 2. Các luồng ngoại lệ (Alternate Flows)
- **A1. Xung đột giờ khám:** Khi Lễ tân thao tác *Đổi bác sĩ*, nếu khung giờ mới đã bị người khác đặt mất (hết chỗ), hệ thống sẽ báo lỗi và yêu cầu Lễ tân chọn một khung giờ khác.
- **A2. Sai quy trình:** Hệ thống không cho phép Lễ tân bấm "Check-in" đối với những lịch hẹn đã bị "Hủy" hoặc đang ở trạng thái "Chờ xác nhận" (Pending).
