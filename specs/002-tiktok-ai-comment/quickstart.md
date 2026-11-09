# Quickstart & Validation Guide: TikTok AI Auto-Comment

**Feature**: `002-tiktok-ai-comment`  
**Date**: 2026-11-05

Hướng dẫn kiểm thử tính năng tự động comment bằng AI từ Side Panel tiện ích.

---

## 1. Cài đặt / Cập nhật Extension

1. Mở Chrome/Edge tại `chrome://extensions` (bật Developer mode).
2. Nhấp vào biểu tượng làm mới (Reload) tại thẻ tiện ích **TikTok Auto Interaction**.
3. Mở tab [tiktok.com](https://www.tiktok.com) và mở Side Panel của tiện ích.

---

## 2. Kịch bản kiểm thử End-to-End

### Kịch bản 1: Tự động bình luận chế độ mặc định (Fallback không cần API key)
1. Mở một video TikTok bất kỳ có mô tả (ví dụ video ở `page.html` có mô tả: "Nghĩ nhiêu chuyện trong đời").
2. Trên Side Panel, nhấp vào nút **"Tự động bình luận"**.
3. **Kỳ vọng**:
   - Khung bình luận của TikTok tự động mở ra.
   - Thẻ div soạn thảo `[contenteditable="true"]` được focus và nhập câu bình luận liên quan ngắn gọn.
   - Nút đăng `button[data-e2e="comment-post"]` chuyển sang trạng thái enabled và được kích hoạt click gửi.
   - Side Panel hiển thị thông báo thành công và nội dung câu bình luận vừa đăng.

### Kịch bản 2: Tự động bình luận với Gemini API Key
1. Trên Side Panel, mở phần **Cài đặt AI**.
2. Nhập Gemini API Key hợp lệ và chọn phong cách "Hài hước" hoặc "Khen ngợi".
3. Nhấp **"Lưu cài đặt"**.
4. Bấm **"Tự động bình luận"** trên một video TikTok.
5. **Kỳ vọng**:
   - Câu bình luận do Gemini 1.5 Flash sinh ra phản ánh đúng phong cách đã chọn.
   - Bình luận được đăng tải thành công lên TikTok.

### Kịch bản 3: Tùy chọn "Chỉ điền nội dung, không tự động gửi"
1. Trong phần Cài đặt AI, bỏ chọn "Tự động gửi bình luận".
2. Nhấn nút "Tự động bình luận".
3. **Kỳ vọng**:
   - Câu bình luận được điền vào ô soạn thảo, nút gửi được bật enabled nhưng chưa được click.
   - Người dùng có thể kiểm tra hoặc chỉnh sửa trước khi tự tay nhấn nút gửi trên TikTok.

