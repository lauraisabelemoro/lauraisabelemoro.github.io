/* Laura Moro — site v3 */
// E-mail vem do painel (window.SITE_CONFIG, gerado no index.html).
const CONFIG = Object.assign({ email: "lauramoro325@gmail.com", whatsapp: "" }, window.SITE_CONFIG || {});

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vh = () => window.innerHeight;

  $$("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- letras do lockup ---------- */
  $$("[data-split]").forEach(el => {
    el.innerHTML = [...el.textContent].map((ch, i) => `<span style="--i:${i}">${ch}</span>`).join("");
  });

  /* ---------- menu do celular ---------- */
  const burger = $(".burger"), mm = $("#mmenu");
  const setMenu = open => {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    mm.hidden = !open;
    document.body.classList.toggle("lock", open);
  };
  burger.addEventListener("click", () => setMenu(mm.hidden));
  $$("a", mm).forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("resize", () => { if (innerWidth >= 1000 && !mm.hidden) setMenu(false); });

  /* ---------- indicador do menu ---------- */
  const links = $$(".nav__links a"), ind = $(".nav__ind");
  const moveInd = a => {
    links.forEach(l => l.classList.toggle("is-on", l === a));
    if (!a) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1;
    ind.style.width = a.offsetWidth + "px";
    ind.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  const navSecs = links.map(a => document.getElementById(a.dataset.nav)).filter(Boolean);

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  $$(".rv").forEach(el => io.observe(el));

  /* ---------- contagem dos números (nunca passa do valor oficial) ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count;
    cio.unobserve(el);
    if (reduce) return;
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$("[data-count]").forEach(el => { if (!reduce) el.textContent = "0"; cio.observe(el); });

  /* ---------- manifesto acende palavra por palavra ---------- */
  const words = $("[data-words]");
  let wordEls = [];
  if (words) {
    const cap = words.querySelector(".cap");
    const capHTML = cap ? cap.outerHTML : "";
    if (cap) cap.remove();
    const txt = words.textContent.trim().split(/\s+/);
    words.innerHTML = txt.map((w, i) => `<span class="w">${i === 0 ? capHTML : ""}${w}</span>`).join(" ");
    wordEls = $$(".w", words);
  }

  /* ---------- hero: a foto "abre" em vídeo ---------- */
  const hero = $(".hero"), stage = $(".hero__stage"), pola = $(".hero__pola"), reel = $(".hero__reel");
  const reelVid = reel && $("video", reel);
  let cx = 0, cy = 0, maxR = 0;
  const measure = () => {
    if (!pola) return;
    const s = stage.getBoundingClientRect(), r = pola.getBoundingClientRect();
    // mede sem o efeito do scroll
    cx = r.left - s.left + r.width / 2;
    cy = r.top - s.top + r.height / 2;
    maxR = Math.hypot(Math.max(cx, s.width - cx), Math.max(cy, s.height - cy)) + 10;
  };

  const arcs = $$(".arc");
  const fab = $(".fab"), contato = $("#contato");

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const H = vh();

    // hero
    if (hero && !reduce) {
      const total = hero.offsetHeight - H;
      const p = Math.min(1, Math.max(0, scrollY / total));
      hero.style.setProperty("--p", p.toFixed(4));
      const k = Math.min(1, Math.max(0, (p - .08) / .72));
      const e = k * k * (3 - 2 * k);
      reel.style.setProperty("--rad", (e * maxR).toFixed(1) + "px");
      reel.style.setProperty("--cx", cx + "px");
      reel.style.setProperty("--cy", cy + "px");
      if (reelVid) {
        if (p > .04 && p < 1 && reelVid.paused) reelVid.play().catch(() => {});
        if ((p <= .04 || scrollY > hero.offsetHeight) && !reelVid.paused) reelVid.pause();
      }
    }

    // bordas curvas
    arcs.forEach(s => {
      const top = s.getBoundingClientRect().top;
      const t = Math.min(1, Math.max(0, top / H));
      s.style.setProperty("--a", (t * Math.min(H * .14, 130)).toFixed(1) + "px");
    });

    // manifesto
    if (wordEls.length) {
      const r = words.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, (H * .85 - r.top) / (r.height + H * .35)));
      const n = Math.round(k * wordEls.length);
      wordEls.forEach((w, i) => w.classList.toggle("on", i < n));
    }

    // menu ativo
    let cur = null;
    navSecs.forEach((s, i) => { if (s.getBoundingClientRect().top < H * .4) cur = links[i]; });
    if (scrollY < (hero ? hero.offsetHeight - H : 0)) cur = null;
    if (cur !== moveInd.last) { moveInd(cur); moveInd.last = cur; }

    // botão flutuante
    if (fab) {
      const ct = contato.getBoundingClientRect().top;
      fab.hidden = !(scrollY > H * 1.2 && ct > H * .8);
    }
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", () => { measure(); req(); });
  addEventListener("load", () => { measure(); req(); });
  // a polaroid entra animada: mede de novo quando termina
  setTimeout(() => { measure(); req(); }, 1900);
  if (reduce && words) wordEls.forEach(w => w.classList.add("on"));
  measure(); onScroll();
  if (document.fonts) document.fonts.ready.then(() => { measure(); moveInd(moveInd.last); });

  /* ---------- câmera polaroid: ejeta as fotos ao aparecer; o botão repete ---------- */
  const cam = $("[data-cam]");
  if (cam) {
    const camIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { cam.classList.add("in"); camIO.disconnect(); }
    }), { threshold: .35 });
    camIO.observe(cam);
    $(".cam__btn", cam).addEventListener("click", () => {
      cam.classList.remove("in"); void cam.offsetWidth; cam.classList.add("in");
    });
  }

  /* ---------- marcas levam ao case e destacam o card ---------- */
  $$("[data-brand]").forEach(a => a.addEventListener("click", () => {
    const name = a.querySelector("span").textContent.trim();
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    const perfil = $$(".perfis__n", target).find(p => p.textContent.trim() === name);
    const el = perfil ? perfil.closest("li").querySelector(".phone") : target.querySelector(".case__t");
    if (!el) return;
    el.classList.remove("is-hl"); void el.offsetWidth; el.classList.add("is-hl");
  }));

  /* ---------- "+" que abre / fecha ---------- */
  $$(".more__btn").forEach(b => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", open);
    document.getElementById(b.getAttribute("aria-controls")).hidden = !open;
  }));

  /* ---------- vídeos dos cards tocam mudos quando visíveis ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !reduce) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause();
  }), { threshold: .4 });
  $$("video.autoplay").forEach(v => vio.observe(v));

  /* ---------- modal (vídeo / imagem) ---------- */
  const modal = $("#modal"), body = $(".modal__body", modal), close = $(".modal__close", modal);
  let lastFocus = null;
  const openModal = html => {
    lastFocus = document.activeElement;
    body.innerHTML = html;
    modal.hidden = false;
    document.body.classList.add("lock");
    if (reelVid) reelVid.pause();
    close.focus();
  };
  const closeModal = () => {
    const v = $("video", body); if (v) v.pause();
    body.innerHTML = "";
    modal.hidden = true;
    document.body.classList.remove("lock");
    if (lastFocus) lastFocus.focus();
  };
  document.addEventListener("click", e => {
    const v = e.target.closest("[data-video]");
    if (v) {
      e.preventDefault();
      openModal(`<video src="${v.dataset.video}" poster="${v.dataset.poster || ""}" controls autoplay playsinline></video>`);
      return;
    }
    const im = e.target.closest("[data-lightbox]");
    if (im) {
      e.preventDefault();
      openModal(`<img src="${im.dataset.lightbox}" alt="${(im.dataset.alt || "").replace(/"/g, "&quot;")}">`);
    }
  });
  close.addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!modal.hidden) closeModal();
    else if (!mm.hidden) { setMenu(false); burger.focus(); }
  });

  /* ---------- WhatsApp (só se configurado) ---------- */
  if (CONFIG.whatsapp) {
    const li = $("[data-whatsapp]");
    if (li) {
      li.hidden = false;
      $("a", li).href = `https://wa.me/${CONFIG.whatsapp}`;
      $("[data-whatsapp-label]", li).textContent = "Chamar no WhatsApp";
    }
  }

  /* ---------- formulário → e-mail pronto ---------- */
  const form = $("#form");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const f = form.elements;
    const checks = [
      [f.nome, $("#e-nome"), v => v.trim().length > 1],
      [f.email, $("#e-email"), v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())],
      [f.mensagem, $("#e-msg"), v => v.trim().length > 5]
    ];
    let first = null;
    checks.forEach(([inp, err, ok]) => {
      const good = ok(inp.value);
      err.hidden = good;
      inp.setAttribute("aria-invalid", !good);
      if (!good && !first) first = inp;
    });
    if (first) { first.focus(); return; }
    const ints = $$('input[name="interesse"]:checked', form).map(i => i.value);
    const subject = `Contato pelo site — ${f.nome.value.trim()}${f.marca.value.trim() ? " (" + f.marca.value.trim() + ")" : ""}`;
    const lines = [
      `Oi, Laura!`, ``,
      f.mensagem.value.trim(), ``,
      ints.length ? `Interesse: ${ints.join(", ")}` : "",
      f.marca.value.trim() ? `Marca/projeto: ${f.marca.value.trim()}` : "",
      `Nome: ${f.nome.value.trim()}`,
      `E-mail: ${f.email.value.trim()}`
    ].filter((l, i, a) => l !== "" || a[i - 1] !== "");
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    $(".form__ok", form).hidden = false;
  });
})();
