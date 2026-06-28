## 4.3 Phát triển các module chức năng

### 4.3.1 Module đăng ký, đăng nhập và phân quyền

#### 4.3.1.1 Giao diện đăng nhập
Giao diện đăng nhập được thiết kế tối giản, yêu cầu người dùng cung cấp địa chỉ thư điện tử và mật khẩu đã đăng ký. Hệ thống có cơ chế kiểm tra tính hợp lệ của dữ liệu đầu vào và hiển thị các cảnh báo lỗi rõ ràng nếu thông tin không chính xác.

*[Hình ảnh: Giao diện đăng nhập]*

#### 4.3.1.2 Giao diện đăng ký
Trang đăng ký cho phép người dùng mới tạo tài khoản bằng cách điền các thông tin cá nhân cơ bản như họ và tên, địa chỉ thư điện tử, mật khẩu và xác nhận mật khẩu. Giao diện thân thiện giúp người dùng dễ dàng hoàn tất thao tác đăng ký.

*[Hình ảnh: Giao diện đăng ký]*

### 4.3.2 Module đặt lịch khám và quản lý lịch hẹn

#### 4.3.2.1 Giao diện đặt lịch khám bệnh
Luồng đặt lịch khám dành cho bệnh nhân được chia thành nhiều bước trực quan. Người dùng sẽ lần lượt chọn chuyên khoa, chọn bác sĩ khám, ngày khám và khung giờ còn trống trong ngày. Cuối cùng, hệ thống sẽ hiển thị màn hình xác nhận toàn bộ thông tin trước khi hoàn tất đặt lịch.

*[Hình ảnh: Giao diện đặt lịch khám bệnh]*

#### 4.3.2.2 Giao diện danh sách lịch hẹn của bệnh nhân
Bệnh nhân có thể xem toàn bộ lịch sử các lịch hẹn của mình tại đây. Giao diện hiển thị rõ ràng trạng thái của từng lịch hẹn (ví dụ: chờ xác nhận, đã xác nhận, hoàn thành, đã hủy) và cung cấp nút chức năng để bệnh nhân chủ động hủy lịch khi có công việc đột xuất.

*[Hình ảnh: Giao diện danh sách lịch hẹn của bệnh nhân]*

#### 4.3.2.3 Giao diện quản lý lịch hẹn của bác sĩ
Giao diện này dành riêng cho bác sĩ để theo dõi lịch làm việc. Danh sách lịch hẹn được trình bày dưới dạng bảng chi tiết, cho phép bác sĩ thực hiện các thao tác xác nhận, từ chối, đổi lịch hoặc hủy lịch hẹn trực tiếp trên hệ thống dựa vào tình hình thực tế.

*[Hình ảnh: Giao diện quản lý lịch hẹn của bác sĩ]*

### 4.3.3 Module quản lý hồ sơ bệnh nhân và kết quả khám

#### 4.3.3.1 Giao diện tạo hồ sơ bệnh án
Sau khi hoàn tất quá trình thăm khám, bác sĩ sử dụng biểu mẫu này để lưu trữ thông tin bệnh án. Giao diện bao gồm các trường nhập liệu y khoa quan trọng như chẩn đoán bệnh, các triệu chứng, hướng điều trị hoặc kê đơn thuốc, và ngày hẹn tái khám nếu cần.

*[Hình ảnh: Giao diện tạo hồ sơ bệnh án]*

#### 4.3.3.2 Giao diện danh sách hồ sơ bệnh nhân
Trang này cung cấp cho bác sĩ danh sách toàn bộ hồ sơ bệnh án của các bệnh nhân đã từng khám. Bác sĩ có thể tìm kiếm và tra cứu lại lịch sử diễn tiến sức khỏe của bệnh nhân một cách nhanh chóng.

*[Hình ảnh: Giao diện danh sách hồ sơ bệnh nhân]*

#### 4.3.3.3 Giao diện lịch sử khám bệnh của bệnh nhân
Đây là không gian dành cho bệnh nhân tự theo dõi sức khỏe. Giao diện liệt kê chi tiết kết quả của các lần thăm khám trước, bao gồm kết luận chẩn đoán, toa thuốc và các căn dặn của bác sĩ.

*[Hình ảnh: Giao diện lịch sử khám bệnh của bệnh nhân]*

### 4.3.4 Module bài viết sức khỏe

#### 4.3.4.1 Giao diện danh sách bài viết sức khỏe
Trang cung cấp thông tin y khoa hữu ích cho cộng đồng. Giao diện cho phép người dùng tìm kiếm, lọc và phân loại các bài viết theo từng chuyên đề hoặc chuyên khoa cụ thể.

*[Hình ảnh: Giao diện danh sách bài viết sức khỏe]*

