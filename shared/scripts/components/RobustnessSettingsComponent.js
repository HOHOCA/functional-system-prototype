/**
 * 鲁棒性设置组件
 */
class RobustnessSettingsComponent {
    constructor(container) {
        this.container = container;
        this.scenarios = [];
        this.defaultScenarios = 21;
        this.positioningUncertainty = {
            up: 0.30,
            right: 0.30,
            front: 0.30,
            back: 0.30,
            left: 0.30,
            down: 0.30
        };
        this.densityUncertainty = 0;
    }

    render() {
        this.container.innerHTML = `
            <div class="robustness-settings-modal" id="robustnessSettingsModal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>鲁棒性设置</h3>
                        <button class="modal-close" id="robustnessSettingsModalClose">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="robustness-settings-layout">
                            <!-- 左侧设置区域 -->
                            <div class="settings-panel">
                                <h4>场景设置</h4>
                                
                                <!-- 默认生成场景数 -->
                                <div class="form-group">
                                    <label class="form-label">生成场景数</label>
                                    <div class="radio-group">
                                        <label class="radio-option">
                                            <input type="radio" name="scenarioCount" value="12">
                                            <span>12</span>
                                        </label>
                                        <label class="radio-option">
                                            <input type="radio" name="scenarioCount" value="21" checked>
                                            <span>21</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <!-- 摆位不确定性 -->
                                <div class="form-group">
                                    <label class="form-label">摆位不确定性</label>
                                    <input type="text" class="form-input" placeholder="请输入内容">
                                </div>
                                
                                <!-- 3D人体模型和方向设置 -->
                                <div class="positioning-uncertainty">
                                    <div class="human-model-3d">
                                        <div class="human-figure">
                                            <div class="body-outline">
                                                <div class="head"></div>
                                                <div class="torso"></div>
                                                <div class="arms"></div>
                                                <div class="legs"></div>
                                            </div>
                                            <div class="pos-chip pos-up">上 <input type="number" id="upUncertainty" value="0.30" step="0.01"></div>
                                            <div class="pos-chip pos-right">右 <input type="number" id="rightUncertainty" value="0.30" step="0.01"></div>
                                            <div class="pos-chip pos-front">前 <input type="number" id="frontUncertainty" value="0.30" step="0.01"></div>
                                            <div class="pos-chip pos-back">后 <input type="number" id="backUncertainty" value="0.30" step="0.01"></div>
                                            <div class="pos-chip pos-left">左 <input type="number" id="leftUncertainty" value="0.30" step="0.01"></div>
                                            <div class="pos-chip pos-down">下 <input type="number" id="downUncertainty" value="0.30" step="0.01"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 密度不确定性 -->
                                <div class="form-group">
                                    <label class="form-label">密度不确定性</label>
                                    <input type="text" class="form-input" id="densityUncertaintyInput" placeholder="请输入内容">
                                </div>
                                
                                <button class="btn btn-primary" id="generateDefaultScenarios">
                                    <i class="fas fa-cog"></i>
                                    生成场景
                                </button>
                            </div>
                            
                            <!-- 右侧场景列表 -->
                            <div class="scenarios-panel">
                                <h4>场景列表</h4>
                                <div class="scenarios-table-container">
                                    <table class="scenarios-table">
                                        <thead>
                                            <tr>
                                                <th>序号</th>
                                                <th>R-L</th>
                                                <th>I-S</th>
                                                <th>P-A</th>
                                                <th>密度不确定性%</th>
                                                <th>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody id="scenariosTableBody">
                                            <!-- 场景数据将通过JavaScript动态生成 -->
                                        </tbody>
                                    </table>
                                </div>
                                <div class="scenarios-info">
                                    <span>场景数: <span id="scenarioCount">21</span></span>
                                    <div>
                                        <button class="btn btn-primary" id="addScenario" title="添加场景" style="margin-right: 8px;">
                                            <i class="fas fa-plus"></i>
                                            添加
                                        </button>
                                    <button class="btn btn-secondary" id="clearAllScenarios">
                                        <i class="fas fa-trash"></i>
                                        清空
                                    </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="robustnessSettingsCancel">取消</button>
                        <button class="btn btn-primary" id="robustnessSettingsConfirm">确定</button>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.bindEvents();
        this.generateDefaultScenarios();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .robustness-settings-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }

            .modal-content {
                background-color: #2a2a2a;
                border-radius: 8px;
                width: 90%;
                max-width: 1200px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #333333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h3 {
                color: #ffffff;
                margin: 0;
                font-size: 18px;
            }

            .modal-close {
                background: none;
                border: none;
                color: #cccccc;
                font-size: 18px;
                cursor: pointer;
                padding: 5px;
            }

            .modal-close:hover {
                color: #ffffff;
            }

            .modal-body {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }

            .robustness-settings-layout {
                display: flex;
                gap: 20px;
                height: 100%;
            }

            .settings-panel {
                flex: 1;
                background-color: #1a1a1a;
                padding: 20px;
                border-radius: 6px;
            }

            .settings-panel h4 {
                color: #ffffff;
                margin-bottom: 20px;
                font-size: 16px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-label {
                display: block;
                color: #cccccc;
                margin-bottom: 8px;
                font-size: 14px;
            }

            .form-input {
                width: 100%;
                padding: 8px 12px;
                background-color: #333333;
                border: 1px solid #444444;
                border-radius: 4px;
                color: #ffffff;
                font-size: 14px;
            }

            .form-input:focus {
                outline: none;
                border-color: #007acc;
            }

            .radio-group {
                display: flex;
                gap: 20px;
            }

            .radio-option {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #cccccc;
                cursor: pointer;
            }

            .radio-option input[type="radio"] {
                margin: 0;
            }

            .positioning-uncertainty {
                margin: 20px 0;
            }

            .human-model-3d {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .human-figure { width: 220px; height: 180px; position: relative; overflow: visible; }

            .body-outline { width: 90px; height: 140px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: linear-gradient(#3a3a3a,#2f2f2f); border-radius: 36px 36px 16px 16px; box-shadow: inset 0 0 0 2px #444; }

            .head { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); width: 24px; height: 24px; background-color: #4a4a4a; border-radius: 50%; box-shadow: inset 0 0 0 2px #555; }

            .torso { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 36px; height: 58px; background-color: #4a4a4a; border-radius: 18px; box-shadow: inset 0 0 0 2px #555; }

            .arms { position: absolute; top: 16px; left: -12px; width: 18px; height: 40px; background-color: #4a4a4a; border-radius: 10px; box-shadow: inset 0 0 0 2px #555; }

            .legs { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 26px; height: 40px; background-color: #4a4a4a; border-radius: 12px 12px 0 0; box-shadow: inset 0 0 0 2px #555; }

            .pos-chip { position: absolute; background: #1f1f1f; border: 1px solid #444; padding: 2px 6px; border-radius: 4px; color: #ddd; font-size: 12px; display: flex; align-items: center; gap: 6px; box-shadow: 0 0 0 1px rgba(0,0,0,0.2) inset; }
            .pos-chip input { width: 50px; height: 22px; background: #111; border: 1px solid #333; color: #eee; border-radius: 4px; padding: 0 6px; }
            /* 将参数标签放在人体外侧四周，不遮挡且不超出弹窗 */
            .pos-up { left: 50%; top: -22px; transform: translateX(-50%); }
            .pos-down { left: 50%; bottom: -22px; transform: translateX(-50%); }
            .pos-left { left: -80px; top: 50%; transform: translateY(-50%); }
            .pos-right { right: -80px; top: 50%; transform: translateY(-50%); }
            .pos-front { top: -22px; left: -80px; }
            .pos-back { top: -22px; right: -80px; }

            .scenarios-panel {
                flex: 1;
                background-color: #1a1a1a;
                padding: 20px;
                border-radius: 6px;
            }

            .scenarios-panel h4 {
                color: #ffffff;
                margin-bottom: 20px;
                font-size: 16px;
            }

            .scenarios-table-container {
                max-height: 300px;
                overflow-y: auto;
                margin-bottom: 15px;
            }

            .scenarios-table {
                width: 100%;
                border-collapse: collapse;
                background-color: #1a1a1a;
            }

            .scenarios-table th,
            .scenarios-table td {
                padding: 8px 12px;
                text-align: center;
                border-bottom: 1px solid #333333;
                font-size: 12px;
            }

            .scenarios-table th {
                background-color: #3a3a3a;
                color: #ffffff;
                font-weight: 600;
            }

            .scenarios-table td {
                color: #cccccc;
            }

            .scenarios-table tbody tr:hover {
                background-color: #2a2a2a;
            }

            .scenarios-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: #cccccc;
                font-size: 14px;
            }

            .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
            }

            .btn-primary {
                background-color: #007acc;
                color: #ffffff;
            }

            .btn-primary:hover {
                background-color: #005a9e;
            }

            .btn-secondary {
                background-color: #4a4a4a;
                color: #ffffff;
            }

            .btn-secondary:hover {
                background-color: #5a5a5a;
            }

            .modal-footer {
                padding: 20px;
                border-top: 1px solid #333333;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }

            .delete-btn {
                background: none;
                border: none;
                color: #ff6b6b;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
            }

            .delete-btn:hover {
                background-color: #333333;
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // 关闭模态框
        const closeBtn = document.getElementById('robustnessSettingsModalClose');
        const cancelBtn = document.getElementById('robustnessSettingsCancel');
        const modal = document.getElementById('robustnessSettingsModal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hide());
        }

        // 点击模态框外部关闭
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }

        // 生成默认场景
        const generateBtn = document.getElementById('generateDefaultScenarios');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateDefaultScenarios());
        }

        // 清空场景
        const clearBtn = document.getElementById('clearAllScenarios');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllScenarios());
        }

        // 添加场景
        const addBtn = document.getElementById('addScenario');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addScenario());
        }

        // 确定按钮
        const confirmBtn = document.getElementById('robustnessSettingsConfirm');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirm());
        }

        // 方向输入变化
        const directionInputs = ['upUncertainty', 'rightUncertainty', 'frontUncertainty', 'backUncertainty', 'leftUncertainty', 'downUncertainty'];
        directionInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.updatePositioningUncertainty());
            }
        });

        // 密度不确定性输入
        const densityInput = document.getElementById('densityUncertaintyInput');
        if (densityInput) {
            densityInput.addEventListener('change', () => this.updateDensityUncertainty());
        }
    }

    show() {
        const modal = document.getElementById('robustnessSettingsModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hide() {
        const modal = document.getElementById('robustnessSettingsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    generateDefaultScenarios() {
        const scenarioCount = document.querySelector('input[name="scenarioCount"]:checked')?.value || '21';
        this.defaultScenarios = parseInt(scenarioCount);
        
        this.scenarios = [];
        const directions = ['R-L', 'I-S', 'P-A'];
        const densityValues = [3.5, -3.5, 0];
        
        for (let i = 1; i <= this.defaultScenarios; i++) {
            const scenario = {
                id: i,
                rl: (Math.random() - 0.5) * 0.6,
                is: (Math.random() - 0.5) * 0.6,
                pa: (Math.random() - 0.5) * 0.6,
                density: densityValues[Math.floor(Math.random() * densityValues.length)]
            };
            this.scenarios.push(scenario);
        }
        
        this.updateScenariosTable();
        this.updateScenarioCount();
    }

    updateScenariosTable() {
        const tbody = document.getElementById('scenariosTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.scenarios.map(scenario => `
            <tr>
                <td>${scenario.id}</td>
                <td>${scenario.rl.toFixed(2)}</td>
                <td>${scenario.is.toFixed(2)}</td>
                <td>${scenario.pa.toFixed(2)}</td>
                <td>${scenario.density}</td>
                <td>
                    <button class="delete-btn" onclick="robustnessSettingsComponent.deleteScenario(${scenario.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateScenarioCount() {
        const countElement = document.getElementById('scenarioCount');
        if (countElement) {
            countElement.textContent = this.scenarios.length;
        }
    }

