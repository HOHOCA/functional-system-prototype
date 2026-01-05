// 患者数据
const patientData = [
    {
        id: '0000576304',
        name: 'Dong,Wuping',
        gender: 'M',
        birthDate: '1973-03-07',
        age: '52',
        doctor: 'None',
        physicist: 'None',
        importTime: '2019.17.21 13:23:12',
        saveTime: '2019.17.21 13:23:12',
        remarks: 'Y0139-RECTUM'
    },
    {
        id: '2453369',
        name: 'Li Shan',
        gender: 'F',
        birthDate: '1976-06-13',
        age: '48',
        doctor: 'Dr. Wang',
        physicist: 'Dr. Chen',
        importTime: '2019.01.14 10:30:15',
        saveTime: '2019.01.14 14:45:30',
        remarks: '印度数据'
    },
    {
        id: '0001393953',
        name: 'Patient A',
        gender: 'M',
        birthDate: '1980-05-20',
        age: '44',
        doctor: 'None',
        physicist: 'None',
        importTime: '2019.17.21 13:23:12',
        saveTime: '2019.17.21 13:23:12',
        remarks: ''
    },
    {
        id: '0000593569',
        name: 'Patient B',
        gender: 'F',
        birthDate: '1975-12-10',
        age: '49',
        doctor: 'Dr. Liu',
        physicist: 'Dr. Zhang',
        importTime: '2019.17.21 13:23:12',
        saveTime: '2019.17.21 13:23:12',
        remarks: ''
    },
    {
        id: '1234',
        name: 'Test Patient',
        gender: 'M',
        birthDate: '1990-01-01',
        age: '34',
        doctor: 'None',
        physicist: 'None',
        importTime: '2019.17.21 13:23:12',
        saveTime: '2019.17.21 13:23:12',
        remarks: ''
    }
];

// 当前选中的患者
let selectedPatient = null;
let selectedRow = null;

// DOM 元素
const searchInput = document.getElementById('searchInput');
const patientTableBody = document.getElementById('patientTableBody');
const contextMenu = document.getElementById('contextMenu');

// 全局组件实例
let sequenceTree = null;
let registrationPanel = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePatientTable();
    initializeEventListeners();
    initializeComponents();
    initializeRightTabs();
    initializeModuleNavigation();
    initializeImportModal();
    initializeNavIcons();
    
    // 初始化各模块的组件
    initPatientSequenceComponent();
    initPatientRegistrationComponent();
    initImageSequenceComponent();
    initImageROIComponent();
    initImagePOIComponent();
    initImageRegistrationComponent();
    
    // 检查SPR勾画组件是否加载
    setTimeout(() => {
        console.log('检查组件加载状态...');
        console.log('SPRDelineationComponent:', typeof window.SPRDelineationComponent);
        if (typeof window.SPRDelineationComponent === 'undefined') {
            console.error('SPRDelineationComponent未加载！请检查组件文件路径是否正确');
        }
    }, 500);
    
    // 延迟初始化配准组件，确保DOM完全加载
    setTimeout(() => {
        console.log('延迟初始化配准组件...');
        initImageRegistrationComponent();
    }, 1000);
});

// 初始化导航栏图标按钮
function initializeNavIcons() {
    // 工作流按钮
    const workflowBtn = document.getElementById('navWorkflowBtn');
    if (workflowBtn) {
        workflowBtn.addEventListener('click', () => {
            console.log('工作流');
            handleWorkflow();
        });
    }

    // 导入按钮
    const importBtn = document.getElementById('navImportBtn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            console.log('导入');
            handleImport();
        });
    }

    // 导出按钮
    const exportBtn = document.getElementById('navExportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            console.log('导出');
            handleExport();
        });
    }

    // 保存按钮
    const saveBtn = document.getElementById('navSaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            console.log('保存');
            handleSave();
        });
    }

    // 关闭按钮
    const closeBtn = document.getElementById('navCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            console.log('关闭');
            handleClose();
        });
    }

    // 撤销按钮
    const undoBtn = document.getElementById('navUndoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            console.log('撤销');
            handleUndo();
        });
    }

    // 恢复按钮
    const redoBtn = document.getElementById('navRedoBtn');
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            console.log('恢复');
            handleRedo();
        });
    }

    // 设置按钮
    const settingsBtn = document.getElementById('navSettingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            console.log('设置');
            handleSettings();
        });
    }
}

// 导航栏按钮处理函数
function handleWorkflow() {
    // 工作流功能
    alert('工作流功能待实现');
}

function handleImport() {
    // 导入功能
    alert('导入功能待实现');
}

// 导出计划组件实例
let exportPlanComponent = null;

function handleExport() {
    console.log('打开导出计划弹窗');
    
    // 检查组件是否已加载
    if (typeof window.ExportPlanComponent === 'undefined') {
        console.error('ExportPlanComponent未加载！请检查组件文件路径是否正确');
        alert('导出计划组件未加载，请刷新页面重试');
        return;
    }
    
    // 创建或获取组件实例
    if (!exportPlanComponent) {
        exportPlanComponent = new window.ExportPlanComponent({
            prefix: 'exportPlan',
            onClose: () => {
                console.log('导出计划弹窗已关闭');
                exportPlanComponent = null;
            },
            onExport: (config) => {
                console.log('执行导出:', config);
                // TODO: 实现实际的导出逻辑
                alert('导出功能待实现');
            }
        });
    }
    
    // 显示弹窗
    exportPlanComponent.show();
}

function handleSave() {
    // 保存功能
    alert('保存功能待实现');
}

function handleClose() {
    // 关闭功能
    if (confirm('确定要关闭当前页面吗？')) {
        // 可以在这里添加关闭逻辑
        console.log('关闭页面');
    }
}

function handleUndo() {
    // 撤销功能
    console.log('执行撤销操作');
    // 可以在这里添加撤销逻辑
}

function handleRedo() {
    // 恢复功能
    console.log('执行恢复操作');
    // 可以在这里添加恢复逻辑
}

// 设置弹窗实例
let settingsModal = null;

function handleSettings() {
    // 设置功能
    if (!window.SettingsModalComponent) {
        console.error('SettingsModalComponent not loaded');
        alert('设置组件未加载');
        return;
    }

    if (!settingsModal) {
        settingsModal = new window.SettingsModalComponent();
    }
    
    settingsModal.show();
}

// 初始化患者表格
function initializePatientTable() {
    renderPatientTable(patientData);
}

