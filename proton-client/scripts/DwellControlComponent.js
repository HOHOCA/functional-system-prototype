class DwellControlComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string'
            ? document.getElementById(containerId)
            : containerId;
        this.options = {
            prefix: options.prefix || 'dwell-',
            onDwellPointSelect: options.onDwellPointSelect || null,
            onDwellPointChange: options.onDwellPointChange || null,
            onDwellPointLockToggle: options.onDwellPointLockToggle || null,
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
                    <span>驻留控制（占位实现）</span>
                </div>
                <div style="flex:1;overflow:auto;padding-top:4px;">
                    <div style="padding:6px 4px;color:#888;">
                        尚未接入真实驻留数据，目前为静态占位组件，仅用于消除脚本加载错误。
                    </div>
                </div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined') {
    window.DwellControlComponent = DwellControlComponent;
}

