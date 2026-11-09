# Feature Specification: Lưu cấu hình, xử lý bình luận dự phòng thông minh và tối ưu kết nối AI

**Feature Branch**: `003-description-comment-fallback-persistence`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: 
- Lưu các tùy chọn lại
- Nếu video không có mô tả thì chọn ngẫu nhiên 1 bình luận sẵn có, nếu không có bình luận dạng text thì tự bình luận 1 câu ngẫu nhiên
- Hiện tại chưa lấy được bình luận từ AI

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tự động lưu và khôi phục toàn bộ tùy chọn cấu hình trên Side Panel (Priority: P1) 🎯 MVP

Người dùng tùy chỉnh các thiết lập trên Side Panel bao gồm: phương thức thả tim (Tự động, Nút bấm, Phím L, Nhấp đúp), API Key của mô hình AI, phong cách bình luận (Thân thiện, Khen ngợi, Hài hước, Đặt câu hỏi), và tùy chọn tự động nhấn gửi. Toàn bộ các tùy chọn này phải được tự động lưu trữ bền vững (persistent storage) ngay khi người dùng thay đổi hoặc bấm lưu, và được tự động điền lại nguyên vẹn mỗi khi người dùng mở lại Side Panel ở các phiên làm việc tiếp theo.

**Why this priority**: Người dùng không muốn phải nhập lại API Key hoặc chọn lại phương thức tương tác mỗi lần mở trình duyệt hoặc chuyển tab. Đây là tính năng cơ bản mang lại trải nghiệm tiện dụng tối đa.

**Independent Test**: Thay đổi phương thức thả tim sang "Phím L", nhập API key, chọn phong cách "Hài hước", tắt tùy chọn "Tự động gửi", bấm lưu hoặc đóng Side Panel. Mở lại Side Panel và kiểm tra toàn bộ các giá trị trên vẫn giữ nguyên.

**Acceptance Scenarios**:

1. **Given** người dùng đang mở Side Panel, **When** người dùng thay đổi bất kỳ trường tùy chọn nào (phương thức thả tim, phong cách bình luận, checkbox tự động gửi) hoặc nhập API Key và bấm "Lưu cài đặt", **Then** hệ thống lưu toàn bộ các giá trị này vào bộ nhớ cục bộ (`chrome.storage.local`).
2. **Given** người dùng đóng trình duyệt hoặc đóng Side Panel rồi mở lại, **When** Side Panel được khởi tạo, **Then** hệ thống đọc dữ liệu đã lưu và khôi phục chính xác trạng thái của mọi điều khiển giao diện (dropdown, input text, checkbox).
3. **Given** người dùng lần đầu cài đặt tiện ích và chưa có cấu hình trước đó, **When** Side Panel tải lên, **Then** hệ thống áp dụng các giá trị mặc định hợp lý (Thả tim: Tự động; Phong cách: Thân thiện; Tự động gửi: Bật).

---

### User Story 2 - Trích xuất bình luận sẵn có hoặc dùng câu tương tác ngẫu nhiên khi video không có mô tả (Priority: P1)

Khi xem một video TikTok không có phần mô tả (chủ video không viết caption hoặc chỉ có khoảng trắng), nếu người dùng kích hoạt "Tự động bình luận", hệ thống phải có cơ chế dự phòng thông minh nhiều lớp:
1. Lớp 1: Quét danh sách các bình luận bằng chữ (text comments) sẵn có của các người xem khác trên video đó và chọn ngẫu nhiên 1 câu bình luận phù hợp để tương tác hoặc lấy cảm hứng phản hồi.
2. Lớp 2: Nếu video hoàn toàn chưa có bình luận nào hoặc không có bình luận dạng văn bản (chỉ có nhãn dán, icon, hoặc bình luận bị ẩn), hệ thống tự động chọn ngẫu nhiên một câu bình luận tương tác tự nhiên, phong phú từ kho bình luận mẫu tiếng Việt đa dạng.

**Why this priority**: Rất nhiều video trên TikTok không có caption hoặc caption trống. Nếu không xử lý tình huống này, tính năng bình luận sẽ bị gián đoạn, báo lỗi hoặc sinh ra câu vô nghĩa như "Video TikTok".

**Independent Test**: Mở một video TikTok không có caption nhưng có bình luận của người khác, bấm "Tự động bình luận" và xác nhận tiện ích lấy được một bình luận sẵn có hợp lệ để tương tác. Thử nghiệm trên video không có caption và không có bình luận, xác nhận tiện ích tự động đưa ra một câu bình luận ngẫu nhiên tự nhiên.

**Acceptance Scenarios**:

