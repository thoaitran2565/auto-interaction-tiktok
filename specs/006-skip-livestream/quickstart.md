# Quickstart: Auto Skip Livestream Videos

## Mục tiêu kiểm thử
Xác nhận rằng tiện ích có khả năng tự động nhận diện video Livestream trên TikTok desktop feed và tự động chuyển sang video tiếp theo mà không dừng chờ hay thực hiện các thao tác like/follow/comment.

---

## Kịch bản kiểm thử 1: Tự động skip khi gặp Livestream

### Điều kiện tiên quyết:
- Đã cài đặt tiện ích mở rộng ở chế độ Developer mode (`chrome://extensions`).
- Mở bảng tin TikTok (`https://www.tiktok.com/foryou`).
- Mở Sidepanel của tiện ích.
- Checkbox `Tự động bỏ qua Livestream` đang được chọn (mặc định bật).

### Các bước thực hiện:
1. Nhấn nút "Bắt đầu tương tác".
2. Khi cuộn tới một video dạng Livestream (hoặc mở một luồng live trong feed):
3. Quan sát thông báo trạng thái trên Sidepanel.

### Kết quả mong đợi:
- Sidepanel hiển thị: `📡 Bỏ qua Livestream` kèm chi tiết: `Phát hiện video Livestream, tự động bỏ qua sang video tiếp theo...`.
- Bot không thực hiện like, không cố gắng mở comment hay follow.
- Sau khoảng 500ms - 800ms, trang tự động cuộn xuống video tiếp theo.

---

## Kịch bản kiểm thử 2: Video thông thường không bị ảnh hưởng

### Điều kiện tiên quyết:
- Đang chạy tính năng Auto Interact.

### Các bước thực hiện:
1. Khi cuộn tới video thông thường có ô comment hoặc video thông thường không phải live.
2. Theo dõi hành vi của tiện ích.

### Kết quả mong đợi:
- Tiện ích xác định `isLivestream = false`.
- Tiếp tục đếm ngược thời gian xem (`delaySec`) và thực hiện tương tác bình thường theo cấu hình.

---

## Kịch bản kiểm thử 3: Lưu và phục hồi cài đặt cấu hình

### Các bước thực hiện:
1. Bỏ chọn checkbox `Tự động bỏ qua Livestream`.
2. Đóng Sidepanel và mở lại (hoặc reload extension).
3. Đánh dấu chọn lại checkbox và kiểm tra `chrome.storage.local`.

### Kết quả mong đợi:
- Giá trị lưu trữ đồng bộ chính xác giữa UI và `chrome.storage.local`.

