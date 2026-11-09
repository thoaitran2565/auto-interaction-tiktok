# Messaging Contracts: TikTok Auto-Like Extension

**Feature**: `001-tiktok-auto-like`  
**Date**: 2026-11-05

Tài liệu này định nghĩa giao thức giao tiếp Message Passing giữa các thành phần của tiện ích:
1. `sidepanel.js` (Side Panel UI)
2. `background.js` (Service Worker)
3. `content.js` (Content Script trên tab TikTok)

---

## 1. Message: `LIKE_ACTIVE_VIDEO`

### Gửi từ: Side Panel (`sidepanel.js`)
### Nhận bởi: Content Script (`content.js`) tại active tab

#### Payload (Request)
```json
{
  "action": "LIKE_ACTIVE_VIDEO",
  "method": "auto"
}
```
*Các giá trị `method` hợp lệ: `"auto" | "button" | "key_l" | "double_click"`.*

#### Response thành công (Video được thích mới)
```json
{
  "success": true,
  "code": "LIKED",
  "message": "Đã thả tim video thành công!",
  "methodUsed": "button"
}
```

#### Response thành công (Video đã thích từ trước)
```json
{
  "success": true,
  "code": "ALREADY_LIKED",
  "message": "Video này đã được thả tim từ trước.",
  "methodUsed": "none"
}
```

#### Response lỗi (Không tìm thấy video hợp lệ)
```json
{
  "success": false,
  "code": "NO_VIDEO_FOUND",
  "message": "Không tìm thấy video nào đang hiển thị trên trang."
}
```

#### Response lỗi (Thao tác tương tác thất bại)
```json
{
  "success": false,
  "code": "ACTION_FAILED",
  "message": "Không thể thực hiện thao tác thả tim. Vui lòng kiểm tra lại trang TikTok."
}
```

---

## 2. Message: `CHECK_TIKTOK_STATUS`

### Gửi từ: Side Panel (`sidepanel.js`)
### Nhận bởi: Content Script (`content.js`)

Dùng để thăm dò trạng thái trang khi vừa mở Side Panel hoặc khi tab thay đổi.

#### Payload (Request)
```json
{
  "action": "CHECK_TIKTOK_STATUS"
}
```

#### Response
```json
{
  "isReady": true,
  "hasActiveVideo": true,
  "isLiked": false
}
```

