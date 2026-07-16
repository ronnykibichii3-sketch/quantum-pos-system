const state = {
  token: localStorage.getItem('qc_token') || '',
  language: localStorage.getItem('qc_lang') || ((navigator.language || 'en').slice(0, 2).toLowerCase()),
  languageLocked: localStorage.getItem('qc_lang_locked') === '1',
  storeLanguageMap: {},
  employee: null,
  stores: [],
  terminals: [],
  products: [],
  cart: null,
  cartDraft: { storeId: '', terminalId: '' },
  receipts: [],
  inventory: [],
  forecasts: [],
  warnings: [],
  search: '',
  lastReceipt: null
};

const SUPPORTED_LANGS = ['en', 'sw', 'fr', 'es', 'ar', 'de', 'it', 'pt'];
const LANGUAGE_LOCALE = {
  en: 'en-US',
  sw: 'sw-KE',
  fr: 'fr-FR',
  es: 'es-ES',
  ar: 'ar',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT'
};

const I18N = {
  en: {
    'top.eyebrow': 'Retail POS / management',
    'top.subtitle': 'Cashier screen, cart totals, payments, reports, inventory, terminals, and forecasting.',
    'top.language': 'Language',
    'top.refresh': 'Refresh data',
    'login.title': 'Employee access',
    'login.subtitle': 'Sign in with your employee account or bootstrap one if this is a fresh deployment.',
    'login.emailPlaceholder': 'manager@store.com',
    'login.passwordPlaceholder': '••••••••',
    'login.signIn': 'Sign in',
    'login.logout': 'Logout',
    'tabs.cashier': 'Cashier Dashboard',
    'tabs.manager': 'Manager Dashboard',
    'tabs.admin': 'Admin Dashboard',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.store': 'Store',
    'common.terminal': 'Terminal',
    'common.add': 'Add',
    'common.refresh': 'Refresh',
    'common.storeId': 'Store ID',
    'common.role': 'Role',
    'cashier.scanSell': 'Scan and Sell',
    'cashier.startSale': 'Start new sale',
    'cashier.closeCart': 'Close cart',
    'cashier.scanProduct': 'Scan product',
    'cashier.scanPlaceholder': 'Scan barcode or type product name',
    'cashier.subtotal': 'Subtotal',
    'cashier.tax': 'Tax',
    'cashier.total': 'Total',
    'cashier.payPrint': 'Pay and Print',
    'cashier.totalDue': 'Total due ($ / EUR equivalent)',
    'cashier.autoFilled': 'Auto-filled',
    'cashier.pay': 'Pay',
    'cashier.printReceipt': 'Print receipt',
    'cashier.exampleCart': 'Example cart',
    'cashier.catalog': 'Catalog',
    'cashier.searchProducts': 'Search products or barcode',
    'cashier.cart': 'Cart',
    'cashier.clearItems': 'Clear items',
    'manager.todaySales': 'Today sales',
    'manager.receipts': 'Receipts',
    'manager.lowStock': 'Low stock',
    'manager.activeTerminals': 'Active terminals',
    'manager.languagePolicyEyebrow': 'Localization',
    'manager.languagePolicyTitle': 'Branch language defaults',
    'manager.branch': 'Branch',
    'manager.saveBranchLanguage': 'Save branch language',
    'manager.clearBranchLanguage': 'Use auto detection',
    'manager.salesReceipts': 'Sales and receipts',
    'manager.stock': 'Stock',
    'manager.terminals': 'Terminals',
    'manager.warnings': 'Warnings',
    'admin.bootstrapTitle': 'Bootstrap employee account',
    'admin.useOnce': 'Use once on a fresh deployment',
    'admin.fullName': 'Full name',
    'admin.fullNamePlaceholder': 'Admin User',
    'admin.emailPlaceholder': 'admin@store.com',
    'admin.passwordPlaceholder': 'Set a strong password',
    'admin.createEmployee': 'Create employee',
    'dynamic.online': 'Online',
    'dynamic.offline': 'Offline',
    'dynamic.noUserLoaded': 'No user loaded',
    'dynamic.noProductsLoaded': 'No products loaded.',
    'dynamic.noActiveCart': 'No active cart',
    'dynamic.waiting': 'Waiting',
    'dynamic.createSalePrompt': 'Create a sale to begin adding items.',
    'dynamic.cartIsEmpty': 'Cart is empty.',
    'dynamic.stockQty': 'Stock {qty}',
    'dynamic.remove': 'Remove',
    'dynamic.noInventoryYet': 'No inventory loaded yet.',
    'dynamic.tableProduct': 'Product',
    'dynamic.tableStock': 'Stock',
    'dynamic.tableReorder': 'Reorder',
    'dynamic.tableStatus': 'Status',
    'dynamic.active': 'Active',
    'dynamic.inactive': 'Inactive',
    'dynamic.noTerminalsYet': 'No terminals loaded yet.',
    'dynamic.terminalTitle': 'Terminal #{id}',
    'dynamic.terminalStore': 'Store {storeId} · {type}',
    'dynamic.noSalesYet': 'No sales have been recorded yet.',
    'dynamic.receiptsCount': 'Receipts {count}',
    'dynamic.noWarningsYet': 'Forecast warnings will appear here after a forecast run.',
    'dynamic.employeeDefault': 'Employee',
    'dynamic.roleUnknown': 'role unknown',
    'dynamic.paid': 'Paid {amount}',
    'dynamic.receipt': 'Receipt {receiptNo}',
    'dynamic.paymentId': 'Payment ID {id}',
    'dynamic.noReceiptPrint': 'No receipt to print yet.',
    'dynamic.allowPopups': 'Allow popups to print receipt.',
    'dynamic.created': 'Created',
    'dynamic.storeLangSaved': 'Saved language {lang} for {store}',
    'dynamic.storeLangCleared': 'Auto detection restored for {store}',
    'errors.selectStoreTerminal': 'Select a store and terminal first',
    'errors.productNotFound': 'Product not found',
    'errors.noProductMatch': 'No product matches scan: {scan}',
    'errors.openCartFirst': 'Open a cart first',
    'errors.loadStoreDataFirst': 'Load store data first',
    'print.title': 'Receipt {receiptNo}',
    'print.header': 'Quantum POS Receipt',
    'print.receiptLabel': 'Receipt:',
    'print.totalLabel': 'Total:',
    'print.dateLabel': 'Date:'
  },
  sw: {
    'top.eyebrow': 'POS ya reja reja / usimamizi',
    'top.subtitle': 'Skrini ya cashier, jumla za kikapu, malipo, ripoti, hisa, terminali, na utabiri.',
    'top.language': 'Lugha',
    'top.refresh': 'Sasisha data',
    'login.title': 'Ufikiaji wa mfanyakazi',
    'login.subtitle': 'Ingia kwa akaunti ya mfanyakazi au tengeneza akaunti ya kwanza kwa mfumo mpya.',
    'login.signIn': 'Ingia',
    'login.logout': 'Toka',
    'tabs.cashier': 'Dashibodi ya Cashier',
    'tabs.manager': 'Dashibodi ya Meneja',
    'tabs.admin': 'Dashibodi ya Admin',
    'cashier.startSale': 'Anza mauzo mapya',
    'cashier.closeCart': 'Funga kikapu',
    'cashier.scanProduct': 'Skani bidhaa',
    'cashier.pay': 'Lipa',
    'cashier.printReceipt': 'Chapisha risiti',
    'dynamic.online': 'Mtandaoni',
    'dynamic.offline': 'Nje ya mtandao',
    'dynamic.noUserLoaded': 'Hakuna mtumiaji amepakiwa',
    'dynamic.noActiveCart': 'Hakuna kikapu kinachoendelea',
    'dynamic.waiting': 'Inasubiri',
    'dynamic.createSalePrompt': 'Anza mauzo ili uongeze bidhaa.',
    'dynamic.cartIsEmpty': 'Kikapu hakina kitu.',
    'dynamic.noProductsLoaded': 'Hakuna bidhaa zilizopakiwa.',
    'dynamic.created': 'Imeundwa'
  },
  fr: {
    'top.language': 'Langue',
    'top.refresh': 'Actualiser les donnees',
    'login.signIn': 'Se connecter',
    'login.logout': 'Se deconnecter',
    'tabs.cashier': 'Tableau caissier',
    'tabs.manager': 'Tableau manager',
    'tabs.admin': 'Tableau admin',
    'cashier.startSale': 'Nouvelle vente',
    'cashier.closeCart': 'Fermer le panier',
    'cashier.pay': 'Payer',
    'cashier.printReceipt': 'Imprimer le recu',
    'dynamic.online': 'En ligne',
    'dynamic.offline': 'Hors ligne',
    'dynamic.noUserLoaded': 'Aucun utilisateur charge',
    'dynamic.created': 'Cree'
  },
  es: {
    'top.language': 'Idioma',
    'top.refresh': 'Actualizar datos',
    'login.signIn': 'Iniciar sesion',
    'login.logout': 'Cerrar sesion',
    'tabs.cashier': 'Panel cajero',
    'tabs.manager': 'Panel gerente',
    'tabs.admin': 'Panel admin',
    'cashier.startSale': 'Iniciar venta',
    'cashier.closeCart': 'Cerrar carrito',
    'cashier.pay': 'Pagar',
    'cashier.printReceipt': 'Imprimir recibo',
    'dynamic.online': 'En linea',
    'dynamic.offline': 'Sin conexion',
    'dynamic.noUserLoaded': 'Ningun usuario cargado',
    'dynamic.created': 'Creado'
  },
  ar: {
    'top.language': 'اللغة',
    'top.refresh': 'تحديث البيانات',
    'login.signIn': 'تسجيل الدخول',
    'login.logout': 'تسجيل الخروج',
    'tabs.cashier': 'لوحة الكاشير',
    'tabs.manager': 'لوحة المدير',
    'tabs.admin': 'لوحة الادمن',
    'cashier.startSale': 'بدء عملية بيع',
    'cashier.closeCart': 'اغلاق السلة',
    'cashier.pay': 'دفع',
    'cashier.printReceipt': 'طباعة الايصال',
    'dynamic.online': 'متصل',
    'dynamic.offline': 'غير متصل',
    'dynamic.noUserLoaded': 'لا يوجد مستخدم محمل',
    'dynamic.created': 'تم الانشاء'
  },
  de: {
    'top.language': 'Sprache',
    'top.refresh': 'Daten aktualisieren',
    'login.signIn': 'Anmelden',
    'login.logout': 'Abmelden',
    'tabs.cashier': 'Kassen Dashboard',
    'tabs.manager': 'Manager Dashboard',
    'tabs.admin': 'Admin Dashboard',
    'cashier.pay': 'Bezahlen',
    'cashier.printReceipt': 'Beleg drucken',
    'dynamic.online': 'Online',
    'dynamic.offline': 'Offline'
  },
  it: {
    'top.language': 'Lingua',
    'top.refresh': 'Aggiorna dati',
    'login.signIn': 'Accedi',
    'login.logout': 'Esci',
    'tabs.cashier': 'Dashboard cassa',
    'tabs.manager': 'Dashboard manager',
    'tabs.admin': 'Dashboard admin',
    'cashier.pay': 'Paga',
    'cashier.printReceipt': 'Stampa ricevuta',
    'dynamic.online': 'Online',
    'dynamic.offline': 'Offline'
  },
  pt: {
    'top.language': 'Idioma',
    'top.refresh': 'Atualizar dados',
    'login.signIn': 'Entrar',
    'login.logout': 'Sair',
    'tabs.cashier': 'Painel caixa',
    'tabs.manager': 'Painel gerente',
    'tabs.admin': 'Painel admin',
    'cashier.pay': 'Pagar',
    'cashier.printReceipt': 'Imprimir recibo',
    'dynamic.online': 'Online',
    'dynamic.offline': 'Offline'
  }
};

