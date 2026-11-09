# Research & Technical Decisions: TikTok AI Auto-Comment

**Feature**: `002-tiktok-ai-comment`  
**Date**: 2026-11-05

## 1. Cơ chế trích xuất mô tả video TikTok

### Decision
Trích xuất chuỗi mô tả từ phần tử `span[data-e2e^="desc-span"]` nằm bên trong container video đang active:
1. Tìm phần tử chứa mô tả trong active video:
   - Selector chính: `[data-e2e^="desc-span"]` bên trong `div[data-e2e="video-desc"]` hoặc `div[data-e2e="multiline-text-content"]`.
   - Selector dự phòng: `div[data-e2e="video-desc"]`, `h1[data-e2e="browse-video-desc"]`.
2. Gom toàn bộ nội dung text của các thẻ span mô tả, loại bỏ chuỗi rỗng thừa.
3. Làm sạch (sanitize): Tách các hashtag (`#tag`) để ưu tiên giữ lại câu văn mô tả cảm xúc/nội dung chính. Nếu video chỉ có hashtag hoặc không có mô tả, trả về chuỗi mô tả đại diện hoặc chủ đề hashtag.

### Rationale
- Khảo sát trực tiếp từ `page.html`:
  ```html
  <span class="TUXText TUXText--tiktok-sans css-u0d6t3-7937d88b--StyledTUXText e1gw1eda0" letter-spacing="0.09380000000000001" data-e2e="desc-span-0_-1" ...>Nghĩ nhiêu chuyện trong đời </span>
  ```
  Selector `data-e2e^="desc-span"` là thuộc tính kiểm thử ổn định của TikTok Web và chứa chính xác văn bản hiển thị.

---

## 2. Mô hình AI sinh bình luận (Gemini API & Fallback)

### Decision
1. **Mô hình chính (Google Gemini API)**:
   - Sử dụng model `gemini-1.5-flash` qua endpoint REST API:
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}`
   - Gọi trực tiếp từ extension (Side Panel hoặc Service Worker), khai báo host permission `https://generativelanguage.googleapis.com/*` trong `manifest.json`.
   - Prompt tinh chỉnh:
     ```text
     Bạn là người dùng TikTok Việt Nam bình thường, trẻ trung, tự nhiên. Hãy tạo 1 câu bình luận tương tác cực kỳ ngắn gọn (dưới 15 từ, tiếng Việt) cho video có mô tả dưới đây. Phong cách: {style}. Không dùng dấu ngoặc kép, không giải thích, chỉ trả về đúng câu bình luận.
     Mô tả video: "{description}"
     ```
2. **Bộ quy tắc dự phòng thông minh (Rule-based Fallback)**:
   - Khi chưa có API key hoặc khi API gặp sự cố mạng: Sử dụng bộ sinh phản hồi theo ngữ cảnh tiếng Việt (phân tích từ khóa mô tả: vui vẻ, nhảy múa, tâm trạng, âm nhạc, đồ ăn, hài hước, v.v.) kết hợp phong cách người dùng đã chọn. Đảm bảo tính năng luôn hoạt động mà không bị gián đoạn.

### Rationale
- Gemini 1.5 Flash có tốc độ phản hồi cực nhanh (< 1.2s), chi phí miễn phí hạn mức cao từ Google AI Studio, sinh tiếng Việt tự nhiên và chuẩn phong cách mạng xã hội.
- Bộ fallback đảm bảo người dùng mới cài extension có thể trải nghiệm ngay lập tức mà không bắt buộc phải có API key trước.

---

## 3. Cơ chế tương tác với khung bình luận Draft.js (thẻ div)

### Decision
Mô phỏng chuỗi tương tác người dùng gồm 4 bước chuẩn xác:
1. **Mở khung bình luận nếu đang đóng**:
   - Nếu không thấy `[data-e2e="comment-input"]`, tìm và nhấp `button[data-e2e="comment-icon"]` để mở sidebar bình luận, chờ trong 300ms.
2. **Kích hoạt tiêu điểm (Focus & Click)**:
   - Định vị `editor = document.querySelector('[data-e2e="comment-input"] [contenteditable="true"]')`.
   - Gọi `editor.focus()` và `editor.click()`.
   - Đặt con trỏ văn bản (Selection & Range) vào cuối khối văn bản của editor.
3. **Nhập nội dung văn bản**:
   - Sử dụng `document.execCommand('insertText', false, text)` — đây là lệnh tiêu chuẩn được Draft.js lắng nghe để cập nhật EditorState nội bộ.
   - Bổ sung phát sự kiện `InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: text })` để đảm bảo React state nhận biết thay đổi.
4. **Kiểm tra trạng thái kích hoạt nút gửi (Enable Check) và nhấp gửi**:
   - Định vị `button[data-e2e="comment-post"]`.
   - Chờ tối đa 1.5 giây (kiểm tra định kỳ mỗi 100ms) cho đến khi thuộc tính `disabled` bị gỡ bỏ.
   - Khi nút đã enabled, kích hoạt `.click()`.

### Rationale
- Khung bình luận của TikTok trên Web sử dụng Draft.js được bao bọc trong thẻ `div[contenteditable="true"]`. Việc gán thuộc tính `.innerText` hay `.value` sẽ bị React virtual DOM ghi đè và nút gửi sẽ vĩnh viễn ở trạng thái `disabled=""`.
- Chuỗi thao tác `focus` -> `insertText` -> `input event` là phương pháp chuẩn mực duy nhất để kích hoạt state của Draft.js trên TikTok Web.