#### 4.3.4.2 Giao diện chi tiết bài viết
Khi người dùng chọn một bài viết, giao diện sẽ hiển thị toàn bộ nội dung chi tiết kèm theo ảnh minh họa và thông tin giới thiệu về bác sĩ là tác giả của bài viết đó.

*[Hình ảnh: Giao diện chi tiết bài viết]*

#### 4.3.4.3 Giao diện tạo bài viết của bác sĩ
Khu vực dành cho bác sĩ đóng góp kiến thức. Giao diện cung cấp công cụ soạn thảo văn bản phong phú, cho phép bác sĩ định dạng chữ, chèn hình ảnh minh họa và gửi bài viết lên hệ thống để chờ phê duyệt.

*[Hình ảnh: Giao diện tạo bài viết của bác sĩ]*

#### 4.3.4.4 Giao diện duyệt bài viết của quản trị viên
Quản trị viên sử dụng giao diện bảng này để kiểm duyệt các bài viết do bác sĩ gửi lên. Người quản trị có thể đọc trước nội dung, sau đó quyết định duyệt cho phép xuất bản hoặc từ chối bài viết.

*[Hình ảnh: Giao diện duyệt bài viết của quản trị viên]*

### 4.3.5 Module trợ lý ảo thông minh

#### 4.3.5.1 Giao diện cửa sổ trò chuyện trợ lý ảo
Cửa sổ nhắn tin nổi được thiết kế gọn gàng ở góc màn hình. Giao diện trình bày các đoạn hội thoại dưới dạng bong bóng tin nhắn, giúp người dùng dễ dàng trao đổi với trợ lý ảo để hỏi thông tin bác sĩ, chuyên khoa hoặc nhờ hỗ trợ luồng đặt lịch khám.

*[Hình ảnh: Giao diện cửa sổ trò chuyện trợ lý ảo]*

### 4.3.6 Module thông báo và nhắc lịch

#### 4.3.6.1 Giao diện danh sách thông báo
Biểu tượng thông báo luôn hiển thị trên thanh điều hướng. Khi có thông báo mới, biểu tượng sẽ hiển thị số đếm. Nhấn vào biểu tượng sẽ xổ xuống một danh sách liệt kê các thông báo hệ thống được cập nhật theo thời gian thực (như lịch hẹn được duyệt, hủy).

*[Hình ảnh: Giao diện danh sách thông báo]*

#### 4.3.6.2 Mẫu thư điện tử thông báo
Bên cạnh thông báo trên trang web, hệ thống cũng gửi các thư điện tử tự động. Các mẫu thư điện tử được thiết kế rõ ràng, chuyên nghiệp để báo cáo tình trạng đặt lịch hoặc nhắc nhở bệnh nhân về giờ khám sắp tới.

*[Hình ảnh: Mẫu thư điện tử thông báo]*

### 4.3.7 Module trang tổng quan quản trị

#### 4.3.7.1 Giao diện trang chủ thống kê
Giao diện mở đầu dành cho tài khoản quản trị, cung cấp các thẻ số liệu tóm tắt và biểu đồ trực quan. Quản trị viên có thể theo dõi tỷ lệ đặt lịch, doanh thu (nếu có) và danh sách bác sĩ có lượt khám cao nhất.

*[Hình ảnh: Giao diện trang chủ thống kê]*

#### 4.3.7.2 Giao diện quản lý tài khoản người dùng
Trang quản lý danh sách toàn bộ người dùng trong hệ thống. Giao diện dạng bảng cung cấp chức năng tìm kiếm, phân quyền và khóa/mở khóa các tài khoản vi phạm.

*[Hình ảnh: Giao diện quản lý tài khoản người dùng]*

#### 4.3.7.3 Giao diện quản lý danh sách bác sĩ
Giao diện giúp ban quản trị hệ thống cập nhật hồ sơ bác sĩ, thay đổi chuyên khoa, duyệt trạng thái hoạt động hoặc ngừng công tác của bác sĩ trong phòng khám.

*[Hình ảnh: Giao diện quản lý danh sách bác sĩ]*

#### 4.3.7.4 Giao diện quản lý chuyên khoa
Giao diện quản trị danh mục các chuyên khoa y tế của hệ thống. Quản trị viên có thể dễ dàng thêm mới, chỉnh sửa thông tin hoặc ẩn/hiện các chuyên khoa tùy theo thực tế hoạt động.

*[Hình ảnh: Giao diện quản lý chuyên khoa]*

#### 4.3.7.5 Giao diện quản lý dịch vụ y tế
Bảng danh sách các dịch vụ khám chữa bệnh cung cấp chức năng cho quản trị viên tạo mới dịch vụ, cấu hình giá tiền và quy định thời lượng dự kiến cho mỗi lần khám.

*[Hình ảnh: Giao diện quản lý dịch vụ y tế]*
