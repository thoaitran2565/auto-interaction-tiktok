# Tiện ích mở rộng: TikTok Auto Interaction (Chrome MV3)

Tiện ích mở rộng trình duyệt (Google Chrome, Microsoft Edge, Brave, v.v.) hỗ trợ mở bảng điều khiển **Side Panel**, tự động **thả tim**, **tự động bình luận thông minh (AI / Lấy bình luận đầu)** và **tự động chuyển video liên tục (Auto Interaction)** cho TikTok chỉ với một nút bấm.

---

## 🌟 Tính năng nổi bật

### 1. Side Panel bản địa (Chrome Side Panel API)
- Nhấp vào biểu tượng tiện ích trên thanh công cụ trình duyệt để mở bảng điều khiển bên cạnh trang web, không che khuất video.
- Tự động nhận diện tab TikTok và kiểm tra tính hợp lệ của trang.

### 2. Tự động tương tác liên tục (Auto Interaction Flow) ⚡ V1.5.0
- **Cơ chế mô phỏng hành vi người dùng thật (Xem video trước khi tương tác)**:
  1. Kiểm tra video và các nút tương tác sẵn sàng trong DOM.
  2. **Đếm ngược thời gian xem video (Watch delay)** theo cấu hình hoặc ngẫu nhiên dao động (Jitter).
  3. Sau khi xem xong, tự động **thả tim** video (ngăn ngừa un-like).
  4. Tự động **Follow kênh** nếu chưa theo dõi (tùy chọn bật/tắt).
  5. Tạo/lấy nội dung bình luận và **đăng bình luận** tự động.
  6. Bấm nút mũi tên xuống (`feed-navigation-next`) để chuyển sang video tiếp theo và lặp lại chu trình.
- **Tùy chọn tự động Follow kênh chưa theo dõi**: Tự động phát hiện nút follow của tác giả video và nhấn theo dõi (tự động bỏ qua nếu đã follow từ trước hoặc là video của chính bạn).
- **Tùy chỉnh thời gian xem video (Delay)**: Lựa chọn 3s, 5s, 8s, 10s, hoặc 15s trước khi tương tác.
- **Giới hạn số lượng video**: Cấu hình tự động dừng sau 10, 20, 50 video hoặc chạy không giới hạn.
- **Tự động bỏ qua khi video khóa bình luận**: Nếu video tắt bình luận (`canComment === false`), tiện ích vẫn thả tim/follow và bỏ qua bước đăng bình luận.
- **Nút Dừng tức thì (Safe Stop)**: Phản hồi ngắt chu trình ngay lập tức (< 150ms) khi người dùng bấm nút Dừng.

### 3. Chống quét Bot & Mô phỏng hành vi tự nhiên (Anti-Bot Humanizer) 🛡️ V1.5.0 MỚI
- **Phân tách thời gian thao tác (Staggered Execution & Micro-delays)**:
  - Loại bỏ hoàn toàn việc click đồng loạt trong tích tắc.
  - Tự động chèn khoảng nghỉ ngẫu nhiên tự nhiên:
    - Xem xong $\rightarrow$ Thả tim: `300ms - 800ms`.
    - Thả tim $\rightarrow$ Follow kênh: `800ms - 2000ms`.
    - Follow $\rightarrow$ Bình luận: `1200ms - 2500ms`.
    - Bình luận xong $\rightarrow$ Chuyển video kế tiếp: `1200ms - 2500ms`.
- **Dao động thời gian xem ngẫu nhiên (Jitter Watch Delay)**:
  - Thay vì xem đúng 10.00s cơ học cho mọi video, thời gian xem thực tế mỗi video được phân bổ ngẫu nhiên: $T_{\text{actual}} = \max(3, T_{\text{base}} \pm 25\%)$.
  - Triệt tiêu mẫu chu kỳ tuần hoàn cơ học (fixed periodicity) mà thuật toán TikTok dùng để phát hiện bot.