// 渲染患者表格
function renderPatientTable(patients) {
    patientTableBody.innerHTML = '';
    
    let firstRow = null;
    
    patients.forEach((patient, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><i class="fas fa-folder"></i></td>
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.gender}</td>
            <td>${patient.birthDate}</td>
            <td>${patient.age}</td>
            <td>${patient.doctor}</td>
            <td>${patient.physicist}</td>
            <td>${patient.importTime}</td>
            <td>${patient.saveTime}</td>
            <td>${patient.remarks}</td>
        `;
        
        // 添加点击事件
        row.addEventListener('click', function(e) {
            e.stopPropagation();
            selectPatient(row, patient, index);
        });
        
        // 添加右键菜单事件
        row.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showContextMenu(e, patient);
        });
        
        patientTableBody.appendChild(row);
        
        // 保存第一行引用
        if (index === 0) {
            firstRow = row;
        }
    });
    
    // 默认选中第一个患者
    if (firstRow && patients.length > 0) {
        selectPatient(firstRow, patients[0], 0);
        
        // 延迟选中序列树中的第一个图像
        setTimeout(() => {
            selectFirstImageInSequenceTree();
        }, 500);
    }
}

// 选择患者
function selectPatient(row, patient, index) {
    // 移除之前选中的行
    if (selectedRow) {
        selectedRow.classList.remove('selected');
    }
    
    // 选中当前行
    row.classList.add('selected');
    selectedRow = row;
    selectedPatient = patient;
    
    // 更新右侧面板的患者信息
    updatePatientSummary(patient);
}

// 更新患者摘要
function updatePatientSummary(patient) {
    const patientSummary = document.querySelector('.patient-summary');
    patientSummary.innerHTML = `
        <h3>${patient.name} (ID:${patient.id})</h3>
        <p>${patient.birthDate} ${patient.gender}</p>
    `;
}

// 显示右键菜单
function showContextMenu(event, patient) {
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
    
    // 添加菜单项点击事件
    const menuItems = contextMenu.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.onclick = function() {
            const action = this.textContent;
            handleContextMenuAction(action, patient);
            hideContextMenu();
        };
    });
}

// 隐藏右键菜单
function hideContextMenu() {
    contextMenu.style.display = 'none';
}

// 处理右键菜单操作
function handleContextMenuAction(action, patient) {
    switch(action) {
        case '编辑':
            editPatient(patient);
            break;
        case '删除':
            deletePatient(patient);
            break;
    }
}

// 编辑患者
function editPatient(patient) {
    alert(`编辑患者: ${patient.name} (${patient.id})`);
}

// 删除患者
function deletePatient(patient) {
    if (confirm(`确定要删除患者 ${patient.name} (${patient.id}) 吗？`)) {
        const index = patientData.findIndex(p => p.id === patient.id);
        if (index > -1) {
            patientData.splice(index, 1);
            renderPatientTable(patientData);
            if (selectedPatient && selectedPatient.id === patient.id) {
                selectedPatient = null;
                selectedRow = null;
                document.querySelector('.patient-summary').innerHTML = `
                    <h3>请选择患者</h3>
                    <p>从左侧列表中选择一个患者查看详情</p>
                `;
            }
        }
    }
}

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredPatients = patientData.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm) || 
            patient.id.toLowerCase().includes(searchTerm)
        );
        renderPatientTable(filteredPatients);
    });
    
    // 清除搜索
    document.querySelector('.clear-icon').addEventListener('click', function() {
        searchInput.value = '';
        renderPatientTable(patientData);
    });
    
    // 刷新
    document.querySelector('.refresh-icon').addEventListener('click', function() {
        renderPatientTable(patientData);
    });
    
    // 点击其他地方隐藏右键菜单
    document.addEventListener('click', hideContextMenu);
    
    // 分页按钮
    initializePagination();
    
    // 操作按钮
    initializeActionButtons();
}

// 初始化分页
function initializePagination() {
    const pageButtons = document.querySelectorAll('.page-btn');
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            pageButtons.forEach(btn => btn.classList.remove('active'));
            // 给当前按钮添加active类
            this.classList.add('active');
        });
    });
}

// 初始化操作按钮
function initializeActionButtons() {
    // 导入按钮
    document.querySelector('.btn-primary').addEventListener('click', function() {
        alert('导入功能');
    });
    
    // 导出按钮
    const exportBtn = document.querySelectorAll('.btn-secondary')[0];
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            handleExport();
        });
    }
    
    // 删除按钮
    document.querySelector('.btn-danger').addEventListener('click', function() {
        if (selectedPatient) {
            deletePatient(selectedPatient);
        } else {
            alert('请先选择一个患者');
        }
    });
    
    // 编辑按钮
    document.querySelectorAll('.btn-secondary')[1].addEventListener('click', function() {
        if (selectedPatient) {
            editPatient(selectedPatient);
        } else {
            alert('请先选择一个患者');
        }
    });
    
    // 解析按钮
    document.querySelectorAll('.btn-secondary')[2].addEventListener('click', function() {
        alert('解析功能');
    });
}

// 初始化组件
function initializeComponents() {
    // 初始化序列树组件
    if (document.getElementById('sequenceTree')) {
        sequenceTree = new SequenceTree('sequenceTree', {
            showFileInfo: true,
            enableSelection: true,
            enableExpandCollapse: true
        });
        
        // 监听序列树事件
        document.getElementById('sequenceTree').addEventListener('sequenceTreeItemSelected', function(e) {
            // 序列树项目选中处理
            updateFileInfo(e.detail.name);
        });
        
        // 监听4D播放器事件
        document.getElementById('sequenceTree').addEventListener('4DPlayerRequested', function(e) {
            // 4D播放器请求处理
            show4DPlayer(e.detail);
        });
    }
    
    // 初始化配准面板组件
    if (document.getElementById('registrationContent')) {
        registrationPanel = new RegistrationPanel('registrationContent', {
            showMainSequence: true,
            showSubSequence: true,
            enableAddRemove: true
        });
        
        // 监听配准面板事件
        document.getElementById('registrationContent').addEventListener('registrationRequested', function(e) {
            // 配准请求处理
            alert(`开始配准次序列-${e.detail.subSequenceIndex}`);
        });
        
        document.getElementById('registrationContent').addEventListener('registrationDataChanged', function(e) {
            // 配准数据变化处理
        });
    }
    
    // 打开按钮
    document.querySelector('.btn-open').addEventListener('click', function() {
        const selectedTreeItem = document.querySelector('.tree-item.selected');
        if (selectedTreeItem) {
            const fileName = selectedTreeItem.querySelector('span').textContent;
            alert(`打开文件: ${fileName}`);
        } else {
            alert('请先选择一个文件');
        }
    });
}

// 切换树项展开/折叠状态
function toggleTreeItem(item) {
    if (item.classList.contains('collapsed')) {
        item.classList.remove('collapsed');
        item.classList.add('expanded');
        const chevronIcon = item.querySelector('.fa-chevron-right');
        if (chevronIcon) {
            chevronIcon.classList.remove('fa-chevron-right');
            chevronIcon.classList.add('fa-chevron-down');
        }
    } else if (item.classList.contains('expanded')) {
        item.classList.remove('expanded');
        item.classList.add('collapsed');
        const chevronIcon = item.querySelector('.fa-chevron-down');
        if (chevronIcon) {
            chevronIcon.classList.remove('fa-chevron-down');
            chevronIcon.classList.add('fa-chevron-right');
        }
    }
}

// 更新文件信息
function updateFileInfo(fileName) {
    const fileInfo = {
        'CT-1-2019-01-14': {
            modality: 'CT',
            layers: '102',
            captureDate: '2019.01.03',
            captureTime: '17:02:12',
            sequenceNumber: '3',
            sequenceId: '38467.39468.342',
            sequenceDescription: 'HearCewity'
        },
        'RTstruct-1-2019-01-14': {
            modality: 'RTstruct',
            layers: '1',
            captureDate: '2019.01.14',
            captureTime: '10:30:15',
            sequenceNumber: '1',
            sequenceId: '38467.39468.343',
            sequenceDescription: 'RT Structure'
        },
        'Plan-1-2019-01-14': {
            modality: 'Plan',
            layers: '1',
            captureDate: '2019.01.14',
            captureTime: '14:45:30',
            sequenceNumber: '1',
            sequenceId: '38467.39468.344',
            sequenceDescription: 'Treatment Plan'
        },
        'QAPlan-1-2019-01-14': {
            modality: 'QAPlan',
            layers: '1',
            captureDate: '2019.01.14',
            captureTime: '16:20:45',
            sequenceNumber: '1',
            sequenceId: '38467.39468.345',
            sequenceDescription: 'QA Plan'
        }
    };
    
    const info = fileInfo[fileName] || {
        modality: 'Unknown',
        layers: '0',
        captureDate: 'N/A',
        captureTime: 'N/A',
        sequenceNumber: 'N/A',
        sequenceId: 'N/A',
        sequenceDescription: 'N/A'
    };
    
    const infoGrid = document.querySelector('.info-grid');
    infoGrid.innerHTML = `
        <div class="info-item">
            <span class="label">图像模态</span>
            <span class="value">${info.modality}</span>
        </div>
        <div class="info-item">
            <span class="label">图像层数</span>
            <span class="value">${info.layers}</span>
        </div>
        <div class="info-item">
            <span class="label">拍摄日期</span>
            <span class="value">${info.captureDate}</span>
        </div>
        <div class="info-item">
            <span class="label">拍摄时间</span>
            <span class="value">${info.captureTime}</span>
        </div>
        <div class="info-item">
            <span class="label">序列号</span>
            <span class="value">${info.sequenceNumber}</span>
        </div>
        <div class="info-item">
            <span class="label">序列ID</span>
            <span class="value">${info.sequenceId}</span>
        </div>
        <div class="info-item">
            <span class="label">序列描述</span>
            <span class="value">${info.sequenceDescription}</span>
        </div>
    `;
}

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // ESC 键隐藏右键菜单
    if (e.key === 'Escape') {
        hideContextMenu();
    }
    
    // Delete 键删除选中的患者
    if (e.key === 'Delete' && selectedPatient) {
        deletePatient(selectedPatient);
    }
});

// 窗口控制按钮
document.querySelectorAll('.window-control-btn').forEach((btn) => {
    btn.addEventListener('click', function() {
        if (this.classList.contains('close-btn')) {
            // 关闭窗口
            if (confirm('确定要关闭应用程序吗？')) {
                window.close();
            }
        } else {
            // 最小化窗口
            alert('最小化窗口');
        }
    });
});

// 初始化右侧标签页
function initializeRightTabs() {
    const tabItems = document.querySelectorAll('.tab-item');
    const sequenceTree = document.getElementById('patientSequenceContainer');
    const registrationContent = document.getElementById('patientRegistrationContainer');
    const fileInfo = document.getElementById('fileInfo');
    const openSection = document.getElementById('openSection');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有active类
            tabItems.forEach(t => t.classList.remove('active'));
            
            // 添加active类到当前项
            this.classList.add('active');
            
            // 切换内容显示
            const tabType = this.getAttribute('data-tab');
            if (tabType === 'sequence') {
                if (sequenceTree) sequenceTree.style.display = 'block';
                if (registrationContent) registrationContent.style.display = 'none';
                // 显示文件信息和打开按钮
                if (fileInfo) fileInfo.style.display = 'block';
                if (openSection) openSection.style.display = 'block';
            } else if (tabType === 'registration') {
                if (sequenceTree) sequenceTree.style.display = 'none';
                if (registrationContent) registrationContent.style.display = 'block';
                // 隐藏文件信息和打开按钮
                if (fileInfo) fileInfo.style.display = 'none';
                if (openSection) openSection.style.display = 'none';
                // 初始化配准组件
                console.log('患者管理界面切换到配准标签页');
                initPatientRegistrationComponent();
            }
        });
    });
}

// 初始化模块导航
function initializeModuleNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有active类
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 添加active类到当前项
            this.classList.add('active');
            
            // 获取模块类型
            const module = this.getAttribute('data-module');
            
            // 切换模块内容
            switchModule(module);
        });
    });
}

// 切换模块
function switchModule(module) {
    // 切换到指定模块
    
    // 隐藏所有内容区域
    hideAllContent();
    
    // 根据模块类型显示对应内容
    switch(module) {
        case 'patient':
            // 显示患者管理模块
            showPatientManagement();
            break;
        case 'image':
            // 显示图像处理模块
            showImageProcessing();
            break;
        case 'target':
            // 显示靶区勾画模块
            showTargetDelineation();
            break;
        case 'plan':
            // 显示计划设计模块
            showPlanDesign();
            break;
        case 'optimization':
            // 显示计划优化模块
            showPlanOptimization();
            break;
        case 'evaluation':
            // 显示计划评估模块
            showPlanEvaluation();
            break;
        case 'qa':
            // 显示计划QA模块
            showPlanQA();
            break;
        default:
            // 未知模块
    }
}

// 隐藏所有内容区域
function hideAllContent() {
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    const imageProcessingContent = document.getElementById('imageProcessingContent');
    const imageProcessingToolbar = document.getElementById('imageProcessingToolbar');
    const targetDelineationContent = document.getElementById('targetDelineationContent');
    const targetDelineationToolbar = document.getElementById('targetDelineationToolbar');
    const planDesignContent = document.getElementById('planDesignContent');
    const planDesignToolbar = document.getElementById('planDesignToolbar');
    const planOptimizationContent = document.getElementById('planOptimizationContent');
    const planEvaluationContent = document.getElementById('planEvaluationContent');
    const planQAContent = document.getElementById('planQAContent');
    
    if (leftPanel) leftPanel.style.display = 'none';
    if (rightPanel) rightPanel.style.display = 'none';
    if (imageProcessingContent) imageProcessingContent.style.display = 'none';
    if (imageProcessingToolbar) imageProcessingToolbar.style.display = 'none';
    if (targetDelineationContent) targetDelineationContent.style.display = 'none';
    if (targetDelineationToolbar) targetDelineationToolbar.style.display = 'none';
    if (planDesignContent) planDesignContent.style.display = 'none';
    if (planDesignToolbar) planDesignToolbar.style.display = 'none';
    if (planOptimizationContent) planOptimizationContent.style.display = 'none';
    if (planEvaluationContent) planEvaluationContent.style.display = 'none';
    if (planQAContent) planQAContent.style.display = 'none';
}

// 显示患者管理
function showPatientManagement() {
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    
    if (leftPanel) leftPanel.style.display = 'flex';
    if (rightPanel) rightPanel.style.display = 'flex';
    
    // 恢复患者管理界面的序列树显示
    const patientSequenceTree = document.querySelector('.file-tree');
    if (patientSequenceTree) {
        patientSequenceTree.style.display = 'block';
    }
}

// 显示图像处理
function showImageProcessing() {
    const imageProcessingContent = document.getElementById('imageProcessingContent');
    const imageProcessingToolbar = document.getElementById('imageProcessingToolbar');
    
    if (imageProcessingContent) imageProcessingContent.style.display = 'flex';
    if (imageProcessingToolbar) imageProcessingToolbar.style.display = 'flex';
    
    // 初始化图像处理工具栏
    initializeImageProcessingToolbar();
    // 初始化工具栏展开收起功能
    initializeToolbarToggle();
    // 初始化图像处理界面垂直导航按钮
    initializeImageVerticalNav();
    // 初始化POI控制面板
    initializePOIPanel();
    // 初始化图像信息显示
    initializeImageInfoDisplay();
    // 初始化图像处理序列树（确保默认显示序列树）
    initializeImageSequenceTree();
    // 初始化ROI面板功能
    initializeROIPanel();
    
    // 隐藏患者管理界面的序列树
    const patientSequenceTree = document.querySelector('.file-tree');
    if (patientSequenceTree) {
        patientSequenceTree.style.display = 'none';
    }
}

// 显示靶区勾画
function showTargetDelineation() {
    // 隐藏所有内容
    hideAllContent();
    
    // 显示靶区勾画内容
    const targetDelineationContent = document.getElementById('targetDelineationContent');
    const targetDelineationToolbar = document.getElementById('targetDelineationToolbar');
    
    if (targetDelineationContent) {
        targetDelineationContent.style.display = 'flex';
    }
    
    if (targetDelineationToolbar) {
        targetDelineationToolbar.style.display = 'block';
    }
    
    // 初始化靶区勾画模块（包含工具栏初始化）
    initTargetDelineationModule();
}

// 显示计划设计
function showPlanDesign() {
    // 隐藏其他内容
    hideAllContent();
    // 显示计划设计内容与工具栏
    const planDesignContent = document.getElementById('planDesignContent');
    const planDesignToolbar = document.getElementById('planDesignToolbar');
    if (planDesignContent) planDesignContent.style.display = 'flex';
    if (planDesignToolbar) planDesignToolbar.style.display = 'block';
    // 初始化工具栏展开收起功能
    initializeModuleToolbarToggle('planDesignToolbar', 'planToolbarToggleBtn', '.plan-image-area');
    // 初始化左侧栏导航切换
    initializePlanVerticalNav();
    // 轻量交互：2D/3D、BEV/DVH、底部tabs
    initializePlanSimpleTabs();
    // 同步工具栏位置和宽度以占满左侧栏右侧区域
    syncPlanToolbarPosition();
    if (!window.__planToolbarResizeBound) {
        window.__planToolbarResizeBound = true;
        window.addEventListener('resize', syncPlanToolbarPosition);
    }
    // 初始化中央区域左右分割拖拽
    initializePlanImageSplitter();
}

// 计划设计：2D/3D、BEV/DVH、底部Tabs
function initializePlanSimpleTabs() {
    // 2D/3D toggle
    const toggle = document.getElementById('plan2d3dToggle');
    if (toggle && !toggle.dataset.bound) {
        toggle.dataset.bound = 'true';
        toggle.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                toggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // 占位：根据模式切换右侧渲染
            });
        });
    }
    // BEV/DVH tabs
    const bevTabs = document.getElementById('planBevDvhTabs');
    if (bevTabs && !bevTabs.dataset.bound) {
        bevTabs.dataset.bound = 'true';
        const panels = {
            bev: document.getElementById('planBevPanel'),
            dvh: document.getElementById('planDvhPanel')
        };
        bevTabs.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                bevTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const key = tab.getAttribute('data-tab');
                Object.values(panels).forEach(p => p && p.classList.remove('active'));
                if (panels[key]) panels[key].classList.add('active');
                
                // 如果是BEV视图，初始化BEV组件
                if (key === 'bev') {
                    setTimeout(() => {
                        initializePlanDesignBEVView();
                    }, 50);
                }
                // 如果是DVH视图，初始化DVH组件
                else if (key === 'dvh') {
                    setTimeout(() => {
                        initializePlanDesignDVHView();
                    }, 50);
                }
            });
        });
    }
    // Bottom tabs
    const bottomTabs = document.getElementById('planBottomTabs');
    if (bottomTabs && !bottomTabs.dataset.bound) {
        bottomTabs.dataset.bound = 'true';
        const contents = {
            beamList: document.getElementById('planBeamList'),
            clinicalTargets: document.getElementById('planClinicalTargets'),
            doseStats: document.getElementById('planDoseStats'),
            energyLayers: document.getElementById('planEnergyLayers')
        };
        bottomTabs.querySelectorAll('.bottom-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                bottomTabs.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                Object.values(contents).forEach(c => c && c.classList.remove('active'));
                const key = tab.getAttribute('data-tab');
                if (contents[key]) contents[key].classList.add('active');
                if (key === 'beamList') initializeBeamListComponent();
                if (key === 'doseStats') initPlanDesignDoseStatsComponent();
            });
        });
        // 默认初始化一次射束列表
        initializeBeamListComponent();
    }
    
    // 如果BEV标签是激活的，初始化BEV视图
    const bevPanel = document.getElementById('planBevPanel');
    if (bevPanel && bevPanel.classList.contains('active')) {
        setTimeout(() => {
            initializePlanDesignBEVView();
        }, 200);
    }
}

function initializeBeamListComponent() {
    const mount = document.getElementById('beamListContainer');
    if (!mount) return;
    if (mount.dataset.inited === 'true') return;
    if (window.BeamListComponent) {
        new window.BeamListComponent(mount, {
            getROIList: () => {
                // 从ROI组件获取ROI列表
                const roiContainer = document.getElementById('roiContainer');
                if (!roiContainer) return [];
                
                const roiItems = roiContainer.querySelectorAll('.roi-item');
                const roiList = [];
                roiItems.forEach(item => {
                    const roiName = item.getAttribute('data-roi') || item.querySelector('.roi-name')?.textContent;
                    if (roiName) {
                        // 获取ROI的分类（target, non-target等）
                        const category = item.closest('.roi-category')?.getAttribute('data-category') || '';
                        // 获取ROI类型（如果有）
                        const typeIcon = item.querySelector('.roi-type-icon');
                        let roiType = '';
                        if (typeIcon) {
                            // 根据图标或其他方式判断类型
                            // 这里简化处理，实际应该从数据获取
                        }
                        roiList.push({ 
                            name: roiName,
                            category: category,
                            type: roiType
                        });
                    }
                });
                return roiList;
            },
            getSelectedTarget: () => {
                // 获取新建计划所选靶区
                // 这里应该从计划数据获取，暂时返回null
                return null;
            }
        });
        mount.dataset.inited = 'true';
    } else {
        console.warn('BeamListComponent not loaded yet');
    }
}

// 使计划设计工具栏与左侧栏右侧区域等宽，中央区域自然占满
function syncPlanToolbarPosition() {
    const toolbar = document.getElementById('planDesignToolbar');
    const leftPanel = document.getElementById('planLeftPanel');
    if (!toolbar || !leftPanel) return;
    const leftWidth = leftPanel.getBoundingClientRect().width || 0;
    toolbar.style.left = leftWidth + 'px';
    toolbar.style.width = `calc(100vw - ${leftWidth}px)`;
}

// 计划设计中央区域左右分割拖拽
function initializePlanImageSplitter() {
    const container = document.querySelector('#planDesignContent .plan-image-area');
    const resizer = document.getElementById('planImageResizer');
    const left = document.getElementById('planTriViews');
    const right = document.getElementById('planSidePanel');
    if (!container || !resizer || !left || !right) return;
    if (resizer.dataset.bound === 'true') return;
    resizer.dataset.bound = 'true';
    let isResizing = false;
    let startX = 0;
    let containerWidth = 0;
    let startLeftWidth = 0;
    const minPercent = 20; // 左右最小占比
    const maxPercent = 80;

    const onMouseDown = (e) => {
        isResizing = true;
        startX = e.clientX;
        containerWidth = container.getBoundingClientRect().width;
        startLeftWidth = left.getBoundingClientRect().width;
        container.classList.add('resizing');
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!isResizing) return;
        const delta = e.clientX - startX;
        const newLeft = startLeftWidth + delta;
        let percent = (newLeft / containerWidth) * 100;
        if (percent < minPercent) percent = minPercent;
        if (percent > maxPercent) percent = maxPercent;
        left.style.flex = `0 0 ${percent}%`;
        right.style.flex = `0 0 ${100 - percent}%`;
    };

    const onMouseUp = () => {
        isResizing = false;
        container.classList.remove('resizing');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    resizer.addEventListener('mousedown', onMouseDown);
}

// 显示计划优化
function showPlanOptimization() {
    hideAllContent();
    const container = document.getElementById('planOptimizationContent');
    const toolbar = document.getElementById('planOptimizationToolbar');
    if (container) container.style.display = 'flex';
    if (toolbar) toolbar.style.display = 'block';
    // 初始化工具栏展开收起功能
    initializeModuleToolbarToggle('planOptimizationToolbar', 'optToolbarToggleBtn', '.plan-image-area');
    // 初始化左侧栏导航切换
    initializeOptimizationVerticalNav();
    initializeOptimizationTabs();
    initializeOptimizationConstraints();
    initializeRobustnessSettings();
    initializeOptimization2DView();
    initializeOptimizationBeamList();
    initializeOptimizationEnergyLayer();
    initializeOptimizationBeamSettings();
    initializeOptimizationToolbar();
}

// 计划优化：视图与底部标签初始化
function initializeOptimizationTabs() {
    // 左侧视图 tabs
    const viewTabs = document.querySelectorAll('#planOptimizationContent .view-tab');
    const viewMap = {
        opt2d: document.getElementById('opt2d-view'),
        opt3d: document.getElementById('opt3d-view'),
        optbev: document.getElementById('optbev-view')
    };
    viewTabs.forEach(tab => {
        if (tab.dataset.bound === 'true') return;
        tab.dataset.bound = 'true';
        tab.addEventListener('click', () => {
            viewTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            Object.values(viewMap).forEach(p => p && (p.style.display = 'none'));
            const k = tab.getAttribute('data-view');
            if (viewMap[k]) {
                viewMap[k].style.display = 'flex';
                
                // 如果是2D视图，确保图片已加载
                if (k === 'opt2d') {
                    setTimeout(() => {
                        const container = document.getElementById('opt2d-view-container');
                        if (container && container.viewingFrameComponent) {
                            const viewingFrame = container.viewingFrameComponent;
                            // 重新检查Canvas尺寸
                            if (viewingFrame.canvas) {
                                viewingFrame.resizeCanvas();
                            }
                            // 确保图片已加载
                            if (!viewingFrame.loadedImage && !viewingFrame.imageURL) {
                                const imageUrl = window.location.protocol === 'file:' 
                                    ? createCTImageDataURL()
                                    : 'image/横截面.png';
                                viewingFrame.loadImageFromURL(imageUrl);
                            } else if (viewingFrame.loadedImage) {
                                viewingFrame.renderAll();
                            }
                        } else {
                            // 如果组件还没初始化，重新初始化
                            initializeOptimization2DView();
                        }
                    }, 50);
                }
                // 如果是BEV视图，初始化BEV组件
                else if (k === 'optbev') {
                    setTimeout(() => {
                        initializeOptimizationBEVView();
                    }, 50);
                }
                // 如果是3D视图，初始化3D组件
                else if (k === 'opt3d') {
                    setTimeout(() => {
                        initializeOptimization3DView();
                    }, 50);
                }
            }
        });
    });

    // 右侧视图 tabs
    const rightTabs = document.querySelectorAll('#planOptimizationContent .right-view-tab');
    const rightMap = {
        bev: document.getElementById('opt-right-bev'),
        dvh: document.getElementById('opt-right-dvh'),
        let: document.getElementById('opt-right-let')
    };
    rightTabs.forEach(tab => {
        if (tab.dataset.bound === 'true') return;
        tab.dataset.bound = 'true';
        tab.addEventListener('click', () => {
            rightTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            Object.values(rightMap).forEach(p => p && (p.style.display = 'none'));
            const k = tab.getAttribute('data-right-view');
            if (rightMap[k]) {
                rightMap[k].style.display = 'block';
                
                // 如果是DVH视图，初始化DVH组件
                if (k === 'dvh') {
                    setTimeout(() => {
                        initializeOptimizationDVHView();
                    }, 50);
                }
            }
        });
    });

    // 底部 tabs
    const bottomTabs = document.getElementById('optBottomTabs');
    if (bottomTabs && !bottomTabs.dataset.bound) {
        bottomTabs.dataset.bound = 'true';
        const bottomMap = {
            constraints: document.getElementById('opt-constraints'),
            beams: document.getElementById('opt-beams'),
            targets: document.getElementById('opt-targets'),
            'dose-stats': document.getElementById('opt-dose-stats'),
            'energy-layer': document.getElementById('opt-energy-layer'),
            'beam-settings': document.getElementById('opt-beam-settings')
        };
        bottomTabs.querySelectorAll('.bottom-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                bottomTabs.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                Object.values(bottomMap).forEach(n => n && n.classList.remove('active'));
                const key = tab.getAttribute('data-tab');
                if (bottomMap[key]) bottomMap[key].classList.add('active');
                if (key === 'constraints') initializeOptimizationConstraints();
                if (key === 'beams') initializeOptimizationBeamList();
                if (key === 'dose-stats') initPlanOptimizationDoseStatsComponent();
                if (key === 'energy-layer') initializeOptimizationEnergyLayer();
                if (key === 'beam-settings') initializeOptimizationBeamSettings();
            });
        });
    }
}

// 创建一个简单的CT图像Data URL（作为fallback）
function createCTImageDataURL() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // 创建黑色背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 512);
    
    // 绘制一个模拟的头部CT图像
    const centerX = 256;
    const centerY = 256;
    const radius = 200;
    
    // 绘制颅骨（白色圆圈）
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制大脑组织（灰色）
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 20, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制脑室（深灰色）
    ctx.fillStyle = '#404040';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 60, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制鼻窦（黑色）
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 50, 40, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制眼眶（黑色）
    ctx.beginPath();
    ctx.arc(centerX - 80, centerY + 50, 35, 0, Math.PI * 2);
    ctx.arc(centerX + 80, centerY + 50, 35, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas.toDataURL('image/png');
}

// 初始化计划优化2D视图
function initializeOptimization2DView() {
    const container = document.getElementById('opt2d-view-container');
    if (!container) {
        console.warn('opt2d-view-container not found');
        return;
    }

    // 如果组件已初始化，不重复初始化
    if (container.dataset.initialized === 'true') {
        return;
    }

    // 使用 PlanDesignView2DComponent
    if (window.PlanDesignView2DComponent) {
        setTimeout(() => {
            new PlanDesignView2DComponent('opt2d-view-container', {
                viewType: 'Axial',
                sliceTotal: 157,
                sliceCurrent: 57
            });
            container.dataset.initialized = 'true';
        }, 100);
    }
}

// 初始化计划优化3D视图
function initializeOptimization3DView() {
    const container = document.getElementById('opt3d-view-container');
    if (!container) {
        console.error('3D视图容器未找到: opt3d-view-container');
        return;
    }
    
    // 检查是否已初始化
    if (container.dataset.initialized === 'true') {
        console.log('3D视图已初始化，跳过重复初始化');
        return;
    }
    
    // 检查View3DComponent是否已加载
    if (!window.View3DComponent) {
        console.error('View3DComponent未加载');
        return;
    }
    
    // 延迟初始化，确保容器已渲染并可见
    setTimeout(() => {
        console.log('=== 初始化计划优化3D视图 ===');
        
        // 创建3D视图组件实例
        const view3D = new window.View3DComponent('opt3d-view-container', {
            enableToolbar: true,
            enableRightClick: true,
            showBeams: true,
            showROIs: true,
            showIsocenter: true,
            backgroundColor: 0x000000
        });
        
        // 存储组件实例，供外部访问
        container.view3DComponent = view3D;
        container.dataset.initialized = 'true';
        
        console.log('3D视图组件初始化完成');
    }, 100);
}

// 初始化计划优化ROI勾画（从ROI组件读取数据并绘制）
function initializeOptimizationROIContours(viewingFrame) {
    if (!viewingFrame) return;
    
    const roiContainer = document.getElementById('optimizationRoiContainer');
    if (!roiContainer) {
        console.warn('optimizationRoiContainer not found');
        return;
    }
    
    // 延迟加载ROI，确保ROI组件已初始化
    setTimeout(() => {
        // 获取所有ROI项
        const roiItems = roiContainer.querySelectorAll('.roi-item');
        console.log('找到ROI项:', roiItems.length);
        
        // 为每个ROI生成轮廓点
        roiItems.forEach((roiItem, index) => {
            const roiName = roiItem.getAttribute('data-roi');
            const colorElement = roiItem.querySelector('.roi-color');
            const color = colorElement ? colorElement.style.backgroundColor || '#ff6b6b' : '#ff6b6b';
            const visibilityIcon = roiItem.querySelector('.roi-visibility');
            const isVisible = visibilityIcon && visibilityIcon.classList.contains('visible');
            
            // 生成模拟的轮廓点（圆形或椭圆形）
            const points = generateROIContourPoints(roiName, index, roiItems.length);
            
            // 添加到视图组件
            viewingFrame.addContour(roiName, points, color);
            viewingFrame.setContourVisibility(roiName, isVisible);
            
            console.log('添加ROI轮廓:', roiName, '颜色:', color, '可见:', isVisible);
        });
        
        // 重新渲染以显示轮廓
        viewingFrame.renderAll();
    }, 500);
    
    // 监听ROI可见性变化
    roiContainer.addEventListener('click', (e) => {
        const visibilityIcon = e.target.closest('.roi-visibility');
        if (visibilityIcon) {
            const roiItem = visibilityIcon.closest('.roi-item');
            if (roiItem) {
                const roiName = roiItem.getAttribute('data-roi');
                const isVisible = visibilityIcon.classList.contains('visible');
                viewingFrame.setContourVisibility(roiName, isVisible);
                viewingFrame.renderAll();
                console.log('ROI可见性变化:', roiName, isVisible);
            }
        }
    });
    
    // 使用MutationObserver监听ROI列表变化
    const observer = new MutationObserver(() => {
        // 重新加载ROI列表
        const roiItems = roiContainer.querySelectorAll('.roi-item');
        const currentROIs = new Set();
        
        roiItems.forEach((roiItem) => {
            const roiName = roiItem.getAttribute('data-roi');
            currentROIs.add(roiName);
            
            // 如果ROI不在当前轮廓列表中，添加它
            const existingContour = viewingFrame.contours.find(c => c.name === roiName);
            if (!existingContour) {
                const colorElement = roiItem.querySelector('.roi-color');
                const color = colorElement ? colorElement.style.backgroundColor || '#ff6b6b' : '#ff6b6b';
                const visibilityIcon = roiItem.querySelector('.roi-visibility');
                const isVisible = visibilityIcon && visibilityIcon.classList.contains('visible');
                const points = generateROIContourPoints(roiName, Array.from(currentROIs).indexOf(roiName), currentROIs.size);
                viewingFrame.addContour(roiName, points, color);
                viewingFrame.setContourVisibility(roiName, isVisible);
                viewingFrame.renderAll();
            }
        });
    });
    
    observer.observe(roiContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

// 生成ROI轮廓点（模拟数据）
function generateROIContourPoints(roiName, index, total) {
    const points = [];
    const numPoints = 32; // 圆形轮廓的点数
    
    // 根据ROI名称和索引生成不同的位置和大小
    const centerX = 256 + Math.sin(index * Math.PI * 2 / total) * 100;
    const centerY = 256 + Math.cos(index * Math.PI * 2 / total) * 100;
    const radiusX = 40 + (index % 3) * 20;
    const radiusY = 40 + (index % 3) * 20;
    
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const x = centerX + radiusX * Math.cos(angle);
        const y = centerY + radiusY * Math.sin(angle);
        points.push({ x, y });
    }
    
    return points;
}

// 鲁棒性设置：渲染组件并绑定按钮
function initializeRobustnessSettings() {
    const btn = document.getElementById('btnRobustnessSettings');
    if (!btn) return;
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';
    const mount = document.getElementById('robustnessSettingsMount');
    if (mount) {
        mount.style.display = 'block';
        if (!window.robustnessSettingsComponent && window.RobustnessSettingsComponent) {
            window.robustnessSettingsComponent = new window.RobustnessSettingsComponent(mount);
            window.robustnessSettingsComponent.render();
        }
    }
    btn.addEventListener('click', () => {
        if (window.robustnessSettingsComponent) {
            window.robustnessSettingsComponent.show();
            window.__robustnessEnabled = true;
        }
    });
}

// 初始化优化约束组件
function initializeOptimizationConstraints() {
    const mount = document.getElementById('optimizationConstraintsContainer');
    if (!mount || mount.dataset.inited === 'true') return;
    if (window.OptimizationConstraintsComponent) {
        const comp = new window.OptimizationConstraintsComponent(mount);
        comp.render();
        mount.dataset.inited = 'true';
    }
}

// 初始化计划优化模块的射束列表组件
function initializeOptimizationBeamList() {
    const mount = document.getElementById('optimizationBeamListContainer');
    if (!mount) return;
    if (mount.dataset.inited === 'true') return;
    if (window.BeamListComponent) {
        new window.BeamListComponent(mount, {
            getROIList: () => {
                // 从ROI组件获取ROI列表
                const roiContainer = document.getElementById('optimizationRoiContainer');
                if (!roiContainer) return [];
                
                const roiItems = roiContainer.querySelectorAll('.roi-item');
                const roiList = [];
                roiItems.forEach(item => {
                    const roiName = item.getAttribute('data-roi') || item.querySelector('.roi-name')?.textContent;
                    if (roiName) {
                        // 获取ROI的分类（target, non-target等）
                        const category = item.closest('.roi-category')?.getAttribute('data-category') || '';
                        // 获取ROI类型（如果有）
                        const typeIcon = item.querySelector('.roi-type-icon');
                        let roiType = '';
                        if (typeIcon) {
                            // 根据图标或其他方式判断类型
                            // 这里简化处理，实际应该从数据获取
                        }
                        roiList.push({ 
                            name: roiName,
                            category: category,
                            type: roiType
                        });
                    }
                });
                return roiList;
            },
            getSelectedTarget: () => {
                // 获取新建计划所选靶区
                // 这里应该从计划数据获取，暂时返回null
                return null;
            }
        });
        mount.dataset.inited = 'true';
    } else {
        console.warn('BeamListComponent not loaded yet');
    }
}

// 初始化计划优化模块的能量层视图组件
let optimizationEnergyLayerComponent = null;
function initializeOptimizationEnergyLayer() {
    const mount = document.getElementById('optimizationEnergyLayerContainer');
    if (!mount) return;
    if (mount.dataset.inited === 'true') return;
    if (window.EnergyLayerViewComponent) {
        optimizationEnergyLayerComponent = new window.EnergyLayerViewComponent(mount, {
            onBeamSelect: (beamId) => {
                console.log('选择射束:', beamId);
            },
            onLayerSelect: (layer, beamId) => {
                console.log('选择能量层:', layer, '射束:', beamId);
                // 与BEV视图同步
                syncEnergyLayerToBEV(layer, beamId);
            },
            onLayerDelete: (layerIds, beamId) => {
                console.log('删除能量层:', layerIds, '射束:', beamId);
                if (optimizationEnergyLayerComponent) {
                    optimizationEnergyLayerComponent.deleteLayers(layerIds);
                }
            },
            onLayerAdd: (beamId) => {
                console.log('添加能量层，射束:', beamId);
                if (optimizationEnergyLayerComponent) {
                    optimizationEnergyLayerComponent.addSampleLayer();
                }
            },
            getBeamList: () => {
                // 从射束列表组件获取射束列表
                const beamContainer = document.getElementById('optimizationBeamListContainer');
                if (!beamContainer) return [];
                
                // 尝试从BeamListComponent获取数据
                const beamRows = beamContainer.querySelectorAll('.beam-row');
                const beams = [];
                beamRows.forEach((row, index) => {
                    const nameInput = row.querySelector('input.name');
                    const beamName = nameInput ? nameInput.value : `Beam ${index + 1}`;
                    beams.push({
                        id: parseInt(row.dataset.id, 10) || (index + 1),
                        name: beamName
                    });
                });
                
                // 如果没有找到，返回示例数据
                return beams.length > 0 ? beams : [
                    { id: 1, name: 'Beam 1' },
                    { id: 2, name: 'Beam 2' }
                ];
            }
        });
        mount.dataset.inited = 'true';
    } else {
        console.warn('EnergyLayerViewComponent not loaded yet');
    }
}

// 同步能量层到BEV视图
function syncEnergyLayerToBEV(layer, beamId) {
    // Get all BEV view instances
    const bevViews = [
        window.optimizationBEVView,
        window.planDesignBEVView,
        window.planEvaluationBEVView,
        window.qaPlanBEVView
    ];
    
    // Update each active BEV view
    bevViews.forEach(bevView => {
        if (bevView && typeof bevView.setEnergyLayer === 'function') {
            bevView.setEnergyLayer(layer);
        }
    });
    
    console.log('同步能量层到BEV视图:', layer);
}

// 初始化计划优化模块的射束优化设置组件
let optimizationBeamSettingsComponent = null;
function initializeOptimizationBeamSettings() {
    const mount = document.getElementById('optimizationBeamSettingsContainer');
    if (!mount) return;
    if (mount.dataset.inited === 'true') return;
    if (window.BeamOptimizationSettingsComponent) {
        optimizationBeamSettingsComponent = new window.BeamOptimizationSettingsComponent(mount, {
            getBeamList: () => {
                // 从射束列表组件获取射束列表
                const beamContainer = document.getElementById('optimizationBeamListContainer');
                if (!beamContainer) return [];
                
                // 尝试从BeamListComponent获取数据
                const beamRows = beamContainer.querySelectorAll('.beam-row');
                const beams = [];
                beamRows.forEach((row, index) => {
                    const nameInput = row.querySelector('input.name');
                    const isocenterSelect = row.querySelector('select.isocenter');
                    const xInput = row.querySelector('input.x');
                    const yInput = row.querySelector('input.y');
                    const zInput = row.querySelector('input.z');
                    
                    const beamName = nameInput ? nameInput.value : `beam${index + 1}`;
                    const isocenter = isocenterSelect ? isocenterSelect.value : 'ISO1';
                    const x = xInput ? parseFloat(xInput.value) || 0 : 0;
                    const y = yInput ? parseFloat(yInput.value) || 0 : 0;
                    const z = zInput ? parseFloat(zInput.value) || 0 : 0;
                    
                    beams.push({
                        id: parseInt(row.dataset.id, 10) || (index + 1),
                        name: beamName,
                        isocenter: isocenter,
                        x: x,
                        y: y,
                        z: z
                    });
                });
                
                // 如果没有找到，返回示例数据
                return beams.length > 0 ? beams : [
                    { id: 1, name: 'beam1', isocenter: 'ISO1', x: 1.00, y: 1.00, z: 1.00 },
                    { id: 2, name: 'beam2', isocenter: 'ISO1', x: 1.00, y: 2.00, z: 1.00 }
                ];
            },
            getROIList: () => {
                // 从ROI组件获取ROI列表
                const roiContainer = document.getElementById('optimizationRoiContainer');
                if (!roiContainer) return [];
                
                const roiItems = roiContainer.querySelectorAll('.roi-item');
                const roiList = [];
                roiItems.forEach(item => {
                    const roiName = item.getAttribute('data-roi');
                    if (roiName) {
                        roiList.push({ name: roiName });
                    }
                });
                return roiList;
            },
            getPOIList: () => {
                // 从ISO组件获取POI列表
                const isoContainer = document.getElementById('optimizationIsoContainer');
                if (!isoContainer) return [];
                
                const poiItems = isoContainer.querySelectorAll('.poi-item');
                const poiList = [];
                poiItems.forEach(item => {
                    const poiName = item.getAttribute('data-poi');
                    if (poiName) {
                        poiList.push({ name: poiName });
                    }
                });
                return poiList;
            },
            onSettingsChange: (beamId, field, value) => {
                console.log('射束优化设置变更:', beamId, field, value);
            }
        });
        mount.dataset.inited = 'true';
    } else {
        console.warn('BeamOptimizationSettingsComponent not loaded yet');
    }
}

// 初始化计划优化工具栏
let optimizationSettingsModal = null;
function initializeOptimizationToolbar() {
    const toolbar = document.getElementById('planOptimizationToolbar');
    if (!toolbar) {
        console.warn('planOptimizationToolbar not found');
        return;
    }
    
    // 优化设置按钮
    const optimizationSettingsBtn = Array.from(toolbar.querySelectorAll('.toolbar-btn')).find(btn => {
        const span = btn.querySelector('span');
        return span && span.textContent.trim() === '优化设置';
    });
    
    if (optimizationSettingsBtn && !optimizationSettingsBtn.dataset.bound) {
        optimizationSettingsBtn.dataset.bound = 'true';
        optimizationSettingsBtn.addEventListener('click', () => {
            openOptimizationSettingsModal();
        });
    }
    
    // 线剂量分布按钮
    const lineDoseBtn = document.getElementById('btnLineDoseDistribution');
    if (lineDoseBtn) {
        if (!lineDoseBtn.dataset.bound) {
            lineDoseBtn.dataset.bound = 'true';
            lineDoseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('线剂量分布按钮被点击');
                openLineDoseDistributionModal();
            });
        }
    } else {
        console.warn('btnLineDoseDistribution not found');
    }
}

// 打开优化设置弹窗
function openOptimizationSettingsModal() {
    if (!window.OptimizationSettingsModalComponent) {
        console.error('OptimizationSettingsModalComponent not loaded');
        alert('优化设置组件未加载');
        return;
    }

    if (!optimizationSettingsModal) {
        optimizationSettingsModal = new window.OptimizationSettingsModalComponent();
    }
    
    optimizationSettingsModal.show();
}

// 打开线剂量分布弹窗
let lineDoseDistributionModal = null;
function openLineDoseDistributionModal() {
    console.log('openLineDoseDistributionModal called');
    console.log('LineDoseDistributionComponent available:', typeof window.LineDoseDistributionComponent);
    
    // 如果已有弹窗，先关闭
    if (lineDoseDistributionModal) {
        lineDoseDistributionModal.close();
        lineDoseDistributionModal = null;
    }
    
    // 检查组件是否加载
    if (!window.LineDoseDistributionComponent) {
        console.error('LineDoseDistributionComponent not loaded');
        alert('线剂量分布组件未加载，请检查组件文件是否正确引入');
        return;
    }
    
    try {
        lineDoseDistributionModal = new window.LineDoseDistributionComponent({
            onClose: () => {
                console.log('Line dose modal closed');
                lineDoseDistributionModal = null;
            },
            onExport: (lines, plane) => {
                handleLineDoseExport(lines, plane);
            },
            getCurrentPlanName: () => {
                // 获取当前计划名称
                return 'Plan dose (RBE)';
            },
            getCurrentSlice: () => {
                // 获取当前切片信息
                return { plane: 'Axial', slice: 71, total: 141 };
            },
            getCrosshairPosition: () => {
                // 获取十字线位置（从2D视图获取）
                const viewingFrame = document.querySelector('#opt2d-view-container');
                if (viewingFrame) {
                    // 这里应该从实际的视图组件获取十字线位置
                    return { x: 100, y: 100 };
                }
                return { x: 100, y: 100 };
            }
        });
        
        console.log('LineDoseDistributionComponent created:', lineDoseDistributionModal);
        
        // 显示弹窗
        if (lineDoseDistributionModal) {
            lineDoseDistributionModal.show();
            console.log('Modal show called');
        }
    } catch (error) {
        console.error('Error creating LineDoseDistributionComponent:', error);
        alert('创建线剂量分布组件时出错: ' + error.message);
    }
}

// 处理线剂量分布导出
function handleLineDoseExport(lines, plane) {
    // 导出逻辑
    console.log('Exporting line dose distribution:', lines, plane);
    
    // 生成CSV文件
    if (lines.length === 0) {
        alert('没有可导出的剂量线');
        return;
    }
    
    const visibleLines = lines.filter(line => line.visible && line.plane === plane);
    if (visibleLines.length === 0) {
        alert('当前平面没有可见的剂量线');
        return;
    }
    
    // 生成CSV内容
    let csv = '序号,起点X,起点Y,终点X,终点Y,角度,长度,颜色\n';
    visibleLines.forEach(line => {
        csv += `${line.sequence},${line.startX.toFixed(2)},${line.startY.toFixed(2)},${line.endX.toFixed(2)},${line.endY.toFixed(2)},${line.angle.toFixed(2)},${line.length.toFixed(2)},${line.color}\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // 生成文件名：患者ID_患者名称_计划名称_Line Dose
    const fileName = `line_dose_${Date.now()}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('导出成功');
}

// 显示计划评估
function showPlanEvaluation() {
    hideAllContent();
    const evalContent = document.getElementById('planEvaluationContent');
    if (evalContent) evalContent.style.display = 'block';
    
    // Initialize BEV view
    setTimeout(() => {
        initializePlanEvaluationBEVView();
    }, 100);
}

// 显示计划QA
function showPlanQA() {
    hideAllContent();
    const qaContent = document.getElementById('planQAContent');
    if (qaContent) qaContent.style.display = 'block';
    
    // Initialize BEV view
    setTimeout(() => {
        initializeQaPlanBEVView();
    }, 100);
}

// 初始化图像处理工具栏
function initializeImageProcessingToolbar() {
    const toolbar = document.getElementById('imageProcessingToolbar');
    if (!toolbar) return;
    const toolbarBtns = toolbar.querySelectorAll('.toolbar-btn');
    
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有active类
            toolbarBtns.forEach(b => b.classList.remove('active'));
            
            // 添加active类到当前按钮
            this.classList.add('active');
            
            // 处理工具栏按钮点击（仅取文字并去除空白）
            const label = (this.querySelector('span')?.textContent || this.textContent || '').trim();
            handleToolbarButtonClick(label);
        });
    });
}

// 初始化图像处理序列树
function initializeImageSequenceTree() {
    const imageSequenceTreeContainer = document.getElementById('imageSequenceTree');
    if (imageSequenceTreeContainer) {
        // 清空容器内容
        imageSequenceTreeContainer.innerHTML = '';
        
        // 创建与患者管理界面相同的序列树实例
        const imageSequenceTree = new SequenceTree('imageSequenceTree');
        
        // 绑定与患者管理界面相同的事件
        imageSequenceTree.on('itemSelected', (item) => {
            // 图像处理序列树项目选择处理
            // 更新文件信息显示
            updateImageFileInfo(item);
        });
        
        imageSequenceTree.on('4DPlayerRequested', (frames) => {
            // 4D播放器请求处理
            show4DPlayer(frames);
        });
        
        imageSequenceTree.on('PTCTToggle', (isVisible) => {
            // PTCT切换处理
        });
        
        // 渲染序列树
        imageSequenceTree.render();
    }
}

// 初始化图像处理界面垂直导航按钮
function initializeImageVerticalNav() {
    const navButtons = document.querySelectorAll('.image-left-panel .nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPanel = button.getAttribute('data-panel');
            
            // 移除所有活动状态
            navButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.panel-section').forEach(section => section.classList.remove('active'));
            
            // 激活当前按钮和对应面板
            button.classList.add('active');
            const targetSection = document.getElementById(targetPanel + '-panel');
            if (targetSection) {
                targetSection.classList.add('active');
                
                // 根据面板类型动态加载组件
                if (targetPanel === 'sequence') {
                    initImageSequenceComponent();
                } else if (targetPanel === 'roi') {
                    initImageROIComponent();
                } else if (targetPanel === 'poi') {
                    initImagePOIComponent();
                } else if (targetPanel === 'registration') {
                    initImageRegistrationComponent();
                }
            }
        });
    });
    
    // 初始化左侧栏收起展开功能
    initializeLeftPanelToggle();
    
    // 初始化左侧栏拖拽调整宽度功能
    initializeLeftPanelResizer();
}

// 初始化左侧栏收起展开功能
function initializeLeftPanelToggle() {
    const toggleButton = document.getElementById('leftPanelToggle');
    const leftPanel = document.querySelector('.image-left-panel');
    
    if (toggleButton && leftPanel) {
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLeftPanel();
        });
    }
}

// 初始化配准卡片
function initializeRegistrationCards() {
    const registrationCards = document.getElementById('registrationCards');
    if (!registrationCards) return;
    
    // 配准数据
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
            timestamp: '2025-07-08 14:30:15',
            primaryImage: {
                modality: 'MR',
                sequenceNumber: '1',
                sequenceDescription: 'MR Scan'
            },
            primaryContour: {
                name: 'RTStruct 2',
                sequenceNumber: '2',
                sequenceDescription: 'RT Structure'
            },
            secondaryImage: {
                modality: 'CT',
                sequenceNumber: '3',
                sequenceDescription: 'CT Scan'
            },
            secondaryContour: {
                name: 'RTStruct 2',
                sequenceNumber: '2',
                sequenceDescription: 'RT Structure'
            },
            description: '头部配准，用于手术规划'
        }
    ];
    
    // 渲染配准卡片
    registrationCards.innerHTML = registrationData.map(reg => createRegistrationCard(reg)).join('');
    
    // 绑定事件
    bindRegistrationCardEvents();
}

// 创建配准卡片HTML
function createRegistrationCard(reg) {
    return `
        <div class="registration-card" data-id="${reg.id}">
            <div class="registration-card-header">
                <div class="registration-title">${reg.type}</div>
                <div class="registration-timestamp">${reg.timestamp}</div>
                <div class="registration-toggle">
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
                    <span class="registration-info-value">${reg.primaryContour.name} ${reg.primaryContour.sequenceNumber}</span>
                </div>
                <div class="registration-info-item">
                    <span class="registration-info-label">次序列图像:</span>
                    <span class="registration-info-value">${reg.secondaryImage.modality} ${reg.secondaryImage.sequenceNumber}</span>
                </div>
                <div class="registration-info-item">
                    <span class="registration-info-label">次序列勾画:</span>
                    <span class="registration-info-value">${reg.secondaryContour.name} ${reg.secondaryContour.sequenceNumber}</span>
                </div>
            </div>
            
            <div class="registration-description">
                <div class="registration-description-label">配准描述:</div>
                <textarea class="registration-description-input" placeholder="请输入配准描述">${reg.description}</textarea>
            </div>
            
            <div class="registration-thumbnails">
                <div class="thumbnail-item">
                    <div class="thumbnail-label">主序列图像</div>
                    <div class="thumbnail-image">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0xMCAxMEg1MFYzMEgxMFYxMFoiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0xNSAxNUg0NVYyNUgxNVYxNVoiIHN0cm9rZT0iIzAwN2FjYyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjwvc3ZnPgo=" alt="主序列图像" />
                    </div>
                </div>
                <div class="thumbnail-item">
                    <div class="thumbnail-label">次序列图像</div>
                    <div class="thumbnail-image">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0xMCAxMEg1MFYzMEgxMFYxMFoiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0xNSAxNUg0NVYyNUgxNVYxNVoiIHN0cm9rZT0iI2ZmNjYwMCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjwvc3ZnPgo=" alt="次序列图像" />
                    </div>
                </div>
                <div class="thumbnail-item">
                    <div class="thumbnail-label">融合图像</div>
                    <div class="thumbnail-image">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0xMCAxMEg1MFYzMEgxMFYxMFoiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0xNSAxNUg0NVYyNUgxNVYxNVoiIHN0cm9rZT0iIzAwZmYwMCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjwvc3ZnPgo=" alt="融合图像" />
                    </div>
                </div>
            </div>
            
            <div class="registration-actions">
                <div class="registration-action-buttons">
                    <button class="registration-action-btn" title="下载">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="registration-action-btn" title="查看图像">
                        <i class="fas fa-image"></i>
                    </button>
                    <button class="registration-action-btn" title="分享">
                        <i class="fas fa-user"></i>
                    </button>
                    <button class="registration-action-btn" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 绑定配准卡片事件
function bindRegistrationCardEvents() {
    const cards = document.querySelectorAll('.registration-card');
    
    cards.forEach(card => {
        // 收起展开事件
        const toggle = card.querySelector('.registration-toggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleRegistrationCard(card);
            });
        }
        
        // 描述编辑事件
        const descriptionInput = card.querySelector('.registration-description-input');
        if (descriptionInput) {
            descriptionInput.addEventListener('input', (e) => {
                updateRegistrationDescription(card.dataset.id, e.target.value);
            });
        }
        
        // 缩略图点击事件
        const thumbnails = card.querySelectorAll('.thumbnail-item');
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', (e) => {
                e.stopPropagation();
                const label = thumbnail.querySelector('.thumbnail-label').textContent;
                handleThumbnailClick(card.dataset.id, label);
            });
        });
        
        // 操作按钮事件
        const actionButtons = card.querySelectorAll('.registration-action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleActionButtonClick(card.dataset.id, btn.title);
            });
        });
    });
}

