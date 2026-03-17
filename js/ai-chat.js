/* ========================================================
   AquaPool AI Chat Widget
   Self-contained — creates all DOM elements dynamically
   ======================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "aquapool_chat_history";
  var MAX_HISTORY = 50;

  // ─── SVG Icons ───
  var ICON_CHAT =
    '<svg class="ai-chat-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
    "</svg>";

  var ICON_CLOSE =
    '<svg class="ai-chat-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    "</svg>";

  var ICON_SEND =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>' +
    "</svg>";

  var ICON_ROBOT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="11" width="18" height="10" rx="2"/>' +
    '<circle cx="12" cy="5" r="2"/>' +
    '<path d="M12 7v4"/>' +
    '<line x1="8" y1="16" x2="8" y2="16"/>' +
    '<line x1="16" y1="16" x2="16" y2="16"/>' +
    "</svg>";

  var ICON_WAVES =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>' +
    '<path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>' +
    '<path d="M2 7c2-3 4-3 6 0s4 3 6 0 4-3 6 0" opacity="0.5"/>' +
    "</svg>";

  var ICON_CLOSE_SM =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    "</svg>";

  // ─── AI Knowledge Base ───
  var knowledgeBase = [
    {
      keywords: [
        "ahoj",
        "dobr\u00fd den",
        "\u010dau",
        "hey",
        "zdar",
        "zdrav\u00edm",
        "hej",
        "hall\u00f3",
        "dobr\u00e9 r\u00e1no",
        "dobr\u00fd ve\u010der",
      ],
      response:
        "Dobr\u00fd den! \ud83d\udc4b Jsem AquaPool asistent. Jak v\u00e1m mohu pomoci s baz\u00e9nem?",
    },
    {
      keywords: [
        "cena",
        "cen\u00edk",
        "kolik",
        "stoj\u00ed",
        "ceny",
        "cenou",
        "cenov",
        "drah",
        "levn",
      ],
      response:
        "Na\u0161e ceny za\u010d\u00ednaj\u00ed od 450 K\u010d/hod za servis baz\u00e9nu. S\u00e9z\u00f3nn\u00ed p\u0159\u00edprava od 1\u00a0600 K\u010d, zazimov\u00e1n\u00ed od 1\u00a0500 K\u010d, All In bal\u00ed\u010dek od 14\u00a0300 K\u010d. Kompletn\u00ed cen\u00edk najdete na na\u0161\u00ed str\u00e1nce Cen\u00edk. V\u0161echny ceny jsou bez DPH.",
    },
    {
      keywords: [
        "slu\u017eb",
        "servis",
        "\u010di\u0161t\u011bn",
        "cisteni",
        "\u00fadr\u017eb",
        "udrzb",
        "nab\u00edz",
        "co d\u011bl\u00e1te",
        "co um\u00edte",
      ],
      response:
        "Nab\u00edz\u00edme kompletní p\u00e9\u010di o baz\u00e9ny \u2014 \u010di\u0161t\u011bn\u00ed, odzimov\u00e1n\u00ed, zazimov\u00e1n\u00ed, pravideln\u00fd servis, zast\u0159e\u0161en\u00ed baz\u00e9n\u016f, a tak\u00e9 vodn\u00ed hospod\u00e1\u0159stv\u00ed (\u010cOV, j\u00edmky, reten\u010dn\u00ed n\u00e1dr\u017ee). Podrobnosti najdete na str\u00e1nce Slu\u017eby.",
    },
    {
      keywords: [
        "kontakt",
        "telefon",
        "email",
        "adresa",
        "zavolat",
        "napsat",
        "kde jste",
        "otev\u00edrac",
        "provozn\u00ed",
      ],
      response:
        "M\u016f\u017eete n\u00e1s kontaktovat na tel.: +420 600 000 000, email: info@example.cz, nebo n\u00e1s nav\u0161tivte: L\u00e1senice 181, 150 00. Provozn\u00ed doba: Po\u2013P\u00e1 8:00\u201318:00, So 9:00\u201314:00.",
    },
    {
      keywords: [
        "oblast",
        "region",
        "kde",
        "kam",
        "doj\u00ed\u017ed",
        "p\u016fsob",
        "jiho\u010desk",
        "vyso\u010din",
        "jind\u0159ich",
      ],
      response:
        "P\u016fsob\u00edme v Jiho\u010desk\u00e9m kraji a na Vyso\u010din\u011b. P\u0159\u00edjezd k z\u00e1kazn\u00edkovi \u00fa\u010dtujeme 20 K\u010d/km.",
    },
    {
      keywords: [
        "chemie",
        "poolchem",
        "p\u0159\u00edprav",
        "chlor",
        "pH",
        "dezinfek",
        "vod\u00ed",
        "kvalit",
      ],
      response:
        "Pou\u017e\u00edv\u00e1me v\u00fdhradn\u011b zna\u010dkovou baz\u00e9novou chemii PoolChem Pro pro nejlep\u0161\u00ed v\u00fdsledky a bezpe\u010dnost va\u0161\u00ed vody.",
    },
    {
      keywords: [
        "f\u00f3liov",
        "plastov",
        "baz\u00e9n na kl\u00ed\u010d",
        "nov\u00fd baz\u00e9n",
        "instalac",
        "stavba",
        "PP baz\u00e9n",
      ],
      response:
        "Nab\u00edz\u00edme jak servis st\u00e1vaj\u00edc\u00edch baz\u00e9n\u016f, tak instalaci nov\u00fdch \u2014 PP baz\u00e9ny na kl\u00ed\u010d, f\u00f3liov\u00e9 baz\u00e9ny, i zast\u0159e\u0161en\u00ed. Kontaktujte n\u00e1s pro individu\u00e1ln\u00ed nab\u00eddku.",
    },
    {
      keywords: [
        "\u010cOV",
        "\u010dist\u00edrna",
        "j\u00edmk",
        "septik",
        "n\u00e1dr\u017e",
        "reten\u010dn",
        "vodn\u00ed hospod",
        "vodoservis",
        "vodo",
        "\u0161acht",
      ],
      response:
        "Dod\u00e1v\u00e1me a instalujeme produkty vodn\u00edho hospod\u00e1\u0159stv\u00ed VodoServis \u2014 \u010cOV, j\u00edmky, septiky, reten\u010dn\u00ed n\u00e1dr\u017ee, vodom\u011brn\u00e9 \u0161achty. Ceny na dotaz.",
    },
    {
      keywords: [
        "odzimov",
        "p\u0159\u00edprav",
        "jaro",
        "s\u00e9z\u00f3n",
        "otev\u0159en\u00ed",
        "spust",
      ],
      response:
        "S\u00e9z\u00f3nn\u00ed p\u0159\u00edprava (odzimov\u00e1n\u00ed) baz\u00e9nu za\u010d\u00edn\u00e1 od 1\u00a0600 K\u010d. Zahrnuje \u010di\u0161t\u011bn\u00ed, kontrolu technologie a p\u0159\u00edpravu vody. Doporu\u010dujeme objednat v\u010das \u2014 jaro je na\u0161e nejru\u0161n\u011bj\u0161\u00ed obdob\u00ed!",
    },
    {
      keywords: [
        "zazimov",
        "zima",
        "zimn\u00ed",
        "uzav\u0159en\u00ed",
        "konec sez\u00f3ny",
      ],
      response:
        "Zazimov\u00e1n\u00ed baz\u00e9nu od 1\u00a0500 K\u010d. Zaji\u0161\u0165ujeme ochranu baz\u00e9nu p\u0159es zimn\u00ed m\u011bs\u00edce \u2014 vy\u010di\u0161t\u011bn\u00ed, o\u0161et\u0159en\u00ed chemii, zaji\u0161t\u011bn\u00ed technologie. Objednejte ide\u00e1ln\u011b v z\u00e1\u0159\u00ed\u2013\u0159\u00edjnu.",
    },
    {
      keywords: [
        "zast\u0159e\u0161en",
        "p\u0159\u00edst\u0159e\u0161",
        "kryt",
        "zakryt",
      ],
      response:
        "Nab\u00edz\u00edme r\u016fzn\u00e9 typy zast\u0159e\u0161en\u00ed baz\u00e9n\u016f pro prodlou\u017een\u00ed koupac\u00ed sez\u00f3ny a ochranu vody. Kontaktujte n\u00e1s pro individu\u00e1ln\u00ed nab\u00eddku.",
    },
    {
      keywords: [
        "tepeln\u00e9 \u010derpadlo",
        "oh\u0159ev",
        "teplota",
        "vyt\u00e1p",
        "topen\u00ed",
      ],
      response:
        "Zaji\u0161\u0165ujeme instalaci tepeln\u00fdch \u010derpadel pro oh\u0159ev baz\u00e9nov\u00e9 vody. D\u00edky nim m\u016f\u017eete komfortn\u011b vyu\u017e\u00edvat baz\u00e9n od jara do podzimu. R\u00e1di v\u00e1m porad\u00edme s v\u00fdb\u011brem.",
    },
    {
      keywords: [
        "d\u011bkuj",
        "d\u00edky",
        "dik",
        "d\u011bkuji",
        "super",
        "skv\u011bl",
        "par\u00e1da",
      ],
      response:
        "R\u00e1di jsme pomohli! \ud83d\ude0a Pokud budete m\u00edt dal\u0161\u00ed dotazy, nev\u00e1hejte se zeptat. P\u0159ejeme kr\u00e1sn\u00fd den!",
    },
  ];

  var fallbackResponse =
    "D\u011bkuji za v\u00e1\u0161 dotaz. Pro podrobn\u011bj\u0161\u00ed informace n\u00e1s pros\u00edm kontaktujte na tel. +420 600 000 000 nebo na info@example.cz. R\u00e1di v\u00e1m pom\u016f\u017eeme!";

  // ─── State ───
  var isOpen = false;
  var isTyping = false;
  var chatHistory = [];

  // ─── DOM References ───
  var bubble, panel, messagesArea, inputField, sendBtn, typingEl;

  // ─── Helpers ───
  function el(tag, className, innerHTML) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (innerHTML) node.innerHTML = innerHTML;
    return node;
  }

  function formatTime(date) {
    var d = date ? new Date(date) : new Date();
    return (
      d.getHours().toString().padStart(2, "0") +
      ":" +
      d.getMinutes().toString().padStart(2, "0")
    );
  }

  function normalize(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .trim();
  }

  function getAIResponse(userMessage) {
    var normalized = normalize(userMessage);

    for (var i = 0; i < knowledgeBase.length; i++) {
      var entry = knowledgeBase[i];
      for (var j = 0; j < entry.keywords.length; j++) {
        var kw = normalize(entry.keywords[j]);
        if (normalized.indexOf(kw) !== -1) {
          return entry.response;
        }
      }
    }

    return fallbackResponse;
  }

  // ─── Storage ───
  function loadHistory() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        chatHistory = JSON.parse(data);
        if (!Array.isArray(chatHistory)) chatHistory = [];
        if (chatHistory.length > MAX_HISTORY) {
          chatHistory = chatHistory.slice(-MAX_HISTORY);
        }
      }
    } catch (e) {
      chatHistory = [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
    } catch (e) {
      /* quota exceeded — silent fail */
    }
  }

  // ─── Build DOM ───
  function buildWidget() {
    // Bubble button
    bubble = el("button", "ai-chat-bubble");
    bubble.setAttribute("aria-label", "Otev\u0159\u00edt chat s asistentem");
    bubble.setAttribute("type", "button");
    bubble.innerHTML = ICON_CHAT + ICON_CLOSE;
    bubble.addEventListener("click", toggleChat);

    // Panel
    panel = el("div", "ai-chat-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "AquaPool Asistent chat");

    // Header
    var header = el("div", "ai-chat-header");
    var headerIcon = el("div", "ai-chat-header-icon", ICON_WAVES);
    var headerInfo = el("div", "ai-chat-header-info");
    var headerTitle = el("div", "ai-chat-header-title", "AquaPool Asistent");
    var headerStatus = el("div", "ai-chat-header-status", "Online");
    headerInfo.appendChild(headerTitle);
    headerInfo.appendChild(headerStatus);
    var closeBtn = el("button", "ai-chat-close-btn", ICON_CLOSE_SM);
    closeBtn.setAttribute("aria-label", "Zav\u0159\u00edt chat");
    closeBtn.setAttribute("type", "button");
    closeBtn.addEventListener("click", toggleChat);
    header.appendChild(headerIcon);
    header.appendChild(headerInfo);
    header.appendChild(closeBtn);

    // Messages area
    messagesArea = el("div", "ai-chat-messages");

    // Input area
    var inputArea = el("div", "ai-chat-input-area");
    inputField = el("input", "ai-chat-input");
    inputField.setAttribute("type", "text");
    inputField.setAttribute("placeholder", "Napište svůj dotaz...");
    inputField.setAttribute("autocomplete", "off");
    inputField.setAttribute("maxlength", "500");
    inputField.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    sendBtn = el("button", "ai-chat-send-btn", ICON_SEND);
    sendBtn.setAttribute("aria-label", "Odeslat zpr\u00e1vu");
    sendBtn.setAttribute("type", "button");
    sendBtn.addEventListener("click", handleSend);
    inputArea.appendChild(inputField);
    inputArea.appendChild(sendBtn);

    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(messagesArea);
    panel.appendChild(inputArea);

    // Add to document
    document.body.appendChild(panel);
    document.body.appendChild(bubble);
  }

  // ─── Render Messages ───
  function renderWelcome() {
    var welcome = el("div", "ai-chat-welcome");
    var wIcon = el("div", "ai-chat-welcome-icon", ICON_WAVES);
    var wTitle = el(
      "div",
      "ai-chat-welcome-title",
      "Ahoj! Jsem v\u00e1\u0161 AquaPool asistent."
    );
    var wText = el(
      "div",
      "ai-chat-welcome-text",
      "Zeptejte se mě na cokoliv ohledně služeb, cen nebo dostupnosti."
    );
    welcome.appendChild(wIcon);
    welcome.appendChild(wTitle);
    welcome.appendChild(wText);

    // Quick action buttons
    var quickActions = el("div", "ai-chat-quick-actions");
    var actions = [
      { label: "Cen\u00edk", text: "Kolik stoj\u00ed servis baz\u00e9nu?" },
      { label: "Slu\u017eby", text: "Jak\u00e9 slu\u017eby nab\u00edz\u00edte?" },
      { label: "Kontakt", text: "Jak v\u00e1s mohu kontaktovat?" },
      { label: "Oblast", text: "Kde p\u016fsob\u00edte?" },
    ];
    for (var i = 0; i < actions.length; i++) {
      (function (action) {
        var btn = el("button", "ai-chat-quick-btn", action.label);
        btn.setAttribute("type", "button");
        btn.addEventListener("click", function () {
          sendMessage(action.text);
        });
        quickActions.appendChild(btn);
      })(actions[i]);
    }

    messagesArea.appendChild(welcome);
    messagesArea.appendChild(quickActions);
  }

  function renderHistory() {
    messagesArea.innerHTML = "";
    renderWelcome();

    for (var i = 0; i < chatHistory.length; i++) {
      var msg = chatHistory[i];
      appendMessageDOM(msg.role, msg.text, msg.time, false);
    }
    scrollToBottom();
  }

  function appendMessageDOM(role, text, time, animate) {
    var msgClass = role === "user" ? "ai-chat-msg-user" : "ai-chat-msg-ai";
    var msgEl = el("div", "ai-chat-msg " + msgClass, text);
    if (animate === false) {
      msgEl.style.animation = "none";
    }
    messagesArea.appendChild(msgEl);

    var timeEl = el("div", "ai-chat-time", formatTime(time));
    if (role === "user") timeEl.style.textAlign = "right";
    messagesArea.appendChild(timeEl);
  }

  function showTyping() {
    if (typingEl) return;
    isTyping = true;
    typingEl = el("div", "ai-chat-typing");
    for (var i = 0; i < 3; i++) {
      typingEl.appendChild(el("div", "ai-chat-typing-dot"));
    }
    messagesArea.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTyping() {
    isTyping = false;
    if (typingEl && typingEl.parentNode) {
      typingEl.parentNode.removeChild(typingEl);
    }
    typingEl = null;
  }

  function scrollToBottom() {
    requestAnimationFrame(function () {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    });
  }

  // ─── Send Message ───
  function sendMessage(text) {
    if (!text || !text.trim() || isTyping) return;
    var trimmed = text.trim();

    // Add user message
    var userMsg = { role: "user", text: trimmed, time: new Date().toISOString() };
    chatHistory.push(userMsg);
    appendMessageDOM("user", trimmed, userMsg.time, true);
    saveHistory();
    scrollToBottom();

    // Clear input
    inputField.value = "";
    inputField.focus();

    // Show typing indicator
    showTyping();

    // Simulate AI response with delay
    var delay = 500 + Math.random() * 500;
    setTimeout(function () {
      hideTyping();

      var response = getAIResponse(trimmed);
      var aiMsg = { role: "ai", text: response, time: new Date().toISOString() };
      chatHistory.push(aiMsg);
      appendMessageDOM("ai", response, aiMsg.time, true);
      saveHistory();
      scrollToBottom();
    }, delay);
  }

  function handleSend() {
    sendMessage(inputField.value);
  }

  // ─── Toggle Chat ───
  function toggleChat() {
    isOpen = !isOpen;

    if (isOpen) {
      panel.classList.add("ai-chat-panel-open");
      bubble.classList.add("ai-chat-open");
      bubble.setAttribute(
        "aria-label",
        "Zav\u0159\u00edt chat s asistentem"
      );
      inputField.focus();
      scrollToBottom();
    } else {
      panel.classList.remove("ai-chat-panel-open");
      bubble.classList.remove("ai-chat-open");
      bubble.setAttribute(
        "aria-label",
        "Otev\u0159\u00edt chat s asistentem"
      );
    }
  }

  // ─── Close on Escape ───
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) {
      toggleChat();
    }
  });

  // ─── Initialize ───
  function init() {
    loadHistory();
    buildWidget();
    renderHistory();
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
