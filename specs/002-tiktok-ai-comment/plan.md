# Implementation Plan: Tự động tạo và gửi bình luận video TikTok bằng AI qua Side Panel

**Branch**: `002-tiktok-ai-comment` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-tiktok-ai-comment/spec.md`

## Summary

Nâng cấp tiện ích mở rộng với tính năng tự động bình luận thông minh bằng AI từ Side Panel: trích xuất chuỗi mô tả video TikTok từ các thẻ `span[data-e2e^="desc-span"]`, gửi qua hàm tạo bình luận AI (kết nối Google Gemini 1.5 Flash API hoặc bộ quy tắc dự phòng ngữ cảnh tự động), tự động mở khung bình luận, nhập văn bản vào thẻ div Draft.js (`div[contenteditable="true"]`) theo cơ chế mô phỏng tự nhiên (focus, click, `insertText`, input events) để kích hoạt nút đăng (`button[data-e2e="comment-post"]`) từ `disabled` sang enabled và tiến hành gửi bình luận.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2022+), HTML5, CSS3  
**Primary Dependencies**: None (Google Gemini REST API via `fetch`, Chrome Extension Storage & Messaging APIs)  
**Storage**: `chrome.storage.local` (lưu trữ `geminiApiKey`, `commentStyle`, `autoSubmit`)  
**Testing**: Kiểm thử thủ công qua Chrome Developer Mode theo [quickstart.md](./quickstart.md) và đối chiếu DOM với `page.html`  
**Target Platform**: Các trình duyệt Chromium (Google Chrome 116+, Microsoft Edge, Brave)  
**Project Type**: Browser Extension (Manifest V3)  
**Performance Goals**:
- Trích xuất mô tả video: < 200ms
- Sinh câu bình luận AI và hoàn tất đăng: < 3.0s
**Constraints**:
- Xử lý chính xác thẻ div Draft.js `[contenteditable="true"]` của TikTok để nút gửi không bị kẹt ở trạng thái `disabled=""`
- Quyền truy cập API Gemini trong `manifest.json` host_permissions (`https://generativelanguage.googleapis.com/*`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Đơn giản & Trực quan (Simplicity)**: Đạt. Sử dụng fetch REST API trực tiếp của Gemini thay vì cài đặt thư viện SDK cồng kềnh.
- **Tính độc lập & module hóa**: Đạt. Tách module xử lý AI (`ai-service.js` hoặc tích hợp trong sidepanel), giữ content script chuyên trách về DOM tương tác.
- **Trải nghiệm an toàn**: Đạt. Cung cấp tùy chọn cho phép người dùng xem trước và duyệt câu bình luận trước khi gửi (tùy chọn `autoSubmit`).

## Project Structure

### Documentation (this feature)

```text
specs/002-tiktok-ai-comment/
├── plan.md              # Kế hoạch triển khai kiến trúc
├── research.md          # Nghiên cứu kỹ thuật & quyết định kiến trúc
├── data-model.md        # Mô hình dữ liệu & chuỗi tương tác
├── quickstart.md        # Hướng dẫn kiểm thử nhanh
├── contracts/
│   └── messaging.md     # Hợp đồng giao tiếp Message Passing
└── checklists/
    └── requirements.md  # Danh mục kiểm tra chất lượng đặc tả
```

### Source Code (repository root)

```text
auto-interaction-tiktok/
├── manifest.json            # Bổ sung host_permissions cho Google Generative Language API & storage permission
├── background.js            # Service worker duy trì mở Side Panel
├── sidepanel/
│   ├── sidepanel.html       # Bổ sung nút "Tự động bình luận", card cấu hình AI, dropdown phong cách
│   ├── sidepanel.css        # Bổ sung kiểu dáng cho nút bình luận, form cài đặt AI và preview bình luận
│   ├── sidepanel.js         # Logic điều phối: lấy mô tả -> gọi AI -> yêu cầu gửi bình luận
│   └── ai-generator.js      # Module kết nối Gemini API & Smart Context Fallback
├── content/
│   └── content.js           # Bổ sung trích xuất span mô tả, mở khung comment, nhập liệu vào thẻ div Draft.js, kích hoạt nút post
└── icons/                   # Icon tiện ích
```

**Structure Decision**: Giữ nguyên kiến trúc chuẩn MV3 của dự án, bổ sung module `ai-generator.js` để cô lập logic AI độc lập và mở rộng chức năng trong `content.js` và `sidepanel/`.

## Complexity Tracking

*Không có vi phạm nguyên tắc kiến trúc cần theo dõi.*