// 切换配准卡片收起展开
function toggleRegistrationCard(card) {
    const isCollapsed = card.classList.contains('collapsed');
    
    if (isCollapsed) {
        card.classList.remove('collapsed');
    } else {
        card.classList.add('collapsed');
    }
}

// 更新配准描述
function updateRegistrationDescription(registrationId, description) {
    // 更新配准描述
    // 这里可以添加保存到后端的逻辑
}

// 处理缩略图点击
function handleThumbnailClick(registrationId, thumbnailType) {
    // 查看配准缩略图
    // 这里可以添加查看逻辑
}

// 处理操作按钮点击
function handleActionButtonClick(registrationId, action) {
    // 执行配准操作
    
    if (action === '下载') {
        // 显示导出配准对话框
        showExportModal(registrationId);
    } else if (action === '查看图像') {
        // 显示生成图像对话框
        showGenerateImageModal(registrationId);
    } else if (action === '分享') {
        // 显示生成剂量对话框
        showGenerateDoseModal(registrationId);
    } else if (action === '删除') {
        // 显示删除配准记录确认对话框
        showDeleteRegistrationModal(registrationId);
    } else {
        // 其他操作逻辑
        // 执行操作
    }
}

// 显示导出配准对话框
function showExportModal(registrationId) {
    const exportModal = document.getElementById('exportModal');
    if (exportModal) {
        exportModal.style.display = 'flex';
        
        // 初始化导出对话框
        initializeExportModal(registrationId);
    }
}

// 初始化导出对话框
function initializeExportModal(registrationId) {
    // 绑定关闭按钮事件
    const closeBtn = document.getElementById('exportModalClose');
    const cancelBtn = document.getElementById('exportCancelBtn');
    const confirmBtn = document.getElementById('exportConfirmBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hideExportModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideExportModal);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => handleExportConfirm(registrationId));
    }
    
    // 绑定导出方式切换事件
    const exportDestinations = document.querySelectorAll('input[name="exportDestination"]');
    exportDestinations.forEach(radio => {
        radio.addEventListener('change', handleExportDestinationChange);
    });
    
    // 绑定文件夹浏览按钮事件
    const browseBtn = document.getElementById('browseFolderBtn');
    if (browseBtn) {
        browseBtn.addEventListener('click', handleBrowseFolder);
    }
    
    // 绑定添加服务器按钮事件
    const addServerBtn = document.getElementById('addServerBtn');
    if (addServerBtn) {
        addServerBtn.addEventListener('click', handleAddServer);
    }
}

// 隐藏导出对话框
function hideExportModal() {
    const exportModal = document.getElementById('exportModal');
    if (exportModal) {
        exportModal.style.display = 'none';
    }
}

// 处理导出方式切换
function handleExportDestinationChange(e) {
    const value = e.target.value;
    const serverConfig = document.querySelector('.server-config');
    const folderConfig = document.querySelector('.folder-config');
    
    if (value === 'remote') {
        serverConfig.style.display = 'flex';
        folderConfig.style.display = 'none';
    } else if (value === 'local') {
        serverConfig.style.display = 'none';
        folderConfig.style.display = 'flex';
    }
}

// 处理文件夹浏览
function handleBrowseFolder() {
    // 这里可以添加文件夹选择逻辑
    // 浏览文件夹
    // 模拟文件夹选择
    const folderPath = document.getElementById('exportFolderPath');
    if (folderPath) {
        folderPath.value = 'C:\\Export\\Registration';
    }
}

// 处理添加服务器
function handleAddServer() {
    // 这里可以添加服务器配置逻辑
    // 添加服务器配置
    alert('服务器配置功能待实现');
}

// 处理导出确认
function handleExportConfirm(registrationId) {
    // 验证表单
    if (!validateExportForm()) {
        return;
    }
    
    // 隐藏导出对话框
    hideExportModal();
    
    // 显示进度对话框
    showExportProgress();
    
    // 开始导出
    startExport(registrationId);
}

// 验证导出表单
function validateExportForm() {
    const exportDestination = document.querySelector('input[name="exportDestination"]:checked');
    const folderPath = document.getElementById('exportFolderPath');
    
    // 检查导出方式
    if (!exportDestination) {
        alert('请选择导出方式');
        return false;
    }
    
    // 如果选择本地文件夹，检查路径
    if (exportDestination.value === 'local') {
        if (!folderPath.value.trim()) {
            alert('请选择文件夹路径');
            return false;
        }
    }
    
    return true;
}

// 显示导出进度
function showExportProgress() {
    const progressModal = document.getElementById('exportProgressModal');
    if (progressModal) {
        progressModal.style.display = 'flex';
    }
}

// 隐藏导出进度
function hideExportProgress() {
    const progressModal = document.getElementById('exportProgressModal');
    if (progressModal) {
        progressModal.style.display = 'none';
    }
}

// 开始导出
function startExport(registrationId) {
    const progressFill = document.getElementById('exportProgressFill');
    const progressText = document.getElementById('exportProgressText');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) {
            progress = 100;
        }
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        if (progressText) {
            progressText.textContent = Math.round(progress) + '%';
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // 模拟导出完成
            setTimeout(() => {
                hideExportProgress();
                
                // 检查次序列是否存在
                if (checkSecondarySequenceExists(registrationId)) {
                    alert('导出配准成功');
                } else {
                    alert('次序列不存在，无法导出');
                }
            }, 500);
        }
    }, 200);
}

// 检查次序列是否存在
function checkSecondarySequenceExists(registrationId) {
    // 这里可以添加实际的次序列检查逻辑
    // 模拟检查结果
    return Math.random() > 0.3; // 70% 概率存在
}

// 显示生成图像对话框
function showGenerateImageModal(registrationId) {
    const generateImageModal = document.getElementById('generateImageModal');
    if (generateImageModal) {
        generateImageModal.style.display = 'flex';
        
        // 初始化生成图像对话框
        initializeGenerateImageModal(registrationId);
    }
}

// 初始化生成图像对话框
function initializeGenerateImageModal(registrationId) {
    // 绑定关闭按钮事件
    const closeBtn = document.getElementById('generateImageModalClose');
    const cancelBtn = document.getElementById('generateImageCancelBtn');
    const confirmBtn = document.getElementById('generateImageConfirmBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hideGenerateImageModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideGenerateImageModal);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => handleGenerateImageConfirm(registrationId));
    }
    
    // 初始化次序列选择
    initializeSecondarySequenceSelect(registrationId);
    
    // 设置默认值
    const descriptionInput = document.getElementById('generateSequenceDescription');
    if (descriptionInput) {
        descriptionInput.value = 'Manteia Registration';
    }
}

// 初始化次序列选择
function initializeSecondarySequenceSelect(registrationId) {
    const select = document.getElementById('secondarySequenceSelect');
    if (!select) return;
    
    // 根据配准类型动态更新选项
    const registrationData = getRegistrationData(registrationId);
    if (registrationData) {
        updateSequenceOptions(select, registrationData.type);
    }
}

// 获取配准数据
function getRegistrationData(registrationId) {
    // 这里可以添加获取配准数据的逻辑
    // 模拟数据
    return {
        id: registrationId,
        type: '形变配准', // 或 '刚性配准'
        primaryImage: 'CT1 2019-01-14',
        secondaryImage: 'CT2 2019-09-15'
    };
}

// 更新序列选项
function updateSequenceOptions(select, registrationType) {
    // 清空现有选项
    select.innerHTML = '';
    
    if (registrationType === '形变配准') {
        // 形变配准的选项
        const options = [
            { value: 'ct1-2019-09-15', text: 'CT1 2019-09-15 19:00:00' },
            { value: 'ct2-2020-09-15', text: 'CT2 2020-09-15 10:00:00' },
            { value: 'pet-ct-2019-01-14', text: 'PET-CT 2019-01-14 14:30:00' },
            { value: '4dct-2019-01-14', text: '4DCT 2019-01-14 16:45:00' }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
    } else {
        // 刚性配准的选项
        const options = [
            { value: 'ct1-2019-09-15', text: 'CT1 2019-09-15 19:00:00' },
            { value: 'ct2-2020-09-15', text: 'CT2 2020-09-15 10:00:00' }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
    }
}

// 隐藏生成图像对话框
function hideGenerateImageModal() {
    const generateImageModal = document.getElementById('generateImageModal');
    if (generateImageModal) {
        generateImageModal.style.display = 'none';
    }
}

// 处理生成图像确认
function handleGenerateImageConfirm(registrationId) {
    // 验证表单
    if (!validateGenerateImageForm()) {
        return;
    }
    
    // 隐藏生成图像对话框
    hideGenerateImageModal();
    
    // 显示进度对话框
    showGenerateImageProgress();
    
    // 开始生成图像
    startGenerateImage(registrationId);
}

// 验证生成图像表单
function validateGenerateImageForm() {
    const secondarySequence = document.getElementById('secondarySequenceSelect');
    const description = document.getElementById('generateSequenceDescription');
    
    // 检查次序列选择
    if (!secondarySequence.value) {
        alert('请选择次序列');
        return false;
    }
    
    // 检查序列描述长度
    if (description.value.length > 128) {
        alert('序列描述不能超过128个字符');
        return false;
    }
    
    return true;
}

// 显示生成图像进度
function showGenerateImageProgress() {
    const progressModal = document.getElementById('generateImageProgressModal');
    if (progressModal) {
        progressModal.style.display = 'flex';
    }
}

// 隐藏生成图像进度
function hideGenerateImageProgress() {
    const progressModal = document.getElementById('generateImageProgressModal');
    if (progressModal) {
        progressModal.style.display = 'none';
    }
}

// 开始生成图像
function startGenerateImage(registrationId) {
    const progressFill = document.getElementById('generateImageProgressFill');
    const progressText = document.getElementById('generateImageProgressText');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) {
            progress = 100;
        }
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        if (progressText) {
            progressText.textContent = Math.round(progress) + '%';
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // 生成图像完成
            setTimeout(() => {
                hideGenerateImageProgress();
                
                // 添加新生成的图像到序列树
                addGeneratedImageToSequenceTree(registrationId);
                
                alert('生成图像成功');
            }, 500);
        }
    }, 200);
}

// 添加生成的图像到序列树
function addGeneratedImageToSequenceTree(registrationId) {
    const secondarySequence = document.getElementById('secondarySequenceSelect');
    const description = document.getElementById('generateSequenceDescription');
    const retainTime = document.getElementById('retainOriginalTime').checked;
    
    // 生成新的图像信息
    const newImageData = {
        id: 'generated-' + Date.now(),
        name: 'Generated ' + secondarySequence.selectedOptions[0].text,
        type: 'generated-image',
        description: description.value,
        registrationId: registrationId,
        generatedTime: retainTime ? '原次序列时间' : new Date().toLocaleString(),
        expanded: false
    };
    
    // 添加到序列树
    addImageToSequenceTree(newImageData);
    
    // 打开新生成的图像
    openGeneratedImage(newImageData);
}

// 添加图像到序列树
function addImageToSequenceTree(imageData) {
    // 这里可以添加将新图像添加到序列树的逻辑
    // 添加新生成的图像到序列树
    
    // 重新初始化序列树以显示新图像
    if (typeof initializeImageSequenceTree === 'function') {
        initializeImageSequenceTree();
    }
}

// 打开生成的图像
function openGeneratedImage(imageData) {
    // 这里可以添加打开新生成图像的逻辑
    console.log('打开新生成的图像:', imageData);
    
    // 可以在这里添加图像查看器的逻辑
    alert(`新生成的图像已添加到序列树: ${imageData.name}`);
}

// 显示生成剂量对话框
function showGenerateDoseModal(registrationId) {
    const generateDoseModal = document.getElementById('generateDoseModal');
    if (generateDoseModal) {
        generateDoseModal.style.display = 'flex';
        
        // 初始化生成剂量对话框
        initializeGenerateDoseModal(registrationId);
    }
}

// 初始化生成剂量对话框
function initializeGenerateDoseModal(registrationId) {
    // 绑定关闭按钮事件
    const closeBtn = document.getElementById('generateDoseModalClose');
    const cancelBtn = document.getElementById('generateDoseCancelBtn');
    const confirmBtn = document.getElementById('generateDoseConfirmBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hideGenerateDoseModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideGenerateDoseModal);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => handleGenerateDoseConfirm(registrationId));
    }
    
    // 初始化次序列剂量选择
    initializeSecondaryDoseSelect(registrationId);
    
    // 设置默认值
    const descriptionInput = document.getElementById('generateDoseDescription');
    if (descriptionInput) {
        descriptionInput.value = 'Deformed Dose';
    }
}

// 初始化次序列剂量选择
function initializeSecondaryDoseSelect(registrationId) {
    const select = document.getElementById('secondaryDoseSelect');
    if (!select) return;
    
    // 检查次序列是否有剂量文件
    const hasDoseFiles = checkSecondarySequenceDoseFiles(registrationId);
    
    if (!hasDoseFiles) {
        // 如果没有剂量文件，禁用按钮
        disableGenerateDoseButton();
        return;
    }
    
    // 根据配准类型动态更新选项
    const registrationData = getRegistrationData(registrationId);
    if (registrationData) {
        updateDoseOptions(select, registrationData.type);
    }
}

// 检查次序列是否有剂量文件
function checkSecondarySequenceDoseFiles(registrationId) {
    // 这里可以添加检查次序列剂量文件的逻辑
    // 模拟检查结果
    return Math.random() > 0.2; // 80% 概率有剂量文件
}

// 禁用生成剂量按钮
function disableGenerateDoseButton() {
    const generateDoseBtn = document.querySelector('[data-action="generate-dose"]');
    if (generateDoseBtn) {
        generateDoseBtn.disabled = true;
        generateDoseBtn.style.opacity = '0.5';
        generateDoseBtn.style.cursor = 'not-allowed';
    }
}

// 更新剂量选项
function updateDoseOptions(select, registrationType) {
    // 清空现有选项
    select.innerHTML = '';
    
    if (registrationType === '形变配准') {
        // 形变配准的剂量选项
        const options = [
            { value: 'dose1-2019-09-15', text: 'Dose1 2019-09-15 19:00:00' },
            { value: 'dose2-2020-09-15', text: 'Dose2 2020-09-15 10:00:00' },
            { value: 'dose3-2019-01-14', text: 'Dose3 2019-01-14 14:30:00' }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
    } else {
        // 刚性配准的剂量选项
        const options = [
            { value: 'dose1-2019-09-15', text: 'Dose1 2019-09-15 19:00:00' },
            { value: 'dose2-2020-09-15', text: 'Dose2 2020-09-15 10:00:00' }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
    }
}

// 隐藏生成剂量对话框
function hideGenerateDoseModal() {
    const generateDoseModal = document.getElementById('generateDoseModal');
    if (generateDoseModal) {
        generateDoseModal.style.display = 'none';
    }
}

// 处理生成剂量确认
function handleGenerateDoseConfirm(registrationId) {
    // 验证表单
    if (!validateGenerateDoseForm()) {
        return;
    }
    
    // 隐藏生成剂量对话框
    hideGenerateDoseModal();
    
    // 显示进度对话框
    showGenerateDoseProgress();
    
    // 开始生成剂量
    startGenerateDose(registrationId);
}

// 验证生成剂量表单
function validateGenerateDoseForm() {
    const secondaryDose = document.getElementById('secondaryDoseSelect');
    const description = document.getElementById('generateDoseDescription');
    
    // 检查次序列剂量选择
    if (!secondaryDose.value) {
        alert('请选择次序列剂量');
        return false;
    }
    
    // 检查序列描述长度
    if (description.value.length > 128) {
        alert('序列描述不能超过128个字符');
        return false;
    }
    
    return true;
}

// 显示生成剂量进度
function showGenerateDoseProgress() {
    const progressModal = document.getElementById('generateDoseProgressModal');
    if (progressModal) {
        progressModal.style.display = 'flex';
    }
}

// 隐藏生成剂量进度
function hideGenerateDoseProgress() {
    const progressModal = document.getElementById('generateDoseProgressModal');
    if (progressModal) {
        progressModal.style.display = 'none';
    }
}

// 开始生成剂量
function startGenerateDose(registrationId) {
    const progressFill = document.getElementById('generateDoseProgressFill');
    const progressText = document.getElementById('generateDoseProgressText');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 12;
        if (progress > 100) {
            progress = 100;
        }
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        if (progressText) {
            progressText.textContent = Math.round(progress) + '%';
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // 生成剂量完成
            setTimeout(() => {
                hideGenerateDoseProgress();
                
                // 添加新生成的剂量到序列树
                addGeneratedDoseToSequenceTree(registrationId);
                
                alert('生成剂量成功');
            }, 500);
        }
    }, 200);
}

// 添加生成的剂量到序列树
function addGeneratedDoseToSequenceTree(registrationId) {
    const secondaryDose = document.getElementById('secondaryDoseSelect');
    const description = document.getElementById('generateDoseDescription');
    
    // 生成新的剂量信息
    const newDoseData = {
        id: 'generated-dose-' + Date.now(),
        name: 'Deformed Dose',
        type: 'generated-dose',
        description: description.value,
        registrationId: registrationId,
        generatedTime: new Date().toLocaleString(),
        expanded: false
    };
    
    // 添加到序列树
    addDoseToSequenceTree(newDoseData);
    
    // 打开新生成的剂量
    openGeneratedDose(newDoseData);
}

// 添加剂量到序列树
function addDoseToSequenceTree(doseData) {
    // 这里可以添加将新剂量添加到序列树的逻辑
    console.log('添加新生成的剂量到序列树:', doseData);
    
    // 根据挂载关系添加剂量
    const mountInfo = determineDoseMounting(doseData);
    console.log('剂量挂载信息:', mountInfo);
    
    // 重新初始化序列树以显示新剂量
    if (typeof initializeImageSequenceTree === 'function') {
        initializeImageSequenceTree();
    }
}

