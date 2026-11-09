# Feature Specification: Tùy chọn bình luận đầu tiên & Tự động tương tác liên tục (Auto Interaction Flow)

**Feature Branch**: `004-description-auto-interact`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description:
- Thêm tính năng chọn option khi bình luận là lấy bình luận đầu tiên của video. Tham khảo trong code `page.html` để biết cách lấy bình luận đầu. Ví dụ trong `page.html` bình luận đầu có giá trị là "tui muốn đi nhầm cả đời", bình luận thứ 2 là "em cug muốn đi nhầm giống chị😔".
- Thêm nút Auto tương tác: Khi nhấn sẽ tự động thả tim và bình luận, sau đó nhấn nút mũi tên xuống để chuyển đến video tiếp theo, có cho chọn thời gian đợi giữa các lần tương tác.

## Clarifications

### Session 2026-11-05

- Q: Khi chạy Auto tương tác, hệ thống nên dừng lại sau khi đạt số lượng video tối đa hay chạy liên tục cho đến khi người dùng bấm nút Dừng? → A: Cho phép người dùng chọn số lượng video tối đa trong một phiên (10, 20, 50 video) hoặc tùy chọn 'Không giới hạn' (chạy liên tục cho đến khi bấm nút Dừng).
- Q: Khi ở chế độ 'Lấy bình luận đầu tiên', nếu bình luận đầu là của chính tác giả video (hoặc bình luận được ghim), hệ thống nên xử lý thế nào? → A: Bỏ qua bình luận của chủ kênh/được ghim, chỉ lấy bình luận đầu tiên của người xem khác.
- Q: Khi chạy Auto tương tác mà gặp video bị tắt tính năng bình luận, hệ thống nên xử lý thế nào? → A: Bỏ qua ngay lập tức và chuyển ngay sang video kế tiếp không cần chờ.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tùy chọn bình luận bằng cách lấy bình luận đầu tiên của video (Priority: P1) 🎯 MVP 1

Người dùng muốn có tùy chọn linh hoạt cho nội dung bình luận: thay vì chỉ dùng AI hoặc bình luận ngẫu nhiên, người dùng có thể chọn chế độ **"Lấy bình luận đầu tiên của video"** (First Comment Mode). Khi kích hoạt, tiện ích sẽ mở khung bình luận, trích xuất chính xác bình luận cấp 1 đầu tiên của video (ví dụ thẻ `span[data-e2e="comment-level-1"]` chứa text `"tui muốn đi nhầm cả đời"` trong `page.html`), dùng nội dung đó điền vào ô bình luận và đăng tải.

**Why this priority**: Đáp ứng yêu cầu cụ thể của người dùng về việc tương tác bằng cách sao chép/bắt chước bình luận top 1 của cộng đồng để tăng tương tác tự nhiên.

**Independent Test**: Mở video TikTok có bình luận, chọn chế độ "Lấy bình luận đầu tiên", bấm "Tự động bình luận". Xác nhận nội dung điền vào ô khớp với bình luận đầu tiên hiển thị trên video.

**Acceptance Scenarios**:

1. **Given** người dùng chọn chế độ nguồn bình luận là "Lấy bình luận đầu tiên", **When** bấm "Tự động bình luận" trên video TikTok, **Then** hệ thống mở khung bình luận, lấy nội dung của phần tử `span[data-e2e="comment-level-1"]` đầu tiên, điền vào khung soạn thảo và gửi bình luận.
2. **Given** video TikTok chưa có bất kỳ bình luận nào, **When** người dùng chạy ở chế độ "Lấy bình luận đầu tiên", **Then** hệ thống tự động rơi vào chế độ dự phòng (câu tương tác mẫu ngẫu nhiên) kèm thông báo rõ ràng cho người dùng.
3. **Given** người dùng chọn chế độ "Tạo bằng AI (Mặc định)", **When** bấm bình luận, **Then** hệ thống vẫn ưu tiên sinh câu bình luận từ Google Gemini hoặc phân tích mô tả như trước.

---

### User Story 2 - Luồng tự động tương tác liên tục nhiều video (Auto Interaction Workflow) (Priority: P1) 🎯 MVP 2

Người dùng muốn rảnh tay lướt và tương tác tự động hàng loạt video: bấm nút **"Auto tương tác"** một lần, tiện ích sẽ tự động thực hiện chu trình: (1) Thả tim video hiện tại, (2) Bình luận video theo cấu hình đã chọn, (3) Đợi khoảng thời gian người dùng đã định cấu hình, (4) Nhấn nút chuyển tiếp (mũi tên xuống `button[data-e2e="feed-navigation-next"]` hoặc phím `ArrowDown`), và lặp lại chu trình cho video kế tiếp. Người dùng có thể nhấn nút **"Dừng"** bất cứ lúc nào.