1. **Given** video TikTok đang xem không có mô tả (caption trống), nhưng mục bình luận có các bình luận văn bản của cộng đồng, **When** người dùng kích hoạt bình luận tự động, **Then** hệ thống tự động mở khung bình luận, quét danh sách bình luận cấp 1, lọc bỏ bình luận rác/chỉ có emoji, chọn ngẫu nhiên 1 bình luận văn bản hợp lệ và điền vào ô bình luận rồi kích hoạt gửi.
2. **Given** video TikTok đang xem không có mô tả và cũng không có bất kỳ bình luận văn bản nào (video mới đăng hoặc chưa ai bình luận), **When** người dùng kích hoạt bình luận tự động, **Then** hệ thống tự động chọn ngẫu nhiên một câu bình luận chung giàu tương tác từ danh mục dự phòng tiếng Việt và đăng lên video.
3. **Given** video có mô tả văn bản rõ ràng, **When** người dùng kích hoạt bình luận tự động, **Then** hệ thống vẫn ưu tiên phân tích mô tả của video để sinh bình luận như thiết kế chuẩn.

---

### User Story 3 - Chẩn đoán, tối ưu và hiển thị minh bạch kết quả tạo bình luận từ AI (Priority: P1)

Khắc phục lỗi người dùng phản hồi "hiện tại chưa lấy được bình luận từ AI". Cung cấp cơ chế gọi API mô hình AI (Google Gemini) ổn định, hỗ trợ tên model chuẩn xác nhất (`gemini-1.5-flash`, `gemini-2.0-flash` hoặc fallback tự động), kiểm tra tính hợp lệ của API Key, xử lý lỗi mạng/quota rõ ràng, và hiển thị thông báo trạng thái minh bạch trên Side Panel (cho biết câu bình luận được sinh từ Gemini AI hay từ nguồn dự phòng thông minh, lý do lỗi cụ thể nếu API gọi thất bại).

**Why this priority**: Đây là lỗi cốt lõi người dùng đang gặp phải, khiến trải nghiệm sử dụng AI bị gián đoạn và người dùng không biết lý do vì sao tính năng AI chưa hoạt động.

**Independent Test**: Nhập một API key Gemini hợp lệ vào ô cài đặt, bấm "Tự động bình luận" trên video TikTok có mô tả. Xác nhận Side Panel hiển thị huy hiệu "✨ Bình luận Gemini AI" với nội dung bám sát mô tả video. Thử nghiệm với API key sai/hết quota, xác nhận Side Panel hiển thị thông báo lỗi cụ thể (ví dụ "Lỗi API Key không hợp lệ") và tự động chuyển sang bình luận dự phòng mà không làm sập tiến trình.

**Acceptance Scenarios**:

1. **Given** người dùng cấu hình Gemini API Key hợp lệ và video có mô tả, **When** người dùng bấm bình luận, **Then** hệ thống gửi yêu cầu chuẩn đến endpoint Gemini, nhận câu trả lời dưới 15 từ tiếng Việt, hiển thị huy hiệu "✨ Bình luận Gemini AI", và nhập vào khung bình luận TikTok.
2. **Given** người dùng nhập API Key không hợp lệ (sai key, hết hạn mức quota, hoặc lỗi phân quyền HTTP 400/403), **When** gọi API thất bại, **Then** hệ thống hiển thị thông báo nguyên nhân lỗi rõ ràng trên Status Box (ví dụ: "API Key Gemini không hợp lệ hoặc hết hạn mức, đang dùng bình luận dự phòng"), sau đó chuyển mượt mà sang bình luận dự phòng thông minh.
3. **Given** người dùng không nhập API Key, **When** bấm bình luận, **Then** hệ thống thông báo minh bạch là đang dùng bộ sinh bình luận ngữ cảnh thông minh tích hợp sẵn.

---

### Edge Cases

- **Video tắt tính năng bình luận**: Hệ thống nhận diện trạng thái bị khóa và dừng lại trước khi sinh nội dung hay quét bình luận, hiển thị thông báo rõ ràng "Chủ sở hữu video đã tắt bình luận".
- **Bình luận sẵn có trên video chỉ toàn sticker hoặc icon biểu cảm**: Bộ lọc bình luận phải nhận diện và loại bỏ các chuỗi chỉ chứa icon/ký tự đặc biệt, nếu không còn bình luận văn bản nào đạt tiêu chuẩn thì tự động rơi vào nhánh "bình luận ngẫu nhiên đa dạng".
- **Người dùng thay đổi tùy chọn liên tục trong khi thao tác đang diễn ra**: Các tác vụ đang chạy không bị xung đột; trạng thái lưu trữ được áp dụng nhất quán.
- **Mất kết nối mạng khi gọi API AI**: Bắt lỗi `fetch` / mạng kịp thời, không treo nút bấm loading, tự động chuyển sang câu bình luận có sẵn trong bộ nhớ offline.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI lưu trữ toàn bộ các tùy chọn của người dùng vào `chrome.storage.local`, bao gồm:
  - `likeMethod`: Phương thức thả tim (`auto`, `button`, `key_l`, `double_click`).
  - `geminiApiKey`: Khóa API Google Gemini.
  - `commentStyle`: Phong cách bình luận (`friendly`, `compliment`, `humorous`, `question`).
  - `autoSubmit`: Trạng thái tự động nhấn nút gửi (`true`/`false`).