- **Tỷ lệ lướt qua ngẫu nhiên (Natural Skip Rate)**:
  - Cho phép chọn tỷ lệ lướt qua không tương tác (0%, 10%, 15%, 20%, 30%).
  - Khi rơi vào trạng thái skip, bot chỉ dừng xem ngắn ngẫu nhiên từ 2s đến 5s rồi tự động lướt tiếp (mô phỏng người lướt qua video không quan tâm).
- **Đa dạng hóa bình luận khán giả (Diverse Comment Selection)**:
  - Tự động quét top 3 - 5 bình luận hợp lệ của khán giả (loại trừ bình luận tác giả và ghim).
  - Chọn ngẫu nhiên trong danh sách top bình luận thay vì luôn sao chép rập khuôn bình luận đầu tiên (top 1).
- **Công tắc tổng & Accordion tùy chỉnh sâu**:
  - Giao diện có công tắc bật/tắt nhanh tiện lợi, kèm menu mở rộng để tùy biến thông số chống bot theo ý muốn.

### 4. Chế độ lấy bình luận khán giả của video (Audience Comment Mode) 💬 V1.5.0
- Cho phép người dùng tùy chọn bình luận bằng cách lấy chính xác bình luận của khán giả trên video TikTok.
- **Tự động bỏ qua bình luận của tác giả và bình luận ghim**: Nhận diện và bỏ qua các thẻ `comment-creator-tag`, nhãn `"Tác giả"` / `"Creator"`, hoặc nhãn `"Đã ghim"` / `"Pinned"` để lấy chuẩn bình luận của người xem.
- Dự phòng thông minh: Nếu video chưa có bình luận của người xem, tự động fallback sang câu tương tác tự nhiên.

### 4. Tự động bình luận thông minh bằng AI (AI Auto-Comment)
- **Trích xuất mô tả tự động**: Quét và đọc chính xác nội dung mô tả của video từ các thẻ `span[data-e2e^="desc-span"]` hoặc `div[data-e2e="video-desc"]`.
- **Cơ chế đa tầng khi video KHÔNG có mô tả**:
  - Tự động mở khung bình luận và quét các bình luận văn bản sẵn có (`[data-e2e^="comment-level"]`) trên video để chọn ngẫu nhiên 1 câu tương tác.
  - Nếu video chưa có bình luận nào hoặc chỉ có icon/nhãn dán, tự động chọn ngẫu nhiên một câu tương tác tự nhiên từ kho bình luận phong phú tiếng Việt.
- **Mô hình AI đa năng & Chẩn đoán kết nối**:
  - Hỗ trợ kết nối **Google Gemini API** (`gemini-1.5-flash` và fallback `gemini-2.0-flash`) để tạo câu bình luận tiếng Việt ngắn gọn, dí dỏm.
  - **Nút "Kiểm tra Key" trực tiếp**: Kiểm tra ngay tính hợp lệ của API Key và hiển thị nguyên nhân lỗi chi tiết (sai key, hết hạn quota, lỗi mạng).
  - Tích hợp sẵn **bộ quy tắc dự phòng thông minh (Smart Context Fallback)** theo chủ đề hoạt động ngay cả khi chưa có API key.
  - Hiển thị huy hiệu nguồn gốc bình luận minh bạch: `✨ Bình luận Gemini AI`, `💬 Bình luận đầu tiên`, `💬 Bình luận lấy từ video`, `💡 Bình luận thông minh`, `🎲 Bình luận ngẫu nhiên`.
- **Tương thích tuyệt đối với React / Draft.js của TikTok**:
  - Sử dụng cơ chế Synthetic Paste an toàn với `ClipboardEvent` & `DataTransfer`, không can thiệp trực tiếp vào Virtual DOM giúp loại bỏ 100% lỗi crash trang web.
  - Tự động chờ nút gửi `button[data-e2e="comment-post"]` kích hoạt trước khi click.

