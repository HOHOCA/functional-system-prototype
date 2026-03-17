class DataTransferSettingsComponent {
  constructor(options) {
    this.options = options || {};
    this.rootEl = null;
    this.tooltipEl = null;
  }

  mount(containerEl) {
    if (!containerEl) return;
    containerEl.classList.add('system-settings-scope', 'settings-panel', 'active');
    this.rootEl = containerEl;
    this.rootEl.innerHTML = this.render();
    this.bindEvents();
    this.syncRowEditState();
    this.ensureAtLeastOneRow(false);
    this.ensureAtLeastOneRow(true);
  }

  render() {
    return `
      <h2 class="panel-title">数据传输设置</h2>
      <div class="panel-tabs">
        <span class="panel-tab active" data-subtab="local">本地节点</span>
        <span class="panel-tab" data-subtab="remote">远程节点</span>
      </div>

      <div class="data-table-wrap subtab-content active" id="wrap-local-node">
        <table class="data-table">
          <thead><tr>
            <th>节点名称</th><th>AE Title</th><th>端口号</th><th>IP</th><th></th>
          </tr></thead>
          <tbody id="data-transfer-tbody">
            <tr>
              <td><input type="text" class="cell-input" value="本地节点0000000000" readonly></td>
              <td><input type="text" class="cell-input" value="4DCT01" readonly></td>
              <td><input type="text" class="cell-input" value="104" readonly></td>
              <td><input type="text" class="cell-input" value="192.168.2.22" readonly></td>
              <td><span class="row-actions"><button type="button" title="删除"><i class="fa-solid fa-trash-can"></i></button></span></td>
            </tr>
            <tr>
              <td><input type="text" class="cell-input" value="本地节点0000000000" readonly></td>
              <td><input type="text" class="cell-input" value="4DCT02" readonly></td>
              <td><input type="text" class="cell-input" value="104" readonly></td>
              <td><input type="text" class="cell-input" value="192.168.2.22" readonly></td>
              <td><span class="row-actions"><button type="button" title="删除"><i class="fa-solid fa-trash-can"></i></button></span></td>
            </tr>
            <tr class="selected">
              <td><input type="text" class="cell-input" value="本地节点0000000000"></td>
              <td><input type="text" class="cell-input" value="4DCT03"></td>
              <td><input type="text" class="cell-input" value="104"></td>
              <td><input type="text" class="cell-input" value="192.168.2.22"></td>
              <td><span class="row-actions"><button type="button" title="删除"><i class="fa-solid fa-trash-can"></i></button></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="data-table-wrap subtab-content" id="wrap-remote-node">
        <table class="data-table remote-table">
          <thead><tr>
            <th>节点名称</th>
            <th>AE Title <i class="fa-solid fa-circle-question th-help-icon" data-help="ae-title"></i></th>
            <th>端口</th>
            <th>IP地址</th>
            <th>导出格式 <i class="fa-solid fa-circle-question th-help-icon" data-help="export-format"></i></th>
            <th></th>
          </tr></thead>
          <tbody id="data-transfer-remote-tbody">
            <tr class="selected">
              <td><input type="text" class="cell-input" value="远程节点0000000000"></td>
              <td><input type="text" class="cell-input" value="4DCT01"></td>
              <td><input type="text" class="cell-input" value="104"></td>
              <td><input type="text" class="cell-input" value="192.168.2.22"></td>
              <td>
                <select class="cell-select">
                  <option value="默认格式" selected>默认格式</option>
                  <option value="Eclipse 15.5_ROI">Eclipse 15.5_ROI</option>
                </select>
              </td>
              <td>
                <span class="row-actions">
                  <button type="button" title="删除"><i class="fa-solid fa-trash-can"></i></button>
                  <button type="button" title="测试连接"><i class="fa-solid fa-plug"></i></button>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel-actions">
        <button type="button" class="btn btn-secondary btn-add" id="btn-add-node" title="增加一行">
          <i class="fa-solid fa-plus"></i>
        </button>
        <div class="btn-group-right">
          <button type="button" class="btn btn-secondary">取消</button>
          <button type="button" class="btn btn-primary">确定</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    if (!this.rootEl) return;

    // 子 tab 切换
    this.rootEl.querySelectorAll('.panel-tab').forEach((t) => {
      t.addEventListener('click', () => {
        this.rootEl.querySelectorAll('.panel-tab').forEach((x) => x.classList.remove('active'));
        t.classList.add('active');
        const subtab = t.getAttribute('data-subtab');
        const wrapLocal = this.rootEl.querySelector('#wrap-local-node');
        const wrapRemote = this.rootEl.querySelector('#wrap-remote-node');
        if (wrapLocal) wrapLocal.classList.toggle('active', subtab === 'local');
        if (wrapRemote) wrapRemote.classList.toggle('active', subtab === 'remote');
      });
    });

    // 行选中
    this.rootEl.addEventListener('click', (e) => {
      const row = e.target && e.target.closest ? e.target.closest('.data-table tbody tr') : null;
      if (!row || (e.target && e.target.closest && e.target.closest('button'))) return;
      const tbody = row.closest('tbody');
      if (!tbody) return;
      tbody.querySelectorAll('tr').forEach((r) => r.classList.remove('selected'));
      row.classList.add('selected');
      this.syncRowEditState();
    });

    // 增加行
    const btnAdd = this.rootEl.querySelector('#btn-add-node');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const activeTab = this.rootEl.querySelector('.panel-tab.active');
        const subtab = activeTab ? activeTab.getAttribute('data-subtab') : 'local';
        const tbodyLocal = this.rootEl.querySelector('#data-transfer-tbody');
        const tbodyRemote = this.rootEl.querySelector('#data-transfer-remote-tbody');

        let targetBody = null;
        let newRow = null;
        if (subtab === 'remote' && tbodyRemote) {
          targetBody = tbodyRemote;
          newRow = document.createElement('tr');
          newRow.innerHTML = this.emptyRemoteRowHtml();
          targetBody.appendChild(newRow);
        } else if (tbodyLocal) {
          targetBody = tbodyLocal;
          newRow = document.createElement('tr');
          newRow.innerHTML = this.emptyLocalRowHtml();
          targetBody.appendChild(newRow);
        }

        if (targetBody && newRow) {
          targetBody.querySelectorAll('tr').forEach((r) => r.classList.remove('selected'));
          newRow.classList.add('selected');
        }

        this.syncRowEditState();
        const firstInput = newRow ? newRow.querySelector('.cell-input') : null;
        if (firstInput) {
          firstInput.focus();
          if (firstInput.select) firstInput.select();
        }
      });
    }

    // 删除/测试连接
    this.rootEl.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('.row-actions button') : null;
      if (!btn || !this.rootEl.contains(btn)) return;
      const row = btn.closest('tr');
      if (!row) return;
      const title = btn.getAttribute('title');
      const tbody = row.closest('tbody');
      const isRemote = tbody && tbody.id === 'data-transfer-remote-tbody';

      if (title === '删除') {
        row.remove();
        this.ensureAtLeastOneRow(isRemote);
      } else if (title === '测试连接') {
        const cells = row.querySelectorAll('.cell-input, .cell-select');
        const name = cells[0] ? cells[0].value : '';
        const port = cells[2] ? cells[2].value : '';
        const ip = cells[3] ? cells[3].value : '';
        alert('测试连接：' + (name || '未命名节点') + ' - ' + ip + ':' + port);
      }
    });

    // tooltip（用问号图标的 data-help）
    this.rootEl.addEventListener('mouseenter', (e) => {
      const icon = e.target && e.target.closest ? e.target.closest('.th-help-icon') : null;
      if (!icon || !this.rootEl.contains(icon)) return;
      const key = icon.getAttribute('data-help');
      let msg = '';
      if (key === 'ae-title') msg = 'AE Title：DICOM 通信中用于标识接收端应用实体的名称。';
      if (key === 'export-format') msg = '导出格式：导出 DICOM/结构时使用的目标系统兼容格式。';
      if (!msg) return;
      this.showTooltip(icon, msg);
    }, true);
    this.rootEl.addEventListener('mousemove', (e) => {
      if (!this.tooltipEl || this.tooltipEl.style.display === 'none') return;
      this.positionTooltip(e.clientX, e.clientY);
    });
    this.rootEl.addEventListener('mouseleave', (e) => {
      const icon = e.target && e.target.closest ? e.target.closest('.th-help-icon') : null;
      if (!icon) return;
      this.hideTooltip();
    }, true);
  }

  syncRowEditState() {
    if (!this.rootEl) return;
    const bodies = [
      this.rootEl.querySelector('#data-transfer-tbody'),
      this.rootEl.querySelector('#data-transfer-remote-tbody')
    ].filter(Boolean);

    bodies.forEach((tbody) => {
      tbody.querySelectorAll('tr').forEach((tr) => {
        const inputs = tr.querySelectorAll('.cell-input');
        if (tr.classList.contains('selected')) {
          inputs.forEach((inp) => inp.removeAttribute('readonly'));
        } else {
          inputs.forEach((inp) => inp.setAttribute('readonly', 'readonly'));
        }
      });
    });
  }

  ensureAtLeastOneRow(isRemote) {
    if (!this.rootEl) return;
    const tbody = this.rootEl.querySelector(isRemote ? '#data-transfer-remote-tbody' : '#data-transfer-tbody');
    if (!tbody) return;
    if (tbody.querySelectorAll('tr').length > 0) return;
    const tr = document.createElement('tr');
    tr.classList.add('selected');
    tr.innerHTML = isRemote ? this.emptyRemoteRowHtml() : this.emptyLocalRowHtml();
    tbody.appendChild(tr);
    this.syncRowEditState();
  }

  emptyLocalRowHtml() {
    return (
      '<td><input type="text" class="cell-input" value="" readonly></td>' +
      '<td><input type="text" class="cell-input" value="" readonly></td>' +
      '<td><input type="text" class="cell-input" value="" readonly></td>' +
      '<td><input type="text" class="cell-input" value="" readonly></td>' +
      '<td><span class="row-actions"><button type="button" title="删除"><i class="fa-solid fa-trash-can"></i></button></span></td>'
    );
  }

  emptyRemoteRowHtml() {
    return (
      '<td><input type="text" class="cell-input" value="" readonly></td>' +
      '<td><input type="text" class="cell-input" value="" readonly></td>' +
      '<td><input type="text" class="cell-input" value="" readonly></td>' +
      '<td><input type="text" class="cell-input" value="" readonly></td>' +
      '<td><select class="cell-select"><option value="" selected></option><option value="默认格式">默认格式</option><option value="Eclipse 15.5_ROI">Eclipse 15.5_ROI</option></select></td>' +
      '<td><span class="row-actions"><button type="button" title="删除"><i class="fa-solid fa-trash-can"></i></button><button type="button" title="测试连接"><i class="fa-solid fa-plug"></i></button></span></td>'
    );
  }

  createTooltip() {
    const el = document.createElement('div');
    el.style.cssText =
      'position:fixed;z-index:9999;max-width:300px;padding:10px 14px;background:#2d2d2d;color:#e0e0e0;font-size:0.8rem;line-height:1.7;border:1px solid #4a4a4a;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.5);pointer-events:none;white-space:pre-line;display:none;';
    document.body.appendChild(el);
    return el;
  }

  showTooltip(iconEl, msg) {
    if (!this.tooltipEl) this.tooltipEl = this.createTooltip();
    this.tooltipEl.textContent = msg;
    this.tooltipEl.style.display = 'block';
    const rect = iconEl.getBoundingClientRect();
    this.positionTooltip(rect.right + 8, rect.top);
  }

  positionTooltip(x, y) {
    if (!this.tooltipEl) return;
    const pad = 12;
    const rect = this.tooltipEl.getBoundingClientRect();
    let left = x + pad;
    let top = y + pad;
    const maxLeft = window.innerWidth - rect.width - pad;
    const maxTop = window.innerHeight - rect.height - pad;
    if (left > maxLeft) left = maxLeft;
    if (top > maxTop) top = maxTop;
    this.tooltipEl.style.left = left + 'px';
    this.tooltipEl.style.top = top + 'px';
  }

  hideTooltip() {
    if (!this.tooltipEl) return;
    this.tooltipEl.style.display = 'none';
  }
}

window.DataTransferSettingsComponent = DataTransferSettingsComponent;

