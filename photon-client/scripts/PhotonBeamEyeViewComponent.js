/**
 * 光子 BEV（射束眼视图）组件
 * - 示意 DRR、双层 MLC（坞门外蓝 / 坞门内黄）、方位字、刻度与左上角射束环
 * - 工具栏：DRR 设置（占位按钮）、缩放、移动、测量、最大化（与 2D 视图交互对齐）
 */
class PhotonBeamEyeViewComponent {
    constructor(containerId, options = {}) {
        const resolvedContainer = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        const resolvedId = typeof containerId === 'string'
            ? containerId
            : (resolvedContainer && resolvedContainer.id ? resolvedContainer.id : `photon-bev-${Date.now()}`);

        this.containerId = resolvedId;
        this.container = resolvedContainer;

        this.options = {
            onBeamSelect: options.onBeamSelect || (() => {}),
            showToolbar: true,
            showHeader: true,
            toolbarTitle: 'BEV',
            toolbarContainerId: null,
            onDrrSettingsClick: options.onDrrSettingsClick || null,
            ...options
        };

        this.canvas = null;
        this.ctx = null;
        this.dialCanvas = null;
        this.dialCtx = null;

        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.isocenter = { x: 0, y: 0 };

        this.currentTool = 'pan';
        this.measurePoints = [];
        this.isDragging = false;
        this.isZooming = false;
        this.isDraggingIso = false;
        this.lastMousePos = { x: 0, y: 0 };

        /** 坞门半宽/半高（世界坐标，随画布同步） */
        this.field = { halfW: 140, halfH: 100 };
        /** 双层 MLC：下层黑线黑字，上层白线白字 */
        this.mlc = {
            leafHeight: 17,
            leafCount: 18,
            topNumber: 29,
            carriageX: 280,
            selected: new Set(['lower-L-9', 'upper-L-11'])
        };

        this.isMaximized = false;
        this.beamList = [
            { id: 1, color: '#5a5a6a' },
            { id: 2, color: '#7cb9e8' },
            { id: 3, color: '#5a5a6a' }
        ];
        this.selectedBeamId = 2;

        if (this.container) {
            this.init();
        }
    }

    init() {
        this.render();
        setTimeout(() => {
            this.setupCanvas();
            this.bindEvents();
            this.renderDial();
            this.renderAll();
        }, 50);
    }

    render() {
        if (!this.container) return;

        const internalToolbar = (this.options.showToolbar && !this.options.toolbarContainerId)
            ? this.renderToolbar()
            : '';

        this.container.innerHTML = `
            <div class="bev-view-container photon-bev-view">
                ${internalToolbar}
                <div class="bev-view-main">
                    <div class="bev-view-canvas-wrapper">
                        <canvas id="${this.containerId}-dial" class="bev-view-beam-diagram photon-bev-dial" aria-hidden="true"></canvas>
                        <canvas id="${this.containerId}-canvas" class="bev-view-canvas"></canvas>
                    </div>
                </div>
            </div>
        `;

        if (this.options.showToolbar && this.options.toolbarContainerId) {
            this.mountToolbarExternally();
        }
    }

    gradDef(prefix) {
        return `
            <defs>
                <linearGradient id="gradient-${prefix}-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                </linearGradient>
            </defs>`;
    }

    toolbarButtonGroup() {
        const g = (id) => `url(#gradient-${id}-${this.containerId})`;
        return `
            <button type="button" class="toolbar-btn-svg" id="${this.containerId}-drr" title="DRR 设置" data-active="false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">${this.gradDef('drr')}
                    <rect x="5" y="4" width="4" height="16" rx="1" stroke="${g('drr')}" stroke-width="1.5" fill="none"/>
                    <circle cx="7" cy="10" r="1.5" fill="${g('drr')}"/>
                    <rect x="15" y="6" width="4" height="14" rx="1" stroke="${g('drr')}" stroke-width="1.5" fill="none"/>
                    <circle cx="17" cy="14" r="1.5" fill="${g('drr')}"/>
                </svg>
            </button>
            <button type="button" class="toolbar-btn-svg" id="${this.containerId}-zoom" title="缩放" data-active="${this.currentTool === 'zoom'}">
                        <span class="mozi-view-icon mozi-view-icon-zoom" aria-hidden="true"></span>
                    </button>
            <button type="button" class="toolbar-btn-svg" id="${this.containerId}-pan" title="移动" data-active="${this.currentTool === 'pan'}">
                        <span class="mozi-view-icon mozi-view-icon-pan" aria-hidden="true"></span>
                    </button>
            <button type="button" class="toolbar-btn-svg" id="${this.containerId}-measure" title="测量" data-active="${this.currentTool === 'measure'}">
                        <span class="mozi-view-icon mozi-view-icon-measure" aria-hidden="true"></span>
                    </button>
            <button type="button" class="toolbar-btn-svg" id="${this.containerId}-maximize" title="最大化" data-active="false">
                        <span class="mozi-view-icon mozi-view-icon-maximize" aria-hidden="true"></span>
                    </button>
        `;
    }

