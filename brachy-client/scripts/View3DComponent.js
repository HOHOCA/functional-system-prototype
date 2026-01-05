/**
 * 3D View Component
 * 三维重建视图组件，用于显示ROI和射束的3D模型
 * 使用Three.js实现3D渲染
 */

class View3DComponent {
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
        this.toolMode = 'rotate'; // rotate, zoom, pan
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
            console.error('Three.js library not loaded. Please include Three.js before using View3DComponent.');
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
        const html = `
            <div class="view3d-wrapper">
                <div class="view3d-header" style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#111;color:#d5e5ff;font-size:13px;border-bottom:1px solid #1f2937;">
                    <div class="view3d-title" style="font-weight:700;">3D</div>
                    <div class="view3d-actions" style="display:flex;gap:10px;">
                        <button class="view3d-action-btn" data-action="rotate" title="旋转" style="background:none;border:none;color:#d5e5ff;cursor:pointer;">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="view3d-action-btn" data-action="zoom" title="缩放" style="background:none;border:none;color:#d5e5ff;cursor:pointer;">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button class="view3d-action-btn" data-action="pan" title="移动" style="background:none;border:none;color:#d5e5ff;cursor:pointer;">
                            <i class="fas fa-arrows-alt"></i>
                        </button>
                        <button class="view3d-action-btn" data-action="fullscreen" title="全屏" style="background:none;border:none;color:#d5e5ff;cursor:pointer;">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
                <div class="view3d-canvas-container">
                    <canvas class="view3d-canvas"></canvas>
                </div>
                ${this.renderContextMenu()}
            </div>
        `;
        this.container.innerHTML = html;
        
        // Get canvas element
        this.canvas = this.container.querySelector('.view3d-canvas');
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
        // Torso volume (approximate body)
        const torsoGeo = new THREE.CylinderGeometry(160, 180, 260, 32, 1, true);
        torsoGeo.rotateX(Math.PI / 2);
        const torsoMat = new THREE.MeshPhongMaterial({
            color: 0xa89a4f,
            transparent: true,
            opacity: 0.32,
            side: THREE.DoubleSide
        });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.set(0, -20, 0);
        torso.userData = { type: 'torso' };
        this.scene.add(torso);

        // Pelvis / soft-tissue mass
        this.addROI({
            name: 'Pelvis',
            color: 0x66cc66,
            geometry: this.createEllipsoidGeometry(130, 45, 90),
            position: { x: 0, y: 25, z: 10 },
            opacity: 0.45
        });

        // Organs / targets (stacked translucent blobs)
        const organDefs = [
            { name: 'CTV', color: 0xd96d6d, size: [40, 60, 50], pos: [0, 35, 20], opacity: 0.65 },
            { name: 'PTV', color: 0x7fc4ff, size: [55, 50, 55], pos: [0, 20, 25], opacity: 0.4 },
            { name: 'OAR1', color: 0xf2c94c, size: [30, 30, 40], pos: [25, 45, 10], opacity: 0.55 },
            { name: 'OAR2', color: 0xf2994a, size: [28, 35, 35], pos: [-22, 40, 8], opacity: 0.55 },
            { name: 'Lymph', color: 0x8bc48b, size: [35, 30, 35], pos: [10, 10, -5], opacity: 0.5 },
            { name: 'Bone', color: 0xb5a58c, size: [60, 40, 30], pos: [0, -15, -5], opacity: 0.35 }
        ];

        organDefs.forEach(def => {
            this.addROI({
                name: def.name,
                color: def.color,
                geometry: this.createEllipsoidGeometry(def.size[0], def.size[1], def.size[2]),
                position: { x: def.pos[0], y: def.pos[1], z: def.pos[2] },
                opacity: def.opacity
            });
        });

        // Add three green beams
        const beams = [
            { name: 'Beam 1', angle: -6, offset: -15 },
            { name: 'Beam 2', angle: 4, offset: 8 },
            { name: 'Beam 3', angle: 10, offset: 20 }
        ];

        beams.forEach((b, i) => {
            this.addBeam({
                name: b.name,
                angle: b.angle,
                fieldSize: { width: 22, height: 22 },
                isocenter: { x: b.offset, y: 10, z: 30 },
                visible: true,
                color: 0x00ff55
            });
        });

        // Add numbered labels near isocenter
        const labels = [
            { text: '1', pos: { x: -5, y: 65, z: 10 } },
            { text: '2', pos: { x: -2, y: 35, z: 30 } },
            { text: '3', pos: { x: 25, y: 40, z: 25 } }
        ];
        labels.forEach(l => {
            const sprite = this.createLabelSprite(l.text);
            sprite.position.set(l.pos.x, l.pos.y, l.pos.z);
            this.scene.add(sprite);
        });

        // Add isocenter cross
        this.addIsocenter({ x: 0, y: 10, z: 30 });
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

    createLabelSprite(text) {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 4;
        ctx.strokeText(text, size / 2, size / 2);
        ctx.fillText(text, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(14, 14, 1);
        return sprite;
    }

    bindEvents() {
        // Header action buttons
        const actionButtons = this.container.querySelectorAll('.view3d-action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action === 'fullscreen') {
                    this.toggleFullscreen();
                } else {
                    this.handleToolClick(action);
                }
            });
        });

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

    handleToolClick(tool) {
        const btn = this.container.querySelector(`[data-action="${tool}"]`);
        
        if (tool === 'maximize') {
            this.toggleMaximize();
            return;
        }

        if (tool === 'rotate') {
            // Single click: rotate 90 degrees clockwise
            this.rotateView(90);
            return;
        }

        // Toggle tool mode
        if (this.toolMode === tool) {
            this.toolMode = 'rotate';
            if (btn) btn.classList.remove('active');
        } else {
            // Deactivate all other tools
            this.container.querySelectorAll('.view3d-action-btn').forEach(b => b.classList.remove('active'));
            this.toolMode = tool;
            if (btn) btn.classList.add('active');
        }

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
        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
        
        if (this.toolMode === 'pan') {
            this.canvas.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

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
        e.preventDefault();
        const delta = e.deltaY;
        this.zoomViewByDelta(delta * 0.5);
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
        const wrapper = this.container.querySelector('.view3d-wrapper');
        const btn = this.container.querySelector('[data-action="fullscreen"]');
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
        this.toolMode = 'rotate';
        this.container.querySelectorAll('.view3d-tool-btn').forEach(btn => btn.classList.remove('active'));
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
    window.View3DComponent = View3DComponent;
}

