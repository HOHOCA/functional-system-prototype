/**
 * Brachy 3D View Component
 * 三维重建视图组件（后装专用），用于显示ROI和射束的3D模型
 * 使用Three.js实现3D渲染
 */

class BrachyView3DComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' 
            ? document.getElementById(containerId) 
            : containerId;
        
        if (!this.container) {
            console.error('3D View container not found:', containerId);
            return;
        }

        this.options = {
            enableToolbar: true,
            enableRightClick: true,
            showBeams: true,
            showROIs: true,
            showIsocenter: true,
            backgroundColor: 0x000000,
            // 布局/标题栏控制
            showToolbar: true,
            showHeader: true,
            toolbarTitle: '3D',
            toolbarContainerId: null, // 若提供，则工具栏渲染到外部容器，避免双标题
            ...options
        };

        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Data
        this.rois = [];
        this.beams = [];
        this.isocenters = [];
        this.beamSpots = [];
        
        // UI state
        this.toolMode = null; // rotate, zoom, pan
        this.displayMode = 'solid'; // solid, wireframe, vertex
        this.showBeamSpots = true;
        this.isMaximized = false;
        
        // Mouse interaction
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        // Check if Three.js is available
        if (typeof THREE === 'undefined') {
            console.error('Three.js library not loaded. Please include Three.js before using BrachyView3DComponent.');
            this.renderFallback();
            return;
        }

        this.ensureStyles();
        this.render();
        this.initThreeJS();
        this.setupLighting();
        this.loadDefaultScene();
        this.bindEvents();
        this.startAnimation();
    }

    ensureStyles() {
        if (document.getElementById('brachy-view3d-styles')) return;
        const style = document.createElement('style');
        style.id = 'brachy-view3d-styles';
        style.innerHTML = `
            .bv3d-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                background: #000;
                display: flex;
                flex-direction: column;
            }
            .bv3d-canvas-container {
                flex: 1;
                position: relative;
                width: 100%;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    render() {
        this.ensureStyles();

        const internalToolbar = (this.options.enableToolbar && this.options.showToolbar && !this.options.toolbarContainerId)
            ? this.renderToolbar()
            : '';

        const html = `
            <div class="view3d-wrapper bv3d-wrapper">
                ${internalToolbar}
                <div class="view3d-canvas-container bv3d-canvas-container">
                    <canvas class="view3d-canvas"></canvas>
                </div>
                ${this.renderContextMenu()}
            </div>
        `;
        this.container.innerHTML = html;

        // 如果指定外部工具栏容器，渲染到该容器
        if (this.options.enableToolbar && this.options.showToolbar && this.options.toolbarContainerId) {
            this.mountToolbarExternally();
        }
        
        // Get canvas element
        this.canvas = this.container.querySelector('.view3d-canvas');
    }

    renderToolbar() {
        if (!this.options.enableToolbar || !this.options.showToolbar) return '';

        const titleHtml = this.options.showHeader
            ? `<div class="toolbar-title">${this.options.toolbarTitle || '3D'}</div>`
            : '';

        return `
            <div class="cross-section-view2d-toolbar" data-bv3d-toolbar="${this.containerId}">
                ${titleHtml}
                <div class="toolbar-group toolbar-group-right">
                    <button class="toolbar-btn-svg" id="${this.containerId}-rotate" title="旋转" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-rotate-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <rect x="6" y="8" width="12" height="8" rx="1" stroke="url(#gradient-rotate-${this.containerId})" stroke-width="2" fill="none"/>
                            <path d="M18 8 L18 5 L21 8 L18 11 L18 8" fill="url(#gradient-rotate-${this.containerId})"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-zoom" title="缩放" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-zoom-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <circle cx="10" cy="10" r="7" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" fill="none"/>
                            <line x1="15" y1="15" x2="21" y2="21" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                            <line x1="7" y1="10" x2="13" y2="10" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                            <line x1="10" y1="7" x2="10" y2="13" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-pan" title="拖动" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-pan-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M9 6 C9 4 10 3 11 3 C12 3 13 4 13 6 L13 11 L14.5 9.5 C15.5 8.5 17 8.5 17.5 9.5 C18 10.5 18 11.5 17 12.5 L13.5 17 C12.5 18.5 11 19 9 19 L6 19 C4.5 19 3 17.5 3 16 L3 12 C3 10.5 4 9.5 5 9.5 C6 9.5 7 10 7 11 L7 6 C7 4 8 3 9 3 C9 3 9 4 9 6 Z" stroke="url(#gradient-pan-${this.containerId})" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-maximize" title="全屏" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-maximize-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M3 3 L3 9 M3 3 L9 3" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 3 L21 9 M21 3 L15 3" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 21 L3 15 M3 21 L9 21" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 21 L21 15 M21 21 L15 21" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    mountToolbarExternally() {
        const external = document.getElementById(this.options.toolbarContainerId);
        if (!external) {
            console.warn('BrachyView3DComponent: toolbarContainerId not found:', this.options.toolbarContainerId);
            // 如果外部容器不存在，回退到内部渲染（避免无工具栏）
            const wrapper = this.container.querySelector('.bv3d-wrapper');
            if (wrapper && !wrapper.querySelector('[data-bv3d-toolbar]')) {
                wrapper.insertAdjacentHTML('afterbegin', this.renderToolbar());
            }
            return;
        }
        // 渲染到外部容器时，只渲染工具按钮组（不含标题栏）
        const toolbarHtml = this.renderToolbarButtonsOnly();
        external.innerHTML = toolbarHtml;
    }

    renderToolbarButtonsOnly() {
        if (!this.options.enableToolbar || !this.options.showToolbar) return '';

        return `
            <div class="cross-section-view2d-toolbar" data-bv3d-toolbar="${this.containerId}" style="background: transparent; border: none; padding: 0; height: auto;">
                <div class="toolbar-group toolbar-group-right">
                    <button class="toolbar-btn-svg" id="${this.containerId}-rotate" title="旋转" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-rotate-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <rect x="6" y="8" width="12" height="8" rx="1" stroke="url(#gradient-rotate-${this.containerId})" stroke-width="2" fill="none"/>
                            <path d="M18 8 L18 5 L21 8 L18 11 L18 8" fill="url(#gradient-rotate-${this.containerId})"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-zoom" title="缩放" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-zoom-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <circle cx="10" cy="10" r="7" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" fill="none"/>
                            <line x1="15" y1="15" x2="21" y2="21" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                            <line x1="7" y1="10" x2="13" y2="10" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                            <line x1="10" y1="7" x2="10" y2="13" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-pan" title="拖动" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-pan-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M9 6 C9 4 10 3 11 3 C12 3 13 4 13 6 L13 11 L14.5 9.5 C15.5 8.5 17 8.5 17.5 9.5 C18 10.5 18 11.5 17 12.5 L13.5 17 C12.5 18.5 11 19 9 19 L6 19 C4.5 19 3 17.5 3 16 L3 12 C3 10.5 4 9.5 5 9.5 C6 9.5 7 10 7 11 L7 6 C7 4 8 3 9 3 C9 3 9 4 9 6 Z" stroke="url(#gradient-pan-${this.containerId})" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-maximize" title="全屏" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-maximize-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M3 3 L3 9 M3 3 L9 3" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 3 L21 9 M21 3 L15 3" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 21 L3 15 M3 21 L9 21" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 21 L21 15 M21 21 L15 21" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    renderContextMenu() {
        return `
            <div class="view3d-context-menu" style="display: none;">
                <div class="context-menu-item" data-action="pan">
                    <i class="fas fa-hand-paper"></i>
                    <span>拖动</span>
                </div>
                <div class="context-menu-item" data-action="zoom">
                    <i class="fas fa-search-plus"></i>
                    <span>缩放</span>
                </div>
                <div class="context-menu-item" data-action="rotate">
                    <i class="fas fa-redo"></i>
                    <span>旋转</span>
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" data-action="maximize">
                    <i class="fas fa-expand"></i>
                    <span>最大/最小化</span>
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" data-action="beam-spots">
                    <i class="fas fa-circle"></i>
                    <span>束斑</span>
                    <i class="fas fa-check"></i>
                </div>
                <div class="context-menu-item" data-action="solid">
                    <i class="fas fa-cube"></i>
                    <span>实体</span>
                    <i class="fas fa-check"></i>
                </div>
                <div class="context-menu-item" data-action="wireframe">
                    <i class="fas fa-project-diagram"></i>
                    <span>线框</span>
                </div>
                <div class="context-menu-item" data-action="vertex">
                    <i class="fas fa-braille"></i>
                    <span>顶点</span>
                </div>
            </div>
        `;
    }

    renderFallback() {
        this.container.innerHTML = `
            <div class="view3d-fallback">
                <div class="fallback-message">
                    <i class="fas fa-cube"></i>
                    <p>Three.js库未加载</p>
                    <p class="fallback-hint">请在HTML中引入Three.js库</p>
                </div>
            </div>
        `;
    }

    initThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.options.backgroundColor);

        // Create camera - match screenshot perspective (slightly above and looking down)
        const width = this.canvas.clientWidth || 800;
        const height = this.canvas.clientHeight || 600;
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        this.camera.position.set(0, 150, 450);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    setupLighting() {
        // Ambient light - slightly brighter for better visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Main directional light from top-front
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(0, 300, 400);
        this.scene.add(directionalLight1);

        // Fill lights from sides
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-300, 100, -200);
        this.scene.add(directionalLight2);

        const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight3.position.set(300, 100, -200);
        this.scene.add(directionalLight3);

        // Back light for depth
        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(0, -100, -300);
        this.scene.add(backLight);
    }

    loadDefaultScene() {
        // 1. Outer body/skin layer (similar to screenshot - yellowish translucent)
        const bodyGeo = new THREE.CylinderGeometry(165, 185, 200, 48, 1, false);
        bodyGeo.rotateX(Math.PI / 2);
        const bodyMat = new THREE.MeshPhongMaterial({
            color: 0xc4a864,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            shininess: 10
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.set(0, 0, 0);
        body.userData = { type: 'body' };
        this.scene.add(body);

        // 2. Large green semi-transparent pelvic region (main green mass in screenshot)
        this.addROI({
            name: 'Pelvis_Main',
            color: 0x55dd55,
            geometry: this.createEllipsoidGeometry(140, 70, 110),
            position: { x: 0, y: 10, z: 0 },
            opacity: 0.4
        });

        // 3. Secondary green structures (bladder/rectum area)
        this.addROI({
            name: 'Bladder',
            color: 0x66ee66,
            geometry: this.createEllipsoidGeometry(50, 55, 60),
            position: { x: 0, y: 35, z: 25 },
            opacity: 0.5
        });

        this.addROI({
            name: 'Rectum',
            color: 0x77ff77,
            geometry: this.createEllipsoidGeometry(35, 40, 50),
            position: { x: 0, y: 20, z: -30 },
            opacity: 0.45
        });

        // 4. Smaller green structures around
        const smallGreenStructures = [
            { color: 0x66ee66, size: [35, 35, 40], pos: [55, 15, 10], opacity: 0.42 },
            { color: 0x66ee66, size: [35, 35, 40], pos: [-55, 15, 10], opacity: 0.42 },
            { color: 0x77ff77, size: [30, 35, 35], pos: [45, -10, -15], opacity: 0.38 },
            { color: 0x77ff77, size: [30, 35, 35], pos: [-45, -10, -15], opacity: 0.38 }
        ];

        smallGreenStructures.forEach((s, i) => {
            this.addROI({
                name: `GreenOrgan${i}`,
                color: s.color,
                geometry: this.createEllipsoidGeometry(s.size[0], s.size[1], s.size[2]),
                position: { x: s.pos[0], y: s.pos[1], z: s.pos[2] },
                opacity: s.opacity
            });
        });

        // 5. Central target (pink/red structures in screenshot)
        this.addROI({
            name: 'CTV',
            color: 0xd9686d,
            geometry: this.createEllipsoidGeometry(38, 55, 48),
            position: { x: 0, y: 30, z: 20 },
            opacity: 0.65
        });

        this.addROI({
            name: 'GTV',
            color: 0xe8777d,
            geometry: this.createEllipsoidGeometry(28, 42, 35),
            position: { x: 0, y: 32, z: 22 },
            opacity: 0.7
        });

        // 6. Orange/yellow organs (OARs)
        this.addROI({
            name: 'OAR_Left',
            color: 0xf0a860,
            geometry: this.createEllipsoidGeometry(32, 35, 40),
            position: { x: -50, y: 40, z: 5 },
            opacity: 0.55
        });

        this.addROI({
            name: 'OAR_Right',
            color: 0xf0b070,
            geometry: this.createEllipsoidGeometry(32, 35, 40),
            position: { x: 50, y: 40, z: 5 },
            opacity: 0.55
        });

        // 7. Bone structure (deeper, more subtle)
        this.addROI({
            name: 'Bone',
            color: 0xb5a890,
            geometry: this.createEllipsoidGeometry(70, 35, 50),
            position: { x: 0, y: -20, z: -10 },
            opacity: 0.3
        });

        // 8. Three bright green beam lines from bottom (matching screenshot exactly)
        const beamColor = 0x00ff44; // Bright neon green
        const beamDefs = [
            { name: 'Beam 1', xOffset: -18, angle: -8 },
            { name: 'Beam 2', xOffset: 0, angle: 0 },
            { name: 'Beam 3', xOffset: 18, angle: 8 }
        ];

        beamDefs.forEach((b, i) => {
            this.addBeam({
                name: b.name,
                angle: b.angle,
                fieldSize: { width: 18, height: 18 },
                isocenter: { x: b.xOffset, y: 15, z: 25 },
                visible: true,
                color: beamColor,
                index: i + 1
            });
        });

        // 9. Isocenter cross at applicator convergence
        this.addIsocenter({ x: 0, y: 15, z: 25 });
    }

    createEllipsoidGeometry(radiusX, radiusY, radiusZ) {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        geometry.scale(radiusX, radiusY, radiusZ);
        return geometry;
    }

    createCylinderGeometry(radius, height) {
        return new THREE.CylinderGeometry(radius, radius, height, 32);
    }

    addROI(roi) {
        const material = new THREE.MeshPhongMaterial({
            color: roi.color,
            transparent: true,
            opacity: roi.opacity !== undefined ? roi.opacity : 0.6,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(roi.geometry, material);
        
        if (roi.position) {
            mesh.position.set(roi.position.x, roi.position.y, roi.position.z);
        }
        
        mesh.userData = {
            type: 'roi',
            name: roi.name,
            visible: roi.visible
        };
        
        mesh.visible = roi.visible !== false;
        
        this.scene.add(mesh);
        this.rois.push({
            mesh: mesh,
            data: roi
        });
    }

    addReferencePlane() {
        const geometry = new THREE.PlaneGeometry(400, 400);
        const material = new THREE.MeshBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.userData = { type: 'reference-plane' };
        this.scene.add(plane);
    }

    addBeam(beam) {
        // Render applicator (tube) instead of radiotherapy beam
        const tubeLength = 420;
        const tubeRadius = 2.3; // slight thickness
        const angleRad = THREE.MathUtils.degToRad(beam.angle);
        
        // Start position: far below patient
        const start = new THREE.Vector3(
            beam.isocenter.x + Math.sin(angleRad) * tubeLength,
            beam.isocenter.y - tubeLength,
            beam.isocenter.z + Math.cos(angleRad) * tubeLength
        );
        
        // End position: applicator tip near isocenter
        const end = new THREE.Vector3(
            beam.isocenter.x,
            beam.isocenter.y,
            beam.isocenter.z
        );
        
        // Direction and length
        const dir = new THREE.Vector3().subVectors(end, start);
        const len = dir.length();
        dir.normalize();
        
        // Cylinder geometry aligned to Z, then orient to direction
        const geometry = new THREE.CylinderGeometry(tubeRadius, tubeRadius, len, 16, 1, true);
        const material = new THREE.MeshPhongMaterial({
            color: beam.color,
            transparent: true,
            opacity: 0.85,
            shininess: 40
        });
        const tube = new THREE.Mesh(geometry, material);
        
        // Position cylinder midpoint
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        tube.position.copy(mid);
        
        // Orient cylinder to direction
        const axis = new THREE.Vector3(0, 1, 0); // cylinder default up-axis
        tube.quaternion.setFromUnitVectors(axis, dir.clone().normalize());
        
        // Add subtle outer glow using line
        const glowGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
        const glowMat = new THREE.LineBasicMaterial({
            color: beam.color,
            transparent: true,
            opacity: 0.25,
            linewidth: 5
        });
        const glowLine = new THREE.Line(glowGeo, glowMat);
        
        tube.userData = { type: 'applicator', name: beam.name };
        glowLine.userData = { type: 'applicator-glow', name: beam.name };
        
        this.scene.add(tube);
        this.scene.add(glowLine);
        
        this.beams.push({
            tube,
            glow: glowLine,
            data: beam
        });
    }

    addIsocenter(position) {
        // Create crosshair for isocenter
        const crosshairGroup = new THREE.Group();
        
        const size = 20;
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
        
        // X-axis line
        const xGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-size, 0, 0),
            new THREE.Vector3(size, 0, 0)
        ]);
        const xLine = new THREE.Line(xGeometry, lineMaterial);
        crosshairGroup.add(xLine);
        
        // Y-axis line
        const yGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -size, 0),
            new THREE.Vector3(0, size, 0)
        ]);
        const yLine = new THREE.Line(yGeometry, lineMaterial);
        crosshairGroup.add(yLine);
        
        // Z-axis line
        const zGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, -size),
            new THREE.Vector3(0, 0, size)
        ]);
        const zLine = new THREE.Line(zGeometry, lineMaterial);
        crosshairGroup.add(zLine);
        
        // Add sphere at center
        const sphereGeometry = new THREE.SphereGeometry(3, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        crosshairGroup.add(sphere);
        
        crosshairGroup.position.set(position.x, position.y, position.z);
        crosshairGroup.userData = { type: 'isocenter' };
        
        this.scene.add(crosshairGroup);
        this.isocenters.push(crosshairGroup);
    }

    createLabelSprite(text, color = 0xffffff) {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Convert hex color to RGB
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;
        
        ctx.fillStyle = `rgba(${r},${g},${b},1)`;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 5;
        ctx.strokeText(text, size / 2, size / 2);
        ctx.fillText(text, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(16, 16, 1);
        return sprite;
    }

    bindEvents() {
        // Toolbar buttons
        const rotateBtn = document.getElementById(`${this.containerId}-rotate`);
        const zoomBtn = document.getElementById(`${this.containerId}-zoom`);
        const panBtn = document.getElementById(`${this.containerId}-pan`);
        const maximizeBtn = document.getElementById(`${this.containerId}-maximize`);

        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => this.activateTool('rotate'));
        }
        if (zoomBtn) {
            zoomBtn.addEventListener('click', () => this.activateTool('zoom'));
        }
        if (panBtn) {
            panBtn.addEventListener('click', () => this.activateTool('pan'));
        }
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => this.toggleMaximize());
        }

        // Canvas mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

        // Context menu
        if (this.options.enableRightClick) {
            this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
            document.addEventListener('click', this.hideContextMenu.bind(this));
            
            const menuItems = this.container.querySelectorAll('.context-menu-item');
            menuItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const action = e.currentTarget.dataset.action;
                    this.handleContextMenuAction(action);
                });
            });
        }

        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));

        // ESC key to reset
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.resetView();
                if (this.isMaximized) {
                    this.toggleMaximize();
                }
            }
        });
    }

    activateTool(toolName) {
        // If clicking the current tool, deactivate it
        if (this.toolMode === toolName) {
            this.toolMode = null;
        } else {
            this.toolMode = toolName;
        }

        // Update toolbar button states
        const tools = ['rotate', 'zoom', 'pan'];
        tools.forEach(tool => {
            const btn = document.getElementById(`${this.containerId}-${tool}`);
            if (btn) {
                const isActive = (tool === this.toolMode);
                btn.setAttribute('data-active', isActive);
            }
        });

        // Update cursor
        this.updateCursor();
    }

    updateCursor() {
        switch (this.toolMode) {
            case 'zoom':
                this.canvas.style.cursor = 'zoom-in';
                break;
            case 'pan':
                this.canvas.style.cursor = 'grab';
                break;
            case 'rotate':
                this.canvas.style.cursor = 'crosshair';
                break;
            default:
                this.canvas.style.cursor = 'default';
        }
    }

    handleMouseDown(e) {
        if (!this.toolMode) return;
        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
        
        if (this.toolMode === 'pan') {
            this.canvas.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.toolMode) return;

        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        switch (this.toolMode) {
            case 'rotate':
                this.rotateViewByDelta(deltaX, deltaY);
                break;
            case 'zoom':
                this.zoomViewByDelta(deltaY);
                break;
            case 'pan':
                this.panViewByDelta(deltaX, deltaY);
                break;
        }

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    handleMouseUp(e) {
        this.isDragging = false;
        
        if (this.toolMode === 'pan') {
            this.canvas.style.cursor = 'grab';
        }
    }

    handleWheel(e) {
        // 禁用滚轮缩放
        e.preventDefault();
    }

    rotateView(degrees) {
        const radians = THREE.MathUtils.degToRad(degrees);
        
        // Rotate camera around the scene
        const currentPosition = this.camera.position;
        const distance = currentPosition.length();
        const currentAngle = Math.atan2(currentPosition.x, currentPosition.z);
        const newAngle = currentAngle + radians;
        
        this.camera.position.set(
            Math.sin(newAngle) * distance,
            currentPosition.y,
            Math.cos(newAngle) * distance
        );
        
        this.camera.lookAt(0, 0, 0);
    }

    rotateViewByDelta(deltaX, deltaY) {
        const rotationSpeed = 0.005;
        
        // Get current camera position relative to origin
        const position = this.camera.position.clone();
        
        // Calculate spherical coordinates
        const radius = position.length();
        const theta = Math.atan2(position.x, position.z);
        const phi = Math.acos(position.y / radius);
        
        // Update angles
        const newTheta = theta - deltaX * rotationSpeed; // 鼠标左移应向左旋转
        const newPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - deltaY * rotationSpeed));
        
        // Convert back to Cartesian coordinates
        this.camera.position.set(
            radius * Math.sin(newPhi) * Math.sin(newTheta),
            radius * Math.cos(newPhi),
            radius * Math.sin(newPhi) * Math.cos(newTheta)
        );
        
        this.camera.lookAt(0, 0, 0);
    }

    zoomViewByDelta(delta) {
        const zoomSpeed = 0.5;
        const direction = this.camera.position.clone().normalize();
        this.camera.position.addScaledVector(direction, delta * zoomSpeed);
        
        // Prevent camera from getting too close or too far
        const distance = this.camera.position.length();
        if (distance < 100) {
            this.camera.position.setLength(100);
        } else if (distance > 2000) {
            this.camera.position.setLength(2000);
        }
    }

    panViewByDelta(deltaX, deltaY) {
        const panSpeed = 0.5;
        
        // Calculate right and up vectors
        const right = new THREE.Vector3();
        const up = new THREE.Vector3();
        
        this.camera.getWorldDirection(right);
        right.cross(this.camera.up).normalize();
        up.copy(this.camera.up).normalize();
        
        // Move camera
        this.camera.position.addScaledVector(right, -deltaX * panSpeed);
        this.camera.position.addScaledVector(up, deltaY * panSpeed);
        
        // Update camera to continue looking at the same target point (like rotate and zoom do)
        this.camera.lookAt(0, 0, 0);
    }

    handleContextMenu(e) {
        e.preventDefault();
        
        const menu = this.container.querySelector('.view3d-context-menu');
        if (!menu) return;
        
        menu.style.display = 'block';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
    }

    hideContextMenu() {
        const menu = this.container.querySelector('.view3d-context-menu');
        if (menu) {
            menu.style.display = 'none';
        }
    }

    handleContextMenuAction(action) {
        this.hideContextMenu();
        
        switch (action) {
            case 'pan':
            case 'zoom':
            case 'rotate':
                this.toolMode = action;
                this.updateCursor();
                break;
            case 'maximize':
                this.toggleMaximize();
                break;
            case 'beam-spots':
                this.toggleBeamSpots();
                break;
            case 'solid':
            case 'wireframe':
            case 'vertex':
                this.setDisplayMode(action);
                break;
        }
        
        // Update context menu UI
        this.updateContextMenuUI();
    }

    updateContextMenuUI() {
        const items = this.container.querySelectorAll('.context-menu-item');
        items.forEach(item => {
            const action = item.dataset.action;
            const checkIcon = item.querySelector('.fa-check');
            
            if (!checkIcon) return;
            
            if (action === 'beam-spots') {
                checkIcon.style.display = this.showBeamSpots ? 'inline' : 'none';
            } else if (action === this.displayMode) {
                checkIcon.style.display = 'inline';
            } else if (['solid', 'wireframe', 'vertex'].includes(action)) {
                checkIcon.style.display = 'none';
            }
        });
    }

    toggleMaximize() {
        this.isMaximized = !this.isMaximized;
        const container = this.container;
        const maximizeBtn = document.getElementById(`${this.containerId}-maximize`);
        
        if (this.isMaximized) {
            // Maximize
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100vw';
            container.style.height = '100vh';
            container.style.zIndex = '9999';
            container.style.backgroundColor = '#000';
            if (maximizeBtn) {
                maximizeBtn.setAttribute('data-active', 'true');
            }
        } else {
            // Restore
            container.style.position = '';
            container.style.top = '';
            container.style.left = '';
            container.style.width = '';
            container.style.height = '';
            container.style.zIndex = '';
            container.style.backgroundColor = '';
            if (maximizeBtn) {
                maximizeBtn.setAttribute('data-active', 'false');
            }
        }
        
        // Resize renderer
        setTimeout(() => this.handleResize(), 100);
    }

    toggleFullscreen() {
        this.toggleMaximize();
    }

    toggleBeamSpots() {
        this.showBeamSpots = !this.showBeamSpots;
        
        this.scene.traverse((object) => {
            if (object.userData.type === 'beam-spot') {
                object.visible = this.showBeamSpots;
            }
        });
    }

    setDisplayMode(mode) {
        this.displayMode = mode;
        
        this.scene.traverse((object) => {
            if (object.type === 'Mesh' && object.userData.type === 'roi') {
                switch (mode) {
                    case 'solid':
                        object.material.wireframe = false;
                        object.material.transparent = true;
                        object.material.opacity = 0.6;
                        break;
                    case 'wireframe':
                        object.material.wireframe = true;
                        object.material.transparent = false;
                        object.material.opacity = 1.0;
                        break;
                    case 'vertex':
                        object.material.wireframe = true;
                        object.material.transparent = true;
                        object.material.opacity = 0.8;
                        break;
                }
            }
        });
    }

    resetView() {
        // Reset camera position
        this.camera.position.set(0, 0, 500);
        this.camera.lookAt(0, 0, 0);
        
        // Reset tool mode
        this.toolMode = null;
        const tools = ['rotate', 'zoom', 'pan'];
        tools.forEach(tool => {
            const btn = document.getElementById(`${this.containerId}-${tool}`);
            if (btn) {
                btn.setAttribute('data-active', 'false');
            }
        });
        this.updateCursor();
    }

    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    startAnimation() {
        const animate = () => {
            requestAnimationFrame(animate);
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    // Public API methods
    setROIList(roiList) {
        console.log('setROIList:', roiList);
    }

    setBeamList(beamList) {
        console.log('setBeamList:', beamList);
    }

    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
        this.container.innerHTML = '';
    }
}

// Export to window (unique to brachy)
if (typeof window !== 'undefined') {
    window.BrachyView3DComponent = BrachyView3DComponent;
}


