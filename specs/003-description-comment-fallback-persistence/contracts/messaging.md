# Message Passing Interface Contract (v1.2.0)

Hợp đồng truyền thông điệp nội bộ giữa Side Panel và Content Script qua `chrome.tabs.sendMessage`.

## 1. Action: `GET_ACTIVE_VIDEO_INFO`

Side Panel gửi yêu cầu lấy thông tin chi tiết về video đang hoạt động trên tab TikTok hiện tại, bao gồm cả các bình luận sẵn có nếu caption trống.

### Request Payload
```json
{
  "action": "GET_ACTIVE_VIDEO_INFO"
}
```

### Response Payload
```json
{
  "success": true,
  "hasDescription": true,
  "description": "Nghĩ nhiêu chuyện trong đời",
  "rawDescription": "Nghĩ nhiêu chuyện trong đời #tamtrang #life",
  "hashtags": ["tamtrang", "life"],
  "existingComments": [
    "hai Em gái ở đây vậy",
    "Video hay quá nè",
    "Đồng cảm với bạn ghê"
  ],
  "canComment": true
}
```

---

## 2. Action: `POST_COMMENT`

Side Panel gửi nội dung bình luận đã được tạo ra để Content Script điền vào ô bình luận TikTok và gửi đi.

### Request Payload
```json
{
  "action": "POST_COMMENT",
  "text": "Nghĩ ít lại và yêu thương bản thân nhiều hơn nhé! 💖",
  "autoSubmit": true
}
```

### Response Payload
```json
{
  "success": true,
  "code": "POSTED",
  "message": "Đã đăng bình luận thành công!"
}
```
Hoặc khi `autoSubmit: false`:
```json
{
  "success": true,
  "code": "TEXT_FILLED",
  "message": "Đã điền nội dung bình luận vào ô. Hãy kiểm tra và nhấn gửi."
}
```

---

## 3. Action: `CHECK_TIKTOK_STATUS`

Kiểm tra sự hiện diện và phiên bản của Content Script trên tab.

### Request Payload
```json
{
  "action": "CHECK_TIKTOK_STATUS"
}
```

### Response Payload
```json
{
  "isReady": true,
  "version": "1.2.0",
  "hasActiveVideo": true,
  "isLiked": false
}
```