**Why this priority**: Giúp người dùng tự động hóa hoàn toàn quá trình "cày tương tác", xem feed và nuôi tài khoản TikTok mà không cần phải bấm từng video thủ công.

**Independent Test**: Cấu hình thời gian đợi 5 giây, bấm "Bắt đầu Auto tương tác". Quan sát tiện ích tự thả tim, tự bình luận, đếm ngược 5 giây, tự chuyển sang video kế tiếp và tiếp tục tương tác. Bấm "Dừng" và xác nhận tiến trình dừng ngay lập tức.

**Acceptance Scenarios**:

1. **Given** người dùng đang ở tab xem video TikTok, **When** nhấn nút "Auto tương tác", **Then** hệ thống bắt đầu chu trình: thả tim video hiện tại -> gửi bình luận -> đếm ngược thời gian chờ -> kích hoạt chuyển video tiếp theo (`data-e2e="feed-navigation-next"`).
2. **Given** tiến trình Auto tương tác đang chạy, **When** người dùng nhấn nút "Dừng Auto tương tác", **Then** hệ thống hủy bỏ chu trình lặp ngay lập tức và giữ nguyên trạng thái hiện tại.
3. **Given** tiện ích đang chạy Auto tương tác, **When** gặp video bị chủ sở hữu tắt tính năng bình luận (`canComment === false`), **Then** hệ thống ghi nhận trạng thái và kích hoạt chuyển ngay sang video kế tiếp mà không cần đếm ngược thời gian chờ.
4. **Given** tiện ích đang chạy Auto tương tác, **When** gặp video đã được thả tim từ trước, **Then** hệ thống giữ nguyên tim (không un-like), vẫn thực hiện bình luận và tiếp tục chu trình bình thường.

---

### User Story 3 - Cấu hình thời gian chờ và lưu trữ trạng thái Auto tương tác (Priority: P2)

Người dùng có thể chủ động lựa chọn thời gian giãn cách giữa các lần tương tác (ví dụ: 3 giây, 5 giây, 8 giây, 10 giây, 15 giây) để điều chỉnh tốc độ tương tác tự nhiên, tránh bị thuật toán TikTok cảnh báo spam. Tùy chọn thời gian chờ và chế độ bình luận được tự động lưu bền vững vào `chrome.storage.local`.

**Why this priority**: Đảm bảo an toàn cho tài khoản TikTok của người dùng và tăng tính tùy biến cá nhân.

**Independent Test**: Chọn thời gian chờ 8 giây, chọn chế độ "Bình luận đầu tiên", đóng Side Panel rồi mở lại. Xác nhận các tùy chọn vẫn được lưu và áp dụng chuẩn xác khi chạy Auto tương tác.

**Acceptance Scenarios**:

1. **Given** người dùng thay đổi thời gian chờ trên Side Panel, **When** giá trị thay đổi, **Then** hệ thống tự động lưu vào `chrome.storage.local` và áp dụng thời gian chờ này cho các lần lặp tiếp theo.
2. **Given** tiến trình đang đếm ngược chờ giữa 2 video, **When** đồng hồ đếm ngược chạy, **Then** giao diện Side Panel hiển thị đếm lùi trực quan (ví dụ: "Đã tương tác 2 video. Đợi chuyển tiếp: 5s... 4s... 3s...").

---

## Edge Cases

- **Video cuối cùng của feed hoặc không thể chuyển video tiếp**: Nếu nút `feed-navigation-next` bị vô hiệu hóa hoặc không tìm thấy, hệ thống thông báo "Đã đến cuối danh sách video" và dừng tiến trình.
- **Người dùng chuyển tab khi đang Auto**: Hệ thống tạm dừng hoặc hiển thị cảnh báo yêu cầu giữ tab TikTok hoạt động để đảm bảo trình duyệt không đóng băng tài nguyên (tab throttling).
- **Bình luận đầu tiên quá dài (> 200 ký tự) hoặc chứa liên kết**: Tự động cắt gọt phù hợp hoặc lấy bình luận hợp lệ tiếp theo.
- **Nút Dừng được bấm khi đang gọi API hoặc đang điền văn bản**: Tiến trình hoàn tất thao tác dở dang hiện tại rồi dừng lại, không tiếp tục chuyển video hay lặp chu trình mới.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI bổ sung tùy chọn **Chế độ bình luận** (`commentMode`) trên Side Panel:
  - `ai`: Bình luận thông minh bằng AI / từ khóa (Mặc định).
  - `first_comment`: Lấy bình luận cấp 1 đầu tiên của video.
