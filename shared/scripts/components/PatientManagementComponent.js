// 患者管理组件
class PatientManagementComponent {
    constructor(container) {
        this.container = container;
        this.patients = [];
        this.selectedPatient = null;
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalCount = 0;
        this.sortField = null;
        this.sortOrder = 'asc';
    }
    
    // 渲染组件
    render() {
        this.container.innerHTML = this.getTemplate();
        this.init();
    }
    
    // 获取HTML模板
    getTemplate() {
        return `
            <!-- 主内容区域 -->
            <div class="patient-management-content">
                <!-- 左侧面板 -->
                <aside class="patient-left-panel">
                    <!-- 搜索栏 -->
                    <section class="patient-search-section">
                        <input type="text" class="patient-search-input" placeholder="请输入患者姓名或ID,点击搜索图标或按下回车键开始搜索">
                        <div class="patient-search-buttons">
                            <button class="patient-search-btn" title="刷新" data-tooltip="刷新">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                                    <path d="M21 3v5h-5"></path>
                                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                                    <path d="M3 21v-5h5"></path>
                                </svg>
                            </button>
                            <button class="patient-search-btn" title="设置" data-tooltip="设置">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                    </section>
                    
                    <!-- 患者列表 -->
                    <section class="patient-list-section">
                        <table class="patient-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th class="sortable">患者ID</th>
                                    <th class="sortable">姓名</th>
                                    <th>性别</th>
                                    <th>出生日期</th>
                                    <th>年龄</th>
                                    <th>医生</th>
                                    <th>物理师</th>
                                    <th class="sortable">导入时间</th>
                                    <th class="sortable">保存时间</th>
                                    <th>备注</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- 患者数据将通过JavaScript动态加载 -->
                            </tbody>
                        </table>
                    </section>
                    
                    <!-- 翻页功能 -->
                    <section class="patient-pagination-section">
                        <div class="patient-pagination-total">共0条</div>
                        <div class="patient-pagination-select">20条/页</div>
                        <div class="patient-pagination-nav">
                            <button class="patient-pagination-btn patient-pagination-prev" disabled>‹</button>
                            <div class="patient-pagination-pages">
                                <button class="patient-pagination-page patient-pagination-page-active">1</button>
                                <button class="patient-pagination-page">2</button>
                            </div>
                            <button class="patient-pagination-btn patient-pagination-next">›</button>
                        </div>
                        <div class="patient-pagination-jump">跳至</div>
                        <input type="text" class="patient-pagination-page-input" value="1">
                        <div class="patient-pagination-page-unit">页</div>
                    </section>
                </aside>
                
                <!-- 右侧面板 -->
                <aside class="patient-right-panel">
                    <!-- 患者树 -->
                    <section class="patient-tree-section">
                        <div class="patient-tree-header">请选择患者</div>
                        <div class="patient-tree-info"></div>
                        <div class="patient-tree-container">
                            <!-- 患者树数据将通过JavaScript动态加载 -->
                        </div>
                    </section>
                    
                    <!-- 文件信息 -->
                    <section class="patient-file-info-section">
                        <div class="patient-file-info-title">文件信息</div>
                        <div class="patient-file-info-content">
                            <div class="patient-file-info-item">请选择患者查看信息</div>
                        </div>
                    </section>
                </aside>
            </div>
            
            <!-- 底部操作栏 -->
            <footer class="patient-footer">
                <div class="patient-footer-left">
                    <button class="patient-footer-btn patient-footer-btn-secondary">导入</button>
                    <button class="patient-footer-btn patient-footer-btn-secondary">导出</button>
                    <button class="patient-footer-btn patient-footer-btn-secondary">删除</button>
                    <button class="patient-footer-btn patient-footer-btn-secondary">编辑</button>
                </div>
                <div class="patient-footer-right">
                    <button class="patient-footer-btn patient-footer-btn-primary">打开</button>
                </div>
            </footer>
            
            <!-- 右键菜单容器 -->
            <div class="patient-context-menu" id="patientContextMenu"></div>
        `;
    }
    
    // 初始化组件
    init() {
        this.loadPatients();
        this.initEventListeners();
        this.initTableSorting();
        this.initPagination();
    }
    
    // 加载患者数据
    loadPatients() {
        // 模拟患者数据
        this.patients = this.generateMockPatients();
        this.totalCount = this.patients.length;
        this.renderPatientTable();
        this.updatePagination();
        
        // 默认选择第一条患者
        if (this.patients.length > 0) {
            setTimeout(() => this.selectFirstPatient(), 100);
        }
    }
    
