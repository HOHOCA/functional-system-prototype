class DrawingTemplateSettingsComponent {
  constructor(options) {
    this.options = options || {};
    this.rootEl = null;
  }

  mount(containerEl) {
    if (!containerEl) return;
    containerEl.classList.add('system-settings-scope', 'settings-panel', 'active');
    this.rootEl = containerEl;
    this.rootEl.innerHTML = this.render();
    this.bindEvents();
  }

  render() {
    return `
      <div class="drawing-template-title">勾画模板设置</div>
      <div class="drawing-template-layout">
        <div class="drawing-template-left">
          <div class="drawing-template-type-row">
            <select class="cell-select">
              <option value="CT" selected>CT</option>
              <option value="MR">MR</option>
            </select>
            <input type="text" class="cell-input" placeholder="请输入模板名称">
          </div>
          <div class="drawing-template-list" id="drawing-template-list">
            <div class="drawing-template-list-item selected" data-id="1">
              <span class="item-name">孤颈癌 术前 OAR+靶区 模板</span>
              <span class="item-actions">
                <button type="button" class="btn-top" title="置顶"><i class="fa-solid fa-arrow-up"></i></button>
                <button type="button" class="btn-del" title="删除"><i class="fa-solid fa-trash-can"></i></button>
              </span>
            </div>
            <div class="drawing-template-list-item" data-id="2">
              <span class="item-name">男颈部模板</span>
              <span class="item-actions">
                <button type="button" class="btn-top" title="置顶"><i class="fa-solid fa-arrow-up"></i></button>
                <button type="button" class="btn-del" title="删除"><i class="fa-solid fa-trash-can"></i></button>
              </span>
            </div>
            <div class="drawing-template-list-item" data-id="3">
              <span class="item-name">乳腺OAR+靶区模板</span>
              <span class="item-actions">
                <button type="button" class="btn-top" title="置顶"><i class="fa-solid fa-arrow-up"></i></button>
                <button type="button" class="btn-del" title="删除"><i class="fa-solid fa-trash-can"></i></button>
              </span>
            </div>
            <div class="drawing-template-list-item" data-id="4">
              <span class="item-name">高颈癌 术前 OAR+靶区 模板</span>
              <span class="item-actions">
                <button type="button" class="btn-top" title="置顶"><i class="fa-solid fa-arrow-up"></i></button>
                <button type="button" class="btn-del" title="删除"><i class="fa-solid fa-trash-can"></i></button>
              </span>
            </div>
            <div class="drawing-template-list-item" data-id="5">
              <span class="item-name">女下腹部模板</span>
              <span class="item-actions">
                <button type="button" class="btn-top" title="置顶"><i class="fa-solid fa-arrow-up"></i></button>
                <button type="button" class="btn-del" title="删除"><i class="fa-solid fa-trash-can"></i></button>
              </span>
            </div>
            <div class="drawing-template-list-item" data-id="6">
              <span class="item-name">男下腹部模板</span>
              <span class="item-actions">
                <button type="button" class="btn-top" title="置顶"><i class="fa-solid fa-arrow-up"></i></button>
                <button type="button" class="btn-del" title="删除"><i class="fa-solid fa-trash-can"></i></button>
              </span>
            </div>
          </div>
          <div class="drawing-template-left-btns">
            <button type="button" class="btn btn-primary"><i class="fa-solid fa-plus"></i>新建模板</button>
            <button type="button" class="btn btn-secondary"><i class="fa-solid fa-folder-open"></i>导入模板</button>
          </div>
        </div>
        <div class="drawing-template-right">
          <div class="drawing-template-right-header">
            <input type="checkbox" id="drawing-template-check-all">
            <span id="drawing-template-current-name">孤颈癌 术前 OAR+靶区 模板</span>
            <div class="drawing-template-search-row">
              <div class="search-input-wrap">
                <i class="fa-solid fa-search"></i>
                <input type="text" id="drawing-template-roi-search" placeholder="请输入ROI名称进行搜索">
                <button type="button" class="search-clear" id="drawing-template-search-clear" style="position:absolute;right:8px;"><i class="fa-solid fa-times"></i></button>
              </div>
              <button type="button" class="btn" id="drawing-template-expand-all">全部展开</button>
            </div>
          </div>
          <div class="drawing-template-roi-tree" id="drawing-template-roi-tree">
            ${this.renderRoiTreeMock()}
          </div>
          <div class="drawing-template-right-footer">
            <button type="button" class="btn btn-secondary">另存为模板</button>
            <button type="button" class="btn btn-primary">保存</button>
          </div>
        </div>
      </div>
    `;
  }

  renderRoiTreeMock() {
    // 保持与原页面一致的 mock 结构（后续接真实数据再替换）
    return `
      <div class="roi-tree-group expanded" data-group="head-neck">
        <div class="roi-tree-group-title"><i class="fa-solid fa-chevron-right"></i>头颈部</div>
        <div class="roi-tree-group-children">
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">OralCavity [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">SpinalCordExtend [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">TemporalLobe_L [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">InnerEar_R [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">Heart (subgroup)</span></label>
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">IAC_L [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">OpticNerve_R [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">LarynxExtend [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">Submandibuler_R [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">TemporalLobe_withHippo_L [中文器官 3D]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">TMJ_L [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">OpticNerve_L [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">TMJ_R [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">Cochlea_L [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">TympanicCavity_L [中文器官]</span></label>
        </div>
      </div>
      <div class="roi-tree-group" data-group="male-thorax">
        <div class="roi-tree-group-title"><i class="fa-solid fa-chevron-right"></i>男胸部</div>
        <div class="roi-tree-group-children">
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">OralCavity [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">SpinalCordExtend [中文器官]</span></label>
        </div>
      </div>
      <div class="roi-tree-group expanded" data-group="female-thorax">
        <div class="roi-tree-group-title"><i class="fa-solid fa-chevron-right"></i>女胸部</div>
        <div class="roi-tree-group-children">
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">OralCavity [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">SpinalCordExtend [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">TemporalLobe_L [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">InnerEar_R [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">TemporalLobe_withHippo_L [中文器官 3D]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">TMJ_L [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">OpticNerve_L [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">TMJ_R [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox" checked> <span class="roi-label">Cochlea_L [中文器官]</span></label>
          <label class="roi-tree-item"><input type="checkbox"> <span class="roi-label">TympanicCavity_L [中文器官]</span></label>
        </div>
      </div>
    `;
  }

  bindEvents() {
    if (!this.rootEl) return;

    const list = this.rootEl.querySelector('#drawing-template-list');
    const currentNameEl = this.rootEl.querySelector('#drawing-template-current-name');
    const roiTree = this.rootEl.querySelector('#drawing-template-roi-tree');
    const expandAllBtn = this.rootEl.querySelector('#drawing-template-expand-all');
    const checkAll = this.rootEl.querySelector('#drawing-template-check-all');
    const roiSearchInput = this.rootEl.querySelector('#drawing-template-roi-search');
    const roiSearchClear = this.rootEl.querySelector('#drawing-template-search-clear');

    if (checkAll && roiTree) {
      checkAll.addEventListener('change', () => {
        const checked = checkAll.checked;
        roiTree.querySelectorAll('input[type="checkbox"]').forEach((box) => {
          box.checked = checked;
        });
      });
    }

    if (list) {
      list.addEventListener('click', (e) => {
        const actionBtn = e.target && e.target.closest ? e.target.closest('.item-actions button') : null;
        const item = e.target && e.target.closest ? e.target.closest('.drawing-template-list-item') : null;
        if (!item) return;

        if (actionBtn) {
          if (actionBtn.classList.contains('btn-del')) {
            const wasSelected = item.classList.contains('selected');
            item.remove();
            if (wasSelected) {
              const first = list.querySelector('.drawing-template-list-item');
              list.querySelectorAll('.drawing-template-list-item').forEach((i) => i.classList.remove('selected'));
              if (first) {
                first.classList.add('selected');
                if (currentNameEl) {
                  const span1 = first.querySelector('.item-name');
                  currentNameEl.textContent = span1 ? span1.textContent : '';
                }
              } else if (currentNameEl) {
                currentNameEl.textContent = '';
              }
            }
          } else if (actionBtn.classList.contains('btn-top')) {
            const firstItem = list.querySelector('.drawing-template-list-item');
            if (firstItem && firstItem !== item) list.insertBefore(item, firstItem);
          }
          return;
        }

        list.querySelectorAll('.drawing-template-list-item').forEach((i) => i.classList.remove('selected'));
        item.classList.add('selected');
        if (currentNameEl) {
          const nameSpan = item.querySelector('.item-name');
          currentNameEl.textContent = nameSpan ? nameSpan.textContent : '';
        }
      });
    }

    if (roiTree) {
      roiTree.addEventListener('click', (e) => {
        const title = e.target && e.target.closest ? e.target.closest('.roi-tree-group-title') : null;
        if (!title) return;
        const group = title.closest('.roi-tree-group');
        if (group) group.classList.toggle('expanded');
      });
    }

    if (expandAllBtn && roiTree) {
      const expandLabel = expandAllBtn.textContent || '全部展开';
      const collapseLabel = '全部收起';

      const updateExpandAllLabel = () => {
        const groups = roiTree.querySelectorAll('.roi-tree-group');
        const allExpandedNow = groups.length && Array.prototype.every.call(groups, (g) => g.classList.contains('expanded'));
        expandAllBtn.textContent = allExpandedNow ? collapseLabel : expandLabel;
      };

      updateExpandAllLabel();
      expandAllBtn.addEventListener('click', () => {
        const groups = roiTree.querySelectorAll('.roi-tree-group');
        const allExpanded = groups.length && Array.prototype.every.call(groups, (g) => g.classList.contains('expanded'));
        const nextExpanded = !allExpanded;
        groups.forEach((g) => g.classList.toggle('expanded', nextExpanded));
        expandAllBtn.textContent = nextExpanded ? collapseLabel : expandLabel;
      });
    }

    if (roiSearchInput && roiTree) {
      const filterROITree = () => {
        const q = roiSearchInput.value.trim().toLowerCase();
        const items = roiTree.querySelectorAll('.roi-tree-item');
        items.forEach((item) => {
          const label = item.querySelector('.roi-label');
          const text = label ? label.textContent : '';
          const show = !q || text.toLowerCase().indexOf(q) !== -1;
          item.style.display = show ? '' : 'none';
        });
        const groups = roiTree.querySelectorAll('.roi-tree-group');
        groups.forEach((group) => {
          let visibleCount = 0;
          group.querySelectorAll('.roi-tree-item').forEach((it) => {
            if (it.style.display !== 'none') visibleCount++;
          });
          group.style.display = visibleCount > 0 ? '' : 'none';
          if (visibleCount > 0 && q) group.classList.add('expanded');
        });
        if (!q) groups.forEach((g) => { g.style.display = ''; });
      };

      roiSearchInput.addEventListener('keydown', (e) => {
        if (e.keyCode === 13) {
          e.preventDefault();
          filterROITree();
        }
      });

      if (roiSearchClear) {
        roiSearchClear.addEventListener('click', () => {
          roiSearchInput.value = '';
          filterROITree();
          roiSearchInput.focus();
        });
      }
    }
  }
}

window.DrawingTemplateSettingsComponent = DrawingTemplateSettingsComponent;

