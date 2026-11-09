# Quickstart & Validation Guide: TikTok Auto-Like Extension

**Feature**: `001-tiktok-auto-like`  
**Date**: 2026-11-05

Tài liệu hướng dẫn cài đặt thử nghiệm và xác minh tiện ích mở rộng trực tiếp trên trình duyệt Chromium (Google Chrome, Microsoft Edge, Brave, v.v.).

---

## 1. Yêu cầu tiên quyết (Prerequisites)

- Trình duyệt Chrome / Edge phiên bản 116 trở lên (hỗ trợ Side Panel API).
- Đã đăng nhập tài khoản trên trang [TikTok Web](https://www.tiktok.com).

---

## 2. Hướng dẫn cài đặt Extension (Load Unpacked)

1. Mở trình duyệt và truy cập trang quản lý tiện ích:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
2. Bật chế độ dành cho nhà phát triển (**Developer mode**) ở góc trên bên phải.
3. Nhấp vào nút **Load unpacked** (Tải tiện ích đã giải nén).
4. Chọn thư mục dự án: `d:\Code\extensions\auto-interaction-tiktok`.
5. Đảm bảo tiện ích **"TikTok Auto Interaction"** hiển thị trong danh sách và được kích hoạt.
6. (Khuyến nghị) Nhấp vào biểu tượng mảnh ghép (Extensions) trên thanh công cụ và ghim (Pin) biểu tượng của tiện ích ra ngoài thanh công cụ.

---

## 3. Các kịch bản kiểm thử trực tiếp (End-to-End Test Scenarios)

### Kịch bản 1: Mở Side Panel từ biểu tượng tiện ích
1. Nhấp vào biểu tượng của tiện ích trên thanh công cụ trình duyệt.
2. **Kỳ vọng**: Cửa sổ Side Panel của trình duyệt mở ra ở cạnh phải màn hình với tiêu đề và nút "Bắt đầu".

### Kịch bản 2: Bấm "Bắt đầu" khi đang ở trang không phải TikTok
1. Mở một tab bất kỳ (ví dụ: `https://www.google.com`).
2. Mở Side Panel tiện ích và nhấp vào nút "Bắt đầu".
3. **Kỳ vọng**: Nút phản hồi ngay với thông báo cảnh báo màu vàng/cam: "Vui lòng mở trang web TikTok để sử dụng tính năng này."

### Kịch bản 3: Bấm "Bắt đầu" để thả tim video TikTok chưa thích
1. Truy cập `https://www.tiktok.com` và xem một video chưa được thả tim (biểu tượng tim màu trắng).
2. Trên Side Panel, nhấp vào nút "Bắt đầu".
3. **Kỳ vọng**:
   - Nút "Bắt đầu" chuyển sang trạng thái "Đang xử lý..." (bị vô hiệu hóa tạm thời).
   - Biểu tượng tim trên video TikTok đổi sang màu đỏ (hoặc hiệu ứng tim nảy lên).
   - Side Panel hiển thị thông báo thành công màu xanh lá: "Đã thả tim video thành công!".

### Kịch bản 4: Bấm "Bắt đầu" khi video đã được thả tim từ trước
1. Xem một video TikTok mà bạn đã thả tim từ trước (biểu tượng tim màu đỏ).
2. Trên Side Panel, nhấp vào nút "Bắt đầu".
3. **Kỳ vọng**:
   - Video **không** bị bỏ thích (không bị chuyển về màu trắng).
   - Side Panel hiển thị thông báo: "Video này đã được thả tim từ trước."

---

## 4. Tham chiếu hợp đồng & mô hình dữ liệu
- Chi tiết cấu trúc dữ liệu: [data-model.md](./data-model.md)
- Giao thức thông điệp giữa các tầng: [contracts/messaging.md](./contracts/messaging.md)

