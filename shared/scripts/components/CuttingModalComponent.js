// 切割弹窗组件
class CuttingModalComponent {
    constructor(options = {}) {
        this.options = {
            onConfirm: options.onConfirm || (() => {}),
            onCancel: options.onCancel || (() => {}),
            getSelectedROI: options.getSelectedROI || (() => null),
            getROIList: options.getROIList || (() => []),
            getROIContour: options.getROIContour || (() => []),
            ...options
        };

        this.modal = null;
        this.cuttingViewingFrame = null;
        this.resultViewingFrame1 = null;
        this.resultViewingFrame2 = null;
        
        // 切割线相关
        this.cuttingLine = null; // { start: {x, y}, end: {x, y}, angle: 0 }
        this.isDrawing = false;
        this.isDrawingMode = true; // 首次进入自动进入绘制模式
        this.currentSlice = 26;
        this.totalSlices = 50;
        this.currentView = 'Axial'; // Axial, Sagittal, Coronal
        
        // 目标结构配置
        this.targetConfigs = [
            {
                retain: true,
                isNew: true,
                roiName: '',
                roiColor: '#ff6b6b',
                roiType: 'ORGAN',
                existingRoi: ''
            },
            {
                retain: true,
                isNew: true,
                roiName: '',
                roiColor: '#4ecdc4',
                roiType: 'ORGAN',
                existingRoi: ''
            }
        ];

        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.initViewingFrames();
    }

