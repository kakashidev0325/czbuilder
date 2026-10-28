const CONFIG = {
  tokenAddress: "0x5afe09fe1ab928cb88338ec361dc535556ea7777",
  dexScreenerPair: "",
  pancakeSwapUrl: "",
  twitter: "https://x.com/cz_binance/status/2102688111813628308",
};

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function isCaLive() {
  const ca = (CONFIG.tokenAddress || "").trim();
  return /^0x[a-fA-F0-9]{40}$/.test(ca);
}

function getChartId() {
  return CONFIG.dexScreenerPair || CONFIG.tokenAddress;
}

function getBuyUrl() {
  if (CONFIG.pancakeSwapUrl) return CONFIG.pancakeSwapUrl;
  if (isCaLive()) {
    return `https://flap.sh/bnb/${CONFIG.tokenAddress}`;
  }
  return "https://flap.sh";
}

function buildDexScreenerEmbedUrl(id) {
  const params = new URLSearchParams({
    embed: "1",
    loadChartSettings: "0",
    trades: "0",
    tabs: "0",
    info: "0",
    chartLeftToolbar: "0",
    chartDefaultOnMobile: "1",
    chartTheme: "dark",
    chartStyle: "1",
    chartType: "usd",
    interval: "15",
  });
  return `https://dexscreener.com/bsc/${id}?${params.toString()}`;
}

function initLoader() {
  const boot = () => {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  };

  if (reduceMotion()) {
    boot();
    return;
  }

  const done = () => window.setTimeout(boot, 520);
  if (document.readyState === "complete") done();
  else window.addEventListener("load", done, { once: true });
  window.setTimeout(boot, 2200);
}

function initContract() {
  const display = document.getElementById("ca-display");
  const copyBtn = document.getElementById("copy-ca");
  const toast = document.getElementById("copy-toast");
  if (!display || !copyBtn) return;

  const address = (CONFIG.tokenAddress || "TBA").trim();
  display.textContent = address;
  display.classList.toggle("is-tba", !isCaLive());

  if (!isCaLive()) {
    copyBtn.disabled = true;
    return;
  }

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(address);
      copyBtn.classList.add("copied");
      copyBtn.querySelector("span").textContent = "Copied!";
      if (toast) {
        toast.textContent = "Contract address copied!";
        toast.classList.add("show");
      }
      const rect = copyBtn.getBoundingClientRect();
      burstSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.querySelector("span").textContent = "Copy";
        toast?.classList.remove("show");
      }, 2500);
    } catch {
      if (toast) {
        toast.textContent = "Copy failed — select and copy manually.";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2500);
      }
    }
  });
}

