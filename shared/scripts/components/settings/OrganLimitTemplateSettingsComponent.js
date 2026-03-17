(function () {
  'use strict';

  const TEMPLATE_MAX = 100;
  const ITEM_MAX = 1000;
  const NAME_MAX_LEN = 32;
  const ORGAN_NAME_MAX_LEN = 50;
  const TARGET_AREA_MAX_LEN = 32;
  const WEIGHT_MIN = 0;
  const WEIGHT_MAX = 1000;
  const DOSE_MIN = 1;
  const DOSE_MAX = 15000;
  const VOLUME_MIN = 1;
  const VOLUME_MAX = 100;
  const GEUD_UPPER_MIN = 0;
  const GEUD_UPPER_MAX = 40;
  const GEUD_LOWER_MIN = -40;
  const GEUD_LOWER_MAX = 1;
  const FALLOFF_DOSE_MIN = 1;
  const FALLOFF_DOSE_MAX = 10000;
  const FALLOFF_DIST_MIN = 0;
  const FALLOFF_DIST_MAX = 40;

  const ROI_TYPES = ['OAR', 'PTV', 'CTV', 'GTV'];
  const TARGET_TYPES = ['PTV', 'CTV', 'GTV'];
  const FUNCTIONS_ALL = [
    'Max Dose', 'Min Dose', 'Max DVH', 'Min DVH', 'Uniform Dose',
    'Upper gEUD', 'Lower gEUD', 'Target gEUD', 'Mean Dose', 'Fall Off', 'Inward Reduce'
  ];
  const PRIORITIES = ['最重要', '重要', '一般'];

  const ICON_COPY = '<svg class="icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const ICON_DELETE = '<svg class="icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

  function nextId(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  function getDefaultTemplates() {
    return [
      {
        id: nextId('tpl'),
        name: 'RTOG',
        nameLocked: false,
        items: [
          { id: nextId('item'), organName: 'Brain', type: 'OAR', func: 'Min DVH', priority: '最重要', weight: 100, isSphereHCP: false, condition: { volume: 23, dose: 1203, gEUDa: null, falloffHigh: null, falloffLow: null, falloffDist: null, targetRef: null } },
          { id: nextId('item'), organName: 'InnerEar_L', type: 'OAR', func: 'Min DVH', priority: '重要', weight: 100, isSphereHCP: false, condition: { volume: 23, dose: 5000, gEUDa: null, falloffHigh: null, falloffLow: null, falloffDist: null, targetRef: null } },
          { id: nextId('item'), organName: 'Lens_R', type: 'OAR', func: 'Min DVH', priority: '一般', weight: 100, isSphereHCP: false, condition: { volume: 23, dose: 5000, gEUDa: null, falloffHigh: null, falloffLow: null, falloffDist: null, targetRef: null } }
        ]
      },
      {
        id: nextId('tpl'),
        name: 'SFRT-HN',
        nameLocked: false,
        items: []
      },
      {
        id: nextId('tpl'),
        name: 'Cervical',
        nameLocked: false,
        items: []
      }
    ];
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function hasChinese(str) {
    return /[\u4e00-\u9fff]/.test(str || '');
  }

  class OrganLimitTemplateSettingsComponent {
    constructor(options) {
      this.options = options || {};
      this.rootEl = null;
      this.templates = getDefaultTemplates();
      this.selectedTemplateId = this.templates[0] ? this.templates[0].id : null;
      this.lastSavedSnapshot = null;
      this.dirty = false;
      this.leftSearchKeyword = '';
      this.rightSearchKeyword = '';
      this.selectedRowId = null;
      this.nameEditingTemplateId = null;
    }

    getSelectedTemplate() {
      if (!this.selectedTemplateId) return null;
      return this.templates.find(t => t.id === this.selectedTemplateId) || null;
    }

    getVisibleTemplates() {
      const k = (this.leftSearchKeyword || '').trim().toLowerCase();
      if (!k) return this.templates;
      return this.templates.filter(t => (t.name || '').toLowerCase().indexOf(k) !== -1);
    }

    getConventionalFractionationBaseName() {
      const prefix = 'conventional fractionation';
      let n = 0;
      this.templates.forEach(t => {
        if ((t.name || '').indexOf(prefix) === 0) {
          const match = t.name.match(/\((\d+)\)$/);
          if (match) n = Math.max(n, parseInt(match[1], 10));
          else n = Math.max(n, 1);
        }
      });
      return n + 1;
    }

    showConfirm(message, onConfirm, onCancel) {
      const mask = document.createElement('div');
      mask.className = 'organ-limit-modal-mask';
      mask.innerHTML = `
        <div class="organ-limit-modal">
          <div class="organ-limit-modal-body">${message}</div>
          <div class="organ-limit-modal-footer">
            <button type="button" class="btn btn-secondary organ-limit-modal-cancel">取消</button>
            <button type="button" class="btn btn-primary organ-limit-modal-confirm">确认</button>
          </div>
        </div>
      `;
      document.body.appendChild(mask);
      const close = () => {
        mask.remove();
      };
      mask.querySelector('.organ-limit-modal-confirm').addEventListener('click', () => {
        close();
        if (onConfirm) onConfirm();
      });
      mask.querySelector('.organ-limit-modal-cancel').addEventListener('click', () => {
        close();
        if (onCancel) onCancel();
      });
      mask.addEventListener('click', (e) => {
        if (e.target === mask) {
          close();
          if (onCancel) onCancel();
        }
      });
    }

    showAlert(message, onClose) {
      const mask = document.createElement('div');
      mask.className = 'organ-limit-modal-mask';
      mask.innerHTML = `
        <div class="organ-limit-modal">
          <div class="organ-limit-modal-body">${message}</div>
          <div class="organ-limit-modal-footer">
            <button type="button" class="btn btn-primary organ-limit-modal-ok">确定</button>
          </div>
        </div>
      `;
      document.body.appendChild(mask);
      const close = () => {
        mask.remove();
        if (onClose) onClose();
      };
      mask.querySelector('.organ-limit-modal-ok').addEventListener('click', close);
      mask.addEventListener('click', (e) => {
        if (e.target === mask) close();
      });
    }

    setDirty(value) {
      this.dirty = !!value;
      if (this.rootEl) {
        if (this.dirty) this.rootEl.setAttribute('data-dirty', 'true');
        else this.rootEl.removeAttribute('data-dirty');
      }
    }

    mount(containerEl) {
      if (!containerEl) return;
      containerEl.classList.add('system-settings-scope', 'settings-panel', 'active', 'organ-limit-panel');
      this.rootEl = containerEl;
      this.lastSavedSnapshot = deepClone(this.templates);
      this.setDirty(false);
      this.refresh();
      this.bindEvents();
      this.refreshRightPanel();
    }

    refresh() {
      if (!this.rootEl) return;
      this.rootEl.innerHTML = this.render();
    }

    render() {
      const visible = this.getVisibleTemplates();
      const selectedId = this.selectedTemplateId;
      const tpl = this.getSelectedTemplate();
      const listHtml = visible.map(t => {
        const selected = t.id === selectedId ? ' selected' : '';
        return `
          <div class="organ-limit-list-item${selected}" data-template-id="${t.id}">
            <span class="item-name">${escapeHtml(t.name || '')}</span>
            <span class="item-actions">
              <button type="button" class="btn-copy-tpl" title="复制模板">${ICON_COPY}</button>
              <button type="button" class="btn-del-tpl" title="删除模板">${ICON_DELETE}</button>
            </span>
          </div>
        `;
      }).join('');

      const emptyState = this.templates.length === 0;
      const rightContent = !emptyState && tpl;
      const templateNameValue = tpl ? tpl.name : '';
      const nameReadonly = tpl && tpl.nameLocked ? ' readonly' : '';
      const nameEditing = this.nameEditingTemplateId === (tpl && tpl.id);

      return `
        <h2 class="panel-title">器官限量模板设置</h2>
        <div class="organ-limit-layout">
          <div class="organ-limit-left">
            <div class="organ-limit-left-title">模板列表</div>
            <div class="organ-limit-left-search">
              <input type="text" data-role="organ-limit-left-search" placeholder="搜索模板名称" value="${escapeHtml(this.leftSearchKeyword)}">
            </div>
            <div class="organ-limit-list" data-role="organ-limit-list">
              ${listHtml}
            </div>
            <div class="organ-limit-left-btns">
              <button type="button" class="btn btn-secondary btn-add" data-role="organ-limit-btn-new" title="新建模板"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
          <div class="organ-limit-right">
            <div class="organ-limit-empty-state" data-role="organ-limit-empty-state" style="display:${emptyState ? 'block' : 'none'}; padding: 40px 20px; text-align: center; color: #888; font-size: 0.95rem;">
              暂无模板，请点击左侧「新建模板」添加
            </div>
            <div class="organ-limit-right-content" data-role="organ-limit-right-content" style="display:${rightContent ? 'flex' : 'none'};">
              <div class="organ-limit-right-scroll">
                <div class="organ-limit-right-header">
                  <input type="text" class="template-name template-name-input" data-role="organ-limit-current-name" value="${escapeHtml(templateNameValue)}" maxlength="${NAME_MAX_LEN}"${nameReadonly} placeholder="模板名称">
                  <div class="search-input-wrap" data-role="organ-limit-roi-search-wrap">
                    <button type="button" class="search-icon-btn" data-role="organ-limit-roi-search-btn" title="搜索"><i class="fa-solid fa-search"></i></button>
                    <input type="text" data-role="organ-limit-roi-search" placeholder="请输入器官名称，点击搜索图标或按下回车键开始搜索" value="${escapeHtml(this.rightSearchKeyword)}">
                  </div>
                </div>
                <div class="organ-limit-table-wrap">
                  <table class="organ-limit-table">
                    <thead>
                      <tr>
                        <th>器官名称<span class="required-mark">*</span></th>
                        <th>类型<span class="required-mark">*</span></th>
                        <th>函数<span class="required-mark">*</span></th>
                        <th>条件<span class="required-mark">*</span></th>
                        <th>优先级<span class="required-mark">*</span></th>
                        <th>权重<span class="required-mark">*</span></th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody data-role="organ-limit-tbody">
                      ${this.renderTableRows(tpl)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="organ-limit-right-footer" data-role="organ-limit-footer" style="display:${emptyState ? 'none' : 'flex'};">
              <div class="footer-left">
                <button type="button" class="btn btn-secondary" data-role="organ-limit-btn-new-organ">新增器官限量</button>
                <button type="button" class="btn btn-secondary" data-role="organ-limit-btn-new-sfrt">新增晶格靶区限量</button>
              </div>
              <div class="footer-right">
                <button type="button" class="btn btn-secondary" data-role="organ-limit-btn-cancel">取消</button>
                <button type="button" class="btn btn-primary" data-role="organ-limit-btn-save">保存</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    renderTableRows(tpl) {
      if (!tpl || !tpl.items) return '';
      const keyword = (this.rightSearchKeyword || '').trim().toLowerCase();
      let items = tpl.items;
      if (keyword) {
        items = items.filter(it => (it.organName || '').toLowerCase().indexOf(keyword) !== -1);
      }
      return items.map(item => this.renderOneRow(item, tpl)).join('');
    }

    getConditionFieldsForFunction(func, type) {
      const isTarget = TARGET_TYPES.indexOf(type) !== -1;
      const funcList = isTarget ? FUNCTIONS_ALL : FUNCTIONS_ALL.filter(f => f !== 'Fall Off');
      if (funcList.indexOf(func) === -1) return [];
      switch (func) {
        case 'Max Dose':
        case 'Min Dose':
        case 'Uniform Dose':
        case 'Mean Dose':
          return [{ key: 'dose', label: '剂量[cGy]', min: DOSE_MIN, max: DOSE_MAX }];
        case 'Max DVH':
        case 'Min DVH':
          return [
            { key: 'volume', label: '体积[%]', min: VOLUME_MIN, max: VOLUME_MAX },
            { key: 'dose', label: '剂量[cGy]', min: DOSE_MIN, max: DOSE_MAX }
          ];
        case 'Upper gEUD':
          return [
            { key: 'dose', label: '剂量[cGy]', min: DOSE_MIN, max: DOSE_MAX },
            { key: 'gEUDa', label: 'gEUD a', min: GEUD_UPPER_MIN, max: GEUD_UPPER_MAX }
          ];
        case 'Lower gEUD':
        case 'Target gEUD':
          return [
            { key: 'dose', label: '剂量[cGy]', min: DOSE_MIN, max: DOSE_MAX },
            { key: 'gEUDa', label: 'gEUD a', min: GEUD_LOWER_MIN, max: GEUD_LOWER_MAX }
          ];
        case 'Fall Off':
          return [
            { key: 'falloffHigh', label: '跌落高剂量[cGy]', min: FALLOFF_DOSE_MIN, max: FALLOFF_DOSE_MAX },
            { key: 'falloffLow', label: '跌落低剂量[cGy]', min: FALLOFF_DOSE_MIN, max: FALLOFF_DOSE_MAX },
            { key: 'falloffDist', label: '跌落距离[cm]', min: FALLOFF_DIST_MIN, max: FALLOFF_DIST_MAX }
          ];
        case 'Inward Reduce':
          return [
            { key: 'falloffHigh', label: '跌落高剂量[cGy]', min: FALLOFF_DOSE_MIN, max: FALLOFF_DOSE_MAX },
            { key: 'falloffLow', label: '跌落低剂量[cGy]', min: FALLOFF_DOSE_MIN, max: FALLOFF_DOSE_MAX },
            { key: 'targetRef', label: '对应靶区', maxLen: TARGET_AREA_MAX_LEN }
          ];
        default:
          return [];
      }
    }

    renderConditionCell(item) {
      const type = item.type || 'OAR';
      const func = item.func || '';
      const cond = item.condition || {};
      const fields = this.getConditionFieldsForFunction(func, type);
      if (fields.length === 0) return '<td class="condition-cell"></td>';
      const inputs = fields.map(f => {
        const val = cond[f.key];
        const v = val !== undefined && val !== null ? String(val) : '';
        if (f.maxLen) {
          return `<span class="condition-inline"><label>${f.label}</label><input type="text" class="cell-input condition-input" data-condition-key="${f.key}" maxlength="${f.maxLen}" value="${escapeHtml(v)}"></span>`;
        }
        const min = f.min;
        const max = f.max;
        return `<span class="condition-inline"><label>${f.label}</label><input type="number" class="cell-input condition-input" data-condition-key="${f.key}" min="${min}" max="${max}" step="0.01" value="${v}"></span>`;
      }).join('');
      return `<td class="condition-cell" data-role="condition-cell">${inputs}</td>`;
    }

    renderOneRow(item, tpl) {
      const type = item.type || 'OAR';
      const isTarget = TARGET_TYPES.indexOf(type) !== -1;
      const funcOptions = isTarget ? FUNCTIONS_ALL : FUNCTIONS_ALL.filter(f => f !== 'Fall Off');
      const funcOpts = funcOptions.map(f => `<option value="${f}"${f === (item.func || '') ? ' selected' : ''}>${f}</option>`).join('');
      const typeOpts = ROI_TYPES.map(t => `<option value="${t}"${t === type ? ' selected' : ''}>${t}</option>`).join('');
      const priorityOpts = PRIORITIES.map(p => `<option value="${p}"${p === (item.priority || '') ? ' selected' : ''}>${p}</option>`).join('');
      const organReadonly = item.isSphereHCP ? ' readonly' : '';
      const selected = item.id === this.selectedRowId ? ' selected' : '';
      const condCell = this.renderConditionCell(item);
      return `
        <tr data-row-id="${item.id}" data-sphere="${item.isSphereHCP ? '1' : '0'}" class="${selected}">
          <td><input type="text" class="cell-input cell-organ" data-role="organ-name" maxlength="${ORGAN_NAME_MAX_LEN}" value="${escapeHtml(item.organName || '')}"${organReadonly}></td>
          <td><select class="cell-select cell-type" data-role="organ-type"${item.isSphereHCP ? ' disabled' : ''}>${typeOpts}</select></td>
          <td><select class="cell-select cell-func" data-role="organ-func">${funcOpts}</select></td>
          ${condCell}
          <td><select class="cell-select cell-priority" data-role="organ-priority">${priorityOpts}</select></td>
          <td><input type="number" class="cell-input cell-weight" data-role="organ-weight" min="${WEIGHT_MIN}" max="${WEIGHT_MAX}" value="${item.weight !== undefined ? item.weight : 30}"></td>
          <td>
            <span class="row-actions">
              <button type="button" class="btn-row-copy" title="复制">${ICON_COPY}</button>
              <button type="button" class="btn-row-del" title="删除">${ICON_DELETE}</button>
            </span>
          </td>
        </tr>
      `;
    }

    q(role) {
      return this.rootEl ? this.rootEl.querySelector(`[data-role="${role}"]`) : null;
    }

    collectRowData(tr) {
      if (!tr || !tr.cells) return null;
      const rowId = tr.getAttribute('data-row-id');
      const isSphere = tr.getAttribute('data-sphere') === '1';
      const organInput = tr.querySelector('[data-role="organ-name"]');
      const typeSelect = tr.querySelector('[data-role="organ-type"]');
      const funcSelect = tr.querySelector('[data-role="organ-func"]');
      const prioritySelect = tr.querySelector('[data-role="organ-priority"]');
      const weightInput = tr.querySelector('[data-role="organ-weight"]');
      const condCell = tr.querySelector('[data-role="condition-cell"]');
      const condition = {};
      if (condCell) {
        condCell.querySelectorAll('.condition-input').forEach(inp => {
          const key = inp.getAttribute('data-condition-key');
          const numKeys = ['dose', 'volume', 'gEUDa', 'falloffHigh', 'falloffLow', 'falloffDist'];
          const val = numKeys.indexOf(key) !== -1 ? parseFloat(inp.value) : inp.value;
          condition[key] = val;
        });
      }
      return {
        id: rowId,
        organName: organInput ? organInput.value : '',
        type: typeSelect ? typeSelect.value : 'OAR',
        func: funcSelect ? funcSelect.value : '',
        priority: prioritySelect ? prioritySelect.value : '重要',
        weight: weightInput ? parseInt(weightInput.value, 10) : 30,
        isSphereHCP: isSphere,
        condition
      };
    }

    syncTableToTemplate(tpl) {
      if (!tpl || !this.rootEl) return;
      const tbody = this.q('organ-limit-tbody');
      if (!tbody) return;
      const rows = tbody.querySelectorAll('tr[data-row-id]');
      tpl.items = [];
      rows.forEach(tr => {
        const data = this.collectRowData(tr);
        if (data) {
          data.id = data.id || nextId('item');
          tpl.items.push(data);
        }
      });
    }

    refreshRightPanel() {
      const tpl = this.getSelectedTemplate();
      const nameEl = this.q('organ-limit-current-name');
      if (nameEl && tpl) {
        nameEl.value = tpl.name || '';
        nameEl.readOnly = !!tpl.nameLocked;
      }
      this.selectedRowId = null;
      this.refresh();
      this.rebindEvents();
    }

    validateTemplateName(name, excludeId) {
      if (!name || (name = name.trim()).length === 0) return { ok: false, msg: '模板名称不能为空' };
      if (name.length > NAME_MAX_LEN) return { ok: false, msg: '模板名称不能超过' + NAME_MAX_LEN + '个字符' };
      if (hasChinese(name)) return { ok: false, msg: '模板名称不支持中文' };
      const duplicate = this.templates.some(t => t.id !== excludeId && (t.name || '').trim() === name);
      if (duplicate) return { ok: false, msg: '模板名称不能重复，请重新输入' };
      return { ok: true };
    }

    validateItem(item, allItems, excludeId) {
      const organ = (item.organName || '').trim();
      if (!organ) return { ok: false, msg: '请填写器官名称' };
      if (organ.length > ORGAN_NAME_MAX_LEN) return { ok: false, msg: '器官名称不能超过' + ORGAN_NAME_MAX_LEN + '个字符' };
      const sameName = allItems.filter(it => it.id !== excludeId && (it.organName || '').trim() === organ);
      if (sameName.length > 0 && sameName.some(it => it.type !== item.type)) {
        return { ok: false, msg: '相同名称ROI，器官类型需相同，请重新选择' };
      }
      const w = item.weight;
      if (w < WEIGHT_MIN || w > WEIGHT_MAX) return { ok: false, msg: '权重需在' + WEIGHT_MIN + '～' + WEIGHT_MAX + '之间' };
      const cond = item.condition || {};
      const type = item.type || 'OAR';
      const fields = this.getConditionFieldsForFunction(item.func, type);
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        const val = cond[f.key];
        if (f.min !== undefined && (val === undefined || val === null || Number(val) < f.min || Number(val) > f.max)) {
          return { ok: false, msg: f.label + '应在' + f.min + '～' + f.max + '之间' };
        }
        if (f.maxLen && val && String(val).length > f.maxLen) {
          return { ok: false, msg: f.label + '不能超过' + f.maxLen + '个字符' };
        }
      }
      return { ok: true };
    }

    validateCurrentTemplate() {
      const tpl = this.getSelectedTemplate();
      if (!tpl) return { ok: true };
      this.syncTableToTemplate(tpl);
      for (let i = 0; i < tpl.items.length; i++) {
        const r = this.validateItem(tpl.items[i], tpl.items, null);
        if (!r.ok) return r;
      }
      return { ok: true };
    }

    highlightMissingRequiredInTable() {
      const tbody = this.q('organ-limit-tbody');
      if (!tbody) return { ok: true };
      let hasMissing = false;
      tbody.querySelectorAll('tr[data-row-id]').forEach(tr => {
        const organInput = tr.querySelector('[data-role="organ-name"]');
        const typeSelect = tr.querySelector('[data-role="organ-type"]');
        const funcSelect = tr.querySelector('[data-role="organ-func"]');
        const prioritySelect = tr.querySelector('[data-role="organ-priority"]');
        const weightInput = tr.querySelector('[data-role="organ-weight"]');
        const condInputs = tr.querySelectorAll('.condition-input');
        [organInput, typeSelect, funcSelect, prioritySelect, weightInput].forEach(el => {
          if (!el) return;
          el.classList.remove('field-error');
        });
        condInputs.forEach(inp => inp.classList.remove('field-error'));
        if (organInput && !(organInput.value || '').trim()) {
          organInput.classList.add('field-error');
          hasMissing = true;
        }
        if (typeSelect && !(typeSelect.value || '').trim()) {
          typeSelect.classList.add('field-error');
          hasMissing = true;
        }
        if (funcSelect && !(funcSelect.value || '').trim()) {
          funcSelect.classList.add('field-error');
          hasMissing = true;
        }
        if (prioritySelect && !(prioritySelect.value || '').trim()) {
          prioritySelect.classList.add('field-error');
          hasMissing = true;
        }
        if (weightInput) {
          const v = weightInput.value;
          if (v === '' || isNaN(Number(v))) {
            weightInput.classList.add('field-error');
            hasMissing = true;
          }
        }
        condInputs.forEach(inp => {
          const v = inp.value;
          if (v === '' || (inp.type === 'number' && isNaN(Number(v)))) {
            inp.classList.add('field-error');
            hasMissing = true;
          }
        });
      });
      return { ok: !hasMissing };
    }

    clearFieldErrorIfFilled(target) {
      if (!target) return;
      if (!target.classList.contains('field-error')) return;
      const v = target.value;
      if (v === undefined || v === null) return;
      if (String(v).trim() === '') return;
      if (target.type === 'number' && isNaN(Number(v))) return;
      target.classList.remove('field-error');
    }

    bindEvents() {
      this.rebindEvents();
    }

    rebindEvents() {
      const list = this.q('organ-limit-list');
      const currentNameEl = this.q('organ-limit-current-name');
      const btnNew = this.q('organ-limit-btn-new');
      const leftSearch = this.q('organ-limit-left-search');
      const tbody = this.q('organ-limit-tbody');
      const tableWrap = this.rootEl ? this.rootEl.querySelector('.organ-limit-table-wrap') : null;
      const btnNewOrgan = this.q('organ-limit-btn-new-organ');
      const btnNewSfrt = this.q('organ-limit-btn-new-sfrt');
      const roiSearch = this.q('organ-limit-roi-search');
      const roiSearchBtn = this.q('organ-limit-roi-search-btn');
      const btnCancel = this.q('organ-limit-btn-cancel');
      const btnSave = this.q('organ-limit-btn-save');

      if (leftSearch) {
        leftSearch.addEventListener('input', () => {
          this.leftSearchKeyword = leftSearch.value || '';
          this.refresh();
          this.rebindEvents();
        });
        leftSearch.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.leftSearchKeyword = (leftSearch.value || '').trim();
            this.refresh();
            this.rebindEvents();
          }
        });
      }

      if (list) {
        list.addEventListener('click', (e) => {
          const item = e.target.closest('.organ-limit-list-item');
          if (!item) return;
          const tplId = item.getAttribute('data-template-id');
          if (e.target.closest('.btn-del-tpl')) {
            if (this.dirty) {
              this.showAlert('请先保存或取消当前修改后再删除模板。');
              return;
            }
            this.showConfirm('确认删除所选模板？', () => {
              const idx = this.templates.findIndex(t => t.id === tplId);
              if (idx === -1) return;
              this.templates.splice(idx, 1);
              this.selectedTemplateId = this.templates[0] ? this.templates[0].id : null;
              this.nameEditingTemplateId = null;
              this.setDirty(false);
              this.lastSavedSnapshot = deepClone(this.templates);
              this.refresh();
              this.rebindEvents();
              this.refreshRightPanel();
            });
            return;
          }
          if (e.target.closest('.btn-copy-tpl')) {
            if (this.templates.length >= TEMPLATE_MAX) {
              this.showAlert('器官限量模板上限为100');
              return;
            }
            const src = this.templates.find(t => t.id === tplId);
            if (!src) return;
            const baseName = (src.name || '').trim() || '未命名';
            let name = baseName + '(1)';
            let n = 1;
            while (this.templates.some(t => t.name === name)) {
              n++;
              name = baseName + '(' + n + ')';
            }
            const copy = {
              id: nextId('tpl'),
              name,
              nameLocked: false,
              items: deepClone(src.items).map(it => ({ ...it, id: nextId('item') }))
            };
            this.templates.push(copy);
            this.selectedTemplateId = copy.id;
            this.nameEditingTemplateId = null;
            this.setDirty(true);
            this.refresh();
            this.rebindEvents();
            this.refreshRightPanel();
            return;
          }
          this.selectedTemplateId = tplId;
          this.nameEditingTemplateId = null;
          this.selectedRowId = null;
          this.refresh();
          this.rebindEvents();
          this.refreshRightPanel();
        });
      }

      if (btnNew) {
        btnNew.addEventListener('click', () => {
          if (this.templates.length >= TEMPLATE_MAX) {
            this.showAlert('器官限量模板上限为100');
            return;
          }
          const n = this.getConventionalFractionationBaseName();
          const name = 'conventional fractionation(' + n + ')';
          const tpl = {
            id: nextId('tpl'),
            name,
            nameLocked: false,
            items: []
          };
          this.templates.push(tpl);
          this.selectedTemplateId = tpl.id;
          this.nameEditingTemplateId = tpl.id;
          this.setDirty(true);
          this.refresh();
          this.rebindEvents();
          this.refreshRightPanel();
          const nameEl = this.q('organ-limit-current-name');
          if (nameEl) {
            nameEl.focus();
            nameEl.select();
          }
        });
      }

      if (currentNameEl) {
        currentNameEl.addEventListener('input', (e) => {
          const tpl = this.getSelectedTemplate();
          if (!tpl || tpl.nameLocked) return;
          let v = e.target.value;
          if (hasChinese(v)) {
            e.target.value = v = (v || '').replace(/[\u4e00-\u9fff]/g, '');
          }
          if (v.length > NAME_MAX_LEN) {
            e.target.value = v = v.slice(0, NAME_MAX_LEN);
          }
          tpl.name = v;
          this.setDirty(true);
          const listEl = this.q('organ-limit-list');
          const sel = listEl && listEl.querySelector('.organ-limit-list-item.selected');
          if (sel) {
            const nameSpan = sel.querySelector('.item-name');
            if (nameSpan) nameSpan.textContent = v;
          }
        });
        currentNameEl.addEventListener('blur', () => {
          const tpl = this.getSelectedTemplate();
          if (!tpl || tpl.nameLocked) return;
          const name = (currentNameEl.value || '').trim();
          const result = this.validateTemplateName(name, tpl.id);
          if (!result.ok) {
            const self = this;
            this.showAlert(result.msg, () => {
              const el = self.q('organ-limit-current-name');
              if (el) el.focus();
            });
            return;
          }
          tpl.name = name;
          this.nameEditingTemplateId = null;
        });
      }

      if (roiSearch) {
        const doFilter = () => {
          this.rightSearchKeyword = roiSearch.value || '';
          this.refresh();
          this.rebindEvents();
        };
        roiSearch.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            doFilter();
          }
        });
        if (roiSearchBtn) roiSearchBtn.addEventListener('click', doFilter);
      }

      if (tableWrap && tbody) {
        tableWrap.addEventListener('click', (e) => {
          const row = e.target.closest('tbody tr[data-row-id]');
          if (!row || !tbody.contains(row)) return;
          if (e.target.closest('input, select, .row-actions button')) return;
          this.selectedRowId = row.getAttribute('data-row-id');
          this.refresh();
          this.rebindEvents();
        });
        tableWrap.addEventListener('change', (e) => {
          const target = e.target;
          if (!target || !target.closest) return;
          const row = target.closest('tr[data-row-id]');
          if (!row || !tbody.contains(row)) return;
          this.syncTableToTemplate(this.getSelectedTemplate());
          this.setDirty(true);
          this.clearFieldErrorIfFilled(target);
          if (target.classList.contains('cell-func') || target.classList.contains('cell-type')) {
            this.refresh();
            this.rebindEvents();
          }
        });
        tableWrap.addEventListener('input', (e) => {
          const target = e.target;
          if (!target || !target.closest) return;
          const row = target.closest('tr[data-row-id]');
          if (!row || !tbody.contains(row)) return;
          this.syncTableToTemplate(this.getSelectedTemplate());
          this.setDirty(true);
          this.clearFieldErrorIfFilled(target);
        });
        tableWrap.addEventListener('click', (e) => {
          const row = e.target.closest('tr[data-row-id]');
          if (!row || !tbody.contains(row)) return;
          if (e.target.closest('.btn-row-del')) {
            this.showConfirm('确认删除所选行？', () => {
              const tpl = this.getSelectedTemplate();
              if (!tpl) return;
              const id = row.getAttribute('data-row-id');
              const idx = tpl.items.findIndex(it => it.id === id);
              if (idx !== -1) {
                tpl.items.splice(idx, 1);
                this.setDirty(true);
                this.refresh();
                this.rebindEvents();
              }
            });
            return;
          }
          if (e.target.closest('.btn-row-copy')) {
            const tpl = this.getSelectedTemplate();
            if (!tpl) return;
            if (tpl.items.length >= ITEM_MAX) {
              this.showAlert('器官限量上限为1000');
              return;
            }
            this.syncTableToTemplate(tpl);
            const rowData = this.collectRowData(row);
            if (!rowData) return;
            const newItem = { ...deepClone(rowData), id: nextId('item') };
            tpl.items.push(newItem);
            this.setDirty(true);
            this.selectedRowId = newItem.id;
            this.refresh();
            this.rebindEvents();
            const newTr = this.rootEl.querySelector('tr[data-row-id="' + newItem.id + '"]');
            if (newTr) newTr.scrollIntoView({ block: 'nearest' });
            return;
          }
        });
      }

      if (btnNewOrgan) {
        btnNewOrgan.addEventListener('click', () => {
          const tpl = this.getSelectedTemplate();
          if (!tpl) return;
          if (tpl.items.length >= ITEM_MAX) {
            this.showAlert('器官限量上限为1000');
            return;
          }
          tpl.items.push({
            id: nextId('item'),
            organName: '',
            type: 'OAR',
            func: 'Max Dose',
            priority: '重要',
            weight: 30,
            isSphereHCP: false,
            condition: { dose: null, volume: null, gEUDa: null, falloffHigh: null, falloffLow: null, falloffDist: null, targetRef: null }
          });
          this.setDirty(true);
          this.refresh();
          this.rebindEvents();
        });
      }

      if (btnNewSfrt) {
        btnNewSfrt.addEventListener('click', () => {
          const tpl = this.getSelectedTemplate();
          if (!tpl) return;
          if (tpl.items.length >= ITEM_MAX) {
            this.showAlert('器官限量上限为1000');
            return;
          }
          tpl.items.push({
            id: nextId('item'),
            organName: 'SphereHCP',
            type: 'PTV',
            func: 'Max Dose',
            priority: '重要',
            weight: 30,
            isSphereHCP: true,
            condition: { dose: null, volume: null, gEUDa: null, falloffHigh: null, falloffLow: null, falloffDist: null, targetRef: null }
          });
          this.setDirty(true);
          this.refresh();
          this.rebindEvents();
        });
      }

      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          const requiredCheck = this.highlightMissingRequiredInTable();
          if (!requiredCheck.ok) {
            this.showAlert('页面中有未填写的必填字段（已标红），请补填后再保存');
            return;
          }
          if (!this.lastSavedSnapshot) return;
          this.templates = deepClone(this.lastSavedSnapshot);
          this.selectedTemplateId = this.templates[0] ? this.templates[0].id : null;
          this.nameEditingTemplateId = null;
          this.selectedRowId = null;
          this.setDirty(false);
          this.refresh();
          this.rebindEvents();
          this.refreshRightPanel();
        });
      }

      if (btnSave) {
        btnSave.addEventListener('click', () => {
          const tpl = this.getSelectedTemplate();
          if (!tpl) return;
          const requiredCheck = this.highlightMissingRequiredInTable();
          if (!requiredCheck.ok) {
            this.showAlert('页面中有未填写的必填字段（已标红），请补填后再保存');
            return;
          }
          this.syncTableToTemplate(tpl);
          const valid = this.validateCurrentTemplate();
          if (!valid.ok) {
            this.showAlert(valid.msg);
            return;
          }
          this.lastSavedSnapshot = deepClone(this.templates);
          this.setDirty(false);
          this.refresh();
          this.rebindEvents();
        });
      }

      this.bindBeforeLeave();
    }

    openEditRowModal(row) {
      const tpl = this.getSelectedTemplate();
      if (!tpl) return;
      const rowId = row.getAttribute('data-row-id');
      const item = tpl.items.find(it => it.id === rowId);
      if (!item) return;
      this.syncTableToTemplate(tpl);
      const data = { ...deepClone(item) };
      const isSphere = !!item.isSphereHCP;
      const typeOpts = ROI_TYPES.map(t => `<option value="${t}"${t === data.type ? ' selected' : ''}>${t}</option>`).join('');
      const funcList = isSphere ? FUNCTIONS_ALL : FUNCTIONS_ALL.filter(f => f !== 'Fall Off');
      const funcOpts = funcList.map(f => `<option value="${f}"${f === data.func ? ' selected' : ''}>${f}</option>`).join('');
      const priorityOpts = PRIORITIES.map(p => `<option value="${p}"${p === data.priority ? ' selected' : ''}>${p}</option>`).join('');
      const cond = data.condition || {};
      const fields = this.getConditionFieldsForFunction(data.func, data.type);
      const condHtml = fields.map(f => {
        const val = cond[f.key];
        const v = val !== undefined && val !== null ? String(val) : '';
        if (f.maxLen) {
          return `<div class="edit-modal-row"><label>${f.label}</label><input type="text" data-key="${f.key}" maxlength="${f.maxLen}" value="${escapeHtml(v)}"></div>`;
        }
        return `<div class="edit-modal-row"><label>${f.label}</label><input type="number" data-key="${f.key}" min="${f.min}" max="${f.max}" step="0.01" value="${v}"></div>`;
      }).join('');
      const mask = document.createElement('div');
      mask.className = 'organ-limit-modal-mask';
      mask.innerHTML = `
        <div class="organ-limit-modal organ-limit-edit-modal">
          <div class="organ-limit-modal-title">编辑条目</div>
          <div class="organ-limit-modal-body">
            <div class="edit-modal-row">
              <label>器官名称<span class="required-mark">*</span></label>
              <input type="text" data-key="organName" maxlength="${ORGAN_NAME_MAX_LEN}" value="${escapeHtml(data.organName || '')}" ${isSphere ? 'readonly' : ''}>
            </div>
            <div class="edit-modal-row">
              <label>类型<span class="required-mark">*</span></label>
              <select data-key="type" ${isSphere ? 'disabled' : ''}>${typeOpts}</select>
            </div>
            <div class="edit-modal-row">
              <label>函数<span class="required-mark">*</span></label>
              <select data-key="func">${funcOpts}</select>
            </div>
            ${condHtml}
            <div class="edit-modal-row">
              <label>优先级<span class="required-mark">*</span></label>
              <select data-key="priority">${priorityOpts}</select>
            </div>
            <div class="edit-modal-row">
              <label>权重<span class="required-mark">*</span></label>
              <input type="number" data-key="weight" min="${WEIGHT_MIN}" max="${WEIGHT_MAX}" value="${data.weight !== undefined ? data.weight : 30}">
            </div>
          </div>
          <div class="organ-limit-modal-footer">
            <button type="button" class="btn btn-secondary organ-limit-modal-cancel">取消</button>
            <button type="button" class="btn btn-primary organ-limit-modal-confirm">确定</button>
          </div>
        </div>
      `;
      document.body.appendChild(mask);
      const close = () => mask.remove();
      const getValues = () => {
        const res = { ...data };
        mask.querySelectorAll('[data-key]').forEach(inp => {
          const key = inp.getAttribute('data-key');
          if (inp.tagName === 'SELECT') {
            res[key] = inp.value;
          } else {
            const numKeys = ['dose', 'volume', 'gEUDa', 'falloffHigh', 'falloffLow', 'falloffDist', 'weight'];
            res[key] = numKeys.indexOf(key) !== -1 ? (parseFloat(inp.value) || null) : inp.value;
          }
        });
        res.condition = res.condition || {};
        mask.querySelectorAll('.edit-modal-row input[data-key], .edit-modal-row select[data-key]').forEach(inp => {
          const key = inp.getAttribute('data-key');
          if (['organName', 'type', 'func', 'priority', 'weight'].indexOf(key) !== -1) return;
          const numKeys = ['dose', 'volume', 'gEUDa', 'falloffHigh', 'falloffLow', 'falloffDist'];
          res.condition[key] = numKeys.indexOf(key) !== -1 ? (parseFloat(inp.value) || null) : inp.value;
        });
        return res;
      };
      const highlightMissingRequiredInModal = () => {
        let hasMissing = false;
        mask.querySelectorAll('.edit-modal-row input[data-key], .edit-modal-row select[data-key]').forEach(inp => {
          const key = inp.getAttribute('data-key');
          const isCore = ['organName', 'type', 'func', 'priority', 'weight'].indexOf(key) !== -1;
          const isCondition = !isCore;
          inp.classList.remove('field-error');
          const v = inp.value;
          if (isCore || isCondition) {
            if (v === '' || v == null || (inp.type === 'number' && isNaN(Number(v)))) {
              inp.classList.add('field-error');
              hasMissing = true;
            }
          }
        });
        return hasMissing;
      };

      const clearModalFieldErrorIfFilled = (target) => {
        if (!target || !target.classList.contains('field-error')) return;
        const v = target.value;
        if (v === undefined || v === null) return;
        if (String(v).trim() === '') return;
        if (target.type === 'number' && isNaN(Number(v))) return;
        target.classList.remove('field-error');
      };

      mask.addEventListener('input', (e) => {
        const target = e.target;
        if (!target || !target.getAttribute) return;
        if (!target.getAttribute('data-key')) return;
        clearModalFieldErrorIfFilled(target);
      });

      mask.querySelector('.organ-limit-modal-confirm').addEventListener('click', () => {
        if (highlightMissingRequiredInModal()) {
          this.showAlert('页面中有未填写的必填字段（已标红），请补填后再保存');
          return;
        }
        const updated = getValues();
        const valid = this.validateItem(updated, tpl.items, rowId);
        if (!valid.ok) {
          this.showAlert(valid.msg);
          return;
        }
        const idx = tpl.items.findIndex(it => it.id === rowId);
        if (idx !== -1) {
          tpl.items[idx] = { ...updated, id: rowId, isSphereHCP: isSphere };
          this.setDirty(true);
        }
        close();
        this.refresh();
        this.rebindEvents();
      });
      mask.querySelector('.organ-limit-modal-cancel').addEventListener('click', close);
      mask.addEventListener('click', (e) => { if (e.target === mask) close(); });
    }

    bindBeforeLeave() {
      if (!this.rootEl) return;
      this.rootEl.addEventListener('beforeSettingsTabChange', (e) => {
        const requiredCheck = this.highlightMissingRequiredInTable();
        if (!requiredCheck.ok) {
          e.preventDefault();
          this.showAlert('页面中有未填写的必填字段（已标红），请补填后再保存');
          return;
        }
        if (!this.dirty) {
          e.detail && e.detail.confirm && e.detail.confirm();
          return;
        }
        e.preventDefault();
        this.showConfirm('有未保存的变更，是否离开？', () => {
          this.setDirty(false);
          e.detail && e.detail.confirm && e.detail.confirm();
        });
      });
      document.addEventListener('beforeSettingsClose', (e) => {
        const requiredCheck = this.highlightMissingRequiredInTable();
        if (!requiredCheck.ok) {
          e.preventDefault();
          this.showAlert('页面中有未填写的必填字段（已标红），请补填后再保存');
          return;
        }
        if (!this.rootEl || !this.rootEl.classList.contains('active') || !this.dirty) return;
        e.preventDefault();
        this.showConfirm('有未保存的变更，是否离开？', () => {
          this.setDirty(false);
          e.detail && e.detail.confirm && e.detail.confirm();
        });
      });
    }
  }

  function escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.OrganLimitTemplateSettingsComponent = OrganLimitTemplateSettingsComponent;
})();