// 确定剂量挂载关系
function determineDoseMounting(doseData) {
    // 1.1.4.2.1 默认挂载在主序列关联的Plan下
    // 1.1.4.2.2 若主序列没有关联的Plan，则挂载在主序列的勾画下
    // 1.1.4.2.3 若主序列没有关联的Struct，则挂载在主序列的图像下
    
    const registrationData = getRegistrationData(doseData.registrationId);
    const primaryImage = registrationData.primaryImage;
    
    // 检查主序列的关联关系
    const hasPlan = checkPrimarySequencePlan(primaryImage);
    const hasStruct = checkPrimarySequenceStruct(primaryImage);
    
    if (hasPlan) {
        return {
            mountType: 'plan',
            mountTarget: primaryImage + ' Plan',
            doseName: 'Deformed Dose'
        };
    } else if (hasStruct) {
        return {
            mountType: 'struct',
            mountTarget: primaryImage + ' Struct',
            doseName: 'Deformed Dose'
        };
    } else {
        return {
            mountType: 'image',
            mountTarget: primaryImage,
            doseName: 'Deformed Dose'
        };
    }
}

// 检查主序列是否有Plan
function checkPrimarySequencePlan(primaryImage) {
    // 这里可以添加检查主序列Plan的逻辑
    // 模拟检查结果
    return Math.random() > 0.3; // 70% 概率有Plan
}

// 检查主序列是否有Struct
function checkPrimarySequenceStruct(primaryImage) {
    // 这里可以添加检查主序列Struct的逻辑
    // 模拟检查结果
    return Math.random() > 0.4; // 60% 概率有Struct
}

// 打开生成的剂量
function openGeneratedDose(doseData) {
    // 这里可以添加打开新生成剂量的逻辑
    console.log('打开新生成的剂量:', doseData);
    
    // 可以在这里添加剂量查看器的逻辑
    alert(`新生成的剂量已添加到序列树: ${doseData.name}`);
}

// 显示删除配准记录确认对话框
function showDeleteRegistrationModal(registrationId) {
    const deleteModal = document.getElementById('deleteRegistrationModal');
    if (deleteModal) {
        deleteModal.style.display = 'flex';
        
        // 初始化删除配准记录对话框
        initializeDeleteRegistrationModal(registrationId);
    }
}

// 初始化删除配准记录对话框
function initializeDeleteRegistrationModal(registrationId) {
    // 绑定关闭按钮事件
    const closeBtn = document.getElementById('deleteRegistrationModalClose');
    const cancelBtn = document.getElementById('deleteRegistrationCancelBtn');
    const confirmBtn = document.getElementById('deleteRegistrationConfirmBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hideDeleteRegistrationModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideDeleteRegistrationModal);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => handleDeleteRegistrationConfirm(registrationId));
    }
}

// 隐藏删除配准记录对话框
function hideDeleteRegistrationModal() {
    const deleteModal = document.getElementById('deleteRegistrationModal');
    if (deleteModal) {
        deleteModal.style.display = 'none';
    }
}

// 处理删除配准记录确认
function handleDeleteRegistrationConfirm(registrationId) {
    // 检查是否为当前打开的配准记录
    const isCurrentRegistration = checkIfCurrentRegistration(registrationId);
    
    // 执行删除操作
    deleteRegistrationRecord(registrationId);
    
    // 隐藏删除对话框
    hideDeleteRegistrationModal();
    
    // 如果删除的是当前打开的配准记录，退出图像融合
    if (isCurrentRegistration) {
        exitImageFusion();
    }
    
    // 显示删除成功提示
    alert('配准记录已删除');
}

// 检查是否为当前打开的配准记录
function checkIfCurrentRegistration(registrationId) {
    // 这里可以添加检查当前配准记录的逻辑
    // 模拟检查结果
    return Math.random() > 0.5; // 50% 概率是当前配准记录
}

// 删除配准记录
function deleteRegistrationRecord(registrationId) {
    // 这里可以添加删除配准记录的逻辑
    console.log(`删除配准记录: ${registrationId}`);
    
    // 从配准列表中移除
    removeRegistrationFromList(registrationId);
    
    // 更新配准面板显示
    updateRegistrationPanel();
}

// 从配准列表中移除
function removeRegistrationFromList(registrationId) {
    // 这里可以添加从列表中移除配准记录的逻辑
    console.log(`从配准列表中移除: ${registrationId}`);
    
    // 可以在这里添加实际的删除逻辑
    // 例如：从DOM中移除配准卡片
    const registrationCard = document.querySelector(`[data-id="${registrationId}"]`);
    if (registrationCard) {
        registrationCard.remove();
    }
}

// 更新配准面板显示
function updateRegistrationPanel() {
    // 这里可以添加更新配准面板显示的逻辑
    console.log('更新配准面板显示');
    
    // 重新初始化配准面板
    if (typeof initializeRegistrationPanel === 'function') {
        initializeRegistrationPanel();
    }
}

// 退出图像融合
function exitImageFusion() {
    // 这里可以添加退出图像融合的逻辑
    console.log('退出图像融合');
    
    // 切换到患者管理界面
    switchToPatientManagement();
    
    // 清理图像融合相关的状态
    clearImageFusionState();
}

// 切换到患者管理界面
function switchToPatientManagement() {
    // 这里可以添加切换到患者管理界面的逻辑
    console.log('切换到患者管理界面');
    
    // 隐藏图像处理界面
    const imageProcessingContent = document.getElementById('imageProcessingContent');
    if (imageProcessingContent) {
        imageProcessingContent.style.display = 'none';
    }
    
    // 显示患者管理界面
    const patientManagementContent = document.getElementById('patientManagementContent');
    if (patientManagementContent) {
        patientManagementContent.style.display = 'block';
    }
    
    // 更新导航栏状态
    updateNavigationState('patient-management');
}

// 清理图像融合相关的状态
function clearImageFusionState() {
    // 这里可以添加清理图像融合状态的逻辑
    console.log('清理图像融合状态');
    
    // 清理当前配准记录
    clearCurrentRegistration();
    
    // 清理图像查看器状态
    clearImageViewerState();
}

// 清理当前配准记录
function clearCurrentRegistration() {
    // 这里可以添加清理当前配准记录的逻辑
    console.log('清理当前配准记录');
}

// 清理图像查看器状态
function clearImageViewerState() {
    // 这里可以添加清理图像查看器状态的逻辑
    console.log('清理图像查看器状态');
}

// 更新导航栏状态
function updateNavigationState(activeModule) {
    // 这里可以添加更新导航栏状态的逻辑
    console.log(`更新导航栏状态: ${activeModule}`);
    
    // 移除所有导航按钮的激活状态
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // 激活当前模块的导航按钮
    const activeButton = document.querySelector(`[data-module="${activeModule}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// 初始化ROI面板功能
function initializeROIPanel() {
    // 绑定struct头部点击事件
    const structInfo = document.querySelector('.struct-info');
    if (structInfo) {
        structInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            handleStructInfoClick();
        });
    }
    
    // 绑定ROI分类展开/收起事件
    const categoryHeaders = document.querySelectorAll('.roi-category-header');
    categoryHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleROICategory(header.parentElement);
        });
    });
    
    // 绑定ROI项目选择事件
    const roiItems = document.querySelectorAll('.roi-item');
    roiItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectROIItem(item);
        });
    });
    
    // 绑定ROI显隐切换事件
    const visibilityIcons = document.querySelectorAll('.roi-visibility');
    visibilityIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleROIVisibility(icon);
        });
    });
    
    // 绑定ROI工具栏事件
    const toolBtns = document.querySelectorAll('.roi-tool-btn');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleROIToolClick(btn);
        });
    });
    
    // 绑定ROI属性编辑事件
    const editIcons = document.querySelectorAll('.roi-edit-icon');
    editIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            handleROIEdit(icon);
        });
    });
    
    // 初始化ROI勾画类型下拉菜单
    initializeROIDrawingDropdowns();
    
    // 初始化ROI工具栏功能
    initializeROIToolbar();
}

// 处理struct信息点击
function handleStructInfoClick() {
    console.log('点击struct信息');
    // 这里可以添加struct信息点击的处理逻辑
    // 例如：显示struct选择对话框
}

// 切换ROI分类展开/收起
function toggleROICategory(categoryElement) {
    const isExpanded = categoryElement.classList.contains('expanded');
    
    if (isExpanded) {
        categoryElement.classList.remove('expanded');
    } else {
        categoryElement.classList.add('expanded');
    }
}

// 选择ROI项目
function selectROIItem(itemElement) {
    // 移除所有active类
    const allItems = document.querySelectorAll('.roi-item');
    allItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // 添加active类到当前项
    itemElement.classList.add('active');
    
    // 更新ROI属性面板
    updateROIProperties(itemElement);
}

// 切换ROI显隐
function toggleROIVisibility(iconElement) {
    const isVisible = iconElement.classList.contains('visible');
    
    if (isVisible) {
        iconElement.classList.remove('visible');
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    } else {
        iconElement.classList.add('visible');
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    }
}

// 处理ROI工具栏点击
function handleROIToolClick(btnElement) {
    const title = btnElement.getAttribute('title');
    console.log(`ROI工具栏点击: ${title}`);
    
    // 根据不同的工具执行不同的操作
    switch (title) {
        case '显隐切换':
            toggleSelectedROIVisibility();
            break;
        case '勾画':
            startROIDrawing();
            break;
        case '导航':
            navigateROI();
            break;
        case '网格显隐':
            toggleGridVisibility();
            break;
        case '保存':
            saveROI();
            break;
        case '删除':
            deleteROI();
            break;
        case '撤销':
            undoROIAction();
            break;
        case '合并':
            mergeROI();
            break;
        default:
            console.log(`未处理的ROI工具: ${title}`);
    }
}

// 处理ROI编辑
function handleROIEdit(iconElement) {
    const inputElement = iconElement.parentElement.querySelector('.roi-text-input');
    if (inputElement) {
        inputElement.focus();
        inputElement.select();
    }
}

// 更新ROI属性面板
function updateROIProperties(roiItem) {
    const roiName = roiItem.querySelector('.roi-name').textContent;
    const roiColor = roiItem.querySelector('.roi-color').style.backgroundColor;
    
    // 更新名称输入框
    const nameInput = document.querySelector('.roi-text-input');
    if (nameInput) {
        nameInput.value = roiName;
    }
    
    // 更新颜色指示器
    const colorIndicator = document.querySelector('.roi-color-indicator');
    if (colorIndicator) {
        colorIndicator.style.backgroundColor = roiColor;
    }
    
    console.log(`更新ROI属性: ${roiName}`);
}

// 切换选中ROI的显隐
function toggleSelectedROIVisibility() {
    const activeROI = document.querySelector('.roi-item.active');
    if (activeROI) {
        const visibilityIcon = activeROI.querySelector('.roi-visibility');
        if (visibilityIcon) {
            toggleROIVisibility(visibilityIcon);
        }
    }
}

// 开始ROI勾画
function startROIDrawing() {
    console.log('开始ROI勾画');
    // 这里可以添加勾画逻辑
}

// 导航ROI
function navigateROI() {
    console.log('导航ROI');
    // 这里可以添加导航逻辑
}

// 切换网格显隐
function toggleGridVisibility() {
    console.log('切换网格显隐');
    // 这里可以添加网格显隐逻辑
}

// 保存ROI
function saveROI() {
    console.log('保存ROI');
    // 这里可以添加保存逻辑
}

// 删除ROI
function deleteROI() {
    console.log('删除ROI');
    // 这里可以添加删除逻辑
}

// 撤销ROI操作
function undoROIAction() {
    console.log('撤销ROI操作');
    // 这里可以添加撤销逻辑
}

// 合并ROI
function mergeROI() {
    console.log('合并ROI');
    // 这里可以添加合并逻辑
}

// 初始化左侧栏拖拽调整宽度功能
function initializeLeftPanelResizer() {
    const resizerHandle = document.getElementById('resizerHandle');
    const leftPanel = document.getElementById('imageLeftPanel');
    
    if (!resizerHandle || !leftPanel) return;
    
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    
    resizerHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = parseInt(window.getComputedStyle(leftPanel).width, 10);
        
        // 添加全局事件监听器
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // 防止文本选择
        e.preventDefault();
    });
    
    function handleMouseMove(e) {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const newWidth = startWidth + deltaX;
        
        // 设置最小和最大宽度限制
        const minWidth = 200;
        const maxWidth = 600;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            leftPanel.style.width = newWidth + 'px';
        }
    }
    
    function handleMouseUp() {
        isResizing = false;
        
        // 移除全局事件监听器
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
}

// 切换左侧栏收起展开状态
function toggleLeftPanel() {
    const leftPanel = document.querySelector('.image-left-panel');
    const toggleIcon = document.querySelector('#leftPanelToggle i');
    
    if (leftPanel) {
        const isCollapsed = leftPanel.classList.contains('collapsed');
        
        if (isCollapsed) {
            // 展开左侧栏
            leftPanel.classList.remove('collapsed');
            toggleIcon.classList.remove('fa-chevron-right');
            toggleIcon.classList.add('fa-chevron-left');
        } else {
            // 收起左侧栏
            leftPanel.classList.add('collapsed');
            toggleIcon.classList.remove('fa-chevron-left');
            toggleIcon.classList.add('fa-chevron-right');
        }
    }
}

// 更新图像处理界面文件信息显示
function updateImageFileInfo(fileData) {
    const fileInfoContent = document.getElementById('imageFileInfoContent');
    if (!fileInfoContent || !fileData) return;
    
    const infoItems = fileInfoContent.querySelectorAll('.info-item');
    
    // 更新图像模态
    if (fileData.modality) {
        const modalityItem = Array.from(infoItems).find(item => 
            item.querySelector('.info-label').textContent.includes('图像模态')
        );
        if (modalityItem) {
            modalityItem.querySelector('.info-value').textContent = fileData.modality;
        }
    }
    
    // 更新图像层数
    if (fileData.layers) {
        const layersItem = Array.from(infoItems).find(item => 
            item.querySelector('.info-label').textContent.includes('图像层数')
        );
        if (layersItem) {
            layersItem.querySelector('.info-value').textContent = fileData.layers;
        }
    }
    
    // 更新拍摄日期
    if (fileData.acquisitionDate) {
        const dateItem = Array.from(infoItems).find(item => 
            item.querySelector('.info-label').textContent.includes('拍摄日期')
        );
        if (dateItem) {
            dateItem.querySelector('.info-value').textContent = fileData.acquisitionDate;
        }
    }
    
    // 更新拍摄时间
    if (fileData.acquisitionTime) {
        const timeItem = Array.from(infoItems).find(item => 
            item.querySelector('.info-label').textContent.includes('拍摄时间')
        );
        if (timeItem) {
            timeItem.querySelector('.info-value').textContent = fileData.acquisitionTime;
        }
    }
    
    // 更新序列号
    if (fileData.sequenceNumber) {
        const seqNumItem = Array.from(infoItems).find(item => 
            item.querySelector('.info-label').textContent.includes('序列号')
        );
        if (seqNumItem) {
            seqNumItem.querySelector('.info-value').textContent = fileData.sequenceNumber;
        }
    }
    
    // 更新序列ID
    if (fileData.sequenceId) {
        const seqIdItem = Array.from(infoItems).find(item => 
            item.querySelector('.info-label').textContent.includes('序列ID')
        );
        if (seqIdItem) {
            seqIdItem.querySelector('.info-value').textContent = fileData.sequenceId;
        }
    }
    
    // 更新序列描述
    if (fileData.sequenceDescription) {
        const descItem = Array.from(infoItems).find(item => 
            item.querySelector('.info-label').textContent.includes('序列描述')
        );
        if (descItem) {
            descItem.querySelector('.info-value').textContent = fileData.sequenceDescription;
        }
    }
}

// 处理工具栏按钮点击
function handleToolbarButtonClick(toolName) {
    console.log('工具栏按钮点击:', toolName);
    
    switch(toolName) {
        case '图像融合':
            console.log('执行图像融合操作');
            break;
        case '移动':
            console.log('执行移动操作');
            break;
        case '旋转':
            console.log('执行旋转操作');
            break;
        case '中心对齐':
            console.log('执行中心对齐操作');
            break;
        case '自动对齐':
            console.log('执行自动对齐操作');
            break;
        case '灰度配准':
            console.log('执行灰度配准操作');
            break;
        case '形变配准':
            console.log('执行形变配准操作');
            break;
        case '重置配准':
            console.log('执行重置配准操作');
            break;
        case '能谱CT分析':
            if (!window._spectralCTModal) {
                window._spectralCTModal = new SpectralCTAnalysisComponent({
                    getCurrentGroup: () => {
                        // TODO: 从当前序列树/上下文获取真实影像组
                        return { id: 'group-1', name: '双能CT 20240302 19:02:25' };
                    },
                    getEnergyChoices: () => {
                        // TODO: 返回当前影像组下可用的原始/虚拟单能影像
                        return [
                            { id: '140kvp', label: '140kVp' },
                            { id: '80kvp', label: '80kVp' },
                            { id: 'mono-40', label: '40keV 虚拟单能影像' },
                            { id: 'mono-70', label: '70keV 虚拟单能影像' }
                        ];
                    },
                    getSBIChoices: () => {
                        // TODO: 返回当前影像组下可用的SBI数据
                        return [
                            { id: 'sbi-20240302', label: 'SBI 20240302 19:02:25' }
                        ];
                    },
                    onConfirm: (params) => {
                        // 调用后端生成接口的占位实现
                        console.log('提交能谱CT任务参数:', params);
                        return new Promise((resolve) => setTimeout(resolve, 1200));
                    }
                });
            }
            window._spectralCTModal.open();
            break;
        case '虚拟单能影像':
            if (!window._vmiModal) {
                window._vmiModal = new VirtualMonoEnergyComponent({
                    getCurrentGroup: () => ({ id: 'group-1', name: '双能CT 20240302 19:02:25' }),
                    onConfirm: ({ group, keV }) => {
                        console.log('请求生成虚拟单能影像:', group, keV);
                        // TODO: 调用后端接口生成VMI
                        return new Promise((resolve)=>setTimeout(resolve, 1200));
                    }
                });
            }
            window._vmiModal.open();
            break;
        default:
            console.log('未知工具栏操作');
    }
}

// 监听VMI生成完成事件，刷新患者树/阅片框（占位实现，可对接实际逻辑）
document.addEventListener('vmi-generated', (e) => {
    const { group, keV } = e.detail || {};
    console.log('VMI生成完成，刷新影像组:', group, 'keV=', keV);
    // TODO: 在此处将新图像插入到当前影像组并刷新视图
});

// 显示4D播放器
function show4DPlayer(detail) {
    // 获取4DCT帧数据
    const frames = sequenceTree.get4DCTFrames(detail.groupId);
    
    // 创建4D播放器模态框
    const modal = document.createElement('div');
    modal.className = '4d-player-modal';
    modal.innerHTML = `
        <div class="4d-player-content">
            <div class="4d-player-header">
                <h3>4D播放器 - ${detail.groupName}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="4d-player-body">
                <div class="frame-display">
                    <div class="current-frame">当前帧: <span id="currentFrame">1</span></div>
                    <div class="frame-info">${frames.length} 帧</div>
                </div>
                <div class="controls">
                    <button id="prevFrame">上一帧</button>
                    <button id="playPause">播放</button>
                    <button id="nextFrame">下一帧</button>
                    <input type="range" id="frameSlider" min="1" max="${frames.length}" value="1">
                </div>
                <div class="frame-list">
                    ${frames.map((frame, index) => `
                        <div class="frame-item" data-frame="${index + 1}">
                            ${frame.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .4d-player-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .4d-player-content {
            background: #2d2d2d;
            border-radius: 8px;
            width: 80%;
            max-width: 600px;
            max-height: 80%;
            overflow: hidden;
        }
        .4d-player-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #404040;
        }
        .4d-player-header h3 {
            color: #ffffff;
            margin: 0;
        }
        .close-btn {
            background: none;
            border: none;
            color: #ffffff;
            font-size: 24px;
            cursor: pointer;
        }
        .4d-player-body {
            padding: 20px;
        }
        .frame-display {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            color: #cccccc;
        }
        .controls {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 15px;
        }
        .controls button {
            padding: 8px 16px;
            background: #007acc;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .controls button:hover {
            background: #005a9e;
        }
        #frameSlider {
            flex: 1;
            margin: 0 10px;
        }
        .frame-list {
            max-height: 200px;
            overflow-y: auto;
        }
        .frame-item {
            padding: 8px 12px;
            background: #404040;
            margin-bottom: 5px;
            border-radius: 4px;
            color: #cccccc;
            cursor: pointer;
        }
        .frame-item:hover {
            background: #555555;
        }
        .frame-item.active {
            background: #007acc;
            color: #ffffff;
        }
    `;
    document.head.appendChild(style);
    
    // 绑定事件
    let currentFrame = 1;
    let isPlaying = false;
    let playInterval = null;
    
    const updateFrame = (frameNum) => {
        currentFrame = frameNum;
        document.getElementById('currentFrame').textContent = frameNum;
        document.getElementById('frameSlider').value = frameNum;
        
        // 更新帧列表高亮
        document.querySelectorAll('.frame-item').forEach((item, index) => {
            item.classList.toggle('active', index + 1 === frameNum);
        });
    };
    
    const play = () => {
        isPlaying = true;
        document.getElementById('playPause').textContent = '暂停';
        playInterval = setInterval(() => {
            if (currentFrame < frames.length) {
                updateFrame(currentFrame + 1);
            } else {
                updateFrame(1);
            }
        }, 500);
    };
    
    const pause = () => {
        isPlaying = false;
        document.getElementById('playPause').textContent = '播放';
        clearInterval(playInterval);
    };
    
    // 事件绑定
    document.getElementById('prevFrame').addEventListener('click', () => {
        if (currentFrame > 1) updateFrame(currentFrame - 1);
    });
    
    document.getElementById('nextFrame').addEventListener('click', () => {
        if (currentFrame < frames.length) updateFrame(currentFrame + 1);
    });
    
    document.getElementById('playPause').addEventListener('click', () => {
        if (isPlaying) pause(); else play();
    });
    
    document.getElementById('frameSlider').addEventListener('input', (e) => {
        updateFrame(parseInt(e.target.value));
    });
    
    document.querySelectorAll('.frame-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            updateFrame(index + 1);
        });
    });
    
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });
    
    // 点击模态框背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        }
    });
}

// 初始化左侧标签页
function initializeLeftTabs() {
    const leftTabs = document.querySelectorAll('.left-tab');
    const leftTabContents = document.querySelectorAll('.left-tab-content');
    
    leftTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // 移除所有活动状态
            leftTabs.forEach(t => t.classList.remove('active'));
            leftTabContents.forEach(content => content.classList.remove('active'));
            
            // 激活当前标签页
            tab.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-content');
            if (targetContent) {
                targetContent.classList.add('active');
                
                // 如果是序列树标签页，确保序列树已初始化
                if (targetTab === 'sequence') {
                    initializeImageSequenceTree();
                }

            }
        });
    });
    
    // 初始化ROI和POI交互
    initializeROIAndPOIInteractions();
}

// 初始化ROI和POI交互
function initializeROIAndPOIInteractions() {
    // ROI项目选择
    const roiItems = document.querySelectorAll('.roi-item');
    roiItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // 防止点击按钮时触发选择
            if (e.target.closest('.roi-action-btn')) return;
            
            // 移除其他选中状态
            roiItems.forEach(roi => roi.classList.remove('selected'));
            // 添加选中状态
            item.classList.add('selected');
        });
    });
    
    // POI项目选择
    const poiItems = document.querySelectorAll('.poi-item');
    poiItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // 防止点击按钮时触发选择
            if (e.target.closest('.poi-action-btn')) return;
            
            // 移除其他选中状态
            poiItems.forEach(poi => poi.classList.remove('selected'));
            // 添加选中状态
            item.classList.add('selected');
        });
    });
    
    // ROI和POI操作按钮
    const roiActionBtns = document.querySelectorAll('.roi-action-btn, .poi-action-btn');
    roiActionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.getAttribute('title');
            console.log(`执行${action}操作`);
        });
    });
}

// 初始化ROI勾画类型下拉菜单
function initializeROIDrawingDropdowns() {
    // 绑定下拉菜单触发器
    const dropdownTriggers = document.querySelectorAll('.roi-dropdown-trigger');
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDrawingDropdown(trigger);
        });
    });
    
    // 绑定取消按钮
    const cancelBtns = document.querySelectorAll('.roi-dropdown-cancel');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeDrawingDropdown(btn);
        });
    });
    
    // 绑定确定按钮
    const confirmBtns = document.querySelectorAll('.roi-dropdown-confirm');
    confirmBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDrawingSelection(btn);
        });
    });
    
    // 绑定选项点击事件
    const options = document.querySelectorAll('.roi-dropdown-option');
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!option.classList.contains('disabled')) {
                toggleDrawingOption(option);
            }
        });
    });
    
    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.roi-drawing-dropdown')) {
            closeAllDrawingDropdowns();
        }
    });
}

// 切换勾画类型下拉菜单
function toggleDrawingDropdown(trigger) {
    const dropdown = trigger.parentElement;
    const menu = dropdown.querySelector('.roi-dropdown-menu');
    
    // 关闭其他下拉菜单
    closeAllDrawingDropdowns();
    
    // 切换当前下拉菜单
    if (menu.classList.contains('show')) {
        menu.classList.remove('show');
    } else {
        menu.classList.add('show');
    }
}

// 关闭所有勾画类型下拉菜单
function closeAllDrawingDropdowns() {
    const menus = document.querySelectorAll('.roi-dropdown-menu');
    menus.forEach(menu => {
        menu.classList.remove('show');
    });
}

// 关闭指定下拉菜单
function closeDrawingDropdown(btn) {
    const menu = btn.closest('.roi-dropdown-menu');
    if (menu) {
        menu.classList.remove('show');
    }
}

// 切换勾画选项
function toggleDrawingOption(option) {
    const checkbox = option.querySelector('.roi-type-checkbox');
    checkbox.checked = !checkbox.checked;
    
    // 如果选中了当前选项，取消其他选项
    if (checkbox.checked) {
        const dropdown = option.closest('.roi-dropdown-menu');
        const otherCheckboxes = dropdown.querySelectorAll('.roi-type-checkbox');
        otherCheckboxes.forEach(cb => {
            if (cb !== checkbox) {
                cb.checked = false;
            }
        });
    }
}

// 确认勾画选择
function confirmDrawingSelection(btn) {
    const menu = btn.closest('.roi-dropdown-menu');
    const checkboxes = menu.querySelectorAll('.roi-type-checkbox:checked');
    
    if (checkboxes.length === 0) {
        // 没有选择任何选项
        showDrawingError('请选择一种勾画类型！');
        return;
    }
    
    if (checkboxes.length > 1) {
        // 选择了多个选项
        showDrawingError('请选择唯一勾画！');
        return;
    }
    
    // 选择有效，关闭下拉菜单
    const selectedType = checkboxes[0].closest('.roi-dropdown-option').dataset.type;
    const roiItem = menu.closest('.roi-item');
    
    console.log(`ROI ${roiItem.dataset.roi} 选择勾画类型: ${selectedType}`);
    
    // 更新ROI显示状态
    updateROIDrawingType(roiItem, selectedType);
    
    menu.classList.remove('show');
}

