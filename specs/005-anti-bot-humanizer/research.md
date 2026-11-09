# Research: Cơ chế Chống quét Bot & Mô phỏng hành vi tự nhiên (Anti-Bot Humanizer)

**Feature**: `005-anti-bot-humanizer`  
**Date**: 2026-11-05  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Cơ chế Phân tách thời gian thao tác (Staggered Execution & Micro-delays)

### Vấn đề thực tế
Khi một công cụ tự động kích hoạt đồng loạt nhiều sự kiện DOM/API trong mili-giây (ví dụ: vừa mở video là like ngay lập tức, vừa like xong là follow ngay lập tức, vừa follow là paste comment ngay), hệ thống chống bot/anti-fraud của TikTok (dựa trên phân tích telemetry và nhịp điệu tương tác) sẽ ngay lập tức nhận diện đây là hành vi tự động bằng script.

### Quyết định kỹ thuật
- **Nguyên lý**: Chia nhỏ quy trình tương tác của mỗi video thành các bước riêng biệt, chèn một khoảng nghỉ ngẫu nhiên (micro-delay) giữa mỗi bước:
  1. Xem video (đã áp dụng Jitter)
  2. Nghỉ `300ms - 800ms` $\rightarrow$ Thả tim (`LIKE_ACTIVE_VIDEO`)
  3. Nghỉ `800ms - 2000ms` $\rightarrow$ Follow kênh (`FOLLOW_CREATOR` nếu được bật)
  4. Nghỉ `1200ms - 2500ms` $\rightarrow$ Đăng bình luận (`POST_COMMENT`)
  5. Nghỉ `1200ms - 2500ms` $\rightarrow$ Chuyển video tiếp theo (`NAVIGATE_NEXT_VIDEO`)
- **Khả năng ngắt quãng (Interruptible)**:
  Tất cả các hàm chờ micro-delay đều sử dụng hàm `interruptibleSleepMs(durationMs)` có kiểm tra cờ `isAutoFlowRunning` mỗi `100ms`. Nếu người dùng nhấn nút "Dừng lại", vòng lặp thoát ngay tức thì (< 150ms), không bị click ngầm.

---

## 2. Dao động ngẫu nhiên thời gian xem (Randomized Jitter Watch Delay)

### Vấn đề thực tế
Nếu người dùng chọn "5 giây" hoặc "10 giây", và bot luôn dừng chính xác 5.000s hoặc 10.000s trên mọi video, thuật toán TikTok dễ dàng phát hiện mẫu chu kỳ tuần hoàn cơ học (fixed periodicity).

### Quyết định kỹ thuật
- **Công thức tính**:
  $$T_{\text{actual}} = \max\left(3, \text{round}\left(T_{\text{base}} \times (1 + \text{random}(-\text{jitterRatio}, +\text{jitterRatio}))\right)\right)$$
  - Với $T_{\text{base}}$ là mốc thời gian cơ sở (ví dụ: 5s, 8s, 10s, 15s).
  - $\text{jitterRatio} = \frac{\text{jitterPercent}}{100}$ (mặc định 25%, tức $\pm 25\%$).
  - Mức sàn an toàn (Safety Floor): $\ge 3\text{giây}$ để đảm bảo video kịp tải dữ liệu và bộ đếm TikTok ghi nhận lượt xem.
- **Ví dụ phân bổ**:
  - Với $T_{\text{base}} = 10\text{s}$, Jitter $25\%$: thời gian thực tế sẽ phân bổ ngẫu nhiên từ $7.5\text{s}$ đến $12.5\text{s}$ (làm tròn số nguyên hoặc 1 chữ số thập phân cho bộ đếm giây).

---

## 3. Tỷ lệ lướt qua ngẫu nhiên không tương tác (Natural Video Skip Rate)

### Vấn đề thực tế
Người dùng thật không bao giờ tương tác 100% mọi video họ thấy trên dòng cấp tin (For You Page). Tương tác 100/100 video liên tục là dấu hiệu bất thường rõ rệt.