    addScenario() {
        const nextId = (this.scenarios[this.scenarios.length - 1]?.id || 0) + 1;
        const scenario = {
            id: nextId,
            rl: 0.00,
            is: 0.00,
            pa: 0.00,
            density: 0
        };
        this.scenarios.push(scenario);
        this.updateScenariosTable();
        this.updateScenarioCount();
    }

    deleteScenario(id) {
        this.scenarios = this.scenarios.filter(s => s.id !== id);
        this.updateScenariosTable();
        this.updateScenarioCount();
    }

    clearAllScenarios() {
        this.scenarios = [];
        this.updateScenariosTable();
        this.updateScenarioCount();
    }

    updatePositioningUncertainty() {
        this.positioningUncertainty = {
            up: parseFloat(document.getElementById('upUncertainty')?.value || 0.30),
            right: parseFloat(document.getElementById('rightUncertainty')?.value || 0.30),
            front: parseFloat(document.getElementById('frontUncertainty')?.value || 0.30),
            back: parseFloat(document.getElementById('backUncertainty')?.value || 0.30),
            left: parseFloat(document.getElementById('leftUncertainty')?.value || 0.30),
            down: parseFloat(document.getElementById('downUncertainty')?.value || 0.30)
        };
    }

    updateDensityUncertainty() {
        this.densityUncertainty = parseFloat(document.getElementById('densityUncertaintyInput')?.value || 0);
    }

    confirm() {
        console.log('鲁棒性设置已确认:', {
            scenarios: this.scenarios,
            positioningUncertainty: this.positioningUncertainty,
            densityUncertainty: this.densityUncertainty
        });
        this.hide();
    }
}

// 全局注册组件
window.RobustnessSettingsComponent = RobustnessSettingsComponent;
