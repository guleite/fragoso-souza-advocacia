/* =========================================================
   FRAGOSO SOUZA ADVOCACIA — scripts
   - abertura, header, menu, animações de rolagem
   - áreas de atuação, método, perguntas frequentes
   - formulário qualificador (todo contato passa por ele)
   ========================================================= */

// WhatsApp do escritório: formato internacional, só dígitos (trocar antes de publicar)
const FSA_WHATSAPP = "5561000000000";
// Endereço opcional para receber o lead (CRM, planilha, e-mail). Vazio = não envia.
const FSA_LEAD_ENDPOINT = "";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- Abertura ---------- */
(function intro() {
  const body = document.body;
  let seen = false;
  try { seen = sessionStorage.getItem("fsa_intro") === "1"; } catch (e) {}
  if (seen || reduced) {
    body.classList.add("skip-intro");
    setTimeout(() => body.classList.add("is-ready"), 30);
    return;
  }
  try { sessionStorage.setItem("fsa_intro", "1"); } catch (e) {}
  body.classList.add("lock");
  const go = () => { body.classList.add("is-ready"); body.classList.remove("lock"); };
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(() => setTimeout(go, 1500));
})();

/* ---------- Header + menu ---------- */
(function header() {
  const h = $(".site-header");
  const toggle = $(".nav-toggle");
  const nav = $(".nav");
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    h.classList.toggle("is-solid", y > 40);
    const menuOpen = nav.classList.contains("is-open");
    h.classList.toggle("is-hidden", !menuOpen && y > 500 && y > lastY + 2);
    if (y < lastY - 2) h.classList.remove("is-hidden");
    lastY = y;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("lock", open);
    h.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // link ativo conforme a seção visível
  const links = $$('.nav a[href^="#"]').filter((a) => a.getAttribute("href").length > 1);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((a) => { const s = $(a.getAttribute("href")); if (s) io.observe(s); });

  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* ---------- Revelação ao rolar ---------- */
(function reveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));
})();

/* ---------- Manifesto: palavras acendem conforme a leitura ---------- */
const manifesto = (function () {
  const q = $("[data-words]");
  if (!q) return null;
  const words = q.textContent.trim().split(/\s+/);
  const accent = ["escolha", "consciente"];
  q.innerHTML = words.map((w) => {
    const clean = w.replace(/[^\wÀ-ú]/g, "").toLowerCase();
    return `<span class="w${accent.includes(clean) ? " hl" : ""}">${w}</span>`;
  }).join(" ");
  const spans = $$(".w", q);
  return function update(vh) {
    const r = q.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (vh * 0.85 - vh * 0.3 + r.height * 0.5));
    const n = Math.round(p * spans.length);
    spans.forEach((s, i) => s.classList.toggle("on", i < n));
  };
})();

/* ---------- Efeitos ligados à rolagem (um único loop) ---------- */
(function scrollFx() {
  const parallax = $$("[data-parallax]");
  const drift = $$("[data-drift]");
  const method = $(".method__track");
  const steps = method ? $$(".method__steps li", method) : [];
  const fab = $(".fab");
  const hero = $(".hero");
  const contact = $("#contato");
  let ticking = false;

  if (reduced && manifesto) $$("[data-words] .w").forEach((s) => s.classList.add("on"));

  function frame() {
    ticking = false;
    const vh = window.innerHeight;

    if (!reduced) {
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        const off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
        el.style.translate = `0 ${off.toFixed(1)}px`;
      });
      drift.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        const p = (vh - r.top) / (vh + r.height);
        el.style.transform = `translate3d(${(p * 22 * parseFloat(el.dataset.drift)).toFixed(2)}vw,0,0)`;
      });
      if (manifesto) manifesto(vh);
    }

    if (method) {
      const r = method.getBoundingClientRect();
      const vertical = window.innerWidth <= 960;
      const p = vertical ? clamp((vh * 0.7 - r.top) / r.height) : clamp((vh * 0.82 - r.top) / (vh * 0.45));
      method.style.setProperty("--p", reduced ? 1 : p.toFixed(3));
      steps.forEach((li, i) => {
        const at = vertical ? (li.offsetTop + 10) / r.height : i / steps.length + 0.02;
        li.classList.toggle("is-lit", p >= at || reduced);
      });
    }

    if (fab) {
      const pastHero = hero.getBoundingClientRect().bottom < vh * 0.4;
      const cr = contact.getBoundingClientRect();
      const inContact = cr.top < vh * 0.8 && cr.bottom > 0;
      fab.classList.toggle("is-visible", pastHero && !inContact && !document.body.classList.contains("q-open"));
    }
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", req);
  frame();
})();

