/**
 * LET Component（质子）
 * 说明：
 * - 复用 CrossSectionView2DComponent 的布局与样式（styles_plan_view_2d.css）
 * - 作为 LET 视图的壳子：当前提供示例渲染与基础标识
 */
(function (global) {
    if (!global) return;

    const Base = global.CrossSectionView2DComponent;
    if (typeof Base === 'undefined') {
        // 依赖未就绪：不在这里抛错，避免阻塞页面其它组件。
        // 调用方应确保先加载 CrossSectionView2DComponent。
        return;
    }

    class LETComponent extends Base {
        constructor(containerId, options = {}) {
            super(containerId, {
                enableToolbar: options.enableToolbar !== false,
                enableLayerControl: options.enableLayerControl !== false,
                // 与 CrossSectionView2DComponent 一致：复用 renderDoseLegend()（色块 + 百分比）
                showDoseLegend: options.showDoseLegend !== false,
                ...options
            });
        }

        init() {
            super.init();
            this.updateToolbarTitle();
        }

        updateToolbarTitle() {
            if (!this.container) return;
            const titleEl = this.container.querySelector('.cross-section-view2d-toolbar .toolbar-title');
            if (titleEl) titleEl.textContent = 'LET';
        }
    }

    global.LETComponent = LETComponent;
})(typeof window !== 'undefined' ? window : undefined);

