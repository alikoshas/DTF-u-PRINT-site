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
