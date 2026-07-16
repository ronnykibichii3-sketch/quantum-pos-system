const state = {
  token: localStorage.getItem('qc_token') || '',
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

const $ = (id) => document.getElementById(id);

function setPill(el, text, tone = 'neutral') {
  el.textContent = text;
  el.className = `pill pill-${tone}`;
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
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
    host.innerHTML = '<p class="muted">No products loaded.</p>';
    return;
  }

  host.innerHTML = products.map((product) => `
    <article class="product-card">
      <strong>${product.name}</strong>
      <div class="muted">${product.barcode}</div>
      <div>${money(product.price)} · Stock ${product.stockQty}</div>
      <div class="actions">
        <button data-add-product="${product.id}" type="button">Add</button>
      </div>
    </article>
  `).join('');
}

function renderCart() {
  const host = $('cartItems');
  const cart = state.cart;

  if (!cart) {
    setPill($('activeCartPill'), 'No active cart', 'neutral');
    setPill($('cartStatusPill'), 'Waiting', 'neutral');
    host.innerHTML = '<p class="muted">Create a sale to begin adding items.</p>';
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
    host.innerHTML = '<p class="muted">Cart is empty.</p>';
    return;
  }

  host.innerHTML = cart.items.map((item) => `
    <article class="cart-item">
      <strong>${item.product?.name || `Product ${item.productId}`}</strong>
      <div class="muted">${item.qty} × ${money(item.unitPrice)} = ${money(item.totalPrice)}</div>
      <div class="actions">
        <button type="button" data-qty="${item.id}" data-value="${Math.max(1, Number(item.qty) - 1)}">−</button>
        <button type="button" data-qty="${item.id}" data-value="${Number(item.qty) + 1}">+</button>
        <button type="button" class="ghost" data-remove="${item.id}">Remove</button>
      </div>
    </article>
  `).join('');
}

function renderInventory() {
  const host = $('inventoryTable');
  $('lowStockCount').textContent = String(state.inventory.filter((item) => item.stockQty <= item.reorderLevel).length);

  if (!state.inventory.length) {
    host.innerHTML = '<p class="muted">No inventory loaded yet.</p>';
    return;
  }

  host.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Product</th><th>Stock</th><th>Reorder</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${state.inventory.slice(0, 12).map((item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.stockQty}</td>
            <td>${item.reorderLevel}</td>
            <td>${item.isActive ? 'Active' : 'Inactive'}</td>
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
    host.innerHTML = '<p class="muted">No terminals loaded yet.</p>';
    return;
  }

  host.innerHTML = state.terminals.map((terminal) => `
    <article class="terminal-item">
      <strong>Terminal #${terminal.id}</strong>
      <div class="muted">Store ${terminal.storeId} · ${terminal.type}</div>
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
    host.innerHTML = '<p class="muted">No sales have been recorded yet.</p>';
    return;
  }

  host.innerHTML = sortedDays.map(([day, report]) => `
    <article class="report-item">
      <strong>${day}</strong>
      <div class="muted">Receipts ${report.receipts}</div>
      <div>${money(report.sales)}</div>
    </article>
  `).join('');
}

function renderWarnings() {
  const host = $('warningList');
  if (!state.warnings.length) {
    host.innerHTML = '<p class="muted">Forecast warnings will appear here after a forecast run.</p>';
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
  setPill($('connectionPill'), state.token ? 'Online' : 'Offline', state.token ? 'success' : 'neutral');
}

async function loadEmployee() {
  if (!state.token) {
    state.employee = null;
    $('employeeMeta').textContent = 'No user loaded';
    applyRoleAccess();
    return;
  }

  state.employee = await api('/employees/me');
  $('employeeMeta').textContent = `${state.employee.fullName || 'Employee'} · ${state.employee.role || 'role unknown'}`;
  applyRoleAccess();
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
    throw new Error('Select a store and terminal first');
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
    throw new Error('Product not found');
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
    throw new Error(`No product matches scan: ${scanValue}`);
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
    throw new Error('Open a cart first');
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
    <strong>Paid ${money(payment.amount)}</strong>
    <div>Receipt ${receipt.receiptNo}</div>
    <div class="muted">Payment ID ${payment.id}</div>
  `;

  flash($('paymentResult'));
  state.lastReceipt = receipt;
  state.cart = null;
  renderCart();
  await loadPrivateData();
}

function printLastReceipt() {
  if (!state.lastReceipt) {
    $('paymentResult').innerHTML = '<span class="muted">No receipt to print yet.</span>';
    return;
  }

  const printWindow = window.open('', '_blank', 'width=360,height=640');
  if (!printWindow) {
    $('paymentResult').innerHTML = '<span class="muted">Allow popups to print receipt.</span>';
    return;
  }

  printWindow.document.write(`
    <html>
      <head><title>Receipt ${state.lastReceipt.receiptNo}</title></head>
      <body style="font-family: Arial, sans-serif; padding: 12px;">
        <h2>Quantum POS Receipt</h2>
        <p><strong>Receipt:</strong> ${state.lastReceipt.receiptNo}</p>
        <p><strong>Total:</strong> ${money(state.lastReceipt.total)}</p>
        <p><strong>Date:</strong> ${new Date(state.lastReceipt.issuedAt).toLocaleString()}</p>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

async function generateForecastWarnings() {
  if (!state.stores[0]) {
    throw new Error('Load store data first');
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

  $('bootstrapResult').innerHTML = `<strong>Created</strong><div>${employee.email}</div>`;
  flash($('bootstrapResult'));
}

function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.addEventListener('click', () => showTab(button.dataset.tab));
  });

  $('refreshAllBtn').addEventListener('click', refreshAll);
  $('storeSelect').addEventListener('change', (event) => { state.cartDraft.storeId = event.target.value; });
  $('terminalSelect').addEventListener('change', (event) => { state.cartDraft.terminalId = event.target.value; });
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
    $('employeeMeta').textContent = 'No user loaded';
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
  bindEvents();
  updateConnectionPill();
  applyRoleAccess();
  await refreshAll();
}

init().catch((error) => {
  $('employeeMeta').textContent = error.message;
});