    render() {
        this.modal = document.createElement('div');
        this.modal.className = 'cutting-modal-mask';
        this.modal.innerHTML = `
            <div class="cutting-modal">
                <div class="cutting-modal-header">
                    <h2>切割</h2>
                    <button class="cutting-modal-close" id="cuttingModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="cutting-modal-body">
                    <!-- 左侧：切割区域 -->
                    <div class="cutting-area">
                        <div class="cutting-viewing-frame-container">
                            <!-- 左上角功能 -->
                            <div class="cutting-frame-controls">
                                <button class="cutting-control-btn" id="cuttingDrawBtn" title="绘制 绘制切割线">
                                    <i class="fas fa-pencil-alt"></i>
                                    <span>绘制</span>
                                </button>
                                <button class="cutting-control-btn" id="cuttingClearBtn" title="清空 清空切割线">
                                    <i class="fas fa-eraser"></i>
                                    <span>清空</span>
                                </button>
                                <div class="cutting-angle-input">
                                    <label>角度:</label>
                                    <input type="number" id="cuttingAngleInput" class="cutting-input" value="0" min="0" max="360" step="1">
                                </div>
                            </div>
                            
                            <!-- 右上角工具栏 -->
                            <div class="cutting-frame-toolbar">
                                <button class="cutting-tool-btn" id="cuttingSwitchViewBtn" title="切换截面">
                                    <i class="fas fa-th"></i>
                                </button>
                                <button class="cutting-tool-btn" id="cuttingZoomBtn" title="放大">
                                    <i class="fas fa-search-plus"></i>
                                </button>
                                <button class="cutting-tool-btn" id="cuttingMoveBtn" title="移动">
                                    <i class="fas fa-arrows-alt"></i>
                                </button>
                                <button class="cutting-tool-btn" id="cuttingWindowBtn" title="窗宽窗位">
                                    <i class="fas fa-adjust"></i>
                                </button>
                                <button class="cutting-tool-btn" id="cuttingRotateBtn" title="旋转">
                                    <i class="fas fa-redo"></i>
                                </button>
                                <button class="cutting-tool-btn" id="cuttingMeasureBtn" title="测量">
                                    <i class="fas fa-ruler"></i>
                                </button>
                            </div>
                            
                            <!-- 阅片框 -->
                            <div class="cutting-viewing-frame" id="cuttingViewingFrame">
                                <canvas id="cuttingCanvas" class="cutting-canvas"></canvas>
                                <div class="cutting-slice-info">Axial 26/50</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 右侧：目标结构区域 -->
                    <div class="target-structure-area">
                        <div class="target-structure-title">目标结构</div>
                        
                        <!-- 结果区1 -->
                        <div class="result-section">
                            <div class="result-viewing-frame-container">
                                <div class="result-viewing-frame-toolbar">
                                    <button class="result-tool-btn" title="放大"><i class="fas fa-search-plus"></i></button>
                                    <button class="result-tool-btn" title="移动"><i class="fas fa-arrows-alt"></i></button>
                                    <button class="result-tool-btn" title="窗宽窗位"><i class="fas fa-adjust"></i></button>
                                    <button class="result-tool-btn" title="旋转"><i class="fas fa-redo"></i></button>
                                    <button class="result-tool-btn" title="测量"><i class="fas fa-ruler"></i></button>
                                </div>
                                <div class="result-viewing-frame" id="resultViewingFrame1">
                                    <canvas id="resultCanvas1" class="result-canvas"></canvas>
                                    <div class="result-slice-info">Axial 26/50</div>
                                </div>
                            </div>
                            
                            <div class="result-config">
                                <label class="result-retain-checkbox">
                                    <input type="checkbox" id="resultRetain1" checked>
                                    <span>保留</span>
                                </label>
                                
                                <div class="result-structure-options">
                                    <label class="result-radio-label">
                                        <input type="radio" name="resultStructure1" value="new" id="resultNew1" checked>
                                        <span>新建结构</span>
                                    </label>
                                    <div class="result-new-structure-fields" id="resultNewFields1">
                                        <input type="text" id="resultRoiName1" class="result-input" placeholder="输入ROI名称" maxlength="64">
                                        <div class="result-color-type">
                                            <div class="result-color-preview" id="resultColorPreview1" style="background: #ff6b6b;"></div>
                                            <button class="result-color-picker" id="resultColorPicker1">选择颜色</button>
                                            <select id="resultRoiType1" class="result-select">
                                                <option value="ORGAN">ORGAN</option>
                                                <option value="GTV">GTV</option>
                                                <option value="CTV">CTV</option>
                                                <option value="PTV">PTV</option>
                                                <option value="OAR">OAR</option>
                                                <option value="BODY">BODY</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <label class="result-radio-label">
                                        <input type="radio" name="resultStructure1" value="existing" id="resultExisting1">
                                        <span>已有结构</span>
                                    </label>
                                    <div class="result-existing-structure-fields" id="resultExistingFields1" style="display: none;">
                                        <select id="resultExistingRoi1" class="result-select">
                                            <option value="">请选择已有结构</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 结果区2 -->
                        <div class="result-section">
                            <div class="result-viewing-frame-container">
                                <div class="result-viewing-frame-toolbar">
                                    <button class="result-tool-btn" title="放大"><i class="fas fa-search-plus"></i></button>
                                    <button class="result-tool-btn" title="移动"><i class="fas fa-arrows-alt"></i></button>
                                    <button class="result-tool-btn" title="窗宽窗位"><i class="fas fa-adjust"></i></button>
                                    <button class="result-tool-btn" title="旋转"><i class="fas fa-redo"></i></button>
                                    <button class="result-tool-btn" title="测量"><i class="fas fa-ruler"></i></button>
                                </div>
                                <div class="result-viewing-frame" id="resultViewingFrame2">
                                    <canvas id="resultCanvas2" class="result-canvas"></canvas>
                                    <div class="result-slice-info">Axial 26/50</div>
                                </div>
                            </div>
                            
                            <div class="result-config">
                                <label class="result-retain-checkbox">
                                    <input type="checkbox" id="resultRetain2" checked>
                                    <span>保留</span>
                                </label>
                                
                                <div class="result-structure-options">
                                    <label class="result-radio-label">
                                        <input type="radio" name="resultStructure2" value="new" id="resultNew2" checked>
                                        <span>新建结构</span>
                                    </label>
                                    <div class="result-new-structure-fields" id="resultNewFields2">
                                        <input type="text" id="resultRoiName2" class="result-input" placeholder="输入ROI名称" maxlength="64">
                                        <div class="result-color-type">
                                            <div class="result-color-preview" id="resultColorPreview2" style="background: #4ecdc4;"></div>
                                            <button class="result-color-picker" id="resultColorPicker2">选择颜色</button>
                                            <select id="resultRoiType2" class="result-select">
                                                <option value="ORGAN">ORGAN</option>
                                                <option value="GTV">GTV</option>
                                                <option value="CTV">CTV</option>
                                                <option value="PTV">PTV</option>
                                                <option value="OAR">OAR</option>
                                                <option value="BODY">BODY</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <label class="result-radio-label">
                                        <input type="radio" name="resultStructure2" value="existing" id="resultExisting2">
                                        <span>已有结构</span>
                                    </label>
                                    <div class="result-existing-structure-fields" id="resultExistingFields2" style="display: none;">
                                        <select id="resultExistingRoi2" class="result-select">
                                            <option value="">请选择已有结构</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="cutting-modal-footer">
                    <button class="btn btn-secondary" id="cuttingCancelBtn">取消</button>
                    <button class="btn btn-primary" id="cuttingConfirmBtn">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    bindEvents() {
        // 关闭按钮
        const closeBtn = this.modal.querySelector('#cuttingModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // 点击遮罩层关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // 取消按钮
        const cancelBtn = this.modal.querySelector('#cuttingCancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // 确定按钮
        const confirmBtn = this.modal.querySelector('#cuttingConfirmBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.handleConfirm();
            });
        }

        // 绘制按钮
        const drawBtn = this.modal.querySelector('#cuttingDrawBtn');
        if (drawBtn) {
            drawBtn.addEventListener('click', () => {
                this.toggleDrawingMode();
            });
        }

        // 清空按钮
        const clearBtn = this.modal.querySelector('#cuttingClearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearCuttingLine();
            });
        }

        // 角度输入
        const angleInput = this.modal.querySelector('#cuttingAngleInput');
        if (angleInput) {
            angleInput.addEventListener('change', (e) => {
                const angle = parseFloat(e.target.value) || 0;
                this.updateCuttingLineAngle(angle);
            });
        }

        // 切换截面
        const switchViewBtn = this.modal.querySelector('#cuttingSwitchViewBtn');
        if (switchViewBtn) {
            switchViewBtn.addEventListener('click', () => {
                this.switchView();
            });
        }

        // 保留勾选框
        const retain1 = this.modal.querySelector('#resultRetain1');
        const retain2 = this.modal.querySelector('#resultRetain2');
        if (retain1) {
            retain1.addEventListener('change', () => {
                this.updateRetainState(1, retain1.checked);
            });
        }
        if (retain2) {
            retain2.addEventListener('change', () => {
                this.updateRetainState(2, retain2.checked);
            });
        }

        // 新建/已有结构切换
        const new1 = this.modal.querySelector('#resultNew1');
        const existing1 = this.modal.querySelector('#resultExisting1');
        const new2 = this.modal.querySelector('#resultNew2');
        const existing2 = this.modal.querySelector('#resultExisting2');
        
        if (new1) {
            new1.addEventListener('change', () => {
                this.updateStructureType(1, 'new');
            });
        }
        if (existing1) {
            existing1.addEventListener('change', () => {
                this.updateStructureType(1, 'existing');
            });
        }
        if (new2) {
            new2.addEventListener('change', () => {
                this.updateStructureType(2, 'new');
            });
        }
        if (existing2) {
            existing2.addEventListener('change', () => {
                this.updateStructureType(2, 'existing');
            });
        }

        // 颜色选择器
        const colorPicker1 = this.modal.querySelector('#resultColorPicker1');
        const colorPicker2 = this.modal.querySelector('#resultColorPicker2');
        if (colorPicker1) {
            colorPicker1.addEventListener('click', () => {
                this.openColorPicker(1);
            });
        }
        if (colorPicker2) {
            colorPicker2.addEventListener('click', () => {
                this.openColorPicker(2);
            });
        }
    }

    initViewingFrames() {
        // 初始化切割区域阅片框
        this.initCuttingViewingFrame();
        
        // 初始化结果区域阅片框
        this.initResultViewingFrames();
        
        // 加载ROI轮廓
        this.loadROIContour();
        
        // 加载已有ROI列表
        this.loadROIList();
    }

    initCuttingViewingFrame() {
        const canvas = this.modal.querySelector('#cuttingCanvas');
        if (!canvas) return;

        const container = this.modal.querySelector('#cuttingViewingFrame');
        if (!container) return;

        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const ctx = canvas.getContext('2d');
        this.cuttingCanvas = canvas;
        this.cuttingCtx = ctx;

        // 绘制背景和ROI轮廓
        this.renderCuttingFrame();

        // 绑定绘制事件
        this.bindCuttingCanvasEvents();
    }

    initResultViewingFrames() {
        // 结果区1
        const canvas1 = this.modal.querySelector('#resultCanvas1');
        const container1 = this.modal.querySelector('#resultViewingFrame1');
        if (canvas1 && container1) {
            const rect = container1.getBoundingClientRect();
            canvas1.width = rect.width;
            canvas1.height = rect.height;
            const ctx1 = canvas1.getContext('2d');
            this.resultCanvas1 = canvas1;
            this.resultCtx1 = ctx1;
            this.renderResultFrame(1);
        }

        // 结果区2
        const canvas2 = this.modal.querySelector('#resultCanvas2');
        const container2 = this.modal.querySelector('#resultViewingFrame2');
        if (canvas2 && container2) {
            const rect = container2.getBoundingClientRect();
            canvas2.width = rect.width;
            canvas2.height = rect.height;
            const ctx2 = canvas2.getContext('2d');
            this.resultCanvas2 = canvas2;
            this.resultCtx2 = ctx2;
            this.renderResultFrame(2);
        }
    }

    bindCuttingCanvasEvents() {
        if (!this.cuttingCanvas) return;

        let isDrawing = false;
        let startPoint = null;

        // 鼠标按下
        this.cuttingCanvas.addEventListener('mousedown', (e) => {
            if (!this.isDrawingMode) return;
            
            const rect = this.cuttingCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 检查是否点击在切割线端点
            if (this.cuttingLine) {
                const tolerance = 10;
                const startDist = Math.sqrt(Math.pow(x - this.cuttingLine.start.x, 2) + Math.pow(y - this.cuttingLine.start.y, 2));
                const endDist = Math.sqrt(Math.pow(x - this.cuttingLine.end.x, 2) + Math.pow(y - this.cuttingLine.end.y, 2));
                
                if (startDist < tolerance) {
                    // 拖动起点
                    this.isDraggingEndpoint = 'start';
                    this.dragStartPoint = { x, y };
                    return;
                } else if (endDist < tolerance) {
                    // 拖动终点
                    this.isDraggingEndpoint = 'end';
                    this.dragStartPoint = { x, y };
                    return;
                } else {
                    // 检查是否在线上
                    const lineDist = this.distanceToLine(x, y, this.cuttingLine.start, this.cuttingLine.end);
                    if (lineDist < tolerance) {
                        // 拖动整条线
                        this.isDraggingLine = true;
                        this.dragStartPoint = { x, y };
                        this.dragLineStart = { ...this.cuttingLine.start };
                        this.dragLineEnd = { ...this.cuttingLine.end };
                        return;
                    }
                }
            }
            
            // 开始绘制新线段
            isDrawing = true;
            startPoint = { x, y };
            this.cuttingCanvas.style.cursor = 'crosshair';
        });

        // 鼠标移动
        this.cuttingCanvas.addEventListener('mousemove', (e) => {
            const rect = this.cuttingCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.isDrawingMode && !this.cuttingLine) {
                this.cuttingCanvas.style.cursor = 'crosshair';
            } else if (this.cuttingLine) {
                // 检查是否在端点或线上
                const tolerance = 10;
                const startDist = Math.sqrt(Math.pow(x - this.cuttingLine.start.x, 2) + Math.pow(y - this.cuttingLine.start.y, 2));
                const endDist = Math.sqrt(Math.pow(x - this.cuttingLine.end.x, 2) + Math.pow(y - this.cuttingLine.end.y, 2));
                const lineDist = this.distanceToLine(x, y, this.cuttingLine.start, this.cuttingLine.end);
                
                if (startDist < tolerance || endDist < tolerance) {
                    this.cuttingCanvas.style.cursor = 'grab';
                } else if (lineDist < tolerance) {
                    this.cuttingCanvas.style.cursor = 'move';
                } else {
                    this.cuttingCanvas.style.cursor = 'default';
                }
            }

            if (isDrawing && startPoint) {
                // 实时绘制线段
                this.renderCuttingFrame();
                this.cuttingCtx.strokeStyle = '#4a9eff';
                this.cuttingCtx.lineWidth = 2;
                this.cuttingCtx.beginPath();
                this.cuttingCtx.moveTo(startPoint.x, startPoint.y);
                this.cuttingCtx.lineTo(x, y);
                this.cuttingCtx.stroke();
            } else if (this.isDraggingEndpoint) {
                // 拖动端点
                const dx = x - this.dragStartPoint.x;
                const dy = y - this.dragStartPoint.y;
                
                if (this.isDraggingEndpoint === 'start') {
                    this.cuttingLine.start.x = this.dragLineStart.x + dx;
                    this.cuttingLine.start.y = this.dragLineStart.y + dy;
                } else {
                    this.cuttingLine.end.x = this.dragLineEnd.x + dx;
                    this.cuttingLine.end.y = this.dragLineEnd.y + dy;
                }
                
                this.updateAngleFromLine();
                this.renderCuttingFrame();
            } else if (this.isDraggingLine) {
                // 拖动整条线
                const dx = x - this.dragStartPoint.x;
                const dy = y - this.dragStartPoint.y;
                
                this.cuttingLine.start.x = this.dragLineStart.x + dx;
                this.cuttingLine.start.y = this.dragLineStart.y + dy;
                this.cuttingLine.end.x = this.dragLineEnd.x + dx;
                this.cuttingLine.end.y = this.dragLineEnd.y + dy;
                
                this.renderCuttingFrame();
            }
        });

        // 鼠标抬起
        this.cuttingCanvas.addEventListener('mouseup', (e) => {
            if (isDrawing && startPoint) {
                const rect = this.cuttingCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // 完成绘制
                this.cuttingLine = {
                    start: startPoint,
                    end: { x, y },
                    angle: 0
                };
                
                // 延伸切割线
                this.extendCuttingLine();
                this.updateAngleFromLine();
                
                // 退出绘制模式
                this.isDrawingMode = false;
                this.updateDrawButtonState();
                
                isDrawing = false;
                startPoint = null;
                this.renderCuttingFrame();
            }
            
            this.isDraggingEndpoint = null;
            this.isDraggingLine = false;
            this.cuttingCanvas.style.cursor = 'default';
        });

        // 鼠标离开
        this.cuttingCanvas.addEventListener('mouseleave', () => {
            isDrawing = false;
            startPoint = null;
            this.isDraggingEndpoint = null;
            this.isDraggingLine = false;
            this.cuttingCanvas.style.cursor = 'default';
        });
    }

    distanceToLine(px, py, lineStart, lineEnd) {
        const A = px - lineStart.x;
        const B = py - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    extendCuttingLine() {
        if (!this.cuttingLine) return;

        const canvas = this.cuttingCanvas;
        const width = canvas.width;
        const height = canvas.height;

        // 计算线的方向向量
        const dx = this.cuttingLine.end.x - this.cuttingLine.start.x;
        const dy = this.cuttingLine.end.y - this.cuttingLine.start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return;

        const unitX = dx / length;
        const unitY = dy / length;

        // 延伸起点
        let t1 = 0;
        if (unitX !== 0) {
            t1 = Math.max(t1, -this.cuttingLine.start.x / unitX);
            t1 = Math.max(t1, (width - this.cuttingLine.start.x) / unitX);
        }
        if (unitY !== 0) {
            t1 = Math.max(t1, -this.cuttingLine.start.y / unitY);
            t1 = Math.max(t1, (height - this.cuttingLine.start.y) / unitY);
        }

        // 延伸终点
        let t2 = length;
        if (unitX !== 0) {
            t2 = Math.min(t2, (width - this.cuttingLine.start.x) / unitX);
            t2 = Math.min(t2, -this.cuttingLine.start.x / unitX);
        }
        if (unitY !== 0) {
            t2 = Math.min(t2, (height - this.cuttingLine.start.y) / unitY);
            t2 = Math.min(t2, -this.cuttingLine.start.y / unitY);
        }

        this.cuttingLine.start.x = this.cuttingLine.start.x + unitX * t1;
        this.cuttingLine.start.y = this.cuttingLine.start.y + unitY * t1;
        this.cuttingLine.end.x = this.cuttingLine.start.x + unitX * t2;
        this.cuttingLine.end.y = this.cuttingLine.start.y + unitY * t2;
    }

    updateAngleFromLine() {
        if (!this.cuttingLine) return;

        const dx = this.cuttingLine.end.x - this.cuttingLine.start.x;
        const dy = this.cuttingLine.end.y - this.cuttingLine.start.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        this.cuttingLine.angle = angle < 0 ? angle + 360 : angle;

        const angleInput = this.modal.querySelector('#cuttingAngleInput');
        if (angleInput) {
            angleInput.value = Math.round(this.cuttingLine.angle);
        }
    }

    updateCuttingLineAngle(angle) {
        if (!this.cuttingLine) return;

        const centerX = (this.cuttingLine.start.x + this.cuttingLine.end.x) / 2;
        const centerY = (this.cuttingLine.start.y + this.cuttingLine.end.y) / 2;
        
        const length = Math.sqrt(
            Math.pow(this.cuttingLine.end.x - this.cuttingLine.start.x, 2) +
            Math.pow(this.cuttingLine.end.y - this.cuttingLine.start.y, 2)
        ) / 2;

        const rad = angle * Math.PI / 180;
        this.cuttingLine.start.x = centerX - Math.cos(rad) * length;
        this.cuttingLine.start.y = centerY - Math.sin(rad) * length;
        this.cuttingLine.end.x = centerX + Math.cos(rad) * length;
        this.cuttingLine.end.y = centerY + Math.sin(rad) * length;
        this.cuttingLine.angle = angle;

        this.extendCuttingLine();
        this.renderCuttingFrame();
    }

    renderCuttingFrame() {
        if (!this.cuttingCtx || !this.cuttingCanvas) return;

        const ctx = this.cuttingCtx;
        const width = this.cuttingCanvas.width;
        const height = this.cuttingCanvas.height;

        // 清空画布
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // 绘制渐变背景
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, '#2a2a2a');
        gradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 绘制ROI轮廓
        this.renderROIContour(ctx, width, height);

        // 绘制切割线
        if (this.cuttingLine) {
            ctx.strokeStyle = '#4a9eff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.cuttingLine.start.x, this.cuttingLine.start.y);
            ctx.lineTo(this.cuttingLine.end.x, this.cuttingLine.end.y);
            ctx.stroke();

            // 绘制端点圆点
            ctx.fillStyle = '#4a9eff';
            ctx.beginPath();
            ctx.arc(this.cuttingLine.start.x, this.cuttingLine.start.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.cuttingLine.end.x, this.cuttingLine.end.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderROIContour(ctx, width, height) {
        // 获取当前选中的ROI轮廓
        const selectedROI = this.options.getSelectedROI();
        if (!selectedROI) return;

        const contour = this.options.getROIContour(selectedROI);
        if (!contour || !contour.points || contour.points.length === 0) return;

        ctx.strokeStyle = contour.color || '#cccccc';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // 计算缩放和偏移（简化处理）
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) / 512;

        const firstPoint = contour.points[0];
        const x = centerX + (firstPoint.x - 256) * scale;
        const y = centerY + (firstPoint.y - 256) * scale;
        ctx.moveTo(x, y);

        for (let i = 1; i < contour.points.length; i++) {
            const point = contour.points[i];
            const px = centerX + (point.x - 256) * scale;
            const py = centerY + (point.y - 256) * scale;
            ctx.lineTo(px, py);
        }

        ctx.closePath();
        ctx.stroke();
    }

    renderResultFrame(index) {
        const canvas = index === 1 ? this.resultCanvas1 : this.resultCanvas2;
        const ctx = index === 1 ? this.resultCtx1 : this.resultCtx2;
        
        if (!canvas || !ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // 清空画布
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // 绘制渐变背景
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, '#2a2a2a');
        gradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 如果有切割结果，显示分割后的ROI
        // 这里暂时只显示背景
    }

    loadROIContour() {
        const selectedROI = this.options.getSelectedROI();
        if (selectedROI) {
            this.renderCuttingFrame();
        }
    }

    loadROIList() {
        const roiList = this.options.getROIList();
        const select1 = this.modal.querySelector('#resultExistingRoi1');
        const select2 = this.modal.querySelector('#resultExistingRoi2');

        if (select1) {
            select1.innerHTML = '<option value="">请选择已有结构</option>';
            roiList.forEach(roi => {
                const option = document.createElement('option');
                option.value = roi.name;
                option.textContent = roi.name;
                select1.appendChild(option);
            });
        }

        if (select2) {
            select2.innerHTML = '<option value="">请选择已有结构</option>';
            roiList.forEach(roi => {
                const option = document.createElement('option');
                option.value = roi.name;
                option.textContent = roi.name;
                select2.appendChild(option);
            });
        }
    }

    toggleDrawingMode() {
        if (this.cuttingLine) {
            // 如果已有切割线，取消绘制模式
            this.isDrawingMode = false;
        } else {
            // 如果没有切割线，进入绘制模式
            this.isDrawingMode = true;
        }
        this.updateDrawButtonState();
    }

    updateDrawButtonState() {
        const drawBtn = this.modal.querySelector('#cuttingDrawBtn');
        if (drawBtn) {
            if (this.isDrawingMode) {
                drawBtn.classList.add('active');
            } else {
                drawBtn.classList.remove('active');
            }
            
            // 如果有切割线，禁用绘制按钮
            if (this.cuttingLine) {
                drawBtn.disabled = true;
            } else {
                drawBtn.disabled = false;
            }
        }
    }

    clearCuttingLine() {
        this.cuttingLine = null;
        this.isDrawingMode = true;
        this.updateDrawButtonState();
        this.renderCuttingFrame();
        
        const angleInput = this.modal.querySelector('#cuttingAngleInput');
        if (angleInput) {
            angleInput.value = 0;
        }
    }

    switchView() {
        const views = ['Axial', 'Sagittal', 'Coronal'];
        const currentIndex = views.indexOf(this.currentView);
        const nextIndex = (currentIndex + 1) % views.length;
        this.currentView = views[nextIndex];
        
        // 重置切割线
        this.cuttingLine = null;
        const angleInput = this.modal.querySelector('#cuttingAngleInput');
        if (angleInput) {
            angleInput.value = 0;
        }
        
        // 更新层信息显示
        this.updateSliceInfo();
        
        // 重新渲染
        this.renderCuttingFrame();
        this.renderResultFrame(1);
        this.renderResultFrame(2);
    }

    updateSliceInfo() {
        const sliceInfo = this.modal.querySelectorAll('.cutting-slice-info, .result-slice-info');
        sliceInfo.forEach(info => {
            info.textContent = `${this.currentView} ${this.currentSlice}/${this.totalSlices}`;
        });
    }

    updateRetainState(index, retain) {
        const config = this.targetConfigs[index - 1];
        config.retain = retain;
        
        // 检查是否至少有一个保留
        const retain1 = this.modal.querySelector('#resultRetain1').checked;
        const retain2 = this.modal.querySelector('#resultRetain2').checked;
        
        if (!retain1 && !retain2) {
            // 如果两个都取消，恢复当前选择
            if (index === 1) {
                this.modal.querySelector('#resultRetain1').checked = true;
                config.retain = true;
            } else {
                this.modal.querySelector('#resultRetain2').checked = true;
                config.retain = true;
            }
            return;
        }
        
        // 更新字段可用状态
        this.updateFieldsState(index, retain);
    }

    updateFieldsState(index, retain) {
        const newFields = this.modal.querySelector(`#resultNewFields${index}`);
        const existingFields = this.modal.querySelector(`#resultExistingFields${index}`);
        const newRadio = this.modal.querySelector(`#resultNew${index}`);
        const existingRadio = this.modal.querySelector(`#resultExisting${index}`);
        
        if (retain) {
            if (newFields) newFields.style.opacity = '1';
            if (existingFields) existingFields.style.opacity = '1';
            if (newRadio) newRadio.disabled = false;
            if (existingRadio) existingRadio.disabled = false;
        } else {
            if (newFields) newFields.style.opacity = '0.5';
            if (existingFields) existingFields.style.opacity = '0.5';
            if (newRadio) newRadio.disabled = true;
            if (existingRadio) existingRadio.disabled = true;
        }
    }

