# Implementation Plan: Lưu cấu hình, xử lý bình luận dự phòng thông minh và tối ưu kết nối AI

**Branch**: `003-description-comment-fallback-persistence` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-description-comment-fallback-persistence/spec.md`

## Summary

Triển khai 3 cải tiến quan trọng cho tiện ích TikTok Auto Interaction:
1. **Lưu trữ cấu hình toàn diện (Settings Persistence)**: Lưu bền vững toàn bộ 4 tùy chọn (`likeMethod`, `geminiApiKey`, `commentStyle`, `autoSubmit`) vào `chrome.storage.local`, tự động cập nhật ngay khi thay đổi và khôi phục chính xác khi Side Panel mở lên.
2. **Cơ chế bình luận dự phòng thông minh khi video không có mô tả (Multi-tier Fallback)**: Quét các bình luận sẵn có (`span[data-e2e^="comment-level"]`) trên video TikTok để chọn ngẫu nhiên 1 bình luận văn bản phù hợp; nếu video hoàn toàn không có bình luận hoặc không có văn bản, tự động chọn ngẫu nhiên một câu tương tác tự nhiên từ kho bình luận tiếng Việt đa dạng.
3. **Tối ưu hóa và minh bạch hóa kết nối Gemini AI (AI Model Diagnostics & Feedback)**: Hỗ trợ model `gemini-1.5-flash` và fallback `gemini-2.0-flash`, bổ sung tính năng kiểm tra API Key trực tiếp, bắt và báo lỗi cụ thể (sai key, hết hạn quota, lỗi mạng), hiển thị huy hiệu nguồn gốc câu bình luận rõ ràng trên giao diện.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2022+), HTML5, CSS3  
**Primary Dependencies**: Google Gemini REST API via `fetch`, Chrome Extension Storage API (`chrome.storage.local`), Chrome Runtime Messaging API  
**Storage**: `chrome.storage.local` lưu các khóa: `likeMethod`, `geminiApiKey`, `commentStyle`, `autoSubmit`  
**Testing**: Kiểm thử tương tác qua Chrome Developer Mode theo [quickstart.md](./quickstart.md), xác thực DOM bình luận với `page.html`  
**Target Platform**: Các trình duyệt Chromium (Google Chrome 116+, Edge, Brave, Cốc Cốc)  
**Project Type**: Browser Extension (Manifest V3)  
**Performance Goals**:
- Khôi phục cấu hình từ storage: < 50ms khi mở Side Panel
- Quét bình luận sẵn có từ DOM TikTok: < 150ms
- Gọi Gemini API & hiển thị câu bình luận: < 2.5s (kèm báo lỗi tức thì nếu API key không hợp lệ)
**Constraints**:
- Tuân thủ Manifest V3, không dùng `eval` hay thư viện ngoài
- Tuyệt đối không can thiệp trực tiếp vào DOM Draft.js (`textContent`), sử dụng synthetic paste an toàn
- Host permissions: `*://*.tiktok.com/*` và `https://generativelanguage.googleapis.com/*`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Đơn giản & Trực quan (Simplicity)**: Đạt. Tận dụng `chrome.storage.local` và fetch API trực tiếp, bổ sung nút "Kiểm tra API Key" giúp người dùng tự chẩn đoán lỗi trong 1 cú nhấp chuột.
- **Tính tự động hóa không làm phiền**: Đạt. Tự động lưu cấu hình khi người dùng chọn dropdown hoặc checkbox, không bắt buộc phải bấm nút Lưu mới có hiệu lực.
- **Bảo toàn dữ liệu & Không sập ứng dụng**: Đạt. Cơ chế bình luận đa tầng (Caption -> Gemini -> Existing Comments -> General Fallback) đảm bảo 100% video đều có bình luận phù hợp mà không bao giờ gặp lỗi gián đoạn.

## Project Structure

### Documentation (this feature)

```text
specs/003-description-comment-fallback-persistence/
├── spec.md              # Đặc tả tính năng
├── plan.md              # Kế hoạch triển khai kiến trúc (file này)
├── research.md          # Nghiên cứu kỹ thuật & quyết định kiến trúc
├── data-model.md        # Mô hình dữ liệu lưu trữ & trích xuất bình luận
├── quickstart.md        # Hướng dẫn kiểm thử nhanh
├── contracts/
│   └── messaging.md     # Hợp đồng giao tiếp Message Passing mở rộng
└── checklists/
    └── requirements.md  # Danh mục kiểm tra chất lượng đặc tả
```

### Source Code (repository root)

```text
auto-interaction-tiktok/
├── manifest.json            # Version 1.2.0, permissions (storage, scripting, sidePanel)
├── sidepanel/
│   ├── sidepanel.html       # Bổ sung nút "Kiểm tra Key", trạng thái kết nối AI
│   ├── sidepanel.css        # Kiểu dáng cho nút kiểm tra API Key và huy hiệu trạng thái mới
│   ├── sidepanel.js         # Lưu/khôi phục tùy chọn, kiểm tra API key, điều phối fallback
│   └── ai-generator.js      # Endpoint đa model, xử lý lỗi chi tiết, kho bình luận ngẫu nhiên tổng quát
└── content/
    └── content.js           # Bổ sung trích xuất existing comments ([data-e2e^="comment-level"]), version bump
```

**Structure Decision**: Duy trì kiến trúc phân tầng sạch: `content.js` phụ trách DOM TikTok; `sidepanel.js` phụ trách giao diện và lưu trữ; `ai-generator.js` phụ trách kết nối AI và kho bình luận dự phòng.

## Complexity Tracking

*Không có vi phạm nguyên tắc kiến trúc.*
