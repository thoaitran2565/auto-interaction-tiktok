# Message Passing Interface Contract (v1.4.0)

Hợp đồng truyền thông điệp nội bộ giữa Side Panel và Content Script qua `chrome.tabs.sendMessage`.

## 1. Action: `NAVIGATE_NEXT_VIDEO` (MỚI)

Side Panel gửi yêu cầu chuyển sang video tiếp theo trên TikTok Web (nhấn nút mũi tên xuống).

### Request Payload
```json
{
  "action": "NAVIGATE_NEXT_VIDEO",
  "timeout": 8000
}
```

### Response Payload
```json
{
  "success": true,
  "code": "NAVIGATED",
  "methodUsed": "button",
  "ready": true,
  "durationMs": 750,
  "timedOut": false,
  "message": "Đã chuyển sang video tiếp theo và các nút điều khiển đã sẵn sàng!"
}
```
Hoặc khi đã đến cuối danh sách / không tìm thấy video tiếp theo:
```json
{
  "success": false,
  "code": "END_OF_FEED",
  "message": "Không tìm thấy video tiếp theo hoặc đã đến cuối danh sách."
}
```

---

## 2. Action: `WAIT_FOR_VIDEO_READY` (MỚI)

Yêu cầu Content Script kiểm tra và đợi cho đến khi video mới và các nút tương tác (thả tim, khung bình luận) đã hoàn tất kết xuất trong DOM (tự động thích ứng mạng nhanh hoặc chậm).

### Request Payload
```json
{
  "action": "WAIT_FOR_VIDEO_READY",
  "previousSignature": "23:one-column-item-23:...",
  "timeout": 8000
}
```

### Response Payload
```json
{
  "success": true,
  "ready": true,
  "signature": "24:one-column-item-24:...",
  "durationMs": 420,
  "timedOut": false
}
```

---

## 3. Action: `GET_ACTIVE_VIDEO_INFO` (Mở rộng)

Bổ sung trường `firstComment` chứa bình luận đầu tiên của người xem khác (loại trừ tác giả/bình luận ghim).

### Response Payload
```json
{
  "success": true,
  "hasDescription": true,
  "description": "Nghĩ nhiêu chuyện trong đời",
  "rawDescription": "Nghĩ nhiêu chuyện trong đời #tamtrang",
  "hashtags": ["tamtrang"],
  "firstComment": "tui muốn đi nhầm cả đời",
  "existingComments": [
    "tui muốn đi nhầm cả đời",
    "em cug muốn đi nhầm giống chị😔",
    "quả này nhầm từ 2km thành 20km r :0"
  ],
  "canComment": true
}
```

---

## 3. Action: `LIKE_ACTIVE_VIDEO` (Hiện có)
- Request: `{ action: "LIKE_ACTIVE_VIDEO", method: "auto" }`
- Response: `{ success: true, code: "LIKED" | "ALREADY_LIKED", message: "..." }`

## 4. Action: `POST_COMMENT` (Hiện có)
- Request: `{ action: "POST_COMMENT", text: "...", autoSubmit: true }`
- Response: `{ success: true, code: "POSTED" | "TEXT_FILLED", message: "..." }`

