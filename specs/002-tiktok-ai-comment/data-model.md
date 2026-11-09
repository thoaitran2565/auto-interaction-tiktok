# Data Model: TikTok AI Auto-Comment

**Feature**: `002-tiktok-ai-comment`  
**Date**: 2026-11-05

## 1. Entities

### 1.1. `CommentSettings` (Cấu hình người dùng lưu trong `chrome.storage.local`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `geminiApiKey` | `string` | `""` | Khóa API cá nhân của Google AI Studio |
| `commentStyle` | `string` | `"friendly"` | Phong cách bình luận: `"friendly"` (thân thiện), `"compliment"` (khen ngợi), `"humorous"` (hài hước), `"question"` (gợi mở) |
| `autoSubmit` | `boolean` | `true` | Tự động nhấn gửi (`true`) hoặc chỉ điền sẵn để người dùng bấm gửi (`false`) |

### 1.2. `ExtractDescriptionResponse` (Kết quả trích xuất mô tả từ tab TikTok)

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Trạng thái trích xuất thành công |
| `description` | `string` | Chuỗi văn bản mô tả trích xuất từ các thẻ `span[data-e2e^="desc-span"]` |
| `hashtags` | `string[]` | Danh sách các hashtag đính kèm |
| `canComment` | `boolean` | Video có mở tính năng bình luận hay không |

### 1.3. `PostCommentRequest` (Thông điệp yêu cầu điền và gửi bình luận)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | `string` | Có | Định danh hành động: `"POST_COMMENT"` |
| `text` | `string` | Có | Câu bình luận cần nhập vào ô soạn thảo |
| `autoSubmit` | `boolean` | Có | Có tự động bấm nút đăng hay không |

### 1.4. `PostCommentResponse` (Kết quả thao tác từ Content Script)

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Trạng thái hoàn tất |
| `code` | `string` | `"POSTED"` \| `"TEXT_FILLED"` \| `"COMMENTS_DISABLED"` \| `"BUTTON_DISABLED"` \| `"ERROR"` |
| `message` | `string` | Thông báo chi tiết hiển thị cho người dùng |

---

## 2. Interaction Sequence

```text
[User clicks "Tự động bình luận"]
               │
               ▼
   [SidePanel: updateActiveTab]
               │
               ▼
[SidePanel -> ContentScript: GET_VIDEO_DESC]
               │
               ▼ (Trích xuất span[data-e2e^="desc-span"])
[ContentScript -> SidePanel: { description, canComment }]
               │
               ▼ (Gọi AI Gemini API hoặc Smart Fallback)
[SidePanel: generateAIComment(description, style, apiKey)]
               │
               ▼
[SidePanel -> ContentScript: POST_COMMENT({ text, autoSubmit })]
               │
               ▼ (Focus div[contenteditable], insertText, wait enabled, click post)
[ContentScript -> SidePanel: { success: true, code: "POSTED" }]
               │
               ▼
[SidePanel: Hiển thị thông báo thành công + xem trước câu bình luận]
```

