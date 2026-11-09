# Quickstart & Verification Guide: Feature 004

Hướng dẫn kiểm thử và xác thực 2 tính năng: Chế độ bình luận đầu tiên & Luồng Auto tương tác liên tục.

## Kịch bản 1: Kiểm tra chế độ "Lấy bình luận đầu tiên của video"

1. Mở Side Panel của tiện ích trên tab TikTok.
2. Trong phần cài đặt bình luận, chuyển **"Nguồn bình luận"** sang **"💬 Lấy bình luận đầu tiên của video"**.
3. Mở một video TikTok có nhiều bình luận (ví dụ video tương đương mẫu `page.html` với bình luận đầu *"tui muốn đi nhầm cả đời"*).
4. Bấm nút **"Tự động bình luận"**.
5. **Kết quả mong đợi**:
   - Thẻ xem trước hiển thị huy hiệu: `"💬 Bình luận đầu tiên:"`.
   - Nội dung điền vào ô bình luận khớp chính xác với bình luận của người xem đầu tiên (không lấy bình luận tác giả nếu có).
   - Đăng bình luận thành công.

---

## Kịch bản 2: Kiểm tra luồng Auto tương tác liên tục

1. Trên Side Panel:
   - Chọn thời gian chờ: **5 giây**.
   - Chọn giới hạn video: **10 video** (hoặc Không giới hạn).
2. Nhấn nút **"▶ Bắt đầu Auto tương tác"**.
3. **Quan sát chu trình**:
   - Tiện ích tự động thả tim video 1 -> Gửi bình luận video 1.
   - Status Box hiển thị: *"Đã tương tác 1 video. Chuyển video sau: 5s... 4s... 3s... 2s... 1s..."*.
   - Tiện ích tự động kích hoạt nút mũi tên xuống (`feed-navigation-next`), trang web lướt sang video 2.
   - Video 2 tự động được thả tim và bình luận.
   - Bộ đếm tiến độ tăng lên: *"Đã tương tác: 2 / 10 video"*.
4. Bấm nút **"⏹ Dừng lại"**.
   - **Kết quả mong đợi**: Tiến trình dừng ngay lập tức, nút bấm chuyển về trạng thái sẵn sàng ban đầu.

---

## Kịch bản 3: Xử lý video bị khóa tính năng bình luận khi Auto

1. Cho luồng Auto tương tác lướt qua một video bị chủ kênh tắt bình luận.
2. **Kết quả mong đợi**:
   - Tiện ích phát hiện video bị khóa bình luận (`canComment === false`).
   - Ghi nhận trạng thái *"Video tắt bình luận -> Bỏ qua ngay"* và tự động bấm nút chuyển sang video tiếp theo ngay lập tức mà không cần đợi đếm ngược thời gian.