function initChart() {
  const iframe = document.getElementById("dexscreener-embed");
  const link = document.getElementById("dexscreener-link");
  const placeholder = document.getElementById("chart-tba");
  const wrapper = document.getElementById("chart-wrapper");
  const ecoDex = document.getElementById("eco-dex");
  const ecoScan = document.getElementById("eco-scan");

  if (isCaLive()) {
    if (ecoScan) ecoScan.href = `https://bscscan.com/token/${CONFIG.tokenAddress}`;
    if (ecoDex) ecoDex.href = `https://dexscreener.com/bsc/${getChartId()}`;
  }

  if (!iframe || !link) return;

  if (!isCaLive()) {
    iframe.hidden = true;
    iframe.removeAttribute("src");
    if (placeholder) placeholder.hidden = false;
    if (wrapper) wrapper.classList.add("is-tba");
    link.href = "#contract";
    link.removeAttribute("target");
    link.removeAttribute("rel");
    link.textContent = "CA TBA — check back soon";
    return;
  }

  if (placeholder) placeholder.hidden = true;
  iframe.hidden = false;
  if (wrapper) wrapper.classList.remove("is-tba");
  const chartId = getChartId();
  iframe.src = buildDexScreenerEmbedUrl(chartId);
  link.href = `https://dexscreener.com/bsc/${chartId}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Open full chart on DexScreener →";
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  const header = document.getElementById("site-header");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initSocialLinks() {
  const buyUrl = getBuyUrl();

  document.querySelectorAll("[data-buy]").forEach((el) => {
    if (el.getAttribute("href") === "#buy" && !isCaLive()) {
      el.removeAttribute("target");
      el.removeAttribute("rel");
      return;
    }
    el.href = buyUrl;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  document.querySelectorAll("[data-twitter]").forEach((el) => {
    if (!CONFIG.twitter) return;
    el.href = CONFIG.twitter;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });
}

function initLightbox() {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  const cap = document.getElementById("lightbox-cap");
  const closeBtn = box?.querySelector(".lightbox-close");
  if (!box || !img) return;

  const close = () => {
    box.hidden = true;
    img.removeAttribute("src");
    document.body.style.overflow = "";
  };

  document.querySelectorAll("[data-lightbox]").forEach((card) => {
    card.addEventListener("click", () => {
      const photo = card.querySelector("img");
      if (!photo) return;
      img.src = photo.src;
      img.alt = photo.alt || "";
      cap.textContent = card.querySelector("figcaption")?.textContent || "";
      box.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  closeBtn?.addEventListener("click", close);
  box.addEventListener("click", (event) => {
    if (event.target === box) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !box.hidden) close();
  });
}

function initReveals() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;

  if (!("IntersectionObserver" in window) || reduceMotion()) {
    nodes.forEach((el) => el.classList.add("in"));
    document.querySelector(".lineage-track")?.classList.add("in-view");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        if (entry.target.closest(".lineage-track")) {
          entry.target.closest(".lineage-track")?.classList.add("in-view");
        }
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  nodes.forEach((el) => io.observe(el));
}

function initDiamonds() {
  const canvas = document.getElementById("diamonds");
  if (!canvas || reduceMotion()) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const gems = [];
  let raf = 0;
  let visible = true;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const spawn = (count) => {
    gems.length = 0;
    for (let i = 0; i < count; i += 1) {
      gems.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        s: 3 + Math.random() * 5,
        v: 0.15 + Math.random() * 0.45,
        a: 0.12 + Math.random() * 0.28,
        wobble: Math.random() * Math.PI * 2,
      });
    }
  };

  const drawDiamond = (x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.72, y);
    ctx.lineTo(x, y + s);
    ctx.lineTo(x - s * 0.72, y);
    ctx.closePath();
    ctx.fill();
  };

  const tick = () => {
    if (!visible) {
      raf = requestAnimationFrame(tick);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gems.forEach((gem) => {
      gem.y -= gem.v;
      gem.wobble += 0.01;
      gem.x += Math.sin(gem.wobble) * 0.15;
      if (gem.y < -12) {
        gem.y = canvas.height + 12;
        gem.x = Math.random() * canvas.width;
      }
      ctx.fillStyle = `rgba(240, 185, 11, ${gem.a})`;
      drawDiamond(gem.x, gem.y, gem.s);
    });
    raf = requestAnimationFrame(tick);
  };

  resize();
  spawn(Math.min(42, Math.floor(window.innerWidth / 36)));
  window.addEventListener("resize", () => {
    resize();
    spawn(Math.min(42, Math.floor(window.innerWidth / 36)));
  });
  document.addEventListener("visibilitychange", () => {
    visible = document.visibilityState === "visible";
  });
  tick();

  return () => cancelAnimationFrame(raf);
}

function stampSpark(clientX, clientY, options = {}) {
  const layer = options.layer || document.getElementById("spark-layer");
  if (!layer) return;

  const angle = Math.random() * Math.PI * 2;
  const dist = 40 + Math.random() * 70;
  const el = document.createElement("span");
  el.className = "spark";
  el.style.setProperty("--x", `${clientX}px`);
  el.style.setProperty("--y", `${clientY}px`);
  el.style.setProperty("--tx", `${clientX + Math.cos(angle) * dist}px`);
  el.style.setProperty("--ty", `${clientY + Math.sin(angle) * dist}px`);
  el.style.setProperty("--spark-size", `${options.size ?? 12 + Math.random() * 10}px`);
  el.style.setProperty("--spark-life", `${options.life ?? 1.05}s`);
  layer.appendChild(el);
  window.setTimeout(() => el.remove(), (options.life ?? 1.05) * 1000 + 80);
}

function burstSparks(x, y, count = 8) {
  if (reduceMotion()) return;
  for (let i = 0; i < count; i += 1) {
    window.setTimeout(() => stampSpark(x, y), i * 35);
  }
}

function initVowSpark() {
  const btn = document.getElementById("pet-ceo");
  if (!btn) return;

  btn.addEventListener("click", (event) => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    burstSparks(cx, cy, 10);
    btn.classList.add("is-burst");
    window.setTimeout(() => btn.classList.remove("is-burst"), 500);
    event.stopPropagation();
  });
}

function initParallax() {
  if (reduceMotion()) return;
  const visual = document.querySelector("[data-parallax]");
  const banner = visual?.querySelector(".hero-banner");
  if (!visual || !banner) return;

  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      banner.style.translate = `0 ${y * 0.22}px`;
    }
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
}

function initCursorGlow() {
  const glow = document.getElementById("cursor-glow");
  if (!glow || reduceMotion()) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  document.body.classList.add("has-pointer");
  let x = 0;
  let y = 0;
  let cx = 0;
  let cy = 0;
  let on = false;
  let raf = 0;

  const loop = () => {
    cx += (x - cx) * 0.12;
    cy += (y - cy) * 0.12;
    glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    raf = requestAnimationFrame(loop);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!on) {
        on = true;
        glow.classList.add("is-on");
        raf = requestAnimationFrame(loop);
      }
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    glow.classList.remove("is-on");
  });
}

function initMagneticButtons() {
  if (reduceMotion() || !window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll(".btn-magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (event) => {
      const rect = btn.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      btn.style.transform = `translate(${dx * 0.12}px, ${dy * 0.18 - 3}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
}

function initCardSpotlights() {
  if (reduceMotion() || !window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll(".board-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const mx = ((event.clientX - rect.left) / rect.width) * 100;
      const my = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${mx}%`);
      card.style.setProperty("--my", `${my}%`);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initContract();
  initChart();
  initNav();
  initSocialLinks();
  initLightbox();
  initReveals();
  initDiamonds();
  initVowSpark();
  initParallax();
  initCursorGlow();
  initMagneticButtons();
  initCardSpotlights();
});
