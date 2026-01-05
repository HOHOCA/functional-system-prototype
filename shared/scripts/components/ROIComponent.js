// ROI列表组件 - 可复用的ROI面板组件
class ROIComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            prefix: options.prefix || '',
            onROISelect: options.onROISelect || null,
            onToolClick: options.onToolClick || null,
            onROIMove: options.onROIMove || null, // ROI移动回调
            onMoveModeActivated: options.onMoveModeActivated || null, // 移动模式激活回调
            onMoveModeDeactivated: options.onMoveModeDeactivated || null, // 移动模式退出回调
            ...options
        };
        this.isMoveMode = false; // 移动模式状态
        this.moveModeHandlers = null; // 移动模式事件处理器
        this.contextMenu = null; // 右键菜单元素
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        // 初始化表头眼睛图标状态
        setTimeout(() => {
            this.updateHeaderEyeIcon();
        }, 100);
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="roi-panel-container">
            <div class="roi-struct-header">
                <div class="struct-info">
                    <i class="fas fa-eye"></i>
                    <span class="struct-name">CT 1 RTStruct 2 2024-06-16 16:...</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
            
            <div class="roi-list-section">
                <div class="roi-tree">
                    <div class="roi-category expanded" data-category="target">
                        <div class="roi-category-header">
                            <i class="fas fa-chevron-down"></i>
                            <span>靶区(7)</span>
                        </div>
                        <div class="roi-category-content">
                            <div class="roi-item" data-roi="CTV1">
                                <i class="fas fa-eye-slash roi-visibility"></i>
                                <div class="roi-color" style="background: #ff6b6b;"></div>
                                <span class="roi-name">CTV1</span>
                                <i class="fas fa-user roi-type-icon"></i>
                                <div class="roi-drawing-dropdown">
                                    <i class="fas fa-chevron-down roi-dropdown-trigger"></i>
                                    <div class="roi-dropdown-menu">
                                        <div class="roi-dropdown-header">勾画类型</div>
                                        <div class="roi-dropdown-option" data-type="rigid">
                                            <div class="roi-type-color" style="background: #ff0000;"></div>
                                            <span>刚性勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="deformable">
                                            <div class="roi-type-color" style="background: #ffff00;"></div>
                                            <span>形变勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="automatic">
                                            <div class="roi-type-color" style="background: #0000ff;"></div>
                                            <span>自动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="manual">
                                            <div class="roi-type-color" style="background: #00ff00;"></div>
                                            <span>手动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-actions">
                                            <button class="roi-dropdown-cancel">取消</button>
                                            <button class="roi-dropdown-confirm">确定</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="roi-item" data-roi="CTV2">
                                <i class="fas fa-eye-slash roi-visibility"></i>
                                <div class="roi-color" style="background: #4ecdc4;"></div>
                                <span class="roi-name">CTV2</span>
                                <i class="fas fa-user roi-type-icon"></i>
                                <div class="roi-drawing-dropdown">
                                    <i class="fas fa-chevron-down roi-dropdown-trigger"></i>
                                    <div class="roi-dropdown-menu">
                                        <div class="roi-dropdown-header">勾画类型</div>
                                        <div class="roi-dropdown-option" data-type="rigid">
                                            <div class="roi-type-color" style="background: #ff0000;"></div>
                                            <span>刚性勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="deformable">
                                            <div class="roi-type-color" style="background: #ffff00;"></div>
                                            <span>形变勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="automatic">
                                            <div class="roi-type-color" style="background: #0000ff;"></div>
                                            <span>自动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="manual">
                                            <div class="roi-type-color" style="background: #00ff00;"></div>
                                            <span>手动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-actions">
                                            <button class="roi-dropdown-cancel">取消</button>
                                            <button class="roi-dropdown-confirm">确定</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="roi-item active" data-roi="GTVnd(L)">
                                <i class="fas fa-eye-slash roi-visibility"></i>
                                <div class="roi-color" style="background: #45b7d1;"></div>
                                <span class="roi-name">GTVnd(L)</span>
                                <i class="fas fa-user roi-type-icon"></i>
                                <div class="roi-drawing-dropdown">
                                    <i class="fas fa-chevron-down roi-dropdown-trigger"></i>
                                    <div class="roi-dropdown-menu">
                                        <div class="roi-dropdown-header">勾画类型</div>
                                        <div class="roi-dropdown-option" data-type="rigid">
                                            <div class="roi-type-color" style="background: #ff0000;"></div>
                                            <span>刚性勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="deformable">
                                            <div class="roi-type-color" style="background: #ffff00;"></div>
                                            <span>形变勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="automatic">
                                            <div class="roi-type-color" style="background: #0000ff;"></div>
                                            <span>自动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="manual">
                                            <div class="roi-type-color" style="background: #00ff00;"></div>
                                            <span>手动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-actions">
                                            <button class="roi-dropdown-cancel">取消</button>
                                            <button class="roi-dropdown-confirm">确定</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="roi-item" data-roi="GTVnd(R)">
                                <i class="fas fa-eye-slash roi-visibility"></i>
                                <div class="roi-color" style="background: #96ceb4;"></div>
                                <span class="roi-name">GTVnd(R)</span>
                                <i class="fas fa-user roi-type-icon"></i>
                                <div class="roi-drawing-dropdown">
                                    <i class="fas fa-chevron-down roi-dropdown-trigger"></i>
                                    <div class="roi-dropdown-menu">
                                        <div class="roi-dropdown-header">勾画类型</div>
                                        <div class="roi-dropdown-option" data-type="rigid">
                                            <div class="roi-type-color" style="background: #ff0000;"></div>
                                            <span>刚性勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="deformable">
                                            <div class="roi-type-color" style="background: #ffff00;"></div>
                                            <span>形变勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="automatic">
                                            <div class="roi-type-color" style="background: #0000ff;"></div>
                                            <span>自动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="manual">
                                            <div class="roi-type-color" style="background: #00ff00;"></div>
                                            <span>手动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-actions">
                                            <button class="roi-dropdown-cancel">取消</button>
                                            <button class="roi-dropdown-confirm">确定</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="roi-item" data-roi="GTVnx">
                                <i class="fas fa-eye-slash roi-visibility"></i>
                                <div class="roi-color" style="background: #feca57;"></div>
                                <span class="roi-name">GTVnx</span>
                                <i class="fas fa-user roi-type-icon"></i>
                                <div class="roi-drawing-dropdown">
                                    <i class="fas fa-chevron-down roi-dropdown-trigger"></i>
                                    <div class="roi-dropdown-menu">
                                        <div class="roi-dropdown-header">勾画类型</div>
                                        <div class="roi-dropdown-option" data-type="rigid">
                                            <div class="roi-type-color" style="background: #ff0000;"></div>
                                            <span>刚性勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="deformable">
                                            <div class="roi-type-color" style="background: #ffff00;"></div>
                                            <span>形变勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="automatic">
                                            <div class="roi-type-color" style="background: #0000ff;"></div>
                                            <span>自动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="manual">
                                            <div class="roi-type-color" style="background: #00ff00;"></div>
                                            <span>手动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-actions">
                                            <button class="roi-dropdown-cancel">取消</button>
                                            <button class="roi-dropdown-confirm">确定</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="roi-item" data-roi="PTVnx-6996">
                                <i class="fas fa-eye-slash roi-visibility"></i>
                                <div class="roi-color" style="background: #ff9ff3;"></div>
                                <span class="roi-name">PTVnx-6996</span>
                                <i class="fas fa-user roi-type-icon"></i>
                                <div class="roi-drawing-dropdown">
                                    <i class="fas fa-chevron-down roi-dropdown-trigger"></i>
                                    <div class="roi-dropdown-menu">
                                        <div class="roi-dropdown-header">勾画类型</div>
                                        <div class="roi-dropdown-option" data-type="rigid">
                                            <div class="roi-type-color" style="background: #ff0000;"></div>
                                            <span>刚性勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="deformable">
                                            <div class="roi-type-color" style="background: #ffff00;"></div>
                                            <span>形变勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="automatic">
                                            <div class="roi-type-color" style="background: #0000ff;"></div>
                                            <span>自动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="manual">
                                            <div class="roi-type-color" style="background: #00ff00;"></div>
                                            <span>手动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-actions">
                                            <button class="roi-dropdown-cancel">取消</button>
                                            <button class="roi-dropdown-confirm">确定</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="roi-item" data-roi="PTV1-6006">
                                <i class="fas fa-eye-slash roi-visibility"></i>
                                <div class="roi-color" style="background: #54a0ff;"></div>
                                <span class="roi-name">PTV1-6006</span>
                                <i class="fas fa-user roi-type-icon"></i>
                                <div class="roi-drawing-dropdown">
                                    <i class="fas fa-chevron-down roi-dropdown-trigger"></i>
                                    <div class="roi-dropdown-menu">
                                        <div class="roi-dropdown-header">勾画类型</div>
                                        <div class="roi-dropdown-option" data-type="rigid">
                                            <div class="roi-type-color" style="background: #ff0000;"></div>
                                            <span>刚性勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="deformable">
                                            <div class="roi-type-color" style="background: #ffff00;"></div>
                                            <span>形变勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="automatic">
                                            <div class="roi-type-color" style="background: #0000ff;"></div>
                                            <span>自动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="manual">
                                            <div class="roi-type-color" style="background: #00ff00;"></div>
                                            <span>手动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-actions">
                                            <button class="roi-dropdown-cancel">取消</button>
                                            <button class="roi-dropdown-confirm">确定</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="roi-category expanded" data-category="non-target">
                        <div class="roi-category-header">
                            <i class="fas fa-chevron-down"></i>
                            <span>非靶区(3)</span>
                        </div>
                        <div class="roi-category-content">
                            <div class="roi-item" data-roi="Bladder">
                                <i class="fas fa-eye roi-visibility visible"></i>
                                <div class="roi-color" style="background: #feca57;"></div>
                                <span class="roi-name">Bladder</span>
                                <i class="fas fa-project-diagram roi-type-icon"></i>
                                <div class="roi-drawing-dropdown">
                                    <i class="fas fa-chevron-down roi-dropdown-trigger"></i>
                                    <div class="roi-dropdown-menu">
                                        <div class="roi-dropdown-header">勾画类型</div>
                                        <div class="roi-dropdown-option" data-type="rigid">
                                            <div class="roi-type-color" style="background: #ff0000;"></div>
                                            <span>刚性勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="deformable">
                                            <div class="roi-type-color" style="background: #ffff00;"></div>
                                            <span>形变勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="automatic">
                                            <div class="roi-type-color" style="background: #0000ff;"></div>
                                            <span>自动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="manual">
                                            <div class="roi-type-color" style="background: #00ff00;"></div>
                                            <span>手动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-actions">
                                            <button class="roi-dropdown-cancel">取消</button>
                                            <button class="roi-dropdown-confirm">确定</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="roi-item" data-roi="Bowel_Small">
                                <i class="fas fa-eye roi-visibility visible"></i>
                                <div class="roi-color" style="background: #96ceb4;"></div>
                                <span class="roi-name">Bowel_Small</span>
                                <i class="fas fa-project-diagram roi-type-icon"></i>
                                <div class="roi-drawing-dropdown">
                                    <i class="fas fa-chevron-down roi-dropdown-trigger"></i>
                                    <div class="roi-dropdown-menu">
                                        <div class="roi-dropdown-header">勾画类型</div>
                                        <div class="roi-dropdown-option" data-type="rigid">
                                            <div class="roi-type-color" style="background: #ff0000;"></div>
                                            <span>刚性勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="deformable">
                                            <div class="roi-type-color" style="background: #ffff00;"></div>
                                            <span>形变勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="automatic">
                                            <div class="roi-type-color" style="background: #0000ff;"></div>
                                            <span>自动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="manual">
                                            <div class="roi-type-color" style="background: #00ff00;"></div>
                                            <span>手动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-actions">
                                            <button class="roi-dropdown-cancel">取消</button>
                                            <button class="roi-dropdown-confirm">确定</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="roi-item" data-roi="External">
                                <i class="fas fa-eye roi-visibility visible"></i>
                                <div class="roi-color" style="background: #feca57;"></div>
                                <span class="roi-name">External</span>
                                <i class="fas fa-project-diagram roi-type-icon"></i>
                                <div class="roi-drawing-dropdown">
                                    <i class="fas fa-chevron-down roi-dropdown-trigger"></i>
                                    <div class="roi-dropdown-menu">
                                        <div class="roi-dropdown-header">勾画类型</div>
                                        <div class="roi-dropdown-option" data-type="rigid">
                                            <div class="roi-type-color" style="background: #ff0000;"></div>
                                            <span>刚性勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="deformable">
                                            <div class="roi-type-color" style="background: #ffff00;"></div>
                                            <span>形变勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="automatic">
                                            <div class="roi-type-color" style="background: #0000ff;"></div>
                                            <span>自动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-option" data-type="manual">
                                            <div class="roi-type-color" style="background: #00ff00;"></div>
                                            <span>手动勾画</span>
                                            <input type="checkbox" class="roi-type-checkbox">
                                        </div>
                                        <div class="roi-dropdown-actions">
                                            <button class="roi-dropdown-cancel">取消</button>
                                            <button class="roi-dropdown-confirm">确定</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="roi-toolbar-section">
                <div class="roi-toolbar">
                    <button class="roi-tool-btn" id="${this.options.prefix}roi-visibility-all-btn" title="全部显示/全部隐藏">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="roi-tool-btn" id="${this.options.prefix}roi-fill-all-btn" title="全部填充/全部取消">
                        <i class="fas fa-fill-drip"></i>
                    </button>
                    <button class="roi-tool-btn" id="${this.options.prefix}roi-bold-all-btn" title="全部加粗/全部取消">
                        <i class="fas fa-bold"></i>
                    </button>
                    <button class="roi-tool-btn" id="${this.options.prefix}roi-assign-image-btn" title="显示/隐藏赋值HU的图像">
                        <i class="fas fa-image"></i>
                    </button>
                    <button class="roi-tool-btn" id="${this.options.prefix}roi-add-btn" title="新建勾画">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="roi-tool-btn" id="${this.options.prefix}roi-delete-btn" title="删除勾画">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="roi-tool-btn" id="${this.options.prefix}roi-batch-update-btn" title="批量更新衍生ROI">
                        <i class="fas fa-project-diagram"></i>
                    </button>
                </div>
            </div>
            
            <div class="roi-info-section">
                <div class="roi-properties-form">
                    <div class="roi-property-item">
                        <label class="roi-property-label">名称:</label>
                        <div class="roi-property-input">
                            <div class="roi-name-input">
                                <div class="roi-color-indicator" style="background: #45b7d1;"></div>
                                <input type="text" class="roi-text-input" value="GTVnd(L)">
                            </div>
                            <button class="roi-edit-btn" title="编辑">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="roi-property-item">
                        <label class="roi-property-label">填充:</label>
                        <input type="checkbox" class="roi-checkbox">
                    </div>
                    
                    <div class="roi-property-item">
                        <label class="roi-property-label">类型:</label>
                        <select class="roi-select">
                            <option value="GTV">GTV</option>
                            <option value="CTV">CTV</option>
                            <option value="PTV">PTV</option>
                            <option value="OAR">OAR</option>
                        </select>
                    </div>
                    
                    <div class="roi-property-item">
                        <label class="roi-property-label">材料:</label>
                        <div class="roi-property-input">
                            <select class="roi-select" id="${this.options.prefix}roi-material-select">
                                <option value="None">None</option>
                                <option value="Water">Water</option>
                                <option value="Bone">Bone</option>
                            </select>
                            <button class="roi-copy-btn" title="复制材料">
                                <i class="fas fa-clipboard"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="roi-property-item">
                        <label class="roi-property-label">HU填充至:</label>
                        <div class="roi-property-input">
                            <input type="text" class="roi-hu-input" id="${this.options.prefix}roi-hu-fill" placeholder="[-2000.00, 2000.00]" readonly disabled style="cursor: pointer;">
                            <button class="roi-edit-btn" title="编辑">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="roi-property-item">
                        <label class="roi-property-label">指定HU值:</label>
                        <div class="roi-property-input">
                            <input type="text" class="roi-hu-input" id="${this.options.prefix}roi-hu-value" placeholder="[-99999.9999, 99999.9999]" readonly style="cursor: pointer;">
                            <button class="roi-edit-btn" title="编辑">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="roi-property-bottom">
                        <div class="roi-property-item">
                            <label class="roi-property-label">层次:</label>
                            <div class="roi-readonly-text">7-39</div>
                        </div>
                        
                        <div class="roi-property-item">
                            <label class="roi-property-label">体积:</label>
                            <div class="roi-readonly-text">7.92 cm³</div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        `;
    }

    bindEvents() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // ROI分类展开/收起
        const categoryHeaders = container.querySelectorAll('.roi-category-header');
        categoryHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = header.parentElement;
                const chevronIcon = header.querySelector('i.fas');
                
                // 切换展开状态
                category.classList.toggle('expanded');
                
                // 根据展开状态设置箭头方向
                if (category.classList.contains('expanded')) {
                    // 展开时：箭头向下
                    chevronIcon.className = 'fas fa-chevron-down';
                } else {
                    // 收起时：箭头向右
                    chevronIcon.className = 'fas fa-chevron-right';
                }
            });
        });

        // ROI项目选择
        const roiItems = container.querySelectorAll('.roi-item');
        roiItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // 移除其他项目的active状态
                roiItems.forEach(ri => ri.classList.remove('active'));
                
                // 添加当前项目的active状态
                item.classList.add('active');
                
                // 触发回调
                if (this.options.onROISelect) {
                    const roiName = item.getAttribute('data-roi');
                    this.options.onROISelect(roiName, item);
                }
            });
            
            // 右键菜单
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 选中当前ROI
                roiItems.forEach(ri => ri.classList.remove('active'));
                item.classList.add('active');
                
                // 显示右键菜单
                this.showContextMenu(e, item);
            });
        });

        // 表头眼睛图标点击事件（全部显示/隐藏）
        const structHeader = container.querySelector('.roi-struct-header');
        if (structHeader) {
            const headerEyeIcon = structHeader.querySelector('.fa-eye');
            if (headerEyeIcon) {
                headerEyeIcon.style.cursor = 'pointer';
                headerEyeIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleAllROIVisibility();
                });
            }
        }

        // ROI可见性切换
        const visibilityIcons = container.querySelectorAll('.roi-visibility');
        visibilityIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = icon.classList.contains('visible');
                
                if (isVisible) {
                    icon.classList.remove('visible');
                    icon.className = 'fas fa-eye-slash roi-visibility';
                } else {
                    icon.classList.add('visible');
                    icon.className = 'fas fa-eye roi-visibility visible';
                }
                
                // 更新表头眼睛图标状态
                this.updateHeaderEyeIcon();
            });
        });

        // 工具栏按钮点击
        const toolButtons = container.querySelectorAll('.roi-tool-btn');
        toolButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const buttonId = button.id;
                
                // 处理移动按钮
                if (buttonId === `${this.options.prefix}roi-move-btn`) {
                    this.handleMoveROI(button);
                    return;
                }
                
                // 触发回调
                if (this.options.onToolClick) {
                    this.options.onToolClick(buttonId, button);
                }
            });
        });
        
        // 点击其他地方关闭右键菜单
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });

        // 勾画类型下拉菜单
        const dropdownTriggers = container.querySelectorAll('.roi-dropdown-trigger');
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = trigger.nextElementSibling;
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            });
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', () => {
            const dropdowns = container.querySelectorAll('.roi-dropdown-menu');
            dropdowns.forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        });
        
        // 绑定ROI属性字段的事件
        this.bindROIPropertyEvents(container);
    }
    
    // 绑定ROI属性字段的事件
    bindROIPropertyEvents(container) {
        const prefix = this.options.prefix;
        
        // 材料选择变化事件
        const materialSelect = container.querySelector(`#${prefix}roi-material-select`);
        if (materialSelect) {
            materialSelect.addEventListener('change', (e) => {
                this.handleMaterialChange(e.target.value);
            });
        }
        
        // 指定HU值输入框
        const huValueInput = container.querySelector(`#${prefix}roi-hu-value`);
        if (huValueInput) {
            // 点击进入编辑状态
            huValueInput.addEventListener('click', () => {
                if (huValueInput.readOnly) {
                    huValueInput.readOnly = false;
                    huValueInput.focus();
                }
            });
            
            // 失去焦点时验证并保存
            huValueInput.addEventListener('blur', () => {
                this.handleHUValueBlur(huValueInput);
            });
            
            // 输入时限制字符
            huValueInput.addEventListener('input', (e) => {
                this.handleHUValueInput(e.target);
            });
        }
        
        // HU填充至输入框
        const huFillInput = container.querySelector(`#${prefix}roi-hu-fill`);
        if (huFillInput) {
            // 点击进入编辑状态（仅在可用时）
            huFillInput.addEventListener('click', () => {
                if (!huFillInput.disabled && huFillInput.readOnly) {
                    huFillInput.readOnly = false;
                    huFillInput.focus();
                }
            });
            
            // 失去焦点时验证并保存
            huFillInput.addEventListener('blur', () => {
                this.handleHUFillBlur(huFillInput);
            });
            
            // 输入时限制字符
            huFillInput.addEventListener('input', (e) => {
                this.handleHUFillInput(e.target);
            });
        }
        
        // 指定质量密度输入框
        const densityInput = container.querySelector(`#${prefix}roi-density`);
        if (densityInput) {
            // 点击进入编辑状态
            densityInput.addEventListener('click', () => {
                if (densityInput.readOnly) {
                    densityInput.readOnly = false;
                    densityInput.focus();
                }
            });
            
            // 失去焦点时验证并保存
            densityInput.addEventListener('blur', () => {
                this.handleDensityBlur(densityInput);
            });
            
            // 输入时限制字符
            densityInput.addEventListener('input', (e) => {
                this.handleDensityInput(e.target);
            });
        }
    }
    
    // 材料变化处理
    handleMaterialChange(materialValue) {
        const prefix = this.options.prefix;
        const container = document.getElementById(this.containerId);
        const huValueInput = container?.querySelector(`#${prefix}roi-hu-value`);
        const huFillInput = container?.querySelector(`#${prefix}roi-hu-fill`);
        const densityInput = container?.querySelector(`#${prefix}roi-density`);
        
        // 如果已填写质量密度，清空并启用材料/HU（互斥）
        if (densityInput && densityInput.value) {
            densityInput.value = '';
            densityInput.disabled = false;
            densityInput.readOnly = false;
        }
        
        // 材料HU值范围定义
        const materialHURanges = {
            'Water': { min: -100, max: 100, middle: 0 },
            'Bone': { min: 200, max: 3000, middle: 1000 },
            'None': { min: -99999.9999, max: 99999.9999, middle: null }
        };
        
        const range = materialHURanges[materialValue] || materialHURanges['None'];
        
        // 如果选择了材料（非NONE），设置HU值为中间值
        if (materialValue !== 'None' && materialValue !== '') {
            if (huValueInput) {
                huValueInput.value = range.middle.toString();
                huValueInput.readOnly = false;
                huValueInput.disabled = false;
                // 更新placeholder显示范围
                huValueInput.placeholder = `[${range.min}, ${range.max}]`;
            }
            
            // HU填充至置灰
            if (huFillInput) {
                huFillInput.disabled = true;
                huFillInput.readOnly = true;
                huFillInput.value = '';
            }
            
            // 指定质量密度置灰（与材料、HU互斥）
            if (densityInput) {
                densityInput.disabled = true;
                densityInput.readOnly = true;
            }
        } else {
            // 材料为NONE或空，允许自定义HU值
            if (huValueInput) {
                huValueInput.readOnly = false;
                huValueInput.disabled = false;
                huValueInput.placeholder = '[-99999.9999, 99999.9999]';
            }
            
            // HU填充至可用（仅在材料为NONE时）
            if (huFillInput) {
                huFillInput.disabled = false;
                huFillInput.readOnly = false;
            }
            
            // 指定质量密度可用（仅在材料为NONE时）
            if (densityInput && !densityInput.value) {
                densityInput.disabled = false;
                densityInput.readOnly = false;
            }
        }
        
        // 如果已填写质量密度，根据材料或HU值更新
        if (densityInput && densityInput.value && !densityInput.disabled) {
            this.updateDensityFromMaterial(materialValue, huValueInput?.value);
        }
    }
    
    // 根据材料或HU值更新质量密度
    updateDensityFromMaterial(material, huValue) {
        const prefix = this.options.prefix;
        const container = document.getElementById(this.containerId);
        const densityInput = container?.querySelector(`#${prefix}roi-density`);
        
        if (!densityInput || densityInput.disabled) return;
        
        // 材料到密度的映射（简化示例）
        const materialDensity = {
            'Water': 1.0,
            'Bone': 1.8,
            'None': null
        };
        
        let density = null;
        
        if (material && material !== 'None') {
            density = materialDensity[material];
        } else if (huValue) {
            // 根据HU值计算密度（简化公式：density = 1 + HU/1000）
            const hu = parseFloat(huValue);
            if (!isNaN(hu)) {
                density = 1 + hu / 1000;
            }
        }
        
        if (density !== null) {
            densityInput.value = density.toFixed(2);
        }
    }
    
    // HU值输入处理
    handleHUValueInput(input) {
        // 只允许数字、负号和小数点
        let value = input.value.replace(/[^\d.\-]/g, '');
        
        // 获取材料以确定范围
        const materialSelect = document.getElementById(`${this.options.prefix}roi-material-select`);
        const material = materialSelect?.value || 'None';
        
        let min = -99999.9999;
        let max = 99999.9999;
        
        if (material !== 'None' && material !== '') {
            const materialHURanges = {
                'Water': { min: -100, max: 100 },
                'Bone': { min: 200, max: 3000 }
            };
            const range = materialHURanges[material];
            if (range) {
                min = range.min;
                max = range.max;
            }
        }
        
        // 限制范围
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value !== '' && value !== '-') {
            if (numValue < min) {
                value = min.toString();
            } else if (numValue > max) {
                value = max.toString();
            }
        }
        
        input.value = value;
    }
    
    // HU值失去焦点处理
    handleHUValueBlur(input) {
        const value = input.value.trim();
        const materialSelect = document.getElementById(`${this.options.prefix}roi-material-select`);
        const material = materialSelect?.value || 'None';
        
        // 如果材料不是NONE，检查HU值是否在材料范围内
        if (material !== 'None' && material !== '') {
            const materialHURanges = {
                'Water': { min: -100, max: 100 },
                'Bone': { min: 200, max: 3000 }
            };
            
            const range = materialHURanges[material];
            if (range && value) {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    if (numValue < range.min) {
                        input.value = range.min.toString();
                    } else if (numValue > range.max) {
                        input.value = range.max.toString();
                    }
                }
            }
        }
        
        // 设置为只读
        input.readOnly = true;
        
        // 如果已填写质量密度，根据HU值更新（互斥：如果填写了HU，清空质量密度）
        const densityInput = document.getElementById(`${this.options.prefix}roi-density`);
        if (densityInput && densityInput.value) {
            // 如果填写了HU值，清空质量密度（互斥）
            densityInput.value = '';
            densityInput.disabled = false;
            densityInput.readOnly = false;
        }
        
        // 如果材料为NONE且有HU值，可以更新质量密度
        if (material === 'None' && value && densityInput && !densityInput.value) {
            this.updateDensityFromMaterial(material, input.value);
        }
    }
    
    // HU填充至输入处理
    handleHUFillInput(input) {
        // 只允许数字、负号和小数点
        let value = input.value.replace(/[^\d.\-]/g, '');
        
        // 限制范围：[-2000.00, 2000.00]
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value !== '' && value !== '-') {
            if (numValue < -2000.00) {
                value = '-2000.00';
            } else if (numValue > 2000.00) {
                value = '2000.00';
            }
        }
        
        input.value = value;
    }
    
    // HU填充至失去焦点处理
    handleHUFillBlur(input) {
        const value = input.value.trim();
        
        // 如果为空，恢复到初始状态
        if (!value) {
            input.value = '';
            input.placeholder = '[-2000.00, 2000.00]';
        } else {
            // 验证范围
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                if (numValue < -2000.00) {
                    input.value = '-2000.00';
                } else if (numValue > 2000.00) {
                    input.value = '2000.00';
                }
            }
        }
        
        // 设置为只读
        input.readOnly = true;
    }
    
    // 质量密度输入处理
    handleDensityInput(input) {
        // 只允许数字、负号和小数点
        let value = input.value.replace(/[^\d.\-]/g, '');
        
        // 限制范围：[-99999.99, 99999.99]
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value !== '' && value !== '-') {
            if (numValue < -99999.99) {
                value = '-99999.99';
            } else if (numValue > 99999.99) {
                value = '99999.99';
            }
        }
        
        input.value = value;
    }
    
    // 质量密度失去焦点处理
    handleDensityBlur(input) {
        const value = input.value.trim();
        
        if (value) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                // 限制范围：[-99999.99, 99999.99]
                if (numValue < -99999.99) {
                    input.value = '-99999.99';
                } else if (numValue > 99999.99) {
                    input.value = '99999.99';
                }
            }
        }
        
        // 设置为只读
        input.readOnly = true;
        
        // 如果填写了质量密度，材料、HU、HU填充至应该置灰（互斥）
        if (value) {
            const materialSelect = document.getElementById(`${this.options.prefix}roi-material-select`);
            const huValueInput = document.getElementById(`${this.options.prefix}roi-hu-value`);
            const huFillInput = document.getElementById(`${this.options.prefix}roi-hu-fill`);
            
            if (materialSelect) {
                materialSelect.disabled = true;
            }
            if (huValueInput) {
                huValueInput.disabled = true;
                huValueInput.readOnly = true;
            }
            if (huFillInput) {
                huFillInput.disabled = true;
                huFillInput.readOnly = true;
            }
        } else {
            // 如果清空了质量密度，恢复材料、HU、HU填充至的可用状态
            const materialSelect = document.getElementById(`${this.options.prefix}roi-material-select`);
            const huValueInput = document.getElementById(`${this.options.prefix}roi-hu-value`);
            const huFillInput = document.getElementById(`${this.options.prefix}roi-hu-fill`);
            
            if (materialSelect) {
                materialSelect.disabled = false;
            }
            if (huValueInput) {
                huValueInput.disabled = false;
            }
            if (huFillInput) {
                const material = materialSelect?.value || 'None';
                // 只有在材料为NONE时，HU填充至才可用
                huFillInput.disabled = (material !== 'None' && material !== '');
            }
        }
    }

    // 获取当前选中的ROI
    getSelectedROI() {
        const container = document.getElementById(this.containerId);
        const activeItem = container.querySelector('.roi-item.active');
        return activeItem ? activeItem.getAttribute('data-roi') : null;
    }

    // 设置ROI为选中状态
    setSelectedROI(roiName) {
        const container = document.getElementById(this.containerId);
        const roiItems = container.querySelectorAll('.roi-item');
        roiItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-roi') === roiName) {
                item.classList.add('active');
            }
        });
    }

    // 显示右键菜单
    showContextMenu(e, item) {
        // 移除旧的右键菜单
        this.hideContextMenu();
        
        // 创建右键菜单
        const menu = document.createElement('div');
        menu.className = 'roi-context-menu';
        menu.innerHTML = `
            <div class="roi-context-menu-item" data-action="copy">
                <i class="fas fa-copy"></i>
                <span>复制勾画</span>
            </div>
        `;
        
        // 设置菜单位置
        menu.style.position = 'fixed';
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        menu.style.zIndex = '10000';
        
        document.body.appendChild(menu);
        this.contextMenu = menu;
        
        // 绑定菜单项点击事件
        const copyItem = menu.querySelector('[data-action="copy"]');
        if (copyItem) {
            copyItem.addEventListener('click', () => {
                this.handleCopyROI();
                this.hideContextMenu();
            });
        }
    }
    
    // 隐藏右键菜单
    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.remove();
            this.contextMenu = null;
        }
    }
    
    // 处理复制勾画
    handleCopyROI() {
        const selectedROI = this.getSelectedROI();
        if (!selectedROI) {
            alert('请先选择一个ROI进行复制');
            return;
        }
        
        // 打开新建勾画窗口
        const modal = document.getElementById('new-drawing-modal');
        if (!modal) {
            console.error('新建勾画窗口未找到');
            return;
        }
        
        // 显示模态框 - 确保使用正确的方式
        modal.style.display = 'flex';
        modal.classList.add('show');
        
        // 强制显示（防止CSS覆盖）
        setTimeout(() => {
            if (modal.style.display !== 'flex') {
                modal.style.display = 'flex';
            }
            modal.classList.add('show');
        }, 10);
        
        // 设置ROI名称：所选ROI名称（1）
        const nameInput = document.getElementById('new-roi-name');
        if (nameInput) {
            // 检查是否已有同名ROI，如果有则递增数字
            const container = document.getElementById(this.containerId);
            const existingROIs = container?.querySelectorAll('.roi-item');
            let newName = `${selectedROI}(1)`;
            let counter = 1;
            
            // 检查名称是否已存在
            while (Array.from(existingROIs || []).some(item => {
                const roiName = item.getAttribute('data-roi');
                return roiName === newName;
            })) {
                counter++;
                newName = `${selectedROI}(${counter})`;
            }
            
            nameInput.value = newName;
        }
        
        // 确保选择ROI类型
        const roiRadio = document.querySelector('input[name="drawing-type"][value="roi"]');
        if (roiRadio) {
            roiRadio.checked = true;
            // 触发类型切换事件
            const event = new Event('change');
            roiRadio.dispatchEvent(event);
        }
    }

    // 处理移动勾画
    handleMoveROI(btn) {
        const selectedROI = this.getSelectedROI();
        if (!selectedROI) {
            alert('请先选择一个ROI进行移动');
            return;
        }
        
        // 切换移动模式
        if (this.isMoveMode) {
            // 退出移动模式
            this.exitMoveMode(btn);
        } else {
            // 进入移动模式
            this.enterMoveMode(btn);
        }
    }

    // 进入移动模式
    enterMoveMode(btn) {
        this.isMoveMode = true;
        btn.classList.add('active');
        
        // 获取选中的ROI
        const selectedROI = this.getSelectedROI();
        if (!selectedROI) return;
        
        // 改变整个文档的鼠标指针样式为手型（在2D视图上）
        // 查找2D视图的canvas元素
        const viewingFrames = document.querySelectorAll('.viewing-frame-canvas, canvas');
        viewingFrames.forEach(canvas => {
            canvas.style.cursor = 'grab';
            canvas.classList.add('roi-move-mode');
        });
        
        // 也可以通过body设置全局样式
        document.body.style.cursor = 'grab';
        document.body.classList.add('roi-move-mode-active');
        
        // 通知外部组件进入移动模式
        if (this.options.onMoveModeActivated) {
            this.options.onMoveModeActivated(selectedROI);
        }
        
        // 保存移动模式信息
        this.moveModeInfo = {
            selectedROI: selectedROI,
            btn: btn
        };
    }

    // 退出移动模式
    exitMoveMode(btn) {
        this.isMoveMode = false;
        if (btn) {
            btn.classList.remove('active');
        }
        
        // 恢复鼠标指针样式
        const viewingFrames = document.querySelectorAll('.viewing-frame-canvas, canvas');
        viewingFrames.forEach(canvas => {
            canvas.style.cursor = '';
            canvas.classList.remove('roi-move-mode');
        });
        
        document.body.style.cursor = '';
        document.body.classList.remove('roi-move-mode-active');
        
        // 通知外部组件退出移动模式
        if (this.options.onMoveModeDeactivated) {
            this.options.onMoveModeDeactivated();
        }
        
        // 清除移动模式信息
        this.moveModeInfo = null;
    }

    // 切换所有ROI的可见性
    toggleAllROIVisibility() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        const visibilityIcons = container.querySelectorAll('.roi-visibility');
        if (visibilityIcons.length === 0) return;
        
        // 检查是否所有ROI都可见
        const allVisible = Array.from(visibilityIcons).every(icon => {
            return icon.classList.contains('visible');
        });
        
        // 切换所有ROI的可见性
        visibilityIcons.forEach(icon => {
            if (allVisible) {
                // 全部隐藏
                icon.classList.remove('visible');
                icon.className = 'fas fa-eye-slash roi-visibility';
            } else {
                // 全部显示
                icon.classList.add('visible');
                icon.className = 'fas fa-eye roi-visibility visible';
            }
        });
        
        // 更新表头眼睛图标
        this.updateHeaderEyeIcon();
    }
    
    // 更新表头眼睛图标状态
    updateHeaderEyeIcon() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        const structHeader = container.querySelector('.roi-struct-header');
        if (!structHeader) return;
        
        const headerEyeIcon = structHeader.querySelector('.fa-eye, .fa-eye-slash');
        if (!headerEyeIcon) return;
        
        const visibilityIcons = container.querySelectorAll('.roi-visibility');
        if (visibilityIcons.length === 0) {
            // 没有ROI时，显示默认的眼睛图标
            headerEyeIcon.className = 'fas fa-eye';
            headerEyeIcon.style.color = '#888';
            return;
        }
        
        // 检查是否所有ROI都可见
        const allVisible = Array.from(visibilityIcons).every(icon => {
            return icon.classList.contains('visible');
        });
        
        if (allVisible) {
            headerEyeIcon.className = 'fas fa-eye';
            headerEyeIcon.style.color = '#3AACDE';
        } else {
            headerEyeIcon.className = 'fas fa-eye-slash';
            headerEyeIcon.style.color = '#888';
        }
    }

    // 销毁组件
    destroy() {
        // 如果正在移动模式，先退出
        if (this.isMoveMode) {
            const moveBtn = document.getElementById(`${this.options.prefix}roi-move-btn`);
            if (moveBtn) {
                this.exitMoveMode(moveBtn);
            }
        }
        
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

// 导出组件
window.ROIComponent = ROIComponent;
