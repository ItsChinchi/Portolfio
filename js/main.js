/* ==========================================================================
   Portfolio UI
   ========================================================================== */
(() => {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /** Tiny DOM helper: el("a", { class: "x", href: "…" }, child, "text") */
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else node.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children.flat()) {
      if (child == null) continue;
      node.append(child.nodeType ? child : document.createTextNode(child));
    }
    return node;
  }
  const SVG_NS = "http://www.w3.org/2000/svg";
  /** Icon from the inline SVG sprite in index.html (e.g. icon("github")). */
  function icon(name) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "ico");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", `#i-${name}`);
    svg.append(use);
    return svg;
  }

  /* ---------- Scroll reveal ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.08 }
  );
  const observeReveals = (root = document) =>
    $$(".reveal:not(.visible)", root).forEach((node) => revealObserver.observe(node));

  /* ---------- Projects ---------- */
  const projectsEl = $("#projects");
  const filtersEl  = $("#filters");
  const engines    = window.ENGINES || {};
  const projects   = window.PROJECTS || [];
  const moreBtn    = $("#moreBtn");
  const INITIAL_VISIBLE = 2;   // how many projects show before "View more"
  let activeFilter = "all";
  let expanded = false;

  function buildImage(project, engine) {
    const wrap = el("div", { class: "pimg" });
    if (project.image) {
      wrap.append(
        el("img", {
          src: project.image,
          alt: project.imageAlt || project.title,
          loading: "lazy",
          decoding: "async",
          width: 1280,
          height: 720,
        })
      );
    } else {
      wrap.append(el("div", { class: `pph ${engine.accent}-bg`, "aria-hidden": "true" }, project.title));
    }
    return wrap;
  }

  function buildInfo(project, engine) {
    const links = (project.links || []).map((link) =>
      el(
        "a",
        {
          class: `plink${link.variant ? " " + link.variant : ""}`,
          href: link.href,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        icon(link.icon),
        link.label
      )
    );

    return el(
      "div",
      { class: "pinfo" },
      el("span", { class: `p-engine ${engine.accent}` }, icon(project.engineIcon || engine.icon), project.engineNote || engine.label),
      el("h3", {}, project.title),
      el("p", {}, project.description),
      el("div", { class: "ptags" }, (project.tags || []).map((tag) => el("span", { class: "ptag" }, tag))),
      el("div", { class: "plinks" }, links)
    );
  }

  function buildRow(project, index) {
    const engine = engines[project.engine] || { label: "", icon: "gamepad", accent: "unity" };
    const reversed = index % 2 === 1;
    const image = buildImage(project, engine);
    const info = buildInfo(project, engine);
    return el(
      "article",
      { class: `prow reveal${reversed ? " rev" : ""}` },
      reversed ? [info, image] : [image, info]
    );
  }

  function buildUpcoming() {
    const upcoming = window.UPCOMING;
    if (!upcoming) return null;
    return el(
      "div",
      { class: "p-wip reveal" },
      el("div", { class: "wip-label" }, "In Development"),
      el("h3", {}, upcoming.title),
      el("p", {}, upcoming.description)
    );
  }

  function renderProjects() {
    const matching = projects.filter((p) => activeFilter === "all" || p.engine === activeFilter);
    const collapsible = matching.length > INITIAL_VISIBLE;
    const shown = collapsible && !expanded ? matching.slice(0, INITIAL_VISIBLE) : matching;

    projectsEl.replaceChildren(...shown.map(buildRow));

    // "In development" card: an Unreal project, so only where it fits, and only once the list is fully open.
    const fullyOpen = !collapsible || expanded;
    if (fullyOpen && (activeFilter === "all" || activeFilter === "ue")) {
      const wip = buildUpcoming();
      if (wip) projectsEl.append(wip);
    }

    moreBtn.hidden = !collapsible;
    moreBtn.setAttribute("aria-expanded", String(expanded));
    moreBtn.textContent = expanded ? "Show fewer projects" : `View more projects (${matching.length - INITIAL_VISIBLE})`;
    observeReveals(projectsEl);
  }

  moreBtn.addEventListener("click", () => {
    expanded = !expanded;
    renderProjects();
    // Collapsing a long list leaves you far below the section heading — bring it back into view.
    if (!expanded) $("#portfolio").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function renderFilters() {
    const used = [...new Set(projects.map((p) => p.engine))].filter((key) => engines[key]);
    if (used.length < 2) { filtersEl.hidden = true; return; }

    const options = [["all", "All"], ...used.map((key) => [key, engines[key].label])];
    filtersEl.replaceChildren(
      ...options.map(([key, label]) =>
        el("button", { type: "button", class: "filter", "data-filter": key, "aria-pressed": String(key === activeFilter) }, label)
      )
    );
    filtersEl.addEventListener("click", (event) => {
      const btn = event.target.closest(".filter");
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      expanded = false;
      $$(".filter", filtersEl).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      renderProjects();
    });
  }

  renderFilters();
  renderProjects();

  /* ---------- Skill bars ---------- */
  const barObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        $$(".bar-fill", entry.target).forEach((bar) => (bar.style.width = `${bar.dataset.w}%`));
        barObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.3 }
  );
  $$("#skills .skills-cols > div").forEach((col) => barObserver.observe(col));

  observeReveals();

  /* ---------- Mobile nav ---------- */
  const ham = $("#ham");
  const mobNav = $("#mobNav");

  function setMenu(open) {
    ham.classList.toggle("open", open);
    mobNav.classList.toggle("open", open);
    ham.setAttribute("aria-expanded", String(open));
    ham.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  ham.addEventListener("click", () => setMenu(!mobNav.classList.contains("open")));
  $$("a", mobNav).forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => e.matches && setMenu(false));

  /* ---------- Active nav link ---------- */
  const navLinks = $$(".nav-links a");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main > section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------- Scroll to top ---------- */
  const scrollUp = $("#scrollUp");
  window.addEventListener("scroll", () => scrollUp.classList.toggle("show", window.scrollY > 400), { passive: true });
  scrollUp.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Contact form (Formspree, no page redirect) ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  const submitBtn = $("button[type=submit]", form);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "form-status";
    status.textContent = "Sending…";
    submitBtn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      status.classList.add("ok");
      status.textContent = "Thanks — your message was sent. I'll get back to you soon.";
    } catch (error) {
      status.classList.add("err");
      status.textContent = "Something went wrong. Please try again or email me directly.";
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
