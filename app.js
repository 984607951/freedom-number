(() => {
  'use strict';
  window.__FN_READY = false;

  const I18N = window.I18N;
  const LANGS = ['zh', 'en', 'ko', 'ja', 'fr', 'ru'];
  const LANG_CURRENCY = { zh: 'CNY', en: 'USD', ko: 'KRW', ja: 'JPY', fr: 'EUR', ru: 'RUB' };
  const CURRENCIES = {
    CNY: { rate: 1, symbol: '¥', label: 'CNY' },
    USD: { rate: 7.2, symbol: '$', label: 'USD' },
    EUR: { rate: 7.8, symbol: '€', label: 'EUR' },
    GBP: { rate: 9.2, symbol: '£', label: 'GBP' },
    JPY: { rate: 0.048, symbol: '¥', label: 'JPY' },
    KRW: { rate: 0.0052, symbol: '₩', label: 'KRW' },
    RUB: { rate: 0.078, symbol: '₽', label: 'RUB' }
  };
  const MONEY_KEYS = ['monthly', 'perChild', 'health', 'home', 'assets', 'savings'];
  const DEFAULT_CNY = {
    monthly: 8000, kids: 0, perChild: 580000, health: 300000, home: 0,
    assets: 100000, savings: 8000, age: 30, realReturn: 2.5
  };
  const TIER_THRESHOLDS = [1000000, 3000000, 6000000, 12000000];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
  const COLORS = { life: '#2f6bff', kids: '#ff6b57', health: '#2dd4bf', home: '#ffbd2e' };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const currentYear = new Date().getFullYear();

  const state = {
    lang: 'zh', currency: 'CNY', currencyTouched: false,
    monthly: 8000, kids: 0, perChild: 580000, health: 300000, home: 0,
    assets: 100000, savings: 8000, age: 30, realReturn: 2.5
  };

  const el = {};
  let currentResult = null;
  let planUi = { monthly: 8000 };
  let chartMeta = null;
  let shareBlob = null;
  let shareUrl = null;
  let lastFocus = null;
  let toastTimer = null;
  let saveTimer = null;
  let countRaf = 0;
  let scrollRaf = 0;
  let resultRefreshTimer = 0;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------------- utilities ---------------- */

  function safeStorageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeStorageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }
  function fill(str, vars = {}) {
    return String(str).replace(/\{(\w+)\}/g, (m, key) => Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : m);
  }
  function t(key, vars = {}) {
    const dict = I18N[state.lang] || I18N.zh;
    let value = dict[key];
    if (value === undefined) value = I18N.en[key];
    if (value === undefined) return key;
    return typeof value === 'string' ? fill(value, vars) : value;
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function smartRound(value) {
    if (!Number.isFinite(value)) return 0;
    if (value <= 0) return 0;
    if (value >= 100000000) return Math.round(value / 100000) * 100000;
    if (value >= 10000000) return Math.round(value / 10000) * 10000;
    if (value >= 1000000) return Math.round(value / 1000) * 1000;
    if (value >= 100000) return Math.round(value / 100) * 100;
    if (value >= 10000) return Math.round(value / 100) * 100;
    if (value >= 1000) return Math.round(value / 10) * 10;
    return Math.round(value);
  }
  function niceCeil(value) {
    if (!Number.isFinite(value) || value <= 0) return 1000;
    const exp = Math.floor(Math.log10(value));
    const base = Math.pow(10, exp);
    const n = value / base;
    const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return nice * base;
  }
  function niceStep(value) {
    if (!Number.isFinite(value) || value <= 0) return 1;
    const exp = Math.floor(Math.log10(value));
    const base = Math.pow(10, exp);
    const n = value / base;
    const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return Math.max(1, nice * base);
  }
  function fromCNY(value) { return smartRound(value * (CURRENCIES.CNY.rate / CURRENCIES[state.currency].rate)); }
  function toCNY(value) { return value * CURRENCIES[state.currency].rate; }
  function parseAmount(value) {
    const digits = String(value).replace(/[^\d]/g, '');
    if (!digits) return 0;
    return Math.min(Number(digits), 1e15);
  }

  const fmtCache = new Map();
  function nf(key, options) {
    if (!fmtCache.has(key)) fmtCache.set(key, new Intl.NumberFormat(I18N[state.lang].locale, options));
    return fmtCache.get(key);
  }
  function formatNumber(value) {
    return nf('n0', { maximumFractionDigits: 0 }).format(Number(value) || 0);
  }
  function formatFull(value) {
    return nf('full', { style: 'currency', currency: state.currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(Number(value) || 0).replace(/￥/g, '¥');
  }
  function formatCompact(value) {
    const n = Number(value) || 0;
    if (Math.abs(n) < 10000) return formatFull(n);
    return nf('compact', { style: 'currency', currency: state.currency, currencyDisplay: 'narrowSymbol', notation: 'compact', maximumFractionDigits: 1 }).format(n).replace(/￥/g, '¥');
  }
  function formatDecimal(value, digits = 1) {
    return nf('dec' + digits, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value) || 0);
  }
  function formatPercent(value) {
    return nf('pct', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format((Number(value) || 0) / 100);
  }
  function formatRate(value) {
    return nf('rate', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format((Number(value) || 0) / 100);
  }
  function formatInt(value) {
    return nf('int', { useGrouping: false, maximumFractionDigits: 0 }).format(Number(value) || 0);
  }
  function currencySymbol() { return CURRENCIES[state.currency].symbol; }

  function multiplierFor(realReturn) { return 12 / (realReturn / 100); }

  /* ---------------- state ---------------- */

  function detectLang() {
    const candidates = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'zh'];
    for (const code of candidates) {
      const base = String(code || '').slice(0, 2).toLowerCase();
      if (LANGS.includes(base)) return base;
    }
    return 'zh';
  }

  function restoreState() {
    let saved = null;
    const raw = safeStorageGet('freedom-number-state');
    if (raw) {
      try { saved = JSON.parse(raw); } catch (e) { saved = null; }
    }
    const savedLang = saved && LANGS.includes(saved.lang) ? saved.lang : detectLang();
    state.lang = savedLang;
    state.currency = saved && CURRENCIES[saved.currency] ? saved.currency : LANG_CURRENCY[savedLang];
    state.currencyTouched = saved ? Boolean(saved.currencyTouched) : false;

    if (saved && Number.isFinite(Number(saved.monthly))) {
      state.monthly = Number(saved.monthly);
      state.kids = clamp(Number(saved.kids) || 0, 0, 6);
      state.perChild = Number(saved.perChild) || 0;
      state.health = Number(saved.health) || 0;
      state.home = Number(saved.home) || 0;
      state.assets = Number(saved.assets) || 0;
      state.savings = Number(saved.savings) || 0;
      state.age = clamp(Number(saved.age) || 30, 18, 80);
      state.realReturn = clamp(Number(saved.realReturn) || 2.5, 1.5, 3.5);
    } else {
      const factor = CURRENCIES.CNY.rate / CURRENCIES[state.currency].rate;
      MONEY_KEYS.forEach((key) => { state[key] = Math.round(DEFAULT_CNY[key] * factor * 100) / 100; });
      state.kids = DEFAULT_CNY.kids;
      state.age = DEFAULT_CNY.age;
      state.realReturn = DEFAULT_CNY.realReturn;
    }
  }

  function saveState() {
    const payload = {
      lang: state.lang, currency: state.currency, currencyTouched: state.currencyTouched,
      monthly: state.monthly, kids: state.kids, perChild: state.perChild,
      health: state.health, home: state.home, assets: state.assets,
      savings: state.savings, age: state.age, realReturn: state.realReturn
    };
    safeStorageSet('freedom-number-state', JSON.stringify(payload));
  }
  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 320);
  }

  /* ---------------- DOM caching & language ---------------- */

  function cacheDom() {
    el.header = $('#siteHeader');
    el.scrollProgress = $('#scrollProgress');
    el.langSwitch = $('#langSwitch');
    el.langButton = $('#langButton');
    el.langCurrent = $('#langCurrent');
    el.langMenu = $('#langMenu');
    el.menuToggle = $('#menuToggle');
    el.mainNav = $('#mainNav');
    el.calcForm = $('#calcForm');
    el.currencySelect = $('#currencySelect');
    el.monthlyInput = $('#monthlyInput');
    el.perChildInput = $('#perChildInput');
    el.healthInput = $('#healthInput');
    el.homeInput = $('#homeInput');
    el.assetsInput = $('#assetsInput');
    el.savingsInput = $('#savingsInput');
    el.ageInput = $('#ageInput');
    el.returnRange = $('#returnRange');
    el.returnValue = $('#returnValue');
    el.multiplierInline = $('#multiplierInline');
    el.kidsMinus = $('#kidsMinus');
    el.kidsPlus = $('#kidsPlus');
    el.kidsValue = $('#kidsValue');
    el.perChildWrap = $('#perChildWrap');
    el.monthlyChips = $('#monthlyChips');
    el.eqMonthly = $('#eqMonthly');
    el.eqKids = $('#eqKids');
    el.eqHealth = $('#eqHealth');
    el.eqHome = $('#eqHome');
    el.eqTotal = $('#eqTotal');
    el.asideMultiplier = $('#asideMultiplier');
    el.multiplierGauge = $('#multiplierGauge');
    el.gaugeMultiplier = $('#gaugeMultiplier');
    el.calcSubmit = $('#calculateBtn');
    el.resetBtn = $('#resetBtn');
    el.resultSection = $('#result');
    el.resultAmount = $('#resultAmount');
    el.resultAmountFull = $('#resultAmountFull');
    el.resultMeta = $('#resultMeta');
    el.resultBadgeMount = $('#resultBadgeMount');
    el.resultBadgeCaption = $('#resultBadgeCaption');
    el.resultProgress = $('#resultProgress');
    el.resultProgressBar = $('#resultProgressBar');
    el.resultPassive = $('#resultPassive');
    el.resultReach = $('#resultReach');
    el.resultReachNote = $('#resultReachNote');
    el.resultGap = $('#resultGap');
    el.metricsGrid = $('.metrics-grid');
    el.resultBreakdownBar = $('#resultBreakdownBar');
    el.resultLegend = $('#resultLegend');
    el.breakdownTotal = $('#breakdownTotal');
    el.resultInsight = $('#resultInsight');
    el.planBtn = $('#planBtn');
    el.shareBtn = $('#shareBtn');
    el.recalcBtn = $('#recalcBtn');
    el.methodCards = $('#methodCards');
    el.deepPoints = $('#deepPoints');
    el.assumptionsGrid = $('#assumptionsGrid');
    el.guideList = $('#guideList');
    el.faqList = $('#faqList');
    el.planModal = $('#planModal');
    el.shareModal = $('#shareModal');
    el.planTarget = $('#planTarget');
    el.planDate = $('#planDate');
    el.planAge = $('#planAge');
    el.planMonthly = $('#planMonthly');
    el.planChart = $('#planChart');
    el.chartWrap = $('#chartWrap');
    el.chartTooltip = $('#chartTooltip');
    el.planSavingsRange = $('#planSavingsRange');
    el.planSavingsOutput = $('#planSavingsOutput');
    el.planAccelHint = $('#planAccelHint');
    el.planRequired = $('#planRequired');
    el.phaseGrid = $('#phaseGrid');
    el.sharePreview = $('#sharePreview');
    el.shareLoading = $('#shareLoading');
    el.shareCanvas = $('#shareCanvas');
    el.downloadCard = $('#downloadCard');
    el.nativeShare = $('#nativeShare');
    el.copyShare = $('#copyShare');
    el.toast = $('#toast');
    el.confettiCanvas = $('#confettiCanvas');
    el.cursorGlow = $('#cursorGlow');
    el.footerYear = $('#footerYear');
    el.badgeStage = $('#badgeStage');
    el.metaDescription = document.querySelector('meta[name="description"]');
  }

  function applyLanguage() {
    const dict = I18N[state.lang];
    document.documentElement.lang = dict.htmlLang;
    document.title = dict['meta.title'];
    if (el.metaDescription) el.metaDescription.setAttribute('content', dict['meta.description']);
    el.langCurrent.textContent = dict.languageName;
    $$('.lang-menu button').forEach((button) => {
      button.setAttribute('aria-selected', button.dataset.lang === state.lang ? 'true' : 'false');
    });
    $$('[data-i18n]').forEach((node) => {
      const value = t(node.dataset.i18n);
      if (typeof value === 'string') node.textContent = value;
    });
    $$('[data-i18n-html]').forEach((node) => {
      const value = t(node.dataset.i18nHtml);
      if (typeof value === 'string') node.innerHTML = value;
    });
    buildCurrencyOptions();
    renderMethod();
    renderGuide();
    renderFaq();
    renderPhases();
    applyTipText();
    updateQuickChips();
    if (!el.planModal.classList.contains('is-open')) {
      $$('.phase-target').forEach((node) => { node.textContent = ''; });
    }
  }

  function buildCurrencyOptions() {
    let displayNames = null;
    try {
      displayNames = new Intl.DisplayNames([I18N[state.lang].locale], { type: 'currency' });
    } catch (e) { displayNames = null; }
    el.currencySelect.innerHTML = Object.keys(CURRENCIES).map((code) => {
      let name = '';
      if (displayNames) {
        try { name = displayNames.of(code); } catch (e) { name = ''; }
      }
      const label = name ? code + ' · ' + name : code;
      return '<option value="' + code + '">' + escapeHTML(label) + '</option>';
    }).join('');
    el.currencySelect.value = state.currency;
  }

  function applyTipText() {
    const tips = ['monthly', 'kids', 'health', 'home', 'return'];
    tips.forEach((key) => {
      const node = document.getElementById('tip-' + key);
      if (node) node.innerHTML = t('calc.tip.' + key);
    });
    $$('.info-button').forEach((button) => {
      button.setAttribute('title', t('common.howEstimate'));
      button.setAttribute('aria-label', t('common.howEstimate'));
      if (!button.hasAttribute('aria-expanded')) button.setAttribute('aria-expanded', 'false');
    });
    $$('.modal-close').forEach((button) => button.setAttribute('aria-label', t('common.close')));
  }

  function renderMethod() {
    const cards = t('method.cards');
    if (!Array.isArray(cards)) return;
    el.methodCards.innerHTML = cards.map((card, index) => (
      '<article class="method-card" data-spotlight>' +
        '<div class="method-card-top">' +
          '<span class="method-icon"><svg class="icon"><use href="#i-' + card.icon + '"/></svg></span>' +
          '<span class="method-index">' + String(index + 1).padStart(2, '0') + '</span>' +
        '</div>' +
        '<p class="method-label">' + escapeHTML(card.label) + '</p>' +
        '<h3>' + escapeHTML(card.title) + '</h3>' +
        '<p>' + escapeHTML(card.body) + '</p>' +
        '<span class="method-example">' + escapeHTML(card.example) + '</span>' +
      '</article>'
    )).join('');
    const points = t('method.points');
    if (Array.isArray(points)) {
      el.deepPoints.innerHTML = points.map((point) => (
        '<div class="deep-point"><strong>' + escapeHTML(point.value) + '</strong><p>' + point.body + '</p></div>'
      )).join('');
    }
    const assumptions = t('method.assumptions');
    if (Array.isArray(assumptions)) {
      el.assumptionsGrid.innerHTML = assumptions.map((item) => (
        '<article class="assumption-card">' +
          '<span class="assumption-icon"><svg class="icon"><use href="#i-' + item.icon + '"/></svg></span>' +
          '<h4>' + escapeHTML(item.title) + '</h4>' +
          '<p>' + escapeHTML(item.body) + '</p>' +
        '</article>'
      )).join('');
    }
  }

  function renderGuide() {
    const items = t('guide.items');
    if (!Array.isArray(items)) return;
    el.guideList.innerHTML = items.map((item, index) => (
      '<details class="guide-item">' +
        '<summary>' +
          '<span class="guide-num">' + String(index + 1).padStart(2, '0') + '</span>' +
          '<span class="guide-title">' + escapeHTML(item.title) + '</span>' +
          '<span class="guide-tag">' + escapeHTML(item.tag) + '</span>' +
          '<span class="guide-toggle"><svg class="icon"><use href="#i-plus"/></svg></span>' +
        '</summary>' +
        '<div class="guide-body">' +
          '<div class="guide-body-spacer"></div>' +
          '<div class="guide-prose">' + item.body.map((p) => '<p>' + escapeHTML(p) + '</p>').join('') + '</div>' +
          '<aside class="guide-aside"><b>' + escapeHTML(item.asideLabel) + '</b>' + escapeHTML(item.aside) + '</aside>' +
        '</div>' +
      '</details>'
    )).join('');
  }

  function renderFaq() {
    const items = t('faq.items');
    if (!Array.isArray(items)) return;
    el.faqList.innerHTML = items.map((item) => (
      '<details class="faq-item">' +
        '<summary><span class="faq-q">' + escapeHTML(item.q) + '</span><span class="faq-toggle"><svg class="icon"><use href="#i-plus"/></svg></span></summary>' +
        '<div class="faq-a"><p>' + escapeHTML(item.a) + '</p></div>' +
      '</details>'
    )).join('');
  }

  function renderPhases() {
    const phases = t('plan.phases');
    if (!Array.isArray(phases)) return;
    el.phaseGrid.innerHTML = phases.map((phase) => (
      '<article class="phase-card">' +
        '<div class="phase-step">' + escapeHTML(phase.step) + '</div>' +
        '<h4>' + escapeHTML(phase.title) + '</h4>' +
        '<p>' + escapeHTML(phase.body) + '</p>' +
        '<span class="phase-target"></span>' +
      '</article>'
    )).join('');
  }

  /* ---------------- inputs / live formula ---------------- */

  function syncInputs() {
    const map = {
      monthly: el.monthlyInput, perChild: el.perChildInput, health: el.healthInput,
      home: el.homeInput, assets: el.assetsInput, savings: el.savingsInput
    };
    Object.keys(map).forEach((key) => {
      const input = map[key];
      if (document.activeElement !== input) input.value = formatNumber(state[key]);
    });
    $$('[data-currency-symbol]').forEach((node) => { node.textContent = currencySymbol(); });
    el.currencySelect.value = state.currency;
    el.kidsValue.textContent = String(state.kids);
    el.perChildWrap.classList.toggle('is-off', state.kids === 0);
    el.perChildInput.disabled = state.kids === 0;
    el.returnRange.value = String(state.realReturn);
    el.returnValue.textContent = formatRate(state.realReturn);
    el.ageInput.value = String(state.age);
    const rangeLabels = $$('.range-labels > span');
    if (rangeLabels.length === 3) {
      rangeLabels[0].textContent = formatRate(1.5);
      rangeLabels[1].textContent = formatRate(2.5);
      rangeLabels[2].textContent = formatRate(3.5);
    }
    updateQuickChips();
  }

  function updateQuickChips() {
    const values = [2456, 5000, 10000, 20000, 30000];
    el.monthlyChips.innerHTML = values.map((cny, index) => {
      const value = fromCNY(cny);
      const label = index === 0 ? t('calc.chipAvg') + ' · ' + formatCompact(value) : formatCompact(value);
      return '<button type="button" data-amount="' + value + '" title="' + escapeHTML(label) + '">' + escapeHTML(label) + '</button>';
    }).join('');
    updateQuickChipActive();
  }

  function updateQuickChipActive() {
    $$('button', el.monthlyChips).forEach((button) => {
      const amount = Number(button.dataset.amount) || 0;
      button.classList.toggle('is-active', amount > 0 && Math.abs(state.monthly - amount) < Math.max(1, amount * 0.015));
    });
  }

  function updateLive() {
    const mult = multiplierFor(state.realReturn);
    const life = state.monthly * mult;
    const kids = state.perChild * state.kids;
    const total = life + kids + state.health + state.home;
    el.eqMonthly.textContent = formatCompact(state.monthly);
    el.eqKids.textContent = formatCompact(kids);
    el.eqHealth.textContent = formatCompact(state.health);
    el.eqHome.textContent = formatCompact(state.home);
    el.eqTotal.textContent = formatCompact(total);
    el.asideMultiplier.textContent = String(Math.round(mult));
    el.multiplierInline.textContent = String(Math.round(mult));
    el.returnValue.textContent = formatRate(state.realReturn);
    el.gaugeMultiplier.innerHTML = Math.round(mult) + '<span>×</span>';
    el.multiplierGauge.style.setProperty('--gauge', Math.min(100, (mult / 800) * 100).toFixed(1) + '%');
    el.kidsValue.textContent = String(state.kids);
    el.perChildWrap.classList.toggle('is-off', state.kids === 0);
    el.perChildInput.disabled = state.kids === 0;
    updateQuickChipActive();
    scheduleResultRefresh();
  }

  function convertCurrency(code, markTouched) {
    if (!CURRENCIES[code] || code === state.currency) return;
    const factor = CURRENCIES[state.currency].rate / CURRENCIES[code].rate;
    MONEY_KEYS.forEach((key) => { state[key] = Math.round(state[key] * factor * 100) / 100; });
    if (el.planModal.classList.contains('is-open')) planUi.monthly = Math.round(planUi.monthly * factor * 100) / 100;
    state.currency = code;
    if (markTouched) state.currencyTouched = true;
    fmtCache.clear();
  }

  function setLanguage(lang) {
    if (!I18N[lang] || lang === state.lang) { closeLangMenu(); return; }
    state.lang = lang;
    if (!state.currencyTouched && LANG_CURRENCY[lang] !== state.currency) {
      convertCurrency(LANG_CURRENCY[lang], false);
    }
    fmtCache.clear();
    applyLanguage();
    syncInputs();
    updateLive();
    if (currentResult) {
      currentResult = buildResult();
      renderResult(currentResult, false);
    }
    if (el.planModal.classList.contains('is-open')) renderPlan();
    if (el.shareModal.classList.contains('is-open') && currentResult) generateSharePreview(currentResult);
    closeLangMenu();
    saveState();
  }

  /* ---------------- result ---------------- */

  function buildResult() {
    const mult = multiplierFor(state.realReturn);
    const life = state.monthly * mult;
    const kids = state.perChild * state.kids;
    const health = state.health;
    const home = state.home;
    const target = life + kids + health + home;
    const assets = state.assets;
    const progress = target > 0 ? clamp((assets / target) * 100, 0, 100) : 0;
    const projection = simulate(assets, state.savings, state.realReturn / 100, target, 60);
    const cnyTarget = target * CURRENCIES[state.currency].rate;
    let tierIndex = 0;
    for (let i = 0; i < TIER_THRESHOLDS.length; i += 1) {
      if (cnyTarget >= TIER_THRESHOLDS[i]) tierIndex = i + 1;
    }
    const tierNames = t('tiers');
    const tierName = Array.isArray(tierNames) ? tierNames[tierIndex] : '';
    const reachYears = projection.reach;
    return {
      fingerprint: getFingerprint(),
      monthly: state.monthly, kidsCount: state.kids, perChild: state.perChild,
      health, home, assets, savings: state.savings, age: state.age,
      realReturn: state.realReturn, multiplier: mult,
      life, kids, target, progress,
      gap: Math.max(0, target - assets),
      passive: state.monthly,
      reachYears,
      reachYear: reachYears !== null ? currentYear + reachYears : null,
      tierIndex, tierName, tierRoman: ROMAN[tierIndex],
      amountCompact: formatCompact(target),
      amountFull: formatFull(target),
      breakdown: [
        { key: 'life', label: t('result.legendLife'), value: life, color: COLORS.life },
        { key: 'kids', label: t('result.legendKids'), value: kids, color: COLORS.kids },
        { key: 'health', label: t('result.legendHealth'), value: health, color: COLORS.health },
        { key: 'home', label: t('result.legendHome'), value: home, color: COLORS.home }
      ]
    };
  }

  function getFingerprint() {
    return [state.currency, state.monthly, state.kids, state.perChild, state.health, state.home,
      state.assets, state.savings, state.age, state.realReturn].join('|');
  }

  function simulate(assets, monthly, annualRate, target, maxYears = 60) {
    const mr = Math.pow(1 + annualRate, 1 / 12) - 1;
    let balance = Math.max(0, assets);
    let contrib = Math.max(0, assets);
    let reach = assets >= target ? 0 : null;
    const points = [{ year: 0, balance, contrib, growth: 0 }];
    for (let year = 1; year <= maxYears; year += 1) {
      for (let m = 0; m < 12; m += 1) {
        balance = balance * (1 + mr) + Math.max(0, monthly);
        contrib += Math.max(0, monthly);
      }
      points.push({ year, balance, contrib, growth: balance - contrib });
      if (reach === null && balance >= target) reach = year;
    }
    return { points, reach };
  }

  function requiredMonthly(current, target, rate, years) {
    if (current >= target) return 0;
    const mr = Math.pow(1 + rate, 1 / 12) - 1;
    const months = years * 12;
    const growth = Math.pow(1 + mr, months);
    const factor = mr === 0 ? months : (growth - 1) / mr;
    return Math.max(0, (target - current * growth) / factor);
  }

  function renderResult(data, animate) {
    el.resultSection.hidden = false;
    el.resultAmountFull.textContent = data.amountFull;
    el.resultMeta.textContent = fill(t('result.meta'), {
      rate: formatDecimal(data.realReturn, 1),
      mult: Math.round(data.multiplier)
    });
    el.resultProgress.textContent = formatPercent(data.progress);
    el.resultProgressBar.style.width = '0%';
    el.resultPassive.textContent = formatCompact(data.passive);
    el.resultGap.textContent = formatCompact(data.gap);
    if (data.reachYears === 0) {
      el.resultReach.textContent = t('result.reachNow');
    } else if (data.reachYears === null) {
      el.resultReach.textContent = t('result.notReached');
    } else {
      el.resultReach.textContent = fill(t('result.reachPattern'), {
        year: formatInt(data.reachYear), age: formatInt(data.age + data.reachYears)
      });
    }
    el.resultBadgeMount.innerHTML = buildBadgeSVG(data);
    el.resultBadgeCaption.textContent = fill(t('result.badgeCaption'), { tier: data.tierName });
    el.resultBreakdownBar.innerHTML = '';
    el.resultLegend.innerHTML = '';
    const total = data.target || 1;
    data.breakdown.forEach((item) => {
      const pct = (item.value / total) * 100;
      const segment = document.createElement('span');
      segment.style.background = item.color;
      segment.style.flex = '0 0 ' + pct + '%';
      segment.title = item.label + ' · ' + formatCompact(item.value);
      el.resultBreakdownBar.appendChild(segment);
      const legend = document.createElement('div');
      legend.className = 'breakdown-item';
      legend.innerHTML =
        '<span class="legend-label"><i style="background:' + item.color + '"></i>' + escapeHTML(item.label) + '</span>' +
        '<strong>' + formatCompact(item.value) + '</strong>' +
        '<small>' + formatPercent(pct) + '</small>';
      el.resultLegend.appendChild(legend);
    });
    el.breakdownTotal.textContent = data.amountCompact;
    const step = fromCNY(1000);
    const impact = step * data.multiplier;
    el.resultInsight.textContent = fill(t('result.insight'), {
      step: formatCompact(step), impact: formatCompact(impact)
    });

    el.resultSection.classList.add('is-revealed');
    requestAnimationFrame(() => {
      el.resultProgressBar.style.width = data.progress.toFixed(1) + '%';
      $$('#resultBreakdownBar span').forEach((segment) => segment.classList.add('is-on'));
    });

    if (animate && !reducedMotion) {
      animateNumber(el.resultAmount, 0, data.target, formatCompact, 1500);
    } else {
      el.resultAmount.textContent = data.amountCompact;
    }
  }

  function animateNumber(node, from, to, formatter, duration) {
    cancelAnimationFrame(countRaf);
    const start = performance.now();
    function frame(now) {
      const p = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      node.textContent = formatter(from + (to - from) * eased);
      if (p < 1) countRaf = requestAnimationFrame(frame);
      else node.textContent = formatter(to);
    }
    countRaf = requestAnimationFrame(frame);
  }

  function buildBadgeSVG(data) {
    const amount = data.amountCompact;
    const length = Array.from(amount).length;
    const amountSize = length <= 5 ? 66 : length <= 7 ? 56 : length <= 9 ? 46 : 38;
    const tierLine = fill(t('badge.tier'), { tier: data.tierRoman }) + ' · ' + data.tierName;
    const rays = Array.from({ length: 60 }, (_, i) => {
      const angle = (i * 6) * Math.PI / 180;
      const x1 = 230 + Math.cos(angle) * 154;
      const y1 = 215 + Math.sin(angle) * 154;
      const x2 = 230 + Math.cos(angle) * 168;
      const y2 = 215 + Math.sin(angle) * 168;
      return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#67e8f9" stroke-width="1" opacity=".32"/>';
    }).join('');
    return '<svg class="badge-svg" viewBox="0 0 460 545" role="img" aria-label="' + escapeHTML(amount + ' ' + t('badge.freedom')) + '">' +
      '<title>' + escapeHTML(amount + ' ' + t('badge.freedom')) + '</title>' +
      '<defs>' +
        '<linearGradient id="badgeRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f8ff"/><stop offset=".28" stop-color="#2f6bff"/><stop offset=".55" stop-color="#1d4ed8"/><stop offset=".78" stop-color="#67e8f9"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient>' +
        '<radialGradient id="badgeField" cx="38%" cy="28%" r="80%"><stop offset="0" stop-color="#1a4fa0"/><stop offset=".42" stop-color="#0b2e57"/><stop offset="1" stop-color="#050f24"/></radialGradient>' +
        '<linearGradient id="badgeRibbonA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2e57"/><stop offset="1" stop-color="#06152e"/></linearGradient>' +
        '<linearGradient id="badgeRibbonB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8bd8ff"/><stop offset=".55" stop-color="#2f6bff"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient>' +
        '<filter id="badgeShadow" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="18" stdDeviation="15" flood-color="#050f24" flood-opacity=".32"/></filter>' +
      '</defs>' +
      '<g filter="url(#badgeShadow)">' +
        '<path d="M155 300 L108 510 L184 478 L222 540 L250 330 Z" fill="url(#badgeRibbonA)" stroke="#050f24" stroke-width="1"/>' +
        '<path d="M305 300 L352 510 L276 478 L238 540 L210 330 Z" fill="url(#badgeRibbonB)"/>' +
        '<path d="M155 300 L108 510 L184 478 L222 540 L250 330 Z" fill="none" stroke="#67e8f9" stroke-width="1" opacity=".28"/>' +
      '</g>' +
      '<circle cx="230" cy="215" r="196" fill="url(#badgeRim)"/>' +
      '<circle cx="230" cy="215" r="188" fill="#050f24"/>' +
      '<circle cx="230" cy="215" r="180" fill="none" stroke="#67e8f9" stroke-width="1" stroke-dasharray="1 8" opacity=".5"/>' +
      '<g class="badge-rays">' + rays + '</g>' +
      '<circle cx="230" cy="215" r="161" fill="url(#badgeField)" stroke="url(#badgeRim)" stroke-width="1.4"/>' +
      '<circle cx="230" cy="215" r="151" fill="none" stroke="#67e8f9" stroke-width="1" stroke-dasharray="2 6" opacity=".58"/>' +
      '<path id="badgeArcTop" d="M 76 215 A 154 154 0 0 1 384 215" fill="none"/>' +
      '<text class="badge-arc" font-family="Cascadia Mono, Consolas, monospace" font-size="7" letter-spacing="2.3" fill="#ffbd2e" opacity=".62" text-anchor="middle"><textPath href="#badgeArcTop" startOffset="50%">THE FREEDOM NUMBER · YOUR LIFE, YOUR RULE</textPath></text>' +
      '<g text-anchor="middle" font-family="Segoe UI, PingFang SC, Microsoft YaHei, sans-serif">' +
        '<path d="M230 93 L234 106 L247 110 L234 114 L230 127 L226 114 L213 110 L226 106 Z" fill="#67e8f9"/>' +
        '<text x="230" y="148" font-size="8.5" letter-spacing="2.7" fill="#67e8f9" opacity=".7">' + escapeHTML(t('badge.myNumber')) + '</text>' +
        '<text x="230" y="' + (218 + amountSize * 0.04) + '" font-family="Avenir Next, Segoe UI, Noto Sans SC, Microsoft YaHei, sans-serif" font-size="' + amountSize + '" font-weight="700" letter-spacing="-2" fill="#e6f8ff">' + escapeHTML(amount) + '</text>' +
        '<line x1="151" y1="238" x2="309" y2="238" stroke="#67e8f9" stroke-width="1" opacity=".46"/>' +
        '<text x="230" y="265" font-family="Avenir Next, Segoe UI, Noto Sans SC, Microsoft YaHei, sans-serif" font-size="18" font-weight="600" letter-spacing="1.2" fill="#fbfdff">' + escapeHTML(t('badge.freedom')) + '</text>' +
        '<text x="230" y="290" font-size="8" letter-spacing="1.2" fill="#2f6bff">' + escapeHTML(tierLine) + '</text>' +
        '<text x="230" y="312" font-family="Cascadia Mono, Consolas, monospace" font-size="6.5" letter-spacing="1.6" fill="#7dd3fc" opacity=".7">' + Math.round(data.multiplier) + '× · ' + formatDecimal(data.realReturn, 1) + '% REAL RETURN</text>' +
      '</g>' +
      '<text x="230" y="350" text-anchor="middle" font-family="Cascadia Mono, Consolas, monospace" font-size="6" letter-spacing="2.2" fill="#67e8f9" opacity=".5">EST. 2026 · 480× RULE</text>' +
      '<circle cx="230" cy="215" r="196" fill="none" stroke="#eafcff" stroke-width="1.2" opacity=".5"/>' +
      '<path d="M88 128 A 170 170 0 0 1 162 70" fill="none" stroke="#eafcff" stroke-width="2" stroke-linecap="round" opacity=".35"/>' +
    '</svg>';
  }

  function calculate() {
    clearErrors();
    if (!state.monthly || state.monthly <= 0) {
      showFieldError(el.monthlyInput, t('calc.error.monthly'));
      return;
    }
    if (state.age < 18 || state.age > 80 || !Number.isFinite(state.age)) {
      showFieldError(el.ageInput, t('calc.error.age'));
      return;
    }
    const data = buildResult();
    if (!data.target || data.target <= 0) {
      showToast(t('calc.error.target'));
      return;
    }
    currentResult = data;
    renderResult(data, true);
    el.resultSection.classList.remove('is-revealed');
    void el.resultSection.offsetWidth;
    el.resultSection.classList.add('is-revealed');
    saveState();
    setTimeout(() => {
      el.resultSection.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }, 80);
    if (!reducedMotion) setTimeout(fireConfetti, 380);
  }

  function showFieldError(input, message) {
    const field = input.closest('.field');
    if (field) {
      field.classList.add('has-error');
      setTimeout(() => field.classList.remove('has-error'), 1100);
    }
    input.focus();
    showToast(message);
  }
  function clearErrors() {
    $$('.field.has-error').forEach((field) => field.classList.remove('has-error'));
  }

  function ensureCurrentResult() {
    if (!currentResult) return null;
    if (currentResult.fingerprint !== getFingerprint()) {
      currentResult = buildResult();
      if (!el.resultSection.hidden) renderResult(currentResult, false);
    }
    return currentResult;
  }

  function scheduleResultRefresh() {
    if (!currentResult || el.resultSection.hidden) return;
    clearTimeout(resultRefreshTimer);
    resultRefreshTimer = setTimeout(() => {
      if (!currentResult || el.resultSection.hidden) return;
      if (currentResult.fingerprint === getFingerprint()) return;
      currentResult = buildResult();
      renderResult(currentResult, false);
    }, 280);
  }

  /* ---------------- confetti ---------------- */

  function fireConfetti() {
    const canvas = el.confettiCanvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ['#2f6bff', '#8bd8ff', '#071a33', '#2dd4bf', '#ff6b57', '#fbfdff'];
    const particles = Array.from({ length: 110 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      return {
        x: w / 2 + (Math.random() - 0.5) * 180,
        y: h * 0.34 + (Math.random() - 0.5) * 90,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 3 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotate: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        life: 1
      };
    });
    let start = performance.now();
    function frame(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.vy += 0.16;
        p.vx *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.rotate += p.vr;
        p.life = Math.max(0, 1 - elapsed / 2400);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotate);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (elapsed < 2400) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, w, h);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- plan modal ---------------- */

  function openPlan() {
    const data = ensureCurrentResult();
    if (!data) return;
    planUi.monthly = data.savings;
    renderPlan();
    openModal(el.planModal);
  }

  function renderPlan() {
    const data = ensureCurrentResult();
    if (!data) return;
    const rate = state.realReturn / 100;
    const base = simulate(data.assets, planUi.monthly, rate, data.target, 60);
    const fast = simulate(data.assets, planUi.monthly * 1.2, rate, data.target, 60);
    const reference = base.reach === null ? 40 : base.reach;
    const horizon = Math.max(10, Math.min(60, Math.ceil((reference + 5) / 5) * 5));
    const pointAt = (points, year) => points[Math.min(year, points.length - 1)];
    const baseEnd = pointAt(base.points, horizon).balance;
    const fastEnd = pointAt(fast.points, horizon).balance;
    const yMax = Math.max(data.target, baseEnd, fastEnd, 1) * 1.07;

    const targetText = formatCompact(data.target);
    el.planTarget.textContent = targetText;
    el.planTarget.title = data.amountFull;
    if (base.reach === 0) {
      el.planDate.textContent = t('result.reachNow');
      el.planAge.textContent = t('plan.ageLabel', { age: formatInt(state.age) });
    } else if (base.reach === null) {
      el.planDate.textContent = '—';
      el.planAge.textContent = '—';
    } else {
      el.planDate.textContent = t('plan.yearLabel', { year: formatInt(currentYear + base.reach) });
      el.planAge.textContent = t('plan.ageLabel', { age: formatInt(state.age + base.reach) });
    }
    el.planMonthly.textContent = formatCompact(planUi.monthly);

    const max = niceCeil(Math.max(state.savings * 3, fromCNY(30000), planUi.monthly * 1.5, 1000));
    const step = niceStep(max / 80);
    el.planSavingsRange.max = String(Math.round(max));
    el.planSavingsRange.step = String(Math.round(step));
    el.planSavingsRange.value = String(Math.min(planUi.monthly, max));
    el.planSavingsOutput.textContent = formatCompact(planUi.monthly);

    if (base.reach === null) {
      el.planAccelHint.textContent = t('plan.notReached');
    } else if (fast.reach !== null && base.reach - fast.reach > 0) {
      el.planAccelHint.textContent = fill(t('plan.accelHint'), { years: formatInt(base.reach - fast.reach) });
    } else {
      el.planAccelHint.textContent = t('plan.accelZero');
    }

    const req = requiredMonthly(data.assets, data.target, rate, 10);
    el.planRequired.textContent = fill(t('plan.requiredPattern'), { amount: formatCompact(req) });

    $$('.phase-target').forEach((node, index) => {
      const pct = [0.25, 0.6, 1][index] || 1;
      node.textContent = fill(t('plan.phaseTarget'), { amount: formatCompact(data.target * pct) });
    });

    renderPlanChart({ data, base, fast, horizon, yMax, rate });
  }

  function renderPlanChart({ data, base, fast, horizon, yMax, rate }) {
    const compact = window.innerWidth <= 760;
    const W = compact ? 430 : 860;
    const H = compact ? 330 : 390;
    const PL = compact ? 54 : 78;
    const PR = compact ? 12 : 28;
    const PT = compact ? 20 : 22;
    const PB = compact ? 38 : 44;
    const axisFont = compact ? 13 : 10.5;
    const titleFont = compact ? 11 : 9.5;
    const plotW = W - PL - PR;
    const plotH = H - PT - PB;
    const xOf = (year) => PL + (year / horizon) * plotW;
    const yOf = (value) => PT + plotH - (value / yMax) * plotH;
    const basePts = base.points.slice(0, horizon + 1);
    const fastPts = fast.points.slice(0, horizon + 1);
    const y0 = yOf(0);

    const contribPath = 'M ' + xOf(0) + ' ' + y0 + ' ' +
      basePts.map((p) => 'L ' + xOf(p.year) + ' ' + yOf(p.contrib)).join(' ') +
      ' L ' + xOf(horizon) + ' ' + y0 + ' Z';
    const growthPath = 'M ' + xOf(0) + ' ' + yOf(basePts[0].contrib) + ' ' +
      basePts.map((p) => 'L ' + xOf(p.year) + ' ' + yOf(p.balance)).join(' ') + ' ' +
      basePts.slice().reverse().map((p) => 'L ' + xOf(p.year) + ' ' + yOf(p.contrib)).join(' ') + ' Z';
    const totalPath = basePts.map((p, i) => (i === 0 ? 'M ' : 'L ') + xOf(p.year) + ' ' + yOf(p.balance)).join(' ');
    const fastPath = fastPts.map((p, i) => (i === 0 ? 'M ' : 'L ') + xOf(p.year) + ' ' + yOf(p.balance)).join(' ');
    const yTicks = [0, 0.25, 0.5, 0.75, 1];
    const xStep = horizon <= 12 ? 2 : horizon <= 25 ? 5 : 10;
    const xTicks = [];
    for (let year = 0; year <= horizon; year += xStep) xTicks.push(year);
    if (xTicks[xTicks.length - 1] !== horizon) xTicks.push(horizon);

    let grid = '';
    yTicks.forEach((pct) => {
      const y = PT + plotH - pct * plotH;
      const value = yMax * pct;
      grid += '<line x1="' + PL + '" y1="' + y + '" x2="' + (W - PR) + '" y2="' + y + '" stroke="#071a33" stroke-opacity=".09" stroke-width="1"/>';
      grid += '<text x="' + (PL - 8) + '" y="' + (y + 3) + '" text-anchor="end" font-size="' + axisFont + '" fill="#7c8fa3" font-family="Segoe UI, PingFang SC, Microsoft YaHei, sans-serif">' + escapeHTML(formatCompact(value)) + '</text>';
    });
    xTicks.forEach((year) => {
      const x = xOf(year);
      grid += '<line x1="' + x + '" y1="' + (PT + plotH) + '" x2="' + x + '" y2="' + (PT + plotH + 5) + '" stroke="#071a33" stroke-opacity=".25" stroke-width="1"/>';
      grid += '<text x="' + x + '" y="' + (PT + plotH + 16) + '" text-anchor="middle" font-size="' + axisFont + '" fill="#7c8fa3" font-family="Segoe UI, PingFang SC, Microsoft YaHei, sans-serif">' + formatInt(year) + '</text>';
    });

    let goal = '';
    if (base.reach !== null && base.reach <= horizon) {
      const gx = xOf(base.reach);
      const gy = yOf(data.target);
      goal = '<circle cx="' + gx + '" cy="' + gy + '" r="9" fill="#071a33" fill-opacity=".08"/>' +
        '<circle cx="' + gx + '" cy="' + gy + '" r="4.5" fill="#f2f8ff" stroke="#071a33" stroke-width="2"/>';
    }

    const svg =
      '<defs>' +
        '<linearGradient id="areaContrib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6bff" stop-opacity=".58"/><stop offset="1" stop-color="#2f6bff" stop-opacity=".08"/></linearGradient>' +
        '<linearGradient id="areaGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c5cff" stop-opacity=".5"/><stop offset="1" stop-color="#7c5cff" stop-opacity=".04"/></linearGradient>' +
      '</defs>' +
      '<text x="' + PL + '" y="12" font-size="' + titleFont + '" letter-spacing="1.2" fill="#7c8fa3" font-family="Cascadia Mono, Consolas, monospace">' + escapeHTML(t('plan.axisAssets').toUpperCase()) + '</text>' +
      grid +
      '<path d="' + contribPath + '" fill="url(#areaContrib)"/>' +
      '<path d="' + growthPath + '" fill="url(#areaGrowth)"/>' +
      '<path d="' + fastPath + '" fill="none" stroke="#2dd4bf" stroke-width="1.5" stroke-dasharray="4 5" opacity=".9"/>' +
      '<line x1="' + PL + '" y1="' + yOf(data.target) + '" x2="' + (W - PR) + '" y2="' + yOf(data.target) + '" stroke="#ff6b57" stroke-width="1.2" stroke-dasharray="5 5" opacity=".8"/>' +
      '<text x="' + (W - PR) + '" y="' + (yOf(data.target) - 7) + '" text-anchor="end" font-size="' + axisFont + '" fill="#ff6b57" font-family="Segoe UI, PingFang SC, sans-serif">' + escapeHTML(t('plan.target')) + '</text>' +
      '<path d="' + totalPath + '" fill="none" stroke="#0b2e57" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      goal +
      '<g id="planHover" opacity="0" pointer-events="none">' +
        '<line id="planHoverLine" x1="0" y1="' + PT + '" x2="0" y2="' + (PT + plotH) + '" stroke="#071a33" stroke-width="1" stroke-dasharray="3 4" opacity=".35"/>' +
        '<circle id="planHoverContrib" r="3.2" fill="#2f6bff" stroke="#f2f8ff" stroke-width="1.5"/>' +
        '<circle id="planHoverTotal" r="4.2" fill="#0b2e57" stroke="#f2f8ff" stroke-width="1.5"/>' +
      '</g>' +
      '<rect id="planChartHit" x="' + PL + '" y="' + PT + '" width="' + plotW + '" height="' + plotH + '" fill="transparent"/>';

    el.planChart.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    el.planChart.innerHTML = svg;
    el.planChart.setAttribute('aria-label', fill(t('plan.chartTitle')) + ': ' + formatCompact(data.target));
    chartMeta = {
      base, fast, target: data.target, horizon, yMax, rate,
      plot: { W, H, PL, PR, PT, PB, plotW, plotH }, xOf, yOf
    };
  }

  function onChartMove(event) {
    if (!chartMeta) return;
    const rect = el.planChart.getBoundingClientRect();
    if (!rect.width) return;
    const svgX = ((event.clientX - rect.left) / rect.width) * chartMeta.plot.W;
    if (svgX < chartMeta.plot.PL || svgX > chartMeta.plot.W - chartMeta.plot.PR) {
      hideChartTooltip();
      return;
    }
    const { base, plot } = chartMeta;
    const year = clamp(Math.round(((svgX - plot.PL) / plot.plotW) * chartMeta.horizon), 0, chartMeta.horizon);
    const p = base.points[year];
    if (!p) return;
    const x = chartMeta.xOf(year);
    const y = chartMeta.yOf(p.balance);
    const line = $('#planHoverLine', el.planChart);
    const dotTotal = $('#planHoverTotal', el.planChart);
    const dotContrib = $('#planHoverContrib', el.planChart);
    const group = $('#planHover', el.planChart);
    if (!line || !dotTotal || !dotContrib || !group) return;
    group.setAttribute('opacity', '1');
    line.setAttribute('x1', x);
    line.setAttribute('x2', x);
    dotTotal.setAttribute('cx', x);
    dotTotal.setAttribute('cy', y);
    dotContrib.setAttribute('cx', x);
    dotContrib.setAttribute('cy', chartMeta.yOf(p.contrib));
    el.chartTooltip.hidden = false;
    el.chartTooltip.style.left = ((x / plot.W) * 100).toFixed(2) + '%';
    el.chartTooltip.style.top = ((y / plot.H) * 100).toFixed(2) + '%';
    el.chartTooltip.innerHTML =
      '<b>' + escapeHTML(fill(t('plan.tooltipYear'), { year: formatInt(year), age: formatInt(state.age + year) })) + '</b>' +
      escapeHTML(fill(t('plan.tooltipTotal'), { amount: formatCompact(p.balance) })) + '<br>' +
      escapeHTML(fill(t('plan.tooltipContrib'), { amount: formatCompact(p.contrib) })) + '<br>' +
      escapeHTML(fill(t('plan.tooltipGrowth'), { amount: formatCompact(p.growth) }));
  }

  function hideChartTooltip() {
    el.chartTooltip.hidden = true;
    const group = $('#planHover', el.planChart);
    if (group) group.setAttribute('opacity', '0');
  }

  /* ---------------- share card ---------------- */

  function openShare() {
    const data = ensureCurrentResult();
    if (!data) return;
    openModal(el.shareModal);
    generateSharePreview(data);
  }

  function generateSharePreview(data) {
    el.shareLoading.hidden = false;
    el.sharePreview.removeAttribute('src');
    el.sharePreview.style.opacity = '0.25';
    el.downloadCard.disabled = true;
    el.nativeShare.disabled = true;
    setTimeout(() => {
      try {
        drawShareCard(data);
        const canvas = el.shareCanvas;
        canvas.toBlob((blob) => {
          if (!blob) { showToast(t('share.error')); return; }
          shareBlob = blob;
          if (shareUrl) URL.revokeObjectURL(shareUrl);
          shareUrl = URL.createObjectURL(blob);
          el.sharePreview.onload = () => {
            el.shareLoading.hidden = true;
            el.sharePreview.style.opacity = '1';
            el.downloadCard.disabled = false;
            el.nativeShare.disabled = false;
          };
          el.sharePreview.src = shareUrl;
          el.sharePreview.alt = fill(t('share.text'), { amount: data.amountCompact, tier: data.tierName });
        }, 'image/png');
      } catch (error) {
        el.shareLoading.hidden = true;
        el.downloadCard.disabled = false;
        el.nativeShare.disabled = false;
        showToast(t('share.error'));
        console.error(error);
      }
    }, 80);
  }

  function drawShareCard(data) {
    const canvas = el.shareCanvas;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1350;
    const serif = '"Avenir Next", "Segoe UI", "Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif';
    const sans = '"Segoe UI", "PingFang SC", "Microsoft YaHei", "Malgun Gothic", "Yu Gothic", sans-serif';
    const mono = '"Cascadia Mono", Consolas, monospace';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#f6fbff');
    bg.addColorStop(.55, '#f2f8ff');
    bg.addColorStop(1, '#e7f1ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(540, 390, 50, 540, 390, 470);
    glow.addColorStop(0, 'rgba(47,107,255,0.22)');
    glow.addColorStop(1, 'rgba(47,107,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(7,26,51,.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, W - 60, H - 60);
    ctx.strokeStyle = 'rgba(47,107,255,.55)';
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.fillStyle = '#071a33';
    ctx.fillRect(0, 0, W, 118);
    ctx.fillStyle = '#2f6bff';
    drawStar(ctx, 78, 59, 15, 6);
    ctx.fillStyle = '#fbfdff';
    ctx.font = '600 25px ' + sans;
    drawSpacedText(ctx, 'FREEDOM', 106, 69, 6);
    ctx.fillStyle = 'rgba(255,255,255,.66)';
    ctx.font = '500 10px ' + mono;
    drawSpacedText(ctx, 'THE FREEDOM NUMBER', 107, 87, 3.2);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(103,232,249,.88)';
    ctx.font = '500 11px ' + mono;
    ctx.fillText('EST. 2026  ·  480× RULE', W - 76, 66);
    ctx.textAlign = 'left';

    for (let i = 0; i < 1400; i += 1) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      ctx.fillStyle = 'rgba(7,26,51,' + (Math.random() * 0.035).toFixed(3) + ')';
      ctx.fillRect(x, y, 1, 1);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(7,26,51,.62)';
    ctx.font = '600 14px ' + mono;
    drawSpacedText(ctx, t('badge.myNumber'), 540, 175, 3.2, 'center');

    drawMedal(ctx, 540, 375, 150, data, { serif, sans, mono });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#071a33';
    ctx.font = '650 30px ' + serif;
    ctx.fillText(data.tierName, 540, 606);
    ctx.fillStyle = 'rgba(7,26,51,.6)';
    ctx.font = '600 11px ' + mono;
    drawSpacedText(ctx, fill(t('badge.tier'), { tier: data.tierRoman }) + '  ·  ' + t('badge.freedom'), 540, 632, 2.6, 'center');
    ctx.fillStyle = 'rgba(7,26,51,.58)';
    ctx.font = '400 19px ' + mono;
    ctx.fillText(data.amountFull, 540, 662);

    ctx.strokeStyle = 'rgba(7,26,51,.2)';
    ctx.beginPath();
    ctx.moveTo(110, 690);
    ctx.lineTo(970, 690);
    ctx.stroke();

    const metrics = [
      { label: t('share.statMonthly'), value: formatCompact(data.monthly) },
      { label: t('share.statArrival'), value: data.reachYears === 0 ? t('result.reachNow') : data.reachYear ? formatInt(data.reachYear) : '—' },
      { label: t('share.statInput'), value: formatCompact(data.savings) }
    ];
    metrics.forEach((metric, index) => {
      const x = 220 + index * 320;
      if (index > 0) {
        ctx.strokeStyle = 'rgba(7,26,51,.18)';
        ctx.beginPath();
        ctx.moveTo(x - 160, 720);
        ctx.lineTo(x - 160, 798);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(7,26,51,.6)';
      ctx.font = '600 10.5px ' + mono;
      drawSpacedText(ctx, metric.label, x, 726, 1.4, 'center');
      ctx.fillStyle = '#071a33';
      ctx.font = '600 32px ' + serif;
      fitCanvasText(ctx, metric.value, 220, '600 32px ' + serif, 20);
      ctx.fillText(metric.value, x, 768);
    });

    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(7,26,51,.6)';
    ctx.font = '600 10.5px ' + mono;
    drawSpacedText(ctx, t('share.progressLabel').toUpperCase(), 110, 840, 1.8);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#071a33';
    ctx.font = '600 24px ' + serif;
    ctx.fillText(formatPercent(data.progress), 970, 842);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(7,26,51,.16)';
    roundRect(ctx, 110, 856, 860, 6, 3);
    ctx.fill();
    const progressWidth = Math.max(2, 860 * (data.progress / 100));
    const pg = ctx.createLinearGradient(110, 0, 970, 0);
    pg.addColorStop(0, '#2f6bff');
    pg.addColorStop(1, '#8bd8ff');
    ctx.fillStyle = pg;
    roundRect(ctx, 110, 856, progressWidth, 6, 3);
    ctx.fill();

    ctx.fillStyle = 'rgba(7,26,51,.6)';
    ctx.font = '600 10.5px ' + mono;
    drawSpacedText(ctx, 'THE ANATOMY', 110, 914, 1.8);
    let bx = 110;
    const barWidth = 860;
    data.breakdown.forEach((item) => {
      const w = (item.value / (data.target || 1)) * barWidth;
      if (w <= 0) return;
      ctx.fillStyle = item.color;
      ctx.fillRect(bx, 928, Math.max(0, w - 2), 8);
      bx += w;
    });
    data.breakdown.forEach((item, index) => {
      const x = 110 + index * 215;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(x + 4, 960, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(7,26,51,.7)';
      ctx.font = '500 12px ' + sans;
      ctx.fillText(item.label, x + 15, 964);
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(47,107,255,.7)';
    ctx.font = '600 58px ' + serif;
    ctx.fillText('“', 540, 1044);
    const quoteText = t('quote.text');
    const quoteLength = Array.from(quoteText).length;
    const quoteSize = quoteLength > 60 ? 22 : quoteLength > 42 ? 23 : quoteLength > 32 ? 24 : 26;
    ctx.fillStyle = '#0b2e57';
    ctx.font = '400 ' + quoteSize + 'px ' + serif;
    drawWrappedText(ctx, quoteText, 540, 1080, 860, quoteSize * 1.45, 3, serif);
    ctx.fillStyle = 'rgba(7,26,51,.55)';
    ctx.font = '400 10.5px ' + mono;
    drawSpacedText(ctx, '— XIAOLIN TALKS  ·  THE FREEDOM NUMBER', 540, 1172, 1.8, 'center');

    ctx.strokeStyle = 'rgba(7,26,51,.2)';
    ctx.beginPath();
    ctx.moveTo(110, 1212);
    ctx.lineTo(970, 1212);
    ctx.stroke();
    ctx.fillStyle = '#071a33';
    ctx.font = '600 10px ' + mono;
    drawSpacedText(ctx, 'THE FREEDOM NUMBER', 110, 1256, 2.4);
    ctx.fillStyle = 'rgba(7,26,51,.58)';
    ctx.font = '400 11.5px ' + sans;
    ctx.textAlign = 'right';
    ctx.fillText(t('share.cardFooter'), 970, 1256);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(7,26,51,.42)';
    ctx.font = '400 9.5px ' + mono;
    drawSpacedText(ctx, 'YOUR LIFE  ·  YOUR NUMBER  ·  YOUR RULE', 540, 1298, 2, 'center');
  }

  function drawMedal(ctx, cx, cy, r, data, fonts) {
    ctx.save();
    ctx.fillStyle = '#050f24';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.42, cy + r * 0.72);
    ctx.lineTo(cx - r * 0.77, cy + r * 1.28);
    ctx.lineTo(cx - r * 0.22, cy + r * 1.08);
    ctx.lineTo(cx, cy + r * 1.34);
    ctx.lineTo(cx + r * 0.25, cy + r * 0.74);
    ctx.closePath();
    ctx.fill();
    const ribbon = ctx.createLinearGradient(cx, cy + r * 0.7, cx, cy + r * 1.7);
    ribbon.addColorStop(0, '#8bd8ff');
    ribbon.addColorStop(1, '#1e4ed8');
    ctx.fillStyle = ribbon;
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.42, cy + r * 0.72);
    ctx.lineTo(cx + r * 0.77, cy + r * 1.28);
    ctx.lineTo(cx + r * 0.22, cy + r * 1.08);
    ctx.lineTo(cx, cy + r * 1.34);
    ctx.lineTo(cx - r * 0.25, cy + r * 0.74);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.shadowColor = 'rgba(5,15,36,.38)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 18;
    const rim = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    rim.addColorStop(0, '#e6f8ff');
    rim.addColorStop(.3, '#2f6bff');
    rim.addColorStop(.55, '#1d4ed8');
    rim.addColorStop(.8, '#67e8f9');
    rim.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#050f24';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.02, 0, Math.PI * 2);
    ctx.fill();

    const field = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.4, r * 0.1, cx, cy, r);
    field.addColorStop(0, '#1a4fa0');
    field.addColorStop(.45, '#0b2e57');
    field.addColorStop(1, '#050f24');
    ctx.fillStyle = field;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < 64; i += 1) {
      const angle = (i / 64) * Math.PI * 2;
      ctx.strokeStyle = 'rgba(103,232,249,.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r * 0.76, cy + Math.sin(angle) * r * 0.76);
      ctx.lineTo(cx + Math.cos(angle) * r * 0.85, cy + Math.sin(angle) * r * 0.85);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(103,232,249,.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.76, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(165,243,252,.62)';
    drawArcText(ctx, 'THE FREEDOM NUMBER · YOUR LIFE, YOUR RULE', cx, cy, r * 0.69, -Math.PI / 2, '500 ' + Math.max(6, r * 0.045) + 'px ' + fonts.mono, 0.7);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,.62)';
    ctx.font = '600 ' + Math.max(7, r * 0.055) + 'px ' + fonts.mono;
    drawSpacedText(ctx, 'MY FREEDOM NUMBER', cx, cy - r * 0.36, r * 0.022, 'center');

    const amount = data.amountCompact;
    const amountSize = fitFontSize(ctx, amount, r * 1.34, r * 0.38, r * 0.2, '500 %spx ' + fonts.serif);
    ctx.fillStyle = '#e6f8ff';
    ctx.font = '500 ' + amountSize + 'px ' + fonts.serif;
    ctx.fillText(amount, cx, cy + amountSize * 0.12);

    ctx.strokeStyle = 'rgba(103,232,249,.45)';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.52, cy + r * 0.24);
    ctx.lineTo(cx + r * 0.52, cy + r * 0.24);
    ctx.stroke();

    ctx.fillStyle = '#fbfdff';
    ctx.font = '400 ' + Math.max(14, r * 0.115) + 'px ' + fonts.serif;
    ctx.fillText(t('badge.freedom'), cx, cy + r * 0.42);

    ctx.fillStyle = '#2f6bff';
    ctx.font = '600 ' + Math.max(7, r * 0.05) + 'px ' + fonts.sans;
    ctx.fillText(fill(t('badge.tier'), { tier: data.tierRoman }) + ' · ' + data.tierName, cx, cy + r * 0.57);
    ctx.fillStyle = 'rgba(155,181,167,.72)';
    ctx.font = '400 ' + Math.max(6, r * 0.042) + 'px ' + fonts.mono;
    ctx.fillText(Math.round(data.multiplier) + '×  ·  ' + formatDecimal(data.realReturn, 1) + '% REAL RETURN', cx, cy + r * 0.7);
    ctx.restore();
  }

  function drawStar(ctx, x, y, outer, inner) {
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = (Math.PI / 4) * i - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawArcText(ctx, text, cx, cy, r, centerAngle, font, gap) {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = ctx.fillStyle;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const chars = Array.from(text);
    const widths = chars.map((ch) => ctx.measureText(ch).width + gap);
    const total = widths.reduce((sum, w) => sum + w, 0);
    const arc = total / r;
    let angle = centerAngle - arc / 2;
    chars.forEach((ch, index) => {
      const width = widths[index];
      angle += (width / 2) / r;
      ctx.save();
      ctx.translate(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      angle += (width / 2) / r;
    });
    ctx.restore();
  }

  function drawSpacedText(ctx, text, x, y, spacing, align = 'left') {
    ctx.save();
    ctx.textAlign = 'left';
    const chars = Array.from(String(text));
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((sum, w) => sum + w, 0) + spacing * Math.max(0, chars.length - 1);
    let cursor = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    chars.forEach((ch, index) => {
      ctx.fillText(ch, cursor, y);
      cursor += widths[index] + spacing;
    });
    ctx.restore();
  }

  function fitFontSize(ctx, text, maxWidth, start, min, fontTemplate) {
    let size = start;
    while (size > min) {
      ctx.font = fontTemplate.replace('%s', String(Math.round(size)));
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 2;
    }
    return Math.round(size);
  }

  function fitCanvasText(ctx, text, maxWidth, font, min) {
    const match = font.match(/(\d+)px/);
    let size = match ? Number(match[1]) : 26;
    ctx.font = font.replace(/\d+px/, size + 'px');
    while (size > min) {
      ctx.font = font.replace(/\d+px/, size + 'px');
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 2;
    }
  }

  function drawWrappedText(ctx, text, cx, y, maxWidth, lineHeight, maxLines, serif) {
    let segments;
    try {
      const segmenter = new Intl.Segmenter(I18N[state.lang].locale, { granularity: 'word' });
      segments = Array.from(segmenter.segment(text), (item) => item.segment);
    } catch (e) {
      segments = Array.from(text);
    }
    const lines = [];
    let line = '';
    segments.forEach((segment) => {
      const test = line + segment;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line.trim());
        line = segment;
      } else {
        line = test;
      }
    });
    if (line.trim()) lines.push(line.trim());
    const visible = lines.slice(0, maxLines);
    visible.forEach((item, index) => {
      let output = item;
      if (index === maxLines - 1 && lines.length > maxLines) output = item.replace(/.$/, '…');
      ctx.fillText(output, cx, y + index * lineHeight);
    });
  }

  function roundRect(ctx, x, y, w, h, radius) {
    const r = Math.min(radius, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function downloadShare() {
    if (!shareUrl || !currentResult) return;
    const link = document.createElement('a');
    link.href = shareUrl;
    link.download = 'freedom-number-' + Math.round(currentResult.target) + '.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(t('share.downloaded'));
  }

  async function nativeShare() {
    if (!shareBlob || !currentResult) return;
    const text = fill(t('share.text'), { amount: currentResult.amountCompact, tier: currentResult.tierName });
    const file = new File([shareBlob], 'freedom-number.png', { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], title: t('share.title'), text });
      } else if (navigator.share) {
        await navigator.share({ title: t('share.title'), text });
      } else {
        downloadShare();
        showToast(t('share.nativeUnsupported'));
      }
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        downloadShare();
        showToast(t('share.nativeUnsupported'));
      }
    }
  }

  async function copyShareText() {
    if (!currentResult) return;
    const text = fill(t('share.text'), { amount: currentResult.amountCompact, tier: currentResult.tierName });
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); } catch (e) { /* noop */ }
      area.remove();
    }
    showToast(t('share.copySuccess'));
  }

  /* ---------------- modals, toast, misc ---------------- */

  function openModal(modal) {
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    setTimeout(() => {
      const close = modal.querySelector('.modal-close');
      if (close) close.focus({ preventScroll: true });
    }, 60);
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!$('.modal.is-open')) document.body.classList.remove('is-locked');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus({ preventScroll: true });
      lastFocus = null;
    }
  }

  function closeAnyModal() {
    $$('.modal.is-open').forEach((modal) => closeModal(modal));
  }

  function trapFocus(event, modal) {
    if (event.key !== 'Tab') return;
    const focusables = $$('button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])', modal)
      .filter((node) => !node.disabled && node.getClientRects().length);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('is-on'), 3200);
  }

  function closeLangMenu() {
    el.langSwitch.classList.remove('is-open');
    el.langButton.setAttribute('aria-expanded', 'false');
  }

  function setupHeader() {
    function onScroll() {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        const y = window.scrollY || document.documentElement.scrollTop;
        el.header.classList.toggle('is-scrolled', y > 24);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        el.scrollProgress.style.width = (max > 0 ? clamp(y / max, 0, 1) * 100 : 0) + '%';
        scrollRaf = 0;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setupReveal() {
    const nodes = $$('.section-head, .deep-dive, .assumptions, .guide-list, .faq-layout');
    nodes.forEach((node) => node.classList.add('reveal'));
    if (!('IntersectionObserver' in window) || reducedMotion) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach((node) => observer.observe(node));
  }

  function setupCursor() {
    if (isTouch) return;
    let raf = 0;
    window.addEventListener('pointermove', (event) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        el.cursorGlow.style.transform = 'translate(' + (event.clientX - 260) + 'px,' + (event.clientY - 260) + 'px)';
        el.cursorGlow.classList.add('is-on');
        raf = 0;
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => el.cursorGlow.classList.remove('is-on'));
  }

  function setupSpotlights() {
    document.addEventListener('pointermove', (event) => {
      const card = event.target.closest('.method-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--my', ((event.clientY - rect.top) / rect.height * 100) + '%');
    }, { passive: true });
  }

  function setupBadgeTilt() {
    if (isTouch) return;
    el.badgeStage.addEventListener('pointermove', (event) => {
      const rect = el.badgeStage.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      el.resultBadgeMount.style.transform = 'rotateX(' + (-py * 12).toFixed(2) + 'deg) rotateY(' + (px * 14).toFixed(2) + 'deg)';
    });
    el.badgeStage.addEventListener('pointerleave', () => {
      el.resultBadgeMount.style.transform = '';
    });
  }

  function bindEvents() {
    const moneyInputs = [
      [el.monthlyInput, 'monthly'], [el.perChildInput, 'perChild'], [el.healthInput, 'health'],
      [el.homeInput, 'home'], [el.assetsInput, 'assets'], [el.savingsInput, 'savings']
    ];
    moneyInputs.forEach(([input, key]) => {
      input.dataset.key = key;
      input.addEventListener('focus', () => {
        input.value = '';
        setTimeout(() => { try { input.select(); } catch (e) { /* noop */ } }, 10);
      });
      input.addEventListener('input', () => {
        state[key] = parseAmount(input.value);
        updateLive();
        saveSoon();
      });
      input.addEventListener('blur', () => {
        input.value = formatNumber(state[key]);
        updateLive();
        saveState();
      });
    });

    el.calcForm.addEventListener('submit', (event) => {
      event.preventDefault();
      calculate();
    });

    el.currencySelect.addEventListener('change', () => {
      const code = el.currencySelect.value;
      convertCurrency(code, true);
      syncInputs();
      updateLive();
      if (currentResult) {
        currentResult = buildResult();
        if (!el.resultSection.hidden) renderResult(currentResult, false);
      }
      if (el.planModal.classList.contains('is-open')) renderPlan();
      saveState();
    });

    el.kidsMinus.addEventListener('click', () => {
      state.kids = clamp(state.kids - 1, 0, 6);
      syncInputs();
      updateLive();
      saveState();
    });
    el.kidsPlus.addEventListener('click', () => {
      state.kids = clamp(state.kids + 1, 0, 6);
      syncInputs();
      updateLive();
      saveState();
    });

    el.returnRange.addEventListener('input', () => {
      state.realReturn = clamp(Number(el.returnRange.value) || 2.5, 1.5, 3.5);
      el.returnValue.textContent = formatRate(state.realReturn);
      updateLive();
      if (el.planModal.classList.contains('is-open')) {
        currentResult = buildResult();
        renderPlan();
      }
      saveSoon();
    });

    el.ageInput.addEventListener('focus', () => { el.ageInput.value = ''; });
    el.ageInput.addEventListener('input', () => {
      state.age = clamp(Number(el.ageInput.value) || 30, 18, 80);
      scheduleResultRefresh();
      saveSoon();
    });
    el.ageInput.addEventListener('blur', () => {
      state.age = clamp(Number(el.ageInput.value) || 30, 18, 80);
      el.ageInput.value = String(state.age);
      saveState();
    });

    el.monthlyChips.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-amount]');
      if (!button) return;
      state.monthly = Number(button.dataset.amount) || 0;
      syncInputs();
      updateLive();
      saveState();
    });

    $$('.info-button').forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tip]');
      if (!button) return;
      const key = button.dataset.tip;
      const tip = document.getElementById('tip-' + key);
      if (!tip) return;
      const open = tip.hidden;
      $$('.field-tip').forEach((node) => { node.hidden = true; });
      $$('.info-button').forEach((node) => node.setAttribute('aria-expanded', 'false'));
      if (open) {
        tip.hidden = false;
        button.setAttribute('aria-expanded', 'true');
      }
    });

    el.resetBtn.addEventListener('click', () => {
      const factor = CURRENCIES.CNY.rate / CURRENCIES[state.currency].rate;
      MONEY_KEYS.forEach((key) => { state[key] = smartRound(DEFAULT_CNY[key] * factor); });
      state.kids = DEFAULT_CNY.kids;
      state.age = DEFAULT_CNY.age;
      state.realReturn = DEFAULT_CNY.realReturn;
      currentResult = null;
      el.resultSection.hidden = true;
      el.resultSection.classList.remove('is-revealed');
      el.resultAmount.textContent = formatCompact(state.monthly * multiplierFor(state.realReturn));
      syncInputs();
      updateLive();
      saveState();
      showToast(t('toast.reset'));
    });

    el.recalcBtn.addEventListener('click', () => {
      document.getElementById('calculator').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => el.monthlyInput.focus({ preventScroll: true }), reducedMotion ? 0 : 500);
    });

    el.planBtn.addEventListener('click', openPlan);
    el.shareBtn.addEventListener('click', openShare);
    el.downloadCard.addEventListener('click', downloadShare);
    el.nativeShare.addEventListener('click', nativeShare);
    el.copyShare.addEventListener('click', copyShareText);

    el.planSavingsRange.addEventListener('input', () => {
      planUi.monthly = Number(el.planSavingsRange.value) || 0;
      renderPlan();
    });

    el.chartWrap.addEventListener('pointermove', onChartMove);
    el.chartWrap.addEventListener('pointerleave', hideChartTooltip);

    el.langButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = !el.langSwitch.classList.contains('is-open');
      el.langSwitch.classList.toggle('is-open', open);
      el.langButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('.lang-menu button').forEach((button) => {
      button.addEventListener('click', () => setLanguage(button.dataset.lang));
    });
    document.addEventListener('click', (event) => {
      if (!el.langSwitch.contains(event.target)) closeLangMenu();
      if (el.mainNav.classList.contains('is-open') && !el.mainNav.contains(event.target) && !el.menuToggle.contains(event.target)) {
        el.mainNav.classList.remove('is-open');
        el.menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    el.menuToggle.addEventListener('click', () => {
      const open = !el.mainNav.classList.contains('is-open');
      el.mainNav.classList.toggle('is-open', open);
      el.menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('#mainNav a').forEach((link) => {
      link.addEventListener('click', () => {
        el.mainNav.classList.remove('is-open');
        el.menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    $$('[data-close-modal]').forEach((node) => {
      node.addEventListener('click', () => {
        const modal = node.closest('.modal');
        if (modal) closeModal(modal);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const openModalEl = $('.modal.is-open');
        if (openModalEl) closeModal(openModalEl);
        else {
          closeLangMenu();
          el.mainNav.classList.remove('is-open');
          el.menuToggle.setAttribute('aria-expanded', 'false');
        }
      }
      const openModalEl = $('.modal.is-open');
      if (openModalEl) trapFocus(event, openModalEl);
    });

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      if (el.chartTooltip && !el.chartTooltip.hidden) hideChartTooltip();
      if (el.planModal.classList.contains('is-open')) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderPlan, 180);
      }
    });
  }


  function setupHeroEyes() {
    const art = $('.orbit-character-art');
    if (!art || reducedMotion) return;
    const fine = window.matchMedia('(pointer:fine)').matches;
    if (!fine || window.innerWidth <= 760) return;
    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    const apply = () => {
      frame = 0;
      art.style.setProperty('--eye-x', targetX.toFixed(2) + '%');
      art.style.setProperty('--eye-y', targetY.toFixed(2) + '%');
    };
    const onMove = (event) => {
      const rect = art.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.52;
      const cy = rect.top + rect.height * 0.27;
      const nx = Math.max(-1, Math.min(1, (event.clientX - cx) / Math.max(220, window.innerWidth * 0.42)));
      const ny = Math.max(-1, Math.min(1, (event.clientY - cy) / Math.max(180, window.innerHeight * 0.42)));
      targetX = nx * 11;
      targetY = ny * 7;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    });
  }

  function init() {
    cacheDom();
    restoreState();
    bindEvents();
    applyLanguage();
    syncInputs();
    updateLive();
    setupHeader();
    setupReveal();
    setupCursor();
    setupSpotlights();
    setupBadgeTilt();
    setupHeroEyes();
    el.footerYear.textContent = String(currentYear);
    el.resultSection.hidden = true;
    if (el.returnRange) {
      el.returnRange.value = String(state.realReturn);
    }
    // Pre-fill the preview amount so the result section looks complete if revealed.
    el.resultAmount.textContent = formatCompact(state.monthly * multiplierFor(state.realReturn));
  }

  try {
    init();
    window.__FN_READY = true;
    if (window.__FN_BOOT_TIMEOUT__) clearTimeout(window.__FN_BOOT_TIMEOUT__);
    var bootBox = document.getElementById('bootError');
    if (bootBox) bootBox.hidden = true;
    document.documentElement.classList.add('is-ready');
  } catch (error) {
    window.__FN_ERROR = error;
    console.error('FREEDOM NUMBER BOOT ERROR:', error);
    var bootErrorBox = document.getElementById('bootError');
    if (bootErrorBox) bootErrorBox.hidden = false;
    var bootDetail = document.getElementById('bootErrorDetail');
    if (bootDetail) bootDetail.textContent = (error && (error.message || String(error))) || 'Unknown error';
  }
})();
