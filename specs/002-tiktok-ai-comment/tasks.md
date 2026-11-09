# Tasks: Tự động tạo và gửi bình luận video TikTok bằng AI qua Side Panel

**Input**: Design documents from `/specs/002-tiktok-ai-comment/`  
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/messaging.md](./contracts/messaging.md), [quickstart.md](./quickstart.md)

**Tests**: Kiểm thử trực tiếp (Manual / End-to-End via Chrome Unpacked) theo kịch bản tại [quickstart.md](./quickstart.md).

**Organization**: Các nhiệm vụ được nhóm theo User Story nhằm phục vụ phát triển độc lập và kiểm thử theo từng giai đoạn.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Có thể thực hiện song song (các file khác nhau, không phụ thuộc vào task chưa hoàn thành)
- **[Story]**: Đánh dấu User Story mà nhiệm vụ đó thuộc về ([US1], [US2], [US3])
- Mỗi mô tả đều chỉ định đường dẫn tập tin cụ thể

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Cập nhật cấu hình quyền hạn và kết nối dịch vụ cho tiện ích mở rộng

- [X] T001 Cấu hình quyền `storage` và thêm `host_permissions` cho API Google Generative Language (`https://generativelanguage.googleapis.com/*`) trong `manifest.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hạ tầng cốt lõi về xử lý AI và thông điệp tương tác trước khi xây dựng tính năng

- [X] T002 [P] Xây dựng module sinh bình luận AI `sidepanel/ai-generator.js` hỗ trợ kết nối Google Gemini 1.5 Flash API và bộ quy tắc dự phòng ngữ cảnh tiếng Việt (smart context fallback)
- [X] T003 Cập nhật bộ định tuyến tin nhắn trong Content Script `content/content.js` để tiếp nhận và phản hồi các action `GET_ACTIVE_VIDEO_INFO` và `POST_COMMENT`

**Checkpoint**: Nền tảng AI và giao thức trao đổi dữ liệu sẵn sàng để triển khai các User Story.

---

## Phase 3: User Story 1 - Tự động trích xuất mô tả, sinh bình luận bằng AI và đăng bình luận lên video (Priority: P1) 🎯 MVP

**Goal**: Khi người dùng nhấn nút "Tự động bình luận", tiện ích tự trích xuất chuỗi mô tả từ thẻ span, sinh câu bình luận ngắn gọn và mô phỏng gõ phím vào thẻ div soạn thảo Draft.js để kích hoạt nút gửi enabled rồi nhấn gửi.

**Independent Test**: Mở video TikTok có mô tả, nhấn nút "Tự động bình luận" trên Side Panel và xác nhận bình luận được điền và đăng thành công vào video.

### Implementation for User Story 1

- [X] T004 [US1] Cài đặt hàm trích xuất chuỗi mô tả từ các thẻ `span[data-e2e^="desc-span"]` hoặc `div[data-e2e="video-desc"]` của video đang active trong `content/content.js`
- [X] T005 [US1] Cài đặt hàm tự động mở khung bình luận (`button[data-e2e="comment-icon"]`) và mô phỏng chuỗi tương tác tự nhiên với thẻ div soạn thảo `div[contenteditable="true"]` (focus, click, `document.execCommand('insertText')`, dispatch `InputEvent`) trong `content/content.js`
- [X] T006 [US1] Cài đặt hàm kiểm tra và chờ nút đăng `button[data-e2e="comment-post"]` chuyển từ `disabled` sang enabled rồi kích hoạt click gửi trong `content/content.js`
- [X] T007 [US1] Bổ sung nút thao tác "Tự động bình luận" vào giao diện Side Panel trong `sidepanel/sidepanel.html`
- [X] T008 [US1] Cài đặt luồng điều phối chính khi nhấn nút bình luận (lấy mô tả từ tab -> gọi `ai-generator.js` -> gửi lệnh đăng qua `POST_COMMENT`) trong `sidepanel/sidepanel.js`

**Checkpoint**: User Story 1 hoàn thành độc lập - chức năng bình luận tự động AI hoạt động trọn vẹn.

---

## Phase 4: User Story 2 - Quản lý cấu hình AI và phong cách tương tác trên Side Panel (Priority: P2)

**Goal**: Cho phép người dùng nhập Gemini API Key, lựa chọn phong cách bình luận (thân thiện, khen ngợi, hài hước, câu hỏi) và bật/tắt tự động gửi.

**Independent Test**: Lưu API key và đổi phong cách sang "Hài hước", bấm bình luận và xác nhận bình luận sinh ra mang đúng phong cách đã chọn.

### Implementation for User Story 2

- [X] T009 [P] [US2] Thêm giao diện form cấu hình AI (ô nhập API Key, select phong cách, checkbox tự động gửi) vào `sidepanel/sidepanel.html`
- [X] T010 [P] [US2] Thiết kế stylesheet hiện đại, collapsible cho khu vực cài đặt AI trong `sidepanel/sidepanel.css`
- [X] T011 [US2] Cài đặt logic lưu trữ và khôi phục cài đặt người dùng (`geminiApiKey`, `commentStyle`, `autoSubmit`) qua `chrome.storage.local` trong `sidepanel/sidepanel.js`

**Checkpoint**: User Story 2 hoàn thành - người dùng có thể tùy biến hoàn toàn tham số hoạt động của AI.

---

## Phase 5: User Story 3 - Phản hồi trạng thái chi tiết và xử lý tình huống ngoại lệ khi bình luận (Priority: P2)

**Goal**: Hiển thị tiến trình xử lý từng bước (Đang đọc mô tả -> Đang tạo AI -> Đang gửi), xem trước nội dung câu bình luận vừa đăng và xử lý video bị tắt bình luận.

**Independent Test**: Thử nghiệm trên video tắt bình luận để xác nhận hiển thị thông báo lỗi phù hợp; thử nghiệm bình luận thành công để xác nhận câu bình luận hiển thị trên Side Panel.

### Implementation for User Story 3

- [X] T012 [US3] Cài đặt nhận diện và phản hồi lỗi khi video tắt bình luận hoặc không thể kích hoạt nút đăng trong `content/content.js`
- [X] T013 [US3] Cài đặt cập nhật trạng thái chi tiết từng bước và hiển thị khối xem trước nội dung bình luận đã đăng trong `sidepanel/sidepanel.js`
- [X] T014 [P] [US3] Bổ sung định dạng kiểu dáng cho thẻ xem trước bình luận (preview card) và huy hiệu trạng thái mới trong `sidepanel/sidepanel.css`

**Checkpoint**: Cả 3 User Story hoàn chỉnh, trải nghiệm người dùng mượt mà và trực quan.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Kiểm thử tổng thể và cập nhật tài liệu hướng dẫn

- [X] T015 Kiểm thử xác thực toàn diện các kịch bản bình luận thực tế theo `specs/002-tiktok-ai-comment/quickstart.md` và kiểm tra lại trên mẫu DOM `page.html`
- [X] T016 [P] Cập nhật hướng dẫn sử dụng tính năng bình luận tự động bằng AI trong `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Có thể bắt đầu ngay lập tức.
- **Foundational (Phase 2)**: Phụ thuộc vào Setup - chặn các User Story tiếp theo.
- **User Story 1 (Phase 3)**: Phụ thuộc vào Foundational hoàn thành (cần `ai-generator.js` và content script handlers).
- **User Story 2 (Phase 4)**: Có thể thực hiện song song hoặc ngay sau User Story 1.
- **User Story 3 (Phase 5)**: Hoàn thiện lớp hiển thị phản hồi của US1 & US2.
- **Polish (Phase 6)**: Thực hiện sau khi các User Story đã hoàn tất.

### Parallel Opportunities

- `T002` có thể làm song song với `T001`.
- `T009` và `T010` có thể làm song song với `T008`.
- `T014` có thể làm song song với `T012`, `T013`.
- `T016` có thể làm song song với `T015`.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Hoàn thành Phase 1 (Cấp quyền `storage` & host permission).
2. Hoàn thành Phase 2 (`ai-generator.js` & message router).
3. Hoàn thành Phase 3 (US1 - Trích xuất mô tả, gõ phím vào thẻ div Draft.js và bấm nút gửi).
4. Kiểm thử MVP: Bấm "Tự động bình luận" trên video TikTok -> câu bình luận được điền và gửi thành công.
