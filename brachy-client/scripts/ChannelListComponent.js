/**
 * 通道列表组件 - 后装治疗计划系统
 * 功能：
 * - 显示所有通道信息（序号、名称、通道、驻留步长、出源长度、偏移）
 * - 动态数值列显示（红点表示激活，灰线表示非激活）
 * - 通道选择、编辑、删除
 * - 底部操作栏（添加、删除、删除全部、刷新、导出、导入）
 */
class ChannelListComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        
        this.options = {
            prefix: options.prefix || '',
            onChannelSelect: options.onChannelSelect || (() => {}),
            onChannelChange: options.onChannelChange || (() => {}),
            onChannelDelete: options.onChannelDelete || (() => {}),
            onChannelAdd: options.onChannelAdd || (() => {}),
            onManualRebuild: options.onManualRebuild || (() => {}),
            onAutoRebuild: options.onAutoRebuild || (() => {}),
            onModelRebuild: options.onModelRebuild || (() => {}),
            onLoadTemplate: options.onLoadTemplate || (() => {}),
            onCreateTemplate: options.onCreateTemplate || (() => {}),
            // 与阅片框交互的回调
            onViewingFrameClick: options.onViewingFrameClick || (() => {}),
            onViewingFrameClearPreprocessingPoints: options.onViewingFrameClearPreprocessingPoints || (() => {}),
            onViewingFrameShowModel: options.onViewingFrameShowModel || (() => {}),
            onViewingFrameMoveModel: options.onViewingFrameMoveModel || (() => {}),
            onViewingFrameRotateModel: options.onViewingFrameRotateModel || (() => {}),
            ...options
        };

        // 通道数据
        this.channels = [];
        this.selectedChannelId = null;
        
        // 动态数值列配置
        this.dwellPositions = []; // 驻留位置列表，如 [1130, 1127.5, 1125, ...]
        this.dwellStep = 2.5; // 默认驻留步长
        
        // 可见性和锁定状态管理
        this.channelVisibility = new Map(); // channelId -> visible (boolean)
        this.channelLocked = new Map(); // channelId -> locked (boolean)

        // 初始化
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('ChannelListComponent: 容器不存在', this.containerId);
            return;
        }
        
        this.generateDwellPositions();
        this.render();
        this.bindEvents();
        this.loadChannels();
    }

    // 生成动态数值列（驻留位置）
    generateDwellPositions() {
        // 根据出源长度和驻留步长生成位置列表
        // 例如：从1130开始，每次减少2.5，直到109
        this.dwellPositions = [];
        let position = 1130;
        while (position >= 109) {
            this.dwellPositions.push(position);
            position -= this.dwellStep;
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="channel-list-component">
                <!-- 通道列表表格 -->
                <div class="channel-list-table-container">
                    <table class="channel-list-table" id="${this.options.prefix}channelTable">
                        <thead>
                            <tr>
                                <th style="width: 50px; min-width: 50px; text-align: center;">
                                    <i class="fas fa-eye" style="color: #888; cursor: pointer;" title="可见性"></i>
                                </th>
                                <th style="width: 50px; min-width: 50px; text-align: center;">
                                    <i class="fas fa-lock" style="color: #888; cursor: pointer;" title="锁定"></i>
                                </th>
                                <th style="width: 60px; text-align: center;">序号</th>
                                <th style="width: 120px;">名称</th>
                                <th style="width: 80px;">通道</th>
                                <th style="width: 120px;">驻留步长[mm]</th>
                                <th style="width: 120px;">出源长度[mm]</th>
                                <th style="width: 80px;">偏移[mm]</th>
                                ${this.dwellPositions.map(pos => `<th style="width: 60px; min-width: 60px;">${pos}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody id="${this.options.prefix}channelTableBody">
                            <!-- 通道数据将通过JavaScript动态加载 -->
                        </tbody>
                    </table>
                </div>

                <!-- 底部操作栏 -->
                <div class="channel-list-toolbar">
                    <button class="channel-toolbar-btn" id="${this.options.prefix}addBtn" title="添加 添加施源器">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="channel-toolbar-btn" id="${this.options.prefix}deleteBtn" title="删除 删除选中施源器" disabled>
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="channel-toolbar-btn" id="${this.options.prefix}deleteAllBtn" title="删除所有 删除所有施源器">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="channel-toolbar-btn" id="${this.options.prefix}manualRebuildBtn" title="手动重建 手动重建施源器" disabled>
                        <i class="fas fa-mouse-pointer"></i>
                    </button>
                    <button class="channel-toolbar-btn" id="${this.options.prefix}autoRebuildBtn" title="自动重建 自动重建施源器" disabled>
                        <i class="fas fa-robot"></i>
                    </button>
                    <button class="channel-toolbar-btn" id="${this.options.prefix}modelRebuildBtn" title="模型重建 从库中选择施源器模型自动重建" disabled>
                        <i class="fas fa-shapes"></i>
                    </button>
                    <button class="channel-toolbar-btn" id="${this.options.prefix}loadTemplateBtn" title="加载模板 将已有模板加载到当前通道列表" disabled>
                        <i class="fas fa-file-import"></i>
                    </button>
                    <button class="channel-toolbar-btn" id="${this.options.prefix}createTemplateBtn" title="创建模板 将当前通道列表内容保存为模板" disabled>
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 添加通道
        const addBtn = document.getElementById(`${this.options.prefix}addBtn`);
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.addChannel();
            });
        }

        // 删除通道
        const deleteBtn = document.getElementById(`${this.options.prefix}deleteBtn`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (this.selectedChannelId) {
                    this.deleteChannel(this.selectedChannelId);
                }
            });
        }

        // 删除全部
        const deleteAllBtn = document.getElementById(`${this.options.prefix}deleteAllBtn`);
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', async () => {
                if (this.channels.length > 0) {
                    const confirmed = await this.showCustomConfirm('确定要删除所有施源器吗？', '确认');
                    if (confirmed) {
                        this.channels = [];
                        this.selectedChannelId = null;
                        this.channelVisibility.clear();
                        this.channelLocked.clear();
                        this.renderChannels();
                        this.updateDeleteButton();
                        this.updateHeaderVisibilityIcon();
                        this.updateToolbarButtons();
                    }
                }
            });
        }

        // 手动重建
        const manualRebuildBtn = document.getElementById(`${this.options.prefix}manualRebuildBtn`);
        if (manualRebuildBtn) {
            manualRebuildBtn.addEventListener('click', () => {
                if (this.selectedChannelId) {
                    this.openManualRebuildDialog();
                }
            });
        }

        // 自动重建
        const autoRebuildBtn = document.getElementById(`${this.options.prefix}autoRebuildBtn`);
        if (autoRebuildBtn) {
            autoRebuildBtn.addEventListener('click', () => {
                if (this.selectedChannelId) {
                    this.openAutoRebuildDialog();
                }
            });
        }

        // 模型重建
        const modelRebuildBtn = document.getElementById(`${this.options.prefix}modelRebuildBtn`);
        if (modelRebuildBtn) {
            modelRebuildBtn.addEventListener('click', () => {
                if (this.selectedChannelId) {
                    this.openModelRebuildDialog();
                }
            });
        }

        // 加载模板
        const loadTemplateBtn = document.getElementById(`${this.options.prefix}loadTemplateBtn`);
        if (loadTemplateBtn) {
            loadTemplateBtn.addEventListener('click', () => {
                this.openLoadTemplateDialog();
            });
        }

        // 创建模板
        const createTemplateBtn = document.getElementById(`${this.options.prefix}createTemplateBtn`);
        if (createTemplateBtn) {
            createTemplateBtn.addEventListener('click', () => {
                this.openCreateTemplateDialog();
            });
        }

        // 表头眼睛和锁图标点击事件（全部显示/隐藏、全部锁定/解锁）
        const table = document.getElementById(`${this.options.prefix}channelTable`);
        if (table) {
            // 使用事件委托，确保动态渲染后也能工作
            table.addEventListener('click', (e) => {
                const clickedElement = e.target;
                
                // 检查是否点击了表头的眼睛图标（第一列）
                const headerEyeTh = clickedElement.closest('thead th:first-child');
                if (headerEyeTh && (clickedElement.classList.contains('fa-eye') || 
                                     clickedElement.classList.contains('fa-eye-slash') ||
                                     clickedElement.classList.contains('fas') ||
                                     clickedElement.tagName === 'I')) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.toggleAllVisibility();
                    return;
                }
                
                // 检查是否点击了表头的锁图标（第二列）
                const headerLockTh = clickedElement.closest('thead th:nth-child(2)');
                if (headerLockTh && (clickedElement.classList.contains('fa-lock') || 
                                      clickedElement.classList.contains('fa-unlock') ||
                                      clickedElement.classList.contains('fas') ||
                                      clickedElement.tagName === 'I')) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.toggleAllLock();
                    return;
                }
            });
        }

        // 表格行点击事件（事件委托）
        const tableBody = document.getElementById(`${this.options.prefix}channelTableBody`);
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (row && row.dataset.channelId) {
                    this.selectChannel(row.dataset.channelId);
                }
            });

            // 输入框变化事件
            tableBody.addEventListener('change', (e) => {
                if (e.target.classList.contains('channel-input') || 
                    e.target.classList.contains('channel-select')) {
                    const channelId = e.target.closest('tr')?.dataset.channelId;
                    if (channelId) {
                        this.updateChannelField(channelId, e.target.name, e.target.value);
                    }
                }
            });

                // 驻留位置点击事件（切换激活状态）
            tableBody.addEventListener('click', (e) => {
                if (e.target.classList.contains('dwell-position-cell')) {
                    const channelId = e.target.closest('tr')?.dataset.channelId;
                    const position = parseFloat(e.target.dataset.position);
                    if (channelId && position) {
                        this.toggleDwellPosition(channelId, position);
                    }
                }
                
                // 眼睛图标点击事件（可见性切换）
                if (e.target.classList.contains('channel-visibility-icon')) {
                    e.stopPropagation();
                    const channelId = e.target.closest('tr')?.dataset.channelId;
                    if (channelId) {
                        this.toggleVisibility(channelId);
                    }
                }
                
                // 锁定图标点击事件
                if (e.target.classList.contains('channel-lock-icon')) {
                    e.stopPropagation();
                    const channelId = e.target.closest('tr')?.dataset.channelId;
                    if (channelId) {
                        this.toggleLock(channelId);
                    }
                }
            });
        }
    }

    loadChannels() {
        // 模拟数据 - 实际应用中应该从后端或数据源加载
        this.channels = [
            {
                id: 'ch1',
                number: 1,
                name: '自定义',
                channel: 1,
                dwellStep: 2.5,
                sourceLength: 1130.0,
                offset: 0.0,
                activePositions: [1130, 1127.5, 1125, 1122.5, 1120, 1117.5, 1115, 1112.5, 1110, 1107.5, 1105, 1102.5, 1100, 1097.5, 1095, 1092.5, 1090, 1087.5, 1085, 1082.5, 1080, 1112.5]
            },
            {
                id: 'ch2',
                number: 2,
                name: '自定义',
                channel: 2,
                dwellStep: 2.5,
                sourceLength: 1130.0,
                offset: 0.0,
                activePositions: [1130, 1127.5, 1125, 1117.5]
            },
            {
                id: 'ch3',
                number: 3,
                name: '自定义',
                channel: 3,
                dwellStep: 2.5,
                sourceLength: 1130.0,
                offset: 0.0,
                activePositions: [1130, 1127.5, 1125, 1122.5, 1120, 1117.5, 1112.5, 1107.5, 1105, 1102.5, 1097.5, 1095, 109]
            }
        ];

        // 初始化可见性和锁定状态（默认全部可见且解锁）
        this.channels.forEach(channel => {
            if (!this.channelVisibility.has(channel.id)) {
                this.channelVisibility.set(channel.id, true);
            }
            if (!this.channelLocked.has(channel.id)) {
                this.channelLocked.set(channel.id, false);
            }
        });

        this.renderChannels();
        this.updateDeleteButton();
        this.updateHeaderVisibilityIcon();
        this.updateHeaderLockIcon();
        this.updateToolbarButtons();
    }

    renderChannels() {
        const tbody = document.getElementById(`${this.options.prefix}channelTableBody`);
        if (!tbody) return;

        if (this.channels.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${8 + this.dwellPositions.length}" style="text-align: center; padding: 40px; color: #888;">
                        暂无通道数据，点击"添加"按钮创建新通道
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.channels.map(channel => {
            const isSelected = this.selectedChannelId === channel.id;
            const isVisible = this.channelVisibility.get(channel.id) !== false; // 默认true
            const isLocked = this.channelLocked.get(channel.id) === true; // 默认false
            
            // 通道值默认等于序号
            const channelValue = channel.channel || channel.number;
            
            return `
                <tr 
                    data-channel-id="${channel.id}" 
                    class="${isSelected ? 'selected' : ''}"
                >
                    <td style="text-align: center;">
                        <i class="fas ${isVisible ? 'fa-eye' : 'fa-eye-slash'} channel-visibility-icon ${isVisible ? 'visible' : ''}" 
                           style="color: ${isVisible ? '#3AACDE' : '#888'}; cursor: pointer;" 
                           title="${isVisible ? '隐藏' : '显示'}"></i>
                    </td>
                    <td style="text-align: center;">
                        <i class="fas ${isLocked ? 'fa-lock' : 'fa-unlock'} channel-lock-icon" 
                           style="color: ${isLocked ? '#f59e0b' : '#888'}; cursor: pointer;" 
                           title="${isLocked ? '解锁' : '锁定'}"></i>
                    </td>
                    <td style="text-align: center;">${channel.number}</td>
                    <td>
                        <input type="text" 
                               class="channel-input" 
                               name="name" 
                               value="${channel.name}" 
                               ${isLocked ? 'disabled' : ''}
                               style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; height: 28px; box-sizing: border-box;">
                    </td>
                    <td>
                        <input type="number" 
                               class="channel-input channel-number-input" 
                               name="channel" 
                               value="${channelValue}" 
                               ${isLocked ? 'disabled' : ''}
                               style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; height: 28px; box-sizing: border-box;">
                    </td>
                    <td>
                        <div style="position: relative;">
                            <input type="number" 
                                   class="channel-input channel-number-input" 
                                   name="dwellStep" 
                                   value="${channel.dwellStep}" 
                                   step="0.1"
                                   ${isLocked ? 'disabled' : ''}
                                   style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; padding-right: 24px; height: 28px; box-sizing: border-box;">
                            <i class="fas fa-chevron-down" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: #888; pointer-events: none;"></i>
                        </div>
                    </td>
                    <td>
                        <input type="number" 
                               class="channel-input channel-number-input" 
                               name="sourceLength" 
                               value="${channel.sourceLength}" 
                               step="0.1"
                               ${isLocked ? 'disabled' : ''}
                               style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; height: 28px; box-sizing: border-box;">
                    </td>
                    <td>
                        <input type="number" 
                               class="channel-input channel-number-input" 
                               name="offset" 
                               value="${channel.offset}" 
                               step="0.1"
                               ${isLocked ? 'disabled' : ''}
                               style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; height: 28px; box-sizing: border-box;">
                    </td>
                    ${this.dwellPositions.map(pos => {
                        const isActive = channel.activePositions && channel.activePositions.includes(pos);
                        return `
                            <td class="dwell-position-cell ${isActive ? 'active' : 'inactive'}" 
                                data-position="${pos}"
                                style="text-align: center; cursor: pointer; padding: 8px 4px;">
                                ${isActive ? '<span style="color: #f44336; font-size: 16px;">●</span>' : '<span style="color: #666; font-size: 12px;">//</span>'}
                            </td>
                        `;
                    }).join('')}
                </tr>
            `;
        }).join('');
    }

    selectChannel(channelId) {
        // 移除之前的选中状态
        const prevSelected = document.querySelector(`tr[data-channel-id="${this.selectedChannelId}"]`);
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        // 设置新的选中状态
        this.selectedChannelId = channelId;
        const selectedRow = document.querySelector(`tr[data-channel-id="${channelId}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
        }

        // 更新删除按钮状态
        this.updateDeleteButton();
        // 更新所有工具栏按钮状态
        this.updateToolbarButtons();

        // 触发回调
        const channel = this.channels.find(c => c.id === channelId);
        if (channel) {
            this.options.onChannelSelect(channel);
        }
    }

    updateChannelField(channelId, fieldName, value) {
        const channel = this.channels.find(c => c.id === channelId);
        if (!channel) return;

        // 检查是否锁定
        const isLocked = this.channelLocked.get(channelId) === true;
        if (isLocked) {
            return; // 锁定状态下不允许修改
        }
        
        // 更新字段值
        if (fieldName === 'name') {
            channel.name = value;
        } else if (fieldName === 'channel') {
            channel.channel = parseInt(value) || channel.number; // 如果为空则使用序号
        } else if (fieldName === 'dwellStep') {
            channel.dwellStep = parseFloat(value) || 0;
            // 如果驻留步长改变，重新生成位置列表
            this.dwellStep = channel.dwellStep;
            this.generateDwellPositions();
            this.render(); // 重新渲染整个表格
            this.renderChannels();
        } else if (fieldName === 'sourceLength') {
            channel.sourceLength = parseFloat(value) || 0;
        } else if (fieldName === 'offset') {
            channel.offset = parseFloat(value) || 0;
        }

        this.options.onChannelChange(channel, fieldName, value);
    }

    toggleDwellPosition(channelId, position) {
        const channel = this.channels.find(c => c.id === channelId);
        if (!channel) return;

        if (!channel.activePositions) {
            channel.activePositions = [];
        }

        const index = channel.activePositions.indexOf(position);
        if (index > -1) {
            channel.activePositions.splice(index, 1);
        } else {
            channel.activePositions.push(position);
        }

        // 重新渲染该行
        this.renderChannels();
        this.selectChannel(channelId); // 恢复选中状态
    }

    toggleVisibility(channelId) {
        const channel = this.channels.find(c => c.id === channelId);
        if (!channel) return;

        const currentVisible = this.channelVisibility.get(channelId) !== false;
        const newVisible = !currentVisible;
        this.channelVisibility.set(channelId, newVisible);
        
        this.renderChannels();
        this.selectChannel(channelId); // 恢复选中状态
        this.updateHeaderVisibilityIcon(); // 更新表头图标
        
        // 触发回调
        if (this.options.onChannelVisibilityToggle) {
            this.options.onChannelVisibilityToggle(channel, newVisible);
        }
    }
    
    updateHeaderVisibilityIcon() {
        // 更新表头眼睛图标状态
        const headerTh = document.querySelector(`#${this.options.prefix}channelTable thead th:first-child`);
        if (!headerTh) return;
        
        const headerEyeIcon = headerTh.querySelector('.fa-eye, .fa-eye-slash, .fas');
        if (headerEyeIcon && this.channels.length > 0) {
            const allVisible = this.channels.every(channel => {
                return this.channelVisibility.get(channel.id) !== false;
            });
            
            if (allVisible) {
                headerEyeIcon.className = 'fas fa-eye';
                headerEyeIcon.style.color = '#3AACDE';
            } else {
                headerEyeIcon.className = 'fas fa-eye-slash';
                headerEyeIcon.style.color = '#888';
            }
        } else if (this.channels.length === 0) {
            // 如果没有通道，显示默认的眼睛图标
            if (headerEyeIcon) {
                headerEyeIcon.className = 'fas fa-eye';
                headerEyeIcon.style.color = '#888';
            }
        }
    }
    
    toggleLock(channelId) {
        const channel = this.channels.find(c => c.id === channelId);
        if (!channel) return;

        const currentLocked = this.channelLocked.get(channelId) === true;
        const newLocked = !currentLocked;
        this.channelLocked.set(channelId, newLocked);
        
        this.renderChannels();
        this.selectChannel(channelId); // 恢复选中状态
        this.updateHeaderLockIcon(); // 更新表头锁图标
        
        // 触发回调
        if (this.options.onChannelLockToggle) {
            this.options.onChannelLockToggle(channel, newLocked);
        }
    }

    toggleAllLock() {
        if (this.channels.length === 0) return;
        
        // 检查是否所有通道都锁定
        const allLocked = this.channels.every(channel => {
            return this.channelLocked.get(channel.id) === true;
        });
        
        // 切换所有通道的锁定状态
        const newLocked = !allLocked;
        this.channels.forEach(channel => {
            this.channelLocked.set(channel.id, newLocked);
        });
        
        // 重新渲染通道列表
        this.renderChannels();
        
        // 更新表头锁图标
        this.updateHeaderLockIcon();
        
        // 如果有选中的通道，恢复选中状态
        if (this.selectedChannelId) {
            this.selectChannel(this.selectedChannelId);
        }
    }

    updateHeaderLockIcon() {
        // 更新表头锁图标状态
        const headerTh = document.querySelector(`#${this.options.prefix}channelTable thead th:nth-child(2)`);
        if (!headerTh) return;
        
        const headerLockIcon = headerTh.querySelector('.fa-lock, .fa-unlock, .fas');
        if (headerLockIcon && this.channels.length > 0) {
            const allLocked = this.channels.every(channel => {
                return this.channelLocked.get(channel.id) === true;
            });
            
            if (allLocked) {
                headerLockIcon.className = 'fas fa-lock';
                headerLockIcon.style.color = '#f59e0b';
            } else {
                headerLockIcon.className = 'fas fa-unlock';
                headerLockIcon.style.color = '#888';
            }
        } else if (this.channels.length === 0) {
            // 如果没有通道，显示默认的解锁图标
            if (headerLockIcon) {
                headerLockIcon.className = 'fas fa-unlock';
                headerLockIcon.style.color = '#888';
            }
        }
    }

    toggleAllVisibility() {
        if (this.channels.length === 0) return;
        
        // 检查是否所有通道都可见
        const allVisible = this.channels.every(channel => {
            return this.channelVisibility.get(channel.id) !== false;
        });
        
        // 切换所有通道的可见性
        const newVisible = !allVisible;
        this.channels.forEach(channel => {
            this.channelVisibility.set(channel.id, newVisible);
        });
        
        // 重新渲染通道列表
        this.renderChannels();
        
        // 更新表头眼睛图标
        this.updateHeaderVisibilityIcon();
        
        // 如果有选中的通道，恢复选中状态
        if (this.selectedChannelId) {
            this.selectChannel(this.selectedChannelId);
        }
    }

    addChannel() {
        const newNumber = this.channels.length > 0 
            ? Math.max(...this.channels.map(c => c.number)) + 1 
            : 1;

        const newChannel = {
            id: `ch${Date.now()}`,
            number: newNumber,
            name: '自定义',
            channel: newNumber, // 通道默认等于序号
            dwellStep: 2.5,
            sourceLength: 1130.0,
            offset: 0.0,
            activePositions: []
        };

        this.channels.push(newChannel);
        
        // 初始化新通道的可见性和锁定状态（默认可见且解锁）
        this.channelVisibility.set(newChannel.id, true);
        this.channelLocked.set(newChannel.id, false);
        
        this.renderChannels();
        this.selectChannel(newChannel.id);
        this.updateHeaderVisibilityIcon();
        this.updateHeaderLockIcon();
        this.updateToolbarButtons();
        this.options.onChannelAdd(newChannel);
    }

    async deleteChannel(channelId) {
        const channel = this.channels.find(c => c.id === channelId);
        if (!channel) return;

        const confirmed = await this.showCustomConfirm(`确定要删除通道"${channel.name}"（序号${channel.number}）吗？`, '确认');
        if (confirmed) {
            this.channels = this.channels.filter(c => c.id !== channelId);
            
            if (this.selectedChannelId === channelId) {
                this.selectedChannelId = null;
            }

            this.renderChannels();
            this.updateDeleteButton();
            this.updateToolbarButtons();
            this.options.onChannelDelete(channel);
        }
    }

    updateDeleteButton() {
        const deleteBtn = document.getElementById(`${this.options.prefix}deleteBtn`);
        if (deleteBtn) {
            deleteBtn.disabled = !this.selectedChannelId;
        }
    }

    updateToolbarButtons() {
        // 更新所有工具栏按钮的可用状态
        // 根据需求文档，按钮的可用条件需要根据计划状态、审批状态、重建状态等来判断
        // 这里先实现基本逻辑，具体条件可以根据实际业务需求调整
        
        const hasSelectedChannel = !!this.selectedChannelId;
        const hasChannels = this.channels.length > 0;
        
        // 删除按钮
        const deleteBtn = document.getElementById(`${this.options.prefix}deleteBtn`);
        if (deleteBtn) {
            deleteBtn.disabled = !hasSelectedChannel;
        }
        
        // 删除所有按钮
        const deleteAllBtn = document.getElementById(`${this.options.prefix}deleteAllBtn`);
        if (deleteAllBtn) {
            deleteAllBtn.disabled = !hasChannels;
        }
        
        // 手动重建按钮
        const manualRebuildBtn = document.getElementById(`${this.options.prefix}manualRebuildBtn`);
        if (manualRebuildBtn) {
            manualRebuildBtn.disabled = !hasSelectedChannel;
        }
        
        // 自动重建按钮
        const autoRebuildBtn = document.getElementById(`${this.options.prefix}autoRebuildBtn`);
        if (autoRebuildBtn) {
            autoRebuildBtn.disabled = !hasSelectedChannel;
        }
        
        // 模型重建按钮
        const modelRebuildBtn = document.getElementById(`${this.options.prefix}modelRebuildBtn`);
        if (modelRebuildBtn) {
            modelRebuildBtn.disabled = !hasSelectedChannel;
        }
        
        // 加载模板按钮（根据需求，需要计划未审批状态，这里先简单处理）
        const loadTemplateBtn = document.getElementById(`${this.options.prefix}loadTemplateBtn`);
        if (loadTemplateBtn) {
            // 默认可用，具体条件根据业务需求调整
            loadTemplateBtn.disabled = false;
        }
        
        // 创建模板按钮
        const createTemplateBtn = document.getElementById(`${this.options.prefix}createTemplateBtn`);
        if (createTemplateBtn) {
            createTemplateBtn.disabled = !hasChannels;
        }
    }

    openManualRebuildDialog() {
        // 打开手动重建弹窗
        console.log('打开手动重建弹窗');
        if (this.options.onManualRebuild) {
            const channel = this.getSelectedChannel();
            if (channel) {
                this.options.onManualRebuild(channel);
            }
        }
    }

    openAutoRebuildDialog() {
        // 打开自动重建弹窗
        console.log('打开自动重建弹窗');
        if (this.options.onAutoRebuild) {
            const channel = this.getSelectedChannel();
            if (channel) {
                this.options.onAutoRebuild(channel);
            }
        }
    }

    openModelRebuildDialog() {
        // 打开模型重建弹窗
        const channel = this.getSelectedChannel();
        if (!channel) return;
        
        // 如果是多通道的子通道，使用父通道
        const targetChannel = channel.parentChannelId ? 
            this.channels.find(c => c.id === channel.parentChannelId) || channel : 
            channel;
        
        this.showModelReconstructionModal(targetChannel);
    }

    openLoadTemplateDialog() {
        // 打开加载模板弹窗
        console.log('打开加载模板弹窗');
        if (this.options.onLoadTemplate) {
            this.options.onLoadTemplate();
        }
    }

    openCreateTemplateDialog() {
        // 打开创建模板弹窗
        console.log('打开创建模板弹窗');
        if (this.options.onCreateTemplate) {
            this.options.onCreateTemplate(this.channels);
        }
    }

    toggleFullscreen() {
        const component = this.container.closest('.channel-list-component');
        if (!component) return;

        if (!document.fullscreenElement && !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && !document.msFullscreenElement) {
            // 进入全屏
            if (component.requestFullscreen) {
                component.requestFullscreen();
            } else if (component.webkitRequestFullscreen) {
                component.webkitRequestFullscreen();
            } else if (component.mozRequestFullScreen) {
                component.mozRequestFullScreen();
            } else if (component.msRequestFullscreen) {
                component.msRequestFullscreen();
            }
        } else {
            // 退出全屏
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    updateFullscreenIcon() {
        const fullscreenBtn = document.getElementById(`${this.options.prefix}fullscreenBtn`);
        if (!fullscreenBtn) return;

        const icon = fullscreenBtn.querySelector('i');
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                               document.mozFullScreenElement || document.msFullscreenElement);

        if (icon) {
            icon.className = isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
        }
        fullscreenBtn.title = isFullscreen ? '退出全屏' : '全屏';
    }


    // 公共方法：获取选中的通道
    getSelectedChannel() {
        return this.channels.find(c => c.id === this.selectedChannelId) || null;
    }

    // 公共方法：获取所有通道
    getChannels() {
        return this.channels;
    }

    // 公共方法：设置通道数据
    setChannels(channels) {
        this.channels = channels;
        this.renderChannels();
        this.updateDeleteButton();
    }

    // 公共方法：更新通道
    updateChannel(channelId, updates) {
        const channel = this.channels.find(c => c.id === channelId);
        if (channel) {
            Object.assign(channel, updates);
            this.renderChannels();
            if (this.selectedChannelId === channelId) {
                this.selectChannel(channelId); // 恢复选中状态
            }
        }
    }

    // 获取可用模型列表（从物理模块获取，当前使用模拟数据）
    getAvailableModels() {
        // TODO: 实际实现中应该从物理模块获取
        // 根据当前计划选择的后装机筛选可用的模型
        // 模型需要满足：1) 在物理模块-施源器中有创建模型 2) 支持当前计划选择的后装机使用
        
        // 模拟数据 - 实际应该从物理模块API获取
        return [
            { id: 'model4', name: '宫腔管', type: 'rectal_vaginal' },
            { id: 'model1', name: '穹窿管（右）', type: 'rectal_vaginal' },
            { id: 'model2', name: '穹窿管（左）', type: 'rectal_vaginal' },
            { id: 'model3', name: '阴道施源器', type: 'rectal_vaginal' },
            { id: 'model5', name: '插植针', type: 'implant_needle' },
            { id: 'model6', name: '多通道施源器', type: 'multi_channel' }
        ];
    }
    
    // 获取模型信息（从物理模块获取模型详细配置）
    getModelInfo(modelId) {
        // TODO: 实际实现中应该从物理模块获取模型详细信息
        // 包括：模型类型、探出长度范围（直肠/阴道类型）、通道数量（多通道类型）等
        
        // 模拟数据
        const modelConfigs = {
            'model1': { 
                type: 'vault_tube', // 穹窿管（右）
                // 没有探出长度参数
            },
            'model2': { 
                type: 'vault_tube', // 穹窿管（左）
                // 没有探出长度参数
            },
            'model3': { 
                type: 'rectal_vaginal', // 阴道施源器
                protrusionLengthRange: { min: 0, max: 200 },
                defaultProtrusionLength: 119
            },
            'model4': { 
                type: 'cervical_uterine_tube', // 宫腔管
                // 没有探出长度参数
            },
            'model5': { 
                type: 'implant_needle',
                maxDwellPoints: 100
            },
            'model6': { 
                type: 'multi_channel',
                channelCount: 6, // 中心管1个 + 外围5个，总共6个管子
                centerTubeProtrusionRange: { min: 0, max: 200 },
                defaultCenterTubeProtrusion: 0
            }
        };
        
        return modelConfigs[modelId] || null;
    }
    
    // 渲染模型参数配置区域
    renderModelParametersConfig(modal, modelId, modelInfo, channel) {
        const configContainer = modal.querySelector(`#${this.options.prefix}modelParametersConfig`);
        if (!configContainer) return;
        
        // 根据模型类型渲染不同的参数
        let paramsHTML = '';
        
        if (!modelId || !modelInfo) {
            configContainer.innerHTML = '<div class="model-params-empty">请先选择模型</div>';
            return;
        }
        
        // 获取原始参数值（从物理模块配置）和当前参数值（如果有调整过）
        const originalParams = this.getOriginalModelParameters(modelId);
        const currentParams = channel.modelParameters || originalParams || {};
        
        // 根据模型ID判断具体类型（因为不同类型的模型可能type相同，需要通过ID区分）
        // model1: 穹窿管（右），model2: 穹窿管（左），model3: 阴道施源器，model4: 宫腔管
        if (modelId === 'model1' || modelId === 'model2') {
            // 宫颈穹窿管（左/右）：尺寸参数、直径参数、弯曲参数
            paramsHTML = this.renderVaultTubeParameters(originalParams, currentParams, channel);
        } else if (modelId === 'model4') {
            // 宫颈宫腔管：尺寸参数、弯曲参数
            paramsHTML = this.renderCervicalUterineTubeParameters(originalParams, currentParams, channel);
        } else {
            switch (modelInfo.type) {
                case 'rectal_vaginal':
                    // 直肠/阴道类型：施源器管参数、外管参数、探出参数
                    paramsHTML = this.renderRectalVaginalParameters(originalParams, currentParams, channel);
                    break;
                case 'multi_channel':
                    // 多通道施源器：外管参数、旁置管参数、中心管参数
                    paramsHTML = this.renderMultiChannelParameters(originalParams, currentParams, channel);
                    break;
                case 'implant_needle':
                    // 插植针：尺寸参数
                    paramsHTML = this.renderImplantNeedleParameters(originalParams, currentParams, channel);
                    break;
                default:
                    paramsHTML = '<div class="model-params-empty">该模型类型暂无参数配置</div>';
            }
        }
        
        configContainer.innerHTML = paramsHTML;
        
        // 绑定参数调整事件
        this.bindModelParametersEvents(modal, modelId, modelInfo, channel, originalParams);
        
        // 更新按钮状态（另存为新模型、回到原始参数）
        this.updateModelParameterButtons(modal, originalParams, currentParams);
    }
    
    // 获取模型的原始参数（从物理模块配置）
    getOriginalModelParameters(modelId) {
        // 这里是模拟数据，实际应该从物理模块API获取
        // 返回一个包含所有参数默认值的对象
        const modelParams = {
            'model1': {
                // 穹窿管（右）- 作为示例，需要根据实际模型配置
                rearEndLength: 100,
                middleEndLength: 80,
                frontEndLength: 60,
                probeEndLength: 40,
                middleRearDiameter: 5,
                frontDiameter: 4,
                frontRearBendAngle: 30,
                probeBendAngle: 15,
                frontRearBendRadius: 50,
                probeBendRadius: 30
            },
            'model2': {
                // 穹窿管（左）- 同上
                rearEndLength: 100,
                middleEndLength: 80,
                frontEndLength: 60,
                probeEndLength: 40,
                middleRearDiameter: 5,
                frontDiameter: 4,
                frontRearBendAngle: 30,
                probeBendAngle: 15,
                frontRearBendRadius: 50,
                probeBendRadius: 30
            },
            'model3': {
                // 阴道施源器
                tubeDiameter: 5,
                tubeRearEndLength: 100,
                tubeFrontEndLength: 60,
                tubeBendAngle: 30,
                tubeBendRadius: 50,
                outerTubeLength: 80,
                outerTubeDiameter: 8,
                protrusionLength: 119
            },
            'model4': {
                // 宫腔管
                rearEndLength: 100,
                frontEndLength: 60,
                diameter: 5,
                bendAngle: 30,
                bendRadius: 50
            },
            'model5': {
                // 插植针
                needleSeatDiameter: 10,
                needleSeatLength: 20,
                needleTubeDiameter: 2,
                needleTipLength: 5,
                needleTotalLength: 200
            },
            'model6': {
                // 多通道施源器
                outerTubeLength: 100,
                outerTubeDiameter: 20,
                sideTubeDistributionDiameter: 30,
                sideTubeDepthLength: 80,
                sideTubeDiameter: 3,
                centerTubeDiameter: 5,
                centerTubeLength: 100,
                centerTubeProtrusion: 0
            }
        };
        
        return modelParams[modelId] || {};
    }
    
    // 渲染直肠/阴道类型参数
    renderRectalVaginalParameters(originalParams, currentParams, channel) {
        const params = {
            tubeDiameter: { label: '施源器管直径', value: currentParams.tubeDiameter ?? originalParams.tubeDiameter ?? 5, min: 1, max: 10, unit: 'mm' },
            tubeRearEndLength: { label: '施源器管后端长度', value: currentParams.tubeRearEndLength ?? originalParams.tubeRearEndLength ?? 100, min: 0, max: 200, unit: 'mm' },
            tubeFrontEndLength: { label: '施源器管前端长度', value: currentParams.tubeFrontEndLength ?? originalParams.tubeFrontEndLength ?? 60, min: 0, max: 150, unit: 'mm' },
            tubeBendAngle: { label: '施源器管弯曲角度', value: currentParams.tubeBendAngle ?? originalParams.tubeBendAngle ?? 30, min: 0, max: 90, unit: '°' },
            tubeBendRadius: { label: '施源器管弯曲半径', value: currentParams.tubeBendRadius ?? originalParams.tubeBendRadius ?? 50, min: 10, max: 200, unit: 'mm' },
            outerTubeLength: { label: '外管长度', value: currentParams.outerTubeLength ?? originalParams.outerTubeLength ?? 80, min: 0, max: 200, unit: 'mm' },
            outerTubeDiameter: { label: '外管直径', value: currentParams.outerTubeDiameter ?? originalParams.outerTubeDiameter ?? 8, min: 1, max: 20, unit: 'mm' }
        };
        
        return this.renderParameterGroup('施源器管参数', params) + 
               this.renderParameterGroup('外管参数', { outerTubeLength: params.outerTubeLength, outerTubeDiameter: params.outerTubeDiameter });
    }
    
    // 渲染多通道参数
    renderMultiChannelParameters(originalParams, currentParams, channel) {
        const outerParams = {
            outerTubeLength: { label: '外管长度', value: currentParams.outerTubeLength ?? originalParams.outerTubeLength ?? 100, min: 0, max: 200, unit: 'mm' },
            outerTubeDiameter: { label: '外管直径', value: currentParams.outerTubeDiameter ?? originalParams.outerTubeDiameter ?? 20, min: 1, max: 50, unit: 'mm' }
        };
        
        const sideParams = {
            sideTubeDistributionDiameter: { label: '旁置管分布直径', value: currentParams.sideTubeDistributionDiameter ?? originalParams.sideTubeDistributionDiameter ?? 30, min: 10, max: 100, unit: 'mm' },
            sideTubeDepthLength: { label: '旁置管深入长度', value: currentParams.sideTubeDepthLength ?? originalParams.sideTubeDepthLength ?? 80, min: 0, max: 200, unit: 'mm' },
            sideTubeDiameter: { label: '旁置管直径', value: currentParams.sideTubeDiameter ?? originalParams.sideTubeDiameter ?? 3, min: 1, max: 10, unit: 'mm' }
        };
        
        const centerParams = {
            centerTubeDiameter: { label: '中心管直径', value: currentParams.centerTubeDiameter ?? originalParams.centerTubeDiameter ?? 5, min: 1, max: 20, unit: 'mm' },
            centerTubeLength: { label: '中心管长度', value: currentParams.centerTubeLength ?? originalParams.centerTubeLength ?? 100, min: 0, max: 200, unit: 'mm' }
        };
        
        return this.renderParameterGroup('外管参数', outerParams) +
               this.renderParameterGroup('旁置管参数', sideParams) +
               this.renderParameterGroup('中心管参数', centerParams);
    }
    
    // 渲染宫颈穹窿管参数（左/右）
    renderVaultTubeParameters(originalParams, currentParams, channel) {
        const sizeParams = {
            rearEndLength: { label: '后端长度', value: currentParams.rearEndLength ?? originalParams.rearEndLength ?? 100, min: 0, max: 200, unit: 'mm' },
            middleEndLength: { label: '中端长度', value: currentParams.middleEndLength ?? originalParams.middleEndLength ?? 80, min: 0, max: 200, unit: 'mm' },
            frontEndLength: { label: '前端长度', value: currentParams.frontEndLength ?? originalParams.frontEndLength ?? 60, min: 0, max: 200, unit: 'mm' },
            probeEndLength: { label: '探端长度', value: currentParams.probeEndLength ?? originalParams.probeEndLength ?? 40, min: 0, max: 100, unit: 'mm' }
        };
        
        const diameterParams = {
            middleRearDiameter: { label: '中后端直径', value: currentParams.middleRearDiameter ?? originalParams.middleRearDiameter ?? 5, min: 1, max: 20, unit: 'mm' },
            frontDiameter: { label: '前端直径', value: currentParams.frontDiameter ?? originalParams.frontDiameter ?? 4, min: 1, max: 20, unit: 'mm' }
        };
        
        const bendParams = {
            frontRearBendAngle: { label: '前后端弯曲角度', value: currentParams.frontRearBendAngle ?? originalParams.frontRearBendAngle ?? 30, min: 0, max: 90, unit: '°' },
            probeBendAngle: { label: '前探端角度', value: currentParams.probeBendAngle ?? originalParams.probeBendAngle ?? 15, min: 0, max: 90, unit: '°' },
            frontRearBendRadius: { label: '前后端弯曲半径', value: currentParams.frontRearBendRadius ?? originalParams.frontRearBendRadius ?? 50, min: 10, max: 200, unit: 'mm' },
            probeBendRadius: { label: '前探端弯曲半径', value: currentParams.probeBendRadius ?? originalParams.probeBendRadius ?? 30, min: 10, max: 200, unit: 'mm' }
        };
        
        return this.renderParameterGroup('尺寸参数', sizeParams) +
               this.renderParameterGroup('直径参数', diameterParams) +
               this.renderParameterGroup('弯曲参数', bendParams);
    }
    
    // 渲染宫颈宫腔管参数
    renderCervicalUterineTubeParameters(originalParams, currentParams, channel) {
        const sizeParams = {
            rearEndLength: { label: '后端长度', value: currentParams.rearEndLength ?? originalParams.rearEndLength ?? 100, min: 0, max: 200, unit: 'mm' },
            frontEndLength: { label: '前端长度', value: currentParams.frontEndLength ?? originalParams.frontEndLength ?? 60, min: 0, max: 200, unit: 'mm' },
            diameter: { label: '直径', value: currentParams.diameter ?? originalParams.diameter ?? 5, min: 1, max: 20, unit: 'mm' }
        };
        
        const bendParams = {
            bendAngle: { label: '弯曲角度', value: currentParams.bendAngle ?? originalParams.bendAngle ?? 30, min: 0, max: 90, unit: '°' },
            bendRadius: { label: '弯曲半径', value: currentParams.bendRadius ?? originalParams.bendRadius ?? 50, min: 10, max: 200, unit: 'mm' }
        };
        
        return this.renderParameterGroup('尺寸参数', sizeParams) +
               this.renderParameterGroup('弯曲参数', bendParams);
    }
    
    // 渲染插植针参数
    renderImplantNeedleParameters(originalParams, currentParams, channel) {
        const params = {
            needleSeatDiameter: { label: '针座直径', value: currentParams.needleSeatDiameter ?? originalParams.needleSeatDiameter ?? 10, min: 1, max: 50, unit: 'mm' },
            needleSeatLength: { label: '针座长度', value: currentParams.needleSeatLength ?? originalParams.needleSeatLength ?? 20, min: 0, max: 100, unit: 'mm' },
            needleTubeDiameter: { label: '针管直径', value: currentParams.needleTubeDiameter ?? originalParams.needleTubeDiameter ?? 2, min: 0.5, max: 10, unit: 'mm' },
            needleTipLength: { label: '针尖长度', value: currentParams.needleTipLength ?? originalParams.needleTipLength ?? 5, min: 0, max: 50, unit: 'mm' },
            needleTotalLength: { label: '针总长度', value: currentParams.needleTotalLength ?? originalParams.needleTotalLength ?? 200, min: 50, max: 500, unit: 'mm' }
        };
        
        return this.renderParameterGroup('尺寸参数', params);
    }
    
    // 渲染参数组（包含多个参数项）
    renderParameterGroup(groupName, params) {
        const paramsList = Object.keys(params).map(key => {
            const param = params[key];
            return this.renderParameterItem(key, param);
        }).join('');
        
        return `
            <div class="model-params-group">
                <div class="model-params-group-title">${groupName}</div>
                <div class="model-params-list">
                    ${paramsList}
                </div>
            </div>
        `;
    }
    
    // 渲染单个参数项（拖拽条+输入框）
    renderParameterItem(paramKey, paramConfig) {
        const inputId = `${this.options.prefix}param_${paramKey}`;
        const sliderId = `${this.options.prefix}param_slider_${paramKey}`;
        const step = paramConfig.unit === '°' ? 1 : (paramConfig.unit === 'mm' ? 0.1 : 1);
        
        return `
            <div class="model-params-item" data-param-key="${paramKey}">
                <label class="model-params-label">${paramConfig.label}:</label>
                <div class="model-params-controls">
                    <input type="range" 
                           class="model-params-slider" 
                           id="${sliderId}"
                           min="${paramConfig.min}" 
                           max="${paramConfig.max}" 
                           step="${step}"
                           value="${paramConfig.value}">
                    <input type="number" 
                           class="model-params-input" 
                           id="${inputId}"
                           min="${paramConfig.min}" 
                           max="${paramConfig.max}" 
                           step="${step}"
                           value="${paramConfig.value}">
                    <span class="model-params-unit">${paramConfig.unit}</span>
                </div>
            </div>
        `;
    }
    
    // 绑定模型参数事件
    bindModelParametersEvents(modal, modelId, modelInfo, channel, originalParams) {
        const paramItems = modal.querySelectorAll('.model-params-item');
        
        paramItems.forEach(item => {
            const paramKey = item.getAttribute('data-param-key');
            const slider = item.querySelector('.model-params-slider');
            const input = item.querySelector('.model-params-input');
            
            if (!slider || !input) return;
            
            // 拖拽条变化时，同步输入框并更新模型
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                input.value = value;
                this.updateModelParameter(modal, modelId, modelInfo, channel, paramKey, value, true);
            });
            
            // 拖拽条按下时，高亮对应位置
            slider.addEventListener('mousedown', () => {
                this.highlightModelPart(modal, paramKey, true);
            });
            
            // 拖拽条松开时，取消高亮
            slider.addEventListener('mouseup', () => {
                this.highlightModelPart(modal, paramKey, false);
            });
            
            slider.addEventListener('mouseleave', () => {
                this.highlightModelPart(modal, paramKey, false);
            });
            
            // 输入框变化时，同步拖拽条并更新模型
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) || 0;
                const min = parseFloat(slider.min);
                const max = parseFloat(slider.max);
                const clampedValue = Math.max(min, Math.min(max, value));
                slider.value = clampedValue;
                input.value = clampedValue;
                this.updateModelParameter(modal, modelId, modelInfo, channel, paramKey, clampedValue, false);
            });
            
            // 输入框聚焦时，高亮对应位置
            input.addEventListener('focus', () => {
                this.highlightModelPart(modal, paramKey, true);
            });
            
            // 输入框失焦时，取消高亮
            input.addEventListener('blur', () => {
                this.highlightModelPart(modal, paramKey, false);
            });
        });
    }
    
    // 更新模型参数
    updateModelParameter(modal, modelId, modelInfo, channel, paramKey, value, isSlider) {
        // 更新通道的参数对象
        if (!channel.modelParameters) {
            channel.modelParameters = {};
        }
        channel.modelParameters[paramKey] = value;
        
        // 实时更新3D预览
        this.update3DPreviewWithParameters(modal, modelId, modelInfo, channel);
        
        // 实时更新阅片框上的模型轮廓（如果有重建）
        if (channel.isModelReconstructed && this.options.onViewingFrameUpdateModel) {
            this.options.onViewingFrameUpdateModel(channel, channel.modelParameters);
        }
        
        // 更新按钮状态
        const originalParams = this.getOriginalModelParameters(modelId);
        const currentParams = channel.modelParameters || {};
        this.updateModelParameterButtons(modal, originalParams, currentParams);
        
        // 调整参数后，清空驻留点
        // 如果是多通道施源器，清空该多通道施源器内所有管子的驻留点
        if (modelInfo && modelInfo.type === 'multi_channel') {
            // 多通道：清空所有相关通道的驻留点
            const relatedChannels = this.channels.filter(c => 
                c.parentChannelId === channel.id || c.id === channel.id
            );
            relatedChannels.forEach(ch => {
                if (ch.dwellPoints) {
                    ch.dwellPoints = [];
                }
            });
        } else {
            // 单通道：清空当前通道的驻留点
            if (channel.dwellPoints) {
                channel.dwellPoints = [];
            }
        }
        
        // 通知外部更新驻留点列表
        if (this.options.onDwellPointsChanged) {
            this.options.onDwellPointsChanged(channel);
        }
    }
    
    // 更新3D预览（根据参数）
    update3DPreviewWithParameters(modal, modelId, modelInfo, channel) {
        // 这里应该根据新的参数重新渲染3D模型
        // 暂时调用现有的update3DPreview方法
        const config = {
            protrusionLength: channel.protrusionLength,
            centerTubeProtrusion: channel.centerTubeProtrusion,
            modelParameters: channel.modelParameters
        };
        this.update3DPreview(modal, config);
    }
    
    // 高亮模型部分
    highlightModelPart(modal, paramKey, isHighlight) {
        // 在3D预览中高亮对应的部分
        // 这里需要根据paramKey确定要高亮的部分
        // 暂时作为占位，后续可以增强
        const preview = modal._3DPreview;
        if (preview && preview.modelGroup) {
            // 可以给对应的mesh添加高亮材质
            console.log(`Highlight ${paramKey}: ${isHighlight}`);
        }
        
        // 同时通知阅片框高亮对应位置
        if (this.options.onViewingFrameHighlightPart) {
            this.options.onViewingFrameHighlightPart(paramKey, isHighlight);
        }
    }
    
    // 更新模型参数按钮状态（另存为新模型、回到原始参数）
    updateModelParameterButtons(modal, originalParams, currentParams) {
        const saveAsNewBtn = modal.querySelector(`#${this.options.prefix}saveAsNewModelBtn`);
        const resetParamsBtn = modal.querySelector(`#${this.options.prefix}resetModelParamsBtn`);
        
        // 检查参数是否有变化
        const hasChanges = this.hasParameterChanges(originalParams, currentParams);
        
        if (saveAsNewBtn) {
            saveAsNewBtn.disabled = !hasChanges;
        }
        
        if (resetParamsBtn) {
            resetParamsBtn.disabled = !hasChanges;
        }
    }
    
    // 检查参数是否有变化
    hasParameterChanges(originalParams, currentParams) {
        if (!currentParams || Object.keys(currentParams).length === 0) {
            return false;
        }
        
        for (const key in currentParams) {
            if (currentParams[key] !== originalParams[key]) {
                return true;
            }
        }
        
        return false;
    }
    
    // 显示另存为新模型对话框
    showSaveAsNewModelDialog(modal, channel) {
        const dialog = document.createElement('div');
        dialog.className = 'model-save-dialog';
        dialog.id = `${this.options.prefix}saveModelDialog`;
        
        dialog.innerHTML = `
            <div class="model-save-dialog-content">
                <div class="model-save-dialog-header">
                    <h3>另存为新模型</h3>
                    <button class="model-save-dialog-close" title="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="model-save-dialog-body">
                    <div class="model-save-form-item">
                        <label class="model-save-label">模型名称 <span class="required">*</span>:</label>
                        <input type="text" class="model-save-input" id="${this.options.prefix}saveModelNameInput" 
                               placeholder="请输入模型名称" maxlength="100">
                    </div>
                    <div class="model-save-form-item">
                        <label class="model-save-label">备注:</label>
                        <textarea class="model-save-textarea" id="${this.options.prefix}saveModelRemarkInput" 
                                  placeholder="请输入备注（选填）" maxlength="500"></textarea>
                    </div>
                </div>
                <div class="model-save-dialog-footer">
                    <button class="model-save-btn model-save-btn-cancel" id="${this.options.prefix}saveModelCancelBtn">取消</button>
                    <button class="model-save-btn model-save-btn-confirm" id="${this.options.prefix}saveModelConfirmBtn">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        const closeDialog = () => {
            dialog.remove();
        };
        
        // 关闭按钮
        dialog.querySelector('.model-save-dialog-close').addEventListener('click', closeDialog);
        
        // 取消按钮
        dialog.querySelector(`#${this.options.prefix}saveModelCancelBtn`).addEventListener('click', closeDialog);
        
        // 确定按钮
        dialog.querySelector(`#${this.options.prefix}saveModelConfirmBtn`).addEventListener('click', async () => {
            const nameInput = dialog.querySelector(`#${this.options.prefix}saveModelNameInput`);
            const remarkInput = dialog.querySelector(`#${this.options.prefix}saveModelRemarkInput`);
            
            const modelName = (nameInput.value || '').trim();
            const remark = (remarkInput.value || '').trim();
            
            if (!modelName) {
                await this.showCustomAlert('请输入模型名称', '提示');
                nameInput.focus();
                return;
            }
            
            // 校验重名并处理（这里模拟，实际应该调用API）
            let finalModelName = modelName;
            // TODO: 调用API校验重名，如果重名则加上"(n)"
            
            // 保存新模型（这里模拟，实际应该调用API）
            console.log('保存新模型:', {
                name: finalModelName,
                remark: remark,
                parameters: channel.modelParameters
            });
            
            // 保存成功后，切换到新模型（这里需要调用API获取新模型的ID）
            // 暂时使用模拟ID
            const newModelId = 'new_' + Date.now();
            channel.modelId = newModelId;
            channel.modelName = finalModelName;
            
            // 更新模型选择下拉框
            const modelSelect = modal.querySelector(`#${this.options.prefix}modelSelect`);
            if (modelSelect) {
                // 添加新选项
                const option = document.createElement('option');
                option.value = newModelId;
                option.setAttribute('data-model-name', finalModelName);
                option.textContent = finalModelName;
                option.selected = true;
                modelSelect.appendChild(option);
            }
            
            closeDialog();
            await this.showCustomAlert('模型保存成功！', '提示');
        });
        
        // 点击对话框外部关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                closeDialog();
            }
        });
        
        // 添加样式
        if (!document.getElementById(`${this.options.prefix}saveModelDialogStyles`)) {
            const style = document.createElement('style');
            style.id = `${this.options.prefix}saveModelDialogStyles`;
            style.textContent = `
                .model-save-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                
                .model-save-dialog-content {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    width: 500px;
                    max-width: 90vw;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                }
                
                .model-save-dialog-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid #333;
                }
                
                .model-save-dialog-header h3 {
                    margin: 0;
                    color: #ddd;
                    font-size: 16px;
                    font-weight: 500;
                }
                
                .model-save-dialog-close {
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    padding: 4px;
                    font-size: 16px;
                    line-height: 1;
                }
                
                .model-save-dialog-close:hover {
                    color: #ddd;
                }
                
                .model-save-dialog-body {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .model-save-form-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .model-save-label {
                    color: #ddd;
                    font-size: 13px;
                }
                
                .model-save-label .required {
                    color: #f44;
                }
                
                .model-save-input,
                .model-save-textarea {
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 4px;
                    color: #ddd;
                    padding: 8px 12px;
                    font-size: 13px;
                    font-family: inherit;
                }
                
                .model-save-input:focus,
                .model-save-textarea:focus {
                    outline: none;
                    border-color: #555;
                    background: #1a1a1a;
                }
                
                .model-save-textarea {
                    min-height: 80px;
                    resize: vertical;
                }
                
                .model-save-dialog-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 16px 20px;
                    border-top: 1px solid #333;
                }
                
                .model-save-btn {
                    padding: 8px 20px;
                    border: 1px solid #333;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                
                .model-save-btn-cancel {
                    background: #222;
                    color: #ddd;
                }
                
                .model-save-btn-cancel:hover {
                    background: #2a2a2a;
                    border-color: #444;
                }
                
                .model-save-btn-confirm {
                    background: #0066cc;
                    color: #fff;
                    border-color: #0066cc;
                }
                
                .model-save-btn-confirm:hover {
                    background: #0052a3;
                    border-color: #0052a3;
                }
                
                .model-save-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `;
            document.head.appendChild(style);
        }
        
        // 聚焦到名称输入框
        setTimeout(() => {
            dialog.querySelector(`#${this.options.prefix}saveModelNameInput`).focus();
        }, 100);
    }
    
    // 显示模型重建弹窗
    showModelReconstructionModal(channel) {
        // 如果已经存在弹窗，先关闭
        const existingModal = document.getElementById(`${this.options.prefix}modelRebuildModal`);
        if (existingModal) {
            existingModal.remove();
        }

        // 创建弹窗容器（非阻隔式，不需要遮罩层）
        const modal = document.createElement('div');
        modal.className = 'model-rebuild-modal';
        modal.id = `${this.options.prefix}modelRebuildModal`;
        
        // 获取可用模型列表
        const availableModels = this.getAvailableModels();
        
        // 当前选中的模型ID和名称
        const currentModelId = channel.modelId || '';
        const currentModelName = channel.modelName || '';
        const currentProtrusionLength = channel.protrusionLength || 0;
        const currentCenterTubeProtrusion = channel.centerTubeProtrusion || 0;
        
        // 获取当前模型的配置信息
        const currentModelInfo = currentModelId ? this.getModelInfo(currentModelId) : null;
        const isMultiChannel = currentModelInfo?.type === 'multi_channel';
        // 只有model3（阴道施源器）才有探出长度参数
        const hasProtrusionLength = currentModelId === 'model3';
        
        // 多通道施源器的管道选择（1-6）
        const selectedChannels = channel.selectedChannels || [1];
        
        modal.innerHTML = `
            <div class="model-rebuild-modal-header">
                <div class="model-rebuild-modal-info">
                    <span>序号: ${channel.number !== undefined ? channel.number : ''}</span>
                    <span>名称: ${channel.name || 'NONE'}</span>
                </div>
                <button class="model-rebuild-modal-close" title="关闭">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="model-rebuild-modal-body model-rebuild-modal-body-layout">
                <!-- 左侧区域 -->
                <div class="model-rebuild-left-section">
                    <div class="model-rebuild-config-section">
                        <div class="model-rebuild-config-row">
                            <label class="model-rebuild-label">模型:</label>
                            <select class="model-rebuild-select" id="${this.options.prefix}modelSelect" ${channel.isReconstructed && !channel.isModelReconstructed ? 'disabled' : ''}>
                                <option value="">-- 请选择 --</option>
                                ${availableModels.map(model => `
                                    <option value="${model.id}" data-model-name="${model.name}" ${model.id === currentModelId ? 'selected' : ''}>${model.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        ${hasProtrusionLength ? `
                            <div class="model-rebuild-config-row model-rebuild-param-row">
                                <label class="model-rebuild-label">探出长度:</label>
                                <div class="model-rebuild-param-controls">
                                    <input type="range" 
                                           class="model-rebuild-param-slider" 
                                           id="${this.options.prefix}protrusionLengthSlider"
                                           min="0" 
                                           max="200" 
                                           step="0.1"
                                           value="${currentProtrusionLength}">
                                    <input type="number" 
                                           class="model-rebuild-param-input" 
                                           id="${this.options.prefix}protrusionLengthInput" 
                                           value="${currentProtrusionLength}" 
                                           min="0" 
                                           max="200" 
                                           step="0.1">
                                    <span class="model-rebuild-unit">mm</span>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${isMultiChannel ? `
                            <div class="model-rebuild-multichannel-section">
                                <div class="model-rebuild-config-row model-rebuild-param-row">
                                    <label class="model-rebuild-label">中心管前探长度:</label>
                                    <div class="model-rebuild-param-controls">
                                        <input type="range" 
                                               class="model-rebuild-param-slider" 
                                               id="${this.options.prefix}centerTubeProtrusionSlider"
                                               min="0" 
                                               max="200" 
                                               step="0.1"
                                               value="${currentCenterTubeProtrusion}"
                                               ${!selectedChannels.includes(1) ? 'disabled' : ''}>
                                        <input type="number" 
                                               class="model-rebuild-param-input" 
                                               id="${this.options.prefix}centerTubeProtrusionInput" 
                                               value="${currentCenterTubeProtrusion}" 
                                               min="0" 
                                               max="200" 
                                               step="0.1" 
                                               ${!selectedChannels.includes(1) ? 'disabled' : ''}>
                                        <span class="model-rebuild-unit">mm</span>
                                    </div>
                                </div>
                                <div class="model-rebuild-multichannel-layout">
                                    <div class="model-rebuild-channels-config-panel">
                                        <div class="model-rebuild-channels-diagram" id="${this.options.prefix}channelsDiagram">
                                            <!-- 多通道横截面图 -->
                                        </div>
                                        <div class="model-rebuild-channels-checkboxes" id="${this.options.prefix}channelsCheckboxes">
                                            <!-- 通道复选框（两列显示） -->
                                        </div>
                                    </div>
                                    ${!channel.isModelReconstructed ? `
                                        <div class="model-rebuild-preprocessing-hint">
                                            <i class="fas fa-info-circle"></i>
                                            <p>请点击阅片框选择位置，系统将自动生成预处理点</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="model-rebuild-preview-section">
                        <div class="model-rebuild-preview-toolbar">
                            <button class="model-rebuild-toolbar-btn" id="${this.options.prefix}previewRotateBtn" title="旋转">
                                <i class="fas fa-redo"></i>
                            </button>
                            <button class="model-rebuild-toolbar-btn" id="${this.options.prefix}previewScaleBtn" title="缩放">
                                <i class="fas fa-search-plus"></i>
                            </button>
                            <button class="model-rebuild-toolbar-btn" id="${this.options.prefix}previewMoveBtn" title="移动">
                                <i class="fas fa-hand-paper"></i>
                            </button>
                        </div>
                        <div class="model-rebuild-preview-canvas" id="${this.options.prefix}previewCanvas">
                            <!-- 3D预览区域 -->
                            <div class="model-rebuild-preview-placeholder">
                                <i class="fas fa-cube" style="font-size: 36px; color: #555; margin-bottom: 12px;"></i>
                                <p style="color: #888; font-size: 12px;">3D模型预览</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 右侧区域（模型参数配置侧边栏） -->
                <div class="model-rebuild-right-section" id="${this.options.prefix}modelParamsSidebar" style="transform: translateX(100%);">
                    <div class="model-rebuild-params-section">
                        <div class="model-rebuild-params-content" id="${this.options.prefix}modelParametersConfig">
                            <!-- 参数配置内容将在这里动态渲染 -->
                        </div>
                        <div class="model-rebuild-params-actions" id="${this.options.prefix}modelParamsActions">
                            <button class="model-rebuild-params-action-btn" id="${this.options.prefix}saveAsNewModelBtn" disabled title="另存为新模型">
                                <i class="fas fa-save"></i>
                            </button>
                            <button class="model-rebuild-params-action-btn" id="${this.options.prefix}resetModelParamsBtn" disabled title="回到原始参数">
                                <i class="fas fa-undo"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="model-rebuild-modal-footer">
                <button class="model-rebuild-footer-btn" id="${this.options.prefix}modelRebuildClearBtn" title="清空" ${!channel.isReconstructed ? 'disabled' : ''}>
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button class="model-rebuild-footer-btn" id="${this.options.prefix}modelRebuildMoveBtn" title="移动整体" ${!channel.isModelReconstructed ? 'disabled' : ''}>
                    <i class="fas fa-arrows-alt"></i>
                </button>
                <button class="model-rebuild-footer-btn" id="${this.options.prefix}modelRebuildRotateBtn" title="旋转" ${!channel.isModelReconstructed ? 'disabled' : ''}>
                    <i class="fas fa-sync-alt"></i>
                </button>
                <!-- 右下角展开参数配置按钮 -->
                <button class="model-rebuild-params-trigger" id="${this.options.prefix}modelParamsTrigger" title="展开模型参数配置">
                    <i class="fas fa-sliders-h"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 如果是多通道施源器，渲染通道选择器（延迟渲染，等待DOM就绪）
        if (isMultiChannel) {
            setTimeout(() => {
                this.renderMultiChannelSelector(modal, selectedChannels);
                // 绑定圆圈点击事件
                this.bindChannelCircleClickEvents(modal);
            }, 100);
            
            // 初始化预处理点功能（多通道特有）
            this.initPreprocessingPoints(modal, channel);
        }
        
        // 绑定事件
        this.bindModelRebuildModalEvents(modal, channel);
        
        // 初始化拖拽功能
        this.initModelRebuildModalDrag(modal);
        
        // 初始化3D预览（暂时只显示占位，不实际渲染）
        // this.init3DPreview(modal, channel);
        
        // 添加样式
        this.addModelRebuildModalStyles();
        
        // 如果是多通道，确保图表圆圈点击事件正确绑定
        if (isMultiChannel) {
            setTimeout(() => {
                this.bindChannelCircleClickEvents(modal);
            }, 200);
        }
    }
    
    // 渲染多通道选择器
    renderMultiChannelSelector(modal, selectedChannels) {
        // 尝试查找新的容器，如果不存在则查找旧的容器
        let diagramContainer = modal.querySelector(`#${this.options.prefix}channelsDiagramNew`);
        let checkboxesContainer = modal.querySelector(`#${this.options.prefix}channelsCheckboxesNew`);
        
        if (!diagramContainer) {
            diagramContainer = modal.querySelector(`#${this.options.prefix}channelsDiagram`);
        }
        if (!checkboxesContainer) {
            checkboxesContainer = modal.querySelector(`#${this.options.prefix}channelsCheckboxes`);
        }
        
        if (!diagramContainer || !checkboxesContainer) return;
        
        // 清空容器
        diagramContainer.innerHTML = '';
        checkboxesContainer.innerHTML = '';
        
        // 渲染横截面图
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 200 200');
        svg.style.width = '100%';
        svg.style.height = '160px';
        svg.style.maxWidth = '220px';
        
        const centerX = 100;
        const centerY = 100;
        const radius = 60;
        const channelRadius = 15;
        
        // 绘制中心管
        const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerCircle.setAttribute('cx', centerX);
        centerCircle.setAttribute('cy', centerY);
        centerCircle.setAttribute('r', channelRadius);
        centerCircle.setAttribute('class', `channel-circle ${selectedChannels.includes(1) ? 'selected' : ''}`);
        centerCircle.setAttribute('data-channel', '1');
        svg.appendChild(centerCircle);
        
        const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerText.setAttribute('x', centerX);
        centerText.setAttribute('y', centerY + 5);
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('fill', '#fff');
        centerText.setAttribute('font-size', '12');
        centerText.textContent = '1';
        svg.appendChild(centerText);
        
        // 绘制外围5个通道（2-6号，均匀分布，总共6个管子：1个中心+5个外围）
        const outerChannels = [2, 3, 4, 5, 6];
        outerChannels.forEach((channelNum, index) => {
            // 5个通道均匀分布在360度上，起始角度从底部左侧开始
            const angle = (index * 72 - 90) * Math.PI / 180; // 360/5=72度间隔
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            const isSelected = selectedChannels.includes(channelNum);
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', channelRadius);
            circle.setAttribute('class', `channel-circle ${isSelected ? 'selected' : ''}`);
            circle.setAttribute('data-channel', channelNum.toString());
            svg.appendChild(circle);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#fff');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', '500');
            text.textContent = channelNum.toString();
            svg.appendChild(text);
        });
        
        diagramContainer.appendChild(svg);
        
        // 渲染复选框（两列显示：左列1,2,3 右列4,5,6，中心管1号单独处理或放在第一列）
        checkboxesContainer.innerHTML = `
            <div class="model-rebuild-checkbox-column">
                ${[1, 2, 3].map(ch => `
                    <label class="model-rebuild-channel-checkbox">
                        <input type="checkbox" value="${ch}" ${selectedChannels.includes(ch) ? 'checked' : ''} 
                               class="model-rebuild-channel-checkbox-input">
                        <span>${ch}</span>
                    </label>
                `).join('')}
            </div>
            <div class="model-rebuild-checkbox-column">
                ${[4, 5, 6].map(ch => `
                    <label class="model-rebuild-channel-checkbox">
                        <input type="checkbox" value="${ch}" ${selectedChannels.includes(ch) ? 'checked' : ''} 
                               class="model-rebuild-channel-checkbox-input">
                        <span>${ch}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }
    
    // 初始化弹窗拖拽功能
    initModelRebuildModalDrag(modal) {
        const header = modal.querySelector('.model-rebuild-modal-header');
        if (!header) return;
        
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialLeft = 0;
        let initialTop = 0;
        let hasBeenDragged = false; // 标记是否已经拖拽过
        let needsInit = false; // 标记是否需要初始化位置
        
        const dragStart = (e) => {
            // 如果点击的是关闭按钮，不启动拖拽
            if (e.target.closest('.model-rebuild-modal-close')) {
                return;
            }
            
            e.preventDefault();
            isDragging = true;
            
            const rect = modal.getBoundingClientRect();
            
            // 获取鼠标位置
            startX = e.clientX;
            startY = e.clientY;
            
            // 如果已经拖拽过，使用当前的left/top值
            if (hasBeenDragged && modal.style.left && modal.style.top) {
                initialLeft = parseFloat(modal.style.left);
                initialTop = parseFloat(modal.style.top);
                needsInit = false;
            } else {
                // 第一次拖拽：记录当前位置，但不立即设置left/top
                // 等到第一次drag事件时再设置，避免视觉跳动
                initialLeft = rect.left;
                initialTop = rect.top;
                needsInit = true;
                hasBeenDragged = true;
            }
        };
        
        const drag = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // 如果是第一次拖拽，先初始化定位方式
            if (needsInit) {
                modal.style.left = `${initialLeft}px`;
                modal.style.top = `${initialTop}px`;
                modal.style.transform = 'none';
                needsInit = false;
                
                // 重新获取位置（因为刚设置了left/top，rect可能会变化）
                const rect = modal.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;
                startX = e.clientX;
                startY = e.clientY;
            }
            
            // 计算移动距离
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // 计算新位置
            let newX = initialLeft + deltaX;
            let newY = initialTop + deltaY;
            
            // 限制在视窗内
            const rect = modal.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            modal.style.left = `${newX}px`;
            modal.style.top = `${newY}px`;
        };
        
        const dragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
        };
        
        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        // 触摸事件支持
        header.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            dragStart({
                clientX: touch.clientX,
                clientY: touch.clientY,
                target: e.target,
                preventDefault: () => e.preventDefault()
            });
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            drag({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => e.preventDefault()
            });
        });
        
        document.addEventListener('touchend', dragEnd);
    }
    
    // 绑定通道圆圈点击事件
    bindChannelCircleClickEvents(modal) {
        const channelCircles = modal.querySelectorAll('.channel-circle');
        channelCircles.forEach(circle => {
            // 移除旧的事件监听器（如果存在）
            const newCircle = circle.cloneNode(true);
            circle.parentNode.replaceChild(newCircle, circle);
            
            newCircle.addEventListener('click', () => {
                const channelNum = parseInt(newCircle.getAttribute('data-channel'));
                const checkbox = modal.querySelector(`.model-rebuild-channel-checkbox-input[value="${channelNum}"]`);
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        });
    }
    
    // 绑定模型重建弹窗事件
    bindModelRebuildModalEvents(modal, channel) {
        const closeBtn = modal.querySelector('.model-rebuild-modal-close');
        const modelSelect = modal.querySelector(`#${this.options.prefix}modelSelect`);
        const clearBtn = modal.querySelector(`#${this.options.prefix}modelRebuildClearBtn`);
        const moveBtn = modal.querySelector(`#${this.options.prefix}modelRebuildMoveBtn`);
        const rotateBtn = modal.querySelector(`#${this.options.prefix}modelRebuildRotateBtn`);
        const protrusionInput = modal.querySelector(`#${this.options.prefix}protrusionLengthInput`);
        const centerTubeInput = modal.querySelector(`#${this.options.prefix}centerTubeProtrusionInput`);
        
        // 关闭弹窗（非阻隔式，只通过关闭按钮关闭）
        const closeModal = () => {
            // 如果模型已重建，保存调整的参数
            if (channel.isModelReconstructed && channel.modelParameters) {
                // 参数已经在channel.modelParameters中，会自动保存
                // 可以在这里调用回调通知外部保存参数
                if (this.options.onModelParametersSaved) {
                    this.options.onModelParametersSaved(channel, channel.modelParameters);
                }
            } else {
                // 如果模型没有重建，不保存参数
                channel.modelParameters = {};
            }
            
            // 清理所有事件监听器
            if (modal._moveKeyHandler) {
                document.removeEventListener('keydown', modal._moveKeyHandler);
            }
            if (modal._rotateKeyHandler) {
                document.removeEventListener('keydown', modal._rotateKeyHandler);
            }
            
            // 触发关闭事件
            modal.dispatchEvent(new CustomEvent('close'));
            
            if (modal) modal.remove();
        };
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // 模型选择变化
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                const selectedModelId = e.target.value;
                const selectedOption = e.target.options[e.target.selectedIndex];
                const selectedModelName = selectedOption ? selectedOption.getAttribute('data-model-name') : '';
                
                // 切换模型时，重置参数为原始值（如果之前有调整过）
                if (channel.modelParameters) {
                    channel.modelParameters = {};
                }
                
                // 根据选择的模型更新界面
                this.handleModelSelectionChange(modal, selectedModelId, selectedModelName, channel);
                
                // 如果侧边栏是展开状态，重新渲染模型参数配置
                const paramsSidebar = modal.querySelector(`#${this.options.prefix}modelParamsSidebar`);
                if (paramsSidebar && paramsSidebar.classList.contains('active')) {
                    const modelInfo = this.getModelInfo(selectedModelId);
                    if (modelInfo) {
                        this.renderModelParametersConfig(modal, selectedModelId, modelInfo, channel);
                    }
                }
                
                // 如果是多通道模型，初始化预处理点功能
                if (selectedModelId) {
                    const modelInfo = this.getModelInfo(selectedModelId);
                    if (modelInfo && modelInfo.type === 'multi_channel') {
                        const channelData = this.getSelectedChannel();
                        if (channelData && !channelData.isModelReconstructed) {
                            this.initPreprocessingPoints(modal, channelData);
                        }
                    }
                }
            });
        }
        
        // 模型参数配置侧边栏（右下角触发按钮，可切换展开/收起）
        const paramsTriggerBtn = modal.querySelector(`#${this.options.prefix}modelParamsTrigger`);
        const paramsSidebar = modal.querySelector(`#${this.options.prefix}modelParamsSidebar`);
        const paramsContent = modal.querySelector(`#${this.options.prefix}modelParametersConfig`);
        
        // 跟踪侧边栏的展开状态
        let isSidebarOpen = false;
        
        const toggleParamsSidebar = () => {
            if (!paramsSidebar) return;
            
            isSidebarOpen = !isSidebarOpen;
            
            if (isSidebarOpen) {
                // 展开
                paramsSidebar.classList.add('active');
                paramsSidebar.style.transform = 'translateX(0)';
                // 添加类名使弹窗扩大
                modal.classList.add('has-sidebar');
                
                // 更新按钮状态
                if (paramsTriggerBtn) {
                    paramsTriggerBtn.setAttribute('title', '收起模型参数配置');
                }
                
                // 如果还没有渲染参数配置，现在渲染
                if (paramsContent && (paramsContent.children.length === 0 || paramsContent.querySelector('.model-params-empty'))) {
                    const modelSelect = modal.querySelector(`#${this.options.prefix}modelSelect`);
                    const selectedModelId = modelSelect ? modelSelect.value : '';
                    if (selectedModelId) {
                        const modelInfo = this.getModelInfo(selectedModelId);
                        if (modelInfo) {
                            this.renderModelParametersConfig(modal, selectedModelId, modelInfo, channel);
                        }
                    }
                }
            } else {
                // 收起
                paramsSidebar.style.transform = 'translateX(100%)';
                // 延迟移除active类，确保动画完成后再隐藏
                setTimeout(() => {
                    paramsSidebar.classList.remove('active');
                }, 300);
                // 移除类名使弹窗恢复原始大小
                modal.classList.remove('has-sidebar');
                
                // 更新按钮状态
                if (paramsTriggerBtn) {
                    paramsTriggerBtn.setAttribute('title', '展开模型参数配置');
                }
            }
        };
        
        // 右下角触发按钮（切换展开/收起）
        if (paramsTriggerBtn) {
            paramsTriggerBtn.addEventListener('click', toggleParamsSidebar);
        }
        
        // 另存为新模型按钮
        const saveAsNewBtn = modal.querySelector(`#${this.options.prefix}saveAsNewModelBtn`);
        if (saveAsNewBtn) {
            saveAsNewBtn.addEventListener('click', () => {
                this.showSaveAsNewModelDialog(modal, channel);
            });
        }
        
        // 回到原始参数按钮
        const resetParamsBtn = modal.querySelector(`#${this.options.prefix}resetModelParamsBtn`);
        if (resetParamsBtn) {
            resetParamsBtn.addEventListener('click', async () => {
                const confirmed = await this.showCustomConfirm('确定要重置所有参数为原始值吗？', '确认');
                if (confirmed) {
                    const modelSelect = modal.querySelector(`#${this.options.prefix}modelSelect`);
                    const selectedModelId = modelSelect ? modelSelect.value : '';
                    
                    // 重置参数
                    channel.modelParameters = {};
                    
                    // 重新渲染参数配置
                    if (selectedModelId) {
                        const modelInfo = this.getModelInfo(selectedModelId);
                        if (modelInfo) {
                            this.renderModelParametersConfig(modal, selectedModelId, modelInfo, channel);
                        }
                    }
                    
                    // 更新3D预览
                    this.update3DPreviewWithParameters(modal, selectedModelId, this.getModelInfo(selectedModelId), channel);
                    
                    // 更新阅片框
                    if (channel.isModelReconstructed && this.options.onViewingFrameUpdateModel) {
                        this.options.onViewingFrameUpdateModel(channel, {});
                    }
                }
            });
        }
        
        // 清空按钮
        if (clearBtn) {
            clearBtn.addEventListener('click', async () => {
                const confirmed = await this.showCustomConfirm('确定要清空当前施源器的重建点和模型配置吗？', '确认');
                if (confirmed) {
                    // 清空通道的模型重建数据
                    channel.modelId = null;
                    channel.modelName = null;
                    channel.protrusionLength = null;
                    channel.centerTubeProtrusion = null;
                    channel.selectedChannels = null;
                    channel.isModelReconstructed = false;
                    
                    // 清空3D预览
                    if (modal._3DPreview && modal._3DPreview.modelGroup) {
                        while (modal._3DPreview.modelGroup.children.length > 0) {
                            modal._3DPreview.modelGroup.remove(modal._3DPreview.modelGroup.children[0]);
                        }
                    }
                    
                    // 重置模型选择下拉框
                    if (modelSelect) {
                        modelSelect.value = '';
                        this.handleModelSelectionChange(modal, '', '', channel);
                    }
                    
                    // 更新通道列表显示
                    this.updateChannel(channel.id, {
                        modelId: null,
                        modelName: null,
                        isModelReconstructed: false
                    });
                    
                    // 调用回调
                    if (this.options.onModelRebuild) {
                        this.options.onModelRebuild(channel, 'clear');
                    }
                }
            });
        }
        
        // 移动整体按钮
        if (moveBtn) {
            let isMoveMode = false;
            moveBtn.addEventListener('click', () => {
                isMoveMode = !isMoveMode;
                moveBtn.classList.toggle('active', isMoveMode);
                
                if (isMoveMode) {
                    // 启用移动整体模式
                    if (this.options.onViewingFrameMoveModel) {
                        this.options.onViewingFrameMoveModel(channel, true);
                    }
                    
                    // 监听键盘方向键
                    const handleKeyDown = (e) => {
                        if (!isMoveMode) return;
                        const step = 1; // 移动步长
                        let deltaX = 0;
                        let deltaY = 0;
                        
                        if (e.key === 'ArrowUp') deltaY = step;
                        else if (e.key === 'ArrowDown') deltaY = -step;
                        else if (e.key === 'ArrowLeft') deltaX = -step;
                        else if (e.key === 'ArrowRight') deltaX = step;
                        
                        if (deltaX !== 0 || deltaY !== 0) {
                            e.preventDefault();
                            // 移动模型
                            if (this.options.onViewingFrameMoveModel) {
                                this.options.onViewingFrameMoveModel(channel, true, { deltaX, deltaY });
                            }
                        }
                    };
                    
                    document.addEventListener('keydown', handleKeyDown);
                    modal._moveKeyHandler = handleKeyDown;
                } else {
                    // 禁用移动整体模式
                    if (this.options.onViewingFrameMoveModel) {
                        this.options.onViewingFrameMoveModel(channel, false);
                    }
                    
                    // 移除键盘监听
                    if (modal._moveKeyHandler) {
                        document.removeEventListener('keydown', modal._moveKeyHandler);
                        delete modal._moveKeyHandler;
                    }
                }
            });
            
            // 弹窗关闭时清理
            const closeModal = () => {
                if (modal._moveKeyHandler) {
                    document.removeEventListener('keydown', modal._moveKeyHandler);
                }
            };
            modal.addEventListener('close', closeModal);
        }
        
        // 旋转按钮
        if (rotateBtn) {
            let isRotateMode = false;
            rotateBtn.addEventListener('click', () => {
                isRotateMode = !isRotateMode;
                rotateBtn.classList.toggle('active', isRotateMode);
                
                if (isRotateMode) {
                    // 启用旋转模式
                    if (this.options.onViewingFrameRotateModel) {
                        this.options.onViewingFrameRotateModel(channel, null, true);
                    }
                    
                    // 监听键盘方向键
                    const handleKeyDown = (e) => {
                        if (!isRotateMode) return;
                        let angle = 0;
                        
                        // ↑ →：顺时针，↓ ←：逆时针
                        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') angle = 5; // 顺时针5度
                        else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') angle = -5; // 逆时针5度
                        
                        if (angle !== 0) {
                            e.preventDefault();
                            // 旋转模型
                            if (this.options.onViewingFrameRotateModel) {
                                this.options.onViewingFrameRotateModel(channel, angle);
                            }
                        }
                    };
                    
                    document.addEventListener('keydown', handleKeyDown);
                    modal._rotateKeyHandler = handleKeyDown;
                } else {
                    // 禁用旋转模式
                    if (this.options.onViewingFrameRotateModel) {
                        this.options.onViewingFrameRotateModel(channel, null, false);
                    }
                    
                    // 移除键盘监听
                    if (modal._rotateKeyHandler) {
                        document.removeEventListener('keydown', modal._rotateKeyHandler);
                        delete modal._rotateKeyHandler;
                    }
                }
            });
            
            // 弹窗关闭时清理
            const closeModal = () => {
                if (modal._rotateKeyHandler) {
                    document.removeEventListener('keydown', modal._rotateKeyHandler);
                }
            };
            modal.addEventListener('close', closeModal);
        }
        
        // 探出长度（拖拽条+输入框）
        const protrusionSlider = modal.querySelector(`#${this.options.prefix}protrusionLengthSlider`);
        if (protrusionSlider && protrusionInput) {
            // 拖拽条变化时，同步输入框
            protrusionSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                protrusionInput.value = value;
                channel.protrusionLength = value;
                // 更新3D预览
                if (currentModelInfo) {
                    this.update3DPreview(modal, { protrusionLength: value });
                }
                // 更新阅片框
                if (channel.isModelReconstructed && this.options.onViewingFrameUpdateModel) {
                    this.options.onViewingFrameUpdateModel(channel, { protrusionLength: value });
                }
            });
            
            // 输入框变化时，同步拖拽条
            protrusionInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) || 0;
                const min = parseFloat(protrusionSlider.min);
                const max = parseFloat(protrusionSlider.max);
                const clampedValue = Math.max(min, Math.min(max, value));
                protrusionSlider.value = clampedValue;
                protrusionInput.value = clampedValue;
                channel.protrusionLength = clampedValue;
                // 更新3D预览
                if (currentModelInfo) {
                    this.update3DPreview(modal, { protrusionLength: clampedValue });
                }
                // 更新阅片框
                if (channel.isModelReconstructed && this.options.onViewingFrameUpdateModel) {
                    this.options.onViewingFrameUpdateModel(channel, { protrusionLength: clampedValue });
                }
            });
        }
        
        // 中心管前探长度（拖拽条+输入框）
        const centerTubeSlider = modal.querySelector(`#${this.options.prefix}centerTubeProtrusionSlider`);
        if (centerTubeSlider && centerTubeInput) {
            // 拖拽条变化时，同步输入框
            centerTubeSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                centerTubeInput.value = value;
                channel.centerTubeProtrusion = value;
                // 更新3D预览
                if (currentModelInfo) {
                    this.update3DPreview(modal, { centerTubeProtrusion: value });
                }
                // 更新阅片框
                if (channel.isModelReconstructed && this.options.onViewingFrameUpdateModel) {
                    this.options.onViewingFrameUpdateModel(channel, { centerTubeProtrusion: value });
                }
            });
            
            // 输入框变化时，同步拖拽条
            centerTubeInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) || 0;
                const min = parseFloat(centerTubeSlider.min);
                const max = parseFloat(centerTubeSlider.max);
                const clampedValue = Math.max(min, Math.min(max, value));
                centerTubeSlider.value = clampedValue;
                centerTubeInput.value = clampedValue;
                channel.centerTubeProtrusion = clampedValue;
                // 更新3D预览
                if (currentModelInfo) {
                    this.update3DPreview(modal, { centerTubeProtrusion: clampedValue });
                }
                // 更新阅片框
                if (channel.isModelReconstructed && this.options.onViewingFrameUpdateModel) {
                    this.options.onViewingFrameUpdateModel(channel, { centerTubeProtrusion: clampedValue });
                }
            });
        }
        
        // 多通道复选框事件
        const channelCheckboxes = modal.querySelectorAll('.model-rebuild-channel-checkbox-input');
        channelCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const channelNum = parseInt(e.target.value);
                const checked = e.target.checked;
                
                // 更新图表中的选中状态（确保所有选中的通道都高亮）
                const circle = modal.querySelector(`.channel-circle[data-channel="${channelNum}"]`);
                if (circle) {
                    if (checked) {
                        circle.classList.add('selected');
                    } else {
                        circle.classList.remove('selected');
                    }
                }
                
                // 至少选择一个通道
                const checkedCount = Array.from(channelCheckboxes).filter(cb => cb.checked).length;
                if (checkedCount === 0) {
                    e.target.checked = true;
                    if (circle) circle.classList.add('selected');
                    return;
                }
                
                // 如果取消选中中心管（1号），禁用中心管前探长度输入和拖拽条
                if (channelNum === 1) {
                    const centerTubeSlider = modal.querySelector(`#${this.options.prefix}centerTubeProtrusionSlider`);
                    if (centerTubeInput) centerTubeInput.disabled = !checked;
                    if (centerTubeSlider) centerTubeSlider.disabled = !checked;
                }
                
                // 更新当前通道的选中通道列表
                const currentSelected = Array.from(channelCheckboxes)
                    .filter(cb => cb.checked)
                    .map(cb => parseInt(cb.value))
                    .sort((a, b) => a - b);
                
                channel.selectedChannels = currentSelected;
                
                // 更新图表中所有圆圈的高亮状态
                const allCircles = modal.querySelectorAll('.channel-circle');
                allCircles.forEach(circle => {
                    const circleChannelNum = parseInt(circle.getAttribute('data-channel'));
                    if (currentSelected.includes(circleChannelNum)) {
                        circle.classList.add('selected');
                    } else {
                        circle.classList.remove('selected');
                    }
                });
                
                // 更新3D预览
                const modelSelect = modal.querySelector(`#${this.options.prefix}modelSelect`);
                if (modelSelect && modelSelect.value) {
                    const modelInfo = this.getModelInfo(modelSelect.value);
                    if (modelInfo && modelInfo.type === 'multi_channel') {
                        this.update3DPreview(modal, {
                            channel: channel
                        });
                    }
                }
                
                // 更新通道列表（添加/删除对应的通道行）
                this.updateChannelsListForMultiChannel(channel, currentSelected);
            });
        });
        
        // 图表中的圆圈点击事件（延迟绑定，等待图表渲染完成）
        setTimeout(() => {
            this.bindChannelCircleClickEvents(modal);
        }, 200);
    }
    
    // 处理模型选择变化
    handleModelSelectionChange(modal, selectedModelId, selectedModelName, channel) {
        if (!selectedModelId) {
            // 如果未选择模型，清除所有配置项
            this.updateModelConfigUI(modal, null, channel);
            return;
        }
        
        // 获取模型配置信息
        const modelInfo = this.getModelInfo(selectedModelId);
        if (!modelInfo) {
            console.warn('模型配置信息未找到:', selectedModelId);
            return;
        }
        
        const isMultiChannel = modelInfo.type === 'multi_channel';
        const isRectalVaginal = modelInfo.type === 'rectal_vaginal';
        
        // 更新界面配置项
        this.updateModelConfigUI(modal, modelInfo, channel);
        
        // 更新3D预览（暂时不渲染，只显示占位）
        // const channelData = this.getSelectedChannel();
        // if (channelData) {
        //     channelData.modelId = selectedModelId;
        //     channelData.modelName = selectedModelName;
        //     this.loadModelToPreview(modal, selectedModelId, modelInfo, channelData);
        // }
        
        // 获取配置区域
        const configSection = modal.querySelector('.model-rebuild-config-section');
        if (!configSection) return;
        
        // 移除旧的配置项（保留模型选择行）
        const modelSelectRow = configSection.querySelector('.model-rebuild-config-row:first-child');
        const existingRows = configSection.querySelectorAll('.model-rebuild-config-row:not(:first-child)');
        existingRows.forEach(row => row.remove());
        const existingMultiChannelSection = configSection.querySelector('.model-rebuild-multichannel-section');
        if (existingMultiChannelSection) {
            existingMultiChannelSection.remove();
        }
        
        // 更新模型配置UI
        this.updateModelConfigUI(modal, modelInfo, channel);
    }
    
    // 更新模型配置UI（根据模型类型显示/隐藏配置项）
    updateModelConfigUI(modal, modelInfo, channel) {
        const configSection = modal.querySelector('.model-rebuild-config-section');
        if (!configSection) return;
        
        // 移除旧的配置项（保留模型选择行）
        const modelSelectRow = configSection.querySelector('.model-rebuild-config-row:first-child');
        const existingRows = configSection.querySelectorAll('.model-rebuild-config-row:not(:first-child)');
        existingRows.forEach(row => row.remove());
        const existingMultiChannelSection = configSection.querySelector('.model-rebuild-multichannel-section');
        if (existingMultiChannelSection) {
            existingMultiChannelSection.remove();
        }
        
        if (!modelInfo) {
            return; // 没有选择模型，不显示任何配置项
        }
        
        const isMultiChannel = modelInfo.type === 'multi_channel';
        // 只有model3（阴道施源器）才有探出长度参数
        const selectedModelId = modal.querySelector(`#${this.options.prefix}modelSelect`)?.value || '';
        const hasProtrusionLength = selectedModelId === 'model3';
        
        // 根据选择的模型类型添加相应的配置
        if (hasProtrusionLength) {
            const protrusionRow = document.createElement('div');
            protrusionRow.className = 'model-rebuild-config-row model-rebuild-param-row';
            const protrusionRange = modelInfo.protrusionLengthRange || { min: 0, max: 200 };
            const defaultProtrusion = modelInfo.defaultProtrusionLength || protrusionRange.min;
            const currentProtrusion = channel.protrusionLength || defaultProtrusion;
            
            protrusionRow.innerHTML = `
                <label class="model-rebuild-label">探出长度:</label>
                <div class="model-rebuild-param-controls">
                    <input type="range" 
                           class="model-rebuild-param-slider" 
                           id="${this.options.prefix}protrusionLengthSlider"
                           min="${protrusionRange.min}" 
                           max="${protrusionRange.max}" 
                           step="0.1"
                           value="${currentProtrusion}">
                    <input type="number" 
                           class="model-rebuild-param-input" 
                           id="${this.options.prefix}protrusionLengthInput" 
                           value="${currentProtrusion}" 
                           min="${protrusionRange.min}" 
                           max="${protrusionRange.max}" 
                           step="0.1">
                    <span class="model-rebuild-unit">mm</span>
                </div>
            `;
            configSection.appendChild(protrusionRow);
            
            // 绑定探出长度事件（拖拽条+输入框）
            const protrusionSlider = protrusionRow.querySelector(`#${this.options.prefix}protrusionLengthSlider`);
            const protrusionInput = protrusionRow.querySelector(`#${this.options.prefix}protrusionLengthInput`);
            if (protrusionSlider && protrusionInput) {
                // 拖拽条变化时，同步输入框
                protrusionSlider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    protrusionInput.value = value;
                    const channelData = this.getSelectedChannel();
                    if (channelData) {
                        channelData.protrusionLength = value;
                        this.update3DPreview(modal, { protrusionLength: value });
                    }
                });
                
                // 输入框变化时，同步拖拽条
                protrusionInput.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value) || 0;
                    const clampedValue = Math.max(protrusionRange.min, Math.min(value, protrusionRange.max));
                    protrusionSlider.value = clampedValue;
                    protrusionInput.value = clampedValue;
                    const channelData = this.getSelectedChannel();
                    if (channelData) {
                        channelData.protrusionLength = clampedValue;
                        this.update3DPreview(modal, { protrusionLength: clampedValue });
                    }
                });
            }
        }
        
        if (isMultiChannel) {
            const multiChannelSection = document.createElement('div');
            multiChannelSection.className = 'model-rebuild-multichannel-section';
            const centerTubeRange = modelInfo.centerTubeProtrusionRange || { min: 0, max: 200 };
            const defaultCenterTube = modelInfo.defaultCenterTubeProtrusion || 0;
            const currentCenterTube = channel.centerTubeProtrusion || defaultCenterTube;
            multiChannelSection.innerHTML = `
                <div class="model-rebuild-config-row model-rebuild-param-row">
                    <label class="model-rebuild-label">中心管前探长度:</label>
                    <div class="model-rebuild-param-controls">
                        <input type="range" 
                               class="model-rebuild-param-slider" 
                               id="${this.options.prefix}centerTubeProtrusionSlider"
                               min="${centerTubeRange.min}" 
                               max="${centerTubeRange.max}" 
                               step="0.1"
                               value="${currentCenterTube}">
                        <input type="number" 
                               class="model-rebuild-param-input" 
                               id="${this.options.prefix}centerTubeProtrusionInput" 
                               value="${currentCenterTube}" 
                               min="${centerTubeRange.min}" 
                               max="${centerTubeRange.max}" 
                               step="0.1">
                        <span class="model-rebuild-unit">mm</span>
                    </div>
                </div>
                <div class="model-rebuild-channels-selector">
                    <div class="model-rebuild-channels-diagram" id="${this.options.prefix}channelsDiagramNew">
                        <!-- 多通道横截面图 -->
                    </div>
                    <div class="model-rebuild-channels-checkboxes" id="${this.options.prefix}channelsCheckboxesNew">
                        <!-- 通道复选框 -->
                    </div>
                </div>
            `;
            configSection.appendChild(multiChannelSection);
            
            // 渲染多通道选择器（默认选择中心管1号）
            const selectedChannels = channel.selectedChannels || [1];
            setTimeout(() => {
                this.renderMultiChannelSelector(modal, selectedChannels);
                // 绑定圆圈点击事件
                this.bindChannelCircleClickEvents(modal);
            }, 100);
            
            // 绑定中心管前探长度事件（拖拽条+输入框）
            const centerTubeSlider = multiChannelSection.querySelector(`#${this.options.prefix}centerTubeProtrusionSlider`);
            const centerTubeInput = multiChannelSection.querySelector(`#${this.options.prefix}centerTubeProtrusionInput`);
            if (centerTubeSlider && centerTubeInput) {
                // 拖拽条变化时，同步输入框
                centerTubeSlider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    centerTubeInput.value = value;
                    const channelData = this.getSelectedChannel();
                    if (channelData) {
                        channelData.centerTubeProtrusion = value;
                        this.update3DPreview(modal, { centerTubeProtrusion: value });
                    }
                });
                
                // 输入框变化时，同步拖拽条
                centerTubeInput.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value) || 0;
                    const clampedValue = Math.max(centerTubeRange.min, Math.min(value, centerTubeRange.max));
                    centerTubeSlider.value = clampedValue;
                    centerTubeInput.value = clampedValue;
                    const channelData = this.getSelectedChannel();
                    if (channelData) {
                        channelData.centerTubeProtrusion = clampedValue;
                        this.update3DPreview(modal, { centerTubeProtrusion: clampedValue });
                    }
                });
            }
        }
    }
    
    // 初始化3D预览
    init3DPreview(modal, channel) {
        const previewCanvas = modal.querySelector(`#${this.options.prefix}previewCanvas`);
        if (!previewCanvas) return;
        
        // 检查Three.js是否可用
        if (typeof THREE === 'undefined') {
            console.error('Three.js库未加载');
            return;
        }
        
        // 移除占位符
        const placeholder = previewCanvas.querySelector('.model-rebuild-preview-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // 创建canvas元素
        const canvas = document.createElement('canvas');
        canvas.id = `${this.options.prefix}previewCanvas3D`;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        previewCanvas.appendChild(canvas);
        
        // 初始化Three.js场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        
        // 创建相机
        const width = previewCanvas.clientWidth || 400;
        const height = previewCanvas.clientHeight || 300;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 50, 150);
        camera.lookAt(0, 0, 0);
        
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        scene.add(directionalLight);
        
        // 保存到modal的data属性中
        modal._3DPreview = {
            scene: scene,
            camera: camera,
            renderer: renderer,
            canvas: canvas,
            modelGroup: new THREE.Group(),
            controls: {
                mode: null, // 'rotate', 'scale', 'move'
                isDragging: false,
                startMouse: { x: 0, y: 0 },
                startRotation: { x: 0, y: 0 },
                startCameraPos: { x: 0, y: 0, z: 0 },
                zoom: 1
            }
        };
        
        scene.add(modal._3DPreview.modelGroup);
        
        // 如果已选择模型，加载模型
        const modelSelect = modal.querySelector(`#${this.options.prefix}modelSelect`);
        if (modelSelect && modelSelect.value) {
            const modelId = modelSelect.value;
            const modelInfo = this.getModelInfo(modelId);
            if (modelInfo) {
                this.loadModelToPreview(modal, modelId, modelInfo, channel);
            }
        }
        
        // 渲染循环
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
        
        // 监听窗口大小变化
        const resizeObserver = new ResizeObserver(() => {
            const newWidth = previewCanvas.clientWidth;
            const newHeight = previewCanvas.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        });
        resizeObserver.observe(previewCanvas);
        
        // 绑定工具栏按钮事件
        this.bindPreviewToolbarEvents(modal);
    }
    
    // 绑定预览工具栏事件
    bindPreviewToolbarEvents(modal) {
        const preview3D = modal._3DPreview;
        if (!preview3D) return;
        
        const rotateBtn = modal.querySelector(`#${this.options.prefix}previewRotateBtn`);
        const scaleBtn = modal.querySelector(`#${this.options.prefix}previewScaleBtn`);
        const moveBtn = modal.querySelector(`#${this.options.prefix}previewMoveBtn`);
        
        // 设置模式
        const setMode = (mode) => {
            preview3D.controls.mode = mode;
            // 更新按钮状态
            [rotateBtn, scaleBtn, moveBtn].forEach(btn => {
                if (btn) btn.classList.remove('active');
            });
            if (mode === 'rotate' && rotateBtn) rotateBtn.classList.add('active');
            if (mode === 'scale' && scaleBtn) scaleBtn.classList.add('active');
            if (mode === 'move' && moveBtn) moveBtn.classList.add('active');
        };
        
        // 旋转按钮
        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => {
                setMode(preview3D.controls.mode === 'rotate' ? null : 'rotate');
            });
        }
        
        // 缩放按钮
        if (scaleBtn) {
            scaleBtn.addEventListener('click', () => {
                setMode(preview3D.controls.mode === 'scale' ? null : 'scale');
            });
        }
        
        // 移动按钮
        if (moveBtn) {
            moveBtn.addEventListener('click', () => {
                setMode(preview3D.controls.mode === 'move' ? null : 'move');
            });
        }
        
        // 鼠标事件
        const canvas = preview3D.canvas;
        let lastMouseX = 0;
        let lastMouseY = 0;
        
        canvas.addEventListener('mousedown', (e) => {
            if (!preview3D.controls.mode) return;
            
            preview3D.controls.isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            
            if (preview3D.controls.mode === 'rotate') {
                // 记录初始旋转
                const rotation = preview3D.modelGroup.rotation;
                preview3D.controls.startRotation = {
                    x: rotation.x,
                    y: rotation.y
                };
            } else if (preview3D.controls.mode === 'move') {
                // 记录初始相机位置
                const pos = preview3D.camera.position;
                preview3D.controls.startCameraPos = {
                    x: pos.x,
                    y: pos.y,
                    z: pos.z
                };
            }
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!preview3D.controls.isDragging || !preview3D.controls.mode) return;
            
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            
            if (preview3D.controls.mode === 'rotate') {
                // 旋转模型
                preview3D.modelGroup.rotation.y += deltaX * 0.01;
                preview3D.modelGroup.rotation.x += deltaY * 0.01;
            } else if (preview3D.controls.mode === 'scale') {
                // 缩放模型（通过改变相机距离）
                const scale = 1 + deltaY * 0.01;
                preview3D.controls.zoom *= scale;
                preview3D.controls.zoom = Math.max(0.5, Math.min(5, preview3D.controls.zoom));
                
                const distance = 150 / preview3D.controls.zoom;
                const direction = new THREE.Vector3(0, 0, 1);
                direction.applyQuaternion(preview3D.camera.quaternion);
                preview3D.camera.position.set(
                    direction.x * distance,
                    direction.y * distance,
                    direction.z * distance
                );
                preview3D.camera.lookAt(0, 0, 0);
            } else if (preview3D.controls.mode === 'move') {
                // 平移视图（移动相机）
                const moveSpeed = 2;
                preview3D.camera.position.x -= deltaX * moveSpeed * 0.01;
                preview3D.camera.position.y += deltaY * moveSpeed * 0.01;
                preview3D.camera.lookAt(0, 0, 0);
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            preview3D.controls.isDragging = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            preview3D.controls.isDragging = false;
        });
        
        // 滚轮缩放
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY * 0.01;
            preview3D.controls.zoom *= (1 + delta);
            preview3D.controls.zoom = Math.max(0.5, Math.min(5, preview3D.controls.zoom));
            
            const distance = 150 / preview3D.controls.zoom;
            const direction = new THREE.Vector3(0, 0, 1);
            direction.applyQuaternion(preview3D.camera.quaternion);
            preview3D.camera.position.set(
                direction.x * distance,
                direction.y * distance,
                direction.z * distance
            );
            preview3D.camera.lookAt(0, 0, 0);
        });
    }
    
    // 加载模型到预览
    loadModelToPreview(modal, modelId, modelInfo, channel) {
        const preview3D = modal._3DPreview;
        if (!preview3D) return;
        
        // 清除旧模型
        while (preview3D.modelGroup.children.length > 0) {
            preview3D.modelGroup.remove(preview3D.modelGroup.children[0]);
        }
        
        // 根据模型类型创建不同的几何体
        if (modelInfo.type === 'rectal_vaginal') {
            // 直肠/阴道类型：创建一个管状模型
            this.createRectalVaginalModel(preview3D, modelInfo, channel);
        } else if (modelInfo.type === 'implant_needle') {
            // 插植针类型：创建一个细长的针状模型
            this.createImplantNeedleModel(preview3D, modelInfo, channel);
        } else if (modelInfo.type === 'multi_channel') {
            // 多通道类型：创建多通道模型
            this.createMultiChannelModel(preview3D, modelInfo, channel);
        }
    }
    
    // 创建直肠/阴道类型模型
    createRectalVaginalModel(preview3D, modelInfo, channel) {
        const protrusionLength = channel.protrusionLength || modelInfo.defaultProtrusionLength || 119;
        
        // 创建一个弯曲的管状模型
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x3AACDE,
            emissive: 0x1a5a7a,
            transparent: true,
            opacity: 0.9
        });
        
        // 主管道（圆柱体）
        const mainGeometry = new THREE.CylinderGeometry(5, 5, 100, 32);
        const mainMesh = new THREE.Mesh(mainGeometry, material);
        mainMesh.rotation.x = Math.PI / 2;
        mainMesh.position.y = 0;
        preview3D.modelGroup.add(mainMesh);
        
        // 尖端（球体）
        const tipGeometry = new THREE.SphereGeometry(5, 16, 16);
        const tipMesh = new THREE.Mesh(tipGeometry, material);
        tipMesh.position.set(0, protrusionLength / 2, 0);
        preview3D.modelGroup.add(tipMesh);
        
        // 根据探出长度调整模型
        if (protrusionLength > 0) {
            mainMesh.scale.y = protrusionLength / 100;
        }
    }
    
    // 创建插植针模型
    createImplantNeedleModel(preview3D, modelInfo, channel) {
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x3AACDE,
            emissive: 0x1a5a7a
        });
        
        // 细长的针状几何体
        const geometry = new THREE.CylinderGeometry(1, 1, 200, 16);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI / 2;
        preview3D.modelGroup.add(mesh);
        
        // 尖端
        const tipGeometry = new THREE.ConeGeometry(1, 5, 16);
        const tipMesh = new THREE.Mesh(tipGeometry, material);
        tipMesh.rotation.x = Math.PI / 2;
        tipMesh.position.z = 100;
        preview3D.modelGroup.add(tipMesh);
    }
    
    // 创建多通道模型
    createMultiChannelModel(preview3D, modelInfo, channel) {
        const selectedChannels = channel.selectedChannels || [1];
        const centerTubeProtrusion = channel.centerTubeProtrusion || 0;
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x3AACDE,
            emissive: 0x1a5a7a,
            transparent: true,
            opacity: 0.9
        });
        
        // 中心管
        if (selectedChannels.includes(1)) {
            const centerGeometry = new THREE.CylinderGeometry(3, 3, 100, 32);
            const centerMesh = new THREE.Mesh(centerGeometry, material);
            centerMesh.rotation.x = Math.PI / 2;
            centerMesh.position.z = centerTubeProtrusion / 2;
            centerMesh.scale.y = (100 + centerTubeProtrusion) / 100;
            preview3D.modelGroup.add(centerMesh);
        }
        
        // 外围通道（2-6号，总共6个管子：1个中心+5个外围）
        const outerChannels = [2, 3, 4, 5, 6];
        outerChannels.forEach((channelNum, index) => {
            if (selectedChannels.includes(channelNum)) {
                // 5个通道均匀分布在360度上，起始角度从底部左侧开始
                const angle = (index * 72 - 90) * Math.PI / 180; // 360/5=72度间隔
                const radius = 20;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                const channelGeometry = new THREE.CylinderGeometry(2, 2, 100, 16);
                const channelMesh = new THREE.Mesh(channelGeometry, material);
                channelMesh.rotation.x = Math.PI / 2;
                channelMesh.position.set(x, y, 0);
                preview3D.modelGroup.add(channelMesh);
            }
        });
    }
    
    // 初始化预处理点功能（多通道施源器）
    initPreprocessingPoints(modal, channel) {
        // 预处理点状态
        modal._preprocessingPoints = {
            points: [],
            isActive: false,
            isConfirmed: channel.isModelReconstructed || false
        };
        
        // 如果已确认，不需要预处理点
        if (modal._preprocessingPoints.isConfirmed) {
            return;
        }
        
        // 启用预处理点模式（通知外部可以监听阅片框点击）
        modal._preprocessingPoints.isActive = true;
        
        // 通过回调通知外部系统可以开始监听阅片框点击
        if (this.options.onViewingFrameClick) {
            // 设置点击处理函数
            const clickHandler = async (point) => {
                await this.handleViewingFrameClickForPreprocessing(modal, channel, point);
            };
            this.options.onViewingFrameClick(channel, clickHandler);
        }
    }
    
    // 处理阅片框点击（用于预处理点）
    async handleViewingFrameClickForPreprocessing(modal, channel, point) {
        if (!modal._preprocessingPoints || !modal._preprocessingPoints.isActive) {
            return;
        }
        
        // 模拟生成预处理点（实际应该根据点击位置和模型配置计算）
        // TODO: 实际实现中应该调用算法生成预处理点
        try {
            const preprocessingPoints = this.generatePreprocessingPoints(channel, point);
            
            if (preprocessingPoints && preprocessingPoints.length > 0) {
                modal._preprocessingPoints.points = preprocessingPoints;
                
                // 显示预处理点确认蒙版
                this.showPreprocessingPointsMask(modal, preprocessingPoints);
            } else {
                await this.showCustomAlert('重建失败，请切换点击位置后再次尝试', '提示');
            }
        } catch (error) {
            console.error('生成预处理点失败:', error);
            await this.showCustomAlert('重建失败，请切换点击位置后再次尝试', '提示');
        }
    }
    
    // 生成预处理点（模拟实现，实际应该调用算法）
    generatePreprocessingPoints(channel, clickPoint) {
        // TODO: 实际实现中应该根据点击位置、模型配置、CT图像等计算预处理点
        // 这里返回模拟数据
        const selectedChannels = channel.selectedChannels || [1];
        
        // 模拟生成预处理点（每个通道生成几个点）
        const points = [];
        selectedChannels.forEach((channelNum, index) => {
            // 为每个通道生成几个预处理点
            for (let i = 0; i < 5; i++) {
                points.push({
                    channelNumber: channelNum,
                    pointIndex: i,
                    x: clickPoint.x + (index - selectedChannels.length / 2) * 10,
                    y: clickPoint.y,
                    z: clickPoint.z + i * 20,
                    isFirst: i === 0,
                    isLast: i === 4
                });
            }
        });
        
        return points;
    }
    
    // 显示预处理点确认蒙版
    showPreprocessingPointsMask(modal, points) {
        // 如果已确认，不再显示蒙版
        if (modal._preprocessingPoints.isConfirmed) {
            return;
        }
        
        // 创建蒙版
        const mask = document.createElement('div');
        mask.className = 'model-rebuild-preprocessing-mask';
        mask.id = `${this.options.prefix}preprocessingMask`;
        mask.innerHTML = `
            <div class="model-rebuild-preprocessing-mask-content">
                <div class="model-rebuild-preprocessing-mask-header">
                    <h3>预处理点确认</h3>
                </div>
                <div class="model-rebuild-preprocessing-mask-body">
                    <p>已生成预处理点，请确认位置是否正确</p>
                    <div class="model-rebuild-preprocessing-mask-actions">
                        <button class="model-rebuild-mask-btn" id="${this.options.prefix}preprocessingClearBtn">清空</button>
                        <button class="model-rebuild-mask-btn model-rebuild-mask-btn-primary" id="${this.options.prefix}preprocessingConfirmBtn">确认</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(mask);
        
        // 绑定事件
        const clearBtn = mask.querySelector(`#${this.options.prefix}preprocessingClearBtn`);
        const confirmBtn = mask.querySelector(`#${this.options.prefix}preprocessingConfirmBtn`);
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                // 清空预处理点
                modal._preprocessingPoints.points = [];
                modal._preprocessingPoints.isActive = false;
                mask.remove();
                
                // 通知阅片框清除预处理点
                if (this.options.onViewingFrameClearPreprocessingPoints) {
                    this.options.onViewingFrameClearPreprocessingPoints();
                }
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                // 确认预处理点，配准模型
                modal._preprocessingPoints.isConfirmed = true;
                mask.remove();
                
                // 更新通道状态
                const channel = this.getSelectedChannel();
                if (channel) {
                    channel.isModelReconstructed = true;
                    channel.preprocessingPoints = [...modal._preprocessingPoints.points];
                    this.updateChannel(channel.id, {
                        isModelReconstructed: true,
                        preprocessingPoints: channel.preprocessingPoints
                    });
                }
                
                // 通知阅片框显示模型轮廓
                if (this.options.onViewingFrameShowModel) {
                    this.options.onViewingFrameShowModel(channel, modal._preprocessingPoints.points);
                }
            });
        }
    }
    
    // 更新通道列表（多通道施源器选择变化时）
    updateChannelsListForMultiChannel(baseChannel, selectedChannels) {
        // 获取基础通道的索引
        const baseIndex = this.channels.findIndex(c => c.id === baseChannel.id);
        if (baseIndex === -1) return;
        
        // 找出所有属于这个多通道施源器的通道（通过parentChannelId标识）
        const multiChannelChannels = this.channels.filter(c => 
            c.parentChannelId === baseChannel.id || c.id === baseChannel.id
        );
        
        // 获取已存在的通道编号
        const existingChannelNumbers = multiChannelChannels
            .map(c => c.channelNumber || c.multiChannelNumber)
            .filter(n => n !== undefined);
        
        // 需要添加的通道编号
        const toAdd = selectedChannels.filter(num => !existingChannelNumbers.includes(num));
        // 需要删除的通道编号
        const toRemove = existingChannelNumbers.filter(num => !selectedChannels.includes(num));
        
        // 删除不再需要的通道
        toRemove.forEach(channelNum => {
            const channelToRemove = this.channels.find(c => 
                (c.parentChannelId === baseChannel.id || c.id === baseChannel.id) &&
                (c.channelNumber === channelNum || c.multiChannelNumber === channelNum)
            );
            if (channelToRemove && channelToRemove.id !== baseChannel.id) {
                this.channels = this.channels.filter(c => c.id !== channelToRemove.id);
            }
        });
        
        // 添加新的通道
        toAdd.forEach((channelNum, index) => {
            const newNumber = this.channels.length + 1;
            const parentChannel = this.channels.find(c => c.id === baseChannel.id);
            if (!parentChannel) return;
            
            const newChannel = {
                id: `ch${Date.now()}-${channelNum}`,
                number: newNumber,
                name: parentChannel.name || 'NONE',
                channel: parentChannel.channel || channelNum,
                channelNumber: channelNum, // 多通道编号
                parentChannelId: baseChannel.id, // 关联到父通道
                dwellStep: parentChannel.dwellStep || 2.5,
                sourceLength: parentChannel.sourceLength || 1130.0,
                offset: parentChannel.offset || 0.0,
                activePositions: [],
                isMultiChannelChild: true,
                modelId: parentChannel.modelId,
                modelName: parentChannel.modelName,
                isModelReconstructed: true
            };
            
            // 插入到基础通道之后
            const baseIndex = this.channels.findIndex(c => c.id === baseChannel.id);
            this.channels.splice(baseIndex + existingChannelNumbers.length + index, 0, newChannel);
        });
        
        // 重新编号所有通道
        this.channels.forEach((ch, index) => {
            ch.number = index + 1;
        });
        
        // 重新渲染通道列表
        this.renderChannels();
        
        // 更新按钮状态
        this.updateDeleteButton();
        this.updateToolbarButtons();
    }
    
    // 更新3D预览（根据配置更新模型）
    update3DPreview(modal, config) {
        const preview3D = modal._3DPreview;
        if (!preview3D) return;
        
        // 如果配置包含模型相关信息，重新加载模型
        if (config.modelId) {
            const modelInfo = this.getModelInfo(config.modelId);
            if (modelInfo) {
                this.loadModelToPreview(modal, config.modelId, modelInfo, config);
                return;
            }
        }
        
        // 否则，更新当前模型的配置
        // 获取当前通道数据
        const modelSelect = modal.querySelector(`#${this.options.prefix}modelSelect`);
        if (!modelSelect || !modelSelect.value) return;
        
        const modelId = modelSelect.value;
        const modelInfo = this.getModelInfo(modelId);
        if (!modelInfo) return;
        
                // 获取当前配置值
                const channel = config.channel || {};
                if (config.protrusionLength !== undefined) {
                    channel.protrusionLength = config.protrusionLength;
                }
                if (config.centerTubeProtrusion !== undefined) {
                    channel.centerTubeProtrusion = config.centerTubeProtrusion;
                }
                
                // 重新加载模型
                this.loadModelToPreview(modal, modelId, modelInfo, channel);
                
                // 如果模型已重建，通知阅片框更新模型显示
                if (channel.isModelReconstructed && this.options.onViewingFrameShowModel) {
                    this.options.onViewingFrameShowModel(channel, channel.preprocessingPoints || []);
                }
    }
    
    // 添加模型重建弹窗样式
    addModelRebuildModalStyles() {
        // 检查样式是否已添加
        if (document.getElementById(`${this.options.prefix}modelRebuildModalStyles`)) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = `${this.options.prefix}modelRebuildModalStyles`;
        style.textContent = `
            .model-rebuild-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #1a1a1a;
                border-radius: 8px;
                width: 560px;
                max-width: 95vw;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                z-index: 10000;
                border: 1px solid #333;
                transition: width 0.3s ease-in-out;
            }
            
            .model-rebuild-modal.has-sidebar {
                width: 960px;
            }
            
            /* 确保侧边栏展开时左侧区域不会过宽导致内容被截断 */
            .model-rebuild-modal.has-sidebar .model-rebuild-left-section {
                max-width: calc(100% - 416px); /* 960px - 400px侧边栏 - 16px间距 */
            }
            
            .model-rebuild-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                border-bottom: 1px solid #333;
                background: #2a2a2a;
                border-radius: 8px 8px 0 0;
                cursor: move;
                user-select: none;
            }
            
            .model-rebuild-modal-info {
                display: flex;
                gap: 20px;
                color: #ccc;
                font-size: 13px;
            }
            
            .model-rebuild-modal-close {
                background: transparent;
                border: none;
                color: #ccc;
                cursor: pointer;
                font-size: 18px;
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.3s;
            }
            
            .model-rebuild-modal-close:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .model-rebuild-modal-body {
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                flex: 1;
                overflow-y: auto;
                min-height: 0;
            }
            
            /* 左右分栏布局 */
            .model-rebuild-modal-body-layout {
                flex-direction: row;
                gap: 16px;
                padding: 12px;
                position: relative;
                overflow: hidden;
            }
            
            .model-rebuild-left-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 12px;
                min-width: 0;
                max-width: 100%;
                overflow: hidden;
            }
            
            .model-rebuild-left-section .model-rebuild-config-section {
                min-width: 0;
                max-width: 100%;
                overflow: hidden;
            }
            
            .model-rebuild-left-section .model-rebuild-config-row {
                min-width: 0;
                max-width: 100%;
            }
            
            .model-rebuild-right-section {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                width: 400px;
                display: flex;
                flex-direction: column;
                background: #1a1a1a;
                border-left: 1px solid #333;
                box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
                transform: translateX(100%);
                transition: transform 0.3s ease-in-out;
                z-index: 100;
                overflow-y: auto;
                pointer-events: none;
                opacity: 0;
            }
            
            .model-rebuild-right-section.active {
                pointer-events: auto;
                opacity: 1;
            }
            
            .model-rebuild-right-section .model-rebuild-params-section {
                width: 100%;
                height: 100%;
                margin-top: 0;
                border-top: none;
                padding: 12px;
                display: flex;
                flex-direction: column;
                min-width: 0;
                overflow: hidden;
            }
            
            /* 兼容旧的multichannel-layout（如果还有使用的话） */
            .model-rebuild-modal-body.multichannel-layout {
                flex-direction: row;
                gap: 16px;
            }
            
            .model-rebuild-modal-body.multichannel-layout > .model-rebuild-config-section {
                flex: 0 0 auto;
                min-width: 320px;
                max-width: 400px;
            }
            
            .model-rebuild-modal-body.multichannel-layout > .model-rebuild-preview-section {
                flex: 1;
                min-width: 300px;
            }
            
            .model-rebuild-config-section {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .model-rebuild-config-row {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 0;
                max-width: 100%;
            }
            
            .model-rebuild-label {
                color: #ccc;
                font-size: 12px;
                min-width: 70px;
                flex-shrink: 0;
            }
            
            .model-rebuild-select,
            .model-rebuild-input {
                flex: 1;
                max-width: 200px;
                background: #111;
                border: 1px solid #333;
                border-radius: 4px;
                color: #ddd;
                padding: 4px 8px;
                font-size: 12px;
            }
            
            /* 隐藏number类型输入框的spinner按钮 */
            .model-rebuild-input[type="number"]::-webkit-inner-spin-button,
            .model-rebuild-input[type="number"]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            
            .model-rebuild-input[type="number"] {
                -moz-appearance: textfield;
            }
            
            .model-rebuild-select:focus,
            .model-rebuild-input:focus {
                outline: none;
                border-color: #555;
                background: #1a1a1a;
            }
            
            .model-rebuild-select:disabled,
            .model-rebuild-input:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .model-rebuild-unit {
                color: #888;
                font-size: 12px;
                flex-shrink: 0;
                white-space: nowrap;
            }
            
            /* 参数行样式（用于探出长度、中心管前探长度等） */
            .model-rebuild-param-row {
                align-items: center;
            }
            
            .model-rebuild-param-controls {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 6px;
                min-width: 0;
                max-width: 100%;
                overflow: hidden;
            }
            
            .model-rebuild-param-slider {
                flex: 1;
                min-width: 0;
                height: 4px;
                background: #333;
                border-radius: 2px;
                outline: none;
                -webkit-appearance: none;
            }
            
            .model-rebuild-param-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 14px;
                height: 14px;
                background: #0066cc;
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .model-rebuild-param-slider::-webkit-slider-thumb:hover {
                background: #0052a3;
            }
            
            .model-rebuild-param-slider::-moz-range-thumb {
                width: 14px;
                height: 14px;
                background: #0066cc;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .model-rebuild-param-slider::-moz-range-thumb:hover {
                background: #0052a3;
            }
            
            .model-rebuild-param-slider:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .model-rebuild-param-slider:disabled::-webkit-slider-thumb {
                cursor: not-allowed;
            }
            
            .model-rebuild-param-slider:disabled::-moz-range-thumb {
                cursor: not-allowed;
            }
            
            .model-rebuild-param-input {
                width: 70px;
                min-width: 70px;
                max-width: 70px;
                flex-shrink: 0;
                background: #111;
                border: 1px solid #333;
                border-radius: 4px;
                color: #ddd;
                padding: 4px 6px;
                font-size: 12px;
                text-align: right;
                box-sizing: border-box;
            }
            
            .model-rebuild-param-input:focus {
                outline: none;
                border-color: #555;
                background: #1a1a1a;
            }
            
            .model-rebuild-param-input[type="number"]::-webkit-inner-spin-button,
            .model-rebuild-param-input[type="number"]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            
            .model-rebuild-param-input[type="number"] {
                -moz-appearance: textfield;
            }
            
            .model-rebuild-param-input:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            /* 模型参数配置区域 */
            .model-rebuild-params-section {
                margin-top: 8px;
                border-top: 1px solid #333;
                padding-top: 12px;
            }
            
            /* 右下角触发按钮 */
            .model-rebuild-params-trigger {
                position: absolute;
                right: 12px;
                bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                padding: 0;
                background: #0066cc;
                border: none;
                border-radius: 4px;
                color: #fff;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                z-index: 10;
            }
            
            .model-rebuild-params-trigger:hover {
                background: #0052a3;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            }
            
            .model-rebuild-params-trigger i {
                font-size: 16px;
            }
            
            .model-rebuild-params-toggle {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #222;
                border: 1px solid #333;
                border-radius: 4px;
                color: #ddd;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .model-rebuild-params-toggle:hover {
                background: #2a2a2a;
                border-color: #444;
            }
            
            .model-rebuild-params-toggle i {
                font-size: 12px;
                transition: transform 0.2s;
            }
            
            .model-rebuild-params-content {
                flex: 1;
                padding: 12px 0;
                overflow-y: auto;
                overflow-x: hidden;
                min-height: 0;
            }
            
            .model-params-empty {
                color: #888;
                font-size: 12px;
                text-align: center;
                padding: 20px;
            }
            
            .model-params-group {
                margin-bottom: 20px;
            }
            
            .model-params-group:last-child {
                margin-bottom: 0;
            }
            
            .model-params-group-title {
                color: #ccc;
                font-size: 13px;
                font-weight: 500;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #333;
            }
            
            .model-params-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .model-params-item {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                min-width: 0;
            }
            
            .model-params-label {
                color: #ccc;
                font-size: 12px;
                min-width: 90px;
                flex-shrink: 0;
            }
            
            .model-params-controls {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 6px;
                min-width: 0;
            }
            
            .model-params-slider {
                flex: 1;
                min-width: 0;
                height: 4px;
                background: #333;
                border-radius: 2px;
                outline: none;
                -webkit-appearance: none;
            }
            
            .model-params-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 14px;
                height: 14px;
                background: #0066cc;
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .model-params-slider::-webkit-slider-thumb:hover {
                background: #0052a3;
            }
            
            .model-params-slider::-moz-range-thumb {
                width: 14px;
                height: 14px;
                background: #0066cc;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .model-params-slider::-moz-range-thumb:hover {
                background: #0052a3;
            }
            
            .model-params-input {
                width: 80px;
                min-width: 80px;
                flex-shrink: 0;
                background: #111;
                border: 1px solid #333;
                border-radius: 4px;
                color: #ddd;
                padding: 4px 6px;
                font-size: 12px;
                text-align: right;
            }
            
            .model-params-input:focus {
                outline: none;
                border-color: #555;
                background: #1a1a1a;
            }
            
            .model-params-input[type="number"]::-webkit-inner-spin-button,
            .model-params-input[type="number"]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            
            .model-params-input[type="number"] {
                -moz-appearance: textfield;
            }
            
            .model-params-unit {
                color: #888;
                font-size: 12px;
                min-width: 28px;
                flex-shrink: 0;
            }
            
            .model-rebuild-params-actions {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #333;
                display: flex;
                gap: 8px;
                justify-content: flex-end;
                flex-shrink: 0;
            }
            
            .model-rebuild-params-action-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                padding: 0;
                background: #222;
                border: 1px solid #333;
                border-radius: 4px;
                color: #ddd;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .model-rebuild-params-action-btn:hover:not(:disabled) {
                background: #2a2a2a;
                border-color: #444;
            }
            
            .model-rebuild-params-action-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .model-rebuild-params-action-btn i {
                font-size: 14px;
            }
            
            .model-rebuild-multichannel-section {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 12px;
                background: #222;
                border-radius: 4px;
                border: 1px solid #333;
            }
            
            .model-rebuild-multichannel-layout {
                display: flex;
                gap: 20px;
                align-items: flex-start;
            }
            
            .model-rebuild-channels-config-panel {
                display: flex;
                flex-direction: column;
                gap: 16px;
                flex: 1;
            }
            
            .model-rebuild-channels-selector {
                display: flex;
                gap: 24px;
                align-items: flex-start;
            }
            
            .model-rebuild-channels-diagram {
                display: flex;
                justify-content: center;
                align-items: center;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 4px;
                padding: 16px;
                min-height: 150px;
            }
            
            .channel-circle {
                fill: #333;
                stroke: #555;
                stroke-width: 2;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .channel-circle:hover {
                fill: #444;
                stroke: #666;
            }
            
            .channel-circle.selected {
                fill: #3AACDE;
                stroke: #5aaeff;
            }
            
            .model-rebuild-channels-checkboxes {
                display: flex;
                gap: 16px;
                justify-content: center;
            }
            
            .model-rebuild-checkbox-column {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .model-rebuild-channel-checkbox {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #ccc;
                font-size: 13px;
                cursor: pointer;
                user-select: none;
                padding: 4px 8px;
                border-radius: 3px;
                transition: background 0.2s;
            }
            
            .model-rebuild-channel-checkbox:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .model-rebuild-channel-checkbox-input {
                cursor: pointer;
            }
            
            .model-rebuild-preprocessing-hint {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                background: #1a1a1a;
                border-radius: 4px;
                border: 1px solid #333;
                flex: 1;
            }
            
            .model-rebuild-preprocessing-hint i {
                color: #888;
                font-size: 14px;
            }
            
            .model-rebuild-preprocessing-hint p {
                color: #888;
                font-size: 12px;
                margin: 0;
            }
            
            .model-rebuild-preview-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 240px;
                max-height: 400px;
                position: relative;
                overflow: hidden;
            }
            
            .model-rebuild-preview-canvas {
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
            }
            
            .model-rebuild-preview-toolbar {
                position: absolute;
                top: 8px;
                right: 8px;
                display: flex;
                gap: 4px;
                z-index: 110;
                background: rgba(42, 42, 42, 0.9);
                padding: 4px;
                border-radius: 4px;
            }
            
            /* 当侧边栏展开时，调整工具栏位置，避免被覆盖 */
            .model-rebuild-modal.has-sidebar .model-rebuild-preview-toolbar {
                right: 408px; /* 400px侧边栏宽度 + 8px间距 */
            }
            
            .model-rebuild-toolbar-btn {
                background: transparent;
                border: 1px solid #444;
                color: #ccc;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 3px;
                font-size: 12px;
                transition: all 0.3s;
            }
            
            .model-rebuild-toolbar-btn:hover {
                background: #333;
                border-color: #555;
                color: #fff;
            }
            
            .model-rebuild-toolbar-btn.active {
                background: #3AACDE;
                border-color: #3AACDE;
                color: #fff;
            }
            
            .model-rebuild-preview-canvas {
                flex: 1;
                background: #000;
                border-radius: 4px;
                border: 1px solid #333;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }
            
            .model-rebuild-preview-placeholder {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #888;
            }
            
            .model-rebuild-modal-footer {
                display: flex;
                justify-content: flex-start;
                gap: 8px;
                padding: 8px 12px;
                border-top: 1px solid #333;
                background: #2a2a2a;
                border-radius: 0 0 8px 8px;
            }
            
            .model-rebuild-footer-btn {
                background: #333;
                border: 1px solid #444;
                color: #ccc;
                cursor: pointer;
                padding: 6px 10px;
                border-radius: 4px;
                font-size: 13px;
                transition: all 0.3s;
            }
            
            .model-rebuild-footer-btn:hover:not(:disabled) {
                background: #444;
                border-color: #555;
                color: #fff;
            }
            
            .model-rebuild-footer-btn.active {
                background: #3AACDE;
                border-color: #3AACDE;
                color: #fff;
            }
            
            .model-rebuild-footer-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* 预处理点蒙版样式 */
            .model-rebuild-preprocessing-mask {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }
            
            .model-rebuild-preprocessing-mask-content {
                background: #2a2a2a;
                border-radius: 8px;
                padding: 24px;
                min-width: 400px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                border: 1px solid #333;
            }
            
            .model-rebuild-preprocessing-mask-header {
                margin-bottom: 16px;
            }
            
            .model-rebuild-preprocessing-mask-header h3 {
                color: #fff;
                font-size: 18px;
                margin: 0;
            }
            
            .model-rebuild-preprocessing-mask-body {
                color: #ccc;
                margin-bottom: 20px;
            }
            
            .model-rebuild-preprocessing-mask-actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            .model-rebuild-mask-btn {
                padding: 8px 20px;
                border: 1px solid #444;
                border-radius: 4px;
                background: #333;
                color: #ccc;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s;
            }
            
            .model-rebuild-mask-btn:hover {
                background: #444;
                border-color: #555;
                color: #fff;
            }
            
            .model-rebuild-mask-btn-primary {
                background: #3AACDE;
                border-color: #3AACDE;
                color: #fff;
            }
            
            .model-rebuild-mask-btn-primary:hover {
                background: #5aaeff;
                border-color: #5aaeff;
            }
            
            /* 自定义弹窗样式 */
            .custom-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 20000;
                animation: fadeIn 0.2s ease-in-out;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            .custom-dialog {
                background: #2a2a2a;
                border: 1px solid #333;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                min-width: 320px;
                max-width: 500px;
                animation: slideIn 0.2s ease-out;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .custom-dialog-header {
                padding: 12px 16px;
                border-bottom: 1px solid #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .custom-dialog-title {
                color: #fff;
                font-size: 14px;
                font-weight: 500;
            }
            
            .custom-dialog-close {
                background: none;
                border: none;
                color: #888;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s;
            }
            
            .custom-dialog-close:hover {
                color: #fff;
            }
            
            .custom-dialog-body {
                padding: 16px;
                color: #ccc;
                font-size: 13px;
                line-height: 1.5;
            }
            
            .custom-dialog-footer {
                padding: 12px 16px;
                border-top: 1px solid #333;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
            
            .custom-dialog-btn {
                padding: 6px 16px;
                border: 1px solid #444;
                border-radius: 4px;
                background: #333;
                color: #ccc;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
                min-width: 60px;
            }
            
            .custom-dialog-btn:hover {
                background: #444;
                border-color: #555;
                color: #fff;
            }
            
            .custom-dialog-btn-primary {
                background: #0066cc;
                border-color: #0066cc;
                color: #fff;
            }
            
            .custom-dialog-btn-primary:hover {
                background: #0052a3;
                border-color: #0052a3;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // 显示自定义提示框（替换 alert）
    showCustomAlert(message, title = '提示') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-dialog-overlay';
            
            const dialog = document.createElement('div');
            dialog.className = 'custom-dialog';
            
            dialog.innerHTML = `
                <div class="custom-dialog-header">
                    <div class="custom-dialog-title">${title}</div>
                    <button class="custom-dialog-close" type="button">&times;</button>
                </div>
                <div class="custom-dialog-body">${message}</div>
                <div class="custom-dialog-footer">
                    <button class="custom-dialog-btn custom-dialog-btn-primary" type="button">确定</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            const closeDialog = () => {
                overlay.style.animation = 'fadeIn 0.2s ease-in-out reverse';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    resolve();
                }, 200);
            };
            
            // 绑定关闭事件
            const closeBtn = dialog.querySelector('.custom-dialog-close');
            const confirmBtn = dialog.querySelector('.custom-dialog-btn-primary');
            
            closeBtn.addEventListener('click', closeDialog);
            confirmBtn.addEventListener('click', closeDialog);
            
            // 点击遮罩层关闭
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeDialog();
                }
            });
            
            // ESC键关闭
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    closeDialog();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    }
    
    // 显示自定义确认框（替换 confirm）
    showCustomConfirm(message, title = '确认', onConfirm = null, onCancel = null) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-dialog-overlay';
            
            const dialog = document.createElement('div');
            dialog.className = 'custom-dialog';
            
            dialog.innerHTML = `
                <div class="custom-dialog-header">
                    <div class="custom-dialog-title">${title}</div>
                    <button class="custom-dialog-close" type="button">&times;</button>
                </div>
                <div class="custom-dialog-body">${message}</div>
                <div class="custom-dialog-footer">
                    <button class="custom-dialog-btn" type="button">取消</button>
                    <button class="custom-dialog-btn custom-dialog-btn-primary" type="button">确定</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            const closeDialog = (confirmed = false) => {
                overlay.style.animation = 'fadeIn 0.2s ease-in-out reverse';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    if (confirmed) {
                        if (onConfirm) onConfirm();
                        resolve(true);
                    } else {
                        if (onCancel) onCancel();
                        resolve(false);
                    }
                }, 200);
            };
            
            // 绑定关闭事件
            const closeBtn = dialog.querySelector('.custom-dialog-close');
            const cancelBtn = dialog.querySelector('.custom-dialog-btn:not(.custom-dialog-btn-primary)');
            const confirmBtn = dialog.querySelector('.custom-dialog-btn-primary');
            
            closeBtn.addEventListener('click', () => closeDialog(false));
            cancelBtn.addEventListener('click', () => closeDialog(false));
            confirmBtn.addEventListener('click', () => closeDialog(true));
            
            // 点击遮罩层关闭
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeDialog(false);
                }
            });
            
            // ESC键关闭
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    closeDialog(false);
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    }
}