### 5. Tự động thả tim thông minh (Auto-Like)
- Tự động tìm và tương tác với video TikTok đang xem trong tầm nhìn.
- Kiểm tra thuộc tính `aria-pressed` để **ngăn ngừa un-like** nhầm nếu video đã có tim.
- Hỗ trợ 4 cơ chế tương tác:
  - ✨ Tự động thông minh.
  - ❤️ Nhấn nút thả tim (`[data-e2e="like-icon"]`).
  - ⌨️ Nhấn phím 'L' trên bàn phím (native TikTok shortcut).
  - 👆 Nhấn 2 lần vào video (double-click gesture).

### 6. Tự động lưu cấu hình bền vững (Settings Persistence)
- Tự động lưu và khôi phục 100% cài đặt (phương thức thả tim, API Key, phong cách, chế độ bình luận, thời gian chờ, giới hạn số video, checkbox tự động gửi) vào `chrome.storage.local`. Không bị mất cấu hình khi đóng mở Side Panel.

---

## 🚀 Hướng dẫn cài đặt vào trình duyệt

1. Mở trình duyệt Google Chrome hoặc Microsoft Edge.
2. Truy cập vào trang quản lý tiện ích:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Bật tùy chọn **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải.
4. Nhấp vào nút **Tải tiện ích đã giải nén (Load unpacked)**.
5. Chọn thư mục dự án này: `d:\Code\extensions\auto-interaction-tiktok`.
6. Nhấp vào biểu tượng Mảnh ghép trên thanh công cụ và **Ghim (Pin)** tiện ích ra ngoài thanh công cụ.

---

## 📖 Hướng dẫn sử dụng

1. Truy cập trang web [TikTok](https://www.tiktok.com) và mở mục xem video (Dành cho bạn / For You).
2. Nhấp vào **biểu tượng tiện ích** trên thanh công cụ -> Cửa sổ **Side Panel** sẽ mở ra ở cạnh phải.
3. Trong Side Panel:
   - **Tự động tương tác liên tục**: Chọn thời gian chờ (ví dụ 5 giây), chọn giới hạn video (ví dụ 20 video), rồi nhấn **"▶ Bắt đầu Auto tương tác"**. Tiện ích sẽ tự động thả tim, bình luận, chờ đếm ngược và bấm mũi tên xuống chuyển video. Nhấn **"⏹ Dừng lại"** bất cứ lúc nào để kết thúc.
   - **Tương tác từng video**:
     - Nhấn **"Thả tim video"** để thả tim cho video hiện tại.
     - Nhấn **"Tự động bình luận"** để bình luận cho một video đơn lẻ.
   - **Cài đặt chế độ bình luận**:
     - Mở mục **⚙️ Cài đặt AI & Bình luận**.
     - Chọn chế độ: **"Tạo từ AI & nội dung video"** hoặc **"Lấy bình luận đầu tiên của video"**.
     - Dán Google Gemini API Key cá nhân nếu muốn bình luận AI theo ngữ cảnh chính xác nhất.

---

## 📁 Cấu trúc mã nguồn

```text
auto-interaction-tiktok/
├── manifest.json            # Cấu hình Manifest V3, quyền sidePanel, tabs, scripting, storage, host_permissions
├── background.js            # Service Worker cấu hình setPanelBehavior mở Side Panel
├── sidepanel/
│   ├── sidepanel.html       # Giao diện Side Panel với nút like, comment AI và cài đặt
│   ├── sidepanel.css        # Giao diện phong cách tối hiện đại (Dark theme)
│   ├── sidepanel.js         # Logic điều khiển, message passing, lưu cài đặt
│   └── ai-generator.js      # Module kết nối Gemini 1.5 Flash API & Smart Fallback engine
├── content/
│   └── content.js           # Content Script tương tác DOM TikTok: like, trích xuất span mô tả, gõ thẻ div Draft.js, kích hoạt nút gửi
├── icons/                   # Icon tiện ích (16, 48, 128px)
├── specs/                   # Tài liệu đặc tả kỹ thuật, kế hoạch và nhiệm vụ (Spec-Kit)
└── page.html                # Mã HTML thực tế của TikTok dùng để kiểm định selector
```