    renderToolbar() {
        if (!this.options.showToolbar) return '';
        const titleHtml = this.options.showHeader
            ? `<div class="toolbar-title">${this.options.toolbarTitle || 'BEV'}</div>`
            : '';
        return `
            <div class="cross-section-view2d-toolbar" data-photon-bev-toolbar="${this.containerId}">
                ${titleHtml}
                <div class="toolbar-group toolbar-group-right">
                    ${this.toolbarButtonGroup()}
                </div>
            </div>
        `;
    }

    mountToolbarExternally() {
        const external = document.getElementById(this.options.toolbarContainerId);
        if (!external) {
            console.warn('PhotonBeamEyeViewComponent: toolbarContainerId not found:', this.options.toolbarContainerId);
            return;
        }
        external.innerHTML = this.renderToolbarButtonsOnly();
    }

    renderToolbarButtonsOnly() {
        if (!this.options.showToolbar) return '';
        return `
            <div class="cross-section-view2d-toolbar" data-photon-bev-toolbar="${this.containerId}" style="background: transparent; border: none; padding: 0; height: auto;">
                <div class="toolbar-group toolbar-group-right">
                    ${this.toolbarButtonGroup()}
                </div>
            </div>
        `;
    }

    setupCanvas() {
        this.canvas = document.getElementById(`${this.containerId}-canvas`);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.dialCanvas = document.getElementById(`${this.containerId}-dial`);
        if (this.dialCanvas) {
            this.dialCtx = this.dialCanvas.getContext('2d');
        }

        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.renderDial();
            this.renderAll();
        });
    }

    resizeCanvas() {
        if (!this.canvas || !this.container) return;
        const wrapper = this.canvas.parentElement;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        let width = rect.width || wrapper.offsetWidth || 800;
        let height = rect.height || wrapper.offsetHeight || 600;
        if (width < 2) width = 800;
        if (height < 2) height = 600;

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.syncMlcLayout(width, height);

        if (this.dialCanvas) {
            this.dialCanvas.width = 112;
            this.dialCanvas.height = 112;
            this.dialCanvas.style.width = '112px';
            this.dialCanvas.style.height = '112px';
            this.dialCanvas.style.position = 'absolute';
            this.dialCanvas.style.top = '10px';
            this.dialCanvas.style.left = '10px';
            this.dialCanvas.style.zIndex = '100';
            this.dialCanvas.style.pointerEvents = 'auto';
        }
    }

    bindEvents() {
        if (!this.canvas) return;

        const drrBtn = document.getElementById(`${this.containerId}-drr`);
        if (drrBtn) {
            drrBtn.addEventListener('click', () => {
                if (typeof this.options.onDrrSettingsClick === 'function') {
                    this.options.onDrrSettingsClick();
                }
            });
        }

        document.getElementById(`${this.containerId}-zoom`)?.addEventListener('click', () => this.activateTool('zoom'));
        document.getElementById(`${this.containerId}-pan`)?.addEventListener('click', () => this.activateTool('pan'));
        document.getElementById(`${this.containerId}-measure`)?.addEventListener('click', () => this.activateTool('measure'));
        document.getElementById(`${this.containerId}-maximize`)?.addEventListener('click', () => this.toggleMaximize());

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.currentTool === 'measure') {
                this.measurePoints.push({ x, y });
                if (this.measurePoints.length > 2) this.measurePoints = [];
                this.renderAll();
                return;
            }

            const leaf = this.hitTestLeaf(x, y);
            if (leaf && (this.currentTool === 'pan' || !this.currentTool)) {
                if (this.mlc.selected.has(leaf.id)) {
                    this.mlc.selected.delete(leaf.id);
                } else {
                    this.mlc.selected.add(leaf.id);
                }
                this.renderAll();
                return;
            }

            const iso = this.isoScreenPos();
            const distIso = Math.hypot(x - iso.x, y - iso.y);
            if (distIso < 10 && this.currentTool !== 'measure') {
                this.isDraggingIso = true;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.isDragging = true;
                return;
            }

            if (this.currentTool === 'pan') {
                this.isDragging = true;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.canvas.style.cursor = 'grabbing';
            } else if (this.currentTool === 'zoom') {
                this.isZooming = true;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.isDraggingIso) {
                const dx = e.clientX - this.lastMousePos.x;
                const dy = e.clientY - this.lastMousePos.y;
                this.isocenter.x += dx / this.zoom;
                this.isocenter.y += dy / this.zoom;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.renderAll();
                return;
            }

            if (this.isDragging && this.currentTool === 'pan') {
                const dx = e.clientX - this.lastMousePos.x;
                const dy = e.clientY - this.lastMousePos.y;
                this.panX += dx;
                this.panY += dy;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.renderAll();
            } else if (this.isZooming) {
                const dy = e.clientY - this.lastMousePos.y;
                const delta = dy > 0 ? 0.95 : 1.05;
                this.zoom *= delta;
                this.zoom = Math.max(0.1, Math.min(10, this.zoom));
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.renderAll();
            } else {
                this.updateCursor(x, y);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.isZooming = false;
            this.isDraggingIso = false;
            this.canvas.style.cursor = this.currentTool === 'pan' ? 'grab' : this.canvas.style.cursor;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.isZooming = false;
            this.isDraggingIso = false;
            this.updateCursor();
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom *= delta;
            this.zoom = Math.max(0.1, Math.min(10, this.zoom));
            this.renderAll();
        }, { passive: false });

        this.canvas.setAttribute('tabindex', '0');
        this.canvas.addEventListener('mouseenter', () => this.canvas.focus());

        if (this.dialCanvas) {
            this.dialCanvas.addEventListener('click', (e) => {
                const rect = this.dialCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left - this.dialCanvas.width / 2;
                const y = e.clientY - rect.top - this.dialCanvas.height / 2;
                const angle = Math.atan2(y, x);
                const n = this.beamList.length;
                if (n === 0) return;
                const step = (Math.PI * 2) / n;
                let idx = Math.floor(((angle + Math.PI / 2 + step / 2) + Math.PI * 4) % (Math.PI * 2) / step) % n;
                if (this.beamList[idx]) {
                    this.selectedBeamId = this.beamList[idx].id;
                    this.options.onBeamSelect(this.selectedBeamId);
                    this.renderDial();
                }
            });
        }
    }

    syncMlcLayout(width, height) {
        const w = Math.max(1, width || (this.canvas && this.canvas.width) || 800);
        const h = Math.max(1, height || (this.canvas && this.canvas.height) || 600);
        this.mlc.leafCount = h < 240 ? 12 : 18;
        this.mlc.topNumber = this.mlc.leafCount === 12 ? 26 : 29;
        const desired = (h * 0.84) / (this.mlc.leafCount + 0.5);
        this.mlc.leafHeight = Math.max(8, Math.min(18, desired));
        this.mlc.carriageX = Math.max(80, w * 0.47);
        this.field.halfW = this.mlc.carriageX * 0.36;
        this.field.halfH = this.mlc.leafCount * this.mlc.leafHeight * 0.42;
    }

    isoScreenPos() {
        const cx = this.canvas.width / 2 + this.panX + this.isocenter.x * this.zoom;
        const cy = this.canvas.height / 2 + this.panY + this.isocenter.y * this.zoom;
        return { x: cx, y: cy };
    }

    screenToWorld(px, py) {
        return {
            x: (px - this.canvas.width / 2 - this.panX) / this.zoom - this.isocenter.x,
            y: (py - this.canvas.height / 2 - this.panY) / this.zoom - this.isocenter.y
        };
    }

    getLeafTips(layerId, index) {
        const n = this.mlc.leafCount;
        const t = n <= 1 ? 0 : (index / (n - 1)) * 2 - 1;
        const r = Math.sqrt(Math.max(0, 1 - t * t * 0.9));
        const hw = this.field.halfW;
        let openL = hw * (0.22 + r * 0.52);
        let openR = hw * (0.22 + r * 0.52);
        const seed = index * 17 + (layerId === 'upper' ? 5 : 0);
        openL += Math.sin(seed * 0.37) * 16;
        openR += Math.cos(seed * 0.29) * 14;
        if (index === 12 || index === 13) {
            openL *= 0.42;
            openR *= 0.62;
        }
        if (index === 14) {
            openL *= 0.5;
            openR *= 0.48;
        }
        return {
            leftTip: -Math.max(10, openL),
            rightTip: Math.max(10, openR)
        };
    }

    buildMlcLeaves() {
        const leaves = [];
        const h = this.mlc.leafHeight;
        const n = this.mlc.leafCount;
        const yStart = -(n * h) / 2;
        const layers = [
            { id: 'lower', yOffset: 0, border: '#000000', text: '#000000' },
            { id: 'upper', yOffset: h / 2, border: '#FFFFFF', text: '#FFFFFF' }
        ];
        layers.forEach((layer) => {
            for (let i = 0; i < n; i++) {
                const y = yStart + i * h + layer.yOffset;
                const tips = this.getLeafTips(layer.id, i);
                const num = this.mlc.topNumber - i;
                const prefix = layer.id === 'lower' ? 'L' : 'U';
                leaves.push({
                    id: `${layer.id}-L-${i}`,
                    layer: layer.id,
                    side: 'L',
                    x0: -this.mlc.carriageX,
                    x1: tips.leftTip,
                    y0: y,
                    y1: y + h,
                    label: `${prefix}${num}`,
                    border: layer.border,
                    text: layer.text
                });
                leaves.push({
                    id: `${layer.id}-R-${i}`,
                    layer: layer.id,
                    side: 'R',
                    x0: tips.rightTip,
                    x1: this.mlc.carriageX,
                    y0: y,
                    y1: y + h,
                    label: `${prefix}${num}`,
                    border: layer.border,
                    text: layer.text
                });
            }
        });
        return leaves;
    }

    hitTestLeaf(px, py) {
        const w = this.screenToWorld(px, py);
        const leaves = this.buildMlcLeaves();
        for (let i = leaves.length - 1; i >= 0; i--) {
            const leaf = leaves[i];
            if (w.x >= leaf.x0 && w.x <= leaf.x1 && w.y >= leaf.y0 && w.y <= leaf.y1) {
                return leaf;
            }
        }
        return null;
    }

    activateTool(toolName) {
        if (this.currentTool === toolName) {
            this.currentTool = toolName === 'measure' ? null : 'pan';
        } else {
            this.currentTool = toolName;
        }
        if (this.currentTool !== 'measure') {
            this.measurePoints = [];
        }

        ['zoom', 'pan', 'measure'].forEach((t) => {
            const btn = document.getElementById(`${this.containerId}-${t}`);
            if (btn) btn.setAttribute('data-active', String(this.currentTool === t));
        });

        this.updateCursor();
        this.renderAll();
    }

    updateCursor(x, y) {
        if (!this.canvas) return;
        if (this.currentTool === 'zoom') {
            this.canvas.style.cursor = 'zoom-in';
            return;
        }
        if (this.currentTool === 'measure') {
            this.canvas.style.cursor = 'crosshair';
            return;
        }
        if (this.currentTool === 'pan' || !this.currentTool) {
            const leaf = (typeof x === 'number' && typeof y === 'number') ? this.hitTestLeaf(x, y) : null;
            this.canvas.style.cursor = leaf ? 'pointer' : (this.currentTool === 'pan' ? 'grab' : 'default');
            return;
        }
        this.canvas.style.cursor = 'default';
    }

    toggleMaximize() {
        this.isMaximized = !this.isMaximized;
        const host = this.container;
        const btn = document.getElementById(`${this.containerId}-maximize`);
        if (this.isMaximized) {
            host.style.position = 'fixed';
            host.style.top = '0';
            host.style.left = '0';
            host.style.width = '100vw';
            host.style.height = '100vh';
            host.style.zIndex = '9999';
            host.style.backgroundColor = '#0a0e14';
            if (btn) btn.setAttribute('data-active', 'true');
        } else {
            host.style.position = '';
            host.style.top = '';
            host.style.left = '';
            host.style.width = '';
            host.style.height = '';
            host.style.zIndex = '';
            host.style.backgroundColor = '';
            if (btn) btn.setAttribute('data-active', 'false');
        }
        setTimeout(() => {
            this.resizeCanvas();
            this.renderDial();
            this.renderAll();
        }, 80);
    }

    renderDial() {
        if (!this.dialCtx || !this.dialCanvas) return;
        const ctx = this.dialCtx;
        const w = this.dialCanvas.width;
        const h = this.dialCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const r0 = 28;
        const r1 = 46;
        ctx.clearRect(0, 0, w, h);
        const n = this.beamList.length || 1;
        const step = (Math.PI * 2) / n;
        this.beamList.forEach((beam, i) => {
            const a0 = i * step - Math.PI / 2;
            const a1 = (i + 1) * step - Math.PI / 2;
            const sel = beam.id === this.selectedBeamId;
            ctx.beginPath();
            ctx.arc(cx, cy, r1, a0, a1);
            ctx.arc(cx, cy, r0, a1, a0, true);
            ctx.closePath();
            ctx.fillStyle = sel ? '#6b8cae' : '#3a3f4a';
            ctx.fill();
            ctx.strokeStyle = '#555b66';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });
        ctx.beginPath();
        ctx.arc(cx, cy, r1, 0, Math.PI * 2);
        ctx.strokeStyle = '#4a5058';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, r0, 0, Math.PI * 2);
        ctx.strokeStyle = '#4a5058';
        ctx.stroke();
    }

    renderBackgroundWorld() {
        const ctx = this.ctx;
        const span = Math.max(this.canvas.width, this.canvas.height) * 2;
        const g = ctx.createLinearGradient(-span / 2, -span / 2, span / 2, span / 2);
        g.addColorStop(0, '#1a0a2e');
        g.addColorStop(0.35, '#16213e');
        g.addColorStop(0.7, '#0f3460');
        g.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = g;
        ctx.fillRect(-span / 2, -span / 2, span, span);

        ctx.save();
        ctx.globalAlpha = 0.35;
        for (let i = 0; i < 6; i++) {
            const px = Math.sin(i * 1.7) * 180;
            const py = Math.cos(i * 1.3) * 120;
            const rg = ctx.createRadialGradient(px, py, 10, px, py, 140);
            rg.addColorStop(0, 'rgba(180, 120, 255, 0.5)');
            rg.addColorStop(1, 'rgba(80, 40, 120, 0)');
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(px, py, 140, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    renderHorizontalGridWorld() {
        const ctx = this.ctx;
        const span = Math.max(this.canvas.width, this.canvas.height) * 2;
        ctx.strokeStyle = 'rgba(80, 160, 255, 0.18)';
        ctx.lineWidth = 1 / this.zoom;
        const step = 24;
        for (let y = -span / 2; y <= span / 2; y += step) {
            ctx.beginPath();
            ctx.moveTo(-span / 2, y);
            ctx.lineTo(span / 2, y);
            ctx.stroke();
        }
    }

    renderMLCWorld() {
        const ctx = this.ctx;
        const inv = 1 / this.zoom;
        const jx0 = -this.field.halfW;
        const jx1 = this.field.halfW;
        const jy0 = -this.field.halfH;
        const jy1 = this.field.halfH;
        const leaves = this.buildMlcLeaves();

        leaves.forEach((leaf) => {
            const w = leaf.x1 - leaf.x0;
            const h = leaf.y1 - leaf.y0;
            if (w <= 0 || h <= 0) return;

            const selected = this.mlc.selected.has(leaf.id);
            if (selected) {
                ctx.fillStyle = 'rgba(36, 155, 217, 0.5)';
                ctx.fillRect(leaf.x0, leaf.y0, w, h);
            } else {
                ctx.fillStyle = 'rgba(160, 190, 255, 0.3)';
                ctx.fillRect(leaf.x0, leaf.y0, w, h);
                const ix0 = Math.max(leaf.x0, jx0);
                const ix1 = Math.min(leaf.x1, jx1);
                const iy0 = Math.max(leaf.y0, jy0);
                const iy1 = Math.min(leaf.y1, jy1);
                if (ix1 > ix0 && iy1 > iy0) {
                    ctx.fillStyle = 'rgba(248, 203, 47, 0.3)';
                    ctx.fillRect(ix0, iy0, ix1 - ix0, iy1 - iy0);
                }
            }

            ctx.strokeStyle = leaf.border;
            ctx.lineWidth = inv;
            ctx.strokeRect(leaf.x0, leaf.y0, w, h);

            const leafPx = this.mlc.leafHeight * this.zoom;
            if (leafPx >= 13 && w * this.zoom > 24) {
                ctx.fillStyle = leaf.text;
                const fontPx = Math.max(7, Math.min(9, leafPx * 0.55)) * inv;
                ctx.font = `600 ${fontPx}px "PingFang SC", "Source Han Sans SC", sans-serif`;
                ctx.textBaseline = 'middle';
                const pad = (leaf.layer === 'upper' ? 4 : 12) * inv;
                const cy = (leaf.y0 + leaf.y1) / 2;
                if (leaf.side === 'L') {
                    ctx.textAlign = 'right';
                    ctx.fillText(leaf.label, leaf.x1 - pad, cy);
                } else {
                    ctx.textAlign = 'left';
                    ctx.fillText(leaf.label, leaf.x0 + pad, cy);
                }
            }
        });
    }

    renderCrosshairScreen() {
        const ctx = this.ctx;
        const { x: cx, y: cy } = this.isoScreenPos();
        ctx.strokeStyle = '#ff9500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(this.canvas.width, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, this.canvas.height);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('H', cx, 18);
        ctx.textBaseline = 'top';
        ctx.fillText('F', cx, this.canvas.height - 12);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('R', 22, cy);
        ctx.textAlign = 'left';
        ctx.fillText('L', this.canvas.width - 22, cy);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(200, 220, 255, 0.85)';
        for (let v = 1; v <= 60; v++) {
            const t = v / 61;
            const yy = t * (this.canvas.height - 40) + 20;
            const tick = v % 5 === 0 ? 8 : 4;
            ctx.beginPath();
            ctx.moveTo(cx - tick, yy);
            ctx.lineTo(cx + tick, yy);
            ctx.strokeStyle = 'rgba(255, 149, 0, 0.5)';
            ctx.stroke();
            if (v % 5 === 0) {
                ctx.fillText(String(v), cx + 14, yy);
            }
        }
    }

    renderMeasurement() {
        if (this.measurePoints.length === 0) return;
        const ctx = this.ctx;
        ctx.strokeStyle = '#00e676';
        ctx.fillStyle = '#00e676';
        ctx.lineWidth = 2;
        this.measurePoints.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        if (this.measurePoints.length === 2) {
            const [p1, p2] = this.measurePoints;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            ctx.font = '13px system-ui, sans-serif';
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000000';
            const text = `${dist.toFixed(1)} px`;
            ctx.strokeText(text, midX + 8, midY - 8);
            ctx.fillStyle = '#00e676';
            ctx.fillText(text, midX + 8, midY - 8);
        }
    }

    renderAll() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.fillStyle = '#050810';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        this.ctx.save();
        this.ctx.translate(cx + this.panX, cy + this.panY);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(this.isocenter.x, this.isocenter.y);

        this.renderBackgroundWorld();
        this.renderHorizontalGridWorld();
        this.renderMLCWorld();

        this.ctx.restore();

        this.renderCrosshairScreen();
        this.renderMeasurement();
    }

    destroy() {
        this.canvas = null;
        this.ctx = null;
        this.dialCanvas = null;
        this.dialCtx = null;
        this.container = null;
    }
}

window.PhotonBeamEyeViewComponent = PhotonBeamEyeViewComponent;
