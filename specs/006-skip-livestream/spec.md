# Feature Specification: Auto Skip Livestream Videos

**Feature Branch**: `006-skip-livestream`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Đối với video dạng livestream xuất hiện thì sẽ có nút Xem live nằm thay cho phần hiển thị bình luận ở các video thường, có thể dựa vào yếu tố này để phân định nó là livestream và next luôn. mã html khi có video livestream nằm trong page2.html"

---

## Clarifications

### Session 2026-11-05
- Q: Khi chuyển sang video mới, hệ thống nên quét nhận diện Livestream trong khoảng thời gian bao lâu để đảm bảo phát hiện chính xác ngay cả khi mạng chậm? → A: Quét liên tục trong 1s - 2s đầu khi video vừa tải; nếu xuất hiện nút "Xem LIVE" thì lập tức dừng tương tác và next ngay.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tự động phát hiện và bỏ qua video Livestream (Priority: P1)

Là một người dùng sử dụng tính năng tự động tương tác TikTok, khi gặp video đang phát trực tiếp (Livestream) xuất hiện trên bảng tin (For You Feed), tôi muốn hệ thống nhận diện đây là Livestream và tự động chuyển sang video tiếp theo mà không dừng chờ hoặc cố gắng tương tác bình luận, vì Livestream không có ô bình luận video thông thường mà chỉ có nút "Xem LIVE".

**Why this priority**: Video Livestream trên TikTok thay thế toàn bộ khung bình luận bằng nút "Xem LIVE" (và mô tả `.live-desc`). Nếu bot cố gắng tìm ô bình luận hoặc đợi hết thời gian xem video thông thường, nó sẽ lãng phí thời gian và có thể kích hoạt hành vi không mong muốn. Tự động skip Livestream giúp luồng chạy mượt mà, liên tục.

**Independent Test**: Khi gặp một video Livestream trên feed TikTok (như cấu trúc trong `page2.html`):
- Hệ thống quét và nhận diện nút "Xem LIVE" hoặc khối `.live-desc` / `DivLiveUnavailableContainer` trong vòng 1s - 2s đầu tiên khi tải video.
- Hệ thống ghi log: "📡 Phát hiện Livestream, tự động bỏ qua sang video tiếp theo...".
- Hệ thống không thực hiện bình luận và lập tức kích hoạt chuyển sang video kế tiếp sau khoảng nghỉ ngắn tự nhiên (500ms - 1000ms).

**Acceptance Scenarios**:
1. **Given** Bot đang chạy chế độ tự động tương tác, **When** chuyển sang video mới và phát hiện phần tử chứa nút "Xem LIVE" hoặc khối `DivLiveUnavailableContainer` / `.live-desc` trong cửa sổ quét 1s - 2s đầu, **Then** bot hủy bỏ chu trình tương tác bình thường và lập tức điều hướng sang video tiếp theo.
2. **Given** Video hiện tại là video thông thường có bình luận đầy đủ, **When** kiểm tra livestream, **Then** hệ thống xác định không phải livestream và tiếp tục chu trình xem/tương tác bình thường.
3. **Given** Video thông thường nhưng người đăng chủ động tắt tính năng bình luận (không phải Livestream), **When** kiểm tra, **Then** hệ thống không nhầm lẫn đây là Livestream (chỉ nhận diện Livestream khi có nút "Xem LIVE" hoặc các chỉ báo đặc trưng của phiên LIVE).

---

### User Story 2 - Cấu hình tùy chọn Bỏ qua Livestream trong Sidepanel (Priority: P2)

Là một người dùng, tôi muốn có một tùy chọn trong bảng điều khiển Sidepanel cho phép bật hoặc tắt tính năng "Tự động bỏ qua Livestream" để kiểm soát hành vi theo nhu cầu.

**Why this priority**: Cung cấp quyền kiểm soát cấu hình cho người dùng, đảm bảo tính linh hoạt và tuân thủ nguyên tắc thiết kế mở rộng của tiện ích.

**Independent Test**: Kiểm tra checkbox "Tự động bỏ qua Livestream" trên Sidepanel:
- Bật checkbox $\rightarrow$ bot tự động skip video Livestream.
- Tắt checkbox $\rightarrow$ bot xử lý theo chu trình thông thường (ví dụ: phát hiện không có ô comment thì xử lý theo cơ chế skip không comment).
- Tải lại extension $\rightarrow$ trạng thái checkbox vẫn được giữ nguyên từ `chrome.storage.local`.