// 显示勾画错误提示
function showDrawingError(message) {
    // 移除现有错误提示
    const existingError = document.querySelector('.roi-drawing-error');
    if (existingError) {
        existingError.remove();
    }
    
    // 创建错误提示
    const errorDiv = document.createElement('div');
    errorDiv.className = 'roi-drawing-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff4444;
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 3000);
}

// 更新ROI勾画类型显示
function updateROIDrawingType(roiItem, drawingType) {
    // 这里可以添加更新ROI勾画类型的逻辑
    // 例如：更新ROI的视觉标识、保存到数据等
    console.log(`更新ROI ${roiItem.dataset.roi} 的勾画类型为: ${drawingType}`);
}

// 初始化ROI工具栏功能
function initializeROIToolbar() {
    const visibilityBtn = document.getElementById('roi-visibility-btn');
    if (visibilityBtn) visibilityBtn.addEventListener('click', handleVisibilityToggle);

    const fillBtn = document.getElementById('roi-fill-btn');
    if (fillBtn) fillBtn.addEventListener('click', handleFillToggle);

    const boldBtn = document.getElementById('roi-bold-btn');
    if (boldBtn) boldBtn.addEventListener('click', handleBoldToggle);

    const assignImageBtn = document.getElementById('roi-assign-image-btn');
    if (assignImageBtn) assignImageBtn.addEventListener('click', handleAssignImage);

    const addBtn = document.getElementById('roi-add-btn');
    if (addBtn) addBtn.addEventListener('click', handleAddROI);

    const syncBtn = document.getElementById('roi-sync-btn');
    if (syncBtn) syncBtn.addEventListener('click', handleSyncDrawing);

    const deleteBtn = document.getElementById('roi-delete-btn');
    if (deleteBtn) deleteBtn.addEventListener('click', handleDeleteDrawing);

    const batchUpdateBtn = document.getElementById('roi-batch-update-btn');
    if (batchUpdateBtn) batchUpdateBtn.addEventListener('click', handleBatchUpdate);
}

// 处理全部显示/隐藏切换
function handleShowAllToggle() {
    const btn = document.getElementById('roi-show-all-btn');
    const isShowing = btn.classList.contains('active');
    
    if (isShowing) {
        // 当前是显示状态，切换为隐藏
        hideAllROIs();
        btn.classList.remove('active');
        btn.title = '全部显示';
        btn.querySelector('i').className = 'fas fa-eye';
    } else {
        // 当前是隐藏状态，切换为显示
        showAllROIs();
        btn.classList.add('active');
        btn.title = '全部隐藏';
        btn.querySelector('i').className = 'fas fa-eye-slash';
    }
}

// 显示所有ROI
function showAllROIs() {
    const visibilityIcons = document.querySelectorAll('.roi-visibility');
    visibilityIcons.forEach(icon => {
        if (!icon.classList.contains('visible')) {
            icon.classList.add('visible');
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
    console.log('显示所有ROI');
}

// 隐藏所有ROI
function hideAllROIs() {
    const visibilityIcons = document.querySelectorAll('.roi-visibility');
    visibilityIcons.forEach(icon => {
        if (icon.classList.contains('visible')) {
            icon.classList.remove('visible');
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });
    console.log('隐藏所有ROI');
}

// 处理全部填充/取消切换
function handleFillAllToggle() {
    const btn = document.getElementById('roi-fill-all-btn');
    const isFilled = btn.classList.contains('active');
    
    if (isFilled) {
        // 当前是填充状态，切换为取消填充
        unfillAllROIs();
        btn.classList.remove('active');
        btn.title = '全部填充';
    } else {
        // 当前是未填充状态，切换为填充
        fillAllROIs();
        btn.classList.add('active');
        btn.title = '全部取消';
    }
}

// 填充所有ROI
function fillAllROIs() {
    const fillCheckboxes = document.querySelectorAll('#roi-fill-checkbox');
    fillCheckboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            const sliderContainer = document.getElementById('roi-fill-slider-container');
            if (sliderContainer) {
                sliderContainer.style.display = 'flex';
            }
        }
    });
    console.log('填充所有ROI');
}

// 取消填充所有ROI
function unfillAllROIs() {
    const fillCheckboxes = document.querySelectorAll('#roi-fill-checkbox');
    fillCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
            const sliderContainer = document.getElementById('roi-fill-slider-container');
            if (sliderContainer) {
                sliderContainer.style.display = 'none';
            }
        }
    });
    console.log('取消填充所有ROI');
}

// 处理全部加粗/取消切换
function handleBoldAllToggle() {
    const btn = document.getElementById('roi-bold-all-btn');
    const isBold = btn.classList.contains('active');
    
    if (isBold) {
        // 当前是加粗状态，切换为取消加粗
        unboldAllROIs();
        btn.classList.remove('active');
        btn.title = '全部加粗';
    } else {
        // 当前是未加粗状态，切换为加粗
        boldAllROIs();
        btn.classList.add('active');
        btn.title = '全部取消';
    }
}

// 加粗所有ROI
function boldAllROIs() {
    // 这里可以添加加粗ROI线条的逻辑
    console.log('加粗所有ROI线条 (2磅)');
}

// 取消加粗所有ROI
function unboldAllROIs() {
    // 这里可以添加取消加粗ROI线条的逻辑
    console.log('取消加粗所有ROI线条 (1磅)');
}

// 处理HU显示切换
function handleHUDisplayToggle() {
    const btn = document.getElementById('roi-hu-display-btn');
    const isShowingHU = btn.classList.contains('active');
    
    if (isShowingHU) {
        // 当前显示赋值后图像，切换为原图像
        showOriginalImage();
        btn.classList.remove('active');
        btn.title = '显示赋值HU的图像';
    } else {
        // 当前显示原图像，切换为赋值后图像
        showHUAssignedImage();
        btn.classList.add('active');
        btn.title = '隐藏赋值HU的图像';
    }
}

// 显示原图像
function showOriginalImage() {
    console.log('显示原图像');
    // 这里可以添加显示原图像的逻辑
}

// 显示赋值HU图像
function showHUAssignedImage() {
    console.log('显示赋值HU的图像');
    // 这里可以添加显示赋值HU图像的逻辑
}

// 处理新建勾画
function handleNewDrawing() {
    const modal = document.getElementById('new-drawing-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

// 初始化新建勾画模态框
function initializeNewDrawingModal() {
    const modal = document.getElementById('new-drawing-modal');
    const closeBtn = document.getElementById('new-drawing-close');
    const cancelBtn = document.getElementById('new-drawing-cancel');
    const confirmBtn = document.getElementById('new-drawing-confirm');
    const radioButtons = document.querySelectorAll('input[name="drawing-type"]');
    
    // 关闭模态框
    function closeModal() {
        modal.classList.remove('show');
    }
    
    // 绑定关闭事件
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // 绑定确定事件
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleNewDrawingConfirm);
    }
    
    // 绑定绘制类型切换
    radioButtons.forEach(radio => {
        radio.addEventListener('change', handleDrawingTypeChange);
    });
    
    // 绑定颜色选择器
    const colorPicker = document.getElementById('new-roi-color-picker');
    if (colorPicker) {
        colorPicker.addEventListener('click', handleColorPickerClick);
    }
    
    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// 处理绘制类型切换
function handleDrawingTypeChange(e) {
    const roiForm = document.getElementById('roi-form');
    const structForm = document.getElementById('struct-form');
    
    if (e.target.value === 'roi') {
        roiForm.style.display = 'flex';
        structForm.style.display = 'none';
    } else {
        roiForm.style.display = 'none';
        structForm.style.display = 'flex';
    }
}

// 处理颜色选择器点击
function handleColorPickerClick() {
    // 颜色选择器功能待实现
}

// 处理新建勾画确认
function handleNewDrawingConfirm() {
    const selectedType = document.querySelector('input[name="drawing-type"]:checked').value;
    
    if (selectedType === 'roi') {
        const name = document.getElementById('new-roi-name').value.trim();
        const color = document.getElementById('new-roi-color').style.backgroundColor;
        const type = document.getElementById('new-roi-type').value;
        const material = document.getElementById('new-roi-material').value;
        
        if (!name) {
            alert('请输入ROI名称');
            return;
        }
        
        // 创建新ROI逻辑待实现
        
    } else {
        const name = document.getElementById('new-struct-name').value.trim();
        const description = document.getElementById('new-struct-description').value.trim();
        
        if (!name) {
            alert('请输入Struct名称');
            return;
        }
        
        // 创建新Struct逻辑待实现
    }
    
    // 关闭模态框
    document.getElementById('new-drawing-modal').classList.remove('show');
}

// ... existing code ...
// ROI工具栏处理函数 - 统一处理
const roiHandlers = {
    'visibility': () => { /* 显隐功能待实现 */ },
    'fill': () => { /* 填充功能待实现 */ },
    'bold': () => { /* 加粗功能待实现 */ },
    'assign-image': () => { /* 赋值图像功能待实现 */ },
    'add': () => { /* 新增功能待实现 */ },
    'sync': () => { /* 同步功能待实现 */ },
    'delete': () => { /* 删除功能待实现 */ },
    'batch-update': () => { /* 更新衍生ROI功能待实现 */ }
};

// 保持向后兼容的函数名
function handleVisibilityToggle() { roiHandlers.visibility(); }
function handleFillToggle() { roiHandlers.fill(); }
function handleBoldToggle() { roiHandlers.bold(); }
function handleAssignImage() { roiHandlers['assign-image'](); }
function handleAddROI() { roiHandlers.add(); }
function handleSyncDrawing() { roiHandlers.sync(); }
function handleDeleteDrawing() { roiHandlers.delete(); }
function handleBatchUpdate() { roiHandlers['batch-update'](); }

// POI控制面板功能
function initializePOIPanel() {
    // 绑定POI分类展开/收起事件
    const categoryHeaders = document.querySelectorAll('.poi-category-header');
    categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const category = header.parentElement;
            category.classList.toggle('expanded');
        });
    });
    
    // 绑定POI项目选择事件
    const poiItems = document.querySelectorAll('.poi-item');
    poiItems.forEach(item => {
        item.addEventListener('click', () => {
            selectPOIItem(item);
        });
    });
    
    // 绑定POI显隐切换事件
    const visibilityIcons = document.querySelectorAll('.poi-visibility');
    visibilityIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePOIVisibility(icon);
        });
    });
    
    // 绑定POI工具栏事件
    initializePOIToolbar();
    
    // 绑定POI属性编辑事件
    initializePOIProperties();
}

// 选择POI项目
function selectPOIItem(itemElement) {
    // 移除所有active类
    const allItems = document.querySelectorAll('.poi-item');
    allItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // 添加active类到当前项
    itemElement.classList.add('active');
    
    // 更新POI属性面板
    updatePOIProperties(itemElement);
}

// 切换POI显隐
function togglePOIVisibility(iconElement) {
    const isVisible = iconElement.classList.contains('visible');
    
    if (isVisible) {
        iconElement.classList.remove('visible');
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    } else {
        iconElement.classList.add('visible');
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    }
}

// 初始化POI工具栏
function initializePOIToolbar() {
    const visibilityBtn = document.getElementById('poi-visibility-btn');
    if (visibilityBtn) visibilityBtn.addEventListener('click', handlePOIVisibilityToggle);
    
    const newBtn = document.getElementById('poi-new-btn');
    if (newBtn) newBtn.addEventListener('click', handlePOINew);
    
    const deleteBtn = document.getElementById('poi-delete-btn');
    if (deleteBtn) deleteBtn.addEventListener('click', handlePOIDelete);
    
    const moveBtn = document.getElementById('poi-move-btn');
    if (moveBtn) moveBtn.addEventListener('click', handlePOIMove);
}

// POI工具栏处理函数
function handlePOIVisibilityToggle() { /* 全局显隐功能待实现 */ }
function handlePOINew() { /* 新建点功能待实现 */ }
function handlePOIDelete() { /* 删除点功能待实现 */ }
function handlePOIMove() { /* 移动点功能待实现 */ }

// 初始化POI属性编辑
function initializePOIProperties() {
    // 绑定颜色指示器点击事件
    const colorIndicators = document.querySelectorAll('.poi-color-indicator');
    colorIndicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            showPOIColorPicker(indicator);
        });
    });
    
    // 绑定名称编辑事件
    const nameInputs = document.querySelectorAll('.poi-text-input');
    nameInputs.forEach(input => {
        input.addEventListener('blur', handlePOINameBlur);
        input.addEventListener('change', handlePOINameChange);
    });
    
    // 绑定类型选择事件
    const typeSelects = document.querySelectorAll('.poi-select');
    typeSelects.forEach(select => {
        select.addEventListener('change', handlePOITypeChange);
    });
    
    // 绑定坐标输入事件
    const coordInputs = document.querySelectorAll('.poi-coord-input');
    coordInputs.forEach(input => {
        input.addEventListener('blur', handlePOICoordBlur);
        input.addEventListener('change', handlePOICoordChange);
    });
}

// 更新POI属性面板
function updatePOIProperties(poiItem) {
    const poiName = poiItem.querySelector('.poi-name').textContent;
    const poiColor = poiItem.querySelector('.poi-color').style.backgroundColor;
    
    // 更新名称输入框
    const nameInput = document.querySelector('.poi-text-input');
    if (nameInput) {
        nameInput.value = poiName;
    }
    
    // 更新颜色指示器
    const colorIndicator = document.querySelector('.poi-color-indicator');
    if (colorIndicator) {
        colorIndicator.style.backgroundColor = poiColor;
    }
    
    // 这里可以添加更多属性更新逻辑
}

// POI颜色选择器
function showPOIColorPicker(colorIndicator) {
    // 颜色选择器功能待实现
}

// POI名称处理
function handlePOINameBlur(e) {
    const newName = e.target.value.trim();
    if (newName) {
        // 更新POI名称逻辑待实现
    }
}

function handlePOINameChange(e) {
    // POI名称变化处理逻辑待实现
}

// POI类型处理
function handlePOITypeChange(e) {
    // POI类型变化处理逻辑待实现
}

// POI坐标处理
function handlePOICoordBlur(e) {
    const coordValue = parseFloat(e.target.value);
    if (!isNaN(coordValue)) {
        // 坐标验证和更新逻辑待实现
    }
}

function handlePOICoordChange(e) {
    // POI坐标变化处理逻辑待实现
}

// 工具栏展开收起功能
// 通用工具栏展开收起功能
function initializeToolbarToggle() {
    const toolbar = document.getElementById('imageProcessingToolbar');
    const toggleBtn = document.getElementById('toolbarToggleBtn');
    
    if (!toolbar || !toggleBtn) return;
    
    // 默认展开状态
    toolbar.classList.add('expanded');
    
    // 检查是否已经绑定过事件（避免重复绑定）
    if (toggleBtn.dataset.toolbarToggleBound === 'true') {
        return;
    }
    
    // 标记已绑定
    toggleBtn.dataset.toolbarToggleBound = 'true';
    
    // 绑定点击事件
    toggleBtn.addEventListener('click', () => {
        toggleToolbar();
    });
}

function toggleToolbar() {
    const toolbar = document.getElementById('imageProcessingToolbar');
    const toggleBtn = document.getElementById('toolbarToggleBtn');
    const icon = toggleBtn.querySelector('i');
    
    if (!toolbar || !toggleBtn || !icon) return;
    
    if (toolbar.classList.contains('expanded')) {
        // 收起工具栏
        toolbar.classList.remove('expanded');
        toolbar.classList.add('collapsed');
        icon.className = 'fas fa-chevron-down';
        
        // 调整2D视图的顶部间距
        updateImageViewsMargin(40);
    } else {
        // 展开工具栏
        toolbar.classList.remove('collapsed');
        toolbar.classList.add('expanded');
        icon.className = 'fas fa-chevron-up';
        
        // 调整2D视图的顶部间距
        updateImageViewsMargin(70);
    }
}

function updateImageViewsMargin(marginTop) {
    const imageViews = document.querySelector('.image-processing-content .image-views');
    if (imageViews) {
        imageViews.style.marginTop = marginTop + 'px';
    }
}

// 通用工具栏展开收起初始化函数（支持多个模块）
function initializeModuleToolbarToggle(toolbarId, toggleBtnId, contentSelector) {
    const toolbar = document.getElementById(toolbarId);
    const toggleBtn = document.getElementById(toggleBtnId);
    
    if (!toolbar || !toggleBtn) return;
    
    // 判断是否是计划设计模块（使用 .plan-image-area）
    const isPlanDesign = contentSelector === '.plan-image-area';
    
    // 默认展开状态
    toolbar.classList.add('expanded');
    
    // 设置初始间距
    if (contentSelector && isPlanDesign) {
        const content = document.querySelector(contentSelector);
        if (content) {
            // 计划设计模块：使用 marginTop，保持1px间距（70px工具栏 + 1px = 71px）
            content.style.marginTop = '71px';
            content.style.paddingTop = ''; // 清除可能存在的 paddingTop
        }
    }
    
    // 检查是否已经绑定过事件（避免重复绑定）
    if (toggleBtn.dataset.toolbarToggleBound === 'true') {
        return;
    }
    
    // 标记已绑定
    toggleBtn.dataset.toolbarToggleBound = 'true';
    
    // 绑定点击事件
    toggleBtn.addEventListener('click', () => {
        toggleModuleToolbar(toolbarId, toggleBtnId, contentSelector);
    });
}

function toggleModuleToolbar(toolbarId, toggleBtnId, contentSelector) {
    const toolbar = document.getElementById(toolbarId);
    const toggleBtn = document.getElementById(toggleBtnId);
    const icon = toggleBtn ? toggleBtn.querySelector('i') : null;
    
    if (!toolbar || !toggleBtn || !icon) {
        return;
    }
    
    // 判断是否是计划设计模块（使用 .plan-image-area）
    const isPlanDesign = contentSelector === '.plan-image-area';
    
    if (toolbar.classList.contains('expanded')) {
        // 收起工具栏
        toolbar.classList.remove('expanded');
        toolbar.classList.add('collapsed');
        icon.className = 'fas fa-chevron-down';
        
        // 调整内容区域的顶部间距
        if (contentSelector) {
            const content = document.querySelector(contentSelector);
            if (content) {
                if (isPlanDesign) {
                    // 计划设计模块：使用 marginTop，保持1px间距（40px工具栏 + 1px = 41px）
                    content.style.marginTop = '41px';
                    content.style.paddingTop = ''; // 清除可能存在的 paddingTop
                } else {
                    // 其他模块：使用 paddingTop
                    content.style.paddingTop = '40px';
                }
            }
        }
    } else {
        // 展开工具栏
        toolbar.classList.remove('collapsed');
        toolbar.classList.add('expanded');
        icon.className = 'fas fa-chevron-up';
        
        // 调整内容区域的顶部间距
        if (contentSelector) {
            const content = document.querySelector(contentSelector);
            if (content) {
                if (isPlanDesign) {
                    // 计划设计模块：使用 marginTop，保持1px间距（70px工具栏 + 1px = 71px）
                    content.style.marginTop = '71px';
                    content.style.paddingTop = ''; // 清除可能存在的 paddingTop
                } else {
                    // 其他模块：使用 paddingTop
                    content.style.paddingTop = '70px';
                }
            }
        }
    }
}

// 图像信息显示功能
function initializeImageInfoDisplay() {
    // 初始化鼠标跟踪
    initializeMouseTracking();
    
    // 初始化切片导航
    initializeSliceNavigation();
    
    // 初始化图像类型检测
    initializeImageTypeDetection();
}

// 初始化鼠标跟踪
function initializeMouseTracking() {
    const imageContainers = document.querySelectorAll('.image-container');
    
    imageContainers.forEach(container => {
        container.addEventListener('mousemove', (e) => {
            handleMouseMove(e, container);
        });
        
        container.addEventListener('mouseleave', (e) => {
            handleMouseLeave(e, container);
        });
        
        container.addEventListener('wheel', (e) => {
            handleSliceWheel(e, container);
        });
    });
}

// 鼠标移动处理
function handleMouseMove(e, container) {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 计算相对坐标
    const relativeX = (x / rect.width) * 100;
    const relativeY = (y / rect.height) * 100;
    
    // 更新位置信息
    updatePositionInfo(container, relativeX, relativeY);
    
    // 更新HU值（如果是CT图像）
    updateHUValue(container, relativeX, relativeY);
    
    // 更新密度值（如果是MR图像）
    updateDensityValue(container, relativeX, relativeY);
    
    // 更新剂量值
    updateDoseValue(container, relativeX, relativeY);
    
    // 更新SPR值
    updateSPRValue(container, relativeX, relativeY);
}

// 鼠标离开处理
function handleMouseLeave(e, container) {
    // 清空实时更新的值
    clearRealTimeValues(container);
}

// 切片滚轮处理
function handleSliceWheel(e, container) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    navigateSliceByWheel(container, delta);
}

// 更新位置信息
function updatePositionInfo(container, x, y) {
    const positionElement = container.querySelector('[id*="mouse-position"]');
    if (positionElement) {
        const z = getCurrentSliceNumber(container);
        positionElement.textContent = `X: ${x.toFixed(1)}, Y: ${y.toFixed(1)}, Z: ${z}`;
    }
}

// 更新HU值
function updateHUValue(container, x, y) {
    const huElement = container.querySelector('[id*="hu-value"]');
    const huInfo = container.querySelector('[id*="hu-info"]');
    
    if (huElement && huInfo && isCTImage(container)) {
        const huValue = calculateHUValue(x, y);
        huElement.textContent = huValue;
        huInfo.style.display = 'flex';
    }
}

// 更新密度值
function updateDensityValue(container, x, y) {
    const densityElement = container.querySelector('[id*="density-value"]');
    const densityInfo = container.querySelector('[id*="density-info"]');
    
    if (densityElement && densityInfo && isMRImage(container)) {
        const densityValue = calculateDensityValue(x, y);
        densityElement.textContent = densityValue.toFixed(2);
        densityInfo.style.display = 'flex';
    }
}

// 更新剂量值
function updateDoseValue(container, x, y) {
    const doseElement = container.querySelector('[id*="dose-value"]');
    const doseInfo = container.querySelector('[id*="dose-info"]');
    
    if (doseElement && doseInfo && hasDoseData(container)) {
        const doseValue = calculateDoseValue(x, y);
        doseElement.textContent = `${doseValue.toFixed(1)} cGy`;
        doseInfo.style.display = 'flex';
    }
}

// 更新SPR值
function updateSPRValue(container, x, y) {
    const sprElement = container.querySelector('[id*="spr-value"]');
    if (sprElement) {
        const sprValue = calculateSPRValue(x, y);
        sprElement.textContent = sprValue.toFixed(2);
    }
}

// 清空实时值
function clearRealTimeValues(container) {
    const realTimeElements = container.querySelectorAll('[id*="hu-value"], [id*="density-value"], [id*="dose-value"], [id*="spr-value"]');
    realTimeElements.forEach(element => {
        if (element.id.includes('hu-value') || element.id.includes('density-value') || element.id.includes('dose-value') || element.id.includes('spr-value')) {
            element.textContent = '0';
        }
    });
}

// 获取当前切片号
function getCurrentSliceNumber(container) {
    const sliceInfo = container.querySelector('[id*="slice-info"]');
    if (sliceInfo) {
        const text = sliceInfo.textContent;
        const match = text.match(/(\d+)\/\d+/);
        return match ? parseInt(match[1]) : 0;
    }
    return 0;
}

// 检查是否为CT图像
function isCTImage(container) {
    // 根据实际图像类型判断
    return container.closest('.axial-view') !== null;
}

// 检查是否为MR图像
function isMRImage(container) {
    // 根据实际图像类型判断
    return false; // 示例中假设不是MR图像
}

// 检查是否有剂量数据
function hasDoseData(container) {
    // 检查是否有剂量覆盖层
    return container.querySelector('.dose-overlay') !== null;
}

// 计算HU值
function calculateHUValue(x, y) {
    // 模拟HU值计算
    return Math.floor(Math.random() * 2000 - 1000);
}

// 计算密度值
function calculateDensityValue(x, y) {
    // 模拟密度值计算
    return Math.random() * 2.0;
}

// 计算剂量值
function calculateDoseValue(x, y) {
    // 模拟剂量值计算
    return Math.random() * 5000;
}

// 计算SPR值
function calculateSPRValue(x, y) {
    // 模拟SPR值计算
    return Math.random() * 3.0;
}

// 滚轮切片导航
function navigateSliceByWheel(container, direction) {
    const sliceInfo = container.querySelector('[id*="slice-info"]');
    if (sliceInfo) {
        const text = sliceInfo.textContent;
        const match = text.match(/(\d+)\/(\d+)/);
        if (match) {
            const current = parseInt(match[1]);
            const total = parseInt(match[2]);
            const newSlice = Math.max(1, Math.min(total, current + direction));
            sliceInfo.textContent = `${newSlice}/${total}`;
        }
    }
}

// 初始化切片导航
function initializeSliceNavigation() {
    // 切片导航功能已在之前实现
}

// 初始化图像类型检测
function initializeImageTypeDetection() {
    // 根据加载的图像类型显示相应的信息
    const imageContainers = document.querySelectorAll('.image-container');
    
    imageContainers.forEach(container => {
        // 检测图像类型并显示相应信息
        if (isCTImage(container)) {
            showCTInfo(container);
        } else if (isMRImage(container)) {
            showMRInfo(container);
        }
    });
}

// 显示CT信息
function showCTInfo(container) {
    const huInfo = container.querySelector('[id*="hu-info"]');
    if (huInfo) {
        huInfo.style.display = 'flex';
    }
}

// 显示MR信息
function showMRInfo(container) {
    const densityInfo = container.querySelector('[id*="density-info"]');
    if (densityInfo) {
        densityInfo.style.display = 'flex';
    }
}

