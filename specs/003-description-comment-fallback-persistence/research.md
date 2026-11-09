# Research & Technical Decisions: Lưu cấu hình, trích xuất bình luận video và tối ưu Gemini AI

## 1. Cơ chế lưu trữ cấu hình bền vững (Settings Persistence)

### Quyết định kỹ thuật
- **API sử dụng**: `chrome.storage.local`.
- **Cơ chế kích hoạt lưu**:
  1. **Tự động lưu ngay khi thay đổi (Auto-save on change)**: Lắng nghe sự kiện `change` trên dropdown phương thức thả tim (`methodSelect`), dropdown phong cách bình luận (`styleSelect`), và checkbox tự động gửi (`autoSubmitCheck`).
  2. **Lưu API Key linh hoạt**: Lắng nghe sự kiện `change` / `blur` trên ô nhập `apiKeyInput`, kết hợp nút bấm rõ ràng "Lưu cài đặt".
  3. **Khôi phục khi khởi tạo (Restore on load)**: Trong sự kiện `DOMContentLoaded` của Side Panel, hàm `loadSettings()` đọc tất cả 4 khóa với giá trị mặc định an toàn:
     - `likeMethod`: `"auto"`
     - `geminiApiKey`: `""`
     - `commentStyle`: `"friendly"`
     - `autoSubmit`: `true`

### Lý do lựa chọn
- Giúp người dùng hoàn toàn không phải cấu hình lại mỗi khi đóng/mở Side Panel hoặc chuyển đổi giữa các tab trình duyệt.
- Tự động lưu giảm thiểu thao tác thủ công và ngăn ngừa việc quên bấm nút "Lưu".

---

## 2. Trích xuất bình luận có sẵn trên video TikTok (Existing Comments Extraction)

### Khảo sát cấu trúc DOM TikTok (dựa trên `page.html`)
- Trong phần danh sách bình luận của video TikTok, mỗi bình luận cấp 1 được bao bọc bởi thẻ:
  ```html
  <span data-e2e="comment-level-1">
    <span class="TUXText ...">Nội dung bình luận</span>
  </span>
  ```
  Các bình luận trả lời (reply) cấp 2:
  ```html
  <span data-e2e="comment-level-2">
    <span class="TUXText ...">Nội dung câu trả lời</span>
  </span>
  ```
- Thẻ bọc ngoài từng bình luận là `div[class*="DivCommentItemWrapper"]` hoặc `div[class*="DivCommentContentWrapper"]`.

### Thuật toán trích xuất và chọn lọc bình luận
1. **Quét phần tử**: Dùng `document.querySelectorAll('[data-e2e^="comment-level"]')`.
2. **Làm sạch & Lọc nội dung**:
   - Loại bỏ khoảng trắng thừa `.trim()`.
   - Bỏ qua các chuỗi quá ngắn (< 3 ký tự).
   - Lọc bỏ các bình luận thuần emoji hoặc nhãn dán bằng biểu thức chính quy:
     `const isEmojiOnly = /^[\p{Emoji}\s\p{P}]+$/u.test(commentText);`
3. **Chọn ngẫu nhiên**:
   - Nếu danh sách hợp lệ có $N > 0$ phần tử:
     `const selected = validComments[Math.floor(Math.random() * validComments.length)];`
   - Nguồn gốc gán là `community_comment`.
4. **Dự phòng cấp cuối (General Fallback)**:
   - Nếu $N = 0$ (video không có bình luận hoặc toàn icon): Chọn ngẫu nhiên 1 câu từ kho `GENERAL_ENGAGING_COMMENTS` tiếng Việt đa dạng (15+ câu tự nhiên, giàu năng lượng). Nguồn gốc gán là `random_general`.

---

## 3. Chẩn đoán và khắc phục lỗi gọi Google Gemini AI

### Nguyên nhân lỗi "Hiện tại chưa lấy được bình luận từ AI"
1. **Thiếu API Key**: Người dùng chưa nhập API Key hoặc chưa lưu vào storage, khiến `apiKeyInput.value` rỗng -> Code lập tức chuyển sang fallback mà không thông báo.
2. **Model Version**: Endpoint đang trỏ cứng vào `gemini-1.5-flash:generateContent`. Tại một số thời điểm hoặc với một số API Key mới, Google yêu cầu model `gemini-1.5-flash-latest` hoặc `gemini-2.0-flash`.
3. **Âm thầm nuốt lỗi (Silent failure)**: Trong `ai-generator.js`, khi `response.ok` là `false` hoặc gặp `catch`, code chỉ ghi `console.warn` và trả về `generateFallbackComment(...)`. Người dùng trên giao diện chỉ thấy câu fallback mà không biết mình sai API Key, hết quota hay bị chặn quyền.

### Giải pháp kỹ thuật
1. **Hỗ trợ Endpoint đa tầng**:
   - Thử `gemini-1.5-flash`.
   - Nếu gặp lỗi 404/Model Not Found, tự động fallback sang `gemini-2.0-flash` hoặc `gemini-1.5-pro`.
2. **Bắt và phân loại lỗi HTTP cụ thể**:
   - `HTTP 400`: API Key không hợp lệ hoặc cấu trúc prompt bị từ chối (`API_KEY_INVALID`).
   - `HTTP 403`: Key bị vô hiệu hóa hoặc chưa kích hoạt Generative Language API (`PERMISSION_DENIED`).
   - `HTTP 429`: Quá giới hạn tần suất / hết quota miễn phí (`RESOURCE_EXHAUSTED`).
   - `TypeError / Failed to fetch`: Lỗi kết nối mạng.
3. **Tính năng "Kiểm tra API Key" trực tiếp trên giao diện**:
   - Thêm nút "Kiểm tra Key" kế bên ô nhập API Key.
   - Khi bấm, tiện ích gửi một request siêu nhỏ (`"Ping"`, `maxOutputTokens: 1`) để xác thực key trong < 1s.
   - Phản hồi ngay lập tức: "✓ API Key hợp lệ và sẵn sàng!" hoặc thông báo chính xác lỗi để người dùng sửa.
4. **Hiển thị huy hiệu nguồn gốc minh bạch**:
   - `✨ Bình luận Gemini AI` (kèm model dùng)
   - `💬 Bình luận lấy từ video` (khi video không caption, lấy từ cộng đồng)
   - `💡 Bình luận thông minh` (khi phân tích từ khóa caption)
   - `🎲 Bình luận ngẫu nhiên` (khi không có caption và không có bình luận)

