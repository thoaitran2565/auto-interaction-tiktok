# Feature Specification: Anti-Bot & Tool Detection Humanizer

**Feature Branch**: `005-anti-bot-humanizer`

**Created**: 2026-11-05

**Status**: Specified

**Input**: User description: "Xây dựng cơ chế tránh bị tiktok quét là bot hoặc dùng tool:
- Không thực hiện tất cả các thao tác cùng một lúc
- Thêm tỉ lệ bỏ qua video, để tránh tương tác liên tục
- Thời gian tương tác video giống nhau cũng có thể bị quét trúng nên nếu chọn 10s thì hãy random thời gian thực thi tương tác trong khoảng đó
- Thường xuyên chọn bình luận đầu tiên để copy cũng có thể bị quét trúng"

---

## Clarifications

### Session 2026-11-05
- Q: Khi một video được chọn để bỏ qua tương tác (theo tỷ lệ Skip Rate), bot nên dừng lại xem video trong bao lâu trước khi chuyển sang video kế tiếp? → A: Dừng xem ngắn ngẫu nhiên từ 2s đến 5s rồi lướt tiếp (mô phỏng lướt qua video không quan tâm).
- Q: Khi trích xuất ngẫu nhiên trong danh sách bình luận của khán giả để sao chép, hệ thống nên áp dụng quy tắc lọc và phạm vi chọn như thế nào? → A: Chọn ngẫu nhiên trong top 3-5 bình luận gốc, tự động bỏ qua bình luận của tác giả (Creator/Pin) và bỏ qua bình luận quá ngắn (< 3 ký tự).
- Q: Giao diện Sidepanel nên bố trí các cài đặt Chống quét Bot (Anti-Bot Humanizer) như thế nào để vừa gọn gàng vừa tiện sử dụng? → A: Công tắc tổng "Chống quét Bot" bật mặc định bộ thông số chuẩn (Jitter ±25%, Skip 15%, Đa dạng comment), kèm nút mở rộng (accordion/collapse) để tùy chỉnh sâu.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Phân tách thời gian thao tác ngẫu nhiên (Staggered Execution & Micro-delays) (Priority: P1)

Là một người dùng tự động hóa TikTok, tôi muốn các thao tác như Thích (Like), Theo dõi (Follow), Bình luận (Comment) và Chuyển video (Next) diễn ra cách nhau một khoảng nghỉ ngẫu nhiên tự nhiên thay vì kích hoạt đồng thời hoặc liên tục tức thì, để TikTok không phát hiện hành vi phi tự nhiên của bot.

**Why this priority**: Hành vi thực hiện nhiều thao tác DOM/API trong mili-giây cùng một lúc là dấu hiệu nhận diện bot rõ ràng nhất của các hệ thống chống spam. Phân tách thao tác là hàng rào bảo vệ căn bản nhất.

**Independent Test**: Kích hoạt chế độ Auto Interact với cả Like, Follow, Comment được bật. Quan sát log và hành vi trên giao diện TikTok:
- Bấm Like $\rightarrow$ đợi ngẫu nhiên (vd: 1.0s - 2.2s) $\rightarrow$ Bấm Follow $\rightarrow$ đợi ngẫu nhiên (vd: 1.2s - 2.8s) $\rightarrow$ Điền & gửi Comment $\rightarrow$ đợi ngẫu nhiên (vd: 1.5s - 2.5s) $\rightarrow$ Next Video.
- Đảm bảo không có 2 hành động nào diễn ra cùng một thời điểm.

**Acceptance Scenarios**:
1. **Given** Cấu hình tương tác đầy đủ (Like, Follow, Comment), **When** hoàn thành thời gian xem video, **Then** hệ thống thực hiện thao tác Like trước, tạm dừng ngẫu nhiên từ 1000ms đến 2500ms trước khi tiếp tục thao tác Follow.
2. **Given** Thao tác Follow hoàn tất (hoặc đã follow trước đó), **When** chuẩn bị bình luận, **Then** hệ thống tạm dừng tự nhiên từ 1200ms đến 2800ms trước khi mở ô nhập bình luận và gửi nội dung.
3. **Given** Bất kỳ lúc nào người dùng nhấn nút "Dừng lại", **Then** các khoảng dừng micro-delay lập tức bị hủy bỏ và phiên dừng an toàn.