const $ = (id) => document.getElementById(id);

function browserLanguage() {
  const lang = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(lang) ? lang : 'en';
}

function readStoreLanguageMap() {
  try {
    const raw = localStorage.getItem('qc_store_lang_map') || '{}';
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoreLanguageMap() {
  localStorage.setItem('qc_store_lang_map', JSON.stringify(state.storeLanguageMap));
}

function activeLanguage() {
  return SUPPORTED_LANGS.includes(state.language) ? state.language : 'en';
}

function t(key, vars = {}) {
  const lang = activeLanguage();
  const dict = I18N[lang] || {};
  const fallback = I18N.en[key] || key;
  let phrase = dict[key] || fallback;

  for (const [name, value] of Object.entries(vars)) {
    phrase = phrase.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
  }

  return phrase;
}

function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    node.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    const key = node.getAttribute('data-i18n-placeholder');
    node.setAttribute('placeholder', t(key));
  });
}

function setLanguage(nextLang, lockSelection = false) {
  state.language = SUPPORTED_LANGS.includes(nextLang) ? nextLang : 'en';
  if (lockSelection) {
    state.languageLocked = true;
    localStorage.setItem('qc_lang_locked', '1');
  }

  localStorage.setItem('qc_lang', state.language);
  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
  const languageSelect = $('languageSelect');
  if (languageSelect) {
    languageSelect.value = state.language;
  }

  applyStaticTranslations();
  updateConnectionPill();
  renderProducts();
  renderCart();
  renderInventory();
  renderTerminalsDashboard();
  renderReports();
  renderWarnings();
}

