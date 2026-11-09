# Research & Technical Decisions: Chế độ bình luận đầu tiên & Luồng Auto tương tác

## 1. Cơ chế trích xuất bình luận đầu tiên của người xem (First Audience Comment)

### Khảo sát cấu trúc DOM TikTok (dựa trên `page.html`)
- Trong `page.html`, danh sách bình luận chứa các phần tử cấp 1:
  - Bình luận đầu tiên:
    ```html
    <span data-e2e="comment-level-1">
      <span class="TUXText ...">tui muốn đi nhầm cả đời</span>
    </span>
    ```
  - Bình luận thứ hai:
    ```html
    <span data-e2e="comment-level-1">
      <span class="TUXText ...">em cug muốn đi nhầm giống chị😔</span>
    </span>
    ```
- Phần tử bao ngoài mỗi bình luận là `div[class*="DivCommentItemWrapper"]` hoặc `div[class*="DivCommentContentWrapper"]`.
- Khi tác giả video bình luận hoặc có bình luận ghim, TikTok gắn các thẻ nhận diện:
  - Thuộc tính `[data-e2e="comment-creator-tag"]` hoặc `[data-e2e="comment-pinned-tag"]`.
  - Các huy hiệu chứa từ khóa `"Tác giả"`, `"Creator"`, `"Đã ghim"`, `"Pinned"`.

### Thuật toán trích xuất
1. Mở khung bình luận nếu chưa mở.
2. Quét toàn bộ phần tử `span[data-e2e="comment-level-1"]`.
3. Duyệt từ trên xuống dưới, tìm container bao ngoài `span.closest('[class*="DivCommentItemWrapper"]')`.
4. Kiểm tra nếu container chứa cờ/thẻ tác giả hoặc bình luận ghim -> Bỏ qua.
5. Chọn ngay phần tử bình luận đầu tiên của người xem:
   - Trích xuất văn bản sạch: `span.textContent.trim()`.
   - Kiểm tra điều kiện hợp lệ: độ dài >= 3 ký tự, chứa chữ cái tiếng Việt/Latinh.
6. Nếu tìm thấy: trả về nội dung (ví dụ: `"tui muốn đi nhầm cả đời"`). Nếu không có: trả về `null` để hệ thống rơi vào fallback câu tương tác ngẫu nhiên.

---

## 2. Cơ chế chuyển sang video tiếp theo (Next Video Navigation)

### Khảo sát nút điều hướng trên TikTok Web
- Tại dòng 4485 của `page.html`:
  ```html
  <button aria-disabled="false" type="button"
          data-e2e="feed-navigation-next"
          data-key-interaction="feed_nav_next"
          class="TUXButton TUXButton--capsule TUXButton--medium ...">
      <div class="TUXButton-content">
          <div class="TUXButton-iconContainer">
              <svg><path d="m24 28.75 ..."></path></svg>
          </div>
      </div>
  </button>
  ```
- Đây chính là nút mũi tên xuống điều hướng video tiếp theo của TikTok Web.

### Giải pháp kỹ thuật thực thi
1. **Phương pháp chính (Click Button)**:
   - Tìm `button[data-e2e="feed-navigation-next"]` hoặc `button[data-key-interaction="feed_nav_next"]`.
   - Kích hoạt `.click()`.
2. **Phương pháp dự phòng (Keyboard ArrowDown)**:
   - Nếu không tìm thấy nút (hoặc ở chế độ toàn màn hình / layout khác): phát sự kiện bàn phím phím mũi tên xuống (`ArrowDown`, keyCode `40`) vào `document`.
3. **Thời gian chờ chuyển cảnh**:
   - Sau khi kích hoạt chuyển video, đợi khoảng 1.2s - 1.5s để TikTok tải video mới vào khung nhìn trước khi bắt đầu chu trình tiếp theo.

---

## 3. Kiến trúc vòng lặp Auto tương tác (Continuous Loop Architecture)

### Quản lý trạng thái và Dừng an toàn (Safe Stop)
- Cờ toàn cục `isAutoFlowRunning`:
  - Bật `true` khi bấm "▶ Bắt đầu Auto tương tác".
  - Chuyển `false` ngay lập tức khi bấm "⏹ Dừng lại" hoặc khi chuyển tab / kết thúc phiên.
- Hàm chờ có thể ngắt (Interruptible Sleep):
  - Thay vì `setTimeout` cố định, sử dụng chu kỳ `sleep(1000)` đếm ngược từng giây.
  - Mỗi giây kiểm tra lại cờ `isAutoFlowRunning`, nếu người dùng bấm Dừng thì thoát vòng lặp ngay lập tức mà không phải chờ hết tổng thời gian delay.
- Xử lý ngoại lệ video khóa bình luận:
  - Nếu `videoInfo.canComment === false`: Thông báo bỏ qua và kích hoạt chuyển video tiếp theo ngay lập tức (không chờ delay).

