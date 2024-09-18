# Project 2: Hệ thống quản lý ký túc xá sinh viên

YÊU CẦU BTL CSDL

YÊU CẦU CHUNG:

-   Xây dựng bản thiết kế CSDL với các thông tin và yêu cầu được cung cấp.
-   Xây dựng bộ dữ liệu mẫu, thực thi CSDL trong Hệ quản trị CSDL và nhập các dữ liệu mẫu.
-   Viết các câu lệnh truy vấn theo yêu cầu.
-   Nâng cao: Viết chương trình hoặc phát triển ứng dụng thao tác với CSDL.

    YÊU CẦU CHO NHÓM 01:

-   Sử dụng MongoDB hoặc AsterixDB để tạo CSDL và nhập dữ liệu mẫu
-   Sử dụng NodeJS để viết ứng dụng thao tác CSDL. Trường hợp không sử dụng được NodeJS để viết ứng dụng thì phải tạo dữ liệu và viết câu lệnh thao tác dữ liệu trên cả MongoDB và AsterixDB.

    YÊU CẦU CHO NHÓM 02:

-   Sử dụng Hệ quản trị CSDL MySQL để xây dựng CSDL và nhập dữ liệu mẫu (viết câu lệnh tạo bảng và câu lệnh nhập dữ liệu).
-   Sử dụng ngôn ngữ Java hoặc các framework như Spring để viết chương trình thao tác CSDL.

    YÊU CẦU NỘP:

-   Bản thiết kế CSDL (nộp file .pdf).
-   File script chứa các câu lệnh tạo bảng, nhập dữ liệu, và các câu lệnh truy vấn theo yêu cầu (nộp file .sql).
-   Chương trình thao tác CSDL (nộp link git hoặc codesandbox).

PROJECT 2:
Kịch bản thế giới thực: Xây dựng hệ thống quản lý ký túc xá sinh viên.
Các yêu cầu về CSDL bao gồm:
● Thông tin về Sinh viên bao gồm Mã SV, số CMT, ngày sinh, lớp, quê quán.
● Thông tin về phòng ở bao gồm số phòng, loại phòng, đơn giá, số người được ở tối đa trong phòng. Các khách đến chơi trong KTX cũng cần phải được lưu thông tin gồm CMT, tên, ngày sinh, và thông tin của SV ở trong KTX mà khách đến chơi, ngày đến chơi. Tiền thuê phòng được tính chẵn tháng, tức là ở một ngày cũng phải trả tiền cả tháng.
● Các dịch vụ trong KTX gồm các thông tin về mã dịch vụ, tên dịch vụ, đơn giá, thời gian sử dụng dịch vụ. Mỗi sinh viên có thể sử dụng một hoặc nhiều dịch vụ. Một sinh viên có thể sử dụng một dịch vụ một hoặc nhiều lần. Tiền sử dụng dịch vụ được cộng dồn cho mỗi Sinh viên để cuối mỗi tháng gửi hoá đơn thanh toán cho từng sinh viên. Một số loại dịch vụ cơ bản trong KTX bao gồm giặt là, trông xe, cho thuê xe, ăn uống.
● Sinh viên đăng ký gửi xe vé tháng trong KTX với đơn giá 100 nghìn một tháng. Trong mỗi ngày, một xe gửi tháng chỉ được lấy ra/gửi vào 2 lần miễn phí, mỗi lần lấy/gửi phát sinh phải mất tiền 3 nghìn đồng/lượt. Thông tin về các lần lấy/gửi xe cần phải được lưu lại bao gồm thời gian lấy xe, thời gian gửi xe, số tiền phải trả (nếu số lượt gửi/lấy xe vẫn còn trong hạn thì không mất tiền). Học viên cần tự xây dựng CSDL cho các xe được gửi và các thông tin về các lượt gửi/lấy xe, cùng thông tin về Sinh viên đăng ký gửi xe vé tháng. Mỗi sinh viên chỉ được đăng ký gửi tối đa 2 xe vé tháng.
● Các xe không gửi vé tháng sẽ được tính tiền riêng cho mỗi lượt gửi/lấy xe và không cần lưu trong CSDL.
Các yêu cầu truy vấn:
● Liệt kê thông tin sinh viên trong KTX cùng số tiền mà họ phải trả cho tất cả các dịch vụ (bao gồm cả tiền phòng) đã sử dụng trong mỗi tháng. Thông tin này có thể in theo danh sách hoặc theo từng người.
● Liệt kê thông tin sinh viên cùng tên dịch vụ, tổng giá mỗi dịch vụ mà họ sử dụng trong khoảng thời gian từ ngày bắt đầu đến ngày kết thúc.
● Liệt kê thông tin sinh viên cùng thông tin về các khách đến thăm họ trong tuần, hoặc tháng, cùng số lần mỗi khách đến chơi.
● Liệt kê danh mục các dịch vụ cùng doanh thu của mỗi dịch vụ trong KTX trong mỗi tháng.
● Các ứng dụng kiểm tra các ràng buộc về số người ở trong phòng, số xe tháng tối đa của mỗi sinh viên được đăng ký,… cần phải được thể hiện.