function inferStoreLanguage(storeId) {
  const store = state.stores.find((entry) => entry.id === Number(storeId));
  if (!store) {
    return null;
  }

  const fingerprint = `${store.name || ''} ${store.city || ''}`.toLowerCase();
  if (/torino|roma|milano|napoli|ital/.test(fingerprint)) return 'it';
  if (/nairobi|mombasa|kisumu|kenya|tanzania|uganda/.test(fingerprint)) return 'sw';
  if (/madrid|barcelona|sevilla|espan|spain/.test(fingerprint)) return 'es';
  if (/paris|lyon|marseille|france/.test(fingerprint)) return 'fr';
  if (/berlin|munich|hamburg|deutsch|germany/.test(fingerprint)) return 'de';
  if (/porto|lisbon|lisboa|portugal|brasil|brazil/.test(fingerprint)) return 'pt';
  if (/dubai|riyadh|doha|abu dhabi|cairo/.test(fingerprint)) return 'ar';
  return null;
}

function preferredStoreLanguage(storeId) {
  const explicit = state.storeLanguageMap[String(storeId)];
  if (SUPPORTED_LANGS.includes(explicit)) {
    return explicit;
  }

  return inferStoreLanguage(storeId);
}

function applyRoleLanguagePolicy(storeId = currentStoreId()) {
  if (state.languageLocked) {
    return;
  }

  const role = state.employee?.role;
  const browser = browserLanguage();
  if (role === 'admin' || role === 'manager') {
    setLanguage(browser, false);
    return;
  }

  const branchLang = preferredStoreLanguage(storeId);
  setLanguage(branchLang || browser, false);
}

