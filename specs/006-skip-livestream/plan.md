# Implementation Plan: Auto Skip Livestream Videos

**Branch**: `006-skip-livestream` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-skip-livestream/spec.md`

## Summary

Triển khai tính năng tự động nhận diện video dạng Livestream xuất hiện trên bảng tin TikTok (For You feed) thông qua các chỉ báo DOM đặc thù đã xác thực từ `page2.html` (nút "Xem LIVE", `.live-desc`, `DivLiveUnavailableContainer`, `[data-e2e="live-like-icon"]`), và tự động chuyển tiếp ngay sang video kế tiếp (bỏ qua Like, Follow, Comment) khi tính năng này được kích hoạt.

## Technical Context

**Language/Version**: JavaScript (ES6+), Chrome Extensions Manifest V3
**Primary Dependencies**: Không có (Vanilla JS, Chrome Extension Runtime & Tabs API, DOM APIs)
**Storage**: `chrome.storage.local` (Khóa: `skipLivestream`, kiểu `boolean`, mặc định: `true`)
**Testing**: Kiểm thử tương tác trực tiếp trên feed TikTok với video Livestream & video thông thường
**Target Platform**: Chromium-based browsers (Chrome, Edge, Brave, v.v.)
**Project Type**: Chrome Extension (Content Scripts + Sidepanel UI)
**Performance Goals**: Phát hiện Livestream trong vòng 1.5s - 2.0s; chuyển tiếp video an toàn sau 500ms - 800ms
**Constraints**: Manifest V3 compliant, non-destructive DOM interactions, no external eval

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Nguyên tắc MV3 Compliance: ĐẠT (Không sử dụng eval hoặc remote script, sử dụng message passing nội bộ).
- Nguyên tắc Bền vững UI & Không chặn luồng chính: ĐẠT (Kiểm tra DOM với polling có timeout tối đa 2s, ngắt quãng an toàn qua `interruptibleSleepMs`).
- Nguyên tắc Tương thích ngược: ĐẠT (Không làm thay đổi hành vi của video thông thường hoặc cấu hình trước đó).

## Project Structure

### Documentation (this feature)

```text
specs/006-skip-livestream/
├── plan.md              # Kế hoạch triển khai kiến trúc
├── research.md          # Kết quả nghiên cứu bộ chọn DOM & hành vi skip
├── data-model.md        # Cấu trúc dữ liệu & runtime protocol
├── quickstart.md        # Kịch bản kiểm thử tính năng
├── contracts/           # Đặc tả schema thông điệp (JSON schema)
│   └── livestream-detector.json
└── tasks.md             # Danh sách tác vụ triển khai (sẽ tạo bởi /speckit-tasks)
```

### Source Code Layout

```text
content/
└── content.js           # Bổ sung hàm detectLivestream() và handler action CHECK_LIVESTREAM, tích hợp vào GET_ACTIVE_VIDEO_INFO

sidepanel/
├── sidepanel.html       # Bổ sung checkbox "Tự động bỏ qua Livestream"
├── sidepanel.js         # Lưu/tải skipLivestream từ storage; tích hợp kiểm tra isLivestream vào vòng lặp tương tác chính
└── sidepanel.css        # Tinh chỉnh giao diện checkbox nhất quán
```

**Structure Decision**: Giữ nguyên kiến trúc module đơn giản và hiệu quả hiện tại của extension, không thêm thư viện bên ngoài.

## Complexity Tracking

Không có vi phạm hay độ phức tạp vượt chuẩn nào cần biện minh.
