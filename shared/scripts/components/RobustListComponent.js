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
            existingTemplateListOptions: options.existingTemplateListOptions || null,
            onSave: options.onSave || null,
            onExecute: options.onExecute || null,
            onEdit: options.onEdit || null,
            onDelete: options.onDelete || null,
            ...options
        };
        this._deleteConfirmEl = null;
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
        this.ensureDeleteConfirmStyles();
        this.init();
    }

    ensureDeleteConfirmStyles() {
        if (document.getElementById('robust-delete-confirm-styles')) return;
        const style = document.createElement('style');
        style.id = 'robust-delete-confirm-styles';
        style.textContent = `
            .robust-delete-mask{
                position: fixed;
                inset: 0;
                z-index: 10065;
                background: rgba(0,0,0,0.68);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .robust-delete-dialog{
                width: min(400px, calc(100vw - 48px));
                background: #1f1f1f;
                border: 1px solid #3f3f3f;
                border-radius: 6px;
                box-shadow: 0 12px 28px rgba(0,0,0,0.45);
                overflow: hidden;
                color: #e8e8e8;
            }
            .robust-delete-header{
                height: 42px;
                border-bottom: 1px solid #383838;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 12px 0 14px;
                background: #262626;
            }
            .robust-delete-header h3{
                margin: 0;
                font-size: 16px;
                color: #f0f0f0;
                font-weight: 500;
            }
            .robust-delete-close{
                border: none;
                background: transparent;
                color: #a8a8a8;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
            }
            .robust-delete-close:hover{
                background: rgba(255,255,255,0.08);
                color: #fff;
            }
            .robust-delete-body{
                display: flex;
                align-items: center;
                justify-content: flex-start;
                gap: 12px;
                padding: 16px 14px 18px;
                background: #232323;
            }
            .robust-delete-icon{
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: #de4f4f;
                color: #1f1f1f;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: 700;
                flex-shrink: 0;
            }
            .robust-delete-message{
                font-size: 14px;
                color: #f0f0f0;
                line-height: 1.45;
            }
            .robust-delete-footer{
                border-top: 1px solid #383838;
                padding: 10px 12px;
                background: #262626;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
            .robust-delete-btn{
                min-width: 80px;
                height: 32px;
                border-radius: 4px;
                border: 1px solid #6b6b6b;
                background: transparent;
                color: #fff;
                cursor: pointer;
                font-size: 13px;
            }
            .robust-delete-btn:hover{
                background: rgba(255,255,255,0.06);
            }
            .robust-delete-btn.primary{
                border-color: #d84f4f;
                background: #d84f4f;
                color: #fff;
            }
            .robust-delete-btn.primary:hover{
                filter: brightness(1.06);
            }
        `;
        document.head.appendChild(style);
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

    _closeDeleteConfirm() {
        if (!this._deleteConfirmEl) return;
        this._deleteConfirmEl.remove();
        this._deleteConfirmEl = null;
    }

    _showDeleteConfirm(groupName, onConfirm) {
        this._closeDeleteConfirm();
        const mask = document.createElement('div');
        mask.className = 'robust-delete-mask';
        mask.innerHTML = `
            <div class="robust-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="robustDeleteTitle">
                <div class="robust-delete-header">
                    <h3 id="robustDeleteTitle">警告</h3>
                    <button type="button" class="robust-delete-close" data-role="close" aria-label="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="robust-delete-body">
                    <span class="robust-delete-icon">!</span>
                    <div class="robust-delete-message">是否删除鲁棒性评估组 ${this._escapeHtml(String(groupName || ''))}？</div>
                </div>
                <div class="robust-delete-footer">
                    <button type="button" class="robust-delete-btn" data-role="cancel">取消</button>
                    <button type="button" class="robust-delete-btn primary" data-role="confirm">确定</button>
                </div>
            </div>
        `;
        const close = () => this._closeDeleteConfirm();
        mask.querySelector('[data-role="close"]').addEventListener('click', close);
        mask.querySelector('[data-role="cancel"]').addEventListener('click', close);
        mask.querySelector('[data-role="confirm"]').addEventListener('click', () => {
            close();
            if (typeof onConfirm === 'function') onConfirm();
        });
        mask.addEventListener('click', (e) => {
            if (e.target === mask) close();
        });
        document.body.appendChild(mask);
        this._deleteConfirmEl = mask;
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
                if (typeof this.options.onLoadTemplate === 'function') {
                    this.options.onLoadTemplate();
                    return;
                }
                if (typeof window.LoadRobustnessEvaluationTemplateModalComponent !== 'undefined') {
                    if (!this._loadRobustnessTemplateModal) {
                        this._loadRobustnessTemplateModal = new LoadRobustnessEvaluationTemplateModalComponent();
                    }
                    this._loadRobustnessTemplateModal.show();
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
                if (action === 'save') {
                    if (typeof this.options.onSave === 'function') {
                        this.options.onSave(id, btn);
                        return;
                    }
                    if (typeof window.CreateRobustnessEvaluationTemplateNameModalComponent !== 'undefined') {
                        const items = this.getItems();
                        const item = items.find((it) => String(it.id) === String(id));
                        const modal = new CreateRobustnessEvaluationTemplateNameModalComponent({
                            defaultGroupName: item ? String(item.groupLabel || '') : '',
                            existingTemplateListOptions: this.options.existingTemplateListOptions,
                            onConfirm: ({ groupName }) => {
                                if (item) {
                                    item.groupLabel = groupName;
                                    this.render();
                                    this.bindEvents();
                                }
                                if (typeof window.LoadRobustnessEvaluationTemplateModalComponent !== 'undefined') {
                                    window.LoadRobustnessEvaluationTemplateModalComponent.appendDemoTemplateFromSave(
                                        groupName
                                    );
                                }
                            }
                        });
                        modal.show();
                    }
                    return;
                }
                if (action === 'edit') {
                    if (typeof this.options.onEdit === 'function') {
                        this.options.onEdit(id, btn);
                        return;
                    }
                    if (typeof window.LrtEmbeddedCreateRobustnessModal !== 'undefined') {
                        const items = this.getItems();
                        const item = items.find((it) => String(it.id) === String(id));
                        const modal = new LrtEmbeddedCreateRobustnessModal({
                            title: '编辑',
                            defaultGroupName: item ? String(item.groupLabel || '') : '',
                            onComplete: ({ groupName }) => {
                                if (item) {
                                    item.groupLabel = groupName;
                                    this.render();
                                    this.bindEvents();
                                }
                            }
                        });
                        modal.open();
                    }
                    return;
                }
                if (action === 'delete') {
                    if (typeof this.options.onDelete === 'function') {
                        this.options.onDelete(id, btn);
                        return;
                    }
                    const items = this.getItems();
                    const index = items.findIndex((it) => String(it.id) === String(id));
                    if (index < 0) return;
                    const item = items[index];
                    this._showDeleteConfirm(item.groupLabel, () => {
                        items.splice(index, 1);
                        const hasSelected = items.some((it) => !!it.selected);
                        if (!hasSelected && items.length > 0) {
                            items[0].selected = true;
                        }
                        if (Array.isArray(this.options.items)) {
                            this.options.items = items;
                        } else {
                            this._defaultItems = items;
                        }
                        this.render();
                        this.bindEvents();
                    });
                    return;
                }
                const map = {
                    execute: this.options.onExecute,
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
        this._closeDeleteConfirm();
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

window.RobustListComponent = RobustListComponent;