function renderStoreLanguageControls() {
  const storeSelect = $('storeLangStore');
  const langSelect = $('storeLangSelect');
  if (!storeSelect || !langSelect) {
    return;
  }

  storeSelect.innerHTML = state.stores.map((store) => `<option value="${store.id}">${store.name} (${store.city})</option>`).join('');
  const activeStoreId = Number(state.cartDraft.storeId || state.stores[0]?.id || 0);
  if (activeStoreId) {
    storeSelect.value = String(activeStoreId);
  }

  const preferred = preferredStoreLanguage(Number(storeSelect.value)) || browserLanguage();
  langSelect.value = SUPPORTED_LANGS.includes(preferred) ? preferred : 'en';
}

function setPill(el, text, tone = 'neutral') {
  el.textContent = text;
  el.className = `pill pill-${tone}`;
}

function money(value) {
  const locale = LANGUAGE_LOCALE[activeLanguage()] || 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function number(value) {
  return Number(Number(value || 0).toFixed(2));
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function api(path, options = {}) {
  const { headers: customHeaders, ...restOptions } = options;

  const response = await fetch(path, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(customHeaders || {})
    }
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    throw new Error(payload?.error || response.statusText);
  }

  return payload;
}

function calculateCartTotals(cart) {
  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice || item.qty * item.unitPrice || 0), 0);
  const tax = items.reduce((sum, item) => {
    const vatRate = Number(item.product?.vatRate || 0);
    return sum + (Number(item.totalPrice || item.qty * item.unitPrice || 0) * vatRate / 100);
  }, 0);

  return { subtotal: number(subtotal), tax: number(tax), total: number(subtotal + tax) };
}

function currentStoreId() {
  return Number(state.cartDraft.storeId || state.stores[0]?.id || 0);
}

function currentTerminalId() {
  return Number(state.cartDraft.terminalId || state.terminals[0]?.id || 0);
}

function flash(el) {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

function showTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === tabId);
  });
}

function applyRoleAccess() {
  const role = state.employee?.role || null;
  const cashierBtn = document.querySelector('[data-tab="cashierTab"]');
  const managerBtn = document.querySelector('[data-tab="managerTab"]');
  const adminBtn = document.querySelector('[data-tab="adminTab"]');

  if (!role) {
    if (cashierBtn) cashierBtn.style.display = '';
    if (managerBtn) managerBtn.style.display = '';
    if (adminBtn) adminBtn.style.display = '';
    return;
  }

  if (cashierBtn) cashierBtn.style.display = '';
  if (managerBtn) managerBtn.style.display = (role === 'admin' || role === 'manager') ? '' : 'none';
  if (adminBtn) adminBtn.style.display = role === 'admin' ? '' : 'none';

  const activeBtn = document.querySelector('.tab-btn.active');
  if (activeBtn && activeBtn.style.display === 'none') {
    showTab('cashierTab');
  }
}

function renderStores() {
  const select = $('storeSelect');
  select.innerHTML = state.stores.map((store) => `<option value="${store.id}">${store.name} (${store.city})</option>`).join('');
  if (!state.cartDraft.storeId && state.stores[0]) {
    state.cartDraft.storeId = state.stores[0].id;
    select.value = String(state.stores[0].id);
  }

  renderStoreLanguageControls();
}

function renderTerminals() {
  const select = $('terminalSelect');
  select.innerHTML = state.terminals.map((terminal) => `<option value="${terminal.id}">#${terminal.id} ${terminal.type} · ${terminal.status}</option>`).join('');
  if (!state.cartDraft.terminalId && state.terminals[0]) {
    state.cartDraft.terminalId = state.terminals[0].id;
    select.value = String(state.terminals[0].id);
  }
}

