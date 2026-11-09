# Implementation Plan: Tiện ích mở rộng tự động thả tim video TikTok qua Side Panel

**Branch**: `001-tiktok-auto-like` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-tiktok-auto-like/spec.md`

## Summary

Xây dựng tiện ích mở rộng Chrome Manifest V3 cho phép người dùng mở bảng điều khiển Side Panel bằng 1 cú nhấp vào biểu tượng tiện ích. Tại giao diện Side Panel, người dùng nhấn nút "Bắt đầu" để tự động phát hiện video TikTok đang xem trên tab hiện hành và thực hiện thao tác thả tim an toàn (kiểm tra trạng thái đã like để tránh unlike nhầm, kích hoạt thông qua selector phần tử thích DOM ổn định `[data-e2e="like-icon"]` kết hợp dự phòng bàn phím phím 'L' và cử chỉ click đúp).

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2022+), HTML5, CSS3  
**Primary Dependencies**: None (Standard Web & Chrome Extension APIs: `chrome.sidePanel`, `chrome.tabs`, `chrome.scripting`)  
**Storage**: `chrome.storage.local` (nếu cần lưu cấu hình phương thức thả tim)  
**Testing**: Kiểm thử đầu-cuối qua Chrome Developer Mode (Unpacked Extension) theo [quickstart.md](./quickstart.md)  
**Target Platform**: Các trình duyệt Chromium (Google Chrome 116+, Microsoft Edge, Brave, v.v.)  
**Project Type**: Browser Extension (Manifest V3)  
**Performance Goals**:
- Mở Side Panel tức thì (< 300ms)
- Hoàn tất thao tác thả tim và phản hồi UI trong vòng < 1.0s
**Constraints**:
- Tuân thủ quy định bảo mật Chrome Extension Manifest V3 (Context Isolation, không dùng `eval`)
- Tương thích tốt với giao diện trang web TikTok hiện hành
**Scale/Scope**:
- 1 tiện ích mở rộng gọn nhẹ (< 100KB) gồm Side Panel, Service Worker và Content Script

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Đơn giản & Trực quan (Simplicity)**: Đạt. Không lạm dụng framework nặng hay bundler cồng kềnh; mã nguồn thuần giúp dễ đọc, dễ kiểm thử và chạy nhanh.
- **Tính độc lập & module hóa**: Đạt. Tách biệt rõ ràng giữa Service Worker (`background.js`), UI (`sidepanel/`) và tương tác trang web (`content/`).
- **An toàn tương tác**: Đạt. Thiết kế có cơ chế kiểm tra `aria-pressed` để đảm bảo không hủy like video đã thích trước đó.

## Project Structure

### Documentation (this feature)

```text
specs/001-tiktok-auto-like/
├── plan.md              # Kế hoạch triển khai kiến trúc
├── research.md          # Kết quả nghiên cứu kỹ thuật & quyết định kiến trúc
├── data-model.md        # Mô hình thực thể & trạng thái
├── quickstart.md        # Hướng dẫn chạy & kịch bản kiểm thử
├── contracts/
│   └── messaging.md     # Hợp đồng giao tiếp Message Passing giữa các tầng
└── checklists/
    └── requirements.md  # Danh mục kiểm tra chất lượng đặc tả
```

### Source Code (repository root)

```text
auto-interaction-tiktok/
├── manifest.json            # Khai báo cấu hình Manifest V3 & quyền Side Panel
├── background.js            # Service worker cấu hình setPanelBehavior
├── sidepanel/
│   ├── sidepanel.html       # Giao diện HTML của bảng điều khiển cạnh
│   ├── sidepanel.css        # Giao diện CSS hiện đại (phong cách tối giản)
│   └── sidepanel.js         # Logic điều khiển, nhận diện tab và gửi message
├── content/
│   ├── content.js           # Content script phân tích DOM TikTok và kích hoạt thả tim
│   └── selectors.js         # Tập hợp các selector và hàm hỗ trợ tương tác video (tùy chọn chia tách)
└── icons/
    ├── icon16.png           # Biểu tượng kích thước 16x16
    ├── icon48.png           # Biểu tượng kích thước 48x48
    └── icon128.png          # Biểu tượng kích thước 128x128
```

**Structure Decision**: Cấu trúc extension Manifest V3 chuẩn mực, rõ ràng, tách biệt giữa logic background, giao diện side panel và content script.

## Complexity Tracking

*Không có vi phạm nguyên tắc kiến trúc cần theo dõi.*
