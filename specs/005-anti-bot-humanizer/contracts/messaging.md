# Message Passing Interface Contract (Feature 005)

Hợp đồng giao tiếp giữa Side Panel Script và Content Script trên tab TikTok Web.

---

## 1. Action: `GET_ACTIVE_VIDEO_INFO` (Mở rộng cho Feature 005)

Bổ sung trường `audienceComments: string[]` chứa danh sách top 1 - 5 bình luận hợp lệ của khán giả (đã loại trừ tác giả, bình luận ghim và bình luận quá ngắn), bên cạnh trường `firstComment` truyền thống để duy trì tương thích ngược 100%.

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
  "description": "Chia sẻ kinh nghiệm làm việc mỗi ngày",
  "rawDescription": "Chia sẻ kinh nghiệm làm việc mỗi ngày #worklife #daily",
  "hashtags": ["worklife", "daily"],
  "firstComment": "Video rất hay và ý nghĩa!",
  "audienceComments": [
    "Video rất hay và ý nghĩa!",
    "Mong chờ phần tiếp theo ạ",
    "Cảm ơn bạn đã chia sẻ",
    "Quá chuẩn luôn ad ơi"
  ],
  "existingComments": [
    "Video rất hay và ý nghĩa!",
    "Mong chờ phần tiếp theo ạ",
    "Cảm ơn bạn đã chia sẻ",
    "Quá chuẩn luôn ad ơi"
  ],
  "hasCommentBox": true,
  "canComment": true
}
```

---

## 2. Các Action Hiện có (Tái sử dụng nguyên vẹn)

- `WAIT_FOR_VIDEO_READY`:
  - Request: `{ "action": "WAIT_FOR_VIDEO_READY", "previousSignature": string | null, "timeout": number }`
  - Response: `{ "success": true, "ready": boolean, "signature": string, "durationMs": number }`

- `LIKE_ACTIVE_VIDEO`:
  - Request: `{ "action": "LIKE_ACTIVE_VIDEO", "method": "auto" }`
  - Response: `{ "success": true, "code": "LIKED" | "ALREADY_LIKED", "message": string }`

- `FOLLOW_CREATOR`:
  - Request: `{ "action": "FOLLOW_CREATOR" }`
  - Response: `{ "success": true, "code": "FOLLOWED" | "ALREADY_FOLLOWED" | "BUTTON_NOT_FOUND", "message": string }`

- `POST_COMMENT`:
  - Request: `{ "action": "POST_COMMENT", "text": string, "autoSubmit": boolean }`
  - Response: `{ "success": true, "code": "POSTED" | "TEXT_FILLED", "message": string }`

- `NAVIGATE_NEXT_VIDEO`:
  - Request: `{ "action": "NAVIGATE_NEXT_VIDEO", "timeout": number }`
  - Response: `{ "success": true, "code": "NAVIGATED" | "END_OF_FEED", "message": string }`

