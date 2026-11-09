/**
 * AI Comment Generator Module
 * Supports Google Gemini 1.5 Flash API with a rich Vietnamese smart fallback engine.
 */

const STYLE_PROMPTS = {
  friendly: "thân thiện, gần gũi, ấm áp",
  compliment: "khen ngợi, tích cực, truyền năng lượng",
  humorous: "hài hước, dí dỏm, vui nhộn",
  question: "tò mò, đặt câu hỏi gợi mở để người đăng trả lời"
};

const SMART_FALLBACK_DICTIONARY = {
  compliment: [
    "Dễ thương xỉu luôn á! 🥰",
    "Nội dung cuốn quá bạn ơi, mê ghê!",
    "Đỉnh chóp luôn, thả tim liền tay nè ❤️",
    "Xinh xắn rạng rỡ quá trời luôn!",
    "Video chất lượng ghê, chúc bạn ngày càng viral nha!"
  ],
  humorous: [
    "Haha coi đi coi lại vẫn buồn cười quá trớn 😂",
    "Pha xử lý đi vào lòng đất nhưng mà vui ghê 🤣",
    "Nhìn hài hước ghê á, cười xỉu luôn!",
    "Ủa rồi ai làm lại bạn nữa haha 😆",
    "10 điểm cho sự hài hước này nha!"
  ],
  friendly: [
    "Chúc bạn một ngày thật nhiều niềm vui và may mắn nha! ✨",
    "Video hay quá nè, theo dõi bạn lâu rồi á!",
    "Đồng cảm với bạn ghê, cố gắng lên nhé! 💕",
    "Năng lượng tích cực ghê, thích những video như này ghê á.",
    "Bình yên và nhẹ nhàng quá nè."
  ],
  question: [
    "Nhạc nền tên gì mà nghe cuốn thế bạn ơi?",
    "Quay ở đâu mà góc hình đẹp thế ạ?",
    "Bật mí bí quyết làm được như này đi bạn ơi! 🤔",
    "Bao giờ có phần tiếp theo vậy bạn?",
    "Xem cuốn quá, bạn có tips gì chia sẻ thêm không?"
  ]
};

const KEYWORD_MAP = [
  {
    keywords: ["nhảy", "dance", "vũ đạo", "nhún"],
    comments: ["Nhảy mượt mà dẻo dai quá bạn ơi! 💃", "Bắt beat chuẩn chỉnh luôn á! 🔥", "Xem mà muốn nhảy theo luôn nè haha!"]
  },
  {
    keywords: ["xinh", "đẹp", "dễ thương", "cute", "gái xinh"],
    comments: ["Nụ cười tỏa nắng luôn á bạn ơi! ✨", "Visual 10 điểm không có nhưng luôn nha 🥰", "Xinh xắn đáng yêu quá chừng!"]
  },
  {
    keywords: ["hài", "cười", "vui", "bựa", "troll"],
    comments: ["Cười đau cả bụng luôn á trời ơi 😂", "Pha này đỉnh quá haha 🤣", "Lướt trúng video giải trí xịn xò ghê!"]
  },
  {
    keywords: ["ăn", "food", "món", "ngon", "nấu"],
    comments: ["Nhìn ngon mắt xỉu luôn, thèm ghê á 🤤", "Địa chỉ ở đâu vậy bạn ơi, nhìn hấp dẫn quá!", "Đỉnh chóp, lưu lại đi thử liền mới được!"]
  },
  {
    keywords: ["chó", "mèo", "pet", "boss", "sen"],
    comments: ["Trời ơi boss cưng xỉu luôn á 🐶🐱", "Nhìn cưng quá trời, cho hun miếng nè!", "Đáng yêu thế này ai mà chịu nổi!"]
  },
  {
    keywords: ["đời", "tâm trạng", "buồn", "nghĩ", "suy nghĩ", "cảm xúc"],
    comments: ["Cuộc sống mà, cố gắng giữ tinh thần lạc quan nha bạn! 🍀", "Đồng cảm với bạn, mọi chuyện rồi sẽ ổn thôi nè.", "Nghĩ ít lại và yêu thương bản thân nhiều hơn nhé! 💖"]
  }
];

/**
 * Generate a smart fallback comment based on keywords and user-selected style.
 */
export function generateFallbackComment(description = "", style = "friendly") {
  const cleanDesc = (description || "").toLowerCase();

  // Check matching keyword themes first
  for (const item of KEYWORD_MAP) {
    if (item.keywords.some((kw) => cleanDesc.includes(kw))) {
      const idx = Math.floor(Math.random() * item.comments.length);
      return {
        success: true,
        text: item.comments[idx],
        source: "smart_fallback"
      };
    }
  }

  // Fallback to style dictionary
  const pool = SMART_FALLBACK_DICTIONARY[style] || SMART_FALLBACK_DICTIONARY.friendly;
  const idx = Math.floor(Math.random() * pool.length);
  return {
    success: true,
    text: pool[idx],
    source: "smart_fallback"
  };
}

/**
 * Rich pool of engaging generic comments for videos with NO caption and NO comments.
 */
