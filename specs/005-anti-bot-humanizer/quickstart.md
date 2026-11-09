# Quickstart & Verification Guide: Anti-Bot & Tool Detection Humanizer

Hướng dẫn các bước kiểm thử xác thực các tính năng chống quét bot của Feature 005.

---

## Điều kiện tiên quyết
1. Mở trình duyệt Google Chrome, truy cập `chrome://extensions/`.
2. Bật chế độ "Developer mode" và chọn **Load unpacked** (hoặc bấm Reload 🔄 nếu đã cài tiện ích).
3. Mở tab [https://www.tiktok.com](https://www.tiktok.com) và bấm icon tiện ích để mở Sidepanel.

---

## Kịch bản 1: Xác thực Dao động thời gian xem (Jitter Watch Delay)
- **Mục tiêu**: Chứng minh thời gian chờ của mỗi video dao động ngẫu nhiên quanh mốc cơ sở, không lặp lại số giây cơ học.
- **Các bước thực hiện**:
  1. Trong Sidepanel, chọn mốc thời gian xem là `10 giây`.
  2. Bật công tắc "Chống quét Bot (Humanizer)" và tùy chọn "Dao động thời gian xem (Jitter ±25%)".
  3. Bấm **Bắt đầu Auto tương tác**.
  4. Quan sát dòng đếm ngược trên Sidepanel qua 3 video liên tiếp.
- **Kết quả kỳ vọng**:
  - Video 1: Thời gian đếm ngược bắt đầu từ khoảng `11s` hoặc `12s`.
  - Video 2: Thời gian đếm ngược bắt đầu từ khoảng `8s` hoặc `9s`.
  - Không có 2 video nào có tổng thời gian xem bằng mili-giây giống hệt nhau.

---

## Kịch bản 2: Xác thực Phân tách thao tác & Micro-delays
- **Mục tiêu**: Đảm bảo Thả tim, Follow, Bình luận không bao giờ xảy ra cùng 1 lúc.
- **Các bước thực hiện**:
  1. Bật đồng thời các tùy chọn: Thả tim, Tự động Follow kênh, và Tự động bình luận.
  2. Bấm **Bắt đầu Auto tương tác** và theo dõi trạng thái.
- **Kết quả kỳ vọng**:
  - Hết thời gian xem $\rightarrow$ Nghỉ `~0.5s` $\rightarrow$ Thả tim.
  - Thả tim xong $\rightarrow$ Nghỉ `~1.5s` $\rightarrow$ Nhấn Follow kênh.
  - Follow xong $\rightarrow$ Nghỉ `~1.8s` $\rightarrow$ Mở ô bình luận và gửi bình luận.
  - Bình luận xong $\rightarrow$ Nghỉ `~1.8s` $\rightarrow$ Next sang video tiếp theo.
  - Mọi thao tác đều có nhịp điệu giống như con người đang thao tác bằng chuột/bàn phím.

---

## Kịch bản 3: Xác thực Tỷ lệ lướt qua ngẫu nhiên (Natural Skip Rate)
- **Mục tiêu**: Chứng minh bot thỉnh thoảng chỉ lướt xem rồi bỏ qua tương tác để bảo vệ tài khoản.
- **Các bước thực hiện**:
  1. Trong phần mở rộng của Chống quét Bot, chọn **Tỷ lệ bỏ qua video: 30%**.
  2. Để bot tự động tương tác qua 10 video.
- **Kết quả kỳ vọng**:
  - Khoảng 2 đến 4 video xuất hiện thông báo: `🎲 [Bỏ qua an toàn] Lướt qua video không tương tác (chờ 3s)...`.
  - Tại các video bị skip, tiện ích không thả tim, không follow, không bình luận mà chỉ dừng xem ngắn từ 2s - 5s rồi tự động lướt sang video tiếp theo.

---

## Kịch bản 4: Xác thực Đa dạng hóa lựa chọn bình luận khán giả
- **Mục tiêu**: Không còn hiện tượng 100% copy duy nhất bình luận top 1.
- **Các bước thực hiện**:
  1. Trong cài đặt AI, chọn **Chế độ chọn bình luận: Lấy ngẫu nhiên bình luận người xem**.
  2. Đảm bảo tùy chọn "Đa dạng hóa bình luận (Top 1 - 5)" được bật.
  3. Để tiện ích tự động bình luận trên video có nhiều bình luận.
- **Kết quả kỳ vọng**:
  - Tiện ích trích xuất top 3 đến 5 bình luận hợp lệ của khán giả (loại trừ bình luận của chính tác giả và bình luận ghim).
  - Nội dung được chọn sẽ ngẫu nhiên giữa các bình luận trong danh sách top này.

---

## Kịch bản 5: Xác thực Nút Dừng khẩn cấp trong các khoảng nghỉ (Micro-delays)
- **Mục tiêu**: Người dùng có thể dừng ngay lập tức bất cứ lúc nào.
- **Các bước thực hiện**:
  1. Đang trong giai đoạn bot đang nghỉ giữa các bước (ví dụ: đang chờ follow hoặc đang chờ gửi bình luận), bấm nút **Dừng lại**.
- **Kết quả kỳ vọng**:
  - Tiện ích dừng ngay lập tức trong vòng dưới 150ms.
  - Không có bất kỳ hành động click ngầm nào tiếp tục được gửi đến TikTok.

