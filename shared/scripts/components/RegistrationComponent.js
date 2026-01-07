// 配准组件 - 严格按照原来图像处理模块的配准功能
class RegistrationComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            prefix: options.prefix || '',
            onRegistrationSelect: options.onRegistrationSelect || null,
            onSequenceSelect: options.onSequenceSelect || null,
            onFileSelect: options.onFileSelect || null,
            showFileInfo: options.showFileInfo !== false,
            ...options
        };
        this.eventsBound = false; // 标记事件是否已绑定
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        console.log('配准组件render方法被调用，容器ID:', this.containerId);
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('找不到配准组件容器:', this.containerId);
            return;
        }

        console.log('配准组件容器找到，开始渲染...');
        container.innerHTML = `
            <div class="registration-content">
                <div class="registration-cards" id="${this.options.prefix}registrationCards">
                    <!-- 配准卡片将通过JavaScript动态生成 -->
                </div>
            </div>
        `;

        // 生成配准内容
        this.generateRegistrationContent();
    }

    generateRegistrationContent() {
        console.log('生成配准内容，前缀:', this.options.prefix);
        const cardsContainer = document.getElementById(`${this.options.prefix}registrationCards`);
        if (!cardsContainer) {
            console.error('找不到配准卡片容器:', `${this.options.prefix}registrationCards`);
            return;
        }
        console.log('配准卡片容器找到，开始生成内容...');

        // 配准数据 - 严格按照原来图像处理模块的数据结构
        const registrationData = [
            {
                id: 'reg1',
                type: '形变配准',
                timestamp: '2025-07-09 00:21:37',
                primaryImage: {
                    modality: 'CT',
                    sequenceNumber: '1',
                    sequenceDescription: 'CT Scan'
                },
                primaryContour: {
                    name: 'RTStruct 1',
                    sequenceNumber: '1',
                    sequenceDescription: 'RT Structure'
                },
                secondaryImage: {
                    modality: 'CT',
                    sequenceNumber: '2',
                    sequenceDescription: 'CT Scan'
                },
                secondaryContour: {
                    name: 'RTStruct 1',
                    sequenceNumber: '1',
                    sequenceDescription: 'RT Structure'
                },
                description: ''
            },
            {
                id: 'reg2',
                type: '刚性配准',
                timestamp: '2025-05-29 11:35:13',
                primaryImage: {
                    modality: 'CT',
                    sequenceNumber: '2',
                    sequenceDescription: 'CT Scan'
                },
                primaryContour: {
                    name: 'RTStruct 1',
                    sequenceNumber: '1',
                    sequenceDescription: 'RT Structure'
                },
                secondaryImage: {
                    modality: 'CT',
                    sequenceNumber: '1',
                    sequenceDescription: 'CT Scan'
                },
                secondaryContour: {
                    name: 'RTStruct 1',
                    sequenceNumber: '1',
                    sequenceDescription: 'RT Structure'
                },
                description: ''
            }
        ];

        // 渲染配准卡片
        cardsContainer.innerHTML = registrationData.map(reg => this.createRegistrationCard(reg)).join('');
        
        // 绑定事件
        this.bindRegistrationCardEvents();
    }

    // 创建配准卡片HTML - 严格按照原来图像处理模块的结构
    createRegistrationCard(reg) {
        return `
            <div class="registration-card" data-id="${reg.id}">
                <div class="registration-card-header">
                    <div class="registration-header-text">
                        <div class="registration-title">${reg.type}</div>
                        <div class="registration-timestamp">${reg.timestamp}</div>
                    </div>
                    <div class="registration-toggle" title="收起/展开">
                        <i class="fas fa-chevron-up"></i>
                    </div>
                </div>
                
                <div class="registration-info">
                    <div class="registration-info-item">
                        <span class="registration-info-label">主序列图像:</span>
                        <span class="registration-info-value">${reg.primaryImage.modality} ${reg.primaryImage.sequenceNumber}</span>
                    </div>
                    <div class="registration-info-item">
                        <span class="registration-info-label">主序列勾画:</span>
                        <span class="registration-info-value">${reg.primaryContour.name}</span>
                    </div>
                    <div class="registration-info-item">
                        <span class="registration-info-label">次序列图像:</span>
                        <span class="registration-info-value">${reg.secondaryImage.modality} ${reg.secondaryImage.sequenceNumber}</span>
                    </div>
                    <div class="registration-info-item">
                        <span class="registration-info-label">次序列勾画:</span>
                        <span class="registration-info-value">${reg.secondaryContour.name}</span>
                    </div>
                </div>
                
                <div class="registration-description">
                    <div class="registration-description-label">配准描述:</div>
                    <textarea class="registration-description-input" placeholder="请输入配准描述">${reg.description}</textarea>
                </div>
                
                <div class="registration-thumbnails">
                    <div class="thumbnail-item" data-thumbnail-type="primary" data-registration-id="${reg.id}">
                        <div class="thumbnail-image">
                            <img src="${this.createMedicalImageThumbnail('primary')}" alt="主序列图像" />
                        </div>
                    </div>
                    <div class="thumbnail-item" data-thumbnail-type="secondary" data-registration-id="${reg.id}">
                        <div class="thumbnail-image">
                            <img src="${this.createMedicalImageThumbnail('secondary')}" alt="次序列图像" />
                        </div>
                    </div>
                    <div class="thumbnail-item" data-thumbnail-type="fused" data-registration-id="${reg.id}">
                        <div class="thumbnail-image">
                            <img src="${this.createMedicalImageThumbnail('fused')}" alt="融合图像" />
                        </div>
                    </div>
                </div>
                
                <div class="registration-actions">
                    <div class="registration-action-buttons">
                        <button class="registration-action-btn" title="导出配准">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="registration-action-btn" title="生成图像">
                            <i class="fas fa-image"></i>
                        </button>
                        <button class="registration-action-btn" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 绑定配准卡片事件
        this.bindRegistrationCardEvents();
    }

    // 绑定配准卡片事件 - 使用事件委托，更可靠
    bindRegistrationCardEvents() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('找不到配准组件容器:', this.containerId);
            return;
        }
        
        // 如果事件已经绑定过，先移除旧的事件监听器
        if (this.eventsBound) {
            return; // 如果已经绑定过，不再重复绑定
        }
        
        // 使用事件委托，在容器级别绑定事件
        this.handleContainerClick = (e) => {
            // 折叠按钮点击 - 检查点击的是按钮本身还是内部的图标
            let toggle = e.target.closest('.registration-toggle');
            // 如果点击的是图标，向上查找按钮
            if (!toggle && e.target.tagName === 'I' && e.target.closest('.registration-card')) {
                const card = e.target.closest('.registration-card');
                toggle = card.querySelector('.registration-toggle');
            }
            
            if (toggle) {
                e.stopPropagation();
                e.preventDefault();
                const card = toggle.closest('.registration-card');
                if (card) {
                    console.log('折叠按钮被点击');
                    this.toggleRegistrationCard(card);
                }
                return;
            }
            
            // 缩略图点击
            const thumbnail = e.target.closest('.thumbnail-item');
            if (thumbnail) {
                e.stopPropagation();
                const card = thumbnail.closest('.registration-card');
                if (card) {
                    const registrationId = card.dataset.id;
                    const thumbnailType = thumbnail.dataset.thumbnailType;
                    
                    // 调用原有的处理函数
                    const label = thumbnail.querySelector('.thumbnail-label')?.textContent;
                    if (label) {
                        this.handleThumbnailClick(registrationId, label);
                    }
                }
                return;
            }
            
            // 操作按钮点击
            const actionBtn = e.target.closest('.registration-action-btn');
            if (actionBtn) {
                e.stopPropagation();
                const card = actionBtn.closest('.registration-card');
                if (card) {
                    const title = actionBtn.getAttribute('title');
                    if (title) {
                        this.handleActionButtonClick(card.dataset.id, title);
                    }
                }
                return;
            }
        };
        
        this.handleContainerInput = (e) => {
            const descriptionInput = e.target.closest('.registration-description-input');
            if (descriptionInput) {
                const card = descriptionInput.closest('.registration-card');
                if (card) {
                    this.updateRegistrationDescription(card.dataset.id, descriptionInput.value);
                }
            }
        };
        
        container.addEventListener('click', this.handleContainerClick);
        container.addEventListener('input', this.handleContainerInput);
        
        this.eventsBound = true;
    }

    // 切换配准卡片收起展开
    toggleRegistrationCard(card) {
        const isCollapsed = card.classList.contains('collapsed');
        
        if (isCollapsed) {
            card.classList.remove('collapsed');
        } else {
            card.classList.add('collapsed');
        }
        
        // 更新图标
        const toggleIcon = card.querySelector('.registration-toggle i');
        if (toggleIcon) {
            toggleIcon.className = isCollapsed ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
        }
    }

    // 更新配准描述
    updateRegistrationDescription(registrationId, description) {
        console.log(`更新配准描述: ${registrationId}, ${description}`);
        // 这里可以添加保存到后端的逻辑
    }

    // 切换缩略图选中状态
    toggleThumbnailSelection(card, clickedThumbnail) {
        // 获取当前卡片内的所有缩略图
        const allThumbnails = card.querySelectorAll('.thumbnail-item');
        
        // 如果点击的缩略图已经选中，则取消选中；否则选中它并取消其他
        const isSelected = clickedThumbnail.classList.contains('selected');
        
        if (isSelected) {
            // 取消选中
            clickedThumbnail.classList.remove('selected');
        } else {
            // 先取消所有缩略图的选中状态
            allThumbnails.forEach(thumb => thumb.classList.remove('selected'));
            // 选中当前点击的缩略图
            clickedThumbnail.classList.add('selected');
        }
    }

    // 处理缩略图点击
    handleThumbnailClick(registrationId, thumbnailType) {
        console.log(`查看配准缩略图: ${registrationId}, ${thumbnailType}`);
        // 这里可以添加查看逻辑
    }

    // 处理操作按钮点击
    handleActionButtonClick(registrationId, action) {
        console.log(`配准操作: ${action}, ID: ${registrationId}`);
        
        if (action === '导出配准') {
            // 显示导出配准对话框
            this.showExportModal(registrationId);
        } else if (action === '生成图像') {
            // 显示生成图像对话框
            this.showGenerateImageModal(registrationId);
        } else if (action === '删除') {
            // 删除配准
            this.deleteRegistration(registrationId);
        }
    }

    // 显示导出配准对话框
    showExportModal(registrationId) {
        console.log(`显示导出配准对话框: ${registrationId}`);
        // 这里可以添加导出配准的逻辑
    }

    // 显示生成图像对话框
    showGenerateImageModal(registrationId) {
        console.log(`显示生成图像对话框: ${registrationId}`);
        // 这里可以添加生成图像的逻辑
    }

    // 删除配准
    deleteRegistration(registrationId) {
        console.log(`删除配准: ${registrationId}`);
        // 这里可以添加删除配准的逻辑
    }

    // 创建医学影像缩略图（灰度样式，类似真实CT截图）
    createMedicalImageThumbnail(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        
        // 黑色背景
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 60, 40);
        
        const centerX = 30;
        const centerY = 20;
        
        // 根据类型生成不同的图像样式
        if (type === 'primary') {
            // 主序列图像 - 模拟头部CT
            this.drawCTSlice(ctx, centerX, centerY, 18, 0.8);
        } else if (type === 'secondary') {
            // 次序列图像 - 稍微不同的角度/位置
            this.drawCTSlice(ctx, centerX, centerY, 18, 0.7);
        } else if (type === 'fused') {
            // 融合图像 - 两个图像的叠加效果
            this.drawCTSlice(ctx, centerX, centerY, 18, 0.8);
            this.drawCTSlice(ctx, centerX + 2, centerY - 1, 16, 0.5);
        }
        
        return canvas.toDataURL('image/png');
    }

    // 绘制CT切片（灰度样式）
    drawCTSlice(ctx, centerX, centerY, radius, opacity) {
        // 绘制颅骨轮廓（高亮白色）
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 绘制大脑组织（中等灰度）
        ctx.fillStyle = `rgba(120, 120, 120, ${opacity * 0.6})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加一些内部结构（模拟脑组织）
        ctx.fillStyle = `rgba(80, 80, 80, ${opacity * 0.4})`;
        ctx.beginPath();
        ctx.arc(centerX - 5, centerY - 3, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + 4, centerY + 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加一些细节纹理（模拟CT扫描的噪声）
        for (let i = 0; i < 8; i++) {
            const x = centerX + (Math.random() - 0.5) * radius * 1.2;
            const y = centerY + (Math.random() - 0.5) * radius * 1.2;
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (dist < radius - 2) {
                const gray = 100 + Math.random() * 40;
                ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${opacity * 0.3})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

// 将RegistrationComponent注册到全局对象
if (typeof window !== 'undefined') {
    window.RegistrationComponent = RegistrationComponent;
}