    updateStructureType(index, type) {
        const config = this.targetConfigs[index - 1];
        config.isNew = type === 'new';
        
        const newFields = this.modal.querySelector(`#resultNewFields${index}`);
        const existingFields = this.modal.querySelector(`#resultExistingFields${index}`);
        
        if (type === 'new') {
            if (newFields) newFields.style.display = 'block';
            if (existingFields) existingFields.style.display = 'none';
        } else {
            if (newFields) newFields.style.display = 'none';
            if (existingFields) existingFields.style.display = 'block';
        }
    }

    openColorPicker(index) {
        // 简单的颜色选择器实现
        const color = prompt('请输入颜色值（如 #ff6b6b）:', this.targetConfigs[index - 1].roiColor);
        if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) {
            this.targetConfigs[index - 1].roiColor = color;
            const preview = this.modal.querySelector(`#resultColorPreview${index}`);
            if (preview) {
                preview.style.background = color;
            }
        }
    }

    handleConfirm() {
        // 验证必填项
        const retain1 = this.modal.querySelector('#resultRetain1').checked;
        const retain2 = this.modal.querySelector('#resultRetain2').checked;
        
        if (!retain1 && !retain2) {
            alert('至少需要保留一个分割结果');
            return;
        }

        // 收集配置
        const results = [];
        
        if (retain1) {
            const config = this.targetConfigs[0];
            const isNew = this.modal.querySelector('#resultNew1').checked;
            
            if (isNew) {
                const roiName = this.modal.querySelector('#resultRoiName1').value.trim();
                if (!roiName) {
                    alert('请输入结果1的ROI名称');
                    return;
                }
                results.push({
                    retain: true,
                    isNew: true,
                    roiName: roiName,
                    roiColor: config.roiColor,
                    roiType: this.modal.querySelector('#resultRoiType1').value
                });
            } else {
                const existingRoi = this.modal.querySelector('#resultExistingRoi1').value;
                if (!existingRoi) {
                    alert('请选择结果1的已有结构');
                    return;
                }
                results.push({
                    retain: true,
                    isNew: false,
                    existingRoi: existingRoi
                });
            }
        }
        
        if (retain2) {
            const config = this.targetConfigs[1];
            const isNew = this.modal.querySelector('#resultNew2').checked;
            
            if (isNew) {
                const roiName = this.modal.querySelector('#resultRoiName2').value.trim();
                if (!roiName) {
                    alert('请输入结果2的ROI名称');
                    return;
                }
                results.push({
                    retain: true,
                    isNew: true,
                    roiName: roiName,
                    roiColor: config.roiColor,
                    roiType: this.modal.querySelector('#resultRoiType2').value
                });
            } else {
                const existingRoi = this.modal.querySelector('#resultExistingRoi2').value;
                if (!existingRoi) {
                    alert('请选择结果2的已有结构');
                    return;
                }
                results.push({
                    retain: true,
                    isNew: false,
                    existingRoi: existingRoi
                });
            }
        }

        if (this.options.onConfirm) {
            this.options.onConfirm({
                cuttingLine: this.cuttingLine,
                results: results,
                view: this.currentView,
                slice: this.currentSlice
            });
        }

        this.close();
    }

    show() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            // 重置状态
            this.isDrawingMode = true;
            this.cuttingLine = null;
            this.updateDrawButtonState();
            // 延迟初始化canvas，确保容器已渲染
            setTimeout(() => {
                this.initViewingFrames();
            }, 100);
        } else {
            console.error('CuttingModalComponent modal is null');
        }
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    destroy() {
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}

// 导出到全局
window.CuttingModalComponent = CuttingModalComponent;