function renderProducts() {
  const host = $('productGrid');
  const query = state.search.trim().toLowerCase();
  const products = state.products.filter((product) => {
    if (!query) return true;
    return [product.name, product.barcode, product.sku].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
  });

  if (!products.length) {
    host.innerHTML = `<p class="muted">${t('dynamic.noProductsLoaded')}</p>`;
    return;
  }

  host.innerHTML = products.map((product) => `
    <article class="product-card">
      <strong>${product.name}</strong>
      <div class="muted">${product.barcode}</div>
      <div>${money(product.price)} · ${t('dynamic.stockQty', { qty: product.stockQty })}</div>
      <div class="actions">
        <button data-add-product="${product.id}" type="button">${t('common.add')}</button>
      </div>
    </article>
  `).join('');
}

function renderCart() {
  const host = $('cartItems');
  const cart = state.cart;

  if (!cart) {
    setPill($('activeCartPill'), t('dynamic.noActiveCart'), 'neutral');
    setPill($('cartStatusPill'), t('dynamic.waiting'), 'neutral');
    host.innerHTML = `<p class="muted">${t('dynamic.createSalePrompt')}</p>`;
    $('subtotalValue').textContent = money(0);
    $('taxValue').textContent = money(0);
    $('totalValue').textContent = money(0);
    $('paymentAmount').value = '';
    return;
  }

  const totals = calculateCartTotals(cart);
  setPill($('activeCartPill'), `Cart #${cart.id}`, 'success');
  setPill($('cartStatusPill'), cart.status || 'open', cart.status === 'closed' ? 'neutral' : 'success');
  $('subtotalValue').textContent = money(totals.subtotal);
  $('taxValue').textContent = money(totals.tax);
  $('totalValue').textContent = money(totals.total);
  $('paymentAmount').value = totals.total.toFixed(2);

  if (!cart.items?.length) {
    host.innerHTML = `<p class="muted">${t('dynamic.cartIsEmpty')}</p>`;
    return;
  }

  host.innerHTML = cart.items.map((item) => `
    <article class="cart-item">
      <strong>${item.product?.name || `Product ${item.productId}`}</strong>
      <div class="muted">${item.qty} × ${money(item.unitPrice)} = ${money(item.totalPrice)}</div>
      <div class="actions">
        <button type="button" data-qty="${item.id}" data-value="${Math.max(1, Number(item.qty) - 1)}">−</button>
        <button type="button" data-qty="${item.id}" data-value="${Number(item.qty) + 1}">+</button>
        <button type="button" class="ghost" data-remove="${item.id}">${t('dynamic.remove')}</button>
      </div>
    </article>
  `).join('');
}