// 导入模态对话框功能
function initializeImportModal() {
    const importModal = document.getElementById('importModal');
    const importModalClose = document.getElementById('importModalClose');
    const importCancelBtn = document.getElementById('importCancelBtn');
    const importConfirmBtn = document.getElementById('importConfirmBtn');
    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const folderPath = document.getElementById('exportFolderPath');
    const searchSubfolders = document.getElementById('searchSubfolders');
    const selectAllPatients = document.getElementById('selectAllPatients');
    
    // 导入标签页切换
    const importTabs = document.querySelectorAll('.import-tabs .tab-item');
    const localImportContent = document.getElementById('localImportContent');
    const remoteImportContent = document.getElementById('remoteImportContent');
    
    importTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-tab');
            
            // 更新标签页状态
            importTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 显示对应内容
            if (tabType === 'local') {
                localImportContent.style.display = 'block';
                remoteImportContent.style.display = 'none';
            } else if (tabType === 'remote') {
                localImportContent.style.display = 'none';
                remoteImportContent.style.display = 'block';
            }
        });
    });
    
    // 关闭模态对话框
    function closeImportModal() {
        importModal.style.display = 'none';
    }
    
    if (importModalClose) {
        importModalClose.addEventListener('click', closeImportModal);
    }
    
    if (importCancelBtn) {
        importCancelBtn.addEventListener('click', closeImportModal);
    }
    
    // 点击模态对话框外部关闭
    importModal.addEventListener('click', (e) => {
        if (e.target === importModal) {
            closeImportModal();
        }
    });
    
    // 文件夹选择功能
    if (selectFolderBtn) {
        selectFolderBtn.addEventListener('click', () => {
            // 模拟文件夹选择
            const selectedFolderPath = prompt('请输入文件夹路径:');
            if (selectedFolderPath) {
                document.getElementById('importFolderPath').value = selectedFolderPath;
                // 模拟检索文件夹
                simulateFolderScan(selectedFolderPath);
            }
        });
    }
    
    // 文件夹路径输入
    const importFolderPath = document.getElementById('importFolderPath');
    if (importFolderPath) {
        importFolderPath.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const path = importFolderPath.value.trim();
                if (path) {
                    simulateFolderScan(path);
                }
            }
        });
    }
    
    // 全选患者功能
    if (selectAllPatients) {
        selectAllPatients.addEventListener('change', (e) => {
            const patientCheckboxes = document.querySelectorAll('#patientList input[type="checkbox"]');
            patientCheckboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            updateImageTree();
        });
    }
    
    // 确认导入
    if (importConfirmBtn) {
        importConfirmBtn.addEventListener('click', () => {
            startImportProcess();
        });
    }
}

// 模拟文件夹扫描
function simulateFolderScan(folderPath) {
    // 显示扫描进度
    showScanProgress();
    
    // 模拟扫描延迟
    setTimeout(() => {
        // 生成模拟患者数据
        const mockPatients = generateMockPatients();
        renderPatientList(mockPatients);
        
        // 生成模拟图像树数据
        const mockImageTree = generateMockImageTree();
        renderImageTree(mockImageTree);
        
        hideScanProgress();
    }, 2000);
}

// 显示扫描进度
function showScanProgress() {
    const patientList = document.getElementById('patientList');
    patientList.innerHTML = '<div class="scan-progress">正在扫描文件夹...</div>';
}

// 隐藏扫描进度
function hideScanProgress() {
    // 进度会被实际内容替换
}

// 生成模拟患者数据
function generateMockPatients() {
    return [
        {
            id: '12345678',
            name: 'Zhangsan',
            patientId: '20212344'
        },
        {
            id: '87654321',
            name: 'Lisi',
            patientId: '20212345'
        },
        {
            id: '11223344',
            name: 'Wangwu',
            patientId: '20212346'
        }
    ];
}

// 渲染患者列表
function renderPatientList(patients) {
    const patientList = document.getElementById('patientList');
    patientList.innerHTML = '';
    
    patients.forEach((patient, index) => {
        const patientItem = document.createElement('div');
        patientItem.className = 'patient-item';
        patientItem.innerHTML = `
            <input type="checkbox" id="patient-${index}" data-patient-id="${patient.id}">
            <label for="patient-${index}" class="patient-info">
                ${patient.name}（Patient ID：${patient.patientId}）
            </label>
        `;
        
        // 添加患者选择事件
        const checkbox = patientItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            updateImageTree();
        });
        
        patientList.appendChild(patientItem);
    });
}

// 生成模拟图像树数据
function generateMockImageTree() {
    return {
        patient: {
            name: 'Zhangsan1',
            patientId: '20212344',
            studies: [
                {
                    description: 'CT simulation',
                    studyId: '20212344',
                    images: [
                        {
                            modality: 'CT1',
                            date: '2023-10-01',
                            time: '12:00:00',
                            files: 109
                        }
                    ],
                    rtStructs: [
                        {
                            label: 'Srtuct3',
                            date: '2023-10-01',
                            time: '12:00:00'
                        }
                    ],
                    rtPlans: [
                        {
                            label: 'ARTPlan',
                            date: '2023-10-01',
                            time: '12:00:00',
                            rtDoses: [
                                {
                                    label: 'Dose11',
                                    date: '2023-10-01',
                                    time: '12:00:00'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };
}

// 渲染图像树
function renderImageTree(imageTree) {
    const imageTreeContainer = document.getElementById('imageTree');
    imageTreeContainer.innerHTML = '';
    
    const patient = imageTree.patient;
    const patientNode = createTreeNode(
        `${patient.name} (Patient ID:${patient.patientId})`,
        'patient',
        true
    );
    
    patient.studies.forEach(study => {
        const studyNode = createTreeNode(
            `Study:${study.description} (Study ID:${study.studyId})`,
            'study',
            true
        );
        
        // 添加图像
        study.images.forEach(image => {
            const imageNode = createTreeNode(
                `Image:${image.modality} ${image.date} ${image.time}(files:${image.files})`,
                'image',
                true
            );
            studyNode.appendChild(imageNode);
        });
        
        // 添加RTStruct
        study.rtStructs.forEach(rtStruct => {
            const rtStructNode = createTreeNode(
                `RTStruct:${rtStruct.label} ${rtStruct.date} ${rtStruct.time}`,
                'rtstruct',
                true
            );
            studyNode.appendChild(rtStructNode);
        });
        
        // 添加RTPlan
        study.rtPlans.forEach(rtPlan => {
            const rtPlanNode = createTreeNode(
                `RTPlan:${rtPlan.label} ${rtPlan.date} ${rtPlan.time}`,
                'rtplan',
                true
            );
            
            // 添加RTDose
            rtPlan.rtDoses.forEach(rtDose => {
                const rtDoseNode = createTreeNode(
                    `RTDose:${rtDose.label} ${rtDose.date} ${rtDose.time}`,
                    'rtdose',
                    true
                );
                rtPlanNode.appendChild(rtDoseNode);
            });
            
            studyNode.appendChild(rtPlanNode);
        });
        
        patientNode.appendChild(studyNode);
    });
    
    imageTreeContainer.appendChild(patientNode);
}

// 创建树节点
function createTreeNode(text, type, checked = false) {
    const node = document.createElement('div');
    node.className = 'tree-node';
    
    const treeItem = document.createElement('div');
    treeItem.className = 'tree-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    checkbox.setAttribute('data-type', type);
    
    const content = document.createElement('div');
    content.className = 'tree-content';
    content.textContent = text;
    
    treeItem.appendChild(checkbox);
    treeItem.appendChild(content);
    node.appendChild(treeItem);
    
    return node;
}

// 更新图像树
function updateImageTree() {
    const selectedPatients = document.querySelectorAll('#patientList input[type="checkbox"]:checked');
    // 这里可以根据选中的患者更新图像树
    console.log('Selected patients:', selectedPatients.length);
}

// 开始导入进程
function startImportProcess() {
    const selectedPatients = document.querySelectorAll('#patientList input[type="checkbox"]:checked');
    
    if (selectedPatients.length === 0) {
        alert('请至少选择一个患者');
        return;
    }
    
    // 显示导入进度
    showImportProgress();
    
    // 模拟导入过程
    setTimeout(() => {
        hideImportProgress();
        showImportResult(true, selectedPatients.length);
    }, 3000);
}

// 显示导入进度
function showImportProgress() {
    // 创建进度模态对话框
    const progressModal = document.createElement('div');
    progressModal.className = 'modal-overlay';
    progressModal.id = 'importProgressModal';
    progressModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-header">
                <h3>导入进度</h3>
            </div>
            <div class="modal-body">
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">正在导入数据...</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(progressModal);
    
    // 模拟进度更新
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        if (progressText) {
            progressText.textContent = `导入进度: ${Math.round(progress)}%`;
        }
        
        if (progress >= 100) {
            clearInterval(progressInterval);
        }
    }, 200);
}

// 隐藏导入进度
function hideImportProgress() {
    const progressModal = document.getElementById('importProgressModal');
    if (progressModal) {
        progressModal.remove();
    }
}

// 显示导入结果
function showImportResult(success, count) {
    const resultModal = document.createElement('div');
    resultModal.className = 'modal-overlay';
    resultModal.id = 'importResultModal';
    
    if (success) {
        resultModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>导入成功</h3>
                </div>
                <div class="modal-body">
                    <p>成功导入 ${count} 个患者的数据</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeImportResult()">确定</button>
                </div>
            </div>
        `;
    } else {
        resultModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>导入失败</h3>
                </div>
                <div class="modal-body">
                    <p>导入过程中出现错误，请检查数据格式</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeImportResult()">确定</button>
                </div>
            </div>
        `;
    }
    
    document.body.appendChild(resultModal);
}

// 关闭导入结果
function closeImportResult() {
    const resultModal = document.getElementById('importResultModal');
    if (resultModal) {
        resultModal.remove();
    }
    
    // 关闭导入模态对话框
    const importModal = document.getElementById('importModal');
    if (importModal) {
        importModal.style.display = 'none';
    }
}

// 靶区勾画模块初始化
function initTargetDelineationModule() {
    // 初始化左侧面板
    initializeTargetLeftPanel();
    
    // 初始化工具栏
    initializeTargetToolbar();
    
    // 初始化图像视图
    initializeTargetImageViews();
    
    // 初始化序列树
    initializeTargetSequenceTree();
    
    // 初始化ROI面板
    initializeTargetROIPanel();
    
    // 初始化POI面板
    initializeTargetPOIPanel();
    
    // 初始化配准面板
    initializeTargetRegistrationPanel();
    
    // 初始化左侧栏导航切换
    initializeTargetVerticalNav();
}

// 初始化靶区勾画左侧面板
function initializeTargetLeftPanel() {
    const targetLeftPanel = document.getElementById('targetLeftPanel');
    const targetLeftPanelToggle = document.getElementById('targetLeftPanelToggle');
    const targetResizerHandle = document.getElementById('targetResizerHandle');
    
    if (!targetLeftPanel || !targetLeftPanelToggle || !targetResizerHandle) return;
    
    // 左侧面板展开/收起
    targetLeftPanelToggle.addEventListener('click', function() {
        targetLeftPanel.classList.toggle('collapsed');
        const icon = targetLeftPanelToggle.querySelector('i');
        if (targetLeftPanel.classList.contains('collapsed')) {
            icon.className = 'fas fa-chevron-right';
        } else {
            icon.className = 'fas fa-chevron-left';
        }
        
        // 调整工具栏和2D视图宽度
        adjustTargetToolbarAndImageViewsWidth();
    });
    
    // 左侧面板拖拽调整宽度
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    
    targetResizerHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        startX = e.clientX;
        startWidth = targetLeftPanel.offsetWidth;
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    });
    
    function handleResize(e) {
        if (!isResizing) return;
        const newWidth = startWidth + (e.clientX - startX);
        const minWidth = 200;
        const maxWidth = 500;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            targetLeftPanel.style.width = newWidth + 'px';
        }
    }
    
    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    }
}

// 初始化靶区勾画工具栏
function initializeTargetToolbar() {
    const targetToolbar = document.getElementById('targetDelineationToolbar');
    const targetToolbarToggle = document.getElementById('targetToolbarToggleBtn');
    
    if (!targetToolbar || !targetToolbarToggle) {
        console.warn('靶区勾画工具栏或切换按钮未找到');
        return;
    }
    
    console.log('初始化靶区勾画工具栏');
    
    // 默认展开状态
    targetToolbar.classList.add('expanded');
    
    // 工具栏展开/收起 - 检查是否已绑定
    if (targetToolbarToggle.dataset.toggleBound !== 'true') {
        targetToolbarToggle.dataset.toggleBound = 'true';
        targetToolbarToggle.addEventListener('click', function() {
            targetToolbar.classList.toggle('expanded');
            targetToolbar.classList.toggle('collapsed');
            const icon = targetToolbarToggle.querySelector('i');
            if (targetToolbar.classList.contains('collapsed')) {
                icon.className = 'fas fa-chevron-down';
            } else {
                icon.className = 'fas fa-chevron-up';
            }
            
            // 调整2D视图的顶部距离
            adjustTargetImageViewsMarginTop();
        });
    }
    
    // 工具栏按钮点击事件
    const toolbarButtons = targetToolbar.querySelectorAll('.toolbar-btn');
    console.log('找到工具栏按钮数量:', toolbarButtons.length);
    
    toolbarButtons.forEach((button, index) => {
        const span = button.querySelector('span');
        const buttonText = span ? span.textContent.trim() : '';
        console.log(`按钮 ${index}: "${buttonText}"`);
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('按钮被点击:', buttonText);
            
            // 移除其他按钮的active状态
            toolbarButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的active状态
            this.classList.add('active');
            
            // 处理工具选择
            const toolName = span ? span.textContent.trim() : '';
            console.log('调用handleTargetToolSelection，工具名称:', toolName);
            handleTargetToolSelection(toolName);
        });
    });
}

// 处理靶区勾画工具选择
function handleTargetToolSelection(toolName) {
    console.log('选择工具:', toolName);
    console.log('工具名称类型:', typeof toolName);
    console.log('工具名称长度:', toolName ? toolName.length : 0);
    
    switch(toolName) {
        case '画刷':
            setTargetDrawingMode('brush');
            break;
        case '画笔':
            setTargetDrawingMode('pen');
            break;
        case '图形':
            setTargetDrawingMode('shape');
            break;
        case 'HU值勾画':
            setTargetDrawingMode('hu');
            break;
        case '复制':
            copyTargetContour();
            break;
        case '粘贴':
            pasteTargetContour();
            break;
        case '裁切':
            cutTargetContour();
            break;
        case '外扩/内缩':
            expandTargetContour();
            break;
        case '外扩环带':
            expandTargetRing();
            break;
        case '差值勾画':
            differenceTargetContour();
            break;
        case '组合公式':
            openTargetFormulaDialog();
            break;
        case '设置床结构':
            openTargetBedStructureDialog();
            break;
        case '设置床模版':
            openTargetBedTemplateDialog();
            break;
        case '勾画审批':
            openTargetApprovalDialog();
            break;
        case 'RTV勾画':
            setTargetDrawingMode('rtv');
            break;
        case '光谱直方图':
            openTargetHistogramDialog();
            break;
        case '光谱散点图':
            openTargetScatterDialog();
            break;
        case '能谱线性分析':
            openTargetLinearAnalysisDialog();
            break;
        case 'SPR勾画':
            console.log('进入SPR勾画case分支');
            openSPRDelineationModal();
            break;
        case '切割':
            console.log('进入切割case分支');
            openCuttingModal();
            break;
        default:
            console.log('未匹配的工具:', toolName);
            break;
    }
}

// 靶区勾画工具函数
function setTargetDrawingMode(mode) {
    console.log('设置勾画模式:', mode);
    // 实现勾画模式设置
}

// 打开SPR勾画弹窗
let sprDelineationComponent = null;

function openSPRDelineationModal() {
    console.log('openSPRDelineationModal called');
    console.log('SPRDelineationComponent available:', typeof window.SPRDelineationComponent);
    
    if (!window.SPRDelineationComponent) {
        console.error('SPRDelineationComponent not loaded');
        alert('SPR勾画组件未加载，请检查组件文件是否正确引入');
        return;
    }
    
    // 如果组件已存在，直接显示
    if (sprDelineationComponent) {
        console.log('Showing existing SPR component');
        sprDelineationComponent.show();
        return;
    }
    
    console.log('Creating new SPR component');
    // 创建新组件
    sprDelineationComponent = new window.SPRDelineationComponent({
        onConfirm: (result) => {
            console.log('SPR勾画确认:', result);
            handleSPRDelineationConfirm(result);
        },
        onCancel: () => {
            console.log('SPR勾画取消');
        },
        getROIList: () => {
            // 从ROI组件获取ROI列表
            const roiContainer = document.getElementById('targetRoiContainer');
            if (!roiContainer) return [];
            
            const roiItems = roiContainer.querySelectorAll('.roi-item');
            const roiList = [];
            roiItems.forEach(item => {
                const roiName = item.getAttribute('data-roi');
                if (roiName) {
                    roiList.push({ name: roiName });
                }
            });
            return roiList;
        },
        getSPRMinMax: () => {
            // 获取当前图像的SPR最大值和最小值
            // 这里应该从实际数据获取，暂时返回示例值
            return { min: 0, max: 300 };
        },
        getSPRValue: (x, y) => {
            // 获取指定位置的SPR值
            // 这里应该从实际数据获取，暂时返回示例值
            return Math.random() * 300;
        },
        onSPRPreview: (config) => {
            // 更新2D视图预览
            if (config.mode === 'preview') {
                // 显示SPR轮廓预览
                updateSPRPreview(config);
            } else if (config.mode === 'picking') {
                // 进入吸取模式
                enterSPRPickingMode(config);
            }
        }
    });
    
    sprDelineationComponent.show();
}

// 切割弹窗实例
let cuttingModal = null;

// 打开切割弹窗
function openCuttingModal() {
    console.log('openCuttingModal called');
    console.log('CuttingModalComponent available:', typeof window.CuttingModalComponent);
    
    if (!window.CuttingModalComponent) {
        console.error('CuttingModalComponent not loaded');
        alert('切割组件未加载');
        return;
    }

    // 检查是否有选中的ROI
    const selectedROI = getSelectedROI();
    console.log('Selected ROI:', selectedROI);
    
    if (!selectedROI) {
        alert('请先选择一个ROI进行切割');
        return;
    }

    if (!cuttingModal) {
        cuttingModal = new window.CuttingModalComponent({
            onConfirm: (result) => {
                console.log('切割确认:', result);
                handleCuttingConfirm(result);
            },
            onCancel: () => {
                console.log('切割取消');
            },
            getSelectedROI: () => {
                return getSelectedROI();
            },
            getROIList: () => {
                // 从ROI组件获取ROI列表
                const roiContainer = document.getElementById('targetRoiContainer');
                if (!roiContainer) return [];
                
                const roiItems = roiContainer.querySelectorAll('.roi-item');
                const roiList = [];
                roiItems.forEach(item => {
                    const roiName = item.getAttribute('data-roi');
                    if (roiName) {
                        roiList.push({ name: roiName });
                    }
                });
                return roiList;
            },
            getROIContour: (roiName) => {
                // 获取ROI轮廓数据
                // 这里应该从实际数据获取，暂时返回示例数据
                const roiContainer = document.getElementById('targetRoiContainer');
                let index = 0;
                if (roiContainer) {
                    const roiItems = roiContainer.querySelectorAll('.roi-item');
                    roiItems.forEach((item, i) => {
                        if (item.getAttribute('data-roi') === roiName) {
                            index = i;
                        }
                    });
                }
                return {
                    name: roiName,
                    color: '#cccccc',
                    points: generateROIContourPoints(roiName, index, 1)
                };
            }
        });
    }
    
    cuttingModal.show();
}

// 获取当前选中的ROI
function getSelectedROI() {
    const roiContainer = document.getElementById('targetRoiContainer');
    if (!roiContainer) {
        console.warn('targetRoiContainer not found');
        return null;
    }
    
    // ROI组件使用 .active 类标记选中的ROI
    const selectedItem = roiContainer.querySelector('.roi-item.active');
    if (selectedItem) {
        const roiName = selectedItem.getAttribute('data-roi');
        console.log('找到选中的ROI:', roiName);
        return roiName;
    }
    
    console.warn('未找到选中的ROI');
    return null;
}

// 处理切割确认
function handleCuttingConfirm(result) {
    console.log('执行切割操作:', result);
    // 这里应该调用实际的切割逻辑
    // 根据切割线和目标结构配置，生成分割后的ROI
}

// 处理SPR勾画确认
function handleSPRDelineationConfirm(result) {
    console.log('生成SPR ROI:', result);
    
    // 这里应该调用实际的ROI生成逻辑
    // 1. 根据SPR区间生成轮廓
    // 2. 根据范围选择（整个结构或选择范围）
    // 3. 创建或更新目标结构
    
    // 示例：如果选择新建结构，添加到ROI列表
    if (result.targetStructure === 'new') {
        // 这里应该调用ROI组件的方法添加新ROI
        console.log('新建ROI:', {
            name: result.newStructureName,
            color: result.newStructureColor,
            type: result.newStructureType
        });
    } else {
        // 更新已有结构
        console.log('更新ROI:', result.existingStructureName);
    }
}

// 更新SPR预览
function updateSPRPreview(config) {
    // 在2D视图中显示SPR轮廓预览
    // 这里需要访问2D视图组件并更新显示
    console.log('更新SPR预览:', config);
}

// 进入SPR吸取模式
function enterSPRPickingMode(config) {
    // 在2D视图中进入吸取模式
    // 鼠标移动时显示SPR值，点击完成吸取
    console.log('进入SPR吸取模式:', config);
    
    // 这里需要访问2D视图组件并设置交互模式
}

function copyTargetContour() {
    console.log('复制靶区轮廓');
    // 实现轮廓复制
}

function pasteTargetContour() {
    console.log('粘贴靶区轮廓');
    // 实现轮廓粘贴
}

function cutTargetContour() {
    console.log('裁切靶区轮廓');
    // 实现轮廓裁切
}

function expandTargetContour() {
    console.log('外扩/内缩靶区轮廓');
    // 实现轮廓外扩/内缩
}

function expandTargetRing() {
    console.log('外扩环带');
    // 实现外扩环带
}

function differenceTargetContour() {
    console.log('差值勾画');
    // 实现差值勾画
}

function openTargetFormulaDialog() {
    console.log('打开组合公式对话框');
    // 实现组合公式对话框
}

function openTargetBedStructureDialog() {
    console.log('打开床结构设置对话框');
    // 实现床结构设置对话框
}

function openTargetBedTemplateDialog() {
    console.log('打开床模版设置对话框');
    // 实现床模版设置对话框
}

function openTargetApprovalDialog() {
    console.log('打开勾画审批对话框');
    // 实现勾画审批对话框
}

// 光谱直方图组件实例
let spectralHistogramComponent = null;

function openTargetHistogramDialog() {
    console.log('打开光谱直方图对话框');
    
    // 检查组件是否已加载
    if (typeof window.SpectralHistogramComponent === 'undefined') {
        console.error('SpectralHistogramComponent未加载！请检查组件文件路径是否正确');
        alert('光谱直方图组件未加载，请刷新页面重试');
        return;
    }
    
    // 创建或获取组件实例
    if (!spectralHistogramComponent) {
        spectralHistogramComponent = new window.SpectralHistogramComponent({
            prefix: 'targetSpectralHistogram'
        });
        
        // 从ROI组件获取ROI列表（如果可用）
        if (typeof window.ROIComponent !== 'undefined' && window.roiComponent) {
            const roiList = window.roiComponent.getRoiList();
            if (roiList && roiList.length > 0) {
                spectralHistogramComponent.setRoiList(roiList.map(roi => roi.name || roi));
            }
        }
        
        // 从序列树组件获取能谱CT图像列表（如果可用）
        // 这里可以根据实际情况获取能谱CT影像组的图像列表
        const spectralImageList = ['Iodine', 'Water', 'Calcium', 'HU'];
        spectralHistogramComponent.setImageList(spectralImageList);
    }
    
    // 显示弹窗
    spectralHistogramComponent.show();
}

function openTargetScatterDialog() {
    console.log('打开光谱散点图对话框');
    // 实现光谱散点图对话框
}

// 能谱线性分析组件实例
let spectralLinearAnalysisComponent = null;

function openTargetLinearAnalysisDialog() {
    console.log('打开能谱线性分析对话框');
    
    // 检查组件是否已加载
    if (typeof window.SpectralLinearAnalysisComponent === 'undefined') {
        console.error('SpectralLinearAnalysisComponent未加载！请检查组件文件路径是否正确');
        alert('能谱线性分析组件未加载，请刷新页面重试');
        return;
    }
    
    // 创建或获取组件实例
    if (!spectralLinearAnalysisComponent) {
        spectralLinearAnalysisComponent = new window.SpectralLinearAnalysisComponent({
            prefix: 'targetSpectralLinearAnalysis',
            getCrosshairPosition: () => {
                // 获取十字线位置（从2D视图获取）
                // TODO: 从实际的视图组件获取十字线位置
                return { x: 100, y: 100 };
            },
            getCurrentSlice: () => {
                // 获取当前切片信息
                return { plane: 'Axial', slice: 71, total: 141 };
            },
            onClose: () => {
                console.log('能谱线性分析弹窗已关闭');
                spectralLinearAnalysisComponent = null;
            },
            onExport: (lines, plane) => {
                console.log('导出能谱线性分析:', lines, plane);
                // TODO: 实现导出逻辑
            }
        });
        
        // 设置图像列表（从能谱CT影像组获取）
        const spectralImageList = ['Iodine no Water', 'Water', 'Calcium', 'HU'];
        spectralLinearAnalysisComponent.setImageList(spectralImageList);
        
        // 设置变量列表
        const variableList = ['碘', '水', '钙', 'HU'];
        spectralLinearAnalysisComponent.setVariableList(variableList);
    }
    
    // 显示弹窗
    spectralLinearAnalysisComponent.show();
}

// 初始化靶区勾画图像视图
function initializeTargetImageViews() {
    // 图像视图交互功能
    const imageViews = document.querySelectorAll('.target-delineation-content .image-panel');
    
    imageViews.forEach(view => {
        const imageContainer = view.querySelector('.image-container');
        if (imageContainer) {
            // 添加鼠标移动事件监听器
            imageContainer.addEventListener('mousemove', function(e) {
                updateTargetImageInfo(e, view);
            });
            
            // 添加鼠标进入事件监听器
            imageContainer.addEventListener('mouseenter', function(e) {
                showTargetHUInfo(view, true);
            });
            
            // 添加鼠标离开事件监听器
            imageContainer.addEventListener('mouseleave', function(e) {
                showTargetHUInfo(view, false);
            });
        }
    });
    
    // 初始化2D视图顶部距离
    adjustTargetImageViewsMarginTop();
    
    // 初始化工具栏和2D视图宽度
    adjustTargetToolbarAndImageViewsWidth();
}

// 调整靶区勾画2D视图的顶部距离
function adjustTargetImageViewsMarginTop() {
    const targetToolbar = document.getElementById('targetDelineationToolbar');
    const imageViews = document.querySelector('.target-delineation-content .image-views');
    
    if (!targetToolbar || !imageViews) return;
    
    // 根据工具栏状态调整顶部距离
    if (targetToolbar.classList.contains('collapsed')) {
        // 工具栏收起状态：距离顶部40px
        imageViews.style.marginTop = '40px';
    } else {
        // 工具栏展开状态：距离顶部70px
        imageViews.style.marginTop = '70px';
    }
}

