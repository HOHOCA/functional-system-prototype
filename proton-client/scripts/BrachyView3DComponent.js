class BrachyView3DComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string'
            ? document.getElementById(containerId)
            : containerId;
        this.options = {
            prefix: options.prefix || 'brachy-',
            toolbarContainerId: options.toolbarContainerId || null,
            showHeader: options.showHeader !== false,
            ...options
        };

        if (this.container) {
            this.render();
        }

        if (this.options.toolbarContainerId) {
            const toolbarHost = document.getElementById(this.options.toolbarContainerId);
            if (toolbarHost && toolbarHost.children.length === 0) {
                toolbarHost.innerHTML = `
                    <div class="cross-section-view2d-toolbar">
                        <div class="toolbar-group toolbar-group-right">
                            <button class="toolbar-btn-svg" title="旋转">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button class="toolbar-btn-svg" title="缩放">
                                <i class="fas fa-search-plus"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }

    render() {
        this.container.innerHTML = `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#888;font-size:13px;border:1px dashed #444;box-sizing:border-box;">
                3D 预览占位组件（BrachyView3DComponent.js 未实现真实 3D）
            </div>
        `;
    }
}

if (typeof window !== 'undefined') {
    window.BrachyView3DComponent = BrachyView3DComponent;
}