    // 生成模拟患者数据
    generateMockPatients() {
        const names = ['陈海鱼', '张美丽', '王小红', '李小明', '赵丽华', '刘建国', '孙美玲', '周志强', '吴秀英', '郑文华'];
        const patients = [];
        
        for (let i = 0; i < 20; i++) {
            patients.push({
                id: `${2018000 + i}`,
                name: names[i % names.length] + (i > 9 ? i : ''),
                gender: i % 2 === 0 ? 'F' : 'M',
                birthDate: `19${70 + (i % 20)}-0${1 + (i % 9)}-${10 + (i % 20)}`,
                age: 55 - i,
                doctor: 'None',
                physicist: 'None',
                importTime: `2025-0${7 - Math.floor(i / 10)}-${30 - i} ${10 + (i % 14)}:${15 + (i % 45)}:${20 + (i % 40)}`,
                saveTime: `2025-07-${30 - i} ${14 + (i % 10)}:${20 + (i % 40)}:${15 + (i % 45)}`,
                remark: i % 5 === 0 ? 'None' : ['A形定位器', '新华TPS验证', 'None'][i % 3]
            });
        }
        
        return patients;
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 搜索功能
        this.initSearch();
        
        // 患者行选择
        this.initPatientSelection();
        
        // 底部按钮
        this.initFooterButtons();
    }
    