// 调整靶区勾画工具栏和2D视图的宽度
function adjustTargetToolbarAndImageViewsWidth() {
    const targetLeftPanel = document.getElementById('targetLeftPanel');
    const targetToolbar = document.getElementById('targetDelineationToolbar');
    const imageViews = document.querySelector('.target-delineation-content .image-views');
    
    if (!targetLeftPanel || !targetToolbar || !imageViews) return;
    
    // 根据左侧栏状态调整宽度
    if (targetLeftPanel.classList.contains('collapsed')) {
        // 左侧栏收起状态：工具栏和2D视图宽度为 calc(100vw - 60px)
        targetToolbar.style.left = '60px';
        targetToolbar.style.width = 'calc(100vw - 60px)';
        imageViews.style.width = 'calc(100vw - 60px)';
    } else {
        // 左侧栏展开状态：工具栏和2D视图宽度为 calc(100vw - 350px)
        targetToolbar.style.left = '350px';
        targetToolbar.style.width = 'calc(100vw - 350px)';
        imageViews.style.width = 'calc(100vw - 350px)';
    }
}

// 更新靶区勾画图像信息
function updateTargetImageInfo(event, view) {
    const rect = view.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 更新鼠标位置信息
    const positionInfo = view.querySelector('.position-info .info-value');
    if (positionInfo) {
        positionInfo.textContent = `X: ${x.toFixed(1)}, Y: ${y.toFixed(1)}, Z: 0.0`;
    }
    
    // 更新HU值信息
    const huValue = view.querySelector('.hu-info .info-value');
    if (huValue) {
        // 模拟HU值计算
        const hu = Math.floor(Math.random() * 2000) - 1000;
        huValue.textContent = hu.toString();
    }
    
    // 更新密度信息
    const densityValue = view.querySelector('.density-info .info-value');
    if (densityValue) {
        // 模拟密度值计算
        const density = (Math.random() * 2).toFixed(2);
        densityValue.textContent = density;
    }
}

// 显示/隐藏靶区勾画HU信息
function showTargetHUInfo(view, show) {
    const huInfo = view.querySelector('.hu-info');
    const densityInfo = view.querySelector('.density-info');
    
    if (huInfo) {
        huInfo.style.display = show ? 'block' : 'none';
    }
    
    if (densityInfo) {
        densityInfo.style.display = show ? 'block' : 'none';
    }
}

// 初始化靶区勾画序列树
function initializeTargetSequenceTree() {
    const targetSequenceTreeContainer = document.getElementById('targetSequenceTree');
    if (targetSequenceTreeContainer) {
        // 清空容器内容
        targetSequenceTreeContainer.innerHTML = '';
        
        // 创建与患者管理界面相同的序列树实例
        const targetSequenceTree = new SequenceTree('targetSequenceTree');
        
        // 绑定与患者管理界面相同的事件
        targetSequenceTree.on('itemSelected', (item) => {
            // 靶区勾画序列树项目选择处理
            // 更新文件信息显示
            updateTargetFileInfo(item);
        });
        
        targetSequenceTree.on('4DPlayerRequested', (frames) => {
            // 4D播放器请求处理
            show4DPlayer(frames);
        });
        
        targetSequenceTree.on('PTCTToggle', (isVisible) => {
            // PTCT切换处理
        });
        
        // 渲染序列树
        targetSequenceTree.render();
    }
}

// 更新靶区勾画文件信息
function updateTargetFileInfo(item) {
    const fileInfoContent = document.getElementById('targetFileInfoContent');
    if (!fileInfoContent) return;
    
    // 根据选择的项目更新文件信息
    const infoItems = fileInfoContent.querySelectorAll('.info-item');
    if (infoItems.length > 0) {
        // 更新图像模态
        const modalityItem = infoItems[0];
        if (modalityItem) {
            const value = modalityItem.querySelector('.info-value');
            if (value) {
                value.textContent = item.type ? item.type.toUpperCase() : 'CT';
            }
        }
    }
}

// 初始化靶区勾画ROI面板
function initializeTargetROIPanel() {
    const roiPanel = document.getElementById('target-roi-panel');
    if (!roiPanel) return;
    
    // ROI分类展开/收起
    const categoryHeaders = roiPanel.querySelectorAll('.category-header');
    categoryHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const category = this.parentElement;
            const content = category.querySelector('.roi-items');
            const icon = this.querySelector('i');
            
            if (content) {
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
                icon.classList.toggle('fa-chevron-right');
                icon.classList.toggle('fa-chevron-down');
            }
        });
    });
    
    // ROI项目点击事件
    const roiItems = roiPanel.querySelectorAll('.roi-item');
    roiItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他项目的active状态
            roiItems.forEach(roi => roi.classList.remove('active'));
            // 添加当前项目的active状态
            this.classList.add('active');
            
            const roiName = this.querySelector('.roi-name').textContent;
            console.log('选择ROI:', roiName);
        });
    });
    
    // ROI可见性切换
    const visibilityButtons = roiPanel.querySelectorAll('.roi-visibility-btn');
    visibilityButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.className = 'fas fa-eye';
            } else {
                icon.className = 'fas fa-eye-slash';
            }
        });
    });
}

// 初始化靶区勾画POI面板
function initializeTargetPOIPanel() {
    const poiPanel = document.getElementById('target-poi-panel');
    if (!poiPanel) return;
    
    // POI项目点击事件
    const poiItems = poiPanel.querySelectorAll('.poi-item');
    poiItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他项目的active状态
            poiItems.forEach(poi => poi.classList.remove('active'));
            // 添加当前项目的active状态
            this.classList.add('active');
            
            const poiName = this.querySelector('.poi-name').textContent;
            console.log('选择POI:', poiName);
        });
    });
}

// 初始化靶区勾画配准面板
function initializeTargetRegistrationPanel() {
    const registrationPanel = document.getElementById('target-registration-panel');
    if (!registrationPanel) return;
    
    // 配准项目操作按钮
    const editButtons = registrationPanel.querySelectorAll('.registration-actions .btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-edit')) {
                console.log('编辑配准');
            } else if (icon.classList.contains('fa-trash')) {
                console.log('删除配准');
            }
        });
    });
}

// 初始化靶区勾画左侧栏导航切换
function initializeTargetVerticalNav() {
    const navButtons = document.querySelectorAll('#targetLeftPanel .nav-btn');
    const panelSections = document.querySelectorAll('#targetLeftPanel .panel-section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetPanel = this.getAttribute('data-panel');
            
            // 移除所有按钮的active状态
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的active状态
            this.classList.add('active');
            
            // 隐藏所有面板
            panelSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // 显示目标面板
            const targetSection = document.getElementById(`target-${targetPanel}-panel`);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // 根据面板类型动态加载组件
                if (targetPanel === 'sequence') {
                    initTargetSequenceComponent();
                } else if (targetPanel === 'roi') {
                    loadROIContent();
                } else if (targetPanel === 'poi') {
                    initTargetPOIComponent();
                } else if (targetPanel === 'registration') {
                    initTargetRegistrationComponent();
                }
            }
            
            // 调整工具栏和2D视图宽度
            adjustTargetToolbarAndImageViewsWidth();
        });
    });
    
    // 确保默认面板正确显示
    const defaultButton = document.querySelector('#targetLeftPanel .nav-btn.active');
    if (defaultButton) {
        const defaultPanel = defaultButton.getAttribute('data-panel');
        const defaultSection = document.getElementById(`target-${defaultPanel}-panel`);
        if (defaultSection) {
            defaultSection.classList.add('active');
            
            // 初始化默认组件
            if (defaultPanel === 'sequence') {
                initTargetSequenceComponent();
            }
        }
    }
}

// 动态加载ROI内容 - 使用ROI组件
function loadROIContent() {
    const roiContainer = document.getElementById('targetRoiContainer');
    if (!roiContainer) return;
    
    // 创建ROI组件实例
    if (window.ROIComponent) {
        new ROIComponent('targetRoiContainer', {
            prefix: 'target-',
            onROISelect: function(roiName, element) {
                console.log('靶区勾画ROI选择:', roiName);
                // 可以在这里添加ROI选择后的处理逻辑
            },
            onToolClick: function(buttonId, button) {
                console.log('靶区勾画ROI工具点击:', buttonId);
                // 可以在这里添加工具按钮点击后的处理逻辑
            }
        });
    }
}

// 初始化图像处理模块的ROI组件
function initImageROIComponent() {
    const roiContainer = document.getElementById('imageRoiContainer');
    if (!roiContainer) return;
    
    // 创建ROI组件实例
    if (window.ROIComponent) {
        new ROIComponent('imageRoiContainer', {
            prefix: '',
            onROISelect: function(roiName, element) {
                console.log('图像处理ROI选择:', roiName);
                // 可以在这里添加ROI选择后的处理逻辑
            },
            onToolClick: function(buttonId, button) {
                console.log('图像处理ROI工具点击:', buttonId);
                // 可以在这里添加工具按钮点击后的处理逻辑
            }
        });
    }
}

// 初始化图像处理模块的POI组件
function initImagePOIComponent() {
    const poiContainer = document.getElementById('imagePoiContainer');
    if (!poiContainer) return;
    
    // 创建POI组件实例
    if (window.POIComponent) {
        new POIComponent('imagePoiContainer', {
            prefix: '',
            onPOISelect: function(poiName, element) {
                console.log('图像处理POI选择:', poiName);
                // 可以在这里添加POI选择后的处理逻辑
            },
            onToolClick: function(buttonId, button) {
                console.log('图像处理POI工具点击:', buttonId);
                // 可以在这里添加工具按钮点击后的处理逻辑
            }
        });
    }
}

// 初始化图像处理模块的ISO组件
function initImageISOComponent() {
    const isoContainer = document.getElementById('imageIsoContainer');
    if (!isoContainer) return;
    
    // 创建ISO组件实例
    if (window.ISOComponent) {
        new ISOComponent('imageIsoContainer', {
            prefix: '',
            onISOSelect: function(isoName, element) {
                console.log('图像处理ISO选择:', isoName);
                // 可以在这里添加ISO选择后的处理逻辑
            },
            onToolClick: function(buttonId, button) {
                console.log('图像处理ISO工具点击:', buttonId);
                // 可以在这里添加工具按钮点击后的处理逻辑
            }
        });
    }
}

// 初始化靶区勾画模块的POI组件
function initTargetPOIComponent() {
    const poiContainer = document.getElementById('targetPoiContainer');
    if (!poiContainer) return;
    
    // 创建POI组件实例
    if (window.POIComponent) {
        new POIComponent('targetPoiContainer', {
            prefix: 'target-',
            onPOISelect: function(poiName, element) {
                console.log('靶区勾画POI选择:', poiName);
                // 可以在这里添加POI选择后的处理逻辑
            },
            onToolClick: function(buttonId, button) {
                console.log('靶区勾画POI工具点击:', buttonId);
                // 可以在这里添加工具按钮点击后的处理逻辑
            }
        });
    }
}

// 初始化靶区勾画模块的ISO组件
function initTargetISOComponent() {
    const isoContainer = document.getElementById('targetIsoContainer');
    if (!isoContainer) return;
    
    // 创建ISO组件实例
    if (window.ISOComponent) {
        new ISOComponent('targetIsoContainer', {
            prefix: 'target-',
            onISOSelect: function(isoName, element) {
                console.log('靶区勾画ISO选择:', isoName);
                // 可以在这里添加ISO选择后的处理逻辑
            },
            onToolClick: function(buttonId, button) {
                console.log('靶区勾画ISO工具点击:', buttonId);
                // 可以在这里添加工具按钮点击后的处理逻辑
            }
        });
    }
}

// 初始化计划设计模块的序列树组件
function initPlanSequenceComponent() {
    const sequenceContainer = document.getElementById('planSequenceContainer');
    if (!sequenceContainer) return;
    
    // 检查是否已初始化
    if (sequenceContainer.dataset.inited === 'true') return;
    
    // 创建序列树组件实例
    if (window.SequenceTreeComponent) {
        new SequenceTreeComponent('planSequenceContainer', {
            prefix: 'plan-',
            onSequenceSelect: function(sequenceName, element) {
                console.log('计划设计序列选择:', sequenceName);
            },
            onFileSelect: function(fileName, element) {
                console.log('计划设计文件选择:', fileName);
            },
            showFileInfo: true
        });
        sequenceContainer.dataset.inited = 'true';
        
        // 延迟自动选中第一个图像
        setTimeout(() => {
            selectFirstImageInSequenceTree('planSequenceContainer');
        }, 300);
    } else {
        console.warn('SequenceTreeComponent未加载');
    }
}

// 初始化计划设计模块的ROI组件
function initPlanROIComponent() {
    const roiContainer = document.getElementById('planRoiContainer');
    if (!roiContainer) return;
    
    // 检查是否已初始化
    if (roiContainer.dataset.inited === 'true') return;
    
    // 创建ROI组件实例
    if (window.ROIComponent) {
        new ROIComponent('planRoiContainer', {
            prefix: 'plan-',
            onROISelect: function(roiName, element) {
                console.log('计划设计ROI选择:', roiName);
            },
            onToolClick: function(buttonId, button) {
                console.log('计划设计ROI工具点击:', buttonId);
            }
        });
        roiContainer.dataset.inited = 'true';
    } else {
        console.warn('ROIComponent未加载');
    }
}

// 初始化计划设计模块的POI组件
function initPlanPOIComponent() {
    const poiContainer = document.getElementById('planPoiContainer');
    if (!poiContainer) return;
    
    // 检查是否已初始化
    if (poiContainer.dataset.inited === 'true') return;
    
    // 创建POI组件实例
    if (window.POIComponent) {
        new POIComponent('planPoiContainer', {
            prefix: 'plan-',
            onPOISelect: function(poiName, element) {
                console.log('计划设计POI选择:', poiName);
            },
            onToolClick: function(buttonId, button) {
                console.log('计划设计POI工具点击:', buttonId);
            }
        });
        poiContainer.dataset.inited = 'true';
    } else {
        console.warn('POIComponent未加载');
    }
}

// 初始化计划设计模块的ISO组件
function initPlanISOComponent() {
    const isoContainer = document.getElementById('planIsoContainer');
    if (!isoContainer) return;
    
    // 检查是否已初始化
    if (isoContainer.dataset.inited === 'true') return;
    
    // 创建ISO组件实例
    if (window.ISOComponent) {
        new ISOComponent('planIsoContainer', {
            prefix: 'plan-',
            onISOSelect: function(isoName, element) {
                console.log('计划设计ISO选择:', isoName);
            },
            onToolClick: function(buttonId, button) {
                console.log('计划设计ISO工具点击:', buttonId);
            }
        });
        isoContainer.dataset.inited = 'true';
    } else {
        console.warn('ISOComponent未加载');
    }
}

// 初始化计划设计模块的配准组件
function initPlanRegistrationComponent() {
    const registrationContainer = document.getElementById('planRegistrationContainer');
    if (!registrationContainer) return;
    
    // 检查是否已初始化
    if (registrationContainer.dataset.inited === 'true') return;
    
    // 创建配准组件实例
    if (window.RegistrationComponent) {
        new RegistrationComponent('planRegistrationContainer', {
            prefix: 'plan-',
            onRegistrationSelect: function(registrationId, element) {
                console.log('计划设计配准选择:', registrationId);
            },
            showFileInfo: true
        });
        registrationContainer.dataset.inited = 'true';
    } else {
        console.warn('RegistrationComponent未加载');
    }
}

// 初始化计划优化模块的POI组件
function initOptimizationPOIComponent() {
    const poiContainer = document.getElementById('optimizationPoiContainer');
    if (!poiContainer) return;
    
    // 检查是否已初始化
    if (poiContainer.dataset.initialized === 'true') return;
    
    // 创建POI组件实例
    if (window.POIComponent) {
        new POIComponent('optimizationPoiContainer', {
            prefix: 'opt-',
            onPOISelect: function(poiName, element) {
                console.log('计划优化POI选择:', poiName);
            },
            onToolClick: function(buttonId, button) {
                console.log('计划优化POI工具点击:', buttonId);
            }
        });
        poiContainer.dataset.initialized = 'true';
    } else {
        console.warn('POIComponent未加载');
    }
}

// 初始化计划优化模块的ISO组件
function initOptimizationISOComponent() {
    const isoContainer = document.getElementById('optimizationIsoContainer');
    if (!isoContainer) return;
    
    // 检查是否已初始化
    if (isoContainer.dataset.initialized === 'true') return;
    
    // 创建ISO组件实例
    if (window.ISOComponent) {
        new ISOComponent('optimizationIsoContainer', {
            prefix: 'opt-',
            onISOSelect: function(isoName, element) {
                console.log('计划优化ISO选择:', isoName);
            },
            onToolClick: function(buttonId, button) {
                console.log('计划优化ISO工具点击:', buttonId);
            }
        });
        isoContainer.dataset.initialized = 'true';
    } else {
        console.warn('ISOComponent未加载');
    }
}

// 初始化计划优化模块的配准组件
function initOptimizationRegistrationComponent() {
    const registrationContainer = document.getElementById('optimizationRegistrationContainer');
    if (!registrationContainer) return;
    
    // 检查是否已初始化
    if (registrationContainer.dataset.initialized === 'true') return;
    
    // 创建配准组件实例
    if (window.RegistrationComponent) {
        new RegistrationComponent('optimizationRegistrationContainer', {
            prefix: 'opt-',
            onRegistrationSelect: function(registrationId, element) {
                console.log('计划优化配准选择:', registrationId);
            },
            showFileInfo: true
        });
        registrationContainer.dataset.initialized = 'true';
    } else {
        console.warn('RegistrationComponent未加载');
    }
}

// 初始化计划优化模块的DOSE组件
function initOptimizationDoseComponent() {
    const doseContainer = document.getElementById('optimizationDoseContainer');
    if (!doseContainer) return;
    
    // 检查是否已初始化
    if (doseContainer.dataset.initialized === 'true') return;
    
    // TODO: 实现DOSE组件初始化
    // 目前为占位内容
    doseContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-info-circle"></i><span>DOSE 占位内容</span></div>';
    doseContainer.dataset.initialized = 'true';
}

// 初始化计划优化模块的LET组件
function initOptimizationLETComponent() {
    const letContainer = document.getElementById('optimizationLetContainer');
    if (!letContainer) return;
    
    // 检查是否已初始化
    if (letContainer.dataset.initialized === 'true') return;
    
    // 检查是否有LET组件
    if (window.LETComponent) {
        new LETComponent('optimizationLetContainer', {
            prefix: 'opt-',
            onLETSelect: function(letName, element) {
                console.log('计划优化LET选择:', letName);
            }
        });
        letContainer.dataset.initialized = 'true';
    } else {
        // TODO: 实现LET组件初始化
        // 目前为占位内容
        letContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-info-circle"></i><span>LET 占位内容</span></div>';
        letContainer.dataset.initialized = 'true';
    }
}

// 初始化计划优化左侧栏导航切换
function initializeOptimizationVerticalNav() {
    const navButtons = document.querySelectorAll('#optLeftPanel .nav-btn');
    const panelSections = document.querySelectorAll('#optLeftPanel .panel-section');
    
    if (!navButtons.length || !panelSections.length) return;
    
    // 检查是否已绑定事件
    if (navButtons[0].dataset.bound === 'true') return;
    navButtons[0].dataset.bound = 'true';
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetPanel = this.getAttribute('data-panel');
            
            // 移除所有按钮的active状态
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的active状态
            this.classList.add('active');
            
            // 隐藏所有面板
            panelSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // 显示目标面板
            const targetSection = document.getElementById(`${targetPanel}-panel`);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // 根据面板类型动态加载组件
                if (targetPanel === 'opt-sequence') {
                    initOptimizationSequenceComponent();
                } else if (targetPanel === 'opt-roi') {
                    initOptimizationROIComponent();
                } else if (targetPanel === 'opt-poi') {
                    initOptimizationPOIComponent();
                } else if (targetPanel === 'opt-iso') {
                    initOptimizationISOComponent();
                } else if (targetPanel === 'opt-registration') {
                    initOptimizationRegistrationComponent();
                } else if (targetPanel === 'opt-dose') {
                    initOptimizationDoseComponent();
                } else if (targetPanel === 'opt-let') {
                    initOptimizationLETComponent();
                }
            }
        });
    });
    
    // 确保默认面板正确显示并初始化
    const defaultButton = document.querySelector('#optLeftPanel .nav-btn.active');
    if (defaultButton) {
        const defaultPanel = defaultButton.getAttribute('data-panel');
        const defaultSection = document.getElementById(`${defaultPanel}-panel`);
        if (defaultSection) {
            defaultSection.classList.add('active');
            // 初始化默认组件
            if (defaultPanel === 'opt-sequence') {
                initOptimizationSequenceComponent();
            }
        }
    }
}

// 初始化计划设计左侧栏导航切换
function initializePlanVerticalNav() {
    const navButtons = document.querySelectorAll('#planLeftPanel .nav-btn');
    const panelSections = document.querySelectorAll('#planLeftPanel .panel-section');
    
    if (!navButtons.length || !panelSections.length) return;
    
    // 检查是否已绑定事件
    if (navButtons[0].dataset.bound === 'true') return;
    navButtons[0].dataset.bound = 'true';
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetPanel = this.getAttribute('data-panel');
            
            // 移除所有按钮的active状态
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的active状态
            this.classList.add('active');
            
            // 隐藏所有面板
            panelSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // 显示目标面板
            const targetSection = document.getElementById(`plan-${targetPanel}-panel`);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // 根据面板类型动态加载组件
                if (targetPanel === 'sequence') {
                    initPlanSequenceComponent();
                } else if (targetPanel === 'roi') {
                    initPlanROIComponent();
                } else if (targetPanel === 'poi') {
                    initPlanPOIComponent();
                } else if (targetPanel === 'iso') {
                    initPlanISOComponent();
                } else if (targetPanel === 'registration') {
                    initPlanRegistrationComponent();
                }
            }
        });
    });
    
    // 确保默认面板正确显示并初始化
    const defaultButton = document.querySelector('#planLeftPanel .nav-btn.active');
    if (defaultButton) {
        const defaultPanel = defaultButton.getAttribute('data-panel');
        const defaultSection = document.getElementById(`plan-${defaultPanel}-panel`);
        if (defaultSection) {
            defaultSection.classList.add('active');
            // 初始化默认组件
            if (defaultPanel === 'sequence') {
                initPlanSequenceComponent();
            }
        }
    }
}

// 初始化图像处理模块的序列树组件
function initImageSequenceComponent() {
    const sequenceContainer = document.getElementById('imageSequenceContainer');
    if (!sequenceContainer) return;
    
    // 创建序列树组件实例
    if (window.SequenceTreeComponent) {
        new SequenceTreeComponent('imageSequenceContainer', {
            prefix: '',
            onSequenceSelect: function(sequenceName, element) {
                console.log('图像处理序列选择:', sequenceName);
                // 可以在这里添加序列选择后的处理逻辑
            },
            onFileSelect: function(fileName, element) {
                console.log('图像处理文件选择:', fileName);
                // 可以在这里添加文件选择后的处理逻辑
            },
            showFileInfo: false
        });
        
        // 延迟自动选中第一个图像
        setTimeout(() => {
            selectFirstImageInSequenceTree('imageSequenceContainer');
        }, 300);
    }
}

// 初始化靶区勾画模块的序列树组件
function initTargetSequenceComponent() {
    const sequenceContainer = document.getElementById('targetSequenceContainer');
    if (!sequenceContainer) return;
    
    // 创建序列树组件实例
    if (window.SequenceTreeComponent) {
        new SequenceTreeComponent('targetSequenceContainer', {
            prefix: 'target-',
            onSequenceSelect: function(sequenceName, element) {
                console.log('靶区勾画序列选择:', sequenceName);
                // 可以在这里添加序列选择后的处理逻辑
            },
            onFileSelect: function(fileName, element) {
                console.log('靶区勾画文件选择:', fileName);
                // 可以在这里添加文件选择后的处理逻辑
            },
            showFileInfo: false
        });
        
        // 延迟自动选中第一个图像
        setTimeout(() => {
            selectFirstImageInSequenceTree('targetSequenceContainer');
        }, 300);
    }
}

// 初始化患者管理界面的序列树组件
function initPatientSequenceComponent() {
    const sequenceContainer = document.getElementById('patientSequenceContainer');
    if (!sequenceContainer) return;
    
    // 创建序列树组件实例
    if (window.SequenceTreeComponent) {
        new SequenceTreeComponent('patientSequenceContainer', {
            prefix: 'patient-',
            onSequenceSelect: function(sequenceName, element) {
                console.log('患者管理序列选择:', sequenceName);
                // 可以在这里添加序列选择后的处理逻辑
            },
            onFileSelect: function(fileName, element) {
                console.log('患者管理文件选择:', fileName);
                // 可以在这里添加文件选择后的处理逻辑
            },
            showFileInfo: false  // 患者管理界面不需要显示文件信息
        });
        
        // 延迟自动选中第一个图像（仅当没有通过其他方式选中时）
        setTimeout(() => {
            const hasSelected = sequenceContainer.querySelector('.tree-item.selected');
            if (!hasSelected) {
                selectFirstImageInSequenceTree('patientSequenceContainer');
            }
        }, 300);
    }
}

// 初始化图像处理模块的配准组件
function initImageRegistrationComponent() {
    console.log('初始化图像处理配准组件...');
    const registrationContainer = document.getElementById('imageRegistrationContainer');
    if (!registrationContainer) {
        console.error('找不到配准容器: imageRegistrationContainer');
        return;
    }
    
    console.log('配准容器找到:', registrationContainer);
    console.log('RegistrationComponent是否存在:', typeof window.RegistrationComponent);
    
    // 创建配准组件实例
    if (window.RegistrationComponent) {
        try {
            new RegistrationComponent('imageRegistrationContainer', {
                prefix: 'image-',
                onRegistrationSelect: function(registrationId, element) {
                    console.log('图像处理配准选择:', registrationId);
                    // 可以在这里添加配准选择后的处理逻辑
                },
                showFileInfo: true
            });
            console.log('图像处理配准组件初始化成功');
        } catch (error) {
            console.error('图像处理配准组件初始化失败:', error);
        }
    } else {
        console.error('RegistrationComponent未定义');
    }
}

// 初始化靶区勾画模块的配准组件
function initTargetRegistrationComponent() {
    const registrationContainer = document.getElementById('targetRegistrationContainer');
    if (!registrationContainer) return;
    
    // 创建配准组件实例
    if (window.RegistrationComponent) {
        new RegistrationComponent('targetRegistrationContainer', {
            prefix: 'target-',
            onRegistrationSelect: function(registrationId, element) {
                console.log('靶区勾画配准选择:', registrationId);
                // 可以在这里添加配准选择后的处理逻辑
            },
            showFileInfo: true
        });
    }
}

