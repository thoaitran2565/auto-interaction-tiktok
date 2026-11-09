# Implementation Plan: Tùy chọn bình luận đầu tiên & Tự động tương tác liên tục (Auto Interaction Flow)

**Branch**: `004-description-auto-interact` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-description-auto-interact/spec.md`

## Summary

Triển khai 2 chức năng nâng cao cho tiện ích TikTok Auto Interaction:
1. **Chế độ bình luận đầu tiên (First Comment Mode)**: Cho phép người dùng tùy chọn bình luận bằng cách lấy chính xác bình luận cấp 1 đầu tiên của người xem khác trên video TikTok (loại trừ bình luận của tác giả và bình luận được ghim), ví dụ như `"tui muốn đi nhầm cả đời"` trong `page.html`.
2. **Luồng Auto tương tác liên tục (Continuous Auto-Interaction Flow)**: Cung cấp nút điều khiển **"Auto tương tác"** thực hiện chu trình lặp: Thả tim -> Bình luận (theo chế độ đã chọn) -> Đếm ngược thời gian chờ -> Chuyển video tiếp theo bằng nút mũi tên xuống (`feed-navigation-next` / `ArrowDown`). Hỗ trợ cấu hình thời gian chờ (3s - 15s), giới hạn số video tối đa (10, 20, 50 hoặc Không giới hạn), và nút Dừng an toàn tức thì.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2022+), HTML5, CSS3  
**Primary Dependencies**: None (Chrome Extension APIs: `chrome.storage.local`, `chrome.tabs`, `chrome.runtime`)  
**Storage**: `chrome.storage.local` mở rộng thêm 3 khóa: `commentMode`, `autoInteractDelay`, `maxVideos`  
**Testing**: Kiểm thử tương tác trực tiếp theo [quickstart.md](./quickstart.md) và đối chiếu DOM với `page.html`  
**Target Platform**: Các trình duyệt Chromium (Google Chrome 116+, Microsoft Edge, Brave)  
**Project Type**: Browser Extension (Manifest V3)  
**Performance Goals**:
- Trích xuất bình luận đầu tiên của người xem: < 150ms
- Chuyển tiếp video bằng `feed-navigation-next`: < 200ms
- Phản hồi nút Dừng khẩn cấp: < 300ms
**Constraints**:
- Không can thiệp trực tiếp vào DOM Draft.js (`textContent`), duy trì cơ chế synthetic paste an toàn
- Khi video bị tắt bình luận, lập tức bỏ qua và chuyển video tiếp theo không cần đếm ngược chờ

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Đơn giản & Trực quan (Simplicity)**: Đạt. Giao diện tích hợp gọn gàng trong Side Panel, nút Auto tương tác có màu sắc nhận diện rõ ràng và bộ đếm tiến độ trực quan.
- **An toàn tài khoản**: Đạt. Cho phép cấu hình thời gian giãn cách linh hoạt (3s, 5s, 8s, 10s, 15s) và giới hạn số video tối đa để mô phỏng hành vi tự nhiên của con người.
- **Dừng an toàn (Fail-safe)**: Đạt. Cờ `isAutoFlowRunning` và `abortController` cho phép người dùng ngắt chu trình lặp tại bất kỳ thời điểm nào.

## Project Structure

### Documentation (this feature)

```text
specs/004-description-auto-interact/
├── spec.md              # Đặc tả tính năng và các quyết định làm rõ
├── plan.md              # Kế hoạch triển khai kiến trúc (file này)
├── research.md          # Nghiên cứu kỹ thuật DOM chuyển video & lọc tác giả
├── data-model.md        # Mô hình dữ liệu lưu trữ & máy trạng thái chu trình Auto
├── quickstart.md        # Hướng dẫn kiểm thử nhanh các kịch bản
├── contracts/
│   └── messaging.md     # Hợp đồng giao tiếp Message Passing mở rộng
└── checklists/
    └── requirements.md  # Danh mục kiểm tra chất lượng đặc tả
```

### Source Code (repository root)

```text
auto-interaction-tiktok/
├── manifest.json            # Version 1.4.0
├── sidepanel/
│   ├── sidepanel.html       # Thêm nút Auto tương tác, dropdown chế độ bình luận, delay & max videos
│   ├── sidepanel.css        # Kiểu dáng nút Auto (gradient/active/stop), bộ đếm video
│   ├── sidepanel.js         # Logic vòng lặp Auto tương tác, đếm ngược, tích hợp first_comment
│   └── ai-generator.js      # Giữ nguyên và hỗ trợ nguồn first_comment / general fallback
└── content/
    └── content.js           # Bổ sung trích xuất bình luận đầu tiên của người xem, handler NAVIGATE_NEXT_VIDEO
```

## Complexity Tracking

*Không có vi phạm nguyên tắc kiến trúc.*
