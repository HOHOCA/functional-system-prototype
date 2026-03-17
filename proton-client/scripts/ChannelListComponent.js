class ChannelListComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string'
            ? document.getElementById(containerId)
            : containerId;
        this.options = {
            prefix: options.prefix || 'channel-',
            onChannelSelect: options.onChannelSelect || null,
            onChannelChange: options.onChannelChange || null,
            onChannelDelete: options.onChannelDelete || null,
            onChannelAdd: options.onChannelAdd || null,
            onManualRebuild: options.onManualRebuild || null,
            onAutoRebuild: options.onAutoRebuild || null,
            onModelRebuild: options.onModelRebuild || null,
            onLoadTemplate: options.onLoadTemplate || null,
            onCreateTemplate: options.onCreateTemplate || null,
            ...options
        };

        if (this.container) {
            this.render();
        }
    }

    render() {
        this.container.innerHTML = `
            <div style="width:100%;height:100%;display:flex;flex-direction:column;color:#ddd;font-size:12px;box-sizing:border-box;">
                <div style="padding:4px 0 6px;border-bottom:1px solid #444;display:flex;justify-content:space-between;align-items:center;">
                    <span>通道列表（占位实现）</span>
                    <button data-action="add" style="background:#3a3a3a;border:1px solid #555;color:#ddd;font-size:11px;padding:2px 8px;border-radius:3px;cursor:pointer;">
                        新增通道
                    </button>
                </div>
                <div style="flex:1;overflow:auto;padding-top:4px;">
                    <div style="padding:6px 4px;color:#888;">
                        尚未接入真实后装数据，目前为静态占位组件，仅用于消除脚本加载错误。
                    </div>
                </div>
            </div>
        `;

        const addBtn = this.container.querySelector('button[data-action="add"]');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (this.options.onChannelAdd) {
                    this.options.onChannelAdd({ id: `${this.options.prefix}1` });
                }
            });
        }
    }
}

if (typeof window !== 'undefined') {
    window.ChannelListComponent = ChannelListComponent;
}

