# Feature Specification: Tiện ích mở rộng tự động thả tim video TikTok qua Side Panel

**Feature Branch**: `001-tiktok-auto-like`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Tạo extension trình duyệt: Nhấn vào icon extension thì hiện sidePanel. Trong sidePanel có nút bắt đầu, khi nhấn bắt đầu thì click vào nút thả tim video: tiktok hỗ trợ 3 thao tác thả tim video là nhấn 2 lần vào video, nhấn nút thả tim, nhấn phím L trên bàn phím, dùng cách nào cũng được"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mở giao diện điều khiển Side Panel từ biểu tượng tiện ích (Priority: P1)

Người dùng duyệt web muốn mở bảng điều khiển tiện ích dạng side panel (bảng cạnh trình duyệt) một cách nhanh chóng chỉ bằng cách nhấp vào biểu tượng của tiện ích trên thanh công cụ trình duyệt mà không làm che khuất nội dung chính của trang web.

**Why this priority**: Đây là điểm chạm đầu tiên (entry point) để người dùng truy cập và kích hoạt mọi tính năng của tiện ích.

**Independent Test**: Cài đặt tiện ích vào trình duyệt, nhấp chuột vào biểu tượng tiện ích trên thanh công cụ, xác nhận bảng side panel mở ra thành công bên cạnh cửa sổ trình duyệt.

**Acceptance Scenarios**:

1. **Given** tiện ích đã được cài đặt và kích hoạt, **When** người dùng nhấp chuột trái vào biểu tượng tiện ích trên thanh công cụ, **Then** cửa sổ side panel của tiện ích được mở ra bên cạnh tab hiện tại.
2. **Given** cửa sổ side panel đang mở, **When** người dùng chuyển đổi giữa các tab khác nhau, **Then** side panel vẫn duy trì hiển thị hoặc có thể tái kích hoạt dễ dàng theo cấu hình trình duyệt.

---

### User Story 2 - Kích hoạt tự động thả tim video TikTok đang xem (Priority: P1)

Người dùng đang xem video trên trang TikTok và mở side panel của tiện ích, người dùng nhấp vào nút "Bắt đầu" để tiện ích tự động thực hiện thao tác thả tim cho video TikTok đang hiển thị mà người dùng không cần phải tự tay tìm và bấm nút tim trên video.

**Why this priority**: Đây là giá trị cốt lõi của tính năng, giúp tự động hóa thao tác tương tác (thả tim) cho video TikTok.

**Independent Test**: Mở một video TikTok bất kỳ trên tab trình duyệt, mở side panel và nhấn nút "Bắt đầu", xác minh trạng thái video đã được thả tim (biểu tượng tim chuyển màu đỏ / số lượng thích tăng lên / thông báo thích xuất hiện).

**Acceptance Scenarios**:

1. **Given** người dùng đang ở tab trang web TikTok với video đang hiển thị và chưa được thả tim, **When** người dùng nhấp nút "Bắt đầu" trên side panel, **Then** hệ thống thực hiện thao tác tương tác thả tim thành công (thông qua nhấp đúp video, nhấp nút thích hoặc gửi phím tắt 'L') và video chuyển sang trạng thái đã thích.
2. **Given** video TikTok đã được thả tim từ trước, **When** người dùng nhấp nút "Bắt đầu" trên side panel, **Then** hệ thống không thực hiện thao tác hủy thích (un-like) và thông báo cho người dùng biết video đã được thả tim trước đó.

---

### User Story 3 - Phản hồi trạng thái hoạt động trên Side Panel (Priority: P2)

Người dùng cần biết thao tác bấm nút "Bắt đầu" đã được thực hiện ra sao: thành công, đang xử lý, hoặc gặp lỗi (ví dụ không tìm thấy video hoặc không phải trang TikTok) để có hành động phù hợp.

**Why this priority**: Giúp cải thiện trải nghiệm người dùng (UX), tránh việc người dùng bối rối khi không biết thao tác có hiệu lực hay chưa.

**Independent Test**: Thử nghiệm nhấn nút "Bắt đầu" ở các ngữ cảnh khác nhau (tab không phải TikTok, tab TikTok có video, tab TikTok không có video) và quan sát thông tin trạng thái cập nhật trên side panel.

**Acceptance Scenarios**:

1. **Given** người dùng đang mở tab không phải miền TikTok, **When** người dùng nhấn nút "Bắt đầu", **Then** side panel hiển thị thông báo hướng dẫn người dùng cần chuyển sang tab xem video TikTok.
2. **Given** người dùng đang ở tab TikTok nhưng chưa có video nào được nạp, **When** người dùng nhấn nút "Bắt đầu", **Then** side panel hiển thị thông báo không tìm thấy video hợp lệ để thả tim.
3. **Given** thao tác thả tim thành công, **When** quá trình tương tác hoàn tất, **Then** side panel hiển thị thông báo thả tim thành công.

