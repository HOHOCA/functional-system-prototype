/**
 * 自定义下拉。无真实选项时栏不锁死：可点开、显示灰色配置说明、说明不可选。
 *
 * 必选空态：收起显示占位「未配置」（占位色，不是选项值）。
 * 带「不使用」：收起仍显示「不使用」，列表为「不使用」+ 灰色说明。
 */
class SelectComponent {
    static _openInstance = null;
    static _idSeq = 0;

    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.getElementById(container)
            : container;

        if (!this.container) {
            console.error('SelectComponent: container not found', container);
            return;
        }

        this.uid = `mt-select-${++SelectComponent._idSeq}`;
        this.options = {
            options: [],
            value: '',
            placeholder: '未配置',
            noneOption: null,
            emptyHint: '',
            disabled: false,
            onChange: null,
            ...options
        };

        this._open = false;
        this._onDocPointerDown = this._onDocPointerDown.bind(this);
        this._onDocKeyDown = this._onDocKeyDown.bind(this);

        SelectComponent.ensureStyles();
        this.render();
        this.bindEvents();
        this.syncTrigger();
    }

    static ensureStyles() {
        if (document.getElementById('mt-select-component-styles')) return;
        const style = document.createElement('style');
        style.id = 'mt-select-component-styles';
        style.textContent = `
            .mt-select {
                position: relative;
                width: 100%;
                min-width: 0;
                font-size: 13px;
                line-height: 1.4;
            }
            .mt-select-trigger {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                width: 100%;
                height: 32px;
                padding: 0 10px;
                box-sizing: border-box;
                background: #111;
                border: 1px solid #404040;
                border-radius: 4px;
                color: #ddd;
                cursor: pointer;
                user-select: none;
                text-align: left;
                font: inherit;
            }
            .mt-select-trigger:hover {
                border-color: #555;
            }
            .mt-select.is-open .mt-select-trigger,
            .mt-select-trigger:focus {
                outline: none;
                border-color: #3AACDE;
            }
            .mt-select-trigger[disabled] {
                opacity: 0.45;
                cursor: not-allowed;
            }
            .mt-select-label {
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .mt-select-label.is-placeholder {
                color: #8a8a8a;
            }
            .mt-select-arrow {
                flex-shrink: 0;
                width: 10px;
                height: 6px;
                color: #8a8a8a;
                transition: transform 0.15s ease;
            }
            .mt-select.is-open .mt-select-arrow {
                transform: rotate(180deg);
            }
            .mt-select-menu {
                display: none;
                position: absolute;
                top: calc(100% + 4px);
                left: 0;
                z-index: 12000;
                min-width: 100%;
                max-width: min(360px, 70vw);
                max-height: 220px;
                overflow-y: auto;
                background: #2a2a2a;
                border: 1px solid #404040;
                border-radius: 4px;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
            }
            .mt-select.is-open .mt-select-menu {
                display: block;
            }
            .mt-select.is-drop-up .mt-select-menu {
                top: auto;
                bottom: calc(100% + 4px);
            }
            .mt-select-option {
                padding: 8px 12px;
                color: #ddd;
                cursor: pointer;
            }
            .mt-select-option:hover,
            .mt-select-option.is-active {
                background: #333;
            }
            .mt-select-hint {
                padding: 8px 12px;
                color: #7a7a7a;
                font-size: 12px;
                line-height: 1.55;
                cursor: default;
                user-select: none;
                white-space: normal;
            }

            .mt-select-preview {
                width: 100%;
                height: 100%;
                min-height: 400px;
                box-sizing: border-box;
                padding: 20px 24px;
                background: #111;
                color: #d0d0d0;
                overflow: auto;
            }
            .mt-select-preview-intro {
                margin: 0 0 16px;
                font-size: 12px;
                color: #8a8a8a;
                line-height: 1.6;
            }
            .mt-select-preview-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 16px;
            }
            .mt-select-preview-card {
                background: #1a1a1a;
                border: 1px solid #2e2e2e;
                border-radius: 8px;
                padding: 16px;
            }
            .mt-select-preview-card h3 {
                margin: 0 0 4px;
                font-size: 13px;
                font-weight: 600;
                color: #e6e6e6;
            }
            .mt-select-preview-card p {
                margin: 0 0 12px;
                font-size: 12px;
                color: #8a8a8a;
                line-height: 1.55;
            }
            .mt-select-preview-mount {
                margin-bottom: 12px;
            }
            .mt-select-preview-meta {
                font-size: 12px;
                color: #9a9a9a;
            }
            .mt-select-preview-meta strong {
                color: #ccc;
                font-weight: 500;
            }
            .mt-select-preview-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-top: 12px;
            }
            .mt-select-preview-btn {
                min-width: 72px;
                height: 28px;
                border-radius: 4px;
                border: 1px solid #3aacde;
                background: #2a9dd0;
                color: #fff;
                font-size: 12px;
                cursor: pointer;
            }
            .mt-select-preview-btn:disabled {
                border-color: #3a3a3a;
                background: #2a2a2a;
                color: #666;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }

    _esc(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }

    realOptions() {
        return Array.isArray(this.options.options) ? this.options.options : [];
    }

    isEmpty() {
        return this.realOptions().length === 0;
    }

    hasNeedleSelected() {
        const value = this.getValue();
        return this.realOptions().some((item) => item.value === value);
    }

    getValue() {
        return this.options.value;
    }

    setValue(value, { silent = false } = {}) {
        this.options.value = value;
        this.syncTrigger();
        this._syncOptionActive();
        if (!silent && typeof this.options.onChange === 'function') {
            this.options.onChange(this.getValue());
        }
    }

    setOptions(options) {
        this.options.options = Array.isArray(options) ? options : [];
        if (this._open) this._renderMenu();
        this.syncTrigger();
    }

    listItems() {
        const items = [];
        const noneOption = this.options.noneOption;
        if (noneOption && noneOption.label) {
            items.push({ type: 'option', value: noneOption.value, label: noneOption.label });
        }
        const real = this.realOptions();
        if (real.length > 0) {
            real.forEach((item) => {
                items.push({ type: 'option', value: item.value, label: item.label });
            });
        } else if (this.options.emptyHint) {
            items.push({ type: 'hint', label: this.options.emptyHint });
        }
        return items;
    }

    collapsedState() {
        const value = this.getValue();
        const noneOption = this.options.noneOption;
        if (noneOption && value === noneOption.value) {
            return { text: noneOption.label, placeholder: false };
        }
        const matched = this.realOptions().find((item) => item.value === value);
        if (matched) {
            return { text: matched.label, placeholder: false };
        }
        if (this.isEmpty() && !noneOption) {
            return { text: this.options.placeholder || '未配置', placeholder: true };
        }
        return { text: '', placeholder: false };
    }

    render() {
        this.container.innerHTML = `
            <div class="mt-select" id="${this.uid}" data-mt-select>
                <button type="button" class="mt-select-trigger" data-mt-select-trigger
                    aria-haspopup="listbox" aria-expanded="false" aria-controls="${this.uid}-menu">
                    <span class="mt-select-label" data-mt-select-label></span>
                    <svg class="mt-select-arrow" viewBox="0 0 10 6" aria-hidden="true">
                        <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="mt-select-menu" id="${this.uid}-menu" data-mt-select-menu role="listbox"></div>
            </div>
        `;
        this.root = this.container.querySelector('[data-mt-select]');
        this.trigger = this.container.querySelector('[data-mt-select-trigger]');
        this.labelEl = this.container.querySelector('[data-mt-select-label]');
        this.menuEl = this.container.querySelector('[data-mt-select-menu]');
        if (this.options.disabled) this.trigger.disabled = true;
    }

    bindEvents() {
        if (!this.trigger) return;
        this.trigger.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (this.options.disabled) return;
            this.toggle();
        });
        this.menuEl.addEventListener('mousedown', (event) => {
            event.preventDefault();
        });
        this.menuEl.addEventListener('click', (event) => {
            const option = event.target.closest('[data-mt-select-option]');
            if (!option || !this.menuEl.contains(option)) return;
            this._choose(option.getAttribute('data-value'));
        });
    }

    syncTrigger() {
        if (!this.labelEl || !this.trigger) return;
        const state = this.collapsedState();
        this.labelEl.textContent = state.text;
        this.labelEl.classList.toggle('is-placeholder', state.placeholder);
        this.trigger.disabled = !!this.options.disabled;
    }

    toggle() {
        if (this._open) this.close();
        else this.open();
    }

    open() {
        if (!this.root || this.options.disabled || this._open) return;
        if (SelectComponent._openInstance && SelectComponent._openInstance !== this) {
            SelectComponent._openInstance.close();
        }
        this._renderMenu();
        this._open = true;
        this.root.classList.add('is-open');
        this.root.classList.remove('is-drop-up');
        this.trigger.setAttribute('aria-expanded', 'true');
        this._positionMenu();
        SelectComponent._openInstance = this;
        document.addEventListener('pointerdown', this._onDocPointerDown, true);
        document.addEventListener('keydown', this._onDocKeyDown, true);
    }

    close() {
        if (!this._open) return;
        this._open = false;
        if (this.root) {
            this.root.classList.remove('is-open');
            this.root.classList.remove('is-drop-up');
        }
        if (this.trigger) this.trigger.setAttribute('aria-expanded', 'false');
        if (SelectComponent._openInstance === this) SelectComponent._openInstance = null;
        document.removeEventListener('pointerdown', this._onDocPointerDown, true);
        document.removeEventListener('keydown', this._onDocKeyDown, true);
    }

    _positionMenu() {
        if (!this.menuEl || !this.trigger) return;
        const triggerRect = this.trigger.getBoundingClientRect();
        const menuHeight = this.menuEl.scrollHeight || 160;
        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        if (spaceBelow < menuHeight + 8 && spaceAbove > spaceBelow) {
            this.root.classList.add('is-drop-up');
        } else {
            this.root.classList.remove('is-drop-up');
        }
    }

    _renderMenu() {
        if (!this.menuEl) return;
        const items = this.listItems();
        const current = this.getValue();
        this.menuEl.innerHTML = items.map((item) => {
            if (item.type === 'hint') {
                return `<div class="mt-select-hint" role="note">${this._esc(item.label)}</div>`;
            }
            const active = item.value === current ? ' is-active' : '';
            return `<div class="mt-select-option${active}" role="option" data-mt-select-option data-value="${this._esc(item.value)}" aria-selected="${item.value === current}">${this._esc(item.label)}</div>`;
        }).join('');
    }

    _syncOptionActive() {
        if (!this.menuEl) return;
        const current = this.getValue();
        this.menuEl.querySelectorAll('[data-mt-select-option]').forEach((el) => {
            const active = el.getAttribute('data-value') === current;
            el.classList.toggle('is-active', active);
            el.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }

    _choose(value) {
        this.setValue(value);
        this.close();
    }

    _onDocPointerDown(event) {
        if (!this.root || this.root.contains(event.target)) return;
        this.close();
    }

    _onDocKeyDown(event) {
        if (event.key === 'Escape') this.close();
    }

    destroy() {
        this.close();
        if (this.container) this.container.innerHTML = '';
        this.root = null;
        this.trigger = null;
        this.labelEl = null;
        this.menuEl = null;
    }

    static mountPreview(container) {
        return new SelectPreviewHost(container);
    }
}

class SelectPreviewHost {
    constructor(container) {
        this.container = typeof container === 'string'
            ? document.getElementById(container)
            : container;
        this.selects = [];
        SelectComponent.ensureStyles();
        this.render();
    }

    render() {
        if (!this.container) return;
        const needleOptions = [
            { value: 'needle1', label: '插植针1' },
            { value: 'needle2', label: '插植针2' }
        ];
        const noneOption = { value: 'not-use', label: '不使用' };
        const hintA = '需在物理模块【施源器】中配置插植针，并勾选当前后装机';
        const hintB = '需在物理模块【定位器】中勾选可用插植针';

        this.container.innerHTML = `
            <div class="mt-select-preview">
                <p class="mt-select-preview-intro">无选项时栏仍可点开。点灰色说明不会选中；再点下拉或空白处收起。有选项时说明不出现。</p>
                <div class="mt-select-preview-grid">
                    <section class="mt-select-preview-card" data-preview-card="a-empty">
                        <h3>路 A · 必选 · 空选项</h3>
                        <p>收起为「未配置」（占位色）。列表只有灰色说明。【确定】置灰。</p>
                        <div class="mt-select-preview-mount" data-select-mount></div>
                        <div class="mt-select-preview-meta">当前值：<strong data-value-label></strong></div>
                        <div class="mt-select-preview-actions">
                            <button type="button" class="mt-select-preview-btn" data-confirm-btn disabled>确定</button>
                        </div>
                    </section>
                    <section class="mt-select-preview-card" data-preview-card="a-filled">
                        <h3>路 A · 必选 · 有选项</h3>
                        <p>栏内按选择显示针名；未选时栏内为空。列表只有真实选项。</p>
                        <div class="mt-select-preview-mount" data-select-mount></div>
                        <div class="mt-select-preview-meta">当前值：<strong data-value-label></strong></div>
                        <div class="mt-select-preview-actions">
                            <button type="button" class="mt-select-preview-btn" data-confirm-btn disabled>确定</button>
                        </div>
                    </section>
                    <section class="mt-select-preview-card" data-preview-card="b-empty">
                        <h3>路 B · 不使用 · 空选项</h3>
                        <p>收起仍是「不使用」。列表为「不使用」+ 灰色说明。【确定】可点。</p>
                        <div class="mt-select-preview-mount" data-select-mount></div>
                        <div class="mt-select-preview-meta">当前值：<strong data-value-label></strong></div>
                        <div class="mt-select-preview-actions">
                            <button type="button" class="mt-select-preview-btn" data-confirm-btn>确定</button>
                        </div>
                    </section>
                    <section class="mt-select-preview-card" data-preview-card="b-filled">
                        <h3>路 B · 不使用 · 有选项</h3>
                        <p>列表为「不使用」+ 真实针名，没有配置说明。</p>
                        <div class="mt-select-preview-mount" data-select-mount></div>
                        <div class="mt-select-preview-meta">当前值：<strong data-value-label></strong></div>
                        <div class="mt-select-preview-actions">
                            <button type="button" class="mt-select-preview-btn" data-confirm-btn>确定</button>
                        </div>
                    </section>
                </div>
            </div>
        `;

        const specs = {
            'a-empty': {
                options: [],
                value: '',
                placeholder: '未配置',
                emptyHint: hintA,
                required: true
            },
            'a-filled': {
                options: needleOptions,
                value: '',
                placeholder: '未配置',
                emptyHint: hintA,
                required: true
            },
            'b-empty': {
                options: [],
                value: 'not-use',
                noneOption,
                emptyHint: hintB,
                required: false
            },
            'b-filled': {
                options: needleOptions,
                value: 'not-use',
                noneOption,
                emptyHint: hintB,
                required: false
            }
        };

        Object.keys(specs).forEach((key) => {
            const card = this.container.querySelector(`[data-preview-card="${key}"]`);
            const mount = card.querySelector('[data-select-mount]');
            const spec = specs[key];
            const select = new SelectComponent(mount, {
                options: spec.options,
                value: spec.value,
                placeholder: spec.placeholder,
                noneOption: spec.noneOption || null,
                emptyHint: spec.emptyHint,
                onChange: () => this._syncCard(card, select, spec.required)
            });
            this.selects.push(select);
            this._syncCard(card, select, spec.required);
        });
    }

    _syncCard(card, select, required) {
        const label = card.querySelector('[data-value-label]');
        const confirmBtn = card.querySelector('[data-confirm-btn]');
        const state = select.collapsedState();
        if (label) {
            if (state.placeholder) label.textContent = `${state.text}（占位，非选项）`;
            else if (state.text) label.textContent = state.text;
            else label.textContent = '（空）';
        }
        if (confirmBtn && required) {
            confirmBtn.disabled = !select.hasNeedleSelected();
        }
    }

    destroy() {
        this.selects.forEach((select) => select.destroy());
        this.selects = [];
        if (this.container) this.container.innerHTML = '';
    }
}