**Acceptance Scenarios**:
1. **Given** Checkbox "Tự động bỏ qua Livestream" đang được bật (mặc định), **When** gặp Livestream, **Then** bot tự động chuyển video.
2. **Given** Checkbox được tắt, **When** gặp Livestream, **Then** bot không tự động skip ngay mà tuân theo quy tắc kiểm tra ô bình luận thông thường.
3. **Given** Người dùng thay đổi cài đặt checkbox, **Then** giá trị mới được lưu vào `chrome.storage.local` và áp dụng ngay trong phiên tương tác hiện tại.

---

### Edge Cases

- **Mạng chậm khiến khối Livestream tải trễ**: Nút "Xem LIVE" có thể mất vài trăm mili-giây để render. Hệ thống quét định kỳ trong 1s - 2s đầu để tránh bỏ sót Livestream do mạng giật.
- **Livestream đã kết thúc khi người dùng vừa cuộn tới**: TikTok có thể hiển thị thông báo phòng live đã đóng; hệ thống vẫn nhận diện đây không phải video thông thường và chuyển video an toàn.
- **Đa ngôn ngữ (Tiếng Anh / Tiếng Việt)**: Trên giao diện tiếng Anh, nút có thể là "Watch LIVE" hoặc mô tả là "Comments are turned off. Watch LIVE...". Do đó hệ thống phải dựa trên cả bộ chọn CSS bền vững (như `data-testid="tux-web-button"`, `.live-desc`, `[class*="DivLiveUnavailableContainer"]`, `[data-e2e="live-like-icon"]`) kết hợp cùng kiểm tra từ khóa ("Xem LIVE", "Watch LIVE").

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI có khả năng phát hiện video Livestream trên feed thông qua việc quét liên tục trong 1s - 2s đầu tiên sau khi cuộn tới video mới, dựa trên các chỉ báo DOM đặc trưng:
  - Khối chứa thông báo live: `div[class*="DivLiveUnavailableContainer"]` hoặc `.live-desc`
  - Nút bấm xem live: nút chứa văn bản "Xem LIVE" hoặc "Watch LIVE" nằm trong vùng hiển thị nội dung bên phải video
  - Biểu tượng tương tác đặc thù của live: `[data-e2e="live-like-icon"]`
- **FR-002**: Khi video được xác định là Livestream và tính năng bỏ qua Livestream đang bật, hệ thống PHẢI ngay lập tức hủy bỏ việc chờ đợi xem video và bỏ qua toàn bộ tương tác (Không Like, Không Follow, Không Comment).
- **FR-003**: Hệ thống PHẢI ghi log thông báo rõ ràng lên Sidepanel: `📡 Phát hiện Livestream, tự động chuyển tiếp...`.
- **FR-004**: Hệ thống PHẢI thực hiện chuyển sang video tiếp theo sau khoảng đệm tự nhiên ngắn (500ms - 1000ms) bằng lệnh điều hướng tương tự như cơ chế next video hiện tại.
- **FR-005**: Giao diện Sidepanel PHẢI bổ sung checkbox "Tự động bỏ qua Livestream" (mặc định: `true`).
- **FR-006**: Trạng thái cấu hình `skipLivestream` PHẢI được lưu trữ và tải từ `chrome.storage.local`.

### Key Entities

- **LivestreamDetectionResult**:
  - `isLivestream`: boolean
  - `indicatorFound`: string (ví dụ: 'live_desc_found', 'watch_live_button_found', 'live_like_icon_found')
- **LivestreamConfig**:
  - `skipLivestream`: boolean (mặc định: `true`)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% video dạng Livestream (khớp với cấu trúc DOM trong `page2.html`) được nhận diện chính xác và bỏ qua trong vòng 1.5 giây sau khi tải trang.
- **SC-002**: Tỷ lệ nhận diện nhầm (False Positive) trên video thường bằng 0%: các video thông thường có bình luận tuyệt đối không bị nhận diện nhầm thành Livestream.
- **SC-003**: Không có ngoại lệ không bắt được (Unhandled Exceptions) hoặc treo vòng lặp tự động khi gặp video Livestream.
- **SC-004**: Trạng thái cài đặt của người dùng được lưu trữ và phục hồi chính xác 100% giữa các lần mở lại Sidepanel.

---

## Assumptions

- Video Livestream trên trang For You của TikTok phiên bản máy tính để bàn (Desktop Web) luôn thay thế phần danh sách bình luận bằng khối giao diện giới thiệu phòng Live hoặc nút "Xem LIVE" (`page2.html`).
- Việc bỏ qua ngay Livestream là mong muốn mặc định của đa số người dùng công cụ tự động hóa video ngắn thông thường.