---

### Edge Cases

- **Tab hiện tại không phải là TikTok**: Người dùng mở side panel trên một trang web khác (ví dụ google.com, youtube.com). Hệ thống cần nhận diện và thông báo lịch sự thay vì gây lỗi ngầm.
- **Video chưa tải xong hoặc mạng chập chờn**: Khi trang web TikTok đang tải nội dung, phần tử video chưa sẵn sàng để nhận tương tác.
- **Người dùng bấm liên tục nhiều lần**: Người dùng nhấp nút "Bắt đầu" dồn dập trong lúc thao tác tương tác trước đó chưa xử lý xong. Hệ thống phải vô hiệu hóa tạm thời nút hoặc loại bỏ các thao tác trùng lặp.
- **Video TikTok mở dưới dạng xem Feed vs dạng xem chi tiết (Modal / URL riêng)**: Cấu trúc hiển thị video có thể khác nhau giữa luồng lướt For You feed và khi mở xem trực tiếp liên kết video độc lập. Cơ chế tương tác phải đáp ứng được cả hai trường hợp.
- **Trạng thái tài khoản người dùng**: Người dùng chưa đăng nhập TikTok trên trình duyệt, TikTok có thể hiển thị hộp thoại yêu cầu đăng nhập khi nhấn nút thả tim.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST cấu hình hành vi nhấp vào biểu tượng tiện ích trên thanh công cụ để mở cửa sổ side panel của trình duyệt.
- **FR-002**: Giao diện side panel MUST cung cấp nút điều khiển rõ ràng (nút "Bắt đầu") để người dùng kích hoạt thao tác thả tim.
- **FR-003**: Hệ thống MUST xác định được tab trình duyệt đang hoạt động để kiểm tra xem tab đó có thuộc trang TikTok hay không.
- **FR-004**: Hệ thống MUST thực hiện được thao tác thả tim đối với video TikTok đang phát/hiển thị trong tab hoạt động thông qua ít nhất một trong các phương thức tương tác được TikTok hỗ trợ (nhấp 2 lần vào video, nhấp vào nút thả tim, hoặc nhấn phím 'L').
- **FR-005**: Hệ thống MUST kiểm tra trạng thái của video hiện tại để tránh trường hợp vô tình hủy thích nếu video đã được thả tim từ trước.
- **FR-006**: Giao diện side panel MUST hiển thị phản hồi trạng thái rõ ràng trực quan (Sẵn sàng, Đang xử lý, Thả tim thành công, Đã thích từ trước, Không tìm thấy video, hoặc Vui lòng mở trang TikTok).
- **FR-007**: Hệ thống MUST ngăn ngừa việc kích hoạt lặp lại (debounce/lock) khi một thao tác thả tim đang trong quá trình thực thi.

### Key Entities *(include if feature involves data)*

- **Bảng điều khiển Side Panel (Side Panel UI)**: Giao diện người dùng tích hợp ở cạnh trình duyệt, chứa các nút bấm điều khiển và vùng hiển thị trạng thái hoạt động.
- **Phiên tương tác TikTok (TikTok Interaction Session)**: Biểu diễn trạng thái của video TikTok trên tab hiện hành (đường dẫn trang, trạng thái sẵn sàng của video, trạng thái đã thích hay chưa).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Side panel mở ra trong vòng dưới 1 giây sau khi người dùng nhấp vào biểu tượng tiện ích trên thanh công cụ.
- **SC-002**: Thời gian thực hiện và ghi nhận thao tác thả tim hoàn tất trong vòng dưới 1.5 giây kể từ thời điểm người dùng nhấn nút "Bắt đầu".
- **SC-003**: 100% các tình huống không hợp lệ (không phải tab TikTok, không có video trên trang) đều được hiển thị thông điệp phản hồi rõ ràng trong vòng dưới 500ms.
- **SC-004**: Tỷ lệ thả tim thành công đạt từ 95% trở lên trên các trang video TikTok thông thường (trang For You và trang chi tiết video).

## Assumptions

- Tiện ích hướng đến các trình duyệt hiện đại hỗ trợ tính năng Side Panel (như Google Chrome phiên bản 114 trở lên, Microsoft Edge, Brave, v.v.).
- Người dùng đã đăng nhập tài khoản TikTok trên trình duyệt để thao tác thả tim được nền tảng TikTok ghi nhận.
- Trong số 3 phương thức tương tác được TikTok hỗ trợ (click đúp video, click nút thả tim, phím L), giải pháp kỹ thuật sẽ ưu tiên phương thức ổn định, đáng tin cậy nhất và có cơ chế dự phòng nếu một phương thức bị ảnh hưởng bởi thay đổi giao diện TikTok.
- Thao tác thả tim ở phiên bản hiện tại áp dụng cho video đang xem ở tab hiện hành, chưa bao gồm tính năng tự động cuộn trang (auto-scroll) sang video tiếp theo.

