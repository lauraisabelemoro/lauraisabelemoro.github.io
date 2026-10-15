/* =========================================================
   Laura Moro — interações
   ========================================================= */
const CONFIG = {
  email: "lauramoro325@gmail.com",
  assunto: "Contato pelo site | Projeto de conteúdo",
  // WhatsApp desligado até a Laura confirmar o uso público do número.
  // Para ligar: whatsapp: "5541995616526"
  whatsapp: null,
  whatsappLabel: "(41) 99561-6526",
};

(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Ano ---------- */
  $$("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- WhatsApp opcional ---------- */
  if (CONFIG.whatsapp) {
    const li = $("[data-whatsapp]");
    if (li) {
      li.hidden = false;
      $("a", li).href = `https://wa.me/${CONFIG.whatsapp}`;
      $("[data-whatsapp-label]", li).textContent = CONFIG.whatsappLabel;
    }
  }

  /* ---------- HERO: visor da câmera ---------- */
  const hero = $(".hero");
  $$("[data-split]").forEach((el, wi) => {
    const txt = el.textContent;
    el.textContent = "";
    [...txt].forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c;
      s.style.transitionDelay = `${1.0 + wi * 0.22 + i * 0.07}s`;
      el.appendChild(s);
    });
  });

  const vf = $("[data-vf]");
  const scenes = $$(".vf__scene", vf);
  const focus = $(".vf__focus", vf);
  const label = $("[data-vf-label]", vf);
  const tag = $(".vf__tag", vf);
  const thumb = $(".vf__thumb", vf);
  const shutter = $(".vf__shutter", vf);
  const mobile = () => window.matchMedia("(max-width: 759px)").matches;
  let cur = 0, prev = null, timer = null, userAt = 0, inView = true;

  const pt = sc => (sc.dataset[mobile() ? "fp" : "fl"] || "50,45").split(",").map(Number);
  const setFocus = (x, y, smooth) => {
    vf.classList.toggle("is-anim", !!smooth);
    vf.style.setProperty("--fx", typeof x === "number" ? `${x}%` : x);
    vf.style.setProperty("--fy", typeof y === "number" ? `${y}%` : y);
  };
  const pulse = () => {
    focus.classList.remove("is-pulse"); void focus.offsetWidth; focus.classList.add("is-pulse");
  };
  const curImg = () => $(".vf__color img", scenes[cur]);

  const go = (next, opts = {}) => {
    if (next === cur) return;
    const from = scenes[cur];
    // a cena atual vira a "última captura" na miniatura
    if (opts.capture && !reduce) {
      vf.classList.remove("is-flash"); void vf.offsetWidth; vf.classList.add("is-flash");
      const src = curImg().currentSrc;
      const g = document.createElement("img");
      g.className = "vf__ghost"; g.src = src; g.alt = "";
      const r = vf.getBoundingClientRect(), t = thumb.getBoundingClientRect();
      Object.assign(g.style, { left: "0px", top: "0px", width: r.width + "px", height: r.height + "px" });
      vf.appendChild(g);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        Object.assign(g.style, { left: t.left - r.left + "px", top: t.top - r.top + "px", width: t.width + "px", height: t.height + "px", borderRadius: "10px", opacity: ".9" });
      }));
      setTimeout(() => g.remove(), 700);
    }
    prev = cur;
    thumb.disabled = false;
    $("img", thumb).src = curImg().currentSrc || curImg().src;
    thumb.classList.remove("is-pop"); void thumb.offsetWidth; thumb.classList.add("is-pop");
    from.classList.remove("is-on");
    cur = next;
    const sc = scenes[cur];
    $$("img", sc).forEach(i => { i.loading = "eager"; });
    sc.classList.add("is-on");
    label.textContent = sc.dataset.label;
    tag.classList.remove("is-swap"); void tag.offsetWidth; tag.classList.add("is-swap");
    const [x, y] = pt(sc);
    setFocus(x, y, true); pulse();
  };
  const next = () => go((cur + 1) % scenes.length);
  const auto = () => {
    clearInterval(timer);
    if (reduce) return;
    timer = setInterval(() => {
      if (!inView || document.hidden || Date.now() - userAt < 7000) return;
      next();
    }, 5200);
  };

  shutter.addEventListener("click", () => { userAt = Date.now(); go((cur + 1) % scenes.length, { capture: true }); });
  thumb.addEventListener("click", () => { if (prev !== null) { userAt = Date.now(); go(prev); } });

  // foco segue o mouse (desktop) ou o toque (celular)
  const toPct = e => {
    const r = vf.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100];
  };
  vf.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    const [x, y] = toPct(e); setFocus(x, y, false); userAt = Date.now();
  });
  vf.addEventListener("pointerleave", e => {
    if (e.pointerType !== "mouse") return;
    const [x, y] = pt(scenes[cur]); setFocus(x, y, true);
  });
  vf.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse" || e.target.closest("button")) return;
    const [x, y] = toPct(e); setFocus(x, y, true); pulse(); userAt = Date.now();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { threshold: 0.3 }).observe(vf);
  }

  const startHero = () => {
    const [x, y] = pt(scenes[0]);
    setFocus(x, y, false);
    requestAnimationFrame(() => {
      hero.classList.add("is-in");
      setTimeout(pulse, 1150);
      auto();
    });
  };
  if (reduce) { const [x, y] = pt(scenes[0]); setFocus(x, y, false); hero.classList.add("is-in"); }
  else if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]).then(startHero);
  } else startHero();


  /* ---------- MENU ---------- */
  const nav = $(".nav");
  const burger = $(".nav__burger");
  const mm = $("#menu-mobile");
  const setMenu = open => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    mm.hidden = !open;
    mm.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    nav.classList.toggle("is-menu", open);
    if (open) $("a", mm).focus({ preventScroll: true });
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", mm).forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !mm.hidden) { setMenu(false); burger.focus(); }
  });

  let lastY = 0;
  const fab = $(".fab");
  const contato = $("#contato");
  let contatoVisivel = false;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 30);
    nav.classList.toggle("is-hidden", y > 500 && y > lastY + 4 && mm.hidden);
    if (y < lastY - 4) nav.classList.remove("is-hidden");
    lastY = y;
    if (fab) {
      const on = y > window.innerHeight * 0.9 && !contatoVisivel;
      fab.hidden = false;
      fab.classList.toggle("is-on", on);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* link ativo no menu */
  const links = $$(".nav__links a");
  const secs = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.target === contato) contatoVisivel = en.isIntersecting;
      if (en.isIntersecting) {
        links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === `#${en.target.id}`));
      }
    });
    onScroll();
  }, { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach(s => io.observe(s));

  /* ---------- Revelação no scroll ---------- */
  const rvs = $$(".rv");
  if (reduce || !("IntersectionObserver" in window)) rvs.forEach(el => el.classList.add("in"));
  else {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const sibs = [...el.parentElement.children].filter(c => c.classList.contains("rv"));
        el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 6) * 0.07}s`;
        el.classList.add("in");
        ro.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rvs.forEach(el => ro.observe(el));
  }

  /* ---------- Manifesto: palavras acendem com o scroll ---------- */
  const mf = $("[data-words]");
  if (mf && !reduce) {
    const cap = $(".cap", mf);
    const rest = mf.innerHTML.replace(cap.outerHTML, "");
    const words = rest.trim().split(/\s+/);
    mf.innerHTML = `<span class="w">${cap.outerHTML}${words.shift()}</span> ` + words.map(w => `<span class="w">${w}</span>`).join(" ");
    const ws = $$(".w", mf);
    const upd = () => {
      const r = mf.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle("on", i < n));
    };
    window.addEventListener("scroll", upd, { passive: true });
    upd();
  }

  /* ---------- Contagem dos números ----------
     Começa só quando os cards estão de fato na tela (e depois do fade-in). */
  const counters = $$("[data-count]");
  if (!reduce) counters.forEach(c => (c.textContent = "0"));
  const run = (el, delay) => setTimeout(() => {
    const end = +el.dataset.count, dur = 1800, t0 = performance.now();
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, delay);
  const co = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      co.unobserve(en.target);
      const i = [...en.target.parentElement.children].indexOf(en.target);
      run($("[data-count]", en.target), 650 + i * 220);
    });
  }, { threshold: 1, rootMargin: "0px 0px -18% 0px" });
  if (!reduce) $$(".ncard").forEach(c => co.observe(c));

  /* ---------- "+" que expande (cases) ---------- */
  $$(".more__btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      const body = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(open));
      body.hidden = !open;
      body.classList.toggle("is-open", open);
    });
  });

  /* ---------- Vídeos que tocam mudos quando visíveis ---------- */
  const autos = $$("video.autoplay");
  if (!reduce) {
    const vo = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const v = en.target;
        if (en.isIntersecting) { v.preload = "auto"; v.play().catch(() => {}); }
        else v.pause();
      });
    }, { threshold: 0.35 });
    autos.forEach(v => vo.observe(v));
  }

  /* ---------- Modal (vídeo / imagem) ---------- */
  const modal = $("#modal");
  const mbody = $(".modal__body", modal);
  let lastFocus = null;
  const openModal = html => {
    lastFocus = document.activeElement;
    mbody.innerHTML = html;
    modal.hidden = false;
    document.body.classList.add("menu-open");
    $(".modal__close", modal).focus();
    const v = $("video", mbody);
    if (v) v.play().catch(() => {});
  };
  const closeModal = () => {
    const v = $("video", mbody);
    if (v) v.pause();
    modal.hidden = true;
    mbody.innerHTML = "";
    document.body.classList.remove("menu-open");
    if (lastFocus) lastFocus.focus();
  };
  document.addEventListener("click", e => {
    const vb = e.target.closest("[data-video]");
    if (vb) {
      e.preventDefault();
      openModal(`<video src="${vb.dataset.video}" poster="${vb.dataset.poster || ""}" controls playsinline autoplay></video>`);
      return;
    }
    const ib = e.target.closest("[data-lightbox]");
    if (ib) {
      e.preventDefault();
      openModal(`<img src="${ib.dataset.lightbox}" alt="${ib.dataset.alt || ""}">`);
    }
  });
  $(".modal__close", modal).addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") { // mantém o foco dentro do modal
      const f = $$("button, video, a", modal);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Polaroid: balanço também no toque */
  $$("[data-tilt]").forEach(p => {
    p.addEventListener("touchstart", () => {
      p.classList.remove("is-swing"); void p.offsetWidth; p.classList.add("is-swing");
      setTimeout(() => p.classList.remove("is-swing"), 1500);
    }, { passive: true });
  });

  /* ---------- Formulário → e-mail pronto ---------- */
  const form = $("#form");
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const setErr = (id, field, bad) => {
    $(`#${id}`).hidden = !bad;
    field.closest(".field").classList.toggle("is-err", bad);
    field.setAttribute("aria-invalid", String(bad));
    if (bad) field.setAttribute("aria-describedby", id); else field.removeAttribute("aria-describedby");
  };
  form.addEventListener("submit", e => {
    e.preventDefault();
    const nome = form.nome, email = form.email, msg = form.mensagem;
    const b1 = nome.value.trim().length < 2;
    const b2 = !emailOk(email.value.trim());
    const b3 = msg.value.trim().length < 5;
    setErr("e-nome", nome, b1); setErr("e-email", email, b2); setErr("e-msg", msg, b3);
    if (b1 || b2 || b3) { (b1 ? nome : b2 ? email : msg).focus(); return; }
    const interesses = $$('input[name="interesse"]:checked', form).map(i => i.value);
    const corpo = [
      `Olá, Laura!`, ``,
      msg.value.trim(), ``,
      `—`,
      `Nome: ${nome.value.trim()}`,
      `E-mail: ${email.value.trim()}`,
      form.marca.value.trim() ? `Marca/projeto: ${form.marca.value.trim()}` : null,
      interesses.length ? `Interesse: ${interesses.join(", ")}` : null,
    ].filter(l => l !== null).join("\n");
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(CONFIG.assunto)}&body=${encodeURIComponent(corpo)}`;
    $(".form__ok", form).hidden = false;
  });
  ["nome", "email", "mensagem"].forEach(n => form[n].addEventListener("input", () => {
    const f = form[n];
    if (f.closest(".field").classList.contains("is-err")) {
      const ok = n === "email" ? emailOk(f.value.trim()) : f.value.trim().length >= (n === "nome" ? 2 : 5);
      if (ok) setErr(n === "nome" ? "e-nome" : n === "email" ? "e-email" : "e-msg", f, false);
    }
  }));
})();
