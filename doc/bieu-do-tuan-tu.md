# 1. Biểu đồ tuần tự Ghi kết quả khám (Tạo hồ sơ bệnh án)
**Mô tả nghiệp vụ:** Luồng nghiệp vụ dành cho Bác sĩ. Sau khi khám bệnh xong, Bác sĩ điền thông tin chẩn đoán, toa thuốc và các chỉ định khác. Hệ thống sẽ lưu trữ hồ sơ bệnh án và tự động chuyển trạng thái lịch hẹn của bệnh nhân thành "Đã hoàn thành".

```mermaid
sequenceDiagram
    actor Doctor as Bác sĩ
    participant UI as Giao diện ghi kết quả khám
    participant Ctr as Ctr_Ghi kết quả khám
    participant DB as Cơ sở dữ liệu

    Doctor->>UI: Truy cập vào form điền Hồ sơ bệnh án
    Doctor->>UI: Nhập thông tin: Chẩn đoán, Đơn thuốc
    Doctor->>UI: Bấm "Lưu hồ sơ"
    
    UI->>Ctr: Gửi yêu cầu lưu kết quả khám
    activate Ctr
    
    Ctr->>Ctr: Kiểm tra quyền Bác sĩ và Trạng thái lịch
    
    Ctr->>DB: Truy vấn thông tin lịch hẹn
    activate DB
    DB-->>Ctr: Trả về dữ liệu lịch hẹn hợp lệ
    deactivate DB
    
    Ctr->>DB: Lưu hồ sơ bệnh án mới (Chẩn đoán, Đơn thuốc)
    Ctr->>DB: Cập nhật trạng thái lịch hẹn thành "Đã hoàn thành"
    
    DB-->>Ctr: Lưu thành công
    
    Ctr-->>UI: Phản hồi lưu kết quả thành công
    deactivate Ctr
    
    UI-->>Doctor: Hiển thị thông báo thành công và cập nhật danh sách
```

---

# 2. Biểu đồ tuần tự Tiếp nhận bệnh nhân (Check-in bởi Lễ tân)
**Mô tả nghiệp vụ:** Khi bệnh nhân đến phòng khám, nhân viên Lễ tân (Admin/Receptionist) sẽ tìm kiếm lịch hẹn của bệnh nhân đó và bấm nút "Check-in". Ngay lập tức, hệ thống không chỉ lưu vào cơ sở dữ liệu mà còn sử dụng WebSockets (SignalR) để "bắn" thông báo realtime lên màn hình máy tính của Bác sĩ trong phòng khám để bác sĩ biết là bệnh nhân đã có mặt.

```mermaid
sequenceDiagram
    actor Admin as Lễ tân
    participant UI as Giao diện tiếp đón bệnh nhân
    participant Ctr as Ctr_Tiếp đón bệnh nhân
    participant DB as Cơ sở dữ liệu

    Admin->>UI: Tìm kiếm lịch hẹn của Bệnh nhân
    Admin->>UI: Bấm "Check-in"
    
    UI->>Ctr: Gửi yêu cầu check-in tiếp đón
    activate Ctr
    
    Ctr->>Ctr: Kiểm tra quyền thao tác
    Ctr->>DB: Truy vấn lịch hẹn theo ID
    activate DB
    DB-->>Ctr: Trả về dữ liệu Lịch hẹn
    deactivate DB
    
    Ctr->>DB: Cập nhật trạng thái lịch hẹn thành "Đã đến" (CheckedIn)
    
    DB-->>Ctr: Lưu thành công
    
    Ctr-->>UI: Phản hồi check-in thành công
    deactivate Ctr
    
    UI-->>Admin: Hiển thị thông báo "Check-in thành công"
```
*(Lưu ý: Bạn có thể bổ sung thêm phần SignalR Notification nếu cần thiết, tuy nhiên theo source code hiện tại quy trình CheckInAsync xử lý việc đổi trạng thái tại DB, bác sĩ sẽ load lại WaitingList bằng hàm GetDoctorWaitingList)*

---

# 3. Biểu đồ tuần tự Quên mật khẩu (Forgot Password)
**Mô tả nghiệp vụ:** Luồng xử lý khi người dùng (bất kể vai trò) quên mật khẩu. Để đảm bảo tính đơn giản trong phiên bản hiện tại, khi nhập đúng email hợp lệ, hệ thống sẽ tự động cấp và thay thế bằng mật khẩu mặc định (Password@123) mà không cần qua bước gửi email xác thực lằng nhằng. Người dùng sau đó dùng mật khẩu mặc định để đăng nhập và tự đổi lại.

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant UI1 as Giao diện Yêu cầu
    participant UI2 as Giao diện Đặt lại
    participant Ctr as Controller (Auth)
    participant DB as Cơ sở dữ liệu
    participant SMTP as Hệ thống Email (SMTP)

    User->>UI1: Nhập Email và Bấm Yêu cầu
    
    UI1->>Ctr: Gửi yêu cầu (POST /forgot-password)
    activate Ctr
    
    Ctr->>DB: Truy vấn tài khoản theo Email
    activate DB
    DB-->>Ctr: Trả về dữ liệu tài khoản
    deactivate DB
    
    alt Không tìm thấy tài khoản
        Ctr-->>UI1: Phản hồi lỗi (404 Not Found)
        UI1->>User: Hiển thị cảnh báo Email không tồn tại
    else Tài khoản hợp lệ
        Ctr->>Ctr: Khởi tạo mã bảo mật (Reset Token)
        Ctr->>Ctr: Biên dịch Link khôi phục chứa Token
        
        Ctr->>DB: Khởi tạo bản ghi Email Logs (Pending)
        
        Ctr->>SMTP: Gửi nội dung qua giao thức SMTP
        activate SMTP
        SMTP-->>Ctr: Hoàn tất gửi Email
        deactivate SMTP
        
        Ctr->>DB: Cập nhật trạng thái gửi thành công (Sent)
        
        Ctr-->>UI1: Phản hồi thành công (200 OK)
        UI1->>User: Hiển thị thông báo yêu cầu kiểm tra Email
        
        User->>UI2: Truy cập Link từ Email (Truyền Token vào URL)
        User->>UI2: Nhập Mật khẩu mới và Xác nhận
        
        UI2->>Ctr: Gửi yêu cầu Đặt lại (POST /reset-password)
        
        Ctr->>DB: Xác thực Token và Ghi đè Mật khẩu mới
        activate DB
        DB-->>Ctr: Lưu thành công
        deactivate DB
        
        Ctr-->>UI2: Phản hồi thành công (200 OK)
        UI2->>User: Hiển thị thông báo thành công và chuyển hướng Đăng nhập
    end
    deactivate Ctr
```