    // 初始化搜索功能
    initSearch() {
        const searchInput = this.container.querySelector('.patient-search-input');
        const refreshBtn = this.container.querySelectorAll('.patient-search-btn')[0];
        const settingsBtn = this.container.querySelectorAll('.patient-search-btn')[1];
        
        if (searchInput) {
            // 回车键搜索
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value.trim());
                }
            });
            
            // 实时搜索（防抖）
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.performSearch(e.target.value.trim());
                }, 300);
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }
    }
    
    // 执行搜索
    performSearch(keyword) {
        if (!keyword) {
            this.renderPatientTable();
            return;
        }
        
        const filteredPatients = this.patients.filter(patient => 
            patient.id.toLowerCase().includes(keyword.toLowerCase()) ||
            patient.name.toLowerCase().includes(keyword.toLowerCase())
        );
        
        this.renderPatientTable(filteredPatients);
    }
    
    // 刷新数据
    refreshData() {
        this.loadPatients();
        this.showNotification('数据已刷新', 'success');
    }
    
    // 打开设置
    openSettings() {
        this.showNotification('设置功能开发中', 'info');
    }
    
    // 初始化患者选择
    initPatientSelection() {
        const tableBody = this.container.querySelector('.patient-table tbody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (row) {
                    this.selectPatient(row);
                }
            });
        }
    }
    
    // 选择患者
    selectPatient(row) {
        // 移除其他行的选中状态
        const allRows = this.container.querySelectorAll('.patient-table tbody tr');
        allRows.forEach(r => r.classList.remove('selected'));
        
        // 添加当前行的选中状态
        row.classList.add('selected');
        
        // 获取患者信息
        const cells = row.cells;
        const patientData = {
            id: cells[1].textContent.trim(),
            name: cells[2].textContent.trim(),
            gender: cells[3].textContent.trim(),
            birthDate: cells[4].textContent.trim(),
            age: cells[5].textContent.trim(),
            doctor: cells[6].textContent.trim(),
            physicist: cells[7].textContent.trim(),
            importTime: cells[8].textContent.trim(),
            saveTime: cells[9].textContent.trim(),
            remark: cells[10].textContent.trim()
        };
        
        this.selectedPatient = patientData;
        this.updatePatientTree(patientData);
        this.updateFileInfo(patientData);
    }
    
    // 选择第一条患者
    selectFirstPatient() {
        const firstRow = this.container.querySelector('.patient-table tbody tr');
        if (firstRow) {
            this.selectPatient(firstRow);
        }
    }
    
    // 更新患者树
    updatePatientTree(patient) {
        const treeHeader = this.container.querySelector('.patient-tree-header');
        const treeInfo = this.container.querySelector('.patient-tree-info');
        const treeContainer = this.container.querySelector('.patient-tree-container');
        
        if (treeHeader) {
            treeHeader.textContent = `${patient.name} (ID: ${patient.id})`;
        }
        
        if (treeInfo) {
            treeInfo.textContent = `${patient.gender} ${patient.birthDate}`;
        }
        
        if (treeContainer) {
            // 这里可以加载患者的树状数据结构
            treeContainer.innerHTML = `
                <div class="patient-tree-node" data-node-type="patient">
                    <span class="patient-tree-icon">👤</span>
                    <span class="patient-tree-text">${patient.name}</span>
                </div>
            `;
        }
    }
    
    // 更新文件信息
    updateFileInfo(patient) {
        const fileInfoContent = this.container.querySelector('.patient-file-info-content');
        if (fileInfoContent) {
            fileInfoContent.innerHTML = `
                <div class="patient-file-info-item">患者ID：${patient.id}</div>
                <div class="patient-file-info-item">姓名：${patient.name}</div>
                <div class="patient-file-info-item">性别：${patient.gender === 'M' ? '男' : '女'}</div>
                <div class="patient-file-info-item">出生日期：${patient.birthDate}</div>
                <div class="patient-file-info-item">年龄：${patient.age}岁</div>
                <div class="patient-file-info-item">医生：${patient.doctor}</div>
                <div class="patient-file-info-item">物理师：${patient.physicist}</div>
                <div class="patient-file-info-item">导入时间：${patient.importTime}</div>
                <div class="patient-file-info-item">保存时间：${patient.saveTime}</div>
                <div class="patient-file-info-item">备注：${patient.remark}</div>
            `;
        }
    }
    
    // 初始化表格排序
    initTableSorting() {
        const sortableHeaders = this.container.querySelectorAll('.patient-table th.sortable');
        sortableHeaders.forEach((header, index) => {
            header.addEventListener('click', () => {
                this.sortTable(index + 1, header);
            });
        });
    }
    
    // 排序表格
    sortTable(columnIndex, header) {
        const fieldMap = ['', 'id', 'name', '', '', '', '', '', 'importTime', 'saveTime', ''];
        const field = fieldMap[columnIndex];
        
        if (!field) return;
        
        // 确定排序顺序
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortOrder = 'asc';
        }
        
        // 更新表头状态
        this.container.querySelectorAll('.patient-table th.sortable').forEach(h => {
            h.removeAttribute('data-sort');
        });
        header.setAttribute('data-sort', this.sortOrder);
        
        // 排序数据
        this.patients.sort((a, b) => {
            const aVal = a[field] || '';
            const bVal = b[field] || '';
            
            if (this.sortOrder === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });
        
        this.renderPatientTable();
    }
    
    // 渲染患者表格
    renderPatientTable(patients = this.patients) {
        const tableBody = this.container.querySelector('.patient-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        // 计算分页数据
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pagePatients = patients.slice(startIndex, endIndex);
        
        pagePatients.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <svg class="patient-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10,9 9,9 8,9"></polyline>
                    </svg>
                </td>
                <td>${patient.id}</td>
                <td>${patient.name}</td>
                <td>${patient.gender}</td>
                <td>${patient.birthDate}</td>
                <td>${patient.age}</td>
                <td>${patient.doctor}</td>
                <td>${patient.physicist}</td>
                <td>${patient.importTime}</td>
                <td>${patient.saveTime}</td>
                <td>${patient.remark}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // 初始化分页
    initPagination() {
        const pageInput = this.container.querySelector('.patient-pagination-page-input');
        const prevBtn = this.container.querySelector('.patient-pagination-prev');
        const nextBtn = this.container.querySelector('.patient-pagination-next');
        
        if (pageInput) {
            pageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const pageNum = parseInt(e.target.value);
                    if (pageNum && pageNum > 0) {
                        this.goToPage(pageNum);
                    }
                }
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.goToPage(this.currentPage - 1);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const maxPage = Math.ceil(this.totalCount / this.pageSize);
                if (this.currentPage < maxPage) {
                    this.goToPage(this.currentPage + 1);
                }
            });
        }
    }
    
    // 跳转到指定页
    goToPage(pageNum) {
        const maxPage = Math.ceil(this.totalCount / this.pageSize);
        if (pageNum <= maxPage && pageNum > 0) {
            this.currentPage = pageNum;
            this.renderPatientTable();
            this.updatePagination();
        }
    }
    
    // 更新分页信息
    updatePagination() {
        const totalElement = this.container.querySelector('.patient-pagination-total');
        const pageInput = this.container.querySelector('.patient-pagination-page-input');
        const prevBtn = this.container.querySelector('.patient-pagination-prev');
        const nextBtn = this.container.querySelector('.patient-pagination-next');
        
        if (totalElement) {
            totalElement.textContent = `共${this.totalCount}条`;
        }
        
        if (pageInput) {
            pageInput.value = this.currentPage;
        }
        
        // 更新上一页/下一页按钮状态
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }
        
        if (nextBtn) {
            const maxPage = Math.ceil(this.totalCount / this.pageSize);
            nextBtn.disabled = this.currentPage >= maxPage;
        }
    }
    
    // 初始化底部按钮
    initFooterButtons() {
        const buttons = this.container.querySelectorAll('.patient-footer-btn');
        if (buttons[0]) buttons[0].addEventListener('click', () => this.handleImport());
        if (buttons[1]) buttons[1].addEventListener('click', () => this.handleExport());
        if (buttons[2]) buttons[2].addEventListener('click', () => this.handleDelete());
        if (buttons[3]) buttons[3].addEventListener('click', () => this.handleEdit());
        if (buttons[4]) buttons[4].addEventListener('click', () => this.handleOpen());
    }
    
    // 处理导入
    handleImport() {
        this.showNotification('导入功能开发中', 'info');
    }
    
    // 处理导出
    handleExport() {
        this.showNotification('导出功能开发中', 'info');
    }
    
    // 处理删除
    handleDelete() {
        if (!this.selectedPatient) {
            this.showNotification('请先选择要删除的患者', 'warning');
            return;
        }
        this.showNotification('删除功能开发中', 'info');
    }
    
    // 处理编辑
    handleEdit() {
        if (!this.selectedPatient) {
            this.showNotification('请先选择要编辑的患者', 'warning');
            return;
        }
        this.showNotification('编辑功能开发中', 'info');
    }
    
    // 处理打开
    handleOpen() {
        if (!this.selectedPatient) {
            this.showNotification('请先选择要打开的患者', 'warning');
            return;
        }
        this.showNotification('打开功能开发中', 'info');
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}]`, message);
        // 这里可以集成通知组件
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientManagementComponent;
}

