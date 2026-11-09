# Quickstart & Verification Guide: Feature 003

Hướng dẫn kiểm thử và xác thực nhanh 3 tính năng mới: Lưu cấu hình, bình luận video không mô tả, và chẩn đoán kết nối AI.

## Kịch bản 1: Kiểm tra tính bền vững của cấu hình (Settings Persistence)

1. Mở Side Panel bằng cách bấm vào biểu tượng tiện ích trên thanh công cụ.
2. Thay đổi phương thức thả tim sang **"Phím L"**.
3. Bấm mở mục **"Cài đặt AI & Tùy chọn"**, nhập một chuỗi API Key bất kỳ (ví dụ: `AIzaSyTestKey123`), chọn phong cách **"Hài hước"**, và bỏ chọn **"Tự động gửi bình luận"**.
4. Đóng Side Panel (hoặc tắt trình duyệt).
5. Mở lại Side Panel.
6. **Kết quả mong đợi**:
   - Phương thức thả tim vẫn là **"Phím L"**.
   - API Key vẫn hiển thị `AIzaSyTestKey123`.
   - Phong cách bình luận vẫn là **"Hài hước"**.
   - Checkbox "Tự động gửi" vẫn ở trạng thái bỏ chọn.

---

## Kịch bản 2: Kiểm tra kết nối Gemini API (AI Diagnostics)

1. Mở mục "Cài đặt AI & Tùy chọn" trên Side Panel.
2. **Thử nghiệm với API Key sai**: Nhập `AIzaSyInvalidKey` và bấm nút **"Kiểm tra Key"**.
   - **Kết quả mong đợi**: Hiển thị thông báo màu đỏ/cam chỉ rõ: *"Lỗi: API Key không hợp lệ hoặc không có quyền truy cập (HTTP 400/403)"*.
3. **Thử nghiệm với API Key thật**: Nhập API Key Google AI Studio hợp lệ và bấm **"Kiểm tra Key"**.
   - **Kết quả mong đợi**: Hiển thị thông báo màu xanh: *"✓ API Key hợp lệ và sẵn sàng kết nối!"*.
4. Bấm **"Tự động bình luận"** trên một video TikTok có mô tả.
   - **Kết quả mong đợi**: Thẻ xem trước hiển thị huy hiệu `"✨ Bình luận Gemini AI"` với câu bình luận ngắn gọn, chuẩn phong cách đã chọn.

---

## Kịch bản 3: Bình luận video không có mô tả (Multi-tier Fallback)

1. Mở một video TikTok **không có mô tả** (caption trống) nhưng có các bình luận phía dưới.
2. Bấm **"Tự động bình luận"** trên Side Panel.
3. **Kết quả mong đợi**:
   - Tiện ích tự động mở khung bình luận, trích xuất các bình luận sẵn có của video.
   - Thẻ xem trước hiển thị huy hiệu `"💬 Bình luận từ video"` với một trong các bình luận sẵn có.
   - Nội dung được điền an toàn vào ô bình luận và đăng thành công.
4. Mở một video mới đăng **không có mô tả và chưa có bất kỳ bình luận nào**.
5. Bấm **"Tự động bình luận"**.
   - **Kết quả mong đợi**:
   - Tiện ích nhận diện video trống mô tả và 0 bình luận.
   - Thẻ xem trước hiển thị huy hiệu `"🎲 Bình luận ngẫu nhiên"` với một câu tương tác tự nhiên (ví dụ: *"Video cuốn quá nè! ❤️"*).
   - Đăng tải thành công mà không gây lỗi trang web TikTok.

