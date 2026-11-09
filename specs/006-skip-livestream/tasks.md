# Tasks: Auto Skip Livestream Videos

**Input**: Design documents from `/specs/006-skip-livestream/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/livestream-detector.json, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2])
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Chuẩn bị cấu trúc và hằng số nhận diện Livestream

- [X] T001 Khởi tạo các hằng số nhận diện Livestream (`LIVESTREAM_SELECTORS`, `LIVESTREAM_KEYWORDS`) trong content/content.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Xây dựng hàm lõi phát hiện Livestream trên DOM trang TikTok

- [X] T002 Xây dựng hàm `detectLivestreamIndicator(rootElement)` kiểm tra các chỉ báo `DivLiveUnavailableContainer`, `.live-desc`, nút "Xem LIVE" / "Watch LIVE", và `[data-e2e="live-like-icon"]` trong content/content.js
- [X] T003 Xây dựng hàm polling bất đồng bộ `pollForLivestream(timeoutMs)` quét định kỳ mỗi 200ms trong khoảng 1500ms - 2000ms trong content/content.js

---

## Phase 3: User Story 1 - Tự động phát hiện và bỏ qua video Livestream (Priority: P1) 🎯 MVP

**Goal**: Khi bot gặp một video Livestream trên feed, lập tức phát hiện và chuyển sang video kế tiếp mà không like, comment hay dừng chờ.

**Independent Test**: Chạy Auto Interact trên tab TikTok có video Livestream. Tiện ích phát hiện Livestream trong 1.5s, log `📡 Bỏ qua Livestream`, đợi 800ms rồi tự động next sang video tiếp theo.

### Implementation for User Story 1

- [X] T004 [US1] Đăng ký handler cho action `CHECK_LIVESTREAM` và bổ sung trường `isLivestream` vào phản hồi của `GET_ACTIVE_VIDEO_INFO` trong content/content.js
- [X] T005 [US1] Tích hợp bước kiểm tra Livestream vào đầu vòng lặp tương tác video tại `startAutoInteractionFlow()` trong sidepanel/sidepanel.js
- [X] T006 [US1] Triển khai logic bỏ qua an toàn: hiển thị status `📡 [Video X] Bỏ qua Livestream`, đợi đệm 800ms (`interruptibleSleepMs(800)`), gửi lệnh `NAVIGATE_NEXT_VIDEO` và `continue` vòng lặp trong sidepanel/sidepanel.js

**Checkpoint**: User Story 1 hoàn thành độc lập - bot có thể tự động skip mọi video Livestream trên feed.

---

## Phase 4: User Story 2 - Cấu hình tùy chọn Bỏ qua Livestream trong Sidepanel (Priority: P2)

**Goal**: Cho phép người dùng bật/tắt tùy chọn "Tự động bỏ qua Livestream" trên giao diện Sidepanel và lưu trạng thái vào storage.

**Independent Test**: Bật/tắt checkbox `Tự động bỏ qua Livestream` trên Sidepanel, reload tiện ích và xác nhận trạng thái được lưu/phục hồi chính xác từ `chrome.storage.local`.

### Implementation for User Story 2

- [X] T007 [P] [US2] Bổ sung checkbox `skipLivestreamCheck` với nhãn "Tự động bỏ qua video Livestream" trong sidepanel/sidepanel.html
- [X] T008 [P] [US2] Thêm style tương thích cho checkbox và nhãn mới trong sidepanel/sidepanel.css
- [X] T009 [US2] Tải và lưu cài đặt `skipLivestream` (mặc định: `true`) từ `chrome.storage.local` trong sidepanel/sidepanel.js
- [X] T010 [US2] Ràng buộc logic kiểm tra `skipLivestream`: chỉ thực hiện skip khi checkbox này được bật trong sidepanel/sidepanel.js

**Checkpoint**: Cả User Story 1 và User Story 2 hoạt động hoàn chỉnh, người dùng toàn quyền kiểm soát tính năng.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Đảm bảo chất lượng, tính ổn định và kiểm thử hồi quy

- [X] T011 Kiểm thử hồi quy trên các video thường (bao gồm video có bình luận và video tác giả khóa bình luận) để đảm bảo không bị nhận diện nhầm thành Livestream trong content/content.js
- [X] T012 Kiểm thử cơ chế ngắt quãng tức thì khi người dùng nhấn "Dừng lại" trong lúc đang đợi chuyển video livestream trong sidepanel/sidepanel.js
- [X] T013 Thực hiện kiểm thử toàn diện theo kịch bản trong specs/006-skip-livestream/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Có thể thực hiện ngay.
- **Phase 2 (Foundational)**: Phụ thuộc vào Phase 1; cung cấp hàm nhận diện lõi cho US1.
- **Phase 3 (User Story 1)**: Phụ thuộc vào Phase 2. Đạt chuẩn MVP.
- **Phase 4 (User Story 2)**: T007, T008 có thể làm song song [P]; T009, T010 gắn kết cấu hình với luồng US1.
- **Phase 5 (Polish)**: Kiểm thử toàn diện sau khi hoàn thành US1 và US2.

### Parallel Opportunities
- T007 (HTML) và T008 (CSS) có thể thực hiện song song.
- T004 (content.js) và T007 (sidepanel.html) có thể triển khai song song.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Hoàn thành Phase 1 & Phase 2: xây dựng cơ chế nhận diện Livestream trong `content/content.js`.
2. Hoàn thành Phase 3: tích hợp skip tự động vào vòng lặp `sidepanel/sidepanel.js`.
3. Kiểm thử độc lập trên feed có livestream $\rightarrow$ Đạt MVP!

### Incremental Delivery
1. Giao diện cấu hình (US2): Thêm checkbox bật/tắt vào Sidepanel và lưu vào `chrome.storage.local`.
2. Polish: Chạy toàn bộ kịch bản kiểm thử trong `quickstart.md`.
