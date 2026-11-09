# Tasks: Tiện ích mở rộng tự động thả tim video TikTok qua Side Panel

**Input**: Design documents from `/specs/001-tiktok-auto-like/`  
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/messaging.md](./contracts/messaging.md), [quickstart.md](./quickstart.md)

**Tests**: Kiểm thử trực tiếp (Manual / End-to-End via Chrome Unpacked) theo kịch bản tại [quickstart.md](./quickstart.md).

**Organization**: Các nhiệm vụ được nhóm theo User Story nhằm phục vụ phát triển độc lập và kiểm thử theo từng giai đoạn.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Có thể thực hiện song song (các file khác nhau, không phụ thuộc vào task chưa hoàn thành)
- **[Story]**: Đánh dấu User Story mà nhiệm vụ đó thuộc về ([US1], [US2], [US3])
- Mỗi mô tả đều chỉ định đường dẫn tập tin cụ thể

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Khởi tạo cấu trúc dự án và tài nguyên cơ bản của tiện ích mở rộng

- [X] T001 Khởi tạo cấu trúc thư mục dự án và tạo các file icon tiện ích `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`
- [X] T002 [P] Định nghĩa tệp cấu hình Chrome Extension Manifest V3 với đầy đủ quyền hạn (`sidePanel`, `activeTab`, `scripting`, `tabs`) trong `manifest.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Nền tảng cốt lõi bắt buộc phải hoàn thành trước khi triển khai các User Story

- [X] T003 Thiết lập Service Worker cấu hình `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` trong `background.js`
- [X] T004 [P] Xây dựng bộ khung Content Script lắng nghe message passing trong `content/content.js`

**Checkpoint**: Nền tảng tiện ích và cơ chế nạp Side Panel đã sẵn sàng để tích hợp User Story.

---

## Phase 3: User Story 1 - Mở giao diện điều khiển Side Panel từ biểu tượng tiện ích (Priority: P1) 🎯 MVP

**Goal**: Người dùng nhấp vào icon extension trên thanh công cụ thì trình duyệt mở ngay Side Panel giao diện điều khiển.

**Independent Test**: Nạp extension vào trình duyệt, nhấp icon tiện ích trên thanh công cụ, xác nhận Side Panel mở ra với đầy đủ bố cục header, nội dung và nút bấm.

### Implementation for User Story 1

- [X] T005 [US1] Xây dựng cấu trúc HTML cho Side Panel gồm header, vùng điều khiển nút bấm và thông báo trạng thái trong `sidepanel/sidepanel.html`
- [X] T006 [P] [US1] Thiết kế stylesheet giao diện hiện đại, thân thiện, tương thích chế độ sáng/tối trong `sidepanel/sidepanel.css`
- [X] T007 [US1] Cài đặt script khởi chạy giao diện Side Panel và thiết lập sự kiện sẵn sàng trong `sidepanel/sidepanel.js`

**Checkpoint**: User Story 1 hoàn thành độc lập - tiện ích mở được Side Panel trên trình duyệt.

---

## Phase 4: User Story 2 - Kích hoạt tự động thả tim video TikTok đang xem (Priority: P1)

**Goal**: Khi người dùng nhấn nút "Bắt đầu" trong Side Panel, tiện ích tự động thả tim video TikTok đang xem trên tab hiện hành mà không bỏ thích video đã like.

**Independent Test**: Mở video TikTok trên tab hoạt động, nhấn "Bắt đầu" trên Side Panel và xác nhận video chuyển sang trạng thái đã thích (tim đỏ).

### Implementation for User Story 2

- [X] T008 [US2] Cài đặt hàm phát hiện video active, kiểm tra trạng thái thích `aria-pressed === 'true'` và kích hoạt click nút like (`[data-e2e="like-icon"]` / `[data-key-interaction="action_like"]`) trong `content/content.js`
- [X] T009 [P] [US2] Cài đặt phương thức dự phòng thả tim bằng cách dispatch phím tắt 'L' và cử chỉ click đúp video trong `content/content.js`
- [X] T010 [US2] Cài đặt sự kiện click nút "Bắt đầu", truy vấn tab hiện hành và gửi thông điệp `LIKE_ACTIVE_VIDEO` sang Content Script trong `sidepanel/sidepanel.js`
- [X] T011 [US2] Cài đặt cơ chế tự động inject Content Script động bằng `chrome.scripting.executeScript` khi gặp tab mở trước khi cài extension trong `sidepanel/sidepanel.js`

**Checkpoint**: User Story 2 hoàn thành - thao tác thả tim video TikTok tự động hoạt động chính xác và an toàn.

---

## Phase 5: User Story 3 - Phản hồi trạng thái hoạt động trên Side Panel (Priority: P2)

**Goal**: Side Panel hiển thị phản hồi trạng thái rõ ràng trực quan (đang xử lý, thả tim thành công, video đã tim từ trước, tab không phải TikTok, hoặc lỗi không tìm thấy video).

**Independent Test**: Thử nghiệm nhấn nút trên tab không phải TikTok, tab TikTok có video, tab TikTok không có video để quan sát phản hồi trạng thái trên Side Panel.

### Implementation for User Story 3

- [X] T012 [US3] Cài đặt logic kiểm tra URL tab hiện hành và hiển thị cảnh báo khi không phải tên miền TikTok trong `sidepanel/sidepanel.js`
- [X] T013 [US3] Quản lý máy trạng thái UI (`idle`, `processing`, `success`, `already_liked`, `error`), khóa nút bấm chống spam click và tự động reset trạng thái sau thời gian chờ trong `sidepanel/sidepanel.js`
- [X] T014 [P] [US3] Bổ sung các class CSS định kiểu trực quan cho các trạng thái kết quả (success, warning, error, spinner đang xử lý) trong `sidepanel/sidepanel.css`

**Checkpoint**: Cả 3 User Story đều hoạt động hoàn chỉnh, phản hồi trạng thái trực quan và thân thiện với người dùng.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hoàn thiện tài liệu, kiểm định chất lượng và tối ưu hóa tổng thể

- [X] T015 Kiểm thử xác thực toàn diện các kịch bản thực tế dựa trên tài liệu mẫu `page.html` và hướng dẫn trong `specs/001-tiktok-auto-like/quickstart.md`
- [X] T016 [P] Viết tài liệu hướng dẫn cài đặt, sử dụng và cơ chế hoạt động của tiện ích trong `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Có thể bắt đầu ngay lập tức.
- **Foundational (Phase 2)**: Phụ thuộc vào Setup - chặn các User Story tiếp theo.
- **User Story 1 (Phase 3)**: Phụ thuộc vào Foundational hoàn thành.
- **User Story 2 (Phase 4)**: Phụ thuộc vào User Story 1 (cần UI Side Panel để gắn nút bấm).
- **User Story 3 (Phase 5)**: Hoàn thiện lớp hiển thị trạng thái nâng cao trên UI và logic xử lý của US1 & US2.
- **Polish (Phase 6)**: Thực hiện sau khi hoàn thành các User Story.

### Parallel Opportunities

- `T002` có thể làm song song với `T001`.
- `T004` có thể làm song song với `T003`.
- `T006` có thể làm song song với `T005`.
- `T009` có thể làm song song với `T008`.
- `T014` có thể làm song song với `T012`, `T013`.
- `T016` có thể làm song song với `T015`.

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Hoàn thành Phase 1 (Setup) và Phase 2 (Foundational).
2. Hoàn thành Phase 3 (US1 - Mở Side Panel).
3. Hoàn thành Phase 4 (US2 - Bấm nút thả tim video).
4. Kiểm thử độc lập: Đảm bảo click icon mở sidepanel và bấm nút tim đỏ video TikTok hoạt động trơn tru.

### Incremental Delivery

1. Setup + Foundational -> Khung tiện ích sẵn sàng.
2. User Story 1 -> Side Panel hiển thị hoàn chỉnh.
3. User Story 2 -> Chức năng thả tim video TikTok hoạt động (MVP hoàn chỉnh).
4. User Story 3 -> Phản hồi trạng thái chi tiết, chặn spam click, giao diện sinh động.
5. Polish -> Kiểm thử toàn diện và hoàn thiện `README.md`.