- **FR-002**: Hệ thống PHẢI tự động tải và điền lại toàn bộ các tùy chọn đã lưu mỗi khi Side Panel được khởi tạo hoặc mở ra.
- **FR-003**: Hệ thống PHẢI tự động lưu các thay đổi của người dùng ngay khi có tương tác (sự kiện `change` trên dropdown/checkbox) và khi người dùng nhấn nút "Lưu cài đặt".
- **FR-004**: Khi mô tả video trống hoặc không có ý nghĩa văn bản, hệ thống PHẢI quét các bình luận văn bản cấp 1 hiện có trên video TikTok:
  - Tìm các phần tử bình luận trong DOM (ví dụ `[data-e2e="comment-level-1"]` hoặc các thẻ văn bản bình luận tương đương).
  - Lọc lấy các bình luận có văn bản tiếng Việt/chữ cái rõ ràng (tối thiểu 3 ký tự, không chỉ chứa icon).
  - Chọn ngẫu nhiên 1 bình luận trong danh sách để tương tác.
- **FR-005**: Nếu video không có mô tả và cũng KHÔNG tìm thấy bất kỳ bình luận văn bản hợp lệ nào, hệ thống PHẢI chọn ngẫu nhiên một câu bình luận từ danh sách bình luận mẫu phong phú tiếng Việt được định nghĩa sẵn.
- **FR-006**: Hệ thống PHẢI tối ưu cơ chế kết nối Google Gemini API:
  - Sử dụng endpoint chuẩn `gemini-1.5-flash` và cơ chế fallback sang `gemini-2.0-flash` hoặc `gemini-1.5-pro` nếu có lỗi model.
  - Xử lý chi tiết các mã lỗi phản hồi từ Google AI (HTTP 400 Bad Request, 403 Forbidden / Invalid Key, 429 Rate Limit / Quota Exceeded).
  - Phản hồi nguyên nhân lỗi chi tiết lên giao diện người dùng nếu API Key có vấn đề thay vì âm thầm nuốt lỗi.
- **FR-007**: Hệ thống PHẢI phân biệt rõ ràng và hiển thị huy hiệu nguồn gốc bình luận trên Side Panel: "✨ Bình luận Gemini AI", "💬 Bình luận lấy từ video", hoặc "💡 Bình luận mẫu ngẫu nhiên".

---

## Success Criteria *(mandatory)*

- **SC-001 (Tính bền vững)**: 100% các tùy chọn giao diện (phương thức thả tim, API Key, phong cách, tự động gửi) được khôi phục chính xác sau khi đóng và mở lại Side Panel.
- **SC-002 (Xử lý trường hợp không mô tả)**: Khi gặp video không có caption, 100% các lượt chạy đều tạo ra được bình luận hợp lệ (ưu tiên từ bình luận cộng đồng, dự phòng bằng câu ngẫu nhiên chất lượng cao) mà không bị treo hay gián đoạn.
- **SC-003 (Độ tin cậy của AI)**: Khi có API Key hợp lệ và có mạng, tỷ lệ lấy thành công bình luận từ Gemini AI đạt > 95%; khi API Key lỗi hoặc không có mạng, hệ thống chuyển sang chế độ dự phòng trong vòng < 500ms kèm lý do thông báo rõ ràng cho người dùng.
- **SC-004 (Bảo vệ DOM TikTok)**: Không gây ra bất kỳ lỗi Crash hay vi phạm React Virtual DOM nào trên trang web TikTok trong mọi tình huống tương tác.

---

## Key Entities & Data Schema

### Stored Preferences (`chrome.storage.local`)
- `likeMethod`: `"auto"` | `"button"` | `"key_l"` | `"double_click"`
- `geminiApiKey`: string (khóa bí mật của người dùng)
- `commentStyle`: `"friendly"` | `"compliment"` | `"humorous"` | `"question"`
- `autoSubmit`: boolean (`true` | `false`)

### Video Info Result (`GET_ACTIVE_VIDEO_INFO`)
- `hasDescription`: boolean
- `description`: string (mô tả nguyên bản hoặc rỗng)
- `existingComments`: string[] (danh sách các bình luận văn bản trích xuất được từ video nếu có)
- `canComment`: boolean (bình luận có bị tắt không)

### Comment Source Resolution
- `source`: `"gemini"` | `"community_comment"` | `"smart_fallback"` | `"random_general"`
- `text`: string (nội dung bình luận)
- `errorMessage`: string | null (thông điệp lỗi nếu AI gọi thất bại)
