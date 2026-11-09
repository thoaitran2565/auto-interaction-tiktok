# Implementation Plan: Anti-Bot & Tool Detection Humanizer

**Branch**: `005-anti-bot-humanizer` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-anti-bot-humanizer/spec.md`

## Summary

Xây dựng hệ thống **Anti-Bot & Tool Detection Humanizer** giúp tiện ích TikTok Auto Interaction tương tác tự nhiên như người thật, triệt tiêu các dấu hiệu nhận diện bot cơ học:
1. **Phân tách thao tác (Staggered Execution & Micro-delays)**: Chèn khoảng nghỉ ngẫu nhiên từ $300\text{ms} - 2500\text{ms}$ giữa các hành động Thả tim $\rightarrow$ Follow kênh $\rightarrow$ Bình luận $\rightarrow$ Chuyển video.
2. **Dao động thời gian xem ngẫu nhiên (Jitter Watch Delay)**: Thay đổi thời gian xem mỗi video quanh mốc cài đặt cơ sở ($T_{\text{base}} \pm 25\%$, sàn an toàn $\ge 3\text{s}$) thay vì một con số cố định.
3. **Tỷ lệ lướt qua ngẫu nhiên (Natural Skip Rate)**: Tự động bỏ qua tương tác cho một tỷ lệ video (mặc định 15%, tùy chỉnh 0% - 50%), chỉ xem ngắn ngẫu nhiên từ 2s - 5s rồi lướt tiếp (mô phỏng người lướt qua video không quan tâm).
4. **Đa dạng hóa lựa chọn bình luận khán giả (Diverse Comment Selection)**: Trích xuất ngẫu nhiên trong top 3 - 5 bình luận hợp lệ của khán giả (loại trừ tác giả và bình luận ghim) thay vì sao chép rập khuôn bình luận đầu tiên.
5. **Giao diện Sidepanel thân thiện & Lưu trữ bền vững**: Cung cấp công tắc tổng bật/tắt chống bot kèm menu mở rộng để tùy biến sâu, lưu tự động vào `chrome.storage.local`.

---

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2022+), HTML5, CSS3  
**Primary Dependencies**: None (Chrome Extension APIs: `chrome.storage.local`, `chrome.tabs`, `chrome.runtime`)  
**Storage**: `chrome.storage.local` mở rộng các trường: `humanizerEnabled`, `jitterEnabled`, `jitterPercent`, `skipRate`, `commentDiversity`  
**Testing**: Kiểm thử thủ công trực tiếp theo các kịch bản định nghĩa tại [quickstart.md](./quickstart.md)  
**Target Platform**: Các trình duyệt Chromium (Google Chrome, Microsoft Edge, Brave)  
**Project Type**: Browser Extension (Manifest V3)  
**Performance Goals**:
- Tính toán Jitter và Kế hoạch tương tác mỗi video: < 5ms
- Phản hồi nút Dừng khẩn cấp trong bất kỳ micro-delay nào: < 150ms
- Trích xuất top 3 - 5 bình luận khán giả: < 200ms
**Constraints**:
- Không làm thay đổi logic DOM synthetic paste an toàn của Draft.js
- Đảm bảo thời gian xem tối thiểu luôn $\ge 3\text{giây}$ để TikTok ghi nhận view
- Mọi hàm delay đều phải có khả năng ngắt quãng (`interruptibleSleepMs`) khi biến cờ dừng được kích hoạt

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Đơn giản & Trực quan (Simplicity)**: Đạt. Công tắc tổng bật mặc định bộ thông số chuẩn an toàn, người dùng thông thường không cần cấu hình phức tạp; người dùng nâng cao có thể mở rộng tùy chỉnh.
- **An toàn tài khoản**: Đạt. Loại bỏ toàn bộ các dấu hiệu nhận diện bot cơ học: không thao tác đồng thời, không xem lặp lại cùng số giây, không tương tác 100% video, không sao chép rập khuôn 1 bình luận.
- **Dừng an toàn (Fail-safe)**: Đạt. Mọi micro-delay đều kiểm tra cờ `isAutoFlowRunning` mỗi 100ms, cho phép người dùng dừng luồng ngay lập tức.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-anti-bot-humanizer/
├── spec.md              # Đặc tả tính năng và các kịch bản nghiệm thu
├── plan.md              # Kế hoạch triển khai kiến trúc (file này)
├── research.md          # Nghiên cứu kỹ thuật cơ chế Jitter, Micro-delays & Candidate Pool
├── data-model.md        # Mô hình dữ liệu lưu trữ & Máy trạng thái chu trình tương tác
├── quickstart.md        # Hướng dẫn kiểm thử 5 kịch bản xác thực
├── contracts/
│   └── messaging.md     # Hợp đồng truyền tin mở rộng audienceComments
└── checklists/          # Checklists đánh giá chất lượng (nếu cần)
```

### Source Code (repository root)

```text
auto-interaction-tiktok/
├── manifest.json            # Version 1.5.0
├── sidepanel/
│   ├── sidepanel.html       # Thêm khối card "Chống quét Bot", công tắc tổng & accordion tùy chỉnh
│   ├── sidepanel.css        # Kiểu dáng card Humanizer, switch toggle, collapse animation
│   └── sidepanel.js         # Logic tính Jitter, Skip Rate, micro-delays và random comment pool
└── content/
    └── content.js           # Bổ sung trích xuất top 3-5 bình luận khán giả (loại trừ tác giả & ghim)
```

---

## Complexity Tracking

*Không có vi phạm nguyên tắc thiết kế.*
