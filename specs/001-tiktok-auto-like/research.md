# Research & Technical Decisions: TikTok Auto-Like Chrome Extension

**Feature**: `001-tiktok-auto-like`  
**Date**: 2026-11-05

## 1. Extension Manifest & Side Panel Activation

### Decision
Sử dụng Chrome Extension Manifest V3 (MV3) với `chrome.sidePanel` API.
Trong Service Worker (`background.js`), gọi:
```javascript
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
```
đồng thời đăng ký `side_panel.default_path` trong `manifest.json`.

### Rationale
- Kể từ Chrome 116, phương thức `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` là giải pháp chuẩn, mượt mà nhất để biến click vào extension action icon thành hành động mở Side Panel mà không cần lắng nghe `chrome.action.onClicked` một cách thủ công.
- Không gây xung đột với popup vì không khai báo `default_popup` trong `action`.

### Alternatives Considered
- `chrome.action.onClicked.addListener` + `chrome.sidePanel.open({ windowId })`: Yêu cầu xử lý sự kiện bất đồng bộ và cần quyền `sidePanel` theo window/tab, dễ gặp lỗi "must be called in response to a user gesture" nếu xử lý chuỗi promise không khéo léo.
- Content Script inject iframe trực tiếp vào trang TikTok: Không phải là side panel bản địa của trình duyệt, làm vỡ layout của TikTok và dễ bị style của TikTok ghi đè.

---

## 2. Thao tác tương tác thả tim video TikTok

### Decision
Triển khai chiến lược tương tác phân lớp (multi-strategy), trong đó:
1. **Chiến lược chính (Primary)**: Tương tác với phần tử Like DOM (`div[data-e2e="like-icon"]` hoặc `div[data-key-interaction="action_like"]`):
   - Đọc thuộc tính `aria-pressed`:
     - Nếu `aria-pressed === "true"`: Báo trạng thái "Video đã được thả tim từ trước" và không bấm lại (tránh hủy thích theo FR-005).
     - Nếu `aria-pressed === "false"`: Kích hoạt sự kiện `.click()` trên phần tử nút thích.
2. **Chiến lược bổ trợ/dự phòng (Fallback 1 - Keyboard Event 'L')**:
   - Dispatch `KeyboardEvent` với phím `'l'` (`code: 'KeyL', keyCode: 76, bubbles: true`) lên container video hoặc `document.body` (sau khi đảm bảo con trỏ không nằm trong thẻ `input`, `textarea`, `[contenteditable]`).
3. **Chiến lược bổ trợ/dự phòng (Fallback 2 - Double Click Video)**:
   - Tìm phần tử video hoặc `div` chứa video đang active trong viewport, dispatch sự kiện `dblclick` (`MouseEvent` với `bubbles: true, cancelable: true`).

### Rationale
- Kiểm tra trực tiếp trên DOM của TikTok (`page.html` thực tế tại dự án) cho thấy:
  ```html
  <div role="button" tabindex="0" aria-label="Thích video..." aria-pressed="false" data-e2e="like-icon" data-key-interaction="action_like" ...>
  ```
  Selector `[data-e2e="like-icon"]` và `[data-key-interaction="action_like"]` là các thuộc tính kiểm thử nội bộ ổn định của TikTok Web.
- Thuộc tính `aria-pressed` phản ánh chính xác trạng thái thích của video, giúp giải quyết triệt để yêu cầu tránh un-like nhầm.
- Phím 'L' và Double-click rất phù hợp khi TikTok thay đổi cấu trúc class CSS bên trong nút.

### Alternatives Considered
- Chỉ dùng phím 'L': Không thể kiểm tra trước xem video đã được thả tim hay chưa nếu không đọc DOM. Nếu video đã thích, bấm 'L' sẽ biến thành bỏ thích (unlike).
- Chỉ dùng Double-click: Có thể trigger hiệu ứng tạm dừng video (pause) nếu timing giữa 2 click không tương thích với player của TikTok.

---

## 3. Giao tiếp giữa Side Panel và Tab TikTok

### Decision
Sử dụng kiến trúc Message Passing tiêu chuẩn của Chrome Extensions:
1. `sidepanel.js` lấy tab đang active bằng `chrome.tabs.query({ active: true, currentWindow: true })`.
2. Kiểm tra `tab.url`:
   - Nếu không chứa `tiktok.com`: Cập nhật UI ngay "Vui lòng mở tab TikTok".
3. Gửi tin nhắn `chrome.tabs.sendMessage(tab.id, { action: "LIKE_ACTIVE_VIDEO", method: "auto" })`.
4. Nếu Content Script chưa nạp (ví dụ tab mở trước khi cài extension): bắt lỗi `receiving end does not exist`, dùng `chrome.scripting.executeScript` để nạp `content.js` động rồi gửi lại tin nhắn.
5. `content.js` phản hồi object kết quả: `{ success: boolean, status: string, message: string }`.

### Rationale
- Tách biệt rõ ràng giữa logic giao diện (Side Panel) và logic tương tác DOM (Content Script).
- Đảm bảo tính bảo mật (tuân thủ Context Isolation của Chrome MV3).
- Xử lý mượt mà kịch bản tab TikTok mở trước khi nạp extension.

---

## 4. Công nghệ và cấu trúc mã nguồn

### Decision
- Sử dụng Vanilla JavaScript (ES2022+), CSS3 và HTML5 thuần.
- Không sử dụng các framework nặng (như React, Vue hay Webpack/Vite bundler) cho phiên bản này.

### Rationale
- Extension có scope rất tinh gọn (1 Side Panel với 1 nút bấm và trạng thái, 1 Content Script, 1 Service Worker).
- Sử dụng Vanilla JS giúp:
  - Khởi động tức thì (dưới 30ms).
  - Không cần bước build/bundle (`npm run build`), dễ dàng nạp trực tiếp qua `chrome://extensions` (Load unpacked).
  - Dung lượng toàn bộ extension siêu nhẹ (< 50KB).

