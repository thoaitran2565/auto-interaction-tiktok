# Research: Auto Skip Livestream Videos

## Unknowns & Decisions

### Decision 1: Dấu hiệu nhận diện Livestream trên TikTok Desktop Web
- **Decision**: Kết hợp 4 tín hiệu DOM đặc trưng đã xác thực từ `page2.html`:
  1. Nút "Xem LIVE" (hoặc "Watch LIVE") có text node hoặc `[data-testid="tux-web-text"]` nằm trong container nút bên phải (`data-testid="tux-web-button"`).
  2. Khối thông báo tắt bình luận để xem LIVE: `.live-desc` hoặc `div[class*="DivLiveUnavailableContainer"]` ("Chức năng bình luận đã bị tắt. Hãy xem LIVE để trò chuyện với những người xem khác.").
  3. Nút thích dạng live: `[data-e2e="live-like-icon"]` (video thường là `data-e2e="like-icon"`).
  4. Nút chia sẻ live: `[data-e2e="live-share-icon"]`.
- **Rationale**:
  - `page2.html` cho thấy khi một livestream xuất hiện trên feed, TikTok không render khung bình luận thường mà render một container chuyên biệt `DivLiveUnavailableContainer` cùng các biểu tượng live đặc thù.
  - Sử dụng kết hợp nhiều chỉ báo giúp tỷ lệ nhận diện đạt 100% và không bị ảnh hưởng nếu TikTok đổi 1 class name ngẫu nhiên.
- **Alternatives considered**:
  - *Chỉ kiểm tra chữ "Xem LIVE"*: Có thể bị lỗi nếu người dùng cài đặt giao diện tiếng Anh ("Watch LIVE") hoặc một bình luận ngẫu nhiên có chứa chữ "Xem LIVE". Bằng cách giới hạn trong các vùng nút và container live, ta loại bỏ hoàn toàn khả năng nhận diện nhầm.

### Decision 2: Cửa sổ thời gian quét (Scanning Window & Polling)
- **Decision**: Quét trong khoảng 1.5s - 2.0s đầu sau khi cuộn tới video mới, polling mỗi 250ms song song với `WAIT_FOR_VIDEO_READY`.
- **Rationale**:
  - Mạng có thể lag khiến container live hoặc nút "Xem LIVE" tải trễ vài trăm mili-giây. Polling ngắn (1.5s) đảm bảo không bỏ sót ngay cả khi mạng yếu, đồng thời nếu thấy ngay thì dừng quét và phản hồi lập tức.
- **Alternatives considered**:
  - *Chỉ kiểm tra 1 lần tức thời (0ms)*: Dễ bỏ sót nếu TikTok đang hiển thị khung skeleton và chưa render xong nút "Xem LIVE".

### Decision 3: Hành vi chuyển tiếp (Navigation Transition)
- **Decision**: Khi phát hiện Livestream, hiển thị log `📡 Phát hiện Livestream, tự động chuyển tiếp...`, chờ đệm an toàn 500ms - 800ms để trình duyệt xử lý render mượt mà, sau đó gọi `NAVIGATE_NEXT_VIDEO`.
- **Rationale**:
  - Chuyển tiếp ngay lập tức dưới 50ms có thể gây giật giao diện hoặc TikTok chưa kịp xử lý sự kiện cuộn phím mũi tên xuống. Khoảng đệm 500ms - 800ms vừa giữ được sự nhanh nhẹn vừa an toàn cho trình duyệt.
- **Alternatives considered**:
  - *Chờ hết delaySec*: Lãng phí thời gian không cần thiết vì người dùng đã chủ động muốn bỏ qua các video livestream.

### Decision 4: Lưu trữ và giao diện cấu hình Sidepanel
- **Decision**: Thêm checkbox `Tự động bỏ qua Livestream` (`skipLivestreamCheck`) vào khối cài đặt tương tác, lưu giá trị boolean `skipLivestream` trong `chrome.storage.local`, mặc định là `true`.
- **Rationale**: Nhất quán với các tùy chọn `autoLikeCheck`, `autoCommentCheck`, `autoFollowCheck` hiện có.

