// 系统设置页入口：初始化左侧导航、切换面板、挂载组件
(function () {
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getConfig() {
    return window.SYSTEM_SETTINGS_CONFIG || [];
  }

  function createPanelEl(tabId) {
    const el = document.createElement('div');
    el.className = 'settings-panel';
    el.id = 'panel-' + tabId;
    return el;
  }

  function mountPanel(tab, panelEl) {
    const componentName = tab.component;
    const Ctor = componentName ? window[componentName] : null;
    if (!Ctor) {
      panelEl.innerHTML = `<h2 class="panel-title">${tab.label || '设置'}</h2>`;
      return;
    }
    const instance = new Ctor({ tabId: tab.tabId, title: tab.label });
    if (typeof instance.mount === 'function') instance.mount(panelEl);
  }

  function initCloseButton() {
    const btn = $('#settings-close-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const main = document.querySelector('.settings-right');
      const currentPanel = main ? main.querySelector('.settings-panel.active') : null;
      const doClose = function () {
        if (window.history && window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '../../index.html';
        }
      };
      const ev = new CustomEvent('beforeSettingsClose', { cancelable: true, detail: { confirm: doClose } });
      document.dispatchEvent(ev);
      if (!ev.defaultPrevented) doClose();
    });
  }

  function initNavAndPanels() {
    const config = getConfig();
    const nav = $('.settings-nav');
    const main = $('.settings-right');
    if (!nav || !main) return;

    // 生成 panel 容器并挂载组件（只挂载一次，切换时只是 show/hide）
    const panelMap = {};
    config.forEach((tab) => {
      const panelEl = createPanelEl(tab.tabId);
      main.appendChild(panelEl);
      panelMap[tab.tabId] = panelEl;
      mountPanel(tab, panelEl);
    });

    function setActive(tabId) {
      $all('.settings-nav-item', nav).forEach((item) => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
      });
      Object.keys(panelMap).forEach((id) => {
        panelMap[id].classList.toggle('active', id === tabId);
      });
    }

    // 绑定导航点击（支持未保存提示：器官限量等面板可阻止切换并弹窗确认）
    $all('.settings-nav-item', nav).forEach((item) => {
      item.addEventListener('click', function () {
        const tabId = item.getAttribute('data-tab');
        if (!tabId) return;
        const currentPanel = $('.settings-panel.active', main);
        const detail = { nextTabId: tabId, confirm: function () { setActive(tabId); } };
        const ev = new CustomEvent('beforeSettingsTabChange', { cancelable: true, detail: detail });
        if (currentPanel && currentPanel.dispatchEvent(ev) && !ev.defaultPrevented) {
          setActive(tabId);
        }
      });
    });

    // 默认激活：优先沿用 HTML 里标记 active 的 nav，否则第一个
    const defaultNav = $('.settings-nav-item.active', nav) || $('.settings-nav-item', nav);
    const defaultTabId = defaultNav ? defaultNav.getAttribute('data-tab') : null;
    if (defaultTabId) setActive(defaultTabId);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCloseButton();
    initNavAndPanels();
  });
})();

