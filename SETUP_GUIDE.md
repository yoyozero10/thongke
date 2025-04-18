# Hướng Dẫn Cài Đặt Google Sheets làm Backend

Tài liệu này hướng dẫn cách thiết lập Google Sheets làm backend cho ứng dụng web Thống Kê Thu Chi Hàng Ngày, giúp bạn và bạn bè có thể cùng truy cập và sử dụng dữ liệu.

## Bước 1: Tạo Google Spreadsheet mới

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo một bảng tính mới
3. Đặt tên cho bảng tính (ví dụ: "Thống Kê Thu Chi Hàng Ngày")
4. **Lưu ID của bảng tính**: ID nằm trong URL của bảng tính
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
   ```

## Bước 2: Cài đặt Google Apps Script

1. Trong Google Sheets, chọn **Extensions > Apps Script**
2. Xóa tất cả code mặc định trong editor
3. Sao chép toàn bộ nội dung từ file `google-script.js` và dán vào editor
4. Thay thế `YOUR_GOOGLE_SHEET_ID` bằng ID bảng tính thực tế đã lưu ở Bước 1
5. Nhấn **Save** và đặt tên cho project (ví dụ: "Thu Chi Script")

## Bước 3: Triển khai Google Apps Script

1. Nhấn vào nút **Deploy > New deployment**
2. Chọn loại triển khai là **Web app**
3. Cấu hình như sau:
   - Description: Nhập mô tả (ví dụ: "Thu Chi App")
   - Execute as: Chọn **Me** (email của bạn)
   - Who has access: Chọn **Anyone**
4. Nhấn **Deploy**
5. Cấp quyền khi được yêu cầu (chọn tài khoản Google của bạn và chọn "Advanced" rồi "Go to..." nếu thấy cảnh báo)
6. **Sao chép URL** được cung cấp sau khi triển khai

## Bước 4: Cập nhật ứng dụng web

1. Mở file `script.js` trong ứng dụng web
2. Tìm dòng có biến `GOOGLE_SCRIPT_URL`
3. Thay thế giá trị `'YOUR_GOOGLE_SCRIPT_URL'` bằng URL thực tế đã sao chép ở Bước 3
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR-SCRIPT-ID/exec';
   ```
4. Lưu file

## Bước 5: Chia sẻ bảng tính Google Sheets

1. Trong Google Sheets, nhấn nút **Share** ở góc trên bên phải
2. Thêm email của bạn bè mà bạn muốn chia sẻ
3. Chọn quyền "Editor" (nếu bạn muốn họ có thể chỉnh sửa trực tiếp trong Sheets) hoặc "Viewer" (nếu bạn chỉ muốn họ xem)
4. Nhấn **Send**

## Bước 6: Chia sẻ ứng dụng web

Có hai cách để chia sẻ ứng dụng web:

### Cách 1: Trực tiếp chia sẻ các file
1. Gửi các file (index.html, style.css, script.js với URL đã cập nhật) cho bạn bè
2. Họ có thể mở file index.html trong trình duyệt và sử dụng

### Cách 2: Triển khai lên hosting miễn phí
1. Tạo tài khoản trên GitHub
2. Tạo repository mới
3. Tải lên các file (index.html, style.css, script.js với URL đã cập nhật)
4. Vào Settings > Pages, chọn branch main và thư mục root, nhấn Save
5. Chia sẻ URL GitHub Pages được cung cấp cho bạn bè

## Cách sử dụng

1. Mỗi người dùng ứng dụng web như bình thường
2. Khi muốn đồng bộ dữ liệu:
   - Nhấn nút "Đồng bộ dữ liệu" để đẩy dữ liệu lên Google Sheets
   - Dữ liệu trên Google Sheets sẽ được cập nhật và hiển thị cho tất cả người dùng
   - Khi người khác đồng bộ, họ sẽ nhận được dữ liệu mới nhất

## Lưu ý quan trọng

- Việc đồng bộ sẽ ghi đè dữ liệu hiện tại trên Google Sheets
- Luôn nhấn "Đồng bộ dữ liệu" trước khi thêm giao dịch mới nếu có nhiều người cùng sử dụng
- Mỗi người cần sử dụng ứng dụng web với cùng một URL Google Apps Script 