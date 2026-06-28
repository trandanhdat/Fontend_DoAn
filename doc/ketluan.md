# CHƯƠNG 6: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

*Lưu ý: Do phần "Kiểm thử hệ thống" ở tài liệu trước đã được đánh số là Chương 5, chương này được điều chỉnh thành Chương 6 để đảm bảo tính logic liền mạch cho toàn bộ báo cáo.*

## 6.1 Kết luận (Kết quả đạt được)

Nhìn lại toàn bộ hành trình thực hiện đồ án "Hệ thống đặt lịch khám và đặt dịch vụ y tế trực tuyến tích hợp AI Gemini", em cảm thấy rất vui và tự hào về những kết quả mình đã đạt được. Từ những ý tưởng ban đầu trên giấy, em đã tự tay phân tích, thiết kế và lập trình thành công một ứng dụng web hoàn chỉnh, đáp ứng sát với nhu cầu thực tế số hóa của các phòng khám tư nhân hiện nay.

Về mặt kỹ thuật và công nghệ, đồ án là cơ hội tuyệt vời để em áp dụng những kiến thức đã học vào một dự án thực tế lớn. Em đã xây dựng hệ thống theo kiến trúc Single Page Application (SPA), tách biệt hoàn toàn Frontend và Backend. Cụ thể, em sử dụng framework ASP.NET Core 8 Web API, Entity Framework Core và SQL Server để xử lý logic nền tảng ở phía Backend. Ở phía Frontend, em chọn thư viện ReactJS kết hợp ngôn ngữ TypeScript và CSS Tailwind để thiết kế ra một giao diện trực quan, phản hồi nhanh và dễ sử dụng cho mọi vai trò.

Xét về khía cạnh nghiệp vụ, em đã giải quyết thành công bài toán luân chuyển bệnh nhân khép kín. Bệnh nhân giờ đây có thể dễ dàng tìm kiếm bác sĩ và đặt lịch trực tuyến. Bác sĩ thì có hẳn một bảng điều khiển (Dashboard) để quản lý lịch làm việc, thiết lập giờ rảnh, ghi hồ sơ bệnh án và kê đơn thuốc số hóa. Điểm mà em tâm đắc nhất trong quá trình code chính là việc áp dụng thành công công nghệ WebSockets (SignalR) để xử lý dữ liệu thời gian thực. Bất cứ khi nào lễ tân thao tác "Check-in" đón khách, thông báo sẽ lập tức hiển thị trên màn hình của bác sĩ phụ trách mà không cần phải tải lại trang.

Bên cạnh đó, em cũng đã mạnh dạn thử sức với các xu hướng công nghệ mới khi tích hợp thành công Trí tuệ nhân tạo (thông qua API Google Gemini) vào hệ thống. Chatbot AI do em cấu hình không chỉ là công cụ hỏi đáp đơn thuần, mà còn hiểu được dữ liệu thực tế của phòng khám để hỗ trợ tư vấn và hướng dẫn đặt lịch một cách tự nhiên nhất. Về mặt bảo mật, hệ thống được em triển khai chặt chẽ bằng cơ chế xác thực JSON Web Token (JWT). 

Tổng kết lại, đồ án này không chỉ giúp em củng cố vững chắc kỹ năng lập trình Fullstack, mà còn cho em bài học quý giá về cách phân tích và giải quyết một bài toán nghiệp vụ y tế phức tạp. Kết quả thu được là một phần mềm chạy ổn định, mang tính ứng dụng thực tiễn cao và hoàn toàn xứng đáng với những nỗ lực em đã bỏ ra.

## 6.2 Hạn chế của đề tài

Dưới góc độ nghiên cứu và phát triển phần mềm thực tế, đồ án vẫn còn tồn tại một số hạn chế nhất định do giới hạn về thời gian và nguồn lực triển khai.

Thứ nhất, hệ thống hiện tại chưa tích hợp các cổng thanh toán điện tử (Payment Gateway) như VNPay hay MoMo. Bệnh nhân vẫn phải thanh toán viện phí trực tiếp tại quầy thu ngân, làm giảm đi tính trọn vẹn của quy trình số hóa dịch vụ. Thứ hai, phân hệ quản lý hồ sơ bệnh án mới chỉ hỗ trợ lưu trữ dữ liệu văn bản thuần túy (chẩn đoán, đơn thuốc). Hệ thống chưa kết nối với các thiết bị cận lâm sàng hay hỗ trợ lưu trữ, hiển thị hình ảnh y tế theo tiêu chuẩn DICOM (X-Quang, siêu âm), gây bất tiện khi bác sĩ cần đối chiếu hình ảnh.

Thứ ba, dù Chatbot Gemini đã hoạt động tốt ở vai trò tư vấn quy trình, AI này chưa được huấn luyện tinh chỉnh (fine-tuning) với các dữ liệu bệnh học chuyên sâu, do đó chưa thể đóng vai trò như một hệ thống hỗ trợ ra quyết định lâm sàng (CDSS). Cuối cùng, hệ thống hiện chỉ có phiên bản nền web. Việc thiếu vắng một ứng dụng di động (Mobile App) độc lập làm hạn chế khả năng tương tác tức thời của bệnh nhân, đặc biệt trong việc nhận thông báo đẩy (Push Notification) hoặc sử dụng mã QR khi đến khám.

## 6.3 Hướng phát triển trong tương lai

Dựa trên nền tảng kiến trúc vững chắc hiện có, đề tài mở ra một số hướng phát triển khả thi nhằm hoàn thiện hệ thống, hướng tới mô hình bệnh viện thông minh thu nhỏ.

Một là, **tích hợp giải pháp thanh toán điện tử trực tuyến**. Việc kết nối với các cổng thanh toán (VNPay, thẻ tín dụng) sẽ cho phép bệnh nhân thanh toán trước phí đặt lịch khám. Đồng thời, việc xuất hóa đơn điện tử tự động sẽ giúp phòng khám minh bạch hóa quy trình tài chính.

Hai là, **phát triển phân hệ tư vấn khám bệnh từ xa (Telemedicine)**. Bằng cách tích hợp công nghệ giao tiếp video thời gian thực (như WebRTC), hệ thống sẽ cho phép bác sĩ thực hiện các buổi tái khám trực tuyến. Điều này đặc biệt hữu ích đối với các bệnh nhân ở xa hoặc mắc bệnh mạn tính cần theo dõi định kỳ.

Ba là, **mở rộng kênh thông báo đa nền tảng (Omnichannel)**. Bên cạnh hệ thống thông báo nội bộ và Email, việc kết nối với các dịch vụ SMS Gateway hoặc Zalo Notification Service (ZNS) sẽ đảm bảo bệnh nhân luôn nhận được lịch hẹn và kết quả khám kịp thời nhất.

Bốn là, **phát triển ứng dụng di động (Mobile App)**. Sử dụng các framework đa nền tảng như React Native, hệ thống có thể cung cấp cho bệnh nhân ứng dụng quản lý sổ sức khỏe điện tử cá nhân trên điện thoại, hỗ trợ nhắc nhở uống thuốc và check-in tự động bằng QR Code tại phòng khám.