// 初始化患者管理界面的配准组件
function initPatientRegistrationComponent() {
    console.log('初始化患者管理配准组件...');
    const registrationContainer = document.getElementById('patientRegistrationContainer');
    if (!registrationContainer) {
        console.error('找不到患者管理配准容器: patientRegistrationContainer');
        return;
    }
    
    console.log('患者管理配准容器找到:', registrationContainer);
    console.log('RegistrationComponent是否存在:', typeof window.RegistrationComponent);
    
    // 创建配准组件实例
    if (window.RegistrationComponent) {
        try {
            new RegistrationComponent('patientRegistrationContainer', {
                prefix: 'patient-',
                onRegistrationSelect: function(registrationId, element) {
                    console.log('患者管理配准选择:', registrationId);
                    // 可以在这里添加配准选择后的处理逻辑
                },
                showFileInfo: false  // 患者管理界面不需要显示文件信息
            });
            console.log('患者管理配准组件初始化成功');
        } catch (error) {
            console.error('患者管理配准组件初始化失败:', error);
        }
    } else {
        console.error('RegistrationComponent未定义');
    }
}

// 打开导入模态对话框
function openImportModal() {
    const importModal = document.getElementById('importModal');
    if (importModal) {
        importModal.style.display = 'flex';
    }
}

// 初始化计划优化模块的ROI组件
function initOptimizationROIComponent() {
    const roiContainer = document.getElementById('optimizationRoiContainer');
    if (!roiContainer) return;
    
    // 检查是否已初始化
    if (roiContainer.dataset.initialized === 'true') return;
    
    // 创建ROI组件实例
    if (window.ROIComponent) {
        new window.ROIComponent('optimizationRoiContainer', {
            prefix: 'opt-',
            onROISelect: function(roiName, element) {
                console.log('计划优化ROI选择:', roiName);
            },
            onToolClick: function(buttonId, button) {
                console.log('计划优化ROI工具点击:', buttonId);
            }
        });
        
        roiContainer.dataset.initialized = 'true';
    }
}

// 初始化计划优化模块的序列树组件
function initOptimizationSequenceComponent() {
    const sequenceContainer = document.getElementById('optimizationSequenceContainer');
    if (!sequenceContainer) return;
    
    // 检查是否已初始化
    if (sequenceContainer.dataset.initialized === 'true') return;
    
    // 创建序列树组件实例
    if (window.SequenceTreeComponent) {
        new SequenceTreeComponent('optimizationSequenceContainer', {
            prefix: 'opt-',
            onSequenceSelect: function(sequenceName, element) {
                console.log('计划优化序列选择:', sequenceName);
                // 可以在这里添加序列选择后的处理逻辑
            },
            onFileSelect: function(fileName, element) {
                console.log('计划优化文件选择:', fileName);
                // 当文件被选中时，更新2D视图显示的图像
                updateOptimization2DViewImage(fileName);
            },
            showFileInfo: false
        });
        
        // 标记为已初始化
        sequenceContainer.dataset.initialized = 'true';
    }
}

// 初始化计划优化BEV视图
function initializeOptimizationBEVView() {
    const container = document.getElementById('optbev-view-container');
    if (!container) {
        console.error('BEV视图容器未找到: optbev-view-container');
        return;
    }
    
    // 检查是否已初始化
    if (container.dataset.initialized === 'true') {
        if (container.bevViewComponent) {
            container.bevViewComponent.resizeCanvas();
            container.bevViewComponent.renderAll();
        }
        return;
    }
    
    // 延迟初始化，确保DOM已渲染
    setTimeout(() => {
        if (window.BeamEyeViewComponent) {
            const bevView = new window.BeamEyeViewComponent('optbev-view-container', {
                onBeamSelect: (beamId) => {
                    console.log('BEV视图射束选择:', beamId);
                },
                onControlPointSelect: (controlPointIndex) => {
                    console.log('BEV视图控制点选择:', controlPointIndex);
                },
                getBeamList: () => {
                    return window.optimizationBeamList || [];
                },
                getEnergyLayers: () => {
                    return window.optimizationEnergyLayers || [];
                },
                getCurrentCT: () => {
                    return window.optimizationCurrentCT || 'CT 8';
                }
            });
            
            container.dataset.initialized = 'true';
            container.bevViewComponent = bevView;
            window.optimizationBEVView = bevView;
            
            // 容器显示后重新调整尺寸
            setTimeout(() => {
                if (bevView.resizeCanvas) {
                    bevView.resizeCanvas();
                    bevView.renderAll();
                }
            }, 200);
            
            console.log('计划优化BEV视图组件初始化完成');
        } else {
            console.error('BeamEyeViewComponent not available');
        }
    }, 100);
}

// 初始化计划优化DVH视图
function initializeOptimizationDVHView() {
    const container = document.getElementById('opt-right-dvh');
    if (!container) {
        console.error('计划优化DVH视图容器未找到: opt-right-dvh');
        return;
    }
    
    // 检查是否已初始化
    if (container.dataset.initialized === 'true') {
        if (container.dvhComponent) {
            container.dvhComponent.setupCanvas();
            container.dvhComponent.draw();
        }
        return;
    }
    
    // 延迟初始化，确保DOM已渲染
    setTimeout(() => {
        if (window.DVHComponent) {
            const dvhView = new window.DVHComponent('opt-right-dvh', {
                enableToolbar: true,
                enableContextMenu: true,
                onCurveClick: (curve) => {
                    console.log('DVH曲线点击:', curve.roiName);
                }
            });
            
            container.dataset.initialized = 'true';
            container.dvhComponent = dvhView;
            window.optimizationDVHView = dvhView;
            
            // 容器显示后重新调整尺寸
            setTimeout(() => {
                if (dvhView.setupCanvas) {
                    dvhView.setupCanvas();
                    dvhView.draw();
                }
            }, 200);
            
            console.log('计划优化DVH视图组件初始化完成');
        } else {
            console.error('DVHComponent not available');
        }
    }, 100);
}

// 初始化计划设计DVH视图
function initializePlanDesignDVHView() {
    const container = document.getElementById('planDvhViewContainer');
    if (!container) {
        console.error('计划设计DVH视图容器未找到: planDvhViewContainer');
        return;
    }
    
    if (container.dataset.initialized === 'true') {
        if (container.dvhComponent) {
            container.dvhComponent.setupCanvas();
            container.dvhComponent.draw();
        }
        return;
    }
    
    setTimeout(() => {
        if (window.DVHComponent) {
            const dvhView = new window.DVHComponent('planDvhViewContainer', {
                enableToolbar: true,
                enableContextMenu: true,
                onCurveClick: (curve) => {
                    console.log('计划设计DVH曲线点击:', curve.roiName);
                }
            });
            
            container.dataset.initialized = 'true';
            container.dvhComponent = dvhView;
            window.planDesignDVHView = dvhView;
            
            setTimeout(() => {
                if (dvhView.setupCanvas) {
                    dvhView.setupCanvas();
                    dvhView.draw();
                }
            }, 200);
            
            console.log('计划设计DVH视图组件初始化完成');
        } else {
            console.error('DVHComponent not available');
        }
    }, 100);
}

// 初始化计划设计BEV视图
function initializePlanDesignBEVView() {
    const container = document.getElementById('planBevViewContainer');
    if (!container) {
        console.error('计划设计BEV视图容器未找到: planBevViewContainer');
        return;
    }
    
    if (container.dataset.initialized === 'true') {
        if (container.bevViewComponent) {
            container.bevViewComponent.resizeCanvas();
            container.bevViewComponent.renderAll();
        }
        return;
    }
    
    setTimeout(() => {
        if (window.BeamEyeViewComponent) {
            const bevView = new window.BeamEyeViewComponent('planBevViewContainer', {
                onBeamSelect: (beamId) => {
                    console.log('计划设计BEV视图射束选择:', beamId);
                },
                onControlPointSelect: (controlPointIndex) => {
                    console.log('计划设计BEV视图控制点选择:', controlPointIndex);
                },
                getBeamList: () => {
                    return window.planDesignBeamList || [];
                },
                getEnergyLayers: () => {
                    return window.planDesignEnergyLayers || [];
                },
                getCurrentCT: () => {
                    return window.planDesignCurrentCT || 'CT 8';
                }
            });
            
            container.dataset.initialized = 'true';
            container.bevViewComponent = bevView;
            window.planDesignBEVView = bevView;
            
            // 容器显示后重新调整尺寸
            setTimeout(() => {
                if (bevView.resizeCanvas) {
                    bevView.resizeCanvas();
                    bevView.renderAll();
                }
            }, 200);
            
            console.log('计划设计BEV视图组件初始化完成');
        } else {
            console.error('BeamEyeViewComponent not available');
        }
    }, 100);
}

// 初始化计划评估BEV视图
function initializePlanEvaluationBEVView() {
    const container = document.getElementById('evalBevViewContainer');
    if (!container) {
        console.error('计划评估BEV视图容器未找到: evalBevViewContainer');
        return;
    }
    
    if (container.dataset.initialized === 'true') {
        if (container.bevViewComponent) {
            container.bevViewComponent.resizeCanvas();
            container.bevViewComponent.renderAll();
        }
        return;
    }
    
    setTimeout(() => {
        if (window.BeamEyeViewComponent) {
            const bevView = new window.BeamEyeViewComponent('evalBevViewContainer', {
                onBeamSelect: (beamId) => {
                    console.log('计划评估BEV视图射束选择:', beamId);
                },
                onControlPointSelect: (controlPointIndex) => {
                    console.log('计划评估BEV视图控制点选择:', controlPointIndex);
                },
                getBeamList: () => {
                    return window.planEvaluationBeamList || [];
                },
                getEnergyLayers: () => {
                    return window.planEvaluationEnergyLayers || [];
                },
                getCurrentCT: () => {
                    return window.planEvaluationCurrentCT || 'CT 8';
                }
            });
            
            container.dataset.initialized = 'true';
            container.bevViewComponent = bevView;
            window.planEvaluationBEVView = bevView;
            
            // 容器显示后重新调整尺寸
            setTimeout(() => {
                if (bevView.resizeCanvas) {
                    bevView.resizeCanvas();
                    bevView.renderAll();
                }
            }, 200);
            
            console.log('计划评估BEV视图组件初始化完成');
        } else {
            console.error('BeamEyeViewComponent not available');
        }
    }, 100);
}

// 初始化QA计划BEV视图
function initializeQaPlanBEVView() {
    const container = document.getElementById('qaBevViewContainer');
    if (!container) {
        console.error('QA计划BEV视图容器未找到: qaBevViewContainer');
        return;
    }
    
    if (container.dataset.initialized === 'true') {
        if (container.bevViewComponent) {
            container.bevViewComponent.resizeCanvas();
            container.bevViewComponent.renderAll();
        }
        return;
    }
    
    setTimeout(() => {
        if (window.BeamEyeViewComponent) {
            const bevView = new window.BeamEyeViewComponent('qaBevViewContainer', {
                onBeamSelect: (beamId) => {
                    console.log('QA计划BEV视图射束选择:', beamId);
                },
                onControlPointSelect: (controlPointIndex) => {
                    console.log('QA计划BEV视图控制点选择:', controlPointIndex);
                },
                getBeamList: () => {
                    return window.qaPlanBeamList || [];
                },
                getEnergyLayers: () => {
                    return window.qaPlanEnergyLayers || [];
                },
                getCurrentCT: () => {
                    return window.qaPlanCurrentCT || 'CT 8';
                }
            });
            
            container.dataset.initialized = 'true';
            container.bevViewComponent = bevView;
            window.qaPlanBEVView = bevView;
            
            // 容器显示后重新调整尺寸
            setTimeout(() => {
                if (bevView.resizeCanvas) {
                    bevView.resizeCanvas();
                    bevView.renderAll();
                }
            }, 200);
            
            console.log('QA计划BEV视图组件初始化完成');
        } else {
            console.error('BeamEyeViewComponent not available');
        }
    }, 100);
}

// 更新计划优化2D视图的图像
function updateOptimization2DViewImage(fileName) {
    // 获取2D视图组件实例
    const view2d = window.optimization2DView;
    if (!view2d) {
        console.warn('2D视图组件未初始化');
        return;
    }
    
    // 根据文件名加载图像
    // 这里可以根据实际需求从服务器或本地加载图像
    // 示例：从URL加载图像
    if (fileName && fileName.toLowerCase().includes('ct')) {
        // 如果是CT图像，尝试加载
        // 实际应用中，这里应该从DICOM数据或图像服务器加载
        loadImageForOptimization2DView(view2d, fileName);
    } else {
        // 对于其他类型的文件，也尝试加载
        loadImageForOptimization2DView(view2d, fileName);
    }
}

// 加载图像到2D视图（示例实现）
function loadImageForOptimization2DView(view2d, fileName) {
    // 这里可以根据文件名生成图像URL或从DICOM数据加载
    // 目前使用示例图像数据
    
    // 方案1：如果有图像URL，直接加载
    // view2d.loadImageFromURL('path/to/image/' + fileName);
    
    // 方案2：从DICOM数据加载（需要DICOM解析库）
    // const dicomData = loadDICOMFile(fileName);
    // view2d.loadImage(dicomData);
    
    // 方案3：生成一个示例图像（当前实现）
    // 创建一个更真实的CT图像示例
    if (view2d.ctx) {
        generateCTImageForView(view2d, fileName);
    }
}

// 生成CT图像示例（用于演示）
function generateCTImageForView(view2d, fileName) {
    const width = 512;
    const height = 512;
    const imageData = view2d.ctx.createImageData(width, height);
    const data = imageData.data;
    
    // 根据文件名生成不同的图像模式
    const isSagittal = fileName && fileName.toLowerCase().includes('sagittal');
    const isCoronal = fileName && fileName.toLowerCase().includes('coronal');
    
    // 生成一个更真实的CT横截面图像
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            const centerX = width / 2;
            const centerY = height / 2;
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            let gray = 0;
            
            if (isSagittal) {
                // 矢状面视图 - 侧视图，显示头部侧面轮廓
                // 创建一个椭圆形的头部轮廓
                const headWidth = 180;
                const headHeight = 220;
                const headX = centerX - 50; // 稍微偏左
                const headY = centerY;
                
                const relativeX = x - headX;
                const relativeY = y - headY;
                const ellipseDist = Math.sqrt((relativeX / headWidth) ** 2 + (relativeY / headHeight) ** 2);
                
                if (ellipseDist < 1) {
                    // 头部区域
                    gray = 100 + Math.sin(relativeY / 20) * 15;
                    
                    // 添加内部结构
                    if (relativeX > -20 && relativeX < 20) {
                        gray = 80; // 中线结构
                    }
                    if (relativeY > 50 && relativeY < 100) {
                        gray = 90; // 脑组织
                    }
                    if (relativeY < -100) {
                        gray = 60; // 顶部
                    }
                } else if (ellipseDist < 1.1) {
                    // 骨骼边缘
                    gray = 180;
                } else {
                    gray = 0;
                }
            } else {
                // 轴向视图 - 横截面
                // 创建头部轮廓
                if (dist < 200) {
                    // 头部区域 - 脑组织
                    gray = 100 + Math.sin(dist / 15) * 20;
                    
                    // 添加一些内部结构
                    if (dist > 150 && dist < 180) {
                        gray = 60; // 较暗的区域（脑室）
                    }
                    if (dist > 80 && dist < 120) {
                        gray = 90 + Math.sin((x + y) / 10) * 15; // 脑组织纹理
                    }
                    if (dist < 50) {
                        gray = 70; // 中心区域
                    }
                    
                    // 添加一些亮点（可能是钙化或其他结构）
                    if (Math.random() < 0.001) {
                        gray = 200;
                    }
                } else if (dist < 220) {
                    // 骨骼边缘
                    gray = 180 + Math.sin(dist / 5) * 20;
                } else {
                    // 背景
                    gray = 0;
                }
            }
            
            // 添加一些噪声使图像更真实
            gray += (Math.random() - 0.5) * 5;
            gray = Math.max(0, Math.min(255, gray));
            
            data[idx] = gray;     // R
            data[idx + 1] = gray; // G
            data[idx + 2] = gray; // B
            data[idx + 3] = 255;  // A
        }
    }
    
    view2d.imageData = imageData;
    view2d.renderAll();
}

// 计划设计模块 - 剂量统计组件实例
let planDesignDoseStatsComponent = null;

// 初始化计划设计模块的剂量统计组件
function initPlanDesignDoseStatsComponent() {
    const container = document.getElementById('planDoseStatsContainer');
    if (!container) return;

    // 如果已经初始化，直接返回
    if (container.dataset.inited === 'true') {
        return;
    }

    if (typeof DoseStatisticsComponent === 'undefined') {
        console.error('DoseStatisticsComponent is not loaded');
        return;
    }

    try {
        planDesignDoseStatsComponent = new DoseStatisticsComponent('planDoseStatsContainer', {
            showDoseType: false, // 计划设计模块不显示剂量类型列
            getGlobalStats: () => {
                // TODO: 从实际数据源获取全局统计
                return [
                    {
                        id: 'maxDose1',
                        visible: true,
                        color: '#ff0000',
                        statisticItem: '最大剂量点',
                        relativeDosePercentage: 112.31,
                        targetDose: 4500.00,
                        dose: 5054.15,
                        x: 4.34,
                        y: -1.97,
                        z: 0.00
                    }
                ];
            },
            getRoiStats: () => {
                // TODO: 从实际数据源获取ROI统计
                return [
                    {
                        name: 'p_r10',
                        color: '#ff00ff',
                        volume: 156.58,
                        minDose: 0.00,
                        maxDose: 27231.49,
                        avgDose: 10366.65,
                        targetDose: null,
                        targetDoseCoverageVolume: null,
                        targetDoseCoverageRatio: null
                    }
                ];
            },
            getPoiStats: () => {
                // TODO: 从实际数据源获取POI统计
                return [
                    {
                        name: 'Point1',
                        color: '#ff0000',
                        dose: 15576.95,
                        x: 11.40,
                        y: -0.25,
                        z: 23.03
                    }
                ];
            },
            onExport: (data) => {
                // TODO: 实现Excel导出功能
                console.log('导出剂量统计:', data);
                planDesignDoseStatsComponent.defaultExportToExcel({
                    planName: 'PlanA',
                    patientId: 'Y87342987',
                    patientName: 'Zhangguang',
                    comparisonMode: null
                });
            }
        });

        container.dataset.inited = 'true';
    } catch (error) {
        console.error('Failed to initialize DoseStatisticsComponent:', error);
    }
}

// 计划优化模块 - 剂量统计组件实例
let planOptimizationDoseStatsComponent = null;

// 初始化计划优化模块的剂量统计组件
function initPlanOptimizationDoseStatsComponent() {
    const container = document.getElementById('optDoseStatsContainer');
    if (!container) return;

    // 如果已经初始化，直接返回
    if (container.dataset.inited === 'true') {
        return;
    }

    if (typeof DoseStatisticsComponent === 'undefined') {
        console.error('DoseStatisticsComponent is not loaded');
        return;
    }

    try {
        planOptimizationDoseStatsComponent = new DoseStatisticsComponent('optDoseStatsContainer', {
            showDoseType: true, // 计划优化模块显示剂量类型列
            getGlobalStats: () => {
                // TODO: 从实际数据源获取全局统计
                return [
                    {
                        id: 'maxDose1',
                        visible: true,
                        color: '#ff0000',
                        statisticItem: '最大剂量点',
                        relativeDosePercentage: 112.31,
                        targetDose: 4500.00,
                        dose: 5054.15,
                        x: 4.34,
                        y: -1.97,
                        z: 0.00
                    }
                ];
            },
            getRoiStats: () => {
                // TODO: 从实际数据源获取ROI统计
                return [
                    {
                        name: 'p_r10',
                        color: '#ff00ff',
                        volume: 156.58,
                        minDose: 0.00,
                        maxDose: 27231.49,
                        avgDose: 10366.65,
                        targetDose: null,
                        targetDoseCoverageVolume: null,
                        targetDoseCoverageRatio: null
                    }
                ];
            },
            getPoiStats: () => {
                // TODO: 从实际数据源获取POI统计
                return [
                    {
                        name: 'Point1',
                        color: '#ff0000',
                        dose: 15576.95,
                        x: 11.40,
                        y: -0.25,
                        z: 23.03
                    }
                ];
            },
            onExport: (data) => {
                // TODO: 实现Excel导出功能
                console.log('导出剂量统计:', data);
                planOptimizationDoseStatsComponent.defaultExportToExcel({
                    planName: 'PlanA',
                    patientId: 'Y87342987',
                    patientName: 'Zhangguang',
                    comparisonMode: null
                });
            }
        });

        container.dataset.inited = 'true';
    } catch (error) {
        console.error('Failed to initialize DoseStatisticsComponent:', error);
    }
}


// Initialize Plan Design 2D Views
function initPlanDesign2DViews() {
    if (window.PlanDesignView2DComponent) {
        // Axial
        new PlanDesignView2DComponent('planAxialContainer', {
            viewType: 'Axial',
            sliceTotal: 157,
            sliceCurrent: 57
        });
        
        // Coronal
        new PlanDesignView2DComponent('planCoronalContainer', {
            viewType: 'Coronal',
            sliceTotal: 157,
            sliceCurrent: 89
        });
        
        // Sagittal
        new PlanDesignView2DComponent('planSagittalContainer', {
            viewType: 'Sagittal',
            sliceTotal: 157,
            sliceCurrent: 78
        });
    }
}

// Hook into showPlanDesign, or run on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initPlanDesign2DViews();
    }, 500); // Delay to ensure DOM elements are ready/visible
});

// Initialize Target Delineation 2D Views
function initTargetDelineation2DViews() {
    if (window.PlanDesignView2DComponent) {
        // Axial
        new PlanDesignView2DComponent('targetAxialContainer', {
            viewType: 'Axial',
            sliceTotal: 157,
            sliceCurrent: 57
        });
        
        // Coronal
        new PlanDesignView2DComponent('targetCoronalContainer', {
            viewType: 'Coronal',
            sliceTotal: 157,
            sliceCurrent: 89
        });
        
        // Sagittal
        new PlanDesignView2DComponent('targetSagittalContainer', {
            viewType: 'Sagittal',
            sliceTotal: 157,
            sliceCurrent: 78
        });
    }
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initTargetDelineation2DViews();
    }, 500);
});

// Initialize Image Processing 2D Views
function initImageProcessing2DViews() {
    if (window.PlanDesignView2DComponent) {
        // Axial
        new PlanDesignView2DComponent('imageAxialContainer', {
            viewType: 'Axial',
            sliceTotal: 157,
            sliceCurrent: 57
        });
        
        // Coronal
        new PlanDesignView2DComponent('imageCoronalContainer', {
            viewType: 'Coronal',
            sliceTotal: 157,
            sliceCurrent: 89
        });
        
        // Sagittal
        new PlanDesignView2DComponent('imageSagittalContainer', {
            viewType: 'Sagittal',
            sliceTotal: 157,
            sliceCurrent: 78
        });
    }
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initImageProcessing2DViews();
    }, 500);
});

// ==================== 文件信息交互逻辑 ====================

// 图像属性对话框交互
document.addEventListener('DOMContentLoaded', () => {
    const editScanDeviceBtn = document.getElementById('editScanDeviceBtn');
    const imagePropertiesModal = document.getElementById('imagePropertiesModal');
    const imagePropertiesModalClose = document.getElementById('imagePropertiesModalClose');
    const imagePropertiesCancelBtn = document.getElementById('imagePropertiesCancelBtn');
    const imagePropertiesConfirmBtn = document.getElementById('imagePropertiesConfirmBtn');
    const scanDeviceSelect = document.getElementById('scanDeviceSelect');
    const scanDeviceValue = document.getElementById('scanDeviceValue');

    if (editScanDeviceBtn && imagePropertiesModal) {
        // 打开对话框
        editScanDeviceBtn.addEventListener('click', () => {
            imagePropertiesModal.style.display = 'flex';
        });

        // 关闭对话框
        const closeModal = () => {
            imagePropertiesModal.style.display = 'none';
        };

        if (imagePropertiesModalClose) {
            imagePropertiesModalClose.addEventListener('click', closeModal);
        }
        
        if (imagePropertiesCancelBtn) {
            imagePropertiesCancelBtn.addEventListener('click', closeModal);
        }

        // 点击背景关闭
        imagePropertiesModal.addEventListener('click', (e) => {
            if (e.target === imagePropertiesModal) {
                closeModal();
            }
        });

        // 确认修改
        if (imagePropertiesConfirmBtn && scanDeviceSelect && scanDeviceValue) {
            imagePropertiesConfirmBtn.addEventListener('click', () => {
                const selectedOption = scanDeviceSelect.options[scanDeviceSelect.selectedIndex];
                scanDeviceValue.textContent = selectedOption.text;
                closeModal();
            });
        }
    }
});

// 序列树选择时切换文件信息显示
function updateFileInfoDisplay(fileType) {
    const imageFileInfo = document.getElementById('imageFileInfo');
    const structFileInfo = document.getElementById('structFileInfo');
    const planFileInfo = document.getElementById('planFileInfo');

    if (!imageFileInfo || !structFileInfo || !planFileInfo) {
        return;
    }

    // 隐藏所有信息
    imageFileInfo.style.display = 'none';
    structFileInfo.style.display = 'none';
    planFileInfo.style.display = 'none';

    // 根据文件类型显示对应信息
    switch(fileType) {
        case 'image':
            imageFileInfo.style.display = 'flex';
            break;
        case 'struct':
            structFileInfo.style.display = 'flex';
            break;
        case 'plan':
            planFileInfo.style.display = 'flex';
            break;
        default:
            imageFileInfo.style.display = 'flex';
    }
}

// 导出函数供序列树组件调用
window.updateFileInfoDisplay = updateFileInfoDisplay;

// 自动选中序列树中的第一个图像（通用函数）
function selectFirstImageInSequenceTree(containerId) {
    // 如果没有指定容器ID，默认使用患者管理模块的序列树
    if (!containerId) {
        containerId = 'patientSequenceContainer';
    }
    
    const sequenceContainer = document.getElementById(containerId);
    if (!sequenceContainer) {
        return;
    }
    
    // 查找第一个可选择的图像项（排除Study和文件夹等分组项）
    const allTreeItems = sequenceContainer.querySelectorAll('.tree-item');
    
    for (let item of allTreeItems) {
        const itemType = item.getAttribute('data-type');
        
        // 选中第一个图像类型的项（CT、MR、4DCT帧等）
        if (itemType === 'image' || itemType === '4dct-frame' || 
            itemType === 'ptct-ct' || itemType === 'scan' ||
            itemType === 'spect' || itemType === 'ultrasound') {
            
            // 触发点击事件
            item.click();
            break;
        }
    }
}
