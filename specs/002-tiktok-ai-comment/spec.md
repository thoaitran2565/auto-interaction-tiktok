# Feature Specification: Tự động tạo và gửi bình luận video TikTok bằng AI qua Side Panel

**Feature Branch**: `002-tiktok-ai-comment`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Thêm nút tự động comment: Khi nhấn nút lấy mô tả video trong thẻ span (<span class=\"TUXText TUXText--tiktok-sans css-u0d6t3-7937d88b--StyledTUXText e1gw1eda0\" letter-spacing=\"0.09380000000000001\" data-e2e=\"desc-span-0_-1\" style=\"color: inherit; font-size: 14px; display: inline-block;\">Nghĩ nhiêu chuyện trong đời </span>). Xây dựng hàm truyền vào mô tả video và trả ra câu tương tác phù hợp ngắn gọn từ ai model ví dụ gemini. Sau đó nhập bình luận vào ô bình luận và nhấn gửi"

## Clarifications

### Session 2026-11-05

- Q: Cơ chế mô phỏng nhập liệu vào ô bình luận thẻ div (`div[contenteditable="true"]`) của TikTok cần diễn ra theo trình tự nào để kích hoạt nút gửi (enable post button)? → A: Mô phỏng chính xác chuỗi tương tác tự nhiên: (1) Nhấp chuột vào thẻ div soạn thảo (`.focus()`, `.click()`), (2) Điền nội dung văn bản bằng cơ chế gõ phím/nhập liệu (`document.execCommand('insertText')` kết hợp dispatch `InputEvent`/`input`), (3) Chờ nút gửi `button[data-e2e="comment-post"]` được TikTok gỡ bỏ thuộc tính `disabled`, (4) Kích hoạt thao tác nhấp nút gửi.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tự động trích xuất mô tả, sinh bình luận bằng AI và đăng bình luận lên video (Priority: P1) 🎯 MVP

Người dùng đang xem video TikTok và mở bảng Side Panel của tiện ích, người dùng nhấp vào nút "Tự động bình luận". Tiện ích tự động quét nội dung mô tả của video TikTok đang hoạt động, chuyển nội dung mô tả này vào mô hình AI (như Google Gemini) để sinh một câu bình luận tương tác ngắn gọn, tự nhiên, sau đó tự động điền vào khung bình luận của TikTok và kích hoạt nút gửi.

**Why this priority**: Đây là luồng nghiệp vụ cốt lõi mà người dùng yêu cầu, mang lại khả năng tương tác tự động hoàn toàn chỉ với một thao tác bấm.

**Independent Test**: Mở một video TikTok có mô tả trên tab hoạt động, mở Side Panel và bấm nút "Tự động bình luận". Xác nhận nội dung bình luận được sinh ra phù hợp với ngữ cảnh mô tả và được gửi thành công vào phần bình luận của video.

**Acceptance Scenarios**:

1. **Given** video TikTok đang hiển thị có chứa thẻ mô tả văn bản (ví dụ các thẻ `span[data-e2e^="desc-span"]` hoặc `div[data-e2e="video-desc"]`), **When** người dùng nhấp nút "Tự động bình luận" trên Side Panel, **Then** hệ thống đọc được chuỗi văn bản mô tả, gọi hàm AI sinh câu bình luận ngắn gọn, nhấp chuột vào thẻ div soạn thảo, nhập văn bản để kích hoạt nút gửi enabled, và nhấn nút đăng (`button[data-e2e="comment-post"]`).
2. **Given** khung bình luận của video chưa được mở (đang ở dạng lướt feed video), **When** người dùng kích hoạt lệnh bình luận, **Then** hệ thống tự động nhấn vào biểu tượng mở bình luận (`button[data-e2e="comment-icon"]`), chờ ô soạn thảo xuất hiện và tiến hành nhập nội dung rồi nhấn gửi.

---

### User Story 2 - Quản lý cấu hình AI và phong cách tương tác trên Side Panel (Priority: P2)

Người dùng muốn cấu hình khóa API (Gemini API Key) hoặc lựa chọn phong cách tương tác (khen ngợi, đồng cảm, hài hước, đặt câu hỏi) để nội dung bình luận được sinh ra phong phú và phù hợp với mục đích cá nhân.

**Why this priority**: Tăng tính linh hoạt, giúp người dùng chủ động điều chỉnh chất lượng và tông giọng của nội dung do AI tạo ra.

**Independent Test**: Thay đổi lựa chọn phong cách (ví dụ từ "Khen ngợi" sang "Hài hước") trên Side Panel, sau đó bấm bình luận và xác minh câu bình luận sinh ra phản ánh đúng phong cách đã chọn.

**Acceptance Scenarios**:

1. **Given** người dùng nhập khóa API Gemini hợp lệ vào ô cài đặt trên Side Panel, **When** hệ thống sinh bình luận, **Then** hệ thống ưu tiên gọi trực tiếp API Gemini để tạo phản hồi sáng tạo và bám sát mô tả.
2. **Given** người dùng chưa thiết lập khóa API, **When** người dùng bấm bình luận, **Then** hệ thống sử dụng bộ sinh ngữ cảnh thông minh tích hợp sẵn (fallback generator) để vẫn đảm bảo trả về bình luận phù hợp mà không gây lỗi gián đoạn.

---

### User Story 3 - Phản hồi trạng thái chi tiết và xử lý tình huống ngoại lệ khi bình luận (Priority: P2)

Người dùng cần biết tiến trình xử lý từng bước (Đang đọc mô tả -> Đang tạo câu trả lời từ AI -> Đang nhập và gửi bình luận -> Thành công) và nhận được thông báo rõ ràng khi gặp sự cố (video bị khóa bình luận, không có video, lỗi mạng).

**Why this priority**: Cải thiện độ tin cậy và trải nghiệm người dùng, giúp người dùng luôn nắm bắt được tiện ích đang thực hiện bước nào.

**Independent Test**: Thử nghiệm trên video đã bị tắt tính năng bình luận, xác minh hệ thống hiển thị thông báo "Video này đã tắt tính năng bình luận" thay vì treo xử lý.

**Acceptance Scenarios**:

1. **Given** video TikTok đang xem đã bị chủ sở hữu tắt tính năng bình luận, **When** người dùng kích hoạt bình luận tự động, **Then** hệ thống phát hiện trạng thái và thông báo rõ ràng cho người dùng trên Side Panel.
2. **Given** video không có mô tả (mô tả rỗng hoặc chỉ có hashtag), **When** hệ thống tạo bình luận, **Then** hệ thống tự động sinh câu tương tác chào hỏi / khen ngợi tổng quát phù hợp với video ngắn.
3. **Given** bình luận được đăng thành công, **When** quá trình hoàn tất, **Then** Side Panel hiển thị thông báo thành công kèm theo nội dung bình luận đã được đăng.

---

### Edge Cases

- **Khung bình luận là thẻ div Draft.js (`contenteditable="true"`), nút gửi ban đầu bị disabled**: Khác với thẻ `<input>` hay `<textarea>` thông thường, TikTok sử dụng Draft.js được bao bọc bởi thẻ div. Thao tác gán `.innerText` hay `.value` sẽ không cập nhật state nội bộ của React. Bắt buộc phải mô phỏng: kích hoạt click/focus vào thẻ div, gọi `document.execCommand('insertText', false, text)` cùng dispatch các sự kiện `beforeinput`, `input` để trigger sự thay đổi dữ liệu, khiến nút `button[data-e2e="comment-post"]` chuyển từ `disabled` sang enabled trước khi click.
- **Nút đăng (`button[data-e2e="comment-post"]`) cần thời gian đồng bộ state**: Nút chỉ được bật khi ô soạn thảo ghi nhận input. Hệ thống cần có khoảng chờ nhỏ (100ms - 300ms) để kiểm tra thuộc tính `disabled` trước khi kích hoạt lệnh click.
- **Video có mô tả quá dài hoặc chứa nhiều thẻ hashtag/link nhạc**: Hệ thống cần làm sạch chuỗi mô tả (loại bỏ các hashtag thừa, giữ lại thông điệp chính) trước khi gửi tới mô hình AI để tránh làm loãng ngữ cảnh.
- **Giới hạn tần suất bình luận (Rate Limit) của TikTok**: Nếu người dùng nhấn bình luận quá nhanh liên tục trên nhiều video, TikTok có thể hiện cảnh báo "Bình luận quá nhanh". Hệ thống cần có cơ chế khóa tạm thời và cảnh báo người dùng giãn cách thao tác.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Giao diện Side Panel MUST bổ sung nút thao tác "Tự động bình luận" (hoặc "Auto Comment") bên cạnh nút thả tim hiện có.
- **FR-002**: Hệ thống MUST trích xuất được chuỗi văn bản mô tả của video TikTok đang active (ưu tiên các selector `span[data-e2e^="desc-span"]`, `div[data-e2e="video-desc"]`, hoặc vùng văn bản mô tả trong container video).
- **FR-003**: Hệ thống MUST cung cấp hàm xử lý AI (`generateComment(videoDescription, style, apiKey)`) nhận vào mô tả video và trả về câu bình luận tiếng Việt ngắn gọn (dưới 150 ký tự), tự nhiên và thân thiện.
- **FR-004**: Hàm AI MUST hỗ trợ kết nối Google Gemini API (khi có API key) và có sẵn bộ quy tắc dự phòng thông minh (rule-based smart fallback) khi không có API key hoặc khi mất kết nối mạng.
- **FR-005**: Hệ thống MUST tự động mở khung bình luận của video TikTok nếu khung này đang đóng.
- **FR-006**: Hệ thống MUST mô phỏng đúng trình tự tương tác tự nhiên đối với ô bình luận thẻ div (`div[contenteditable="true"]` bên trong `div[data-e2e="comment-input"]`): thực hiện nhấp chuột kích hoạt tiêu điểm (`focus`/`click`), đưa văn bản vào bằng cơ chế nhập liệu (`document.execCommand('insertText')` và `InputEvent`) để đảm bảo hệ thống phản ứng (Draft.js / React state) của TikTok ghi nhận nội dung và gỡ bỏ thuộc tính `disabled` trên nút gửi.
- **FR-007**: Hệ thống MUST kiểm tra và chờ trạng thái kích hoạt của nút gửi bình luận (`button[data-e2e="comment-post"]` không còn thuộc tính `disabled`) trước khi kích hoạt thao tác click đăng bình luận.
- **FR-008**: Giao diện Side Panel MUST hiển thị các bước tiến trình chi tiết và nội dung câu bình luận vừa đăng để người dùng theo dõi.
- **FR-009**: Hệ thống MUST lưu trữ tùy chọn khóa API và phong cách bình luận vào `chrome.storage.local` để tiện sử dụng cho các lần sau.

### Key Entities *(include if feature involves data)*

- **Cấu hình bình luận (CommentConfig)**:
  - `apiKey`: Khóa API của mô hình AI (chuỗi ký tự, mã hóa hoặc lưu cục bộ).
  - `style`: Phong cách bình luận (`friendly` - thân thiện, `compliment` - khen ngợi, `question` - gợi mở câu hỏi, `humorous` - hài hước).
  - `autoPost`: Cờ xác định có tự động bấm gửi hay chỉ điền nội dung vào ô để người dùng kiểm duyệt trước.
- **Dữ liệu bình luận (CommentPayload)**:
  - `videoDescription`: Đoạn mô tả video đã trích xuất từ DOM.
  - `generatedText`: Câu văn bản bình luận do AI sinh ra.
  - `timestamp`: Thời điểm thực hiện thao tác.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trích xuất mô tả video chính xác trong vòng dưới 200ms kể từ khi bấm nút.
- **SC-002**: Thời gian tạo câu bình luận từ AI và điền vào ô soạn thảo hoàn tất trong vòng dưới 3 giây.
- **SC-003**: Tỷ lệ kích hoạt thành công (enable) và nhấn gửi bình luận trên TikTok Web đạt từ 95% trở lên trên các video cho phép bình luận.
- **SC-004**: 100% các trường hợp video không có mô tả hoặc tắt bình luận đều được xử lý êm ái với thông báo rõ ràng cho người dùng.

## Assumptions

- Người dùng đã đăng nhập tài khoản TikTok trên trình duyệt để có quyền đăng bình luận.
- TikTok cho phép người dùng đăng bình luận công khai mà không yêu cầu giải captcha tương tác đối với các tài khoản thông thường.
- Mô hình Gemini được sử dụng ở phiên bản Gemini 1.5 Flash / 2.0 Flash để đảm bảo tốc độ phản hồi nhanh nhất (< 1.5s) và chi phí thấp / miễn phí theo hạn mức Google AI Studio.
