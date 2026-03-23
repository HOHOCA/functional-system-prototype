// ROBUST 列表组件 — 侧边栏鲁棒性组列表，布局与 ROI/POI 面板一致
class RobustListComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            prefix: options.prefix || '',
            items: options.items || null,
            onGroupSelect: options.onGroupSelect || null,
            onSearch: options.onSearch || null,
            onLoadTemplate: options.onLoadTemplate || null,
            onSave: options.onSave || null,
            onExecute: options.onExecute || null,
            onEdit: options.onEdit || null,
            onDelete: options.onDelete || null,
            ...options
        };
        this._defaultItems = [
            {
                id: '1',
                groupLabel: '1',
                densityUncertainty: '3.50',
                positioningUncertainty: '0.50',
                robustnessResult: '12',
                selected: true
            },
            {
                id: '22',
                groupLabel: '22',
                densityUncertainty: '3.50',
                positioningUncertainty: '0.50',
                robustnessResult: '12',
                selected: false
            }
        ];
        this._searchFilter = '';
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    getItems() {
        return Array.isArray(this.options.items) ? this.options.items : this._defaultItems;
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const items = this.getFilteredItems();
        const prefix = this.options.prefix;

        const cardsHtml = items
            .map(
                (item) => `
            <div class="robust-card ${item.selected ? 'selected' : ''}" data-group-id="${this._escapeAttr(item.id)}">
                <div class="robust-card-header">
                    <div class="robust-card-header-left">
                        <span class="robust-doc-icon" aria-hidden="true">
                            <i class="fas fa-file-lines"></i>
                            <span class="robust-doc-icon-a">A</span>
                        </span>
                        <span class="robust-group-title">组名：<span class="robust-group-num">${this._escapeHtml(String(item.groupLabel))}</span></span>
                    </div>
                    <div class="robust-card-actions">
                        <button type="button" class="robust-action-btn" data-action="save" title="保存">
                            <i class="fas fa-save"></i>
                        </button>
                        <button type="button" class="robust-action-btn" data-action="execute" title="执行">
                            <i class="fas fa-play-circle"></i>
                        </button>
                        <button type="button" class="robust-action-btn" data-action="edit" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="robust-action-btn" data-action="delete" title="删除">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="robust-card-metrics">
                    <div class="robust-metric">
                        <span class="robust-metric-value">${this._escapeHtml(String(item.densityUncertainty))}</span>
                        <span class="robust-metric-label">密度不确定性</span>
                    </div>
                    <div class="robust-metric">
                        <span class="robust-metric-value">${this._escapeHtml(String(item.positioningUncertainty))}</span>
                        <span class="robust-metric-label">摆位不确定性</span>
                    </div>
                    <div class="robust-metric">
                        <span class="robust-metric-value">${this._escapeHtml(String(item.robustnessResult))}</span>
                        <span class="robust-metric-label">鲁棒性结果</span>
                    </div>
                </div>
            </div>`
            )
            .join('');

        container.innerHTML = `
            <div class="robust-panel-container">
                <div class="robust-toolbar">
                    <div class="robust-search-wrap">
                        <i class="fas fa-search robust-search-icon"></i>
                        <input type="text"
                            class="robust-search-input"
                            id="${prefix}robust-search-input"
                            placeholder="按下回车搜索组名"
                            value="${this._escapeAttr(this._searchFilter)}"
                            autocomplete="off" />
                    </div>
                    <button type="button" class="robust-load-template-btn" id="${prefix}robust-load-template">加载模板</button>
                </div>
                <div class="robust-list-section">
                    <div class="robust-list-inner">
                        ${cardsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    getFilteredItems() {
        const items = this.getItems().map((it) => ({ ...it }));
        const q = (this._searchFilter || '').trim().toLowerCase();
        if (!q) return items;
        return items.filter((it) => String(it.groupLabel || '').toLowerCase().includes(q));
    }

    _escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    _escapeAttr(s) {
        return this._escapeHtml(s).replace(/'/g, '&#39;');
    }

    bindEvents() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const searchInput = container.querySelector('.robust-search-input');
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this._searchFilter = searchInput.value || '';
                    if (this.options.onSearch) {
                        this.options.onSearch(this._searchFilter);
                    }
                    this.render();
                    this.bindEvents();
                }
            });
        }

        const loadBtn = container.querySelector(`#${this.options.prefix}robust-load-template`);
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                if (this.options.onLoadTemplate) {
                    this.options.onLoadTemplate();
                }
            });
        }

        const cards = container.querySelectorAll('.robust-card');
        cards.forEach((card) => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.robust-card-actions')) return;
                const id = card.getAttribute('data-group-id');
                this.setSelectedById(id);
                if (this.options.onGroupSelect) {
                    this.options.onGroupSelect(id, card);
                }
            });
        });

        container.querySelectorAll('.robust-action-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.robust-card');
                const id = card && card.getAttribute('data-group-id');
                const action = btn.getAttribute('data-action');
                const map = {
                    save: this.options.onSave,
                    execute: this.options.onExecute,
                    edit: this.options.onEdit,
                    delete: this.options.onDelete
                };
                const fn = map[action];
                if (typeof fn === 'function') {
                    fn(id, btn);
                }
            });
        });
    }

    setSelectedById(id) {
        const items = this.getItems();
        items.forEach((it) => {
            it.selected = String(it.id) === String(id);
        });
        if (Array.isArray(this.options.items)) {
            this.options.items = items;
        } else {
            this._defaultItems = items;
        }
        this.render();
        this.bindEvents();
    }

    setItems(items) {
        this.options.items = items;
        this.render();
        this.bindEvents();
    }

    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

window.RobustListComponent = RobustListComponent;
