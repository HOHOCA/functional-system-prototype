/**
 * 当前打开的患者。各模块共用同一份数据，避免患者概览各写各的。
 * sessionStorage 让 iframe 之间也能同步；选中患者后其它已打开模块会跟着刷新。
 */
(function (global) {
    function productScope() {
        const match = String(location.pathname || '').match(/\/(photon-client|proton-client|brachy-client)\b/);
        return match ? match[1] : 'shared';
    }

    const STORAGE_KEY = 'mozi.currentPatient.' + productScope();
    const EVENT_NAME = 'mozi:current-patient';

    const DEFAULT = {
        name: 'Dong, Wuping',
        id: '0000576304',
        birthDate: '19730307',
        gender: 'M',
        machine: 'TrueBeamSN3304'
    };

    function normalize(patient) {
        const src = patient && typeof patient === 'object' ? patient : {};
        const birth = String(src.birthDate || '').replace(/\D/g, '') || DEFAULT.birthDate;
        return {
            name: src.name || DEFAULT.name,
            id: src.id || DEFAULT.id,
            birthDate: birth,
            gender: src.gender || DEFAULT.gender,
            machine: src.machine || DEFAULT.machine
        };
    }

    function readStored() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return normalize(JSON.parse(raw));
        } catch (err) {
            return null;
        }
    }

    function get() {
        return readStored() || normalize(DEFAULT);
    }

    function set(patient) {
        const next = normalize(patient);
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (err) {
            /* ignore quota / private mode */
        }
        const event = new CustomEvent(EVENT_NAME, { detail: next });
        global.dispatchEvent(event);
        try {
            if (global.parent && global.parent !== global) {
                global.parent.dispatchEvent(event);
            }
        } catch (err) {
            /* cross-origin parent */
        }
        return next;
    }

    function subscribe(handler) {
        if (typeof handler !== 'function') return function () {};

        const onCustom = function (event) {
            handler(normalize(event.detail));
        };
        const onStorage = function (event) {
            if (event.key !== STORAGE_KEY || !event.newValue) return;
            try {
                handler(normalize(JSON.parse(event.newValue)));
            } catch (err) {
                /* ignore */
            }
        };

        global.addEventListener(EVENT_NAME, onCustom);
        global.addEventListener('storage', onStorage);
        try {
            if (global.parent && global.parent !== global) {
                global.parent.addEventListener(EVENT_NAME, onCustom);
            }
        } catch (err) {
            /* ignore */
        }

        return function unsubscribe() {
            global.removeEventListener(EVENT_NAME, onCustom);
            global.removeEventListener('storage', onStorage);
            try {
                if (global.parent && global.parent !== global) {
                    global.parent.removeEventListener(EVENT_NAME, onCustom);
                }
            } catch (err) {
                /* ignore */
            }
        };
    }

    global.CurrentPatient = {
        STORAGE_KEY: STORAGE_KEY,
        EVENT_NAME: EVENT_NAME,
        DEFAULT: Object.assign({}, DEFAULT),
        normalize: normalize,
        get: get,
        set: set,
        subscribe: subscribe
    };
})(window);
