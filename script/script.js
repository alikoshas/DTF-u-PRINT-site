document.querySelectorAll('.gallery-item').forEach(btn => {
    btn.addEventListener('click', function () {
        const src = this.dataset.src;
        let lb = document.getElementById('lightbox');

        if (!lb) {
            const d = document.createElement('div');
            d.id = 'lightbox';
            d.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);z-index:9999;padding:24px;box-sizing:border-box;';
            d.innerHTML = `
        <div style="position:relative;max-width:900px;width:100%">
          <button id="lbclose" aria-label="Закрыть" style="position:absolute;right:8px;top:8px;font-size:28px;color:#fff;background:transparent;border:0;cursor:pointer">✕</button>
          <img id="lightbox-img" src="${src}" style="width:100%;height:auto;border-radius:8px;display:block" alt="Просмотр изображения" />
        </div>`;
            document.body.appendChild(d);

            const close = () => d.remove();
            document.getElementById('lbclose').addEventListener('click', close);
            d.addEventListener('click', e => { if (e.target === d) close(); });
            lb = d;
        } else {
            const img = document.getElementById('lightbox-img');
            img.src = src;
            lb.style.display = 'flex';
        }
    });
});

(function(){
    const header = document.querySelector('.site-header');
    const offset = () => (header ? header.getBoundingClientRect().height + 8 : 0);
    const smoothTo = (id) => {
        const el = document.querySelector(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - offset();
        window.scrollTo({ top, behavior: 'smooth' });
    };

    document.querySelectorAll('.main-nav a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const hash = a.getAttribute('href');
            if (!hash || hash === '#') return;
            e.preventDefault();
            smoothTo(hash);
        });
    });

    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', e => {
            const hash = logo.getAttribute('href');
            if (hash && hash.startsWith('#')) { e.preventDefault(); smoothTo(hash); }
        });
    }
})();

(function(){
    const PRICE_TABLES = {
        fullcolor: [
            { maxH1: 1,   price: 1000 },
            { maxH1: 3,   price: 700  },
            { maxH1: 9,   price: 600  },
            { maxH1: 49,  price: 500  },
            { maxH1: 99,  price: 450  },
            { maxH1: 199, price: 400  },
            { maxH1: 299, price: 350  },
            { maxH1: 499, price: 250  },
            { maxH1: Infinity, price: 240 }
        ],
        metallic: [
            { maxH1: 1,   price: 1100 },
            { maxH1: 3,   price: 800  },
            { maxH1: 9,   price: 700  },
            { maxH1: 49,  price: 600  },
            { maxH1: 99,  price: 520  },
            { maxH1: 199, price: 410  },
            { maxH1: 299, price: 350  },
            { maxH1: 499, price: 290  },
            { maxH1: Infinity, price: 280 }
        ]
    };

    const $ = id => document.getElementById(id);
    const formatMoney = x => new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(x);

    function num(id){
        const raw = (($(id) && $(id).value) || '').toString().replace(/\s+/g,'').replace(',', '.');
        const v = parseFloat(raw);
        return Number.isFinite(v) ? v : 0;
    }
    function intPos(id){
        const v = Math.floor(num(id));
        return v > 0 ? v : 0;
    }

    const inputs = ['length','width','gap','qty'].map($).filter(Boolean);
    const calcBtn = $('calcBtn');
    const err = $('err');

    function validate(){
        const L = num('length'), W = num('width'), Q = intPos('qty');
        if (calcBtn) calcBtn.disabled = !(L > 0 && W > 0 && Q > 0);
    }
    inputs.forEach(el => {
        el.addEventListener('input', validate);
        el.addEventListener('change', validate);
        el.addEventListener('blur', validate);
    });
    document.querySelectorAll('input[name="printType"]').forEach(el=>{
        el.addEventListener('change', validate);
    });
    validate();

    function pricePerSheet(type, H1){
        const table = PRICE_TABLES[type] || [];
        for (const r of table) if (H1 <= r.maxH1) return r.price;
        return 0;
    }

    function calc(){
        if (!err) return;
        err.textContent = '';
        const type = (document.querySelector('input[name="printType"]:checked')||{}).value || 'fullcolor';
        const L = num('length'), W = num('width'), G = Math.max(0, num('gap')), Q = intPos('qty');

        if (!(L>0 && W>0 && Q>0)){
            err.textContent = 'Заполните положительные значения длины, ширины и количества.';
            const m = $('money'); if (m) m.style.display = 'none';
            return;
        }

        // Раскладка на лист 290x480 мм
        const B1 = Math.floor(290/(L+G)) * Math.floor(480/(W+G));
        const B2 = Math.floor(290/(W+G)) * Math.floor(480/(L+G));
        const D1 = Math.max(B1,B2);

        if (D1 === 0){
            const m = $('money'); if (m) m.style.display = 'none';
            err.textContent = 'Размеры и/или зазор слишком велики: на лист не помещается ни одно изделие.';
            return;
        }

        const H1 = Math.ceil(Q / D1);
        const pps = pricePerSheet(type, H1);
        const sum = pps * H1;

        const sumEl = $('sum'), money = $('money');
        if (sumEl && money){
            sumEl.textContent = formatMoney(sum);
            money.style.display = '';
        }
    }

    if (calcBtn){
        calcBtn.addEventListener('click', calc);
        document.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !calcBtn.disabled) calc();
        });
    }
})();