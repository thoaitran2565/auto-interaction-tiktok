# Data Model: Auto Skip Livestream Videos

## Entities

### 1. LivestreamDetectionResult
Đại diện cho kết quả kiểm tra xem video hiện tại có phải là luồng phát trực tiếp (Livestream) hay không.

| Thuộc tính | Kiểu dữ liệu | Mô tả |
|------------|-------------|-------|
| `isLivestream` | `boolean` | `true` nếu phát hiện các chỉ báo đặc trưng của Livestream trên DOM |
| `indicatorFound` | `string` | Tên chỉ báo được phát hiện (ví dụ: `'live_desc'`, `'watch_live_button'`, `'live_like_icon'`, `'none'`) |
| `scannedDurationMs` | `number` | Thời gian hệ thống đã quét để đưa ra kết luận (mili-giây) |

### 2. LivestreamConfig (Storage Settings)
Cấu hình người dùng được lưu trữ trong `chrome.storage.local`.

| Khóa lưu trữ | Kiểu dữ liệu | Mặc định | Mô tả |
|--------------|-------------|----------|-------|
| `skipLivestream` | `boolean` | `true` | Bật/tắt tự động bỏ qua khi gặp video Livestream |

### 3. Action Messages (Runtime Protocol)

#### A. Message: `CHECK_LIVESTREAM`
- **Gửi từ**: `sidepanel.js` $\rightarrow$ `content.js`
- **Payload**:
  ```json
  {
    "action": "CHECK_LIVESTREAM",
    "timeout": 2000
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "isLivestream": true,
    "indicatorFound": "watch_live_button"
  }
  ```

#### B. Mở rộng Payload: `GET_ACTIVE_VIDEO_INFO`
Bổ sung trường `isLivestream` trực tiếp vào phản hồi của `GET_ACTIVE_VIDEO_INFO`:
```json
{
  "success": true,
  "isLivestream": true,
  "hasDescription": false,
  "description": "",
  "firstComment": null,
  "existingComments": [],
  "hasCommentBox": false,
  "canComment": false
}
```

