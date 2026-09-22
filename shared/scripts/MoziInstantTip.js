/**
 * Instant hover tips — replaces native title delay (≈1s) with immediate display.
 * Pattern adapted from goal-board GB.Tip.
 */
(function (global) {
    'use strict';

    if (global.MoziInstantTip && global.MoziInstantTip.__ready) return;

    let box = null;
    let current = null;
    let hideTimer = null;

    function ensure() {
        if (box) return box;
        box = document.createElement('div');
        box.className = 'mozi-instant-tip';
        box.setAttribute('role', 'tooltip');
        box.hidden = true;
        box.addEventListener('pointerenter', cancelHide);
        box.addEventListener('pointerleave', function (e) {
            if (current && e.relatedTarget && current.contains(e.relatedTarget)) return;
            hideSoon();
        });
        document.body.appendChild(box);
        return box;
    }

    function cancelHide() {
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
    }

    function hideSoon() {
        cancelHide();
        hideTimer = setTimeout(hide, 140);
    }

    function hide() {
        cancelHide();
        if (box) box.hidden = true;
        current = null;
    }

    function show(anchor, text) {
        const tip = String(text || '').trim();
        if (!tip || !anchor) return;
        cancelHide();
        const el = ensure();
        el.textContent = tip;
        el.style.maxHeight = '';
        el.hidden = false;
        const r = anchor.getBoundingClientRect();
        const pad = 8;
        const gap = 6;
        const spaceAbove = Math.max(0, r.top - pad - gap);
        const spaceBelow = Math.max(0, window.innerHeight - r.bottom - pad - gap);
        const avail = Math.max(spaceAbove, spaceBelow, 48);
        el.style.maxHeight = avail + 'px';
        const tw = el.offsetWidth;
        const th = el.offsetHeight;
        let left = r.left + (r.width - tw) / 2;
        if (left < pad) left = pad;
        if (left + tw > window.innerWidth - pad) left = Math.max(pad, window.innerWidth - pad - tw);
        let top;
        if (spaceBelow >= th || spaceBelow >= spaceAbove) top = r.bottom + gap;
        else top = r.top - th - gap;
        if (top < pad) top = pad;
        if (top + th > window.innerHeight - pad) top = Math.max(pad, window.innerHeight - pad - th);
        el.style.left = left + 'px';
        el.style.top = top + 'px';
    }

    function iconOnly(el) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        return !t || t.length <= 2;
    }

    function readTip(el) {
        if (!el || el.nodeType !== 1) return '';
        if (el === document.documentElement || el === document.body) return '';
        // Skip elements that manage their own custom tooltip UI
        if (el.classList.contains('optimization-settings-label') && el.hasAttribute('data-tooltip')) {
            return '';
        }
        if (el.hasAttribute('title')) {
            const t = el.getAttribute('title');
            el.setAttribute('data-tip', t);
            el.removeAttribute('title');
            return t;
        }
        const stored = el.getAttribute('data-tip');
        if (stored) return stored;
        if (iconOnly(el)) return el.getAttribute('aria-label') || '';
        return '';
    }

    function findNode(start) {
        let n = start && start.nodeType === 1 ? start : (start && start.parentElement);
        while (n && n !== document.body && n !== document.documentElement) {
            if (n.hasAttribute('title') || n.hasAttribute('data-tip')) return n;
            if (n.classList.contains('optimization-settings-label') && n.hasAttribute('data-tooltip')) {
                return null;
            }
            if (n.hasAttribute('aria-label') && iconOnly(n)) return n;
            n = n.parentElement;
        }
        return null;
    }

    function onOver(e) {
        if (box && box.contains(e.target)) {
            cancelHide();
            return;
        }
        const node = findNode(e.target);
        if (!node) {
            if (current) hideSoon();
            return;
        }
        if (node === current) {
            cancelHide();
            return;
        }
        const tip = readTip(node);
        if (!tip) {
            if (current) hideSoon();
            return;
        }
        current = node;
        show(node, tip);
    }

    function onOut(e) {
        if (!current) return;
        if (e.relatedTarget && current.contains(e.relatedTarget)) return;
        if (box && e.relatedTarget && box.contains(e.relatedTarget)) return;
        hideSoon();
    }

    function init() {
        document.addEventListener('pointerover', onOver);
        document.addEventListener('pointerout', onOut);
        document.addEventListener('pointerdown', function (e) {
            if (box && box.contains(e.target)) return;
            hide();
        });
        document.addEventListener('scroll', function (e) {
            if (box && e.target === box) return;
            hide();
        }, true);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') hide();
        });
    }

    function boot() {
        if (document.body) init();
        else document.addEventListener('DOMContentLoaded', init);
    }

    boot();

    global.MoziInstantTip = { hide: hide, show: show, __ready: true };
})(typeof window !== 'undefined' ? window : this);