---

### User Story 2 - Thời gian xem video ngẫu nhiên theo biên độ dao động (Randomized Jitter Watch Delay) (Priority: P1)

Là một người dùng, khi tôi cài đặt thời gian chờ tương tác là 10 giây, tôi muốn thời gian thực tế mỗi video được phân bổ ngẫu nhiên quanh mốc 10 giây (ví dụ từ 8s đến 13s) thay vì chính xác 10.000 giây cho mọi video, giúp mô phỏng thời lượng xem ngẫu hứng của người dùng thật.

**Why this priority**: Xem 50 video liên tiếp với thời lượng chính xác 10.00 giây là đặc điểm tuần hoàn máy học (periodic pattern) rất dễ bị thuật toán TikTok phát hiện và áp đặt hạn chế tài khoản.

**Independent Test**: Cài đặt thời gian chờ 10s và kích hoạt chế độ Random Delay (Jitter). Chạy qua 5 video liên tiếp và theo dõi log hiển thị thời gian chờ thực tế (ví dụ: Video 1: 11.2s, Video 2: 8.7s, Video 3: 12.1s, Video 4: 9.5s,...).

**Acceptance Scenarios**:
1. **Given** Người dùng chọn mốc thời gian cơ sở là $T$ giây (ví dụ 10s) và bật Random Delay, **When** bắt đầu xem một video mới, **Then** thời gian chờ thực tế $T_{actual}$ được tính toán ngẫu nhiên trong khoảng biên độ an toàn (ví dụ: $T \pm 20\% - 30\%$, có chặn sàn tối thiểu an toàn $\ge 3\text{s}$).
2. **Given** Bộ đếm thời gian đang đếm ngược trên giao diện Sidepanel, **When** hiển thị tiến trình, **Then** thanh trạng thái hiển thị rõ ràng thời gian ngẫu nhiên được chọn cho video hiện tại.

---

### User Story 3 - Tỷ lệ lướt qua ngẫu nhiên không tương tác (Natural Video Skip Rate) (Priority: P2)

Là một người dùng, tôi muốn có thể thiết lập tỷ lệ bỏ qua video (ví dụ 20%), để thỉnh thoảng bot chỉ lướt xem video rồi next sang video kế mà không thả tim, bình luận hay follow, giống như người thật chỉ tương tác với một số video họ thích.

**Why this priority**: Người dùng bình thường không bao giờ tương tác 100% tất cả video xuất hiện trên For You Page (FYP). Một tài khoản tương tác 100/100 video liên tục sẽ bị gắn cờ bot ngay lập tức.

**Independent Test**: Cài đặt tỷ lệ Skip là 30%. Chạy tự động qua 10 video. Kiểm tra có khoảng 2 đến 4 video được hệ thống ghi log "🎲 Bỏ qua tương tác theo tỷ lệ tự nhiên", chỉ dừng xem ngắn ngẫu nhiên từ 2s đến 5s (như lướt qua video không quan tâm) rồi tự động next sang video tiếp theo.

**Acceptance Scenarios**:
1. **Given** Tỷ lệ Skip Rate được thiết lập là $X\%$ (từ 0% đến 50%), **When** chuyển sang video mới, **Then** hệ thống tung xúc xắc ngẫu nhiên với xác suất $X\%$.
2. **Given** Một video rơi vào trạng thái Skip, **When** đến lượt tương tác, **Then** hệ thống bỏ qua toàn bộ hành động Like, Follow, Comment; chỉ xem ngắn ngẫu nhiên từ 2s đến 5s rồi next sang video tiếp theo.
3. **Given** Tỷ lệ Skip Rate đặt là 0%, **When** chạy tự động, **Then** 100% video đều được xử lý tương tác bình thường như trước.

---

### User Story 4 - Đa dạng hóa lựa chọn bình luận khán giả (Diverse Comment Selection) (Priority: P2)

Là một người dùng sử dụng chế độ "Bình luận đầu tiên" hoặc bình luận khán giả, tôi muốn bot ngẫu nhiên chọn một trong top 3 - 5 bình luận phù hợp nhất của khán giả thay vì luôn luôn sao chép bình luận đầu tiên (top 1), để tránh bị quét nội dung trùng lặp hoặc sao chép rập khuôn.