function renderInventory() {
  const host = $('inventoryTable');
  $('lowStockCount').textContent = String(state.inventory.filter((item) => item.stockQty <= item.reorderLevel).length);

  if (!state.inventory.length) {
    host.innerHTML = `<p class="muted">${t('dynamic.noInventoryYet')}</p>`;
    return;
  }

  host.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('dynamic.tableProduct')}</th><th>${t('dynamic.tableStock')}</th><th>${t('dynamic.tableReorder')}</th><th>${t('dynamic.tableStatus')}</th>
        </tr>
      </thead>
      <tbody>
        ${state.inventory.slice(0, 12).map((item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.stockQty}</td>
            <td>${item.reorderLevel}</td>
            <td>${item.isActive ? t('dynamic.active') : t('dynamic.inactive')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderTerminalsDashboard() {
  const host = $('terminalList');
  $('activeTerminalCount').textContent = String(state.terminals.filter((terminal) => String(terminal.status).toLowerCase() !== 'offline').length);

  if (!state.terminals.length) {
    host.innerHTML = `<p class="muted">${t('dynamic.noTerminalsYet')}</p>`;
    return;
  }

  host.innerHTML = state.terminals.map((terminal) => `
    <article class="terminal-item">
      <strong>${t('dynamic.terminalTitle', { id: terminal.id })}</strong>
      <div class="muted">${t('dynamic.terminalStore', { storeId: terminal.storeId, type: terminal.type })}</div>
      <div class="actions"><span class="status-tag ${String(terminal.status).toLowerCase().includes('offline') ? 'status-bad' : 'status-good'}">${terminal.status}</span></div>
    </article>
  `).join('');
}

function getDayKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function renderReports() {
  const host = $('reportList');
  $('receiptCount').textContent = String(state.receipts.length);

  const totalsByDay = new Map();
  for (const receipt of state.receipts) {
    const key = getDayKey(receipt.issuedAt);
    const current = totalsByDay.get(key) || { sales: 0, receipts: 0 };
    current.sales += Number(receipt.total || 0);
    current.receipts += 1;
    totalsByDay.set(key, current);
  }

  const sortedDays = [...totalsByDay.entries()].sort(([a], [b]) => b.localeCompare(a)).slice(0, 5);
  const today = getDayKey(new Date());
  $('todaySalesValue').textContent = money(totalsByDay.get(today)?.sales || 0);

  if (!sortedDays.length) {
    host.innerHTML = `<p class="muted">${t('dynamic.noSalesYet')}</p>`;
    return;
  }

  host.innerHTML = sortedDays.map(([day, report]) => `
    <article class="report-item">
      <strong>${day}</strong>
      <div class="muted">${t('dynamic.receiptsCount', { count: report.receipts })}</div>
      <div>${money(report.sales)}</div>
    </article>
  `).join('');
}

function renderWarnings() {
  const host = $('warningList');
  if (!state.warnings.length) {
    host.innerHTML = `<p class="muted">${t('dynamic.noWarningsYet')}</p>`;
    return;
  }

  host.innerHTML = state.warnings.map((warning) => `
    <article class="warning-item">
      <div>
        <strong>${warning.type}</strong>
        <p>${warning.message}</p>
      </div>
      <span class="warning-severity severity-${warning.severity}">${warning.severity}</span>
    </article>
  `).join('');
}

function updateConnectionPill() {
  setPill($('connectionPill'), state.token ? t('dynamic.online') : t('dynamic.offline'), state.token ? 'success' : 'neutral');
}

async function loadEmployee() {
  if (!state.token) {
    state.employee = null;
    $('employeeMeta').textContent = t('dynamic.noUserLoaded');
    applyRoleAccess();
    applyRoleLanguagePolicy();
    return;
  }

  state.employee = await api('/employees/me');
  $('employeeMeta').textContent = `${state.employee.fullName || t('dynamic.employeeDefault')} · ${state.employee.role || t('dynamic.roleUnknown')}`;
  applyRoleAccess();
  applyRoleLanguagePolicy();
}

async function loadPublicData() {
  const [stores, products, terminals] = await Promise.all([
    api('/stores'),
    api('/products'),
    api('/terminals')
  ]);

  state.stores = Array.isArray(stores) ? stores : [];
  state.products = Array.isArray(products) ? products : [];
  state.terminals = Array.isArray(terminals) ? terminals : [];

  renderStores();
  renderTerminals();
  renderProducts();
  applyRoleLanguagePolicy();
}

async function loadPrivateData() {
  if (!state.token) {
    state.receipts = [];
    state.inventory = [];
    state.forecasts = [];
    state.warnings = [];
    renderCart();
    renderInventory();
    renderTerminalsDashboard();
    renderReports();
    renderWarnings();
    return;
  }

  const [receipts, inventory, forecasts] = await Promise.all([
    api('/receipts'),
    api('/inventory/snapshot'),
    api('/forecasts')
  ]);

  state.receipts = Array.isArray(receipts) ? receipts : [];
  state.inventory = Array.isArray(inventory) ? inventory : [];
  state.forecasts = Array.isArray(forecasts) ? forecasts : [];

  renderInventory();
  renderTerminalsDashboard();
  renderReports();
  renderWarnings();
}

async function refreshAll() {
  try {
    updateConnectionPill();
    await loadEmployee();
    await Promise.all([loadPublicData(), loadPrivateData()]);
  } catch (error) {
    $('employeeMeta').textContent = error.message;
  }
}

async function createCart() {
  const storeId = Number($('storeSelect').value || currentStoreId());
  const terminalId = Number($('terminalSelect').value || currentTerminalId());

  if (!storeId || !terminalId) {
    throw new Error(t('errors.selectStoreTerminal'));
  }

  state.cart = await api('/carts', {
    method: 'POST',
    body: JSON.stringify({ storeId, terminalId, status: 'open' })
  });

  state.cartDraft = { storeId, terminalId };
  await loadCart(state.cart.id);
}

async function loadCart(cartId) {
  if (!cartId) {
    state.cart = null;
    renderCart();
    return;
  }

  state.cart = await api(`/carts/${cartId}`);
  renderCart();
}

async function addProductToCart(productId) {
  if (!state.cart?.id) {
    await createCart();
  }

  const product = state.products.find((entry) => entry.id === Number(productId));
  if (!product) {
    throw new Error(t('errors.productNotFound'));
  }

  await api('/cart-items', {
    method: 'POST',
    body: JSON.stringify({
      cartId: state.cart.id,
      productId: product.id,
      qty: 1,
      unitPrice: Number(product.price)
    })
  });

  await loadCart(state.cart.id);
}

async function addProductFromScan(scanValue) {
  const term = String(scanValue || '').trim().toLowerCase();
  if (!term) {
    return;
  }

  const product = state.products.find((entry) => {
    const barcode = String(entry.barcode || '').toLowerCase();
    const name = String(entry.name || '').toLowerCase();
    const sku = String(entry.sku || '').toLowerCase();
    return barcode === term || sku === term || name.includes(term);
  });

  if (!product) {
    throw new Error(t('errors.noProductMatch', { scan: scanValue }));
  }

  await addProductToCart(product.id);
}

async function updateCartItemQuantity(itemId, qty) {
  await api(`/cart-items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ qty: Number(qty) })
  });

  await loadCart(state.cart.id);
}

async function removeCartItem(itemId) {
  await api(`/cart-items/${itemId}`, { method: 'DELETE' });
  await loadCart(state.cart.id);
}

async function clearCart() {
  if (!state.cart?.items?.length) return;
  for (const item of [...state.cart.items]) {
    await removeCartItem(item.id);
  }
}

async function closeCart() {
  if (!state.cart?.id) return;
  await api(`/carts/${state.cart.id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'closed' })
  });
  state.cart = null;
  renderCart();
}

async function checkout() {
  if (!state.cart?.id) {
    throw new Error(t('errors.openCartFirst'));
  }

  const totals = calculateCartTotals(state.cart);
  const payment = await api('/payments', {
    method: 'POST',
    body: JSON.stringify({
      cartId: state.cart.id,
      method: 'cash',
      provider: 'pos',
      amount: Number($('paymentAmount').value || totals.total),
      status: 'paid',
      providerTx: `TX-${Date.now()}`
    })
  });

  const receipt = await api(`/receipts/generate/${state.cart.id}`, {
    method: 'POST',
    body: JSON.stringify({ discountTotal: 0, currency: 'USD' })
  });

  await api(`/carts/${state.cart.id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'closed' })
  });

  $('paymentResult').innerHTML = `
    <strong>${t('dynamic.paid', { amount: money(payment.amount) })}</strong>
    <div>${t('dynamic.receipt', { receiptNo: receipt.receiptNo })}</div>
    <div class="muted">${t('dynamic.paymentId', { id: payment.id })}</div>
  `;

  flash($('paymentResult'));
  state.lastReceipt = receipt;
  state.cart = null;
  renderCart();
  await loadPrivateData();
}

function printLastReceipt() {
  if (!state.lastReceipt) {
    $('paymentResult').innerHTML = `<span class="muted">${t('dynamic.noReceiptPrint')}</span>`;
    return;
  }

  const printWindow = window.open('', '_blank', 'width=360,height=640');
  if (!printWindow) {
    $('paymentResult').innerHTML = `<span class="muted">${t('dynamic.allowPopups')}</span>`;
    return;
  }

  printWindow.document.write(`
    <html>
      <head><title>${t('print.title', { receiptNo: state.lastReceipt.receiptNo })}</title></head>
      <body style="font-family: Arial, sans-serif; padding: 12px;">
        <h2>${t('print.header')}</h2>
        <p><strong>${t('print.receiptLabel')}</strong> ${state.lastReceipt.receiptNo}</p>
        <p><strong>${t('print.totalLabel')}</strong> ${money(state.lastReceipt.total)}</p>
        <p><strong>${t('print.dateLabel')}</strong> ${new Date(state.lastReceipt.issuedAt).toLocaleString()}</p>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

async function generateForecastWarnings() {
  if (!state.stores[0]) {
    throw new Error(t('errors.loadStoreDataFirst'));
  }

  const forecast = await api('/forecasts/generate', {
    method: 'POST',
    body: JSON.stringify({ storeId: state.stores[0].id, horizonDays: 7 })
  });

  state.warnings = forecast.warnings || [];
  renderWarnings();
}

async function bootstrapEmployee() {
  const fullName = $('bootstrapName').value.trim();
  const email = $('bootstrapEmail').value.trim();
  const password = $('bootstrapPassword').value;
  const storeId = Number($('bootstrapStoreId').value || state.stores[0]?.id || 1);
  const role = $('bootstrapRole').value;

  const employee = await api('/employees', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password, storeId, role, isActive: true })
  });

  $('bootstrapResult').innerHTML = `<strong>${t('dynamic.created')}</strong><div>${employee.email}</div>`;
  flash($('bootstrapResult'));
}

