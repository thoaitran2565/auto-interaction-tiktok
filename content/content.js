/**
 * TikTok Auto Interaction Content Script (v1.5.0)
 * Executes video detection, auto-like, and AI auto-comment directly in TikTok Web DOM.
 */

(() => {
  const SCRIPT_VERSION = "1.5.0";
  window.__TIKTOK_AUTO_INTERACTION_VERSION__ = SCRIPT_VERSION;

  console.log(`[TikTok Auto Interaction] Content script v${SCRIPT_VERSION} loaded.`);

  /**
   * Find the currently active/visible TikTok video container.
   */
  function getActiveVideoContainer() {
    // 1. If there is a video actively playing on screen, find its container
    const videos = Array.from(document.querySelectorAll("video"));
    const playingVideo = videos.find((v) => !v.paused && v.offsetWidth > 0);
    if (playingVideo) {
      const container =
        playingVideo.closest('article[data-e2e="recommend-list-item-container"]') ||
        playingVideo.closest('article[class*="ArticleItemContainer"]') ||
        playingVideo.closest('div[class*="DivContentFlexLayout"]') ||
        playingVideo.closest('section[data-e2e="feed-video"]') ||
        playingVideo.closest("section") ||
        playingVideo.parentElement;
      if (container) return container;
    }

    // 2. Feed articles in viewport (closest to viewport vertical center)
    const feedSelectors = [
      'article[data-e2e="recommend-list-item-container"]',
      'article[class*="ArticleItemContainer"]',
      'div[data-e2e="feed-item"]',
      'div[class*="DivItemContainer"]'
    ];
    let items = [];
    for (const selector of feedSelectors) {
      const found = document.querySelectorAll(selector);
      if (found.length > 0) {
        items = Array.from(found);
        break;
      }
    }

    if (items.length > 0) {
      const viewportCenter = window.innerHeight / 2;
      let closestItem = null;
      let minDistance = Infinity;

      for (const item of items) {
        const rect = item.getBoundingClientRect();
        // If element is partially or fully visible in viewport
        if (rect.bottom > 50 && rect.top < window.innerHeight - 50) {
          const itemCenter = (rect.top + rect.bottom) / 2;
          const dist = Math.abs(itemCenter - viewportCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closestItem = item;
          }
        }
      }

      if (closestItem) {
        return closestItem;
      }
      return items[0];
    }

    // 3. Single video detail view containers (modal / watch view)
    const singleSelectors = [
      '[data-e2e="browse-video"]',
      '[data-e2e="video-detail-container"]',
      'div[class*="DivVideoContainer"]',
      '#main-content-video_detail'
    ];
    for (const selector of singleSelectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }

    // 4. Fallback: Any visible video element or document body
    if (videos.length > 0) {
      const targetVideo = videos[0];
      return (
        targetVideo.closest("article") ||
        targetVideo.closest("section") ||
        targetVideo.parentElement ||
        document.body
      );
    }

    return document.body;
  }

  /**
   * Find the Like Button element within a given container or document.
   */
  function findLikeButton(container) {
    const root = container || getActiveVideoContainer() || document;
    const selectors = [
      '[data-e2e="like-icon"]',
      '[data-key-interaction="action_like"]',
      'div[role="button"][aria-label*="Thích video"]',
      'div[role="button"][aria-label*="Like video"]',
      'button[aria-label*="Thích video"]',
      'button[aria-label*="Like video"]',
      'span[class*="HeartWrapper"]'
    ];

    for (const selector of selectors) {
      const element = root.querySelector(selector);
      if (element) {
        const button = element.closest('[role="button"]') || element.closest("button") || element;
        return button;
      }
    }
    return null;
  }

  /**
   * Check whether the video is already liked.
   */
  function isAlreadyLiked(likeButton) {
    if (!likeButton) return false;

    const ariaPressed =
      likeButton.getAttribute("aria-pressed") ||
      likeButton.closest("[aria-pressed]")?.getAttribute("aria-pressed");
    if (ariaPressed === "true") {
      return true;
    }

    const ariaLabel =
      likeButton.getAttribute("aria-label") ||
      likeButton.closest("[aria-label]")?.getAttribute("aria-label") ||
      "";
    if (
      ariaLabel.toLowerCase().includes("bỏ thích") ||
      ariaLabel.toLowerCase().includes("unlike")
    ) {
      return true;
    }

    const svg = likeButton.querySelector("svg");
    if (svg) {
      const color = svg.getAttribute("color") || svg.style.color || window.getComputedStyle(svg).color;
      if (color.includes("254, 44, 85") || color.includes("#fe2c55") || color.includes("rgb(255, 75, 75)")) {
        return true;
      }
    }

    return false;
  }

  function executeLikeByButton(likeButton) {
    if (!likeButton) return false;
    const clickable = likeButton.querySelector("button") || likeButton;
    clickable.click();
    return true;
  }

  function executeLikeByKeyL() {
    if (
      document.activeElement &&
      (document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable)
    ) {
      document.activeElement.blur();
    }

    const eventInit = {
      key: "l",
      code: "KeyL",
      keyCode: 76,
      which: 76,
      bubbles: true,
      cancelable: true
    };

    document.dispatchEvent(new KeyboardEvent("keydown", eventInit));
    document.dispatchEvent(new KeyboardEvent("keyup", eventInit));
    return true;
  }

  function executeLikeByDoubleClick(container) {
    const videoTarget =
      container?.querySelector("video") ||
      container?.querySelector('[data-e2e="feed-video"]') ||
      container ||
      document.querySelector("video");

    if (!videoTarget) return false;

    const rect = videoTarget.getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;

    const mouseInit = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: clientX,
      clientY: clientY
    };

    videoTarget.dispatchEvent(new MouseEvent("mousedown", mouseInit));
    videoTarget.dispatchEvent(new MouseEvent("mouseup", mouseInit));
    videoTarget.dispatchEvent(new MouseEvent("click", mouseInit));
    videoTarget.dispatchEvent(new MouseEvent("mousedown", mouseInit));
    videoTarget.dispatchEvent(new MouseEvent("mouseup", mouseInit));
    videoTarget.dispatchEvent(new MouseEvent("click", mouseInit));
    videoTarget.dispatchEvent(new MouseEvent("dblclick", mouseInit));
    return true;
  }

  function handleLikeVideo(method = "auto") {
    const container = getActiveVideoContainer();
    const likeBtn = findLikeButton(container);

    if (likeBtn && isAlreadyLiked(likeBtn)) {
      return {
        success: true,
        code: "ALREADY_LIKED",
        message: "Video này đã được thả tim từ trước.",
        methodUsed: "none"
      };
    }

    let success = false;
    let methodUsed = method;

    if (method === "button" || method === "auto") {
      if (likeBtn) {
        success = executeLikeByButton(likeBtn);
        methodUsed = "button";
      }
    }

    if (!success && (method === "key_l" || method === "auto")) {
      success = executeLikeByKeyL();
      methodUsed = "key_l";
    }

    if (!success && (method === "double_click" || method === "auto")) {
      success = executeLikeByDoubleClick(container);
      methodUsed = "double_click";
    }

    if (success) {
      return {
        success: true,
        code: "LIKED",
        message: "Đã thả tim video thành công!",
        methodUsed: methodUsed
      };
    }

    return {
      success: false,
      code: "NO_VIDEO_FOUND",
      message: "Không tìm thấy video hợp lệ để thả tim."
    };
  }

  // ==========================================
  // FOLLOW CREATOR LOGIC (Feature 004+)
  // ==========================================

  /**
   * Find the Follow Button for the author of the active video.
   * Target elements: button[data-e2e="feed-follow"], button[data-key-interaction="action_follow"]
   */
  function findFollowButton(container) {
    const root = container || getActiveVideoContainer() || document;
    const selectors = [
      'button[data-e2e="feed-follow"]',
      'button[data-key-interaction="action_follow"]',
      'button[class*="StyledAvatarFollowButton"]',
      'button[data-e2e="user-follow-button"]',
      'button[data-e2e="follow-button"]'
    ];

    for (const selector of selectors) {
      const btn = root.querySelector(selector);
      if (btn) return btn;
    }

    const avatarWrapper = root.querySelector('[class*="AvatarWrapper"], [class*="DivAuthorContainer"]');
    if (avatarWrapper) {
      const btn = avatarWrapper.querySelector("button");
      if (btn) return btn;
    }

    return null;
  }

  /**
   * Check if the author is already followed.
   */
  function isAlreadyFollowed(btn) {
    if (!btn) return true;

    if (btn.getAttribute("aria-pressed") === "true") return true;

    const label = (btn.getAttribute("aria-label") || "").toLowerCase();
    if (label.includes("đang theo dõi") || label.includes("following") || label.includes("bạn bè") || label.includes("friends")) {
      return true;
    }

    const text = (btn.textContent || "").trim().toLowerCase();
    if (text.includes("đang theo dõi") || text.includes("following") || text.includes("bạn bè") || text.includes("friends")) {
      return true;
    }

    return false;
  }

  /**
   * Handle Follow Creator for the active video.
   */
  function handleFollowCreator(container) {
    const root = container || getActiveVideoContainer();
    const followBtn = findFollowButton(root);

    if (!followBtn) {
      console.log("[TikTok Auto Interaction] No follow button found (creator already followed or self).");
      return {
        success: true,
        code: "ALREADY_FOLLOWED",
        message: "Kênh này đã được follow từ trước hoặc là tài khoản của bạn."
      };
    }

    if (isAlreadyFollowed(followBtn)) {
      console.log("[TikTok Auto Interaction] Creator is already followed.");
      return {
        success: true,
        code: "ALREADY_FOLLOWED",
        message: "Kênh này đã được follow từ trước."
      };
    }

    try {
      followBtn.click();
      console.log("[TikTok Auto Interaction] Followed creator successfully.");
      return {
        success: true,
        code: "FOLLOWED",
        message: "Đã nhấn theo dõi kênh thành công!"
      };
    } catch (err) {
      console.error("[TikTok Auto Interaction] Error following creator:", err);
      return {
        success: false,
        code: "FOLLOW_ERROR",
        message: "Lỗi khi nhấn follow: " + err.message
      };
    }
  }

  // ==========================================
  // MULTI-TIER VIDEO DESCRIPTION EXTRACTION
  // ==========================================

  /**
   * Extract video description and hashtags using robust multi-tier fallback strategies.
   */
  function extractVideoDescription(container) {
    const root = container || getActiveVideoContainer() || document;
    let fullDescription = "";
    const hashtags = [];

    // Helper: Extract hashtags (#tag) from any text
    function collectHashtags(str) {
      if (!str) return;
      const tagMatches = str.match(/#([a-zA-Z0-9_\u00C0-\u1EF9]+)/g);
      if (tagMatches) {
        tagMatches.forEach((t) => {
          const clean = t.replace(/^#/, "");
          if (clean && !hashtags.includes(clean)) {
            hashtags.push(clean);
          }
        });
      }
    }

    // Strategy 1: Check span[data-e2e^="desc-span"] inside container
    const descSpans = root.querySelectorAll ? root.querySelectorAll('[data-e2e^="desc-span"]') : [];
    if (descSpans.length > 0) {
      const parts = [];
      descSpans.forEach((span) => {
        const txt = (span.textContent || "").trim();
        if (txt) parts.push(txt);
      });
      if (parts.length > 0) {
        fullDescription = parts.join(" ").trim();
      }
    }

    // Strategy 2: Check div[data-e2e="video-desc"]
    if (!fullDescription && root.querySelector) {
      const descContainer =
        root.querySelector('[data-e2e="video-desc"]') ||
        root.querySelector('[data-e2e="browse-video-desc"]');
      if (descContainer) {
        fullDescription = (descContainer.textContent || "").trim();
      }
    }

    // Strategy 3: Check data-media-card-description-container
    if (!fullDescription && root.querySelector) {
      const descCard = root.querySelector('[data-media-card-description-container="true"]');
      if (descCard) {
        fullDescription = (descCard.textContent || "").trim();
      }
    }

    // Strategy 4: Check poster img alt in player (contains exact full caption on TikTok)
    if (!fullDescription && root.querySelectorAll) {
      const playerImgs = root.querySelectorAll('img[alt]:not([alt=""])');
      for (const img of playerImgs) {
        const alt = (img.getAttribute("alt") || "").trim();
        if (alt && !alt.toLowerCase().startsWith("avatar") && alt.length > 3) {
          fullDescription = alt;
          break;
        }
      }
    }

    // Strategy 5: Meta tag og:description on single video view
    if (!fullDescription) {
      const metaOg = document.querySelector('meta[property="og:description"]');
      if (metaOg && metaOg.content) {
        fullDescription = metaOg.content.trim();
      }
    }

    // Strategy 6: Document-wide desc-spans if container query missed it
    if (!fullDescription) {
      const allSpans = document.querySelectorAll('[data-e2e^="desc-span"]');
      for (const span of allSpans) {
        const txt = (span.textContent || "").trim();
        if (txt && txt.length > 2) {
          fullDescription = txt;
          break;
        }
      }
    }

    // Collect hashtags from raw description
    collectHashtags(fullDescription);

    // Also collect hashtags from anchor links in DOM
    if (root.querySelectorAll) {
      const tagLinks = root.querySelectorAll('a[href*="/tag/"], a[data-e2e="search-common-link"]');
      tagLinks.forEach((a) => {
        const tagText = (a.textContent || "").trim().replace(/^#/, "");
        if (tagText && !hashtags.includes(tagText)) {
          hashtags.push(tagText);
        }
      });
    }

    // Clean up: Separate the pure caption text from hashtag tags
    let pureCaption = fullDescription.replace(/#[a-zA-Z0-9_\u00C0-\u1EF9]+/g, "").replace(/\s+/g, " ").trim();

    // If pure caption was empty but hashtags exist, use the hashtags
    if (!pureCaption && hashtags.length > 0) {
      pureCaption = hashtags.join(" ");
    }

    const hasDescription = Boolean(pureCaption && pureCaption.length > 2);

    console.log("[TikTok Auto Interaction] Extracted description:", {
      hasDescription,
      pureCaption,
      fullDescription,
      hashtags
    });

    return {
      hasDescription: hasDescription,
      description: pureCaption || fullDescription || "",
      rawDescription: fullDescription,
      hashtags: hashtags
    };
  }

  /**
   * Find the Draft.js editor or text input element for TikTok comments.
   * Matches both standard and custom variants across TikTok Web versions.
   */
  function findCommentEditor() {
    const directEditorSelectors = [
      '[data-e2e="comment-input"] [contenteditable="true"]',
      '[data-e2e="comment-input"] div[role="textbox"]',
      'div[contenteditable="true"][role="textbox"]',
      '[data-e2e="comment-text"] [contenteditable="true"]',
      '.DraftEditor-root [contenteditable="true"]',
      '.public-DraftEditor-content[contenteditable="true"]'
    ];

    for (const sel of directEditorSelectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }

    // Secondary: Check container [data-e2e="comment-input"]
    const container = document.querySelector('[data-e2e="comment-input"]');
    if (container) {
      const inner = container.querySelector('[contenteditable="true"], [role="textbox"], textarea, input');
      return inner || container;
    }

    return null;
  }

  /**
   * Check if comment input controls exist in DOM.
   * If any of these are present, the video definitely supports commenting and has an input section.
   */
  function hasCommentInput() {
    return Boolean(
      document.querySelector('[data-e2e="comment-input"]') ||
      document.querySelector('[data-e2e="comment-post"]') ||
      document.querySelector('div[contenteditable="true"][role="textbox"]') ||
      document.querySelector('[data-e2e="comment-text"][data-key-interaction="comment_input"]') ||
      findCommentEditor()
    );
  }

  /**
   * Safe check if an element is rendered and visible in DOM.
   * Avoids using offsetParent because offsetParent returns null on fixed/sticky elements (W3C standard),
   * which TikTok sidebar and comment footer frequently use.
   */
  function isElementVisible(el) {
    if (!el || !el.isConnected) return false;
    try {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        return false;
      }
      const rect = el.getBoundingClientRect();
      return (rect.width > 0 && rect.height > 0) || el.getClientRects().length > 0;
    } catch {
      return Boolean(el.isConnected);
    }
  }

  /**
   * Detect if the active video item in feed is a Livestream session rather than a standard video (page2.html).
   * Indicators:
   * 1. live-like-icon or live-share-icon instead of comment-icon
   * 2. DivLiveUnavailableContainer or .live-desc in sidebar ("Chức năng bình luận đã bị tắt. Hãy xem LIVE...")
   * 3. DivLiveTag ("hiện đang LIVE") or DivClickTipsText ("Nhấp để xem LIVE")
   */
  function detectLivestream(container) {
    // If comment input is present, this is definitely a standard interactive video, NOT a live without comments
    if (hasCommentInput()) {
      return false;
    }

    const root = container || getActiveVideoContainer() || document;

    // Check live action icons
    if (root.querySelector && (root.querySelector('[data-e2e="live-like-icon"]') || root.querySelector('[data-e2e="live-share-icon"]'))) {
      return true;
    }
    if (document.querySelector('[data-e2e="live-like-icon"]')) {
      return true;
    }

    // Check live unavailable container in sidebar
    const unavailableLive = document.querySelector('div[class*="DivLiveUnavailableContainer"], .live-desc, [class*="live-desc"]');
    if (unavailableLive) {
      return true;
    }

    // Check live tags / tips
    const liveTag = (root.querySelector && root.querySelector('div[class*="DivLiveTag"], div[class*="DivClickTipsText"]')) ||
                    document.querySelector('div[class*="DivLiveTag"], div[class*="DivClickTipsText"]');
    if (liveTag) {
      const text = (liveTag.textContent || "").toLowerCase();
      if (text.includes("live")) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract existing text comments from the video comments list.
   * Filters out pure emojis, stickers, and strings with no alphanumeric text.
   */
  function extractExistingComments() {
    const comments = [];
    const commentSelectors = [
      '[data-e2e^="comment-level"]',
      '[data-e2e="comment-text"]',
      'div[class*="DivCommentItemWrapper"] span[class*="TUXText"]',
      'div[class*="DivCommentContentWrapper"] span[class*="TUXText"]'
    ];

    const elements = document.querySelectorAll(commentSelectors.join(", "));
    for (const el of elements) {
      const text = (el.textContent || "").trim();
      // Must be at least 3 chars, max 200 chars
      if (text.length >= 3 && text.length <= 200) {
        // Must contain at least one Vietnamese/alphanumeric letter (not just emojis or punctuation)
        const hasLetters = /[a-zA-Z0-9\u00C0-\u1EF9]/.test(text);
        if (hasLetters && !comments.includes(text)) {
          // Avoid system strings like "Trả lời", "Xem thêm", timestamps
          const isSystemText = /^(trả lời|reply|xem thêm|view more|\d+-\d+|\d+h|\d+m|\d+s|\d+d)$/i.test(text);
          if (!isSystemText) {
            comments.push(text);
          }
        }
      }
    }

    console.log(`[TikTok Auto Interaction] Scanned ${comments.length} existing comments:`, comments.slice(0, 5));
    return comments;
  }

  /**
   * Extract top audience comments on the video (Feature 004 & 005 Diverse Selection).
   * Finds valid level-1 comments, skipping creator comments, pinned comments, and system text.
   * Target elements: span[data-e2e="comment-level-1"], fallback to [data-e2e="comment-text"]
   * @param {Element|null} container
   * @param {number} limit
   * @returns {string[]}
   */
  function extractAudienceComments(container, limit = 5) {
    const comments = [];
    
    // Priority 1: Target exact top-level audience comment spans (e.g. "Có trên scl kh ạ", "Cái này có trên youtube ko ạ")
    let candidates = Array.from(document.querySelectorAll('span[data-e2e="comment-level-1"]'));

    // Priority 2: Fallback to broader comment selectors if level-1 spans are not present
    if (candidates.length === 0) {
      candidates = Array.from(document.querySelectorAll(
        '[data-e2e="comment-text"], [data-e2e="comment-level-2"]'
      ));
    }

    for (const el of candidates) {
      if (comments.length >= limit) break;

      // Find comment item wrapper
      const wrapper = el.closest('[class*="DivCommentItemWrapper"]') ||
                      el.closest('[class*="DivCommentContentWrapper"]') ||
                      el.parentElement;

      if (wrapper) {
        // 1. Skip if creator tag or pinned tag exists in wrapper
        const hasCreatorTag = !!wrapper.querySelector('[data-e2e="comment-creator-tag"], [data-e2e*="creator"]');
        const hasPinnedTag = !!wrapper.querySelector('[data-e2e="comment-pinned-tag"], [data-e2e*="pinned"]');
        if (hasCreatorTag || hasPinnedTag) {
          continue;
        }

        // 2. Check textual badges for author / pinned indicators
        const badgeElements = wrapper.querySelectorAll('span, div');
        let isAuthorOrPinned = false;
        for (const badge of badgeElements) {
          const badgeText = (badge.textContent || "").trim();
          if (/^(tác giả|creator|đã ghim|pinned)$/i.test(badgeText)) {
            isAuthorOrPinned = true;
            break;
          }
        }
        if (isAuthorOrPinned) {
          continue;
        }
      }

      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      // Must be between 2 and 500 characters
      if (text.length >= 2 && text.length <= 500) {
        const hasLetters = /[a-zA-Z0-9\u00C0-\u1EF9]/.test(text);
        const isSystemText = /^(trả lời|reply|xem thêm|view more|\d+-\d+|\d+h|\d+m|\d+s|\d+d)$/i.test(text);
        if (hasLetters && !isSystemText && !comments.includes(text)) {
          comments.push(text);
        }
      }
    }

    return comments;
  }

  /**
   * Extract the first audience comment on the video.
   */
  function extractFirstAudienceComment(container) {
    const list = extractAudienceComments(container, 1);
    return list.length > 0 ? list[0] : null;
  }

  /**
   * Check if comments are disabled for the active video.
   */
  function areCommentsDisabled(container) {
    // If comment input is already present in DOM, comments are definitely NOT disabled!
    if (hasCommentInput()) {
      return false;
    }

    const root = container || getActiveVideoContainer() || document;
    if (root.querySelector) {
      const disabledSelectors = [
        '[data-e2e="comment-disabled-message"]',
        'div[class*="DivCommentDisabled"]',
        'div[class*="CommentDisabledNotice"]',
        'p[class*="PDisabledNotice"]'
      ];

      for (const selector of disabledSelectors) {
        if (root.querySelector(selector) || document.querySelector(selector)) {
          return true;
        }
      }

      // Check text indicators in comment section
      const commentPanels = document.querySelectorAll('[class*="DivCommentContainer"], [class*="DivCommentListContainer"]');
      for (const panel of commentPanels) {
        const text = (panel.textContent || "").toLowerCase();
        if (text.includes("tác giả đã tắt bình luận") || text.includes("comments are turned off") || text.includes("comments have been disabled")) {
          return true;
        }
      }

      const commentBtn = (root.querySelector && root.querySelector('[data-e2e="comment-icon"]')) ||
                         document.querySelector('[data-e2e="comment-icon"]');
      if (commentBtn && commentBtn.getAttribute("aria-disabled") === "true") {
        return true;
      }
    }
    return false;
  }

  /**
   * Ensure comment section is opened on TikTok Web.
   * If already open or available in DOM, returns immediately without clicking comment-icon (which would toggle it closed).
   */
  async function ensureCommentSectionOpen(container) {
    // 1. If editor or comment-input is already found in DOM, return immediately!
    let editor = findCommentEditor();
    if (editor) {
      return editor;
    }

    // 2. If comment sidebar is already mounted in DOM, wait briefly for Draft.js to hydrate
    const commentSidebar = document.querySelector(
      'section[class*="SectionCommentSidebarContainer"], div[class*="DivCommentMain"], div[class*="DivCommentContainer"], aside[class*="AsideOneColumnSidebar"]'
    );
    if (commentSidebar) {
      for (let i = 0; i < 15; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        editor = findCommentEditor();
        if (editor) return editor;
      }
      return findCommentEditor() || document.querySelector('[data-e2e="comment-input"]');
    }

    // 3. Only click comment icon if neither editor nor sidebar is present in DOM
    const root = container || getActiveVideoContainer() || document;
    const commentBtn = (root.querySelector && root.querySelector('[data-e2e="comment-icon"]')) ||
                       document.querySelector('[data-e2e="comment-icon"]');

    if (commentBtn) {
      const clickable = commentBtn.querySelector("button") || commentBtn;
      clickable.click();
    }

    // Wait up to 2.5s for editor to appear and become visible in DOM
    const maxAttempts = 25;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      editor = findCommentEditor();
      if (editor) {
        return editor;
      }
    }

    return findCommentEditor() || document.querySelector('[data-e2e="comment-input"]');
  }

  /**
   * Dynamically wait for audience comments to load into DOM from TikTok network/API (up to maxWaitMs).
   * Polls every 200ms and returns as soon as comments appear, or stops if empty state is reached.
   */
  async function waitForAudienceComments(container, maxWaitMs = 3000) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      const comments = extractAudienceComments(container, 5);
      if (comments.length > 0) {
        return comments;
      }
      // Check if TikTok finished fetching and displays an empty comment state
      const emptyIndicator = document.querySelector('[data-e2e="comment-empty"], div[class*="DivEmptyContainer"], p[class*="PEmpty"]');
      if (emptyIndicator) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    return extractAudienceComments(container, 5);
  }

  /**
   * Dynamically wait for existing comments list to load (up to maxWaitMs).
   */
  async function waitForExistingComments(maxWaitMs = 2500) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      const comments = extractExistingComments();
      if (comments.length > 0) {
        return comments;
      }
      const emptyIndicator = document.querySelector('[data-e2e="comment-empty"], div[class*="DivEmptyContainer"]');
      if (emptyIndicator) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    return extractExistingComments();
  }

  /**
   * Safely type or paste text into Draft.js div[contenteditable="true"] without breaking React Virtual DOM.
   *
   * Note on Draft.js & React:
   * Direct DOM mutation (e.g. textNode.textContent = text) corrupts React Fiber reconciliation
   * and causes unhandled React exceptions ("removeChild on Node") which crash the TikTok web app.
   * Instead, we use synthetic ClipboardEvent ('paste' with DataTransfer) which Draft.js natively
   * handles via editOnPaste -> Modifier.replaceText -> EditorState update.
   */
  async function fillDraftEditor(editor, text) {
    if (!editor) return false;

    // Step 1: Scroll editor into view gently if needed
    try {
      editor.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } catch {
      // Ignore scroll errors
    }

    // Step 2: Focus and click the input container and editor
    const container = editor.closest('[data-e2e="comment-input"]') || editor;
    try {
      container.click();
    } catch {}
    editor.focus();
    try {
      editor.click();
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Step 3: Position cursor at end of editor
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (selErr) {
      console.warn("[TikTok Auto Interaction] Selection adjustment warning:", selErr);
    }

    // Step 4: Primary method - Synthetic ClipboardEvent 'paste' with DataTransfer
    // Draft.js intercepts the 'paste' event via editOnPaste and updates internal EditorState cleanly.
    let pastedSuccess = false;
    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.setData("text/plain", text);
      const pasteEvent = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer
      });
      pastedSuccess = editor.dispatchEvent(pasteEvent);
    } catch (pasteErr) {
      console.warn("[TikTok Auto Interaction] Paste event dispatch warning:", pasteErr);
    }

    await new Promise((resolve) => setTimeout(resolve, 120));

    // Step 5: Secondary method - document.execCommand('insertText') if paste didn't populate
    const currentText = (editor.textContent || "").trim();
    if (!currentText.includes(text.trim())) {
      try {
        editor.focus();
        document.execCommand("selectAll", false, null);
        document.execCommand("insertText", false, text);
      } catch (cmdErr) {
        console.warn("[TikTok Auto Interaction] execCommand insertText warning:", cmdErr);
      }
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    // Step 6: Tertiary method - beforeinput & input events
    const afterCmdText = (editor.textContent || "").trim();
    if (!afterCmdText.includes(text.trim())) {
      try {
        editor.dispatchEvent(
          new InputEvent("beforeinput", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: text
          })
        );
        editor.dispatchEvent(
          new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: text
          })
        );
      } catch (inputErr) {
        console.warn("[TikTok Auto Interaction] InputEvent warning:", inputErr);
      }
    }

    // Step 7: Fire standard input / change events to ensure all React state updates propagate
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editor.dispatchEvent(new Event("change", { bubbles: true }));

    // IMPORTANT: Under no circumstances do we directly assign editor.textContent = text
    // to preserve React's Virtual DOM integrity and prevent TikTok page crashes.

    return true;
  }

  /**
   * Wait for comment post button to become enabled and click it.
   */
  async function submitComment(autoSubmit = true) {
    if (!autoSubmit) {
      return {
        success: true,
        code: "TEXT_FILLED",
        message: "Đã điền nội dung bình luận vào ô. Hãy kiểm tra và nhấn gửi."
      };
    }

    const postBtnSelectors = [
      'button[data-e2e="comment-post"]',
      'button[data-key-interaction="comment_submit"]',
      'button[class*="ArrowPostButton"]',
      'button[aria-label="Đăng"]',
      'button[aria-label="Post"]'
    ];

    function findPostBtn() {
      for (const sel of postBtnSelectors) {
        const el = document.querySelector(sel);
        if (el) return el;
      }
      return null;
    }

    let postBtn = findPostBtn();
    if (!postBtn) {
      return {
        success: false,
        code: "NO_POST_BUTTON",
        message: "Không tìm thấy nút gửi bình luận."
      };
    }

    // Wait up to 3 seconds (30 * 100ms) for button to become enabled by React
    const maxRetries = 30;
    let isEnabled = false;

    for (let i = 0; i < maxRetries; i++) {
      postBtn = findPostBtn();
      if (postBtn) {
        const disabledAttr = postBtn.getAttribute("disabled");
        const ariaDisabled = postBtn.getAttribute("aria-disabled");
        if (!postBtn.disabled && disabledAttr === null && ariaDisabled !== "true") {
          isEnabled = true;
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // If still disabled after polling, re-trigger an input event on editor
    if (!isEnabled) {
      const editor =
        findCommentEditor() ||
        document.querySelector('[data-e2e="comment-input"] [contenteditable="true"]') ||
        document.querySelector('div[contenteditable="true"][role="textbox"]');
      if (editor) {
        editor.focus();
        editor.dispatchEvent(new Event("input", { bubbles: true }));
      }
      await new Promise((resolve) => setTimeout(resolve, 200));

      postBtn = findPostBtn();
      if (postBtn) {
        const disabledAttr = postBtn.getAttribute("disabled");
        const ariaDisabled = postBtn.getAttribute("aria-disabled");
        isEnabled = !postBtn.disabled && disabledAttr === null && ariaDisabled !== "true";
      }
    }

    if (isEnabled && postBtn) {
      // Small natural delay before clicking
      await new Promise((resolve) => setTimeout(resolve, 150));
      postBtn.click();
      return {
        success: true,
        code: "POSTED",
        message: "Đã đăng bình luận thành công!"
      };
    }

    // If button is still disabled, notify user peacefully without erroring out
    return {
      success: true,
      code: "TEXT_FILLED",
      message: "Đã điền nội dung bình luận vào ô. Hãy kiểm tra và bấm nút Gửi trên TikTok."
    };
  }

  /**
   * Main flow to post a comment into TikTok video.
   */
  async function handlePostComment(text, autoSubmit = true) {
    const container = getActiveVideoContainer();

    if (areCommentsDisabled(container)) {
      return {
        success: false,
        code: "COMMENTS_DISABLED",
        message: "Video này đã tắt tính năng bình luận."
      };
    }

    const editor = await ensureCommentSectionOpen(container);
    if (!editor) {
      return {
        success: false,
        code: "NO_EDITOR_FOUND",
        message: "Không thể mở khung soạn thảo bình luận TikTok."
      };
    }

    const filled = await fillDraftEditor(editor, text);
    if (!filled) {
      return {
        success: false,
        code: "FILL_FAILED",
        message: "Không thể điền nội dung vào ô bình luận."
      };
    }

    return await submitComment(autoSubmit);
  }

  /**
   * Helper to compute a unique signature/fingerprint of a video container
   * based on scroll index, element ID, author URL, description snippet, and video source.
   */
  function getVideoSignature(container) {
    if (!container) return null;
    const scrollIndex = container.getAttribute("data-scroll-index");
    const id = container.id || "";
    const video = container.querySelector("video");
    const videoSrc = video ? (video.currentSrc || video.src || "") : "";
    const desc = container.querySelector('[data-e2e^="desc-span"], [data-e2e="video-desc"]');
    const descText = desc ? (desc.textContent || "").slice(0, 40) : "";
    const authorLink = container.querySelector('a[href*="/@"]');
    const author = authorLink ? authorLink.getAttribute("href") : "";
    return `${scrollIndex || ""}:${id}:${author}:${descText}:${videoSrc}`;
  }

  /**
   * Wait until the active video container and its interactive controls (like button, comment button/editor)
   * are fully mounted, settled in the viewport, and ready for interaction.
   * Dynamically adapts to fast or slow network / device loading speeds.
   */
  async function waitForActiveVideoReady(previousSignature = null, maxTimeout = 8000) {
    const startTime = Date.now();
    console.log(`[TikTok Auto Interaction] Waiting for active video ready (timeout: ${maxTimeout}ms)...`);

    while (Date.now() - startTime < maxTimeout) {
      const container = getActiveVideoContainer();
      if (container) {
        const currentSig = getVideoSignature(container);
        const hasSwitched = !previousSignature || currentSig !== previousSignature;

        if (hasSwitched) {
          // Check if the switched item is a Livestream session
          if (detectLivestream(container)) {
            console.log(`[TikTok Auto Interaction] Detected Livestream session in feed (Signature: ${currentSig})`);
            return {
              ready: true,
              isLivestream: true,
              signature: currentSig,
              durationMs: Date.now() - startTime,
              timedOut: false
            };
          }

          // 1. Verify like button is present in DOM
          const likeBtn = findLikeButton(container);

          // 2. Verify comment controls exist (either comment button, editor or disabled message)
          const hasCommentCtrl = !!container.querySelector('[data-e2e="comment-icon"], button[aria-label*="bình luận" i], button[aria-label*="comment" i]') ||
                                !!document.querySelector('[data-e2e="comment-input"]') ||
                                areCommentsDisabled(container);

          // 3. Verify video element is attached and has started or loaded metadata
          const videoEl = container.querySelector("video");
          const isVideoReady = !videoEl || videoEl.readyState >= 1 || !videoEl.paused || videoEl.currentTime > 0;

          if (likeBtn && hasCommentCtrl && isVideoReady) {
            console.log(`[TikTok Auto Interaction] Video and interactive controls ready in ${Date.now() - startTime}ms (Signature: ${currentSig})`);
            // Buffer 350ms for layout stability and rendering settlement
            await new Promise((r) => setTimeout(r, 350));
            return {
              ready: true,
              isLivestream: false,
              signature: currentSig,
              durationMs: Date.now() - startTime,
              timedOut: false
            };
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const fallbackContainer = getActiveVideoContainer();
    console.warn(`[TikTok Auto Interaction] Wait timeout reached (${maxTimeout}ms), proceeding with best-effort container.`);
    return {
      ready: Boolean(fallbackContainer),
      signature: getVideoSignature(fallbackContainer),
      durationMs: Date.now() - startTime,
      timedOut: true
    };
  }

  /**
   * Navigate to the next video in the TikTok feed (Feature 004).
   * Primary: click button[data-e2e="feed-navigation-next"]
   * Fallback: dispatch ArrowDown KeyboardEvent
   * Automatically waits until the next video and its buttons are ready (handling slow networks).
   */
  async function navigateNextVideo(timeout = 8000) {
    const prevContainer = getActiveVideoContainer();
    const prevSig = getVideoSignature(prevContainer);

    // 1. Try finding TikTok feed next navigation button
    const nextSelectors = [
      'button[data-e2e="feed-navigation-next"]',
      'button[data-key-interaction="feed_nav_next"]',
      'button[aria-label*="tiếp"]',
      'button[aria-label*="next" i]'
    ];

    let navigationTriggered = false;
    let methodUsed = "button";

    for (const sel of nextSelectors) {
      const btn = document.querySelector(sel);
      if (btn) {
        const isDisabled = btn.getAttribute("aria-disabled") === "true" || btn.disabled;
        if (!isDisabled) {
          btn.click();
          navigationTriggered = true;
          methodUsed = "button";
          console.log("[TikTok Auto Interaction] Navigated next video via button click.");
          break;
        }
      }
    }

    // 2. Fallback: Dispatch ArrowDown keyboard event
    if (!navigationTriggered) {
      try {
        const keydownEvent = new KeyboardEvent("keydown", {
          key: "ArrowDown",
          code: "ArrowDown",
          keyCode: 40,
          which: 40,
          bubbles: true,
          cancelable: true
        });
        const keyupEvent = new KeyboardEvent("keyup", {
          key: "ArrowDown",
          code: "ArrowDown",
          keyCode: 40,
          which: 40,
          bubbles: true,
          cancelable: true
        });

        const target = document.activeElement || document.body || document;
        target.dispatchEvent(keydownEvent);
        target.dispatchEvent(keyupEvent);

        navigationTriggered = true;
        methodUsed = "keyboard";
        console.log("[TikTok Auto Interaction] Navigated next video via ArrowDown key event.");
      } catch (err) {
        console.error("[TikTok Auto Interaction] Error navigating next video:", err);
      }
    }

    if (!navigationTriggered) {
      return {
        success: false,
        code: "END_OF_FEED",
        message: "Không tìm thấy video tiếp theo hoặc đã đến cuối danh sách."
      };
    }

    // 3. Intelligently wait until the new video and its controls are ready in DOM
    const waitResult = await waitForActiveVideoReady(prevSig, timeout);

    return {
      success: true,
      code: "NAVIGATED",
      methodUsed: methodUsed,
      ready: waitResult.ready,
      durationMs: waitResult.durationMs,
      timedOut: waitResult.timedOut,
      message: "Đã chuyển sang video tiếp theo và các nút điều khiển đã sẵn sàng!"
    };
  }

  // ==========================================
  // RUNTIME MESSAGE ROUTER
  // ==========================================
  const messageHandler = (request, sender, sendResponse) => {
    // 1. Like Video
    if (request.action === "LIKE_ACTIVE_VIDEO") {
      const result = handleLikeVideo(request.method || "auto");
      sendResponse(result);
      return true;
    }

    // 2. Check Status
    if (request.action === "CHECK_TIKTOK_STATUS") {
      const container = getActiveVideoContainer();
      const likeBtn = findLikeButton(container);
      sendResponse({
        isReady: true,
        version: SCRIPT_VERSION,
        hasActiveVideo: Boolean(container),
        isLiked: likeBtn ? isAlreadyLiked(likeBtn) : false
      });
      return true;
    }

    // 2b. Follow Creator of Active Video
    if (request.action === "FOLLOW_CREATOR") {
      const result = handleFollowCreator(getActiveVideoContainer());
      sendResponse(result);
      return true;
    }

    // 3. Get Active Video Info (Feature 002, 003 & 004)
    if (request.action === "GET_ACTIVE_VIDEO_INFO") {
      (async () => {
        try {
          const container = getActiveVideoContainer();
          const isLive = detectLivestream(container);

          if (isLive) {
            console.log("[TikTok Auto Interaction] GET_ACTIVE_VIDEO_INFO detected Livestream, returning early.");
            sendResponse({
              success: true,
              isLivestream: true,
              hasDescription: false,
              description: "",
              rawDescription: "",
              hashtags: [],
              firstComment: null,
              audienceComments: [],
              existingComments: [],
              hasCommentBox: false,
              canComment: false
            });
            return;
          }

          const descInfo = extractVideoDescription(container);
          const disabled = areCommentsDisabled(container);

          let firstComment = null;
          let audienceComments = [];
          let existingComments = [];
          let hasCommentBox = hasCommentInput();

          if (!disabled) {
            let editor = findCommentEditor();
            if (!editor) {
              editor = await ensureCommentSectionOpen(container);
            }
            hasCommentBox = hasCommentInput() || Boolean(editor);

            audienceComments = extractAudienceComments(container, 5);
            existingComments = extractExistingComments();

            // If audienceComments not found or existing comments empty, try dynamic wait
            if (audienceComments.length === 0 || existingComments.length === 0) {
              if (audienceComments.length === 0) {
                audienceComments = await waitForAudienceComments(container, 3000);
              }
              if (existingComments.length === 0) {
                existingComments = await waitForExistingComments(2000);
              }
            }

            firstComment = (audienceComments && audienceComments.length > 0)
              ? audienceComments[0]
              : (existingComments.length > 0 ? existingComments[0] : null);

            // Re-verify comment input
            if (!hasCommentBox) {
              hasCommentBox = hasCommentInput();
            }
          }

          sendResponse({
            success: true,
            isLivestream: false,
            hasDescription: descInfo.hasDescription,
            description: descInfo.description,
            rawDescription: descInfo.rawDescription,
            hashtags: descInfo.hashtags,
            firstComment: firstComment,
            audienceComments: audienceComments || [],
            existingComments: existingComments,
            hasCommentBox: hasCommentBox,
            canComment: hasCommentBox && !disabled
          });
        } catch (err) {
          console.error("Error in GET_ACTIVE_VIDEO_INFO:", err);
          sendResponse({
            success: true,
            isLivestream: false,
            hasDescription: false,
            description: "",
            rawDescription: "",
            hashtags: [],
            firstComment: null,
            existingComments: [],
            hasCommentBox: false,
            canComment: false
          });
        }
      })();
      return true;
    }

    // 4. Post Comment (Feature 002)
    if (request.action === "POST_COMMENT") {
      handlePostComment(request.text, request.autoSubmit !== false).then((res) => {
        sendResponse(res);
      });
      return true;
    }

    // 5. Navigate to Next Video (Feature 004)
    if (request.action === "NAVIGATE_NEXT_VIDEO") {
      navigateNextVideo(request.timeout || 8000).then((result) => {
        sendResponse(result);
      });
      return true;
    }

    // 6. Wait for Active Video & Controls to be Ready
    if (request.action === "WAIT_FOR_VIDEO_READY") {
      waitForActiveVideoReady(request.previousSignature || null, request.timeout || 8000).then((result) => {
        sendResponse({ success: true, ...result });
      });
      return true;
    }
  };

  // Re-register listener cleanly to support script upgrades without tab refresh
  if (window.__TIKTOK_MESSAGE_LISTENER__) {
    chrome.runtime.onMessage.removeListener(window.__TIKTOK_MESSAGE_LISTENER__);
  }
  window.__TIKTOK_MESSAGE_LISTENER__ = messageHandler;
  chrome.runtime.onMessage.addListener(messageHandler);
})();
