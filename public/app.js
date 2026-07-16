const state = {
  token: localStorage.getItem('qc_token') || '',
  employee: null,
  inventory: [],
  receipts: [],
  forecasts: [],
  warnings: []
};

const $ = (id) => document.getElementById(id);

function setStatus(text, ok = true) {
  const pill = $('authPill');
  pill.textContent = text;
  pill.style.background = ok ? 'rgba(110, 231, 216, 0.14)' : 'rgba(255, 122, 144, 0.16)';
  pill.style.color = ok ? 'var(--accent)' : 'var(--danger)';
  pill.style.borderColor = ok ? 'rgba(110, 231, 216, 0.24)' : 'rgba(255, 122, 144, 0.24)';
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    },
    ...options
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

function flash(el) {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

function renderInventory() {
  const host = $('inventoryTable');
  if (!state.inventory.length) {
    host.innerHTML = '<p class="muted">No inventory loaded yet.</p>';
    return;
  }

  const rows = state.inventory.map((item) => `
    <tr>
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.barcode}</td>
      <td>${item.stockQty}</td>
      <td>${item.reorderLevel}</td>
      <td>${item.isActive ? 'Active' : 'Inactive'}</td>
    </tr>
  `).join('');

  host.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Barcode</th><th>Stock</th><th>Reorder</th><th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderWarnings(warnings = []) {
  const host = $('warningList');
  if (!warnings.length) {
    host.innerHTML = '<p class="muted">No risk warnings returned yet.</p>';
    return;
  }

  host.innerHTML = warnings.map((warning) => `
    <div class="warning-item">
      <div>
        <strong>${warning.type}</strong>
        <p>${warning.message}</p>
      </div>
      <span class="warning-severity severity-${warning.severity}">${warning.severity}</span>
    </div>
  `).join('');
}

function renderReceipts() {
  const host = $('receiptTable');
  $('receiptCount').textContent = String(state.receipts.length);

  if (!state.receipts.length) {
    host.innerHTML = '<p class="muted">No receipts loaded yet.</p>';
    return;
  }

  const rows = state.receipts.slice(0, 8).map((receipt) => `
    <tr>
      <td>${receipt.id}</td>
      <td>${receipt.receiptNo}</td>
      <td>${receipt.total.toFixed ? receipt.total.toFixed(2) : receipt.total}</td>
      <td>${new Date(receipt.issuedAt).toLocaleString()}</td>
    </tr>
  `).join('');

  host.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Receipt No</th><th>Total</th><th>Issued</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderForecasts() {
  const host = $('forecastCards');
  $('forecastCount').textContent = String(state.forecasts.length);

  if (!state.forecasts.length) {
    host.innerHTML = '<p class="muted">No forecasts loaded yet.</p>';
    return;
  }

  host.innerHTML = state.forecasts.slice(0, 6).map((forecast) => {
    const confidence = Number(forecast.confidence || 0) * 100;
    return `
      <article class="forecast-card">
        <span class="muted">${forecast.modelName || 'Forecast'}</span>
        <strong>${Number(forecast.predictedRevenue || 0).toFixed(2)}</strong>
        <div class="bar" style="width:${Math.max(12, confidence)}%"></div>
        <div class="meta">${Number(forecast.predictedUnits || 0).toFixed(2)} units · ${confidence.toFixed(0)}% confidence</div>
      </article>
    `;
  }).join('');
}

async function loadEmployee() {
  if (!state.token) {
    state.employee = null;
    $('employeeMeta').textContent = 'No user loaded';
    setStatus('Signed out', false);
    return;
  }

  try {
    state.employee = await api('/employees/me');
    $('employeeMeta').textContent = `${state.employee.fullName || 'Employee'} · ${state.employee.role || 'role unknown'}`;
    setStatus('Signed in', true);
  } catch (error) {
    state.token = '';
    localStorage.removeItem('qc_token');
    $('employeeMeta').textContent = error.message;
    setStatus('Signed out', false);
  }
}

async function loadInventory() {
  if (!state.token) {
    state.inventory = [];
    renderInventory();
    return;
  }

  try {
    state.inventory = await api('/inventory/snapshot');
    $('lowStockCount').textContent = String(state.inventory.filter((item) => item.stockQty <= item.reorderLevel).length);
    renderInventory();
  } catch (error) {
    $('inventoryTable').innerHTML = `<p class="muted">${error.message}</p>`;
  }
}

async function loadReceipts() {
  if (!state.token) {
    state.receipts = [];
    renderReceipts();
    return;
  }

  try {
    state.receipts = await api('/receipts');
    renderReceipts();
  } catch (error) {
    $('receiptTable').innerHTML = `<p class="muted">${error.message}</p>`;
  }
}

async function loadForecasts() {
  if (!state.token) {
    state.forecasts = [];
    renderForecasts();
    renderWarnings(state.warnings);
    return;
  }

  try {
    state.forecasts = await api('/forecasts');
    renderForecasts();
    renderWarnings(state.warnings);
  } catch (error) {
    $('forecastCards').innerHTML = `<p class="muted">${error.message}</p>`;
  }
}

async function syncAll() {
  await Promise.all([loadEmployee(), loadInventory(), loadReceipts(), loadForecasts()]);
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const jump = target.dataset.jump;
  if (!jump) {
    return;
  }

  document.getElementById(jump)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

$('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
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
    $('employeeMeta').textContent = `${result.employee.fullName || 'Employee'} · ${result.employee.role || 'role'}`;
    setStatus('Signed in', true);
    await syncAll();
  } catch (error) {
    setStatus('Login failed', false);
    $('employeeMeta').textContent = error.message;
  }
});

$('logoutBtn').addEventListener('click', async () => {
  state.token = '';
  localStorage.removeItem('qc_token');
  state.employee = null;
  state.warnings = [];
  $('employeeMeta').textContent = 'No user loaded';
  setStatus('Signed out', false);
  renderInventory();
  renderReceipts();
  renderForecasts();
  renderWarnings(state.warnings);
});

$('refreshInventory').addEventListener('click', loadInventory);
$('refreshForecasts').addEventListener('click', loadForecasts);

$('receiptForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const cartId = $('receiptCartId').value;
    const discountTotal = Number($('receiptDiscount').value || 0);
    const receipt = await api(`/receipts/generate/${cartId}`, {
      method: 'POST',
      body: JSON.stringify({ discountTotal })
    });

    $('receiptResult').innerHTML = `<strong>${receipt.receiptNo}</strong><div>Total: ${Number(receipt.total).toFixed(2)}</div>`;
    await loadReceipts();
  } catch (error) {
    $('receiptResult').innerHTML = `<p class="muted">${error.message}</p>`;
  }
});

$('forecastForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const payload = {
      storeId: Number($('forecastStoreId').value),
      horizonDays: Number($('forecastHorizon').value || 7)
    };

    const productId = $('forecastProductId').value;
    if (productId) {
      payload.productId = Number(productId);
    }

    const result = await api('/forecasts/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    state.warnings = result.warnings || [];
    renderWarnings(state.warnings);
    $('forecastResult').innerHTML = `
      <strong>Prediction saved</strong>
      <div>Units: ${Number(result.forecast.predictedUnits).toFixed(2)} · Revenue: ${Number(result.forecast.predictedRevenue).toFixed(2)}</div>
      <div>Warnings: ${result.warnings?.length || 0}</div>
    `;
    await loadForecasts();
  } catch (error) {
    $('forecastResult').innerHTML = `<p class="muted">${error.message}</p>`;
  }
});

if (state.token) {
  setStatus('Signed in', true);
}

syncAll();