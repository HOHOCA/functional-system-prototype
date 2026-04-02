/**
 * Photon 3D View Component
 * 三维重建视图组件（光子专用），用于显示ROI和射束的3D模型
 * 使用Three.js实现3D渲染
 */

class PhotonView3DComponent {
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
            // 布局/标题栏控制（对齐 BrachyView3DComponent）
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
        
        // UI state（对齐 BrachyView3DComponent：默认不激活任何工具，避免误操作）
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
            console.error('Three.js library not loaded. Please include Three.js before using PhotonView3DComponent.');
            this.renderFallback();
            return;
        }

        this.render();
        this.initThreeJS();
        this.setupLighting();
        this.loadDefaultScene();
        this.bindEvents();
        this.startAnimation();
    }

    render() {
        const internalToolbar = (this.options.enableToolbar && this.options.showToolbar && !this.options.toolbarContainerId)
            ? this.renderToolbar()
            : '';

        const html = `
            <div class="view3d-wrapper bv3d-wrapper">
                ${internalToolbar}
                <div class="view3d-canvas-container">
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
            console.warn('PhotonView3DComponent: toolbarContainerId not found:', this.options.toolbarContainerId);
            // 如果外部容器不存在，回退到内部渲染（避免无工具栏）
            const wrapper = this.container.querySelector('.bv3d-wrapper');
            if (wrapper && !wrapper.querySelector('[data-bv3d-toolbar]')) {
                wrapper.insertAdjacentHTML('afterbegin', this.renderToolbar());
            }
            return;
        }
        // 渲染到外部容器时，只渲染工具按钮组（不含标题栏）
        external.innerHTML = this.renderToolbarButtonsOnly();
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

        // Create camera
        const width = this.canvas.clientWidth || 800;
        const height = this.canvas.clientHeight || 600;
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        this.camera.position.set(0, 0, 500);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Add axes helper (for development)
        // const axesHelper = new THREE.AxesHelper(100);
        // this.scene.add(axesHelper);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight1.position.set(1, 1, 1);
        this.scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight2.position.set(-1, -1, -1);
        this.scene.add(directionalLight2);

        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 0.3);
        pointLight.position.set(0, 200, 200);
        this.scene.add(pointLight);
    }

    loadDefaultScene() {
        // Load default ROIs (mock data)
        this.addROI({
            name: 'PTV',
            color: 0xff0000,
            geometry: this.createEllipsoidGeometry(50, 60, 70),
            visible: true
        });

        this.addROI({
            name: 'CTV',
            color: 0x00ff00,
            geometry: this.createEllipsoidGeometry(40, 50, 60),
            visible: true
        });

        this.addROI({
            name: 'Spinal Cord',
            color: 0x00ffff,
            geometry: this.createCylinderGeometry(10, 100),
            position: { x: -30, y: 0, z: 0 },
            visible: true
        });

        // Add reference plane
        this.addReferencePlane();

        // Add default beams (mock data)
        this.addBeam({
            name: 'Beam 1',
            angle: 0,
            fieldSize: { width: 100, height: 100 },
            isocenter: { x: 0, y: 0, z: 0 },
            visible: true,
            color: 0x0066ff
        });

        this.addBeam({
            name: 'Beam 2',
            angle: 90,
            fieldSize: { width: 80, height: 120 },
            isocenter: { x: 0, y: 0, z: 0 },
            visible: true,
            color: 0xff6600
        });

        this.addBeam({
            name: 'Beam 3',
            angle: 180,
            fieldSize: { width: 90, height: 90 },
            isocenter: { x: 0, y: 0, z: 0 },
            visible: true,
            color: 0xffff00
        });

        // Add isocenters
        this.addIsocenter({ x: 0, y: 0, z: 0 });
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
            opacity: 0.6,
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
        
        mesh.visible = roi.visible;
        
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
        const beamGroup = new THREE.Group();
        beamGroup.userData = {
            type: 'beam',
            name: beam.name,
            visible: beam.visible
        };

        // Create beam aperture (field outline)
        const apertureGeometry = new THREE.PlaneGeometry(beam.fieldSize.width, beam.fieldSize.height);
        const apertureMaterial = new THREE.MeshBasicMaterial({
            color: beam.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const apertureMesh = new THREE.Mesh(apertureGeometry, apertureMaterial);

        // Create aperture outline
        const edgesGeometry = new THREE.EdgesGeometry(apertureGeometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: beam.color, linewidth: 2 });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        
        beamGroup.add(apertureMesh);
        beamGroup.add(edges);

        // Position beam
        const distance = 200; // Distance from isocenter
        const angleRad = THREE.MathUtils.degToRad(beam.angle);
        beamGroup.position.set(
            beam.isocenter.x + Math.sin(angleRad) * distance,
            beam.isocenter.y,
            beam.isocenter.z + Math.cos(angleRad) * distance
        );
        beamGroup.lookAt(beam.isocenter.x, beam.isocenter.y, beam.isocenter.z);

        // Add beam axis line
        const beamAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -distance)
        ]);
        const beamAxisMaterial = new THREE.LineBasicMaterial({ color: beam.color, linewidth: 1 });
        const beamAxis = new THREE.Line(beamAxisGeometry, beamAxisMaterial);
        beamGroup.add(beamAxis);

        // Add beam spot (first energy layer)
        if (this.showBeamSpots) {
            const spotGeometry = new THREE.CircleGeometry(beam.fieldSize.width * 0.3, 32);
            const spotMaterial = new THREE.MeshBasicMaterial({
                color: beam.color,
                transparent: true,
                opacity: 0.5
            });
            const spot = new THREE.Mesh(spotGeometry, spotMaterial);
            spot.userData = { type: 'beam-spot' };
            beamGroup.add(spot);
        }

        beamGroup.visible = beam.visible;
        this.scene.add(beamGroup);
        
        this.beams.push({
            group: beamGroup,
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

    bindEvents() {
        // Toolbar buttons（支持内部/外部工具栏：使用固定 id 查找）
        const rotateBtn = document.getElementById(`${this.containerId}-rotate`);
        const zoomBtn = document.getElementById(`${this.containerId}-zoom`);
        const panBtn = document.getElementById(`${this.containerId}-pan`);
        const maximizeBtn = document.getElementById(`${this.containerId}-maximize`);

        if (rotateBtn) rotateBtn.addEventListener('click', () => this.activateTool('rotate'));
        if (zoomBtn) zoomBtn.addEventListener('click', () => this.activateTool('zoom'));
        if (panBtn) panBtn.addEventListener('click', () => this.activateTool('pan'));
        if (maximizeBtn) maximizeBtn.addEventListener('click', () => this.toggleMaximize());

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
        // 禁用滚轮缩放（对齐后装 3D 交互）
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
        const newTheta = theta + deltaX * rotationSpeed;
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
                this.activateTool(action);
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
        const wrapper = this.container.querySelector('.view3d-wrapper');
        const btn = this.container.querySelector('[data-tool="maximize"]');
        const icon = btn ? btn.querySelector('i') : null;
        
        if (this.isMaximized) {
            wrapper.classList.add('maximized');
            if (icon) {
                icon.classList.remove('fa-expand');
                icon.classList.add('fa-compress');
            }
        } else {
            wrapper.classList.remove('maximized');
            if (icon) {
                icon.classList.remove('fa-compress');
                icon.classList.add('fa-expand');
            }
        }
        
        // Resize renderer
        setTimeout(() => this.handleResize(), 100);
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
                        // For vertex mode, we could use Points instead
                        // For now, just use wireframe with higher opacity
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
        // Update ROI visibility based on list
        // This would be called from external components
        console.log('setROIList:', roiList);
    }

    setBeamList(beamList) {
        // Update beam visibility based on list
        console.log('setBeamList:', beamList);
    }

    destroy() {
        // Cleanup
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

// Export to window
if (typeof window !== 'undefined') {
    window.PhotonView3DComponent = PhotonView3DComponent;
}

