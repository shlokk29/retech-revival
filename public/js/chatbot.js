/* ═══════════════════════════════════════════════════════════════
   ReTech Revival – AI Chatbot Engine
   Smart, context-aware assistant for the marketplace
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Knowledge Base ─────────────────────────────────────────
  const KB = {
    warranty: {
      keywords: ['warranty', 'guarantee', 'covered', 'protection', 'damage', 'repair'],
      answer: `All our devices come with a **free warranty**:\n• **Like New** & **Excellent** condition → **6 months** comprehensive warranty\n• **Good** condition → **3 months** warranty\n• MacBook Pro 16" M3 Max → **12 months** premium warranty\n\nWarranty covers manufacturing defects, hardware failures, and battery issues. Accidental damage is not covered.`
    },
    returns: {
      keywords: ['return', 'refund', 'money back', 'exchange', 'cancel', 'cancellation'],
      answer: `We offer a **30-day no-questions-asked return policy**! 🎉\n\n• Full refund within 30 days of delivery\n• Free return shipping — we'll pick it up from your doorstep\n• Refund processed within 3-5 business days\n• Exchange available for a different device if you prefer`
    },
    delivery: {
      keywords: ['delivery', 'shipping', 'ship', 'deliver', 'when will', 'how long', 'track', 'dispatch'],
      answer: `📦 **Free doorstep delivery** on all orders!\n\n• Standard delivery: **3 business days**\n• All devices are carefully packed in protective packaging\n• You'll receive a tracking link via email/SMS\n• Delivery available across India`
    },
    selling: {
      keywords: ['sell', 'selling', 'quote', 'estimate', 'trade in', 'buy my', 'sell my', 'old laptop', 'exchange my', 'how to sell', 'how do i sell'],
      answer: `Want to sell your old laptop? Here's how it works:\n\n1️⃣ **Get Instant Quote** — Use our [Price Estimator](/sell.html) for a real-time valuation\n2️⃣ **Schedule Free Pickup** — We come to your door\n3️⃣ **Get Paid in 48 Hours** — After quality inspection\n\nWe accept laptops from all major brands. [Get your quote now →](/sell.html)`
    },
    pricing: {
      keywords: ['price', 'cost', 'how much', 'expensive', 'cheap', 'affordable', 'budget', 'discount', 'offer', 'deal'],
      answer: `Our prices are **40-60% lower** than brand new! 💰\n\n• Budget-friendly picks start from **₹31,000** (Acer Swift 5)\n• Premium devices like MacBook Pro M3 Max at **₹2,09,999** (save ₹1,39,001!)\n• All prices are transparent — no hidden fees\n\nBrowse our full catalog: [Shop Now →](/catalog.html)`
    },
    payment: {
      keywords: ['payment', 'pay', 'upi', 'card', 'emi', 'installment', 'cod', 'cash on delivery', 'payment method'],
      answer: `We support multiple payment options:\n\n• 💳 Credit/Debit Cards (Visa, Mastercard, RuPay)\n• 📱 UPI (GPay, PhonePe, Paytm)\n• 🏦 Net Banking\n• 💰 EMI options available on select banks\n• 🔒 All payments are encrypted & secure`
    },
    quality: {
      keywords: ['quality', 'inspection', 'tested', 'certif', 'condition', 'like new', 'excellent', 'good', 'refurbish', 'reliable'],
      answer: `Every device passes our **50-point quality inspection** ✅\n\n• **Like New** — Virtually indistinguishable from new. Minor cosmetic marks if any\n• **Excellent** — Minimal signs of use. Fully functional\n• **Good** — Some cosmetic wear. Completely functional\n\nOur certified engineers test battery, display, keyboard, ports, and internals before listing.`
    },
    brands: {
      keywords: ['brand', 'apple', 'dell', 'lenovo', 'hp', 'asus', 'acer', 'microsoft', 'razer', 'which brand', 'best brand'],
      answer: `We carry premium brands including:\n\n🍎 **Apple** — MacBook Air M1, MacBook Pro M2/M3\n💻 **Dell** — XPS 13, Latitude series\n🖥️ **Lenovo** — ThinkPad X1, IdeaPad Gaming\n🔷 **HP** — Spectre x360, EliteBook\n🎮 **ASUS** — ROG Zephyrus G14\n⚡ **Razer** — Blade 15\n📱 **Microsoft** — Surface Pro 8\n🌐 **Acer** — Swift 5\n\n[Browse by brand →](/catalog.html)`
    },
    gaming: {
      keywords: ['gaming', 'game', 'gamer', 'fps', 'rtx', 'gpu', 'graphics', 'rog', 'razer', 'play'],
      answer: `Looking for a gaming beast? 🎮 We've got you covered:\n\n• **ASUS ROG Zephyrus G14** — Ryzen 9 + RTX 3060, 120Hz QHD — ₹68,000\n• **Razer Blade 15** — i9 + RTX 3070 Ti, 240Hz QHD — ₹1,10,000\n• **Lenovo IdeaPad Gaming 3** — Ryzen 5 + GTX 1650, 120Hz — ₹38,000 (budget pick!)\n\n[Browse Gaming Laptops →](/catalog.html)`
    },
    student: {
      keywords: ['student', 'college', 'school', 'study', 'education', 'learning', 'affordable for student', 'university'],
      answer: `Great options for students! 🎓\n\n• **Acer Swift 5** — Ultra-light at 990g, 9hr battery — ₹31,000\n• **MacBook Air M1** — All-day battery, fast & reliable — ₹62,999\n• **Lenovo ThinkPad X1 Carbon** — Durable, lightweight — ₹42,000\n\nAll come with free warranty and 30-day returns! [Shop Student Picks →](/catalog.html)`
    },
    about: {
      keywords: ['about', 'who are you', 'company', 'founded', 'team', 'retech', 'what is retech'],
      answer: `**Retech Revival** — *Tech Reborn. Value Restored.* ♻️\n\nWe're India's trusted refurbished laptop marketplace, founded by college students who believe premium tech shouldn't be a luxury.\n\n• 100% Certified Devices\n• 50-point Quality Inspection\n• Free Warranty + 30-day Returns\n• Sustainable: Each refurbished laptop saves ~40kg CO₂\n\n[Learn more →](/about.html)`
    },
    subscribe: {
      keywords: ['subscribe', 'subscription', 'rent', 'rental', 'monthly', 'lease'],
      answer: `🔔 **Laptop Subscription Plans** coming soon!\n\nGet a premium refurbished laptop on a monthly subscription — perfect for short-term projects, internships, or trying before you buy.\n\n[Check our subscription page →](/subscribe.html)`
    },
    contact: {
      keywords: ['contact', 'support', 'help', 'email', 'phone', 'call', 'reach', 'complaint'],
      answer: `📞 Need help? We're here for you!\n\n• **Email:** support@retechrevival.in\n• **Phone:** +91-9876-543-210\n• **Hours:** Mon–Sat, 9 AM – 7 PM IST\n• **Response time:** Within 2 hours\n\nOr just ask me anything right here! 😊`
    },
    greeting: {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'sup', 'yo', 'howdy', 'namaste'],
      answer: null // handled specially
    }
  };

  const GREETINGS = [
    "Hey there! 👋 Welcome to Retech Revival! I'm your AI assistant. How can I help you today?",
    "Hi! 😊 I'm ReTech AI — here to help you find the perfect refurbished laptop, answer questions about selling, or anything else!",
    "Hello! 👋 Great to see you! Whether you're looking to buy, sell, or just exploring — I'm here to help!",
  ];

  const FALLBACKS = [
    "Hmm, I'm not sure I understood that. Try asking about:\n• Our products & pricing\n• Warranty & returns\n• Selling your laptop\n• Delivery info\n\nOr type **\"help\"** to see what I can do!",
    "I didn't quite catch that 🤔 Could you rephrase? I can help with product search, pricing, warranty, returns, selling, and more!",
    "Sorry, I couldn't find an answer for that. Try asking something like *\"Show me gaming laptops\"* or *\"What's your warranty policy?\"*"
  ];

  const HELP_MSG = `Here's everything I can help you with! 🚀\n\n🛒 **Product Search** — "Show me Dell laptops", "Gaming laptops under 70k"\n💰 **Pricing** — "What's your cheapest laptop?"\n🛡️ **Warranty** — "What's covered under warranty?"\n📦 **Delivery** — "How fast is delivery?"\n🔄 **Returns** — "Can I return a product?"\n💵 **Selling** — "How do I sell my laptop?"\n💳 **Payments** — "What payment methods?"\n🎓 **Recommendations** — "Best laptop for students?"\n🏢 **About Us** — "Tell me about Retech"`;

  // ── DOM Construction ───────────────────────────────────────
  function buildChatUI() {
    // FAB
    const fab = document.createElement('button');
    fab.className = 'chatbot-fab';
    fab.id = 'chatbot-fab';
    fab.setAttribute('aria-label', 'Open AI Chat Assistant');
    fab.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
      </svg>
      <span class="notif-dot"></span>
    `;

    // Window
    const win = document.createElement('div');
    win.className = 'chatbot-window';
    win.id = 'chatbot-window';
    win.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-avatar">🤖</div>
        <div class="chatbot-header-info">
          <h4>ReTech AI Assistant</h4>
          <div class="status"><span class="online-dot"></span> Online • Instant replies</div>
        </div>
        <button class="chatbot-close" id="chatbot-close" aria-label="Close chat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages"></div>
      <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Ask me anything..." autocomplete="off" />
        <button class="chatbot-send" id="chatbot-send" aria-label="Send message">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <div class="chatbot-powered">Powered by <strong>ReTech AI</strong> • Smart Refurbished Tech Assistant</div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(win);

    return { fab, win };
  }

  // ── Helpers ────────────────────────────────────────────────
  function timeStr() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatMd(text) {
    // Simple markdown: bold, italic, links, line breaks
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_self">$1</a>')
      .replace(/\n/g, '<br>');
  }

  function formatPrice(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
  }

  // ── Chat Logic ─────────────────────────────────────────────
  let isOpen = false;
  let hasGreeted = false;
  let conversationHistory = [];

  function init() {
    const { fab, win } = buildChatUI();
    const messagesEl = document.getElementById('chatbot-messages');
    const inputEl = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const closeBtn = document.getElementById('chatbot-close');

    // Toggle chat
    fab.addEventListener('click', () => {
      isOpen = !isOpen;
      win.classList.toggle('visible', isOpen);
      fab.classList.toggle('open', isOpen);
      // Remove notification dot on first open
      const dot = fab.querySelector('.notif-dot');
      if (dot) dot.remove();

      if (isOpen && !hasGreeted) {
        hasGreeted = true;
        showWelcome(messagesEl);
      }
      if (isOpen) inputEl.focus();
    });

    closeBtn.addEventListener('click', () => {
      isOpen = false;
      win.classList.remove('visible');
      fab.classList.remove('open');
    });

    // Send message
    function handleSend() {
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      addUserMessage(messagesEl, text);
      processMessage(messagesEl, text);
    }

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  function showWelcome(container) {
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setTimeout(() => {
      addBotMessage(container, greeting, [
        "Show me laptops",
        "How to sell?",
        "Warranty info",
        "Best for students",
      ]);
    }, 500);
  }

  function addUserMessage(container, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg user';
    msgDiv.innerHTML = `
      <div class="msg-avatar">You</div>
      <div class="chat-bubble">
        ${escapeHtml(text)}
        <span class="msg-time">${timeStr()}</span>
      </div>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    conversationHistory.push({ role: 'user', text });
  }

  function addBotMessage(container, text, suggestions = [], productCards = '') {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg bot';

    let suggestionsHtml = '';
    if (suggestions.length) {
      suggestionsHtml = `<div class="chat-suggestions">
        ${suggestions.map(s => `<button class="chat-suggestion-btn" data-suggestion="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
      </div>`;
    }

    msgDiv.innerHTML = `
      <div class="msg-avatar">AI</div>
      <div class="chat-bubble">
        ${formatMd(text)}
        ${productCards}
        ${suggestionsHtml}
        <span class="msg-time">${timeStr()}</span>
      </div>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    conversationHistory.push({ role: 'bot', text });

    // Bind suggestion clicks
    msgDiv.querySelectorAll('.chat-suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sug = btn.getAttribute('data-suggestion');
        const inputEl = document.getElementById('chatbot-input');
        inputEl.value = sug;
        addUserMessage(container, sug);
        processMessage(container, sug);
      });
    });

    // Bind product card clicks
    msgDiv.querySelectorAll('.chat-product-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = card.getAttribute('data-href');
      });
    });
  }

  function showTyping(container) {
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.id = 'chatbot-typing';
    typing.innerHTML = `
      <div class="msg-avatar">AI</div>
      <div class="typing-dots"><span></span><span></span><span></span></div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('chatbot-typing');
    if (t) t.remove();
  }

  // ── Message Processing ─────────────────────────────────────
  async function processMessage(container, text) {
    const lower = text.toLowerCase().trim();

    showTyping(container);

    // Simulate AI thinking delay
    const delay = 600 + Math.random() * 800;

    // Check for "help"
    if (lower === 'help' || lower === 'commands' || lower === 'menu' || lower === 'what can you do') {
      setTimeout(() => {
        hideTyping();
        addBotMessage(container, HELP_MSG, ["Show me laptops", "Warranty info", "How to sell?"]);
      }, delay);
      return;
    }

    // Check for product search intent
    if (isProductSearch(lower)) {
      try {
        const products = await fetchProducts(lower);
        setTimeout(() => {
          hideTyping();
          if (products.length > 0) {
            const productHtml = products.slice(0, 3).map(p => `
              <div class="chat-product-card" data-href="/product.html?id=${p._id}">
                <img src="${p.images?.[0] || 'img/laptop2.png'}" onerror="this.src='img/laptop2.png'" alt="${escapeHtml(p.name)}">
                <div class="chat-product-info">
                  <div class="name">${escapeHtml(p.name)}</div>
                  <div class="specs">${escapeHtml(p.processor)} · ${escapeHtml(p.ram)}</div>
                  <div class="price">${formatPrice(p.price)} <span style="font-size:0.7rem;color:var(--text3);text-decoration:line-through;font-weight:400;margin-left:0.3rem">${formatPrice(p.originalPrice)}</span></div>
                </div>
              </div>
            `).join('');
            const msg = products.length === 1
              ? `I found **${products.length} device** matching your search:`
              : `Here are **${Math.min(products.length, 3)}** of **${products.length}** devices matching your search:`;
            addBotMessage(container, msg, ["View all products", "Show cheapest", "Show gaming laptops"], productHtml);
          } else {
            addBotMessage(container, "I couldn't find any products matching that search. Try different keywords or [browse our full catalog →](/catalog.html)", ["Show all laptops", "Best for students"]);
          }
        }, delay);
      } catch {
        setTimeout(() => {
          hideTyping();
          addBotMessage(container, "Sorry, I had trouble searching products. You can [browse our catalog directly →](/catalog.html)", ["Try again"]);
        }, delay);
      }
      return;
    }

    // Check knowledge base FIRST (specific matches take priority)
    const match = findBestMatch(lower);
    if (match) {
      setTimeout(() => {
        hideTyping();
        addBotMessage(container, match.answer, getSuggestions(match.key));
      }, delay);
      return;
    }

    // Check for greeting (use word-boundary matching to avoid false positives)
    const greetingMatch = KB.greeting.keywords.some(k => {
      const regex = new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      return regex.test(lower);
    });
    if (greetingMatch) {
      setTimeout(() => {
        hideTyping();
        const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
        addBotMessage(container, greeting, ["Show me laptops", "How to sell?", "Warranty info"]);
      }, delay);
      return;
    }

    // Fallback
    setTimeout(() => {
      hideTyping();
      const fallback = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
      addBotMessage(container, fallback, ["Help", "Show laptops", "Warranty info", "How to sell?"]);
    }, delay);
  }

  function findBestMatch(text) {
    let bestKey = null;
    let bestScore = 0;

    for (const [key, entry] of Object.entries(KB)) {
      if (key === 'greeting') continue;
      let score = 0;
      for (const kw of entry.keywords) {
        if (text.includes(kw)) {
          score += kw.length; // Longer keyword matches = higher relevance
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestKey = key;
      }
    }

    if (bestKey && bestScore > 0) {
      return { key: bestKey, answer: KB[bestKey].answer };
    }
    return null;
  }

  function getSuggestions(currentKey) {
    const suggestionMap = {
      warranty: ["Return policy", "Delivery info", "Show me laptops"],
      returns: ["Warranty info", "Contact support", "Show me laptops"],
      delivery: ["Return policy", "Payment methods", "Track my order"],
      selling: ["Get instant quote", "Show me laptops", "Pricing info"],
      pricing: ["Show cheapest laptop", "Best for students", "Gaming laptops"],
      payment: ["Delivery info", "Return policy", "Show me laptops"],
      quality: ["Warranty info", "Show me laptops", "Delivery info"],
      brands: ["Show Apple laptops", "Show Dell laptops", "Gaming laptops"],
      gaming: ["Show gaming laptops", "Best budget gaming", "Razer laptops"],
      student: ["Show budget laptops", "MacBook options", "Warranty info"],
      about: ["Show me laptops", "How to sell?", "Contact us"],
      subscribe: ["Show me laptops", "Pricing info", "About Retech"],
      contact: ["Warranty info", "Return policy", "Show me laptops"],
    };
    return suggestionMap[currentKey] || ["Show me laptops", "Help"];
  }

  // ── Product Search ─────────────────────────────────────────
  function isProductSearch(text) {
    const searchIndicators = [
      'show', 'find', 'search', 'looking for', 'laptop', 'macbook', 'thinkpad',
      'cheapest', 'best', 'under', 'above', 'device', 'product', 'catalog',
      'browse', 'list', 'available', 'in stock', 'xps', 'spectre', 'rog',
      'surface', 'swift', 'elitebook', 'ideapad', 'blade', 'view all',
      'all product', 'all laptop', 'show me'
    ];
    return searchIndicators.some(s => text.includes(s));
  }

  async function fetchProducts(query) {
    // Extract meaningful search terms
    let searchQuery = '';
    let sortParam = '';
    let maxPrice = '';

    // Brand extraction
    const brands = ['apple', 'dell', 'lenovo', 'hp', 'asus', 'acer', 'microsoft', 'razer'];
    const brandMatch = brands.find(b => query.includes(b));

    // Price extraction
    const priceMatch = query.match(/under\s*₹?\s*([\d,]+k?)/i) || query.match(/([\d,]+k?)\s*(?:budget|range)/i);
    if (priceMatch) {
      let price = priceMatch[1].replace(/,/g, '');
      if (price.endsWith('k')) price = parseInt(price) * 1000;
      maxPrice = `&maxPrice=${price}`;
    }

    // Sort extraction
    if (query.includes('cheapest') || query.includes('budget') || query.includes('affordable') || query.includes('lowest price')) {
      sortParam = '&sort=price_asc';
    } else if (query.includes('best') || query.includes('top') || query.includes('highest rated')) {
      sortParam = '&sort=rating';
    } else if (query.includes('expensive') || query.includes('premium') || query.includes('high end')) {
      sortParam = '&sort=price_desc';
    }

    // Category extraction
    if (query.includes('gaming') || query.includes('game')) {
      searchQuery = 'gaming';
    } else if (brandMatch) {
      searchQuery = brandMatch;
    } else if (query.includes('macbook')) {
      searchQuery = 'macbook';
    } else if (query.includes('ultrabook') || query.includes('thin') || query.includes('light')) {
      searchQuery = 'ultrabook';
    } else if (query.includes('business') || query.includes('enterprise') || query.includes('professional')) {
      searchQuery = 'business';
    }

    const url = `/api/products?q=${encodeURIComponent(searchQuery)}${sortParam}${maxPrice}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  }

  // ── Initialize ─────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