function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.addEventListener('click', () => showTab(button.dataset.tab));
  });

  $('refreshAllBtn').addEventListener('click', refreshAll);
  $('languageSelect').addEventListener('change', (event) => {
    setLanguage(event.target.value, true);
  });
  $('storeSelect').addEventListener('change', (event) => {
    state.cartDraft.storeId = event.target.value;
    renderStoreLanguageControls();
    applyRoleLanguagePolicy(Number(event.target.value));
  });
  $('terminalSelect').addEventListener('change', (event) => { state.cartDraft.terminalId = event.target.value; });
  $('storeLangStore').addEventListener('change', (event) => {
    const nextStoreId = Number(event.target.value || 0);
    const preferred = preferredStoreLanguage(nextStoreId) || browserLanguage();
    $('storeLangSelect').value = preferred;
  });
  $('saveStoreLangBtn').addEventListener('click', () => {
    const storeId = Number($('storeLangStore').value || 0);
    if (!storeId) return;
    const lang = $('storeLangSelect').value;
    state.storeLanguageMap[String(storeId)] = lang;
    writeStoreLanguageMap();

    const store = state.stores.find((entry) => entry.id === storeId);
    $('storeLangResult').innerHTML = `<strong>${t('dynamic.storeLangSaved', { lang: lang.toUpperCase(), store: store?.name || `#${storeId}` })}</strong>`;
    flash($('storeLangResult'));

    if (Number(state.cartDraft.storeId || 0) === storeId) {
      applyRoleLanguagePolicy(storeId);
    }
  });
  $('clearStoreLangBtn').addEventListener('click', () => {
    const storeId = Number($('storeLangStore').value || 0);
    if (!storeId) return;
    delete state.storeLanguageMap[String(storeId)];
    writeStoreLanguageMap();
    const store = state.stores.find((entry) => entry.id === storeId);
    $('storeLangResult').innerHTML = `<strong>${t('dynamic.storeLangCleared', { store: store?.name || `#${storeId}` })}</strong>`;
    flash($('storeLangResult'));

    const preferred = preferredStoreLanguage(storeId) || browserLanguage();
    $('storeLangSelect').value = preferred;
    if (Number(state.cartDraft.storeId || 0) === storeId) {
      applyRoleLanguagePolicy(storeId);
    }
  });
  $('productSearch').addEventListener('input', (event) => { state.search = event.target.value; renderProducts(); });
  $('addScanBtn').addEventListener('click', async () => {
    const value = $('scanInput').value;
    await addProductFromScan(value);
    $('scanInput').value = '';
    $('scanInput').focus();
  });
  $('scanInput').addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    const value = $('scanInput').value;
    await addProductFromScan(value);
    $('scanInput').value = '';
  });
  $('createCartBtn').addEventListener('click', async () => { await createCart(); });
  $('closeCartBtn').addEventListener('click', async () => { await closeCart(); });
  $('clearCartBtn').addEventListener('click', async () => { await clearCart(); });
  $('paymentForm').addEventListener('submit', async (event) => { event.preventDefault(); await checkout(); });
  $('printReceiptBtn').addEventListener('click', printLastReceipt);
  $('refreshReportsBtn').addEventListener('click', loadPrivateData);
  $('refreshInventoryBtn').addEventListener('click', loadPrivateData);
  $('refreshTerminalsBtn').addEventListener('click', loadPrivateData);
  $('refreshForecastBtn').addEventListener('click', generateForecastWarnings);
  $('bootstrapForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await bootstrapEmployee();
  });
  $('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const result = await api('/employees/login', {
      method: 'POST',
      body: JSON.stringify({
        email: $('loginEmail').value,
        password: $('loginPassword').value
      }),
      headers: {}
    });

    state.token = result.token;
    localStorage.setItem('qc_token', state.token);
    updateConnectionPill();
    await refreshAll();
  });
  $('logoutBtn').addEventListener('click', async () => {
    state.token = '';
    localStorage.removeItem('qc_token');
    state.employee = null;
    state.cart = null;
    state.lastReceipt = null;
    updateConnectionPill();
    $('employeeMeta').textContent = t('dynamic.noUserLoaded');
    applyRoleAccess();
    renderCart();
    await loadPrivateData();
  });
  $('cartItems').addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.dataset.addProduct) {
      await addProductToCart(target.dataset.addProduct);
      return;
    }

    if (target.dataset.qty) {
      await updateCartItemQuantity(target.dataset.qty, target.dataset.value);
      return;
    }

    if (target.dataset.remove) {
      await removeCartItem(target.dataset.remove);
    }
  });
}

async function init() {
  state.storeLanguageMap = readStoreLanguageMap();

  if (!SUPPORTED_LANGS.includes(state.language)) {
    state.language = 'en';
  }

  const languageSelect = $('languageSelect');
  if (languageSelect) {
    languageSelect.value = state.language;
  }

  if (!localStorage.getItem('qc_lang')) {
    state.language = browserLanguage();
  }

  setLanguage(state.language, false);
  bindEvents();
  applyRoleAccess();
  await refreshAll();
}

init().catch((error) => {
  $('employeeMeta').textContent = error.message;
});