# Messaging Contracts: TikTok AI Auto-Comment

**Feature**: `002-tiktok-ai-comment`  
**Date**: 2026-11-05

## 1. Message: `GET_ACTIVE_VIDEO_INFO`

Lấy thông tin mô tả và trạng thái bình luận của video TikTok đang active.

### Request
```json
{
  "action": "GET_ACTIVE_VIDEO_INFO"
}
```

### Response thành công
```json
{
  "success": true,
  "description": "Nghĩ nhiêu chuyện trong đời",
  "hashtags": ["trangmei", "dance", "gaixinh"],
  "canComment": true
}
```

### Response khi không tìm thấy video
```json
{
  "success": false,
  "description": "",
  "canComment": false,
  "message": "Không tìm thấy video nào đang phát."
}
```

---

## 2. Message: `POST_COMMENT`

Yêu cầu Content Script mở khung bình luận, nhập văn bản vào thẻ div `[contenteditable="true"]`, đợi nút gửi kích hoạt và gửi bài.

### Request
```json
{
  "action": "POST_COMMENT",
  "text": "Nhìn đáng yêu quá bạn ơi!",
  "autoSubmit": true
}
```

### Response thành công (Đã gửi)
```json
{
  "success": true,
  "code": "POSTED",
  "message": "Đã đăng bình luận thành công!"
}
```

### Response thành công (Chỉ điền sẵn)
```json
{
  "success": true,
  "code": "TEXT_FILLED",
  "message": "Đã điền bình luận vào ô, hãy kiểm tra và nhấn gửi."
}
```

### Response lỗi (Bình luận bị tắt hoặc nút không kích hoạt)
```json
{
  "success": false,
  "code": "COMMENTS_DISABLED",
  "message": "Video này không cho phép bình luận."
}
```