**Why this priority**: Việc luôn lấy phần tử DOM `index 0` của danh sách bình luận làm giảm tính đa dạng và có thể sao chép trúng bình luận ghim của chính tác giả (creator pin) hoặc các bình luận quảng cáo không mong muốn.

**Independent Test**: Bật chế độ First Comment / Sao chép bình luận khán giả. Chạy qua các video có nhiều bình luận. Quan sát bình luận được bot chọn: ngẫu nhiên trong top 1 đến top 3 bình luận người xem hợp lệ (bỏ qua bình luận tác giả nếu có thể nhận biết).

**Acceptance Scenarios**:
1. **Given** Chế độ sao chép bình luận khán giả được bật và video có nhiều hơn 1 bình luận, **When** trích xuất bình luận để sao chép, **Then** hệ thống ngẫu nhiên chọn một bình luận trong top 3 bình luận hợp lệ thay vì luôn luôn lấy bình luận vị trí 0.
2. **Given** Video chỉ có đúng 1 bình luận, **When** trích xuất, **Then** hệ thống sử dụng bình luận duy nhất đó mà không bị lỗi.
3. **Given** Video có bình luận ghim của tác giả (Creator Pinned), **When** quét danh sách, **Then** ưu tiên chọn bình luận của khán giả khác ngoài tác giả video.

---

### Edge Cases

- **Thời gian chờ sau khi jitter bị quá thấp**: Nếu người dùng cấu hình delay cơ sở là 3 giây và jitter trừ đi 30%, thời gian có thể xuống ~2.1 giây. Hệ thống phải quy định mức sàn an toàn tối thiểu (Safety Floor) là 3 giây để đảm bảo video kịp tải và TikTok ghi nhận lượt xem.
- **Tất cả các bình luận trong top 3 đều chứa liên kết spam hoặc quá ngắn**: Nếu bình luận được chọn ngẫu nhiên có độ dài quá ngắn (< 2 ký tự) hoặc chỉ chứa emoji không có nghĩa, hệ thống có thể thử fallback sang bình luận hợp lệ khác trong danh sách hoặc dùng comment mặc định.
- **Mạng lag khiến video tải chậm**: Nếu sau thời gian xem ngẫu nhiên mà các nút Like / Comment vẫn chưa xuất hiện trên DOM, hệ thống tiếp tục áp dụng cơ chế chờ DOM sẵn sàng (tối đa timeout) trước khi tương tác hoặc skip an toàn.
- **Người dùng bấm Stop khi đang ở giữa các micro-delays**: Mọi hàm `sleep` micro-delay phải hỗ trợ cơ chế ngắt quãng (`interruptibleSleepMs`) ngay lập tức để giao diện dừng phản hồi tức thì, không bị treo hoặc tiếp tục click ngầm.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Giao diện Sidepanel PHẢI bổ sung mục cài đặt "Chống quét Bot (Humanizer)" với công tắc tổng bật/tắt (mặc định bật bộ thông số chuẩn an toàn: Jitter $\pm 25\%$, Skip 15%, Đa dạng comment), đồng thời cung cấp nút mở rộng (accordion) để người dùng có thể tùy chỉnh sâu các thông số khi cần.
- **FR-002**: Hệ thống PHẢI lưu trữ cấu hình chống bot trong `chrome.storage.local` bao gồm:
  - `humanizerEnabled` (boolean, mặc định: `true`)
  - `jitterEnabled` (boolean, mặc định: `true`)
  - `jitterPercent` (number, mặc định: `25` ứng với $\pm 25\%$)
  - `skipRate` (number, phạm vi: 0% - 50%, mặc định: `15%`)
  - `commentDiversity` (boolean, mặc định: `true`, chọn ngẫu nhiên trong top 3 bình luận)
- **FR-003**: Hệ thống PHẢI thực hiện việc phân tách thao tác (Staggered Execution) với micro-delay ngẫu nhiên:
  - Giữa hoàn thành xem và Thích: 300ms - 800ms
  - Giữa Thích và Theo dõi: 800ms - 2000ms
  - Giữa Theo dõi và Bình luận: 1200ms - 2500ms
  - Giữa Bình luận xong và Next video: 1200ms - 2500ms