/* ---------- Brilho que segue o cursor + botões magnéticos ---------- */
(function pointerFx() {
  if (!finePointer || reduced) return;
  $$("[data-glow]").forEach((sec) => {
    sec.addEventListener("pointermove", (e) => {
      const r = sec.getBoundingClientRect();
      sec.style.setProperty("--mx", `${e.clientX - r.left}px`);
      sec.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
  $$(".magnetic").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      b.style.transform = `translate(${x}px, ${y}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });
})();

/* ---------- Áreas de atuação ---------- */
(function areas() {
  const root = $(".areas");
  if (!root) return;
  const items = $$(".area", root);
  const marker = $(".areas__marker", root);
  const isMobile = () => window.innerWidth <= 960;

  const placeMarker = () => {
    const active = $(".area.is-active .area__tab", root);
    if (!active || isMobile()) return;
    marker.style.transform = `translateY(${active.offsetTop}px)`;
    marker.style.height = `${active.offsetHeight}px`;
  };

  const activate = (item, allowToggle) => {
    const wasActive = item.classList.contains("is-active");
    if (wasActive && allowToggle) { item.classList.remove("is-active"); $(".area__tab", item).setAttribute("aria-expanded", "false"); return; }
    items.forEach((i) => { i.classList.toggle("is-active", i === item); $(".area__tab", i).setAttribute("aria-expanded", i === item); });
    placeMarker();
  };

  items.forEach((item) => {
    const tab = $(".area__tab", item);
    tab.addEventListener("click", () => activate(item, isMobile()));
    if (finePointer) {
      let t;
      tab.addEventListener("mouseenter", () => { if (!isMobile()) t = setTimeout(() => activate(item, false), 140); });
      tab.addEventListener("mouseleave", () => clearTimeout(t));
    }
  });
  window.addEventListener("resize", placeMarker);
  document.fonts && document.fonts.ready.then(placeMarker);
  placeMarker();
})();

/* ---------- Perguntas frequentes (abertura suave) ---------- */
(function faq() {
  $$(".qa").forEach((d) => {
    const sum = $("summary", d);
    const body = $(".qa__body", d);
    sum.addEventListener("click", (e) => {
      if (reduced) return;
      e.preventDefault();
      if (d.open) {
        const h = body.offsetHeight;
        d.classList.add("closing");
        body.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 450, easing: "cubic-bezier(.2,.7,.1,1)" })
          .onfinish = () => { d.open = false; d.classList.remove("closing"); };
      } else {
        $$(".qa[open]").forEach((o) => { if (o !== d) $("summary", o).click(); });
        d.open = true;
        const h = body.offsetHeight;
        body.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 550, easing: "cubic-bezier(.2,.7,.1,1)" });
      }
    });
  });
})();

/* =========================================================
   Formulário qualificador
   ========================================================= */
const Qualify = (function () {
  const NOTES = {
    area: {
      "Direito Administrativo": "Questões administrativas costumam ter prazos curtos e ritos próprios. Se puder, reúna portarias, notificações e decisões que recebeu.",
      "Direito Civil": "Contratos, comprovantes e conversas por escrito ajudam a reconstruir os fatos com precisão.",
      "Direito do Trabalho": "Na esfera trabalhista, a ação deve ser proposta em até dois anos após o fim do contrato. Vale não deixar para depois.",
      "Assessoria jurídica contínua": "Ter um advogado de referência permite revisar decisões antes que se tornem conflitos.",
      "Não sei identificar": "Sem problema. Identificar a área correta faz parte da nossa análise.",
    },
    momento: {
      "Recebi notificação, intimação ou citação": "Guarde o documento e anote a data em que foi recebido — é ela que costuma definir a contagem dos prazos.",
      "Já existe um processo em andamento": "Se tiver o número do processo, ele agiliza a análise. Pode informá-lo na próxima etapa.",
    },
  };

  const steps = [
    { id: "nome", type: "text", kicker: "Apresentação", title: "Para começar, como podemos chamar você?", hint: "São 7 perguntas objetivas — leva cerca de dois minutos.", placeholder: "Seu nome" },
    { id: "perfil", type: "single", kicker: "Perfil", title: "{nome}, para quem é o atendimento?", hint: "Isso orienta quem vai analisar a sua solicitação.",
      options: ["Para mim, como pessoa física", "Para minha empresa", "Sou servidor(a) público(a)", "Sou advogado(a) e preciso de apoio em Brasília"] },
    { id: "area", type: "single", kicker: "Área", title: "Em qual área o assunto se encaixa melhor?", hint: "Escolha a mais próxima — ajustamos depois, se for o caso.",
      options: Object.keys(NOTES.area) },
    { id: "momento", type: "single", kicker: "Momento", title: "Em que momento está a situação?", hint: "Cada fase pede um tipo de atuação diferente.",
      options: ["Quero me orientar antes de decidir", "Há um conflito, mas ainda sem processo", "Recebi notificação, intimação ou citação", "Já existe um processo em andamento"] },
    { id: "prazo", type: "single", layout: "two", kicker: "Urgência", title: "Existe algum prazo correndo?", hint: "Se houver, a sua solicitação é analisada com prioridade.",
      options: ["Sim, nos próximos dias", "Sim, nas próximas semanas", "Não há prazo definido", "Não sei informar"] },
    { id: "relato", type: "textarea", kicker: "Contexto", title: "Em poucas linhas, o que aconteceu?", hint: "Opcional. Evite dados sensíveis — os detalhes são tratados no atendimento, sob sigilo.", placeholder: "Resumo da situação" },
    { id: "contato", type: "contact", kicker: "Retorno", title: "Por onde retornamos, {nome}?", hint: "Usamos esses dados apenas para responder à sua solicitação." },
  ];

  let modal, cur = 0, data = {}, context = {}, skip = new Set(), lastFocus = null;
  const pad = (n) => String(n).padStart(2, "0");

  function build() {
    document.body.insertAdjacentHTML("beforeend", `
    <div class="qm" role="dialog" aria-modal="true" aria-labelledby="qm-title" aria-hidden="true">
      <div class="qm__backdrop" data-qclose></div>
      <div class="qm__card">
        <div class="qm__top grain">
          <div class="qm__brand">
            <img src="assets/img/mono-ivory.png" alt="">
            <div><b id="qm-title">Solicitação de atendimento</b><small>Fragoso Souza Advocacia</small></div>
          </div>
          <button class="qm__close" data-qclose aria-label="Fechar"></button>
          <div class="qm__progress"><div class="qm__bar"><i></i></div><span class="qm__count"></span></div>
        </div>
        <form class="qm__body" novalidate autocomplete="on">
          ${steps.map(renderStep).join("")}
          <div class="qstep qdone" data-step="done">
            <div class="qdone__seal"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0C2041" stroke-width="1.3" style="transform:rotate(-45deg)"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
            <span class="kicker kicker--ink">Solicitação registrada</span>
            <h3 class="qdone__title"></h3>
            <p class="hint qdone__msg"></p>
            <dl class="qsummary"></dl>
            <div class="qdone__actions">
              <a class="btn btn--navy qwa" href="#" target="_blank" rel="noopener">Continuar pelo WhatsApp <span class="btn__arrow"></span></a>
              <button type="button" class="link-line" data-qclose>Voltar ao site</button>
            </div>
            <p class="qfine">A conversa já abre com o resumo acima — você não precisa repetir a história.</p>
          </div>
          <button type="submit" hidden></button>
        </form>
        <div class="qm__nav">
          <button type="button" class="qback"><span class="btn__arrow"></span> Voltar</button>
          <span class="qkeys">Use <kbd>A</kbd>–<kbd>D</kbd> e <kbd>Enter</kbd></span>
          <button type="button" class="btn btn--navy qnext">Continuar <span class="btn__arrow"></span></button>
        </div>
      </div>
    </div>`);
    modal = $(".qm");

    $$("[data-qclose]", modal).forEach((b) => b.addEventListener("click", close));
    $("form", modal).addEventListener("submit", (e) => { e.preventDefault(); next(); });
    $(".qnext", modal).addEventListener("click", next);
    $(".qback", modal).addEventListener("click", back);
    $$(".qstep .opt", modal).forEach((b) => b.addEventListener("click", () => pick(b)));
    $$(".qchip", modal).forEach((b) => b.addEventListener("click", () => {
      $$(".qchip", modal).forEach((c) => c.classList.toggle("is-selected", c === b));
      data.canal = b.dataset.v;
    }));
    $$("input, textarea", modal).forEach((inp) => inp.addEventListener("input", () => {
      inp.closest(".qfield, .qconsent")?.classList.remove("has-error");
      if (inp.name === "whats") inp.value = maskPhone(inp.value);
      if (inp.name === "relato") $(".qcount", modal).textContent = `${inp.value.length}/500`;
      syncNext();
    }));
    $$('input[type="checkbox"]', modal).forEach((c) => c.addEventListener("change", syncNext));

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") return close();
      if (e.key === "Tab") return trapFocus(e);
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (typing || cur === "done") return;
      const k = e.key.toUpperCase();
      if (k.length === 1 && k >= "A" && k <= "F") {
        const opt = $$(".opt", stepEl(cur))[k.charCodeAt(0) - 65];
        if (opt) { e.preventDefault(); opt.click(); }
      } else if (e.key === "Enter") { e.preventDefault(); next(); }
    });
  }

  function renderStep(s, i) {
    let body = "";
    if (s.type === "text") {
      body = `<div class="qfield big"><input id="q-${s.id}" name="${s.id}" placeholder=" " autocomplete="name" maxlength="80"><label for="q-${s.id}">${s.placeholder}</label></div><p class="qerr"></p>`;
    } else if (s.type === "textarea") {
      body = `<div class="qfield"><textarea id="q-${s.id}" name="${s.id}" placeholder=" " maxlength="500"></textarea><label for="q-${s.id}">${s.placeholder}</label><span class="qcount">0/500</span></div>`;
    } else if (s.type === "contact") {
      body = `
        <div class="qrow">
          <div class="qfield"><input id="q-whats" name="whats" type="tel" inputmode="tel" placeholder=" " autocomplete="tel"><label for="q-whats">WhatsApp com DDD</label></div>
          <div class="qfield"><input id="q-email" name="email" type="email" placeholder=" " autocomplete="email"><label for="q-email">E-mail</label></div>
        </div>
        <div class="qfield"><input id="q-cidade" name="cidade" placeholder=" " autocomplete="address-level2"><label for="q-cidade">Cidade / UF (opcional)</label></div>
        <p class="qlabel">Prefere o retorno por</p>
        <div class="qchips">
          <button type="button" class="qchip is-selected" data-v="WhatsApp">WhatsApp</button>
          <button type="button" class="qchip" data-v="Ligação">Ligação</button>
          <button type="button" class="qchip" data-v="E-mail">E-mail</button>
        </div>
        <label class="qconsent"><input type="checkbox" name="consent"><span>Autorizo o uso destes dados para retorno sobre a minha solicitação, conforme a <a href="privacidade.html" target="_blank" rel="noopener">política de privacidade</a>.</span></label>
        <p class="qerr"></p>`;
    } else {
      body = `<div class="qopts${s.layout === "two" ? " two" : ""}">${s.options.map((v, j) => `
        <button type="button" class="opt" data-v="${v}"><span class="opt__k">${String.fromCharCode(65 + j)}</span><span>${v}</span></button>`).join("")}</div>
        <div class="qnote"><b>Observação</b><span class="qnote__txt"></span></div>`;
    }
    return `<div class="qstep" data-step="${i}">
      <span class="kicker kicker--ink">${s.kicker}</span>
      <h3 data-title="${s.title}">${s.title}</h3>
      <p class="hint">${s.hint}</p>
      ${body}
    </div>`;
  }

  const stepEl = (i) => $(`.qstep[data-step="${i}"]`, modal);
  const firstName = () => (data.nome || "").trim().split(/\s+/)[0] || "";

  function show(i, dir = 1) {
    $$(".qstep", modal).forEach((el) => el.classList.remove("is-active", "back"));
    const done = i === "done";
    const el = done ? $('.qstep[data-step="done"]', modal) : stepEl(i);
    el.classList.add("is-active");
    if (dir < 0) el.classList.add("back");

    $(".qm__bar i", modal).style.width = (done ? 100 : ((i + 0.35) / steps.length) * 100) + "%";
    $(".qm__count", modal).innerHTML = done ? "<b>Concluído</b>" : `<b>${pad(i + 1)}</b> / ${pad(steps.length)}`;
    $(".qm__nav", modal).style.display = done ? "none" : "";
    $(".qback", modal).hidden = done || i === 0;
    const keys = $(".qkeys", modal);
    const isChoice = !done && steps[i].type === "single";
    keys.style.visibility = isChoice ? "" : "hidden";
    if (isChoice) keys.innerHTML = `Use <kbd>A</kbd>–<kbd>${String.fromCharCode(64 + steps[i].options.length)}</kbd> e <kbd>Enter</kbd>`;

    if (!done) {
      const h = $("h3", el);
      const name = firstName();
      h.textContent = name ? h.dataset.title.replace("{nome}", name) : h.dataset.title.replace("{nome}, p", "P").replace(", {nome}", "");
      const last = i === steps.length - 1;
      $(".qnext", modal).innerHTML = (last ? "Enviar solicitação " : steps[i].type === "textarea" && !$("textarea", el).value.trim() ? "Pular " : "Continuar ") + '<span class="btn__arrow"></span>';
      syncNext();
      const inp = $("input:not([type=checkbox]), textarea", el);
      if (inp && finePointer) setTimeout(() => inp.focus({ preventScroll: true }), 320);
      else setTimeout(() => $(".qnext", modal).focus({ preventScroll: true }), 50);
    } else {
      setTimeout(() => $(".qwa", modal).focus({ preventScroll: true }), 50);
    }
    $(".qm__body", modal).scrollTop = 0;
  }

  function pick(btn) {
    const node = btn.closest(".qstep");
    const s = steps[+node.dataset.step];
    $$(".opt", node).forEach((b) => b.classList.toggle("is-selected", b === btn));
    data[s.id] = btn.dataset.v;
    skip.delete(s.id);
    syncNext();

    const note = NOTES[s.id] && NOTES[s.id][btn.dataset.v];
    const box = $(".qnote", node);
    if (note) {
      $(".qnote__txt", box).textContent = note;
      box.classList.remove("show"); void box.offsetWidth; box.classList.add("show");
      return; // deixa a pessoa ler a observação antes de seguir
    }
    box.classList.remove("show");
    setTimeout(() => { if (cur === +node.dataset.step) next(); }, 420);
  }

  function syncNext() {
    if (cur === "done") return;
    const s = steps[cur], el = stepEl(cur);
    let ok = true;
    if (s.type === "text") ok = $("input", el).value.trim().length >= 2;
    else if (s.type === "single") ok = !!data[s.id];
    $(".qnext", modal).disabled = !ok;
    if (s.type === "textarea") {
      $(".qnext", modal).innerHTML = ($("textarea", el).value.trim() ? "Continuar " : "Pular ") + '<span class="btn__arrow"></span>';
    }
  }

  function validate() {
    const s = steps[cur], el = stepEl(cur);
    const err = $(".qerr", el);
    if (s.type === "text") {
      const v = $("input", el).value.trim();
      if (v.length < 2) { err.textContent = "Informe como podemos chamar você."; return false; }
      data.nome = v;
    }
    if (s.type === "single" && !data[s.id]) return false;
    if (s.type === "textarea") data.relato = $("textarea", el).value.trim();
    if (s.type === "contact") {
      const wa = $('[name="whats"]', el), em = $('[name="email"]', el), cons = $('[name="consent"]', el);
      const digits = wa.value.replace(/\D/g, "");
      let msg = "";
      [wa, em].forEach((i) => i.closest(".qfield").classList.remove("has-error"));
      cons.closest(".qconsent").classList.remove("has-error");
      if (digits.length < 10) { wa.closest(".qfield").classList.add("has-error"); msg = "Confira o WhatsApp: informe DDD e número."; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())) { em.closest(".qfield").classList.add("has-error"); msg = "Confira o e-mail informado."; }
      else if (!cons.checked) { cons.closest(".qconsent").classList.add("has-error"); msg = "É preciso autorizar o uso dos dados para que possamos retornar."; }
      err.textContent = msg;
      if (msg) return false;
      data.whats = wa.value.trim(); data.email = em.value.trim();
      data.cidade = $('[name="cidade"]', el).value.trim();
      data.canal = data.canal || "WhatsApp";
    }
    if (err) err.textContent = "";
    return true;
  }

  function next() {
    if (cur === "done" || !validate()) return;
    let n = cur + 1;
    while (n < steps.length && skip.has(steps[n].id) && data[steps[n].id]) n++;
    if (n < steps.length) { cur = n; show(cur); } else finish();
  }

  function back() {
    if (cur === "done" || cur === 0) return;
    cur--; show(cur, -1);
  }

  function priority() {
    let s = 0;
    s += { "Para minha empresa": 25, "Sou servidor(a) público(a)": 20, "Para mim, como pessoa física": 15, "Sou advogado(a) e preciso de apoio em Brasília": 15 }[data.perfil] || 0;
    s += { "Recebi notificação, intimação ou citação": 30, "Já existe um processo em andamento": 25, "Há um conflito, mas ainda sem processo": 20, "Quero me orientar antes de decidir": 10 }[data.momento] || 0;
    s += { "Sim, nos próximos dias": 35, "Sim, nas próximas semanas": 25, "Não sei informar": 15, "Não há prazo definido": 5 }[data.prazo] || 0;
    if ((data.relato || "").length > 40) s += 5;
    return s >= 70 ? "alta" : s >= 45 ? "média" : "normal";
  }

  function finish() {
    cur = "done";
    const nome = firstName();
    const urgent = data.prazo === "Sim, nos próximos dias";
    $(".qdone__title", modal).textContent = `Obrigado, ${nome}. Recebemos a sua solicitação.`;
    $(".qdone__msg", modal).textContent = urgent
      ? "Como há prazo nos próximos dias, a sua solicitação foi sinalizada como prioritária. Para agilizar, continue a conversa agora pelo WhatsApp."
      : data.canal === "WhatsApp"
        ? "O escritório vai analisar o contexto e retornar pelo WhatsApp. Se preferir, já pode iniciar a conversa agora."
        : `O escritório vai analisar o contexto e retornar por ${data.canal === "E-mail" ? "e-mail" : "ligação"}, como você preferiu. Se quiser agilizar, também pode chamar no WhatsApp.`;

    const rows = [["Perfil", data.perfil], ["Área", data.area], ["Momento", data.momento], ["Prazo", data.prazo], ["Retorno por", data.canal]];
    $(".qsummary", modal).innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v || "—"}</dd></div>`).join("");

    const text = [
      `Olá, sou ${data.nome}. Preenchi a triagem no site da Fragoso Souza Advocacia.`,
      "",
      `• Perfil: ${data.perfil}`,
      `• Área: ${data.area}`,
      `• Momento: ${data.momento}`,
      `• Prazo: ${data.prazo}`,
      data.relato ? `• Resumo: ${data.relato}` : null,
      data.cidade ? `• Cidade: ${data.cidade}` : null,
      `• E-mail: ${data.email}`,
      "",
      "Gostaria de agendar o atendimento inicial.",
    ].filter((l) => l !== null).join("\n");
    $(".qwa", modal).href = `https://wa.me/${FSA_WHATSAPP}?text=${encodeURIComponent(text)}`;

    const lead = { ...data, origem: context.origem || "site", prioridade: priority(), pagina: location.pathname, criadoEm: new Date().toISOString() };
    try { localStorage.setItem("fsa_last_lead", JSON.stringify(lead)); } catch (e) {}
    console.info("[Fragoso Souza] Solicitação qualificada:", lead);
    if (FSA_LEAD_ENDPOINT) {
      fetch(FSA_LEAD_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) }).catch(() => {});
    }
    show("done");
  }

  function maskPhone(v) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  }

  function trapFocus(e) {
    const f = $$('button:not([disabled]), a[href], input, textarea', $(".qm__card", modal)).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function reset() {
    cur = 0;
    const keep = { nome: data.nome };
    data = keep.nome ? keep : {};
    skip = new Set();
    $$(".opt.is-selected", modal).forEach((b) => b.classList.remove("is-selected"));
    $$(".qnote", modal).forEach((b) => b.classList.remove("show"));
  }

  function open(ctx = {}) {
    lastFocus = document.activeElement;
    if (cur === "done") reset();
    context = ctx;
    if (ctx.preset) {
      Object.entries(ctx.preset).forEach(([k, v]) => {
        const s = steps.find((x) => x.id === k);
        if (!s) return;
        data[k] = v;
        skip.add(k);
        $$(".opt", stepEl(steps.indexOf(s))).forEach((b) => b.classList.toggle("is-selected", b.dataset.v === v));
      });
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock", "q-open");
    window.dispatchEvent(new Event("scroll"));
    show(cur);
  }

  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lock", "q-open");
    window.dispatchEvent(new Event("scroll"));
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  return { build, open };
})();

/* ---------- Todo contato abre o formulário (nunca um link direto) ---------- */
(function contact() {
  Qualify.build();
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-contact]");
    if (!t) return;
    e.preventDefault();
    let preset;
    try { preset = t.dataset.preset ? JSON.parse(t.dataset.preset) : undefined; } catch (err) {}
    Qualify.open({ origem: t.dataset.contact || "site", preset });
  });
})();