- **FR-002**: Khi ở chế độ `first_comment`, hệ thống PHẢI trích xuất văn bản từ bình luận cấp 1 đầu tiên của NGƯỜI XEM KHÁC:
  - Bỏ qua các bình luận có gắn thẻ tác giả (Creator tag / "Tác giả") hoặc bình luận được ghim (Pinned tag / "Đã ghim").
  - Lấy phần tử bình luận của người xem đầu tiên (ví dụ: `"tui muốn đi nhầm cả đời"`).
  - Nếu không tìm thấy bình luận hợp lệ nào của người xem (video 0 bình luận hoặc chỉ có bình luận tác giả), tự động sử dụng câu tương tác dự phòng ngẫu nhiên.
- **FR-003**: Hệ thống PHẢI bổ sung nút điều khiển **"Auto tương tác"** trên Side Panel:
  - Trạng thái chưa chạy: Nút màu gradient/nổi bật ghi "▶ Bắt đầu Auto tương tác".
  - Trạng thái đang chạy: Nút chuyển sang trạng thái hoạt động kèm nút "⏹ Dừng lại".
  - Hiển thị bộ đếm số video đã hoàn tất tương tác trong phiên (ví dụ: "Đã tương tác: 3 video").
- **FR-004**: Hệ thống PHẢI hỗ trợ điều chỉnh **Thời gian chờ giữa các video** (`autoInteractDelay`):
  - Cho phép chọn: 3s, 5s (mặc định), 8s, 10s, 15s.
  - Hiển thị bộ đếm ngược trực quan từng giây trong thời gian chờ.
- **FR-005**: Hệ thống PHẢI điều khiển chuyển sang video tiếp theo trên TikTok Web:
  - Nhấp vào nút `button[data-e2e="feed-navigation-next"]` (hoặc `data-key-interaction="feed_nav_next"`).
  - Dự phòng phát sự kiện bàn phím phím mũi tên xuống (`ArrowDown`, keyCode 40) vào trang để cuộn video.
  - Chờ video mới sẵn sàng trước khi bắt đầu chu trình tiếp theo.
- **FR-006**: Toàn bộ các cấu hình mới (`commentMode`, `autoInteractDelay`, `maxVideos`) PHẢI được lưu bền vững vào `chrome.storage.local` và tự động khôi phục khi mở Side Panel.
- **FR-007**: Hệ thống PHẢI có cờ dừng an toàn (`stopRequested`) để người dùng có thể ngắt chu trình Auto tương tác bất kỳ lúc nào mà không gây treo hay lỗi trình duyệt.
- **FR-008**: Hệ thống PHẢI hỗ trợ tùy chọn **Giới hạn số lượng video tối đa** trong một phiên Auto tương tác (`maxVideos`): cho phép chọn 10, 20, 50 video hoặc 0 ("Không giới hạn"). Khi hoàn thành số lượng đặt ra, tiến trình tự động dừng và hiển thị thông báo kết thúc phiên.

---

## Success Criteria *(mandatory)*

- **SC-001 (Độ chính xác lấy bình luận đầu)**: Ở chế độ `first_comment`, 100% video có bình luận đều lấy đúng nội dung của bình luận đầu tiên (như `"tui muốn đi nhầm cả đời"` trong `page.html`).
- **SC-002 (Tính ổn định của Auto tương tác)**: Chu trình tự động có thể lặp liên tục qua >= 10 video mà không bị crash trang TikTok, không rò rỉ bộ nhớ, và không kẹt giao diện.
- **SC-003 (Khả năng dừng tức thì)**: Khi người dùng bấm "Dừng", chu trình Auto tương tác dừng lại trong vòng < 500ms.
- **SC-004 (Độ tin cậy chuyển video)**: Tỷ lệ chuyển video thành công bằng nút điều hướng hoặc phím mũi tên xuống đạt > 98%.

---

## Key Entities & Data Schema

### Stored Settings Updates (`chrome.storage.local`)
- `commentMode`: `"ai"` | `"first_comment"` (mặc định: `"ai"`)
- `autoInteractDelay`: `number` (số giây, mặc định: `5`)
- `maxVideos`: `number` (0 cho Không giới hạn, hoặc 10, 20, 50; mặc định: 0)

### Message Contract Additions
- Action: `NAVIGATE_NEXT_VIDEO`
  - Request: `{ action: "NAVIGATE_NEXT_VIDEO" }`
  - Response: `{ success: boolean, message: string }`
- Action: `GET_FIRST_COMMENT` (hoặc mở rộng `GET_ACTIVE_VIDEO_INFO`)
  - Trả về trường `firstComment: string | null`