export const GENERAL_FALLBACK_POOL = [
  "Video cuốn quá bạn ơi! ❤️",
  "Nội dung chất lượng xịn xò ghê!",
  "Hay và ý nghĩa lắm nè ✨",
  "Xem đi xem lại vẫn thấy mê nha!",
  "Đỉnh chóp luôn, thả tim ủng hộ bạn nhé! 🥰",
  "Lướt trúng video năng lượng tích cực ghê!",
  "10 điểm cho video này nha! 🔥",
  "Tuyệt vời quá bạn ơi, hóng các video tiếp theo!",
  "Coi cuốn không dứt ra được luôn á haha!",
  "Chúc kênh ngày càng phát triển và viral nha! 🍀",
  "Góc quay và nhạc nền đỉnh thật sự!",
  "Quá xuất sắc luôn bạn ơi 💕",
  "Thích nét tự nhiên của bạn ghê á!",
  "Xem giải trí và thư giãn ghê nè!",
  "Đỉnh cao luôn, lưu video lại liền tay! 👏",
  "Cute xỉu luôn á trời ơi! ✨"
];

/**
 * Get a random general engaging comment when video has no description and no comments.
 */
export function getRandomGeneralComment() {
  const idx = Math.floor(Math.random() * GENERAL_FALLBACK_POOL.length);
  return {
    success: true,
    text: GENERAL_FALLBACK_POOL[idx],
    source: "random_general"
  };
}

/**
 * Test validity of a Gemini API key with a minimal request.
 * Returns { valid: boolean, error?: string, model?: string }
 */
export async function testGeminiApiKey(apiKey = "") {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: "Vui lòng nhập API Key trước khi kiểm tra." };
  }

  const cleanKey = apiKey.trim();
  const models = ['gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3-flash-preview',
    'gemini-3.5-flash-lite'];

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "ping" }] }],
          generationConfig: { maxOutputTokens: 1 }
        })
      });

      if (response.ok) {
        return { valid: true, model: model };
      }

      const errData = await response.json().catch(() => null);
      const errMsg = errData?.error?.message || response.statusText;

      // If invalid key or permission denied, no need to retry another model
      if (response.status === 400 || response.status === 403) {
        return {
          valid: false,
          error: `API Key không hợp lệ hoặc không có quyền truy cập (${response.status}: ${errMsg || "API_KEY_INVALID"}).`
        };
      }

      if (response.status === 429) {
        return {
          valid: false,
          error: `Đã vượt quá hạn mức yêu cầu miễn phí của Gemini (HTTP 429 Quota Exceeded).`
        };
      }

      // If 404, loop will try next model
    } catch (networkErr) {
      return {
        valid: false,
        error: `Lỗi kết nối mạng: ${networkErr.message || "Không thể kết nối đến Google Gemini"}.`
      };
    }
  }

  return {
    valid: false,
    error: "Không tìm thấy model phù hợp hoặc API Key bị từ chối truy cập."
  };
}

/**
 * Generate a comment using Google Gemini REST API (with multi-model fallback & smart local fallback).
 */
export async function generateAIComment(description = "", style = "friendly", apiKey = "") {
  // If no API key is provided, use the smart fallback immediately
  if (!apiKey || !apiKey.trim()) {
    const fallback = generateFallbackComment(description, style);
    return {
      ...fallback,
      errorReason: null
    };
  }

  const cleanKey = apiKey.trim();
  const promptStyle = STYLE_PROMPTS[style] || STYLE_PROMPTS.friendly;
  const prompt = `Bạn là người dùng TikTok Việt Nam bình thường, trẻ trung, tự nhiên. Hãy tạo 1 câu bình luận tương tác cực kỳ ngắn gọn (dưới 15 từ, tiếng Việt) cho video có mô tả dưới đây. Phong cách: ${promptStyle}. Không dùng dấu ngoặc kép, không giải thích, chỉ trả về đúng câu bình luận.\n\nMô tả video: "${description || "Video thú vị trên TikTok"}"`;

  const models = ["gemini-1.5-flash", "gemini-2.0-flash"];
  let lastErrorReason = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 60,
            temperature: 0.8
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText && typeof rawText === "string") {
          let cleaned = rawText.trim().replace(/^["“”']|["“”']$/g, "").replace(/\n+/g, " ");
          if (cleaned.length > 0) {
            return {
              success: true,
              text: cleaned,
              source: "gemini",
              modelUsed: model,
              errorReason: null
            };
          }
        }
      }

      const errData = await response.json().catch(() => null);
      const errMsg = errData?.error?.message || response.statusText;

      if (response.status === 400 || response.status === 403) {
        lastErrorReason = `API Key không hợp lệ hoặc bị từ chối (${response.status}: ${errMsg || "API_KEY_INVALID"})`;
        break; // Do not retry other models if key is invalid
      } else if (response.status === 429) {
        lastErrorReason = `Vượt quá giới hạn lượt dùng Gemini miễn phí (HTTP 429 Quota Exceeded)`;
        break;
      } else {
        lastErrorReason = `Lỗi Gemini (${response.status}: ${errMsg})`;
      }
    } catch (networkError) {
      lastErrorReason = `Lỗi kết nối mạng: ${networkError.message || "Failed to fetch"}`;
      break;
    }
  }

  console.warn("[AI Generator] Gemini call failed, falling back to smart fallback:", lastErrorReason);
  const fallback = generateFallbackComment(description, style);
  return {
    ...fallback,
    errorReason: lastErrorReason
  };
}