- **FR-004**: Thời gian xem video mỗi vòng lặp PHẢI được tính toán động theo công thức:
  $$T_{actual} = \max\left(3, T_{base} \times (1 + \text{random}(-\text{jitter}, +\text{jitter}))\right)$$
  khi tính năng Jitter được bật.
- **FR-005**: Trước khi thực hiện tương tác trên video hiện tại, hệ thống PHẢI kiểm tra tỷ lệ Skip Rate:
  - Nếu ngẫu nhiên rơi vào tỷ lệ Skip, ghi log "🎲 [Skip Rate] Bỏ qua tương tác video này để giữ an toàn cho tài khoản", chỉ dừng xem ngẫu nhiên ngắn từ 2s đến 5s rồi điều hướng sang video tiếp theo.
- **FR-006**: Khi chế độ sao chép bình luận được kích hoạt cùng `commentDiversity`, hệ thống PHẢI thu thập các bình luận gốc của khán giả trong top 3-5 bình luận đầu tiên, tự động loại bỏ bình luận ghim của tác giả (Creator/Pin) và bình luận quá ngắn (< 3 ký tự), sau đó chọn ngẫu nhiên một bình luận hợp lệ thay vì luôn chọn bình luận số 0. Nếu không có bình luận nào thỏa mãn, fallback về bình luận mặc định hoặc bình luận đầu tiên có nội dung.
- **FR-007**: Toàn bộ các bước chờ ngẫu nhiên, micro-delay, và skip PHẢI hiển thị thông báo trạng thái trực quan, thân thiện trên giao diện Sidepanel để người dùng dễ theo dõi hoạt động.
- **FR-008**: Toàn bộ các thao tác dừng tạm thời PHẢI sử dụng cơ chế có thể bị gián đoạn (`interruptibleSleepMs`) khi biến cờ dừng được kích hoạt.

### Key Entities

- **HumanizerConfig**:
  - `enabled`: boolean
  - `jitterEnabled`: boolean
  - `jitterPercent`: number (ví dụ: 25)
  - `skipRatePercent`: number (ví dụ: 15)
  - `commentDiversityEnabled`: boolean
  - `minActionDelayMs`: number (800)
  - `maxActionDelayMs`: number (2500)
- **VideoInteractionPlan**:
  - `shouldSkip`: boolean
  - `plannedWatchTimeMs`: number
  - `plannedActions`: Array<'like' | 'follow' | 'comment'>
  - `commentCandidateIndex`: number

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% các thao tác Tương tác (Like, Follow, Comment) không bao giờ diễn ra đồng thời; luôn có khoảng cách thời gian tối thiểu 800ms giữa các thao tác liên tiếp.
- **SC-002**: Thời gian dừng xem giữa các video liên tiếp có độ lệch chuẩn rõ rệt, dao động tự nhiên quanh mức cấu hình (không xuất hiện 2 video có thời gian chờ bằng mili-giây giống hệt nhau).
- **SC-003**: Khi cài đặt Skip Rate $X\%$, tỷ lệ video được bỏ qua trên tập mẫu 30 video đạt mức xấp xỉ $X \pm 10\%$.
- **SC-004**: Trong chế độ sao chép bình luận với các video có nhiều bình luận, tỷ lệ phân bổ lựa chọn giữa các bình luận top 1, top 2, top 3 tiệm cận đều, loại bỏ hiện tượng 100% sao chép bình luận top 1.
- **SC-005**: Thao tác "Dừng lại" có hiệu lực phản hồi dưới 200ms tại bất kỳ giai đoạn nào của vòng lặp hoặc micro-delay.

---

## Assumptions

- Thuật toán nhận diện bot của TikTok dựa trên phân tích hành vi bất thường: tần suất thao tác bất thường (quá nhanh, quá đều, 100% tương tác) và nội dung trùng lặp.
- Người dùng có thể tùy chỉnh hoặc tắt tính năng chống bot nếu muốn kiểm thử với tốc độ tối đa theo nhu cầu riêng.
- Khoảng cách micro-delay mặc định từ 800ms đến 2500ms là phù hợp với tốc độ phản xạ tự nhiên của ngón tay người dùng lướt web trên máy tính để bàn.
