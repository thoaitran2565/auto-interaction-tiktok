/**
 * Side Panel Controller Script
 * Manages active tab tracking, auto-like, and AI auto-comment workflows.
 */

import { generateAIComment, getRandomGeneralComment, testGeminiApiKey } from "./ai-generator.js";

// Comment source constants
const SOURCE_GEMINI = "gemini";
const SOURCE_COMMUNITY = "community_comment";
const SOURCE_FALLBACK = "smart_fallback";
const SOURCE_GENERAL = "random_general";
const SOURCE_FIRST_COMMENT = "first_comment";

const SOURCE_BADGES = {
  [SOURCE_GEMINI]: "✨ Bình luận Gemini AI:",
  [SOURCE_COMMUNITY]: "💬 Bình luận lấy từ video:",
  [SOURCE_FALLBACK]: "💡 Bình luận thông minh:",
  [SOURCE_GENERAL]: "🎲 Bình luận ngẫu nhiên:",
  [SOURCE_FIRST_COMMENT]: "💬 Bình luận đầu tiên:"
};

document.addEventListener("DOMContentLoaded", async () => {
  // Elements: Actions
  const btnStartLike = document.getElementById("btnStartLike");
  const btnStartComment = document.getElementById("btnStartComment");
  const methodSelect = document.getElementById("methodSelect");

  // Elements: Auto Flow (Feature 004)
  const btnToggleAutoFlow = document.getElementById("btnToggleAutoFlow");
  const autoFlowBtnIcon = document.getElementById("autoFlowBtnIcon");
  const autoFlowBtnText = document.getElementById("autoFlowBtnText");
  const autoFlowProgress = document.getElementById("autoFlowProgress");
  const delaySelect = document.getElementById("delaySelect");
  const maxVideosSelect = document.getElementById("maxVideosSelect");
  const autoFollowCheck = document.getElementById("autoFollowCheck");

  // Elements: Anti-Bot Humanizer (Feature 005)
  const humanizerCard = document.getElementById("humanizerCard");
  const humanizerToggle = document.getElementById("humanizerToggle");
  const humanizerArrow = document.getElementById("humanizerArrow");
  const humanizerBody = document.getElementById("humanizerBody");
  const humanizerEnabledCheck = document.getElementById("humanizerEnabledCheck");
  const jitterCheck = document.getElementById("jitterCheck");
  const skipRateSelect = document.getElementById("skipRateSelect");
  const commentDiversityCheck = document.getElementById("commentDiversityCheck");

  // Elements: Status & Feedback
  const statusDot = document.getElementById("statusDot");
  const tabStatusText = document.getElementById("tabStatusText");
  const statusBox = document.getElementById("statusBox");
  const statusBoxIcon = document.getElementById("statusBoxIcon");
  const statusBoxTitle = document.getElementById("statusBoxTitle");
  const statusBoxDesc = document.getElementById("statusBoxDesc");
  const commentPreviewCard = document.getElementById("commentPreviewCard");
  const previewBadge = document.getElementById("previewBadge");
  const previewText = document.getElementById("previewText");

  // Elements: AI & Comment Settings
  const commentModeSelect = document.getElementById("commentModeSelect");
  const settingsCard = document.getElementById("settingsCard");
  const settingsToggle = document.getElementById("settingsToggle");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const btnTestApiKey = document.getElementById("btnTestApiKey");
  const apiKeyStatus = document.getElementById("apiKeyStatus");
  const styleSelect = document.getElementById("styleSelect");
  const autoSubmitCheck = document.getElementById("autoSubmitCheck");
  const btnSaveSettings = document.getElementById("btnSaveSettings");

  let currentTab = null;
  let isProcessing = false;
  let isAutoFlowRunning = false;
  let interactedCount = 0;
  let resetTimer = null;

  // Start with settings card collapsed by default
  settingsCard.classList.add("collapsed");

  settingsToggle.addEventListener("click", () => {
    settingsCard.classList.toggle("collapsed");
  });

  // Humanizer accordion collapse toggle
  if (humanizerToggle && humanizerBody && humanizerArrow) {
    humanizerToggle.addEventListener("click", (e) => {
      // Don't toggle accordion if user clicked switch toggle directly
      if (e.target.closest(".switch-toggle")) return;
      const isVisible = humanizerBody.style.display !== "none";
      humanizerBody.style.display = isVisible ? "none" : "flex";
      humanizerArrow.textContent = isVisible ? "▼" : "▲";
    });
  }

  // Helper functions for random calculations (Feature 005)
  function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function calculateJitterDelay(baseSec, jitterPercent = 25) {
    const ratio = jitterPercent / 100;
    const factor = 1 + (Math.random() * (2 * ratio) - ratio);
    const calculated = Math.round(baseSec * factor);
    return Math.max(3, calculated);
  }

  function shouldSkipVideo(skipRatePercent = 15) {
    if (skipRatePercent <= 0) return false;
    return (Math.random() * 100) < skipRatePercent;
  }

  // Test Gemini API Key
  if (btnTestApiKey) {
    btnTestApiKey.addEventListener("click", async () => {
      const key = apiKeyInput.value.trim();
      if (!key) {
        apiKeyStatus.className = "api-key-status error";
        apiKeyStatus.textContent = "Vui lòng nhập API Key trước khi kiểm tra.";
        apiKeyStatus.style.display = "block";
        return;
      }

      btnTestApiKey.disabled = true;
      btnTestApiKey.textContent = "Đang test...";
      apiKeyStatus.className = "api-key-status testing";
      apiKeyStatus.textContent = "Đang kiểm tra kết nối với Google Gemini...";
      apiKeyStatus.style.display = "block";

      try {
        const res = await testGeminiApiKey(key);
        if (res.valid) {
          apiKeyStatus.className = "api-key-status success";
          apiKeyStatus.textContent = `✓ API Key hợp lệ! (Đã kết nối ${res.model || "Gemini"})`;
        } else {
          apiKeyStatus.className = "api-key-status error";
          apiKeyStatus.textContent = `❌ ${res.error || "Không thể xác thực API Key"}`;
        }
      } catch (err) {
        apiKeyStatus.className = "api-key-status error";
        apiKeyStatus.textContent = `❌ Lỗi: ${err.message}`;
      } finally {
        btnTestApiKey.disabled = false;
        btnTestApiKey.textContent = "Kiểm tra";
      }
    });
  }

  /**
   * Load stored settings from chrome.storage.local
   */
  async function loadSettings() {
    try {
      const data = await chrome.storage.local.get([
        "likeMethod",
        "geminiApiKey",
        "commentStyle",
        "autoSubmit",
        "commentMode",
        "autoInteractDelay",
        "maxVideos",
        "autoFollow",
        "humanizerEnabled",
        "jitterEnabled",
        "skipRate",
        "commentDiversity"
      ]);
      if (data.likeMethod) methodSelect.value = data.likeMethod;
      if (data.geminiApiKey) apiKeyInput.value = data.geminiApiKey;
      if (data.commentStyle) styleSelect.value = data.commentStyle;
      if (typeof data.autoSubmit === "boolean") autoSubmitCheck.checked = data.autoSubmit;
      if (data.commentMode && commentModeSelect) commentModeSelect.value = data.commentMode;
      if (data.autoInteractDelay && delaySelect) delaySelect.value = String(data.autoInteractDelay);
      if (data.maxVideos !== undefined && maxVideosSelect) maxVideosSelect.value = String(data.maxVideos);
      if (typeof data.autoFollow === "boolean" && autoFollowCheck) autoFollowCheck.checked = data.autoFollow;

      // Humanizer settings (Feature 005)
      if (typeof data.humanizerEnabled === "boolean" && humanizerEnabledCheck) {
        humanizerEnabledCheck.checked = data.humanizerEnabled;
      }
      if (typeof data.jitterEnabled === "boolean" && jitterCheck) {
        jitterCheck.checked = data.jitterEnabled;
      }
      if (data.skipRate !== undefined && skipRateSelect) {
        skipRateSelect.value = String(data.skipRate);
      }
      if (typeof data.commentDiversity === "boolean" && commentDiversityCheck) {
        commentDiversityCheck.checked = data.commentDiversity;
      }
    } catch (err) {
      console.warn("Error loading settings from storage:", err);
    }
  }

  /**
   * Save all settings to chrome.storage.local
   */
  async function saveSettings(showFeedback = false) {
    try {
      await chrome.storage.local.set({
        likeMethod: methodSelect.value,
        geminiApiKey: apiKeyInput.value.trim(),
        commentStyle: styleSelect.value,
        autoSubmit: autoSubmitCheck.checked,
        commentMode: commentModeSelect ? commentModeSelect.value : "ai",
        autoInteractDelay: delaySelect ? parseInt(delaySelect.value, 10) || 5 : 5,
        maxVideos: maxVideosSelect ? parseInt(maxVideosSelect.value, 10) || 0 : 0,
        autoFollow: autoFollowCheck ? autoFollowCheck.checked : false,
        humanizerEnabled: humanizerEnabledCheck ? humanizerEnabledCheck.checked : true,
        jitterEnabled: jitterCheck ? jitterCheck.checked : true,
        skipRate: skipRateSelect ? parseInt(skipRateSelect.value, 10) || 0 : 15,
        commentDiversity: commentDiversityCheck ? commentDiversityCheck.checked : true
      });
      if (showFeedback && btnSaveSettings) {
        btnSaveSettings.textContent = "✓ Đã lưu!";
        setTimeout(() => {
          btnSaveSettings.textContent = "Lưu cài đặt";
        }, 1500);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  }

  // Save on button click
  btnSaveSettings.addEventListener("click", () => saveSettings(true));

  // Auto-save on any change
  methodSelect.addEventListener("change", () => saveSettings(false));
  styleSelect.addEventListener("change", () => saveSettings(false));
  autoSubmitCheck.addEventListener("change", () => saveSettings(false));
  apiKeyInput.addEventListener("change", () => saveSettings(false));
  if (commentModeSelect) commentModeSelect.addEventListener("change", () => saveSettings(false));
  if (delaySelect) delaySelect.addEventListener("change", () => saveSettings(false));
  if (maxVideosSelect) maxVideosSelect.addEventListener("change", () => saveSettings(false));
  if (autoFollowCheck) autoFollowCheck.addEventListener("change", () => saveSettings(false));
  if (humanizerEnabledCheck) humanizerEnabledCheck.addEventListener("change", () => saveSettings(false));
  if (jitterCheck) jitterCheck.addEventListener("change", () => saveSettings(false));
  if (skipRateSelect) skipRateSelect.addEventListener("change", () => saveSettings(false));
  if (commentDiversityCheck) commentDiversityCheck.addEventListener("change", () => saveSettings(false));

  /**
   * Update the UI Status Box
   */
  function setStatusBox(state, icon, title, description, commentPreview = null) {
    statusBox.dataset.state = state;
    statusBoxIcon.textContent = icon;
    statusBoxTitle.textContent = title;
    statusBoxDesc.textContent = description;

    if (commentPreview) {
      commentPreviewCard.style.display = "block";
      previewBadge.textContent = SOURCE_BADGES[commentPreview.source] || "✨ Bình luận đề xuất:";
      previewText.textContent = `"${commentPreview.text}"`;
    } else {
      commentPreviewCard.style.display = "none";
    }
  }

  function isTikTokUrl(url) {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.hostname.endsWith("tiktok.com");
    } catch {
      return false;
    }
  }

  async function updateActiveTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      currentTab = tab || null;

      if (!currentTab) {
        statusDot.className = "status-dot";
        tabStatusText.textContent = "Không tìm thấy tab hoạt động";
        return;
      }

      if (isTikTokUrl(currentTab.url)) {
        statusDot.className = "status-dot active";
        tabStatusText.textContent = "Đang ở tab TikTok";
      } else {
        statusDot.className = "status-dot inactive";
        tabStatusText.textContent = "Không phải tab TikTok";
        if (isAutoFlowRunning) {
          stopAutoFlow("Đã dừng Auto do chuyển khỏi tab TikTok.");
        }
      }
    } catch (err) {
      console.warn("Error querying active tab:", err);
    }
  }

  /**
   * Ensure latest version of Content Script (v1.5.0) is running on the tab.
   */
  async function ensureContentScriptInjected(tabId) {
    let needsInjection = false;
    try {
      const res = await chrome.tabs.sendMessage(tabId, { action: "CHECK_TIKTOK_STATUS" });
      if (!res || res.version !== "1.5.0") {
        needsInjection = true;
      }
    } catch {
      needsInjection = true;
    }

    if (needsInjection) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content/content.js"]
        });
        await new Promise((resolve) => setTimeout(resolve, 120));
      } catch (injectionError) {
        console.error("Failed to inject content script:", injectionError);
        throw injectionError;
      }
    }
  }

  /**
   * Handle Like Video
   */
  async function handleStartLike() {
    if (isProcessing) return;

    if (resetTimer) clearTimeout(resetTimer);

    await updateActiveTab();

    if (!currentTab || !currentTab.id) {
      setStatusBox("error", "❌", "Lỗi tab", "Không tìm thấy tab trình duyệt nào đang mở.");
      return;
    }

    if (!isTikTokUrl(currentTab.url)) {
      setStatusBox("not_tiktok", "⚠️", "Chưa mở TikTok", "Vui lòng chuyển sang tab đang xem video TikTok.");
      return;
    }

    isProcessing = true;
    btnStartLike.disabled = true;
    btnStartComment.disabled = true;
    btnStartLike.classList.add("loading");
    setStatusBox("processing", "⏳", "Đang xử lý...", "Đang phát hiện video và kích hoạt thả tim...");

    const selectedMethod = methodSelect.value || "auto";

    try {
      await ensureContentScriptInjected(currentTab.id);

      const response = await chrome.tabs.sendMessage(currentTab.id, {
        action: "LIKE_ACTIVE_VIDEO",
        method: selectedMethod
      });

      if (!response) {
        throw new Error("Không nhận được phản hồi từ trang TikTok.");
      }

      if (response.code === "LIKED") {
        const methodNames = {
          button: "nhấp nút thích",
          key_l: "phím 'L'",
          double_click: "nhấn đúp 2 lần",
          auto: "tự động"
        };
        const used = methodNames[response.methodUsed] || response.methodUsed;
        setStatusBox("success", "🎉", "Thả tim thành công!", `Đã thả tim video qua cơ chế: ${used}.`);
      } else if (response.code === "ALREADY_LIKED") {
        setStatusBox("already_liked", "❤️", "Đã thả tim từ trước", "Video này đã có tim, tiện ích giữ nguyên trạng thái để không bị hủy thích.");
      } else if (response.code === "NO_VIDEO_FOUND") {
        setStatusBox("warning", "🔍", "Không thấy video", "Không tìm thấy video nào đang phát trên màn hình. Hãy lướt đến video cần thích và thử lại.");
      } else {
        setStatusBox("error", "⚠️", "Chưa thể thả tim", response.message || "Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Error executing like:", err);
      setStatusBox("error", "❌", "Lỗi thao tác", "Không thể gửi lệnh đến trang TikTok. Vui lòng tải lại (F5) trang TikTok và thử lại.");
    } finally {
      isProcessing = false;
      btnStartLike.disabled = false;
      btnStartComment.disabled = false;
      btnStartLike.classList.remove("loading");

      resetTimer = setTimeout(() => {
        if (!isProcessing) {
          setStatusBox("idle", "💡", "Sẵn sàng", "Mở một video TikTok tại tab đang hoạt động và bấm 'Thả tim' hoặc 'Tự động bình luận'.");
        }
      }, 4000);
    }
  }

  /**
   * Determine and generate the appropriate comment based on selected mode and video info (Feature 002, 003, 004).
   */
  async function resolveCommentForVideo(videoInfo) {
    const commentMode = commentModeSelect ? commentModeSelect.value : "ai";
    const apiKey = apiKeyInput.value.trim();
    const style = styleSelect.value || "friendly";

    // Mode: Lấy bình luận người xem / đầu tiên (Feature 004 & Feature 005)
    if (commentMode === "first_comment") {
      const isHumanizerOn = humanizerEnabledCheck ? humanizerEnabledCheck.checked : true;
      const isDiversityOn = commentDiversityCheck ? commentDiversityCheck.checked : true;

      const candidates = (videoInfo && videoInfo.audienceComments && videoInfo.audienceComments.length > 0)
        ? videoInfo.audienceComments
        : (videoInfo && videoInfo.existingComments && videoInfo.existingComments.length > 0)
          ? videoInfo.existingComments
          : (videoInfo && videoInfo.firstComment ? [videoInfo.firstComment] : []);

      if (candidates.length > 0) {
        let selectedComment = candidates[0];
        let statusTitle = "Lấy bình luận khán giả...";
        let statusDesc = `Đã lấy bình luận của người xem: "${selectedComment}"`;

        // Nếu bật Chống quét bot + Đa dạng hóa bình luận: chọn ngẫu nhiên trong top 3 - 5 bình luận
        if (isHumanizerOn && isDiversityOn && candidates.length > 1) {
          const pool = candidates.slice(0, 5);
          const randIdx = Math.floor(Math.random() * pool.length);
          selectedComment = pool[randIdx];
          statusTitle = `Chọn bình luận ngẫu nhiên (${randIdx + 1}/${pool.length})...`;
          statusDesc = `Đã chọn ngẫu nhiên vị trí ${randIdx + 1} trong top ${pool.length} bình luận khán giả: "${selectedComment}"`;
        }

        return {
          aiResult: {
            success: true,
            text: selectedComment,
            source: SOURCE_FIRST_COMMENT
          },
          statusTitle,
          statusDesc
        };
      }

      // Fallback: nếu video chưa có bình luận của người xem
      const fallbackResult = getRandomGeneralComment();
      return {
        aiResult: fallbackResult,
        statusTitle: "Dùng bình luận dự phòng...",
        statusDesc: "Video chưa có bình luận của người xem, đã chọn câu tương tác mẫu tự nhiên."
      };
    }

    // Mode: AI & Nội dung video (Feature 002 & 003)
    if (!videoInfo || !videoInfo.hasDescription) {
      if (videoInfo && videoInfo.existingComments && videoInfo.existingComments.length > 0) {
        const randIdx = Math.floor(Math.random() * videoInfo.existingComments.length);
        return {
          aiResult: {
            success: true,
            text: videoInfo.existingComments[randIdx],
            source: SOURCE_COMMUNITY
          },
          statusTitle: "Dùng bình luận từ video...",
          statusDesc: `Video không có mô tả, đã chọn ngẫu nhiên 1 trong ${videoInfo.existingComments.length} bình luận sẵn có.`
        };
      }
      return {
        aiResult: getRandomGeneralComment(),
        statusTitle: "Dùng bình luận mẫu ngẫu nhiên...",
        statusDesc: "Video không có mô tả và chưa có bình luận, đã chọn 1 câu tương tác mẫu tự nhiên."
      };
    }

    // Phân tích mô tả qua Gemini AI
    const aiResult = await generateAIComment(videoInfo.description, style, apiKey);
    return {
      aiResult,
      statusTitle: "Đang tạo bình luận AI...",
      statusDesc: `Đang phân tích: "${videoInfo.description}"...`
    };
  }

  /**
   * Handle AI Auto-Comment (Single execution)
   */
  async function handleStartComment() {
    if (isProcessing) return;

    if (resetTimer) clearTimeout(resetTimer);

    await updateActiveTab();

    if (!currentTab || !currentTab.id) {
      setStatusBox("error", "❌", "Lỗi tab", "Không tìm thấy tab trình duyệt nào đang mở.");
      return;
    }

    if (!isTikTokUrl(currentTab.url)) {
      setStatusBox("not_tiktok", "⚠️", "Chưa mở TikTok", "Vui lòng chuyển sang tab đang xem video TikTok.");
      return;
    }

    isProcessing = true;
    btnStartLike.disabled = true;
    btnStartComment.disabled = true;
    btnStartComment.classList.add("loading");

    // Step 1: Extract description & comments
    setStatusBox("processing", "🔍", "Đang đọc dữ liệu video...", "Đang trích xuất mô tả và bình luận của video...");

    try {
      await ensureContentScriptInjected(currentTab.id);

      let videoInfo = null;
      try {
        videoInfo = await chrome.tabs.sendMessage(currentTab.id, {
          action: "GET_ACTIVE_VIDEO_INFO"
        });
      } catch {
        // Retry injection once if connection dropped
        await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          files: ["content/content.js"]
        });
        await new Promise((r) => setTimeout(r, 120));
        videoInfo = await chrome.tabs.sendMessage(currentTab.id, {
          action: "GET_ACTIVE_VIDEO_INFO"
        });
      }

      if (!videoInfo || !videoInfo.success) {
        throw new Error(videoInfo?.message || "Không thể lấy thông tin video TikTok. Vui lòng tải lại (F5) trang TikTok và thử lại.");
      }

      if (!videoInfo.canComment && !videoInfo.hasCommentBox) {
        setStatusBox("warning", "🔒", "Bình luận bị khóa", "Chủ sở hữu video này đã tắt tính năng bình luận.");
        return;
      }

      // Step 2: Determine and generate comment content
      const { aiResult, statusTitle, statusDesc } = await resolveCommentForVideo(videoInfo);
      setStatusBox("processing", "💬", statusTitle, statusDesc, aiResult);

      if (!aiResult || !aiResult.text) {
        throw new Error("Không thể tạo câu bình luận.");
      }

      // Step 3: Fill into Draft.js div & submit
      const autoSubmit = autoSubmitCheck.checked;
      let postStatusDesc = "Đang nhập nội dung và kích hoạt nút gửi...";
      if (aiResult.errorReason) {
        postStatusDesc = `Lưu ý: ${aiResult.errorReason}. Tiện ích đã tự động dùng bình luận dự phòng.`;
      }

      setStatusBox(
        "processing",
        "✍️",
        "Đang đăng bình luận...",
        postStatusDesc,
        aiResult
      );

      const postResponse = await chrome.tabs.sendMessage(currentTab.id, {
        action: "POST_COMMENT",
        text: aiResult.text,
        autoSubmit: autoSubmit
      });

      if (!postResponse || !postResponse.success) {
        throw new Error(postResponse?.message || "Không thể hoàn tất đăng bình luận.");
      }

      if (postResponse.code === "POSTED") {
        setStatusBox(
          "success",
          "🎉",
          "Đã đăng bình luận thành công!",
          aiResult.errorReason
            ? `Đã đăng bình luận! (Lưu ý: ${aiResult.errorReason})`
            : "Nội dung bình luận đã được đăng tải lên video TikTok.",
          aiResult
        );
      } else {
        setStatusBox(
          "success",
          "📝",
          "Đã điền nội dung vào ô",
          aiResult.errorReason
            ? `Đã điền nội dung! (Lưu ý: ${aiResult.errorReason})`
            : "Nội dung đã được điền sẵn, bạn có thể kiểm tra và bấm nút gửi trên TikTok.",
          aiResult
        );
      }
    } catch (err) {
      console.error("Error executing auto-comment:", err);
      setStatusBox(
        "error",
        "❌",
        "Lỗi bình luận",
        err.message || "Không thể thực hiện bình luận. Vui lòng thử lại."
      );
    } finally {
      isProcessing = false;
      btnStartLike.disabled = false;
      btnStartComment.disabled = false;
      btnStartComment.classList.remove("loading");

      resetTimer = setTimeout(() => {
        if (!isProcessing && !isAutoFlowRunning) {
          setStatusBox(
            "idle",
            "💡",
            "Sẵn sàng",
            "Mở một video TikTok tại tab đang hoạt động và bấm 'Thả tim' hoặc 'Tự động bình luận'."
          );
        }
      }, 6000);
    }
  }

  /**
   * Interruptible countdown sleep supporting instant abort within 200ms.
   */
  async function interruptibleSleep(seconds, onTick) {
    for (let remaining = seconds; remaining > 0; remaining--) {
      if (!isAutoFlowRunning) return false;
      if (typeof onTick === "function") {
        onTick(remaining);
      }
      for (let step = 0; step < 5; step++) {
        if (!isAutoFlowRunning) return false;
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (!isAutoFlowRunning) return false;
      }
    }
    return true;
  }

  /**
   * Short interruptible sleep in milliseconds (checking every 150ms).
   */
  async function interruptibleSleepMs(ms) {
    const steps = Math.ceil(ms / 150);
    for (let i = 0; i < steps; i++) {
      if (!isAutoFlowRunning) return false;
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (!isAutoFlowRunning) return false;
    }
    return true;
  }

  /**
   * Stop the continuous auto-interaction flow safely.
   */
  function stopAutoFlow(reason = "Đã dừng tự động tương tác.") {
    if (!isAutoFlowRunning) return;
    isAutoFlowRunning = false;
    isProcessing = false;

    if (btnToggleAutoFlow) {
      btnToggleAutoFlow.classList.remove("running");
      if (autoFlowBtnText) autoFlowBtnText.textContent = "Bắt đầu Auto tương tác";
      if (autoFlowBtnIcon) {
        autoFlowBtnIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
      }
    }

    btnStartLike.disabled = false;
    btnStartComment.disabled = false;

    setStatusBox("idle", "⏹️", "Đã dừng Auto", reason);
  }

  /**
   * Start the continuous auto-interaction flow.
   */
  async function startAutoFlow() {
    if (isAutoFlowRunning) {
      stopAutoFlow("Người dùng đã bấm dừng.");
      return;
    }

    if (resetTimer) clearTimeout(resetTimer);
    await updateActiveTab();

    if (!currentTab || !currentTab.id) {
      setStatusBox("error", "❌", "Lỗi tab", "Không tìm thấy tab trình duyệt nào đang mở.");
      return;
    }

    if (!isTikTokUrl(currentTab.url)) {
      setStatusBox("not_tiktok", "⚠️", "Chưa mở TikTok", "Vui lòng chuyển sang tab đang xem video TikTok.");
      return;
    }

    isAutoFlowRunning = true;
    isProcessing = true;
    interactedCount = 0;
    if (autoFlowProgress) {
      autoFlowProgress.textContent = "Đã tương tác: 0 video";
    }

    if (btnToggleAutoFlow) {
      btnToggleAutoFlow.classList.add("running");
      if (autoFlowBtnText) autoFlowBtnText.textContent = "Dừng Auto tương tác";
      if (autoFlowBtnIcon) {
        autoFlowBtnIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M6 6h12v12H6z"/>
          </svg>
        `;
      }
    }

    btnStartLike.disabled = true;
    btnStartComment.disabled = true;

    // Start background loop
    runAutoInteractionLoop();
  }

  /**
   * Continuous loop executing with inverted human-like workflow:
   * 1. Wait for video & interactive controls ready
   * 2. INVERTED WAIT: Watch video for delay seconds FIRST (simulating human watch time before interaction)
   * 3. Interacting: Like -> (Follow if enabled) -> Post Comment
   * 4. Navigate Next Video
   * 5. Repeat.
   */
  async function runAutoInteractionLoop() {
    const delaySec = delaySelect ? parseInt(delaySelect.value, 10) || 5 : 5;
    const maxVideos = maxVideosSelect ? parseInt(maxVideosSelect.value, 10) || 0 : 0;
    const likeMethod = methodSelect.value || "auto";
    const autoSubmit = autoSubmitCheck.checked;
    const autoFollow = autoFollowCheck ? autoFollowCheck.checked : false;

    // Humanizer settings (Feature 005)
    const isHumanizerOn = humanizerEnabledCheck ? humanizerEnabledCheck.checked : true;
    const isJitterOn = jitterCheck ? jitterCheck.checked : true;
    const skipRate = skipRateSelect ? parseInt(skipRateSelect.value, 10) || 0 : 15;

    while (isAutoFlowRunning) {
      try {
        if (maxVideos > 0 && interactedCount >= maxVideos) {
          stopAutoFlow(`Đã hoàn thành tương tác đủ ${interactedCount} video theo giới hạn!`);
          break;
        }

        const currentVideoIndex = interactedCount + 1;
        const videoLabel = maxVideos > 0 ? `Video ${currentVideoIndex}/${maxVideos}` : `Video ${currentVideoIndex}`;

        await ensureContentScriptInjected(currentTab.id);
        if (!isAutoFlowRunning) break;

        // BƯỚC 1: Kiểm tra video và các nút tương tác đã sẵn sàng trên DOM
        setStatusBox(
          "processing",
          "⏳",
          `[${videoLabel}] Đang tải video...`,
          "Đang kiểm tra video và các nút tương tác đã sẵn sàng..."
        );

        let readyRes = null;
        try {
          readyRes = await chrome.tabs.sendMessage(currentTab.id, {
            action: "WAIT_FOR_VIDEO_READY",
            timeout: 3000
          });
        } catch (readyErr) {
          console.warn("Wait ready error:", readyErr);
        }

        if (!isAutoFlowRunning) break;

        // BƯỚC 1a: Kiểm tra nếu video là buổi phát trực tiếp (Livestream)
        if (readyRes && readyRes.isLivestream) {
          setStatusBox(
            "warning",
            "📡",
            `[${videoLabel}] Phát hiện Livestream`,
            "Đây là phiên LIVE chứ không phải video thường. Tự động chuyển sang video tiếp theo..."
          );
          await interruptibleSleepMs(800);
          const navRes = await chrome.tabs.sendMessage(currentTab.id, {
            action: "NAVIGATE_NEXT_VIDEO",
            timeout: 8000
          });
          if (navRes && !navRes.success && navRes.code === "END_OF_FEED") {
            stopAutoFlow("Đã đến cuối danh sách video TikTok.");
            break;
          }
          continue;
        }

        // BƯỚC 1b (Feature 005 - US3): Kiểm tra tỷ lệ lướt qua ngẫu nhiên (Skip Rate)
        if (isHumanizerOn && shouldSkipVideo(skipRate)) {
          const quickWatchSec = getRandomInRange(2, 5);
          setStatusBox(
            "warning",
            "🎲",
            `[${videoLabel}] Bỏ qua an toàn (Chờ ${quickWatchSec}s)...`,
            `Lướt qua video theo tỷ lệ tự nhiên (${skipRate}%). Đang xem ngắn ${quickWatchSec}s rồi lướt tiếp...`
          );

          const skipWaitCompleted = await interruptibleSleep(quickWatchSec, (secLeft) => {
            setStatusBox(
              "warning",
              "🎲",
              `[${videoLabel}] Bỏ qua an toàn (Còn ${secLeft}s)...`,
              `Lướt qua video theo tỷ lệ tự nhiên (${skipRate}%). Đang xem ngắn ${secLeft}s rồi lướt tiếp...`
            );
          });

          if (!skipWaitCompleted || !isAutoFlowRunning) break;

          const navRes = await chrome.tabs.sendMessage(currentTab.id, {
            action: "NAVIGATE_NEXT_VIDEO",
            timeout: 8000
          });
          if (navRes && !navRes.success && navRes.code === "END_OF_FEED") {
            stopAutoFlow("Đã đến cuối danh sách video TikTok.");
            break;
          }
          continue;
        }

        // BƯỚC 2 (Feature 005 - US2 Jitter): Xem video và đếm ngược thời gian chờ TRƯỚC KHI TƯƠNG TÁC
        const actualWatchDelay = (isHumanizerOn && isJitterOn)
          ? calculateJitterDelay(delaySec, 25)
          : delaySec;

        const jitterNotice = (isHumanizerOn && isJitterOn && actualWatchDelay !== delaySec)
          ? ` (Jitter: ${actualWatchDelay}s)`
          : "";

        const completedWait = await interruptibleSleep(actualWatchDelay, (secLeft) => {
          setStatusBox(
            "processing",
            "👀",
            `[${videoLabel}] Đang xem video (${secLeft}s còn lại)...`,
            `Đang xem video... Đếm ngược ${secLeft} giây trước khi tự động tương tác${jitterNotice}.`
          );
        });

        if (!completedWait || !isAutoFlowRunning) break;

        // BƯỚC 3: TIẾN HÀNH TƯƠNG TÁC (Feature 005 - US1 Micro-delays)

        // Micro-delay trước khi Thả tim (300ms - 800ms)
        if (isHumanizerOn) {
          const preLikeDelay = getRandomInRange(300, 800);
          const waited = await interruptibleSleepMs(preLikeDelay);
          if (!waited || !isAutoFlowRunning) break;
        }

        // 3.1. Thả tim video
        setStatusBox(
          "processing",
          "❤️",
          `[${videoLabel}] Đang thả tim...`,
          "Đang kiểm tra và thả tim cho video..."
        );

        try {
          await chrome.tabs.sendMessage(currentTab.id, {
            action: "LIKE_ACTIVE_VIDEO",
            method: likeMethod
          });
        } catch (likeErr) {
          console.warn("Auto loop like error:", likeErr);
        }

        if (!isAutoFlowRunning) break;

        // 3.2. Tự động Follow kênh (nếu được bật)
        if (autoFollow) {
          // Micro-delay trước khi Follow (800ms - 2000ms)
          if (isHumanizerOn) {
            const preFollowDelay = getRandomInRange(800, 2000);
            const waited = await interruptibleSleepMs(preFollowDelay);
            if (!waited || !isAutoFlowRunning) break;
          }

          setStatusBox(
            "processing",
            "➕",
            `[${videoLabel}] Kiểm tra Follow...`,
            "Đang kiểm tra và nhấn follow kênh nếu chưa theo dõi..."
          );
          try {
            await chrome.tabs.sendMessage(currentTab.id, {
              action: "FOLLOW_CREATOR"
            });
          } catch (followErr) {
            console.warn("Auto loop follow error:", followErr);
          }
        }

        if (!isAutoFlowRunning) break;

        // Micro-delay trước khi đọc/gửi bình luận (1200ms - 2500ms)
        if (isHumanizerOn) {
          const preCommentDelay = getRandomInRange(1200, 2500);
          const waited = await interruptibleSleepMs(preCommentDelay);
          if (!waited || !isAutoFlowRunning) break;
        }

        // 3.3. Lấy thông tin và Đăng bình luận
        let videoInfo = null;
        try {
          videoInfo = await chrome.tabs.sendMessage(currentTab.id, {
            action: "GET_ACTIVE_VIDEO_INFO"
          });
        } catch (infoErr) {
          console.warn("Auto loop get info error:", infoErr);
        }

        if (!isAutoFlowRunning) break;

        // Kiểm tra nếu là Livestream
        if (videoInfo && videoInfo.isLivestream) {
          setStatusBox(
            "warning",
            "📡",
            `[${videoLabel}] Phát hiện Livestream`,
            "Đây là phiên LIVE chứ không phải video thường. Tự động chuyển sang video tiếp theo..."
          );
          await interruptibleSleepMs(800);
          const navRes = await chrome.tabs.sendMessage(currentTab.id, {
            action: "NAVIGATE_NEXT_VIDEO",
            timeout: 8000
          });
          if (navRes && !navRes.success && navRes.code === "END_OF_FEED") {
            stopAutoFlow("Đã đến cuối danh sách video TikTok.");
            break;
          }
          continue;
        }

        let commentPosted = false;
        // Kiểm tra nếu video thực sự không có ô bình luận và không thể bình luận
        const cannotComment = !videoInfo || (!videoInfo.hasCommentBox && !videoInfo.canComment);
        if (cannotComment) {
          setStatusBox(
            "warning",
            "⏭️",
            `[${videoLabel}] Bỏ qua bình luận`,
            "Video này không có ô bình luận hoặc tác giả đã khóa bình luận, chuyển sang video tiếp theo..."
          );
          await interruptibleSleepMs(1000);
          const navRes = await chrome.tabs.sendMessage(currentTab.id, {
            action: "NAVIGATE_NEXT_VIDEO",
            timeout: 8000
          });
          if (navRes && !navRes.success && navRes.code === "END_OF_FEED") {
            stopAutoFlow("Đã đến cuối danh sách video TikTok.");
            break;
          }
          continue;
        }

        // Tạo / Lấy nội dung bình luận theo cấu hình
        const { aiResult, statusTitle, statusDesc } = await resolveCommentForVideo(
          videoInfo || { hasDescription: false, canComment: true }
        );

        if (!isAutoFlowRunning) break;

        if (aiResult && aiResult.text) {
          setStatusBox(
            "processing",
            "✍️",
            `[${videoLabel}] Đăng bình luận...`,
            statusDesc,
            aiResult
          );

          try {
            const postRes = await chrome.tabs.sendMessage(currentTab.id, {
              action: "POST_COMMENT",
              text: aiResult.text,
              autoSubmit: autoSubmit
            });
            commentPosted = Boolean(postRes && postRes.success);
          } catch (postErr) {
            console.warn("Auto loop post comment error:", postErr);
          }
        }

        // Nếu đăng bình luận thất bại do không tìm thấy ô nhập, next sang video tiếp theo
        if (!commentPosted) {
          setStatusBox(
            "warning",
            "⏭️",
            `[${videoLabel}] Lỗi ô bình luận`,
            "Không tìm thấy ô nhập bình luận, đang chuyển tiếp sang video mới..."
          );
          const navRes = await chrome.tabs.sendMessage(currentTab.id, {
            action: "NAVIGATE_NEXT_VIDEO",
            timeout: 8000
          });
          if (navRes && !navRes.success && navRes.code === "END_OF_FEED") {
            stopAutoFlow("Đã đến cuối danh sách video TikTok.");
            break;
          }
          continue;
        }

        if (!isAutoFlowRunning) break;

        interactedCount++;
        if (autoFlowProgress) {
          autoFlowProgress.textContent = `Đã tương tác: ${interactedCount} video`;
        }

        setStatusBox(
          "success",
          "🎉",
          `[${videoLabel}] Đã tương tác xong!`,
          `Đã tương tác thành công (${autoFollow ? "Tim + Follow + Bình luận" : "Tim + Bình luận"}). Đang nghỉ trước khi chuyển video...`
        );

        if (maxVideos > 0 && interactedCount >= maxVideos) {
          stopAutoFlow(`Đã hoàn thành phiên tự động đủ ${interactedCount} video!`);
          break;
        }

        // Nghỉ ngẫu nhiên tự nhiên sau khi tương tác (1200ms - 2500ms) trước khi chuyển video
        const postDelayMs = isHumanizerOn ? getRandomInRange(1200, 2500) : 2000;
        const completedPostWait = await interruptibleSleepMs(postDelayMs);
        if (!completedPostWait || !isAutoFlowRunning) break;

        // BƯỚC 4: Chuyển ngay sang video tiếp theo & đợi video mới sẵn sàng
        setStatusBox(
          "processing",
          "⬇️",
          `Chuyển sang video tiếp theo...`,
          "Đang chuyển video và chờ video, nút thả tim, khung bình luận tải xong..."
        );

        const navRes = await chrome.tabs.sendMessage(currentTab.id, {
          action: "NAVIGATE_NEXT_VIDEO",
          timeout: 8000
        });

        if (navRes && !navRes.success && navRes.code === "END_OF_FEED") {
          stopAutoFlow("Đã đến cuối danh sách video TikTok.");
          break;
        }

        if (!isAutoFlowRunning) break;

      } catch (loopErr) {
        console.error("Error during auto interaction loop:", loopErr);
        if (!isAutoFlowRunning) break;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  // Attach event listeners
  btnStartLike.addEventListener("click", handleStartLike);
  btnStartComment.addEventListener("click", handleStartComment);
  if (btnToggleAutoFlow) {
    btnToggleAutoFlow.addEventListener("click", startAutoFlow);
  }

  chrome.tabs.onActivated.addListener(updateActiveTab);
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active) {
      updateActiveTab();
    }
  });

  // Initialization
  await loadSettings();
  await updateActiveTab();
});
