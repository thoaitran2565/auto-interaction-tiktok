# Data Model: TikTok Auto-Like Chrome Extension

**Feature**: `001-tiktok-auto-like`  
**Date**: 2026-11-05

## 1. Entities

### 1.1. `SidePanelState` (Trạng thái giao diện Side Panel)
Quản lý trạng thái hiển thị của bảng điều khiển người dùng.

| Field | Type | Description | Rules / Constraints |
|-------|------|-------------|---------------------|
| `status` | `string` | Trạng thái hiện tại | Một trong các giá trị: `idle`, `processing`, `success`, `already_liked`, `error`, `not_tiktok` |
| `message` | `string` | Thông báo hiển thị trên UI | Chuỗi ký tự giải thích chi tiết trạng thái |
| `isBusy` | `boolean` | Cờ khóa thao tác | `true` khi đang gửi lệnh hoặc chờ phản hồi từ content script (ngăn bấm lặp) |
| `selectedMethod` | `string` | Phương thức thả tim ưu tiên | `auto` (mặc định), `button`, `key_l`, `double_click` |
| `activeTabInfo` | `object` | Thông tin tab TikTok hiện tại | `{ id: number, url: string, isTikTok: boolean }` |

### 1.2. `LikeRequest` (Thông điệp gửi từ Side Panel đến Content Script)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | `string` | Có | Định danh hành động: `"LIKE_ACTIVE_VIDEO"` |
| `method` | `string` | Không | Phương thức thực hiện: `"auto"` (mặc định), `"button"`, `"key_l"`, `"double_click"` |

### 1.3. `LikeResponse` (Thông điệp phản hồi từ Content Script)

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Kết quả tổng quát (`true` nếu video được thả tim hoặc đã thích trước đó) |
| `code` | `string` | Mã kết quả: `"LIKED"`, `"ALREADY_LIKED"`, `"NO_VIDEO_FOUND"`, `"ACTION_FAILED"`, `"NOT_TIKTOK_PAGE"` |
| `message` | `string` | Thông điệp mô tả kết quả hiển thị cho người dùng |
| `methodUsed` | `string` | Phương thức cụ thể đã được kích hoạt thành công |

### 1.4. `TikTokVideoTarget` (Mô hình trừu tượng phần tử video trên trang TikTok)

| Property | Type | Description |
|----------|------|-------------|
| `container` | `HTMLElement` | Khung chứa video đang active trong viewport |
| `videoElement` | `HTMLVideoElement` | Thẻ `<video>` đang phát hoặc hiển thị |
| `likeButton` | `HTMLElement` | Nút thích (`[data-e2e="like-icon"]` hoặc `[data-key-interaction="action_like"]`) |
| `isLiked` | `boolean` | Giá trị kiểm tra từ `aria-pressed === "true"` |

---

## 2. State Machine Transitions (Vòng đời trạng thái Side Panel)

```
       [IDLE]
         │
         │ Nhấn nút "Bắt đầu"
         ▼
    [PROCESSING] (Nút bị disable để chống spam click)
         │
         ├─── Tab không phải TikTok ─────────────► [NOT_TIKTOK] ──┐
         ├─── Không tìm thấy video/nút like ─────► [ERROR] ───────┤
         ├─── Video đã được tim trước đó ────────► [ALREADY_LIKED]┤ Sau 2.5s
         └─── Thả tim thành công ─────────────────► [SUCCESS] ────┤ quay về
                                                                  ▼
                                                                [IDLE]
```