### Quyết định kỹ thuật
- **Cơ chế xác suất**:
  - Thiết lập `skipRate` trong khoảng $0\% - 50\%$ (mặc định $15\%$).
  - Mỗi khi chuyển sang video mới:
    $$\text{isSkipped} = (\text{Math.random()} \times 100) < \text{skipRate}$$
- **Hành vi khi Skip**:
  - Không thả tim, không follow, không bình luận.
  - Dừng xem ngắn ngẫu nhiên từ $2.0\text{s}$ đến $5.0\text{s}$ (mô phỏng lướt qua video không cảm thấy hứng thú).
  - Hiển thị badge / log trạng thái: `🎲 [Bỏ qua an toàn] Lướt qua video (chờ 3s)...`.
  - Tự động chuyển video tiếp theo bằng `NAVIGATE_NEXT_VIDEO`.

---

## 4. Đa dạng hóa lựa chọn bình luận khán giả (Diverse Comment Selection)

### Vấn đề thực tế
Trong Feature 004, hệ thống chỉ lấy bình luận khán giả đầu tiên (`top 1`). Nếu chạy liên tục qua nhiều video hoặc trên cùng 1 kênh, việc luôn copy đúng bình luận ở vị trí đầu tiên vừa thiếu đa dạng, vừa dễ trùng lặp nếu video có ít người xem.

### Quyết định kỹ thuật
- **Bộ lọc ứng viên (Candidate Pool)**:
  - Quét tất cả thẻ bình luận cấp 1 (`span[data-e2e="comment-level-1"]`, `div[class*="DivCommentItemWrapper"] span[class*="TUXText"]`).
  - Loại bỏ:
    - Bình luận của tác giả video (có nhãn "Tác giả", "Creator", `comment-creator-tag`).
    - Bình luận ghim ("Đã ghim", "Pinned").
    - Bình luận quá ngắn ($< 3$ ký tự) hoặc chỉ chứa emoji/ký tự hệ thống ("Trả lời", "Xem thêm", v.v.).
  - Thu thập tối đa 5 bình luận hợp lệ đầu tiên của khán giả.
- **Lựa chọn ngẫu nhiên**:
  - Khi `commentDiversity` bật: chọn ngẫu nhiên 1 câu trong danh sách `1 - 5` câu thu thập được:
    $$\text{selected} = \text{candidates}[\text{Math.floor}(\text{Math.random()} \times \text{candidates.length})]$$
  - Nếu danh sách rỗng $\rightarrow$ fallback về câu tương tác tự nhiên mẫu sẵn có.

---

## 5. Kiến trúc Giao diện Sidepanel & Lưu trữ cài đặt

### Quyết định giao diện (UI UX)
- **Vị trí**: Nằm ngay trong Section Auto tương tác hoặc thẻ cấu hình AI, dưới dạng một thẻ **"🛡️ Chống quét Bot (Humanizer)"**.
- **Cấu trúc 2 tầng (Compact + Advanced Collapse)**:
  - Tầng 1: Công tắc chuyển trạng thái chính `humanizerEnabledCheck` (Bật / Tắt bảo vệ). Khi bật, mặc định kích hoạt toàn bộ bộ thông số chuẩn đã được kiểm chứng an toàn.
  - Tầng 2: Nút mở rộng "Tùy chỉnh chi tiết ▼" mở ra các tùy chọn:
    - Checkbox Jitter Delay $\pm 25\%$ (`jitterCheck`).
    - Thanh trượt hoặc Select tỷ lệ Skip Rate (`skipRateSelect`: 0%, 10%, 15%, 20%, 30%).
    - Checkbox Đa dạng hóa bình luận (`commentDiversityCheck`).
- **Lưu trữ**:
  Tất cả các khóa mới được lưu trong `chrome.storage.local` và tải lại tự động mỗi khi Sidepanel mở ra.

