// the reference's cart line items show a 3-part variant line — garment |
// color | size (e.g. "Jacket Only | Burgundy | 44") — but this catalog only
// has a real size selector, no garment/color fields to pull from. Rather
// than leave those two segments out, derive plausible values straight from
// the product's own title (most names already carry a color word, and the
// garment follows from what kind of item it is), so the line still reads
// like a real variant instead of a bare size
function deriveGarmentAndColor(title) {
  const t = (title || "").toLowerCase();
  const garment = /coat/.test(t)
    ? "Coat"
    : /trouser|pant/.test(t)
    ? "Trousers Only"
    : /suit/.test(t)
    ? "Full Suit"
    : /shirt/.test(t)
    ? "Shirt Only"
    : /shoe/.test(t)
    ? "Footwear"
    : /belt/.test(t)
    ? "Accessory"
    : "Jacket Only";

  const colors = [
    "Burgundy", "Navy", "Black", "White", "Grey", "Gray", "Brown", "Green",
    "Beige", "Camel", "Olive", "Charcoal", "Rose", "Tan", "Cream", "Blue", "Red",
  ];
  // a plain substring match would let "Red" fire on "Coloured" (colou-RED) —
  // word boundaries keep it to the color actually appearing as its own word
  const match = colors.find((c) => new RegExp(`\\b${c.toLowerCase()}\\b`).test(t));
  return { garment, color: match || "Black" };
}

// closes every header dropdown (About Us menu, language, currency — desktop
// and their mobile drawer copies) so only one is ever open at a time; each
// toggle's own click handler stops propagation to manage its own open state,
// which also blocks the *other* dropdowns' document-level "click outside"
// listeners from ever seeing that click, so they'd otherwise stay open
function closeHeaderDropdowns() {
  document.querySelectorAll(".header-menu__details[open]").forEach((d) => d.removeAttribute("open"));
  ["langList", "currencyList", "langListMobile", "currencyListMobile", "langListFooter", "currencyListFooter"].forEach((id) => {
    const list = document.getElementById(id);
    if (list) list.classList.remove("is-open");
  });
}

// desktop header dropdowns (About Us, language, currency) all anchor to the
// header's own bottom edge, not each trigger's own position, so they line up
// with each other; align "left" keeps the dropdown's left edge under the
// trigger's left edge (About Us), align "right" keeps it under the trigger's
// right edge (language/currency)
function positionHeaderDropdown(dropdown, trigger, align) {
  const header = document.querySelector(".header__container");
  if (!header || !dropdown || !trigger) return;
  const headerBottom = header.getBoundingClientRect().bottom;
  const triggerRect = trigger.getBoundingClientRect();
  dropdown.style.top = headerBottom + "px";
  if (align === "right") {
    dropdown.style.right = window.innerWidth - triggerRect.right + "px";
    dropdown.style.left = "auto";
  } else {
    dropdown.style.left = triggerRect.left + "px";
    dropdown.style.right = "auto";
  }
}

// predictive search: a static-site rebuild of the reference's native Shopify
// predictive search — tabs (Products/Articles/Pages), trending-term chips,
// a merchant-curated "Recently viewed" grid shown while the input is empty
// (confirmed against the live reference: it's a fixed curated list, not real
// per-visitor browsing history), and a live-filtered results grid once typed
(function () {
  const panel = document.getElementById("predictiveSearch");
  const input = document.getElementById("searchInput");
  if (!panel || !input) return;

  const form = document.getElementById("predictiveSearchForm");
  const resetBtn = document.getElementById("searchReset");
  const promoEl = document.getElementById("searchPromo");
  const promoListEl = document.getElementById("searchPromoList");
  const resultEl = document.getElementById("searchResult");
  const footerEl = document.getElementById("searchFooter");
  const tabsButtons = Array.from(panel.querySelectorAll(".predictive-search__tabs-button"));
  const resultPanels = {
    product: panel.querySelector('[data-tab-panel="product"]'),
    article: panel.querySelector('[data-tab-panel="article"]'),
    page: panel.querySelector('[data-tab-panel="page"]'),
  };
  const resultProductsList = document.getElementById("searchResultProducts");
  const resultPagesList = document.getElementById("searchResultPages");
  const trendingTerms = Array.from(panel.querySelectorAll(".predictive-search__trending-term"));

  const searchToggle = document.getElementById("searchToggle");
  const searchToggleMobile = document.getElementById("searchToggleMobile");
  const searchCloseMobile = document.getElementById("searchCloseMobile");
  const openBtns = [searchToggle, searchToggleMobile].filter(Boolean);

  // the site's own real catalog (same products used in the homepage grids),
  // not the unrelated placeholder items this index used to fall back on
  const PRODUCTS = [
    { name: "Elegant Check Blazer", price: "€895,00", image: "./assets/images/pollheim/image161_2_1_590x_crop_center.jpg" },
    { name: "Casual Blazer & Casual Draw Pant", price: "€379,00", image: "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_590x_crop_center.jpg" },
    { name: "Lether Classic Men's Shoes", price: "€245,00", image: "./assets/images/pollheim/Letherclassicmen_sshoes_4_590x_crop_center.jpg" },
    { name: "Women's belt-lace in black", price: "€29,00", image: "./assets/images/pollheim/image161_1_590x_crop_center.jpg" },
    { name: "Casual Draw Pant & Casual Blazer", price: "€379,00", image: "./assets/images/pollheim/image164_1_590x_crop_center.jpg" },
    { name: "Luxe Summer Blazer", price: "€425,00", image: "./assets/images/pollheim/Luxe_Summer_Blazer_588x_crop_center.jpg" },
    { name: "Classic Navy Blazer", price: "€450,00", image: "./assets/images/pollheim/Untitleddesign_17_1_1_588x_crop_center.png" },
    { name: "Green Double-Breasted Blazer", price: "€495,00", image: "./assets/images/pollheim/Green_Double-Breasted_Blazer_588x_crop_center.png" },
    { name: "Tailored Wool Blazer", price: "€410,00", image: "./assets/images/pollheim/Untitleddesign_20_1_1_588x_crop_center.png" },
    { name: "Coloured Safari Back Suit", price: "€520,00", image: "./assets/images/pollheim/Dark_Beige_Coloured_Safari_Back_Suit.jpg" },
    { name: "Olive Heritage Check Jacket", price: "€365,00", image: "./assets/images/pollheim/Olive_Heritage_Check_Jacket.png" },
    { name: "Black Trousers with Side Adjusters", price: "€195,00", image: "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_close_up_on_Trousers_590x_crop_center.jpg" },
  ];

  const RECENTLY_VIEWED = PRODUCTS.slice(0, 6);

  const PAGES = [
    { name: "About Us", href: "about.html" },
    { name: "Blog", href: "blogs.html" },
    { name: "Contact Us", href: "contact.html" },
    { name: "Lookbook", href: "look-book.html" },
    { name: "FAQ", href: "faq.html" },
    { name: "All collections", href: "collections.html" },
  ];

  function matches(text, query) {
    return text.toLowerCase().includes(query);
  }

  function productCardHTML(p) {
    return `
      <li class="predictive-search__promo-item predictive-search__result-col">
        <div class="predictive-search__product-card">
          <a href="products.html" class="predictive-search__product-card-image-container">
            <img class="predictive-search__product-card-image" src="${p.image}" alt="${p.name}">
          </a>
          <div class="predictive-search__product-card-info">
            <a href="products.html" class="predictive-search__product-card-heading">${p.name}</a>
            <div class="predictive-search__product-card-price">${p.price}</div>
          </div>
        </div>
      </li>`;
  }

  function pageItemHTML(p) {
    return `
      <li class="predictive-search__result-col">
        <a href="${p.href}" class="predictive-search__product-card-heading">${p.name}</a>
      </li>`;
  }

  promoListEl.innerHTML = RECENTLY_VIEWED.map(productCardHTML).join("");

  function setActiveTab(tab) {
    tabsButtons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.tab === tab));
    Object.keys(resultPanels).forEach((key) => {
      if (resultPanels[key]) resultPanels[key].hidden = key !== tab;
    });
  }

  tabsButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      setActiveTab(btn.dataset.tab);
    });
  });

  function runSearch() {
    const query = input.value.trim().toLowerCase();

    if (!query) {
      promoEl.hidden = false;
      resultEl.hidden = true;
      footerEl.hidden = true;
      tabsButtons.forEach((btn) => (btn.disabled = true));
      return;
    }

    const matchedProducts = PRODUCTS.filter((p) => matches(p.name, query)).slice(0, 6);
    const matchedPages = PAGES.filter((p) => matches(p.name, query)).slice(0, 6);
    const matchedArticleCount = 0; // this static clone has no article/blog-post content to index

    resultProductsList.innerHTML =
      matchedProducts.map(productCardHTML).join("") ||
      '<p class="predictive-search__result-empty">No matching products.</p>';
    resultPagesList.innerHTML =
      matchedPages.map(pageItemHTML).join("") ||
      '<p class="predictive-search__result-empty">No matching pages.</p>';

    const counts = { product: matchedProducts.length, article: matchedArticleCount, page: matchedPages.length };
    tabsButtons.forEach((btn) => (btn.disabled = !counts[btn.dataset.tab]));

    // land on the first tab that actually has matches, same as the reference
    setActiveTab(counts.product ? "product" : counts.page ? "page" : "product");

    promoEl.hidden = true;
    resultEl.hidden = false;
    footerEl.hidden = false;
  }

  input.addEventListener("input", runSearch);

  resetBtn.addEventListener("click", () => {
    input.value = "";
    input.focus();
    runSearch();
  });

  trendingTerms.forEach((term) => {
    term.addEventListener("click", (e) => {
      // real links (matching the reference's own <a href="/search?q=...">),
      // but this static site has no search-results page to navigate to, so
      // the term is filtered in place instead of following the href
      e.preventDefault();
      input.value = term.textContent.trim();
      input.focus();
      runSearch();
    });
  });

  form.addEventListener("submit", (e) => e.preventDefault());

  function openSearch(toggler) {
    panel.classList.add("is-active");
    openBtns.forEach((btn) => btn.classList.toggle("is-active", btn === toggler));
    // reuses the same flag the nav/cart drawers force the header solid with,
    // so it also goes white here and stays visible instead of hiding on scroll
    document.body.classList.add("nav-open");
    window.dispatchEvent(new Event("navstate:change"));
    setTimeout(() => input.focus(), 200);
  }

  function closeSearch() {
    panel.classList.remove("is-active");
    openBtns.forEach((btn) => btn.classList.remove("is-active"));
    document.body.classList.remove("nav-open");
    window.dispatchEvent(new Event("navstate:change"));
    input.value = "";
    runSearch();
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isOpen = panel.classList.contains("is-active");
      if (isOpen) closeSearch();
      else openSearch(btn);
    });
  });

  searchCloseMobile && searchCloseMobile.addEventListener("click", closeSearch);

  document.addEventListener("click", (e) => {
    if (!panel.classList.contains("is-active")) return;
    const clickedInside = panel.contains(e.target);
    const clickedToggle =
      openBtns.some((btn) => btn.contains(e.target)) || (searchCloseMobile && searchCloseMobile.contains(e.target));
    if (!clickedInside && !clickedToggle) closeSearch();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-active")) closeSearch();
  });

  runSearch();
})();

(function () {
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isTouch || reduceMotion) return;

  const innerScrollSelector =
    ".nav-drawer__panel, .cart-drawer, .header__currency-list, .header__lang-list, .predictive-search__form, .product-modal__inner, .product-page__thumbs";

  const carouselSelector = ".product-row__scroller";

  // fixed per-frame multiplier (not time-based decay) — matches the exact
  // easing algorithm used by the reference site (goodland-six.vercel.app)
  const ease = 0.1;
  const LINE_HEIGHT = 34; // px per "line" when a device reports DOM_DELTA_LINE
  let current = window.scrollY;
  let target = window.scrollY;
  let raf = null;

  function maxScroll() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizeDelta(e) {
    if (e.deltaMode === 1) return e.deltaY * LINE_HEIGHT; // DOM_DELTA_LINE
    if (e.deltaMode === 2) return e.deltaY * window.innerHeight; // DOM_DELTA_PAGE
    return e.deltaY; // DOM_DELTA_PIXEL
  }

  function step() {
    current += (target - current) * ease;

    if (Math.abs(target - current) < 0.5) {
      current = target;
      window.scrollTo({ top: current, left: 0, behavior: "instant" });
      raf = null;
      return;
    }

    window.scrollTo({ top: current, left: 0, behavior: "instant" });
    raf = requestAnimationFrame(step);
  }

  window.addEventListener(
    "wheel",
    (e) => {
      if (document.body.classList.contains("nav-open")) return;
      if (e.target.closest(innerScrollSelector)) return;
      if (e.target.closest(carouselSelector) && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.ctrlKey) return; // let pinch-zoom / ctrl+wheel zoom through untouched

      e.preventDefault();
      target = clamp(target + normalizeDelta(e), 0, maxScroll());
      if (!raf) raf = requestAnimationFrame(step);
    },
    { passive: false }
  );

  window.addEventListener(
    "scroll",
    () => {
      if (!raf) {
        current = window.scrollY;
        target = window.scrollY;
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    target = clamp(target, 0, maxScroll());
  });
})();

// announcement bar rotation
(function () {
  const slides = document.querySelectorAll(".announcement-bar__slide");
  if (!slides.length) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove("is-active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("is-active");
  }, 4000);
})();

(function () {
  const summaries = document.querySelectorAll(
    ".footer__accordion > summary, .filter-drawer__group > summary, .product-modal__accordion > summary, .faq-page__item > summary"
  );
  if (!summaries.length) return;

  if (window.matchMedia("(max-width: 900px)").matches) {
    document.querySelectorAll(".footer__accordion").forEach((details) => {
      details.removeAttribute("open");
    });
  }

  summaries.forEach((summary) => {
    const details = summary.parentElement;
    const content = summary.nextElementSibling;
    if (!content) return;

    const isFooter = details.classList.contains("footer__accordion");

    summary.addEventListener("click", (e) => {
      e.preventDefault();

      content.getAnimations().forEach((anim) => anim.cancel());

      if (details.hasAttribute("open")) {
        // closing: freeze at current height, then animate down to 0
        const startHeight = content.scrollHeight;
        content.style.height = startHeight + "px";
        if (isFooter) {
          content.style.transition =
            "height .3s cubic-bezier(.25,.46,.45,.94), opacity .3s cubic-bezier(.25,.46,.45,.94)";
          content.style.opacity = "1";
        }
        content.offsetHeight; // force reflow so the browser sees the "from" state
        content.style.height = "0px";
        if (isFooter) content.style.opacity = "0";

        content.addEventListener(
          "transitionend",
          function onEnd(ev) {
            if (ev.propertyName !== "height") return;
            details.removeAttribute("open");
            content.style.height = "";
            if (isFooter) {
              content.style.opacity = "";
              content.style.transition = "";
            }
          },
          { once: true }
        );
      } else {
        // opening: reveal the content, animate from 0 up to its natural height
        details.setAttribute("open", "");
        const endHeight = content.scrollHeight;
        content.style.height = "0px";
        if (isFooter) {
          content.style.transition =
            "height .35s cubic-bezier(.25,.46,.45,.94), opacity 1s cubic-bezier(.25,.46,.45,.94)";
          content.style.opacity = "0";
        }
        content.offsetHeight; // force reflow
        content.style.height = endHeight + "px";
        if (isFooter) content.style.opacity = "1";

        content.addEventListener(
          "transitionend",
          function onEnd(ev) {
            if (ev.propertyName !== "height") return;
            content.style.height = "";
            if (isFooter) {
              content.style.opacity = "";
              content.style.transition = "";
            }
          },
          { once: true }
        );
      }
    });
  });
})();

// currency selector dropdown
(function () {
  const toggle = document.getElementById("currencyToggle");
  const list = document.getElementById("currencyList");
  if (!toggle || !list) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !list.classList.contains("is-open");
    closeHeaderDropdowns();
    if (willOpen) {
      positionHeaderDropdown(list, toggle, "left");
      list.classList.add("is-open");
    }
  });

  document.addEventListener("click", (e) => {
    if (!list.contains(e.target)) list.classList.remove("is-open");
  });
})();

// currency + language selector dropdowns, mobile copies shown in the nav
// drawer since the header's own utils row is desktop-only
(function () {
  const pairs = [
    ["currencyToggleMobile", "currencyListMobile"],
    ["langToggleMobile", "langListMobile"],
    ["currencyToggleFooter", "currencyListFooter"],
    ["langToggleFooter", "langListFooter"],
  ];
  pairs.forEach(([toggleId, listId]) => {
    const toggle = document.getElementById(toggleId);
    const list = document.getElementById(listId);
    if (!toggle || !list) return;

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !list.classList.contains("is-open");
      closeHeaderDropdowns();
      // these lists always open upward via CSS (the toggles sit at the very
      // bottom of the drawer/footer), so there's no position to compute here
      if (willOpen) list.classList.add("is-open");
    });

    document.addEventListener("click", (e) => {
      if (!list.contains(e.target)) list.classList.remove("is-open");
    });
  });
})();

// language/currency lists: clicking an option marks it as the current
// selection (matching the reference's own highlighted-row behavior) and
// updates that toggle's own label — each of the three contexts (desktop
// header, mobile drawer, footer) tracks its selection independently
(function () {
  const listPairs = [
    ["langToggle", "langList"],
    ["currencyToggle", "currencyList"],
    ["langToggleMobile", "langListMobile"],
    ["currencyToggleMobile", "currencyListMobile"],
    ["langToggleFooter", "langListFooter"],
    ["currencyToggleFooter", "currencyListFooter"],
  ];

  listPairs.forEach(([toggleId, listId]) => {
    const toggle = document.getElementById(toggleId);
    const list = document.getElementById(listId);
    if (!toggle || !list) return;

    const isCurrency = listId.toLowerCase().startsWith("currency");
    const items = Array.from(list.querySelectorAll("a"));

    function labelFor(a) {
      const dataText = a.querySelector("[data-text]");
      return (dataText ? dataText.getAttribute("data-text") : a.textContent).trim();
    }

    // the toggle's own label is wrapped in the same [data-text] structure as
    // the list items, so it gets the same roll-hover animation — updating it
    // means touching both the attribute (the hover duplicate reads from it)
    // and the inner span (the visible text)
    function setToggleText(newText) {
      const wrapper = toggle.querySelector("[data-text]");
      if (!wrapper) return;
      wrapper.setAttribute("data-text", newText);
      const inner = wrapper.querySelector("span");
      if (inner) inner.textContent = newText;
    }

    function select(a) {
      items.forEach((el) => el.closest("li").classList.toggle("is-current", el === a));

      if (isCurrency) {
        const flagSrc = a.querySelector("img")?.getAttribute("src");
        const toggleFlag = toggle.querySelector("img");
        if (flagSrc && toggleFlag) toggleFlag.src = flagSrc;

        const [country, symbol] = labelFor(a).split("|").map((s) => s.trim());
        const codeMatch = flagSrc && flagSrc.match(/flag-([a-z]{2})\.svg/i);
        const code = codeMatch ? codeMatch[1].toUpperCase() : country.slice(0, 2).toUpperCase();
        setToggleText(`${code} | ${symbol}`);
      } else {
        setToggleText(labelFor(a));
      }
    }

    items.forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        select(a);
        closeHeaderDropdowns();
      });
    });
  });
})();

// shared off-canvas system: nav drawer (main + nested) / cart drawer, one overlay
(function () {
  const isDesktop = () => window.matchMedia("(min-width: 1200px)").matches;

  const menuToggle = document.getElementById("menuToggle");
  const megaMenuToggle = document.getElementById("megaMenuToggle");
  const drawerTogglers = [menuToggle, megaMenuToggle].filter(Boolean);

  const navDrawer = document.getElementById("navDrawer");
  const navDrawerMain = document.getElementById("navDrawerMain");
  const navDrawerNested = document.getElementById("navDrawerNested");
  const navDrawerClose = document.getElementById("navDrawerClose");
  const navDrawerCloseNested = document.getElementById("navDrawerCloseNested");
  const navDrawerBack = document.getElementById("navDrawerBack");
  const navDrawerNestedTitle = document.getElementById("navDrawerNestedTitle");

  const cartToggle = document.getElementById("cartToggle");
  const cartClose = document.getElementById("cartClose");
  const cartDrawer = document.getElementById("cartDrawer");

  const filterToggle = document.getElementById("collectionFilterToggle");
  const filterClose = document.getElementById("filterDrawerClose");
  const filterDrawer = document.getElementById("filterDrawer");

  const overlay = document.getElementById("navOverlay");
  if (!overlay) return;

  function closeAll() {
    navDrawerMain && navDrawerMain.classList.remove("is-active");
    navDrawerNested && navDrawerNested.classList.remove("is-active");
    cartDrawer && cartDrawer.classList.remove("is-open");
    filterDrawer && filterDrawer.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    document.body.classList.remove("nav-open");
    drawerTogglers.forEach((btn) => {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-expanded", "false");
    });
    navDrawer &&
      navDrawer.querySelectorAll(".nav-drawer__parent-link.is-current").forEach((btn) => {
        btn.classList.remove("is-current");
      });
    navDrawer &&
      navDrawer.querySelectorAll(".nav-drawer__nested-content.is-drilled").forEach((content) => {
        content.classList.remove("is-drilled");
      });
    navDrawer &&
      navDrawer.querySelectorAll(".nav-drawer__nested-group.is-active-category").forEach((group) => {
        group.classList.remove("is-active-category");
        group.style.transition = "";
        group.style.opacity = "";
        group.style.transform = "";
      });
    // a transparent header over a drawer/overlay looks broken, so the sticky
    // header logic re-checks its solid/hidden state whenever this changes
    window.dispatchEvent(new Event("navstate:change"));
  }

  function openPanel(panel) {
    closeAll();
    panel.classList.add("is-open");
    overlay.classList.add("is-visible");
    document.body.classList.add("nav-open");
    window.dispatchEvent(new Event("navstate:change"));
  }

  function openNavDrawer(toggler) {
    closeAll();
    navDrawerMain.classList.add("is-active");
    overlay.classList.add("is-visible");
    document.body.classList.add("nav-open");
    window.dispatchEvent(new Event("navstate:change"));
    if (toggler) {
      toggler.classList.add("is-active");
      toggler.setAttribute("aria-expanded", "true");
    }
  }

  drawerTogglers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isOpen = navDrawerMain && navDrawerMain.classList.contains("is-active");
      if (isOpen) closeAll();
      else openNavDrawer(btn);
    });
  });

  navDrawerClose && navDrawerClose.addEventListener("click", closeAll);
  navDrawerCloseNested && navDrawerCloseNested.addEventListener("click", closeAll);

  // "Man" / "Women": mobile slides a nested panel in over the main one;
  // desktop opens it as a wide flyout beside the main list, which stays put
  navDrawer &&
    navDrawer.addEventListener("click", (e) => {
      const parentLink = e.target.closest("[data-drawer-target]");
      if (!parentLink) return;
      const target = parentLink.dataset.drawerTarget;
      const alreadyOpen = parentLink.classList.contains("is-current") && navDrawerNested.classList.contains("is-active");
      if (alreadyOpen) {
        navDrawerNested.classList.remove("is-active");
        parentLink.classList.remove("is-current");
        return;
      }
      navDrawer.querySelectorAll("[data-drawer-panel]").forEach((list) => {
        const isTarget = list.dataset.drawerPanel === target;
        list.hidden = !isTarget;
        if (isTarget) {
          const staggered = list.querySelectorAll(".nav-drawer__nested-heading, .nav-drawer__nested-group a:not(.nav-drawer__nested-heading), .nav-drawer__nested-links a");
          staggered.forEach((el, i) => el.style.setProperty("--i", i));
        }
        // switching Man/Women (or reopening one) always starts back at its
        // category list, never mid-drilled into a leftover product list
        list.classList.remove("is-drilled");
        list.querySelectorAll(".nav-drawer__nested-group.is-active-category").forEach((group) => {
          group.classList.remove("is-active-category");
          group.style.transition = "";
          group.style.opacity = "";
          group.style.transform = "";
        });
      });
      navDrawer.querySelectorAll(".nav-drawer__parent-link").forEach((btn) => {
        btn.classList.toggle("is-current", btn === parentLink);
      });
      if (navDrawerNestedTitle) navDrawerNestedTitle.textContent = parentLink.querySelector("span").textContent;
      navDrawerNested.classList.add("is-active");
    });

  // mobile only: tapping a category (Coats, Jackets, …) drills one level
  // deeper to show just its products, instead of navigating away
  navDrawer &&
    navDrawer.addEventListener("click", (e) => {
      if (isDesktop()) return;
      const heading = e.target.closest(".nav-drawer__nested-heading");
      if (!heading) return;
      e.preventDefault();
      const group = heading.closest(".nav-drawer__nested-group");
      const content = heading.closest(".nav-drawer__nested-content");
      if (!group || !content) return;
      content.querySelectorAll(".nav-drawer__nested-group").forEach((g) => {
        g.classList.toggle("is-active-category", g === group);
      });
      content.classList.add("is-drilled");
      const dataText = heading.querySelector("[data-text]");
      if (navDrawerNestedTitle && dataText) navDrawerNestedTitle.textContent = dataText.getAttribute("data-text");
      navDrawerNested.scrollTop = 0;
      // driven directly via inline styles (not a CSS class) because this
      // particular transition wouldn't reliably fire off a stylesheet rule;
      // slides in from the left, matching the reference's drawer direction
      group.style.transition = "none";
      group.style.opacity = "0";
      group.style.transform = "translateX(-24px)";
      group.offsetHeight;
      requestAnimationFrame(() => {
        group.style.transition = "opacity .35s ease, transform .35s ease";
        group.style.opacity = "1";
        group.style.transform = "translateX(0)";
      });
    });

  navDrawerBack &&
    navDrawerBack.addEventListener("click", () => {
      const drilledContent = navDrawer.querySelector(".nav-drawer__nested-content.is-drilled");
      if (drilledContent) {
        const activeGroup = drilledContent.querySelector(".nav-drawer__nested-group.is-active-category");
        let backFinished = false;
        const finishBack = () => {
          if (backFinished) return;
          backFinished = true;
          drilledContent.classList.remove("is-drilled");
          drilledContent.querySelectorAll(".nav-drawer__nested-group.is-active-category").forEach((group) => {
            group.classList.remove("is-active-category");
            group.style.transition = "";
            group.style.opacity = "";
            group.style.transform = "";
          });
        };
        if (activeGroup) {
          // slides back out to the left before the category list underneath is revealed
          activeGroup.style.transition = "opacity .3s ease, transform .3s ease";
          activeGroup.style.opacity = "0";
          activeGroup.style.transform = "translateX(-24px)";
          activeGroup.addEventListener("transitionend", finishBack, { once: true });
          setTimeout(finishBack, 350);
        } else {
          finishBack();
        }
        const currentParent = navDrawer.querySelector(".nav-drawer__parent-link.is-current");
        if (currentParent && navDrawerNestedTitle) navDrawerNestedTitle.textContent = currentParent.querySelector("span").textContent;
        navDrawerNested.scrollTop = 0;
        return;
      }
      navDrawerNested.classList.remove("is-active");
    });

  cartToggle &&
    cartToggle.addEventListener("click", (e) => {
      e.preventDefault();
      openPanel(cartDrawer);
    });
  cartClose && cartClose.addEventListener("click", closeAll);

  filterToggle &&
    filterToggle.addEventListener("click", () => openPanel(filterDrawer));
  filterClose && filterClose.addEventListener("click", closeAll);

  overlay.addEventListener("click", closeAll);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
})();

// language selector dropdown (mirrors the currency dropdown)
(function () {
  const toggle = document.getElementById("langToggle");
  const list = document.getElementById("langList");
  if (!toggle || !list) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !list.classList.contains("is-open");
    closeHeaderDropdowns();
    if (willOpen) {
      positionHeaderDropdown(list, toggle, "left");
      list.classList.add("is-open");
    }
  });

  document.addEventListener("click", (e) => {
    if (!list.contains(e.target)) list.classList.remove("is-open");
  });
})();

// shopping cart: quick-add buttons populate the cart drawer with real line
// items, styled and structured like the reference's own cart drawer — tabs
// ("Your cart (N)" / "Upsell products"), a free-shipping progress bar, and
// the Discount / Add-a-note accordion rows
(function () {
  const cartItemsEl = document.getElementById("cartItems");
  const cartEmptyEl = document.getElementById("cartEmpty");
  const cartFooterEl = document.getElementById("cartFooter");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartCountEl = document.getElementById("cartCount");
  const cartDrawer = document.getElementById("cartDrawer");
  const navDrawerMain = document.getElementById("navDrawerMain");
  const navDrawerNested = document.getElementById("navDrawerNested");
  const overlay = document.getElementById("navOverlay");
  const cartTitleEmpty = document.getElementById("cartTitleEmpty");
  const cartTabs = document.getElementById("cartTabs");
  const cartTabMain = document.getElementById("cartTabMain");
  const cartTabUpsell = document.getElementById("cartTabUpsell");
  const cartTabCount = document.getElementById("cartTabCount");
  const cartPanelMain = document.getElementById("cartPanelMain");
  const cartPanelUpsell = document.getElementById("cartPanelUpsell");
  const cartUpsellList = document.getElementById("cartUpsellList");
  const cartShipping = document.getElementById("cartShipping");
  const cartShippingLabel = document.getElementById("cartShippingLabel");
  const cartShippingFill = document.getElementById("cartShippingFill");
  if (!cartItemsEl || !cartDrawer || !overlay) return;

  // matches the reference's own free-shipping threshold (measured live: an
  // order needs to reach €1000,00 before the bar reads "you got free shipping")
  const FREE_SHIPPING_THRESHOLD = 1000;

  // a small curated cross-sell set for the "Upsell products" tab — the
  // reference populates this from real product recommendations, which this
  // static site has no backend to generate, so it draws from the same real
  // catalog the homepage and search already use
  const UPSELL_PRODUCTS = [
    { id: "luxe-summer-blazer", name: "Luxe Summer Blazer", price: 425, image: "./assets/images/pollheim/Luxe_Summer_Blazer_588x_crop_center.jpg", colors: ["Coral", "Beige"] },
    { id: "classic-navy-blazer", name: "Classic Navy Blazer", price: 450, image: "./assets/images/pollheim/Untitleddesign_17_1_1_588x_crop_center.png", colors: ["Navy", "Black"] },
    { id: "tailored-wool-blazer", name: "Tailored Wool Blazer", price: 410, image: "./assets/images/pollheim/Untitleddesign_20_1_1_588x_crop_center.png", colors: ["Charcoal", "Grey"] },
    { id: "green-double-breasted-blazer", name: "Green Double-Breasted Blazer", price: 495, image: "./assets/images/pollheim/Green_Double-Breasted_Blazer_588x_crop_center.png", colors: ["Green", "Olive"] },
  ];

  let cart = [];

  function formatPrice(amount) {
    return "€" + amount.toFixed(2).replace(".", ",");
  }

  function renderShipping() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
    cartShipping.hidden = false;
    if (remaining <= 0) {
      cartShippingLabel.textContent = "You got free shipping";
      cartShippingFill.style.width = "100%";
    } else {
      cartShippingLabel.innerHTML = `You are only <strong>${formatPrice(remaining)}</strong> away from free shipping`;
      cartShippingFill.style.width = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100) + "%";
    }
  }

  const SIZES = ["XS", "S", "M", "L", "XL"];

  function renderUpsell() {
    const inCart = new Set(cart.map((item) => item.id));
    const items = UPSELL_PRODUCTS.filter((p) => !inCart.has(p.id));
    cartUpsellList.innerHTML =
      items
        .map(
          (p) => `
            <li class="cart-drawer__upsell-item" data-id="${p.id}">
              <img src="${p.image}" alt="${p.name}">
              <div class="cart-drawer__upsell-item-info">
                <div class="cart-drawer__upsell-item-header">
                  <div class="cart-drawer__upsell-item-name">${p.name}</div>
                  <div class="cart-drawer__upsell-item-price">${formatPrice(p.price)}</div>
                </div>
                <label class="cart-drawer__upsell-item-select">
                  Color:
                  <select data-upsell-color>
                    ${p.colors.map((c) => `<option value="${c}">${c}</option>`).join("")}
                  </select>
                </label>
                <label class="cart-drawer__upsell-item-select">
                  Size:
                  <select data-upsell-size>
                    ${SIZES.map((s) => `<option value="${s}">${s}</option>`).join("")}
                  </select>
                </label>
                <button type="button" class="cart-drawer__upsell-item-add" data-action="upsell-add">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12H18" stroke="currentColor" stroke-linecap="round" /><path d="M12 18V6" stroke="currentColor" stroke-linecap="round" /></svg>
                  Add to cart
                </button>
              </div>
            </li>`
        )
        .join("") || '<li class="cart-drawer__upsell-empty">No more upsell products to show.</li>';
  }

  cartUpsellList.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="upsell-add"]');
    if (!btn) return;
    const row = btn.closest(".cart-drawer__upsell-item");
    const id = row.dataset.id;
    const product = UPSELL_PRODUCTS.find((p) => p.id === id);
    if (!product) return;
    const size = row.querySelector("[data-upsell-size]").value;
    const color = row.querySelector("[data-upsell-color]").value;
    const { garment } = deriveGarmentAndColor(product.name);
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, variant: `${garment} | ${color} | ${size}` });
    setTab("cart");
  });

  function setTab(tab) {
    cartTabMain.classList.toggle("is-active", tab === "cart");
    cartTabUpsell.classList.toggle("is-active", tab === "upsell");
    cartPanelMain.hidden = tab !== "cart";
    cartPanelUpsell.hidden = tab !== "upsell";
    // the whole footer — discount/note/membership promo, subtotal, and the
    // checkout buttons — is specific to reviewing your own cart; browsing
    // upsell suggestions shows just the product list, nothing below it
    cartFooterEl.hidden = tab !== "cart" || cart.length === 0;
  }

  cartTabMain.addEventListener("click", () => setTab("cart"));
  cartTabUpsell.addEventListener("click", () => {
    renderUpsell();
    setTab("upsell");
  });

  function render() {
    const hasItems = cart.length > 0;
    cartEmptyEl.hidden = hasItems;
    cartFooterEl.hidden = !hasItems;
    cartTitleEmpty.hidden = hasItems;
    cartTabs.hidden = !hasItems;
    if (hasItems) setTab("cart");

    cartItemsEl.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item__image">
                <div class="cart-item__details">
                    <div class="cart-item__header">
                        <div>
                            <p class="cart-item__title">${item.name}</p>
                            ${item.variant ? `<p class="cart-item__variant">${item.variant}</p>` : ""}
                        </div>
                        <span class="cart-item__price">${formatPrice(item.price * item.qty)}</span>
                    </div>
                    <div class="cart-item__footer">
                        <button type="button" class="cart-item__remove" data-action="remove">
                            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="1.4" /></svg>
                            Remove
                        </button>
                        <div class="cart-item__qty">
                            <input type="number" class="cart-item__qty-input" value="${item.qty}" min="1" readonly aria-label="Quantity for ${item.name}">
                            <div class="cart-item__qty-buttons">
                                <button type="button" class="cart-item__qty-btn" data-action="increase" aria-label="Increase quantity">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 15L12 8L19 15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /></svg>
                                </button>
                                <button type="button" class="cart-item__qty-btn" data-action="decrease" aria-label="Decrease quantity"${item.qty <= 1 ? " disabled" : ""}>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9L12 16L19 9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartSubtotalEl.textContent = formatPrice(subtotal);
    if (hasItems) renderShipping();
    else cartShipping.hidden = true;

    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountEl) cartCountEl.textContent = count;
    if (cartTabCount) cartTabCount.textContent = count;
    if (cartTitleEmpty) cartTitleEmpty.textContent = "Your cart (" + count + ")";
    const cartBtn = document.getElementById("cartToggle");
    if (cartBtn) cartBtn.setAttribute("aria-label", count > 0 ? "Cart, " + count + (count === 1 ? " item" : " items") : "Cart");
  }

  function openCart() {
    navDrawerMain && navDrawerMain.classList.remove("is-active");
    navDrawerNested && navDrawerNested.classList.remove("is-active");
    document.getElementById("filterDrawer")?.classList.remove("is-open");
    cartDrawer.classList.add("is-open");
    overlay.classList.add("is-visible");
    document.body.classList.add("nav-open");
  }

  function addToCart({ id, name, price, image, variant, qty }) {
    const amount = qty > 0 ? qty : 1;
    const existing = variant ? cart.find((item) => item.id === id && item.variant === variant) : cart.find((item) => item.id === id);
    if (existing) {
      existing.qty += amount;
    } else {
      cart.push({ id, name, price, image, variant, qty: amount });
    }
    render();
    openCart();
  }

  // the quick-view modal's "Quantity: (In cart: N)" label reaches into this
  // closure's own cart state through here rather than duplicating it
  window.getCartQty = (id) => cart.filter((item) => item.id === id).reduce((sum, item) => sum + item.qty, 0);

  // the quick-view modal has its own Add to cart button; it dispatches this
  // event rather than reaching into this closure directly
  window.addEventListener("quickview:addtocart", (e) => {
    addToCart(e.detail);
  });

  cartItemsEl.addEventListener("click", (e) => {
    const row = e.target.closest(".cart-item");
    if (!row) return;
    const id = row.dataset.id;
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (e.target.closest('[data-action="remove"]')) {
      cart = cart.filter((i) => i.id !== id);
    } else if (e.target.closest('[data-action="increase"]')) {
      item.qty += 1;
    } else if (e.target.closest('[data-action="decrease"]')) {
      item.qty -= 1;
      if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
    } else {
      return;
    }
    render();
  });

  render();
})();

// cart drawer's Discount / Add-a-note rows: the same smooth-height accordion
// animation as the quick-view modal's own accordions, matching the reference
(function () {
  document.querySelectorAll(".cart-drawer__accordion").forEach((details) => {
    const summary = details.querySelector("summary");
    const content = details.querySelector(".cart-drawer__accordion-content");
    if (!summary || !content) return;

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      content.getAnimations().forEach((anim) => anim.cancel());

      if (details.hasAttribute("open")) {
        const startHeight = content.scrollHeight;
        content.style.height = startHeight + "px";
        content.offsetHeight;
        content.style.height = "0px";
        content.addEventListener(
          "transitionend",
          function onEnd(ev) {
            if (ev.propertyName !== "height") return;
            details.removeAttribute("open");
            content.style.height = "";
          },
          { once: true }
        );
      } else {
        details.setAttribute("open", "");
        const endHeight = content.scrollHeight;
        content.style.height = "0px";
        content.offsetHeight;
        content.style.height = endHeight + "px";
        content.addEventListener(
          "transitionend",
          function onEnd(ev) {
            if (ev.propertyName !== "height") return;
            content.style.height = "";
          },
          { once: true }
        );
      }
    });
  });

  const applyBtn = document.getElementById("cartDiscountApply");
  applyBtn && applyBtn.addEventListener("click", (e) => e.preventDefault());
})();

(function () {
  const minInput = document.getElementById("filterPriceMin");
  const maxInput = document.getElementById("filterPriceMax");
  const fill = document.getElementById("filterSliderFill");
  const minLabel = document.getElementById("filterPriceMinLabel");
  const maxLabel = document.getElementById("filterPriceMaxLabel");
  if (!minInput || !maxInput || !fill) return;

  function update() {
    let min = Number(minInput.value);
    let max = Number(maxInput.value);
    if (min > max) {
      [min, max] = [max, min];
      minInput.value = min;
      maxInput.value = max;
    }
    const range = Number(minInput.max) - Number(minInput.min);
    const left = ((min - Number(minInput.min)) / range) * 100;
    const right = ((max - Number(minInput.min)) / range) * 100;
    fill.style.left = left + "%";
    fill.style.right = 100 - right + "%";
    minLabel.textContent = "$" + min;
    maxLabel.textContent = "$" + max;
  }

  minInput.addEventListener("input", update);
  maxInput.addEventListener("input", update);
  update();
})();

// desktop nav dropdown (About Us): hover-to-open on desktop, explicit toggle
// on click everywhere else — the click handler owns the "open" attribute
// itself (preventDefault on the native toggle) so a hover-then-click doesn't
// get flipped straight back closed by the browser's own default action
(function () {
  const items = document.querySelectorAll(".header-menu__details");
  if (!items.length) return;

  const isDesktop = () => window.matchMedia("(min-width: 1200px)").matches;

  // the dropdown is fixed-positioned against the header's bottom edge, not
  // flush against the trigger, so there's a real vertical gap between the two
  // boxes. A close-on-leave/cancel-on-enter timer still fails if the cursor
  // just stops moving inside that gap (never re-entering either element), so
  // instead track the mouse continuously and only close once it's genuinely
  // outside the combined trigger+gap+dropdown rectangle. Re-querying the
  // currently-open details fresh each time (rather than caching it) means
  // this stays correct even when something else — closeHeaderDropdowns(),
  // opening a different dropdown — closes it from outside this handler.
  document.addEventListener("mousemove", (e) => {
    if (!isDesktop()) return;
    const details = document.querySelector(".header-menu__details[open]");
    if (!details) return;

    // the dropdown is wide enough that a sibling nav item (Blog, Contact Us)
    // can sit geometrically inside the combined box below — hovering an item
    // that actually belongs to a *different* nav wrapper should close this
    // one right away, regardless of geometry
    const currentWrapper = details.closest(".header-menu__item-wrapper");
    const hoveredWrapper = document.elementFromPoint(e.clientX, e.clientY)?.closest(".header-menu__item-wrapper");
    if (hoveredWrapper && hoveredWrapper !== currentWrapper) {
      details.removeAttribute("open");
      return;
    }

    const dropdown = details.querySelector(".header-menu__dropdown");
    const summaryRect = details.querySelector("summary").getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();
    const left = Math.min(summaryRect.left, dropdownRect.left) - 8;
    const right = Math.max(summaryRect.right, dropdownRect.right) + 8;
    const top = summaryRect.top - 8;
    const bottom = dropdownRect.bottom + 8;
    const inside = e.clientX >= left && e.clientX <= right && e.clientY >= top && e.clientY <= bottom;
    if (!inside) details.removeAttribute("open");
  });

  items.forEach((details) => {
    const summary = details.querySelector("summary");
    const dropdown = details.querySelector(".header-menu__dropdown");

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      // on desktop, hover already owns open/close (mouseenter fires before a
      // real click ever lands) — so a click just keeps it open rather than
      // toggling, or it would immediately flip shut whatever hover just opened
      if (isDesktop()) {
        closeHeaderDropdowns();
        positionHeaderDropdown(dropdown, summary, "left");
        details.setAttribute("open", "");
        return;
      }
      const willOpen = !details.hasAttribute("open");
      closeHeaderDropdowns();
      if (willOpen) details.setAttribute("open", "");
    });

    details.addEventListener("mouseenter", () => {
      if (!isDesktop()) return;
      closeHeaderDropdowns();
      positionHeaderDropdown(dropdown, summary, "left");
      details.setAttribute("open", "");
    });
  });

  document.addEventListener("click", (e) => {
    items.forEach((details) => {
      if (!details.contains(e.target)) details.removeAttribute("open");
    });
  });
})();

// announcement bar ticker: the CSS animation slides the track by exactly
// -50% of its own width, which only loops seamlessly if that track is at
// least as wide as the bar itself — otherwise the second "half" runs out of
// content before it's scrolled fully into view, showing a blank gap instead
// of a continuous loop. Clone the item set until the track comfortably
// exceeds the bar's width, then duplicate that whole run once more so the
// halves are always identical and -50% always lands on a repeat boundary,
// matching the reference store's own dynamically-cloned ticker.
//
// Cloning more items to close that gap also makes the strip wider, and a
// fixed animation-duration would then cover that larger distance in the same
// time — i.e. visibly speed up. Pin the actual crawl speed instead (matching
// the reference's own pace, ~50px/s) and derive the duration from the
// track's width, so it stays this same speed regardless of how many clones
// that takes.
const ANNOUNCEMENT_TICKER_SPEED_PX_PER_SEC = 50;

(function () {
  const bar = document.getElementById("announcementBar");
  const track = bar ? bar.querySelector(".announcement-bar__track") : null;
  if (!bar || !track) return;

  const originalItems = Array.from(track.children);
  if (!originalItems.length) return;

  function buildLoop() {
    track.innerHTML = "";
    originalItems.forEach((item) => track.appendChild(item.cloneNode(true)));

    let guard = 0;
    while (track.scrollWidth < bar.offsetWidth && guard < 25) {
      originalItems.forEach((item) => track.appendChild(item.cloneNode(true)));
      guard++;
    }

    Array.from(track.children).forEach((item) => track.appendChild(item.cloneNode(true)));

    const halfWidth = track.scrollWidth / 2;
    track.style.animationDuration = halfWidth / ANNOUNCEMENT_TICKER_SPEED_PX_PER_SEC + "s";
  }

  buildLoop();

  let resizeQueued = false;
  window.addEventListener(
    "resize",
    () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => {
        resizeQueued = false;
        buildLoop();
      });
    },
    { passive: true }
  );
})();

// announcement bar + header
//  - the announcement bar is normal in-flow content, not pinned — it scrolls
//    away with the page like the reference store, never coming back until
//    you scroll back up to the very top
//  - the header's white background (is-solid) turns on once scrolled past
//    the hero, while a drawer/modal forces it, OR while hovered — so a
//    dropdown opened over the still-transparent hero (About Us, at the very
//    top) reads against a solid backdrop instead of the hero image
//  - its position, though, only collapses from the bar's height down to 0
//    (and it only becomes eligible to hide-on-scroll) once genuinely solid
//    from scroll/drawer state — hovering must NOT shift its position or make
//    it hide, that reads as a broken jump rather than an intentional effect
//  - once solid, it hides on scroll-down and reveals on scroll-up, like the
//    reference store; it's never hidden while still transparent over the
//    hero, or while a drawer/modal needs it forced solid and visible
//  - on solid (no-hero) pages the header is solid from the start
(function () {
  const header = document.getElementById("siteHeader");
  const bar = document.getElementById("announcementBar");
  if (!header) return;

  const isSolidPage = header.classList.contains("header--solid");
  const heroEl = document.querySelector(".hero-slideshow, .shoppable-hero");
  let holder = null;
  let solid = isSolidPage;
  let hovering = false;
  let hidden = false;
  let lastY = window.scrollY;

  // a language/currency/About-Us dropdown left open over a transparent hero
  // needs the header to stay solid even once the cursor leaves it — checked
  // live (not cached) since a dropdown can open without any scroll/navstate
  // event of its own to refresh the `solid` variable first
  function isHeaderDropdownOpen() {
    return (
      !!document.querySelector(".header-menu__details[open]") ||
      !!document.getElementById("langList")?.classList.contains("is-open") ||
      !!document.getElementById("currencyList")?.classList.contains("is-open")
    );
  }

  // below 1200px the header is a sticky in-flow bar under the announcement
  // bar (not a fixed overlay on the hero), always solid
  const compactMQ = window.matchMedia("(max-width: 1199px)");

  function updateOffsets() {
    const barHeight = bar ? bar.offsetHeight : 0;
    const root = document.documentElement.style;
    if (compactMQ.matches) {
      // it sits right under the bar until that scrolls away, then sticks to
      // the very top; the drawers and the dimmed backdrop start right below it
      const headerBottom = Math.max(barHeight - window.scrollY, 0) + header.offsetHeight;
      root.setProperty("--announcement-bar-height", headerBottom + "px");
      root.setProperty("--header-offset-bottom", headerBottom + "px");
      return;
    }
    // the effective gap the header sits below: the bar's full height while
    // still transparent over the hero (where the bar is also still visible
    // right above it), collapsing to 0 once solid (by then the bar has
    // long since scrolled out of view, so there's nothing left to sit below)
    const effectiveGap = solid ? 0 : barHeight;
    root.setProperty("--announcement-bar-height", effectiveGap + "px");
    // the nav drawer starts right below the header, like the reference
    root.setProperty("--header-offset-bottom", effectiveGap + header.offsetHeight + "px");
  }

  // an in-flow header leaves a hole in the page once it turns fixed, so a
  // solid-page header sits inside a holder that keeps the space it used to take up
  function syncHolder() {
    if (!holder) return;
    holder.style.minHeight = "0";
    holder.style.minHeight = header.offsetHeight + "px";
  }

  if (isSolidPage) {
    holder = document.createElement("div");
    header.parentNode.insertBefore(holder, header);
    holder.appendChild(header);
  }

  function heroThreshold() {
    return heroEl ? Math.max(heroEl.offsetHeight - header.offsetHeight, 0) : 0;
  }

  function applyState() {
    // a transparent header over a darkened, overlaid page reads as broken —
    // once any drawer/modal is open behind it, force it solid
    const drawerOpen = document.body.classList.contains("nav-open");
    const atTop = !isSolidPage && window.scrollY < heroThreshold();
    solid = isSolidPage || compactMQ.matches || drawerOpen || !atTop || isHeaderDropdownOpen();
    // the visible white background also turns on for a hover — used for
    // reading a dropdown's contents against the header while still at the
    // very top of the hero — but hovering never feeds into `solid` itself
    header.classList.toggle("is-solid", solid || hovering);
    updateOffsets();

    const y = window.scrollY;
    // a drawer/modal needs the header forced visible (never hidden) even if
    // it was already hidden the moment it was opened; otherwise, only hide
    // it once it's genuinely solid — never while transparent over the hero
    if (drawerOpen) {
      hidden = false;
    } else if (solid && y > lastY && y > (bar ? bar.offsetHeight : 0) + header.offsetHeight) {
      // like the reference, only once scrolled past the bar and the header
      hidden = true;
    } else if (y < lastY || y <= header.offsetHeight) {
      hidden = false;
    }
    header.classList.toggle("is-hidden", hidden);
    lastY = y;
  }

  window.addEventListener("navstate:change", applyState);
  compactMQ.addEventListener("change", applyState);

  header.addEventListener("mouseenter", () => {
    hovering = true;
    header.classList.toggle("is-solid", true);
  });
  header.addEventListener("mouseleave", () => {
    hovering = false;
    header.classList.toggle("is-solid", solid || isHeaderDropdownOpen());
  });

  updateOffsets();
  syncHolder();
  applyState();

  let scrollQueued = false;
  window.addEventListener(
    "scroll",
    () => {
      // an open language/currency/About-Us dropdown doesn't track the page
      // scrolling underneath it, so close it the moment the user scrolls
      // rather than leave it floating over the wrong spot
      closeHeaderDropdowns();
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        applyState();
      });
    },
    { passive: true }
  );

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      syncHolder();
      updateOffsets();
    });
    resizeObserver.observe(header);
    if (bar) resizeObserver.observe(bar);
  }
})();

// scroll reveal animations (fade + rise, staggered via --i)
(function () {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
  );

  targets.forEach((el) => observer.observe(el));
})();

// hero slideshow, matching the reference store's: a looping "slide" swiper
// (1.2s slides, 16px apart, 5s autoplay), a progress bar that fills over each
// cycle, and a thumbnail (≥768px) of the slide that comes next
(function () {
  const section = document.getElementById("heroSlideshow");
  const el = section && section.querySelector(".hero-slideshow__slider");
  if (!el || typeof Swiper === "undefined") return;

  const AUTOPLAY_DELAY = 5000;
  const SPEED = 1200;

  const swiper = new Swiper(el, {
    slidesPerView: 1,
    spaceBetween: 16,
    loop: true,
    speed: SPEED,
    grabCursor: true,
    autoplay: { delay: AUTOPLAY_DELAY, disableOnInteraction: false },
    pagination: {
      el: section.querySelector(".hero-slideshow__pagination"),
      clickable: true,
      bulletElement: "button",
    },
  });

  // the first slide is already showing, so the entrance animations only
  // switch on now — the slides that come next are the ones that animate in
  section.classList.add("is-ready");

  // the slide images are large: decode them up front so the first slide
  // change doesn't stutter while the browser decodes the incoming one
  section.querySelectorAll(".hero-slideshow__media").forEach((img) => {
    if (img.decode) img.decode().catch(() => {});
  });

  // the bar runs a bit longer than the autoplay delay (delay + slide time) and
  // restarts each time a slide has finished moving in
  const fill = section.querySelector(".hero-slideshow__progress-fill");
  const progress =
    fill &&
    fill.animate([{ width: "0%" }, { width: "100%" }], {
      duration: AUTOPLAY_DELAY + SPEED,
      easing: "linear",
      fill: "forwards",
    });
  swiper.on("slideChangeTransitionEnd", () => {
    if (!progress) return;
    progress.currentTime = 0;
    progress.play();
  });

  // the thumbnail always previews the slide after the active one
  const previews = [...section.querySelectorAll(".hero-slideshow__preview-item")];
  function syncPreview() {
    const next = (swiper.realIndex + 1) % previews.length;
    previews.forEach((item, i) => item.classList.toggle("is-active", i === next));
  }

  // only the slide in view has focusable buttons
  function syncButtons() {
    swiper.slides.forEach((slide, i) => {
      slide.querySelectorAll("a").forEach((a) => (a.tabIndex = i === swiper.activeIndex ? 0 : -1));
    });
  }

  syncPreview();
  syncButtons();
  swiper.on("slideChange", () => {
    syncPreview();
    syncButtons();
  });
})();

// featured products carousel
(function () {
  const el = document.querySelector(".featured-products__slider");
  if (!el || typeof Swiper === "undefined") return;

  new Swiper(el, {
    grabCursor: true,
    slidesPerView: 1.25,
    spaceBetween: 12,
    navigation: {
      nextEl: document.querySelector(".featured-products__next"),
      prevEl: document.querySelector(".featured-products__prev"),
    },
    breakpoints: {
      576: { slidesPerView: 2.2 },
      768: { slidesPerView: 3.2 },
      1200: { slidesPerView: 3 },
    },
  });
})();

// featured products: clicking a color swatch just marks it selected (the
// reference also swaps in that color's own product photo, but this static
// catalog only has the one photo per product)
(function () {
  document.querySelectorAll(".featured-products__slider .product-card__swatches").forEach((group) => {
    group.addEventListener("click", (e) => {
      const swatch = e.target.closest(".product-card__swatch");
      if (!swatch) return;
      group.querySelectorAll(".product-card__swatch").forEach((s) => s.classList.toggle("is-active", s === swatch));
    });
  });
})();

// trend products spotlight: click a hotspot to switch the active popup
(function () {
  const section = document.querySelector(".trend-products");
  if (!section) return;

  const spots = section.querySelectorAll(".trend-spot__btn");
  const popups = section.querySelectorAll(".trend-popup");

  function activate(index) {
    spots.forEach((s) => s.classList.toggle("is-active", s.dataset.spot === index));
    popups.forEach((p) => p.classList.toggle("is-active", p.dataset.spotPopup === index));
  }

  spots.forEach((spot) => {
    spot.addEventListener("click", () => activate(spot.dataset.spot));
  });

  section.querySelectorAll(".trend-popup__close").forEach((btn) => {
    btn.addEventListener("click", () => {
      spots.forEach((s) => s.classList.remove("is-active"));
      popups.forEach((p) => p.classList.remove("is-active"));
    });
  });
})();

// collections carousel: swiper text list synced with the crossfading image panel
(function () {
  const el = document.querySelector(".collections-carousel__slider");
  if (!el || typeof Swiper === "undefined") return;

  const imageBlocks = document.querySelectorAll(".collections-carousel__image-block");

  function showImage(index) {
    imageBlocks.forEach((block) => {
      block.classList.toggle("is-visible", block.dataset.collectionImage === String(index));
    });
  }

  const swiper = new Swiper(el, {
    slidesPerView: 2.456,
    centeredSlides: true,
    loop: true,
    grabCursor: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    },
    breakpoints: {
      768: { slidesPerView: 3.4 },
      992: { slidesPerView: 4.4 },
      1500: { slidesPerView: 4.8 },
    },
  });

  // read the logical index off each title rather than its position in the
  // list - loop mode clones slides at both ends, so querySelectorAll's
  // document order no longer lines up with the original 0..7 sequence
  el.querySelectorAll(".collections-carousel__slide-title").forEach((title) => {
    const index = title.dataset.collectionTarget;
    title.addEventListener("mouseenter", () => showImage(index));
    title.addEventListener("click", (e) => {
      if (window.matchMedia("(min-width: 992px)").matches) e.preventDefault();
      showImage(index);
    });
  });

  // realIndex (not activeIndex) already resolves loop clones back to their
  // original slide's index
  swiper.on("slideChange", () => showImage(swiper.realIndex));
})();

// video section ticker: same seamless-loop problem/fix as the announcement
// bar above - a fixed handful of clones runs out of content on very wide
// screens, breaking the infinite-loop illusion with a blank gap. Clone until
// the track comfortably covers the section twice over, then pin the crawl
// speed and derive the duration from the resulting width.
const VIDEO_TICKER_SPEED_PX_PER_SEC = 70;

(function () {
  const bar = document.querySelector(".video-section__ticker");
  const track = bar ? bar.querySelector(".video-section__ticker-track") : null;
  if (!bar || !track) return;

  const originalItems = Array.from(track.children);
  if (!originalItems.length) return;

  function buildLoop() {
    track.innerHTML = "";
    originalItems.forEach((item) => track.appendChild(item.cloneNode(true)));

    let guard = 0;
    while (track.scrollWidth < bar.offsetWidth && guard < 25) {
      originalItems.forEach((item) => track.appendChild(item.cloneNode(true)));
      guard++;
    }

    Array.from(track.children).forEach((item) => track.appendChild(item.cloneNode(true)));

    const halfWidth = track.scrollWidth / 2;
    track.style.animationDuration = halfWidth / VIDEO_TICKER_SPEED_PX_PER_SEC + "s";
  }

  buildLoop();

  let resizeQueued = false;
  window.addEventListener(
    "resize",
    () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => {
        resizeQueued = false;
        buildLoop();
      });
    },
    { passive: true }
  );
})();

// video section: click to play/pause, hides the marquee ticker while playing
(function () {
  const section = document.querySelector(".video-section");
  if (!section) return;

  const media = section.querySelector(".video-section__media");
  const video = section.querySelector(".video-section__video");
  const playBtn = section.querySelector(".video-section__play");
  if (!media || !video || !playBtn) return;

  function play() {
    section.classList.add("is-playing");
    video.play().catch(() => {});
  }

  playBtn.addEventListener("click", play);
  media.querySelector(".video-section__poster").addEventListener("click", play);

  video.addEventListener("pause", () => section.classList.remove("is-playing"));
  video.addEventListener("ended", () => section.classList.remove("is-playing"));

  // on pointer devices, the play button abandons its centered position and
  // follows the mouse instead - the native cursor is hidden (via .is-tracking
  // in CSS) so the button itself reads as the cursor
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    media.addEventListener("mouseenter", () => media.classList.add("is-tracking"));
    media.addEventListener("mousemove", (e) => {
      const rect = media.getBoundingClientRect();
      playBtn.style.left = `${e.clientX - rect.left}px`;
      playBtn.style.top = `${e.clientY - rect.top}px`;
    });
    media.addEventListener("mouseleave", () => {
      media.classList.remove("is-tracking");
      playBtn.style.left = "";
      playBtn.style.top = "";
    });
  }
})();

// product features: tabs and image hotspots stay in sync with each other
(function () {
  const section = document.querySelector(".product-features");
  if (!section) return;

  const tabs = section.querySelectorAll(".product-features__tab");
  const panels = section.querySelectorAll(".product-features__panel");
  const hotspots = section.querySelectorAll(".product-features__hotspot");

  function activate(index) {
    tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.featureTab === index));
    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.featurePanel === index));
    hotspots.forEach((h) => h.classList.toggle("is-active", h.dataset.hotspot === index));
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab.dataset.featureTab)));
  hotspots.forEach((h) => h.addEventListener("click", () => activate(h.dataset.hotspot)));
})();

// product spotlight (featured product buy box): swatches, quantity, add to cart
(function () {
  const section = document.querySelector(".product-spotlight");
  if (!section) return;

  const mainImg = section.querySelector("#spotlightMainImg img");
  const colorLabel = section.querySelector("#spotlightColorLabel");
  const swatches = section.querySelectorAll(".product-spotlight__swatch");
  const thumbs = section.querySelectorAll(".product-spotlight__thumb");
  const qtyInput = section.querySelector("#spotlightQty");
  const addBtn = section.querySelector("#spotlightAddToCart");

  swatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      swatches.forEach((s) => s.classList.remove("is-active"));
      swatch.classList.add("is-active");
      if (colorLabel) colorLabel.textContent = swatch.dataset.color;
      if (mainImg) mainImg.src = swatch.dataset.image;
      thumbs.forEach((t) => t.classList.remove("is-active"));
      if (thumbs[0]) thumbs[0].classList.add("is-active");
    });
  });

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbs.forEach((t) => t.classList.remove("is-active"));
      thumb.classList.add("is-active");
      if (mainImg) mainImg.src = thumb.src;
    });
  });

  section.querySelectorAll("[data-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = btn.dataset.qty === "increase" ? current + 1 : Math.max(1, current - 1);
    });
  });

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const activeSwatch = section.querySelector(".product-spotlight__swatch.is-active");
      window.dispatchEvent(
        new CustomEvent("quickview:addtocart", {
          detail: {
            id: "coloured-safari-back-suit",
            name: "Coloured Safari Back Suit",
            price: 1195,
            image: mainImg ? mainImg.src : "",
            variant: activeSwatch ? activeSwatch.dataset.color : "",
          },
        })
      );
    });
  }
})();

// quick view modal — opens from each product card's Quick View bar;
(function () {
  const PRODUCTS = {
  "lido-short": {
    "title": "The Lido Short",
    "material": "Organic cotton",
    "priceCompare": "$120",
    "priceSale": "$96",
    "priceSave": "Save $24",
    "descPara": "The Lido Short is a relaxed warm-weather staple with a clean, tailored finish. Cut in a light oat linen blend, it sits high on the waist and features soft front pleats that give it shape while keeping the overall look easy and unfussy.",
    "bullets": [
      "High-rise fit",
      "Tailored short silhouette",
      "Soft front pleats",
      "Linen-blend texture",
      "Warm-weather essential"
    ],
    "stylingTip": "Style it with light knits, simple tanks, or oversized shirts for an effortless summer uniform.",
    "images": [
      "./assets/images/products/product-lido-short.png",
      "./assets/images/products/product-lido-short-hover.png",
      "./assets/images/products/product-lido-short-alt2.png"
    ],
    "tabs": [
      {
        "label": "Description",
        "html": "<p>Crafted from premium linen, this piece offers natural breathability and a relaxed elegance. Linen's inherent texture creates a beautifully lived-in look that softens with every wear, while its lightweight construction makes it perfect for warm weather. The fabric drapes gracefully, providing comfortable movement throughout your day. Easy to care for and designed to develop character over time, this linen essential is a timeless addition to any wardrobe.</p>"
      },
      {
        "label": "Materials & Care",
        "html": "<p>Our pieces are crafted from premium linen sourced from European mills known for their commitment to quality and sustainable practices. Linen is a natural, breathable fabric that becomes softer and more comfortable with every wear, making it an ideal choice for timeless pieces like this skirt.<br><br>To keep your linen garment looking its best, we recommend gentle machine washing in cool water or hand washing with mild detergent. Lay flat to dry to maintain the fabric's natural drape and integrity. A light iron on low heat can help refresh the fabric if needed. Linen's natural texture is part of its charm—slight variations in color and weave are characteristics of this beautiful material, not flaws.</p>"
      },
      {
        "label": "Certifications",
        "html": "<p>Certified Organic<br>Ethically Sourced<br>Fair Trade Certified<br>Quality Assured<br>Sustainable Materials<br>Cruelty-Free<br>Made with Care<br>Eco-Friendly Production</p>"
      },
      {
        "label": "Shipping & Returns",
        "html": "<p>We ship orders within 2-3 business days. Standard delivery takes 5-7 business days. Express shipping is available at checkout for faster delivery.<br><br>Items can be returned within 30 days of purchase in original condition with tags attached. Return shipping is free on orders over $75. Refunds are processed within 5-7 business days of receiving your return.</p>"
      }
    ]
  },
  "brisa-overshirt": {
    "title": "The Brisa Overshirt",
    "material": "Organic cotton",
    "priceCompare": null,
    "priceSale": "$132",
    "priceSave": "",
    "descPara": "The Brisa Overshirt is a lightweight linen layer with an easy, thrown-on feel. Made in soft sage linen, it has an oversized silhouette, open front styling, and a breezy drape that works beautifully over tanks, tees, and matching bottoms.",
    "bullets": [
      "Oversized fit",
      "Lightweight linen",
      "Open front styling",
      "Easy drape",
      "Soft sage tone"
    ],
    "stylingTip": "It’s the piece you reach for when you want a little coverage without losing that airy warm-weather ease.",
    "images": [
      "./assets/images/products/product-brisa-overshirt.png",
      "./assets/images/products/product-brisa-overshirt-hover.png",
      "./assets/images/products/product-brisa-overshirt-alt2.png",
      "./assets/images/products/product-brisa-overshirt-alt3.png"
    ],
    "tabs": [
      {
        "label": "Description",
        "html": "<p>Crafted from premium linen, this piece offers natural breathability and a relaxed elegance. Linen's inherent texture creates a beautifully lived-in look that softens with every wear, while its lightweight construction makes it perfect for warm weather. The fabric drapes gracefully, providing comfortable movement throughout your day. Easy to care for and designed to develop character over time, this linen essential is a timeless addition to any wardrobe.</p>"
      },
      {
        "label": "Materials & Care",
        "html": "<p>Our pieces are crafted from premium linen sourced from European mills known for their commitment to quality and sustainable practices. Linen is a natural, breathable fabric that becomes softer and more comfortable with every wear, making it an ideal choice for timeless pieces like this skirt.<br><br>To keep your linen garment looking its best, we recommend gentle machine washing in cool water or hand washing with mild detergent. Lay flat to dry to maintain the fabric's natural drape and integrity. A light iron on low heat can help refresh the fabric if needed. Linen's natural texture is part of its charm—slight variations in color and weave are characteristics of this beautiful material, not flaws.</p>"
      },
      {
        "label": "Certifications",
        "html": "<p>Certified Organic<br>Ethically Sourced<br>Fair Trade Certified<br>Quality Assured<br>Sustainable Materials<br>Cruelty-Free<br>Made with Care<br>Eco-Friendly Production</p>"
      },
      {
        "label": "Shipping & Returns",
        "html": "<p>We ship orders within 2-3 business days. Standard delivery takes 5-7 business days. Express shipping is available at checkout for faster delivery.<br><br>Items can be returned within 30 days of purchase in original condition with tags attached. Return shipping is free on orders over $75. Refunds are processed within 5-7 business days of receiving your return.</p>"
      }
    ]
  },
  "cove-skirt": {
    "title": "The Cove Skirt",
    "material": "Organic cotton",
    "priceCompare": null,
    "priceSale": "$112",
    "priceSave": "",
    "descPara": "The Cove Skirt is a clean linen midi with a simple shape and quiet detail. Cut in a warm sand linen, it sits high on the waist and falls into a straight silhouette with a side slit for ease of movement and a slightly sharper finish.",
    "bullets": [
      "Midi length",
      "High-rise waist",
      "Straight silhouette",
      "Side slit detail",
      "Soft linen texture"
    ],
    "stylingTip": "It pairs easily with slim knits, soft tees, or lightweight shirting for a look that feels minimal and refined.",
    "images": [
      "./assets/images/products/product-cove-skirt.png",
      "./assets/images/products/product-cove-skirt-hover.png",
      "./assets/images/products/product-cove-skirt-alt2.png"
    ],
    "tabs": [
      {
        "label": "Description",
        "html": "<p>Crafted from premium linen, this piece offers natural breathability and a relaxed elegance. Linen's inherent texture creates a beautifully lived-in look that softens with every wear, while its lightweight construction makes it perfect for warm weather. The fabric drapes gracefully, providing comfortable movement throughout your day. Easy to care for and designed to develop character over time, this linen essential is a timeless addition to any wardrobe.</p>"
      },
      {
        "label": "Materials & Care",
        "html": "<p>Our pieces are crafted from premium linen sourced from European mills known for their commitment to quality and sustainable practices. Linen is a natural, breathable fabric that becomes softer and more comfortable with every wear, making it an ideal choice for timeless pieces like this skirt.<br><br>To keep your linen garment looking its best, we recommend gentle machine washing in cool water or hand washing with mild detergent. Lay flat to dry to maintain the fabric's natural drape and integrity. A light iron on low heat can help refresh the fabric if needed. Linen's natural texture is part of its charm—slight variations in color and weave are characteristics of this beautiful material, not flaws.</p>"
      },
      {
        "label": "Certifications",
        "html": "<p>Certified Organic<br>Ethically Sourced<br>Fair Trade Certified<br>Quality Assured<br>Sustainable Materials<br>Cruelty-Free<br>Made with Care<br>Eco-Friendly Production</p>"
      },
      {
        "label": "Shipping & Returns",
        "html": "<p>We ship orders within 2-3 business days. Standard delivery takes 5-7 business days. Express shipping is available at checkout for faster delivery.<br><br>Items can be returned within 30 days of purchase in original condition with tags attached. Return shipping is free on orders over $75. Refunds are processed within 5-7 business days of receiving your return.</p>"
      }
    ]
  },
  "arden-coord": {
    "title": "The Arden Co-ord",
    "material": "Organic cotton",
    "priceCompare": null,
    "priceSale": "$214",
    "priceSave": "",
    "descPara": "The Arden Co-ord is a relaxed linen set designed to make getting dressed feel easy. The softly oversized shirt and wide-leg trouser work together as a polished matching look, but each piece can also be styled separately for a more everyday feel.",
    "bullets": [
      "Two-piece set",
      "Oversized linen shirt",
      "Wide-leg trousers",
      "Soft natural texture",
      "Easy coordinated dressing"
    ],
    "stylingTip": "Wear it as a full set for a clean tonal statement or mix the pieces into the rest of your wardrobe with ease.",
    "images": [
      "./assets/images/products/product-arden-coord.png",
      "./assets/images/products/product-arden-coord-hover.png",
      "./assets/images/products/product-arden-coord-alt2.png"
    ],
    "tabs": [
      {
        "label": "Description",
        "html": "<p>Crafted from premium linen, this piece offers natural breathability and a relaxed elegance. Linen's inherent texture creates a beautifully lived-in look that softens with every wear, while its lightweight construction makes it perfect for warm weather. The fabric drapes gracefully, providing comfortable movement throughout your day. Easy to care for and designed to develop character over time, this linen essential is a timeless addition to any wardrobe.</p>"
      },
      {
        "label": "Materials & Care",
        "html": "<p>Our pieces are crafted from premium linen sourced from European mills known for their commitment to quality and sustainable practices. Linen is a natural, breathable fabric that becomes softer and more comfortable with every wear, making it an ideal choice for timeless pieces like this skirt.<br><br>To keep your linen garment looking its best, we recommend gentle machine washing in cool water or hand washing with mild detergent. Lay flat to dry to maintain the fabric's natural drape and integrity. A light iron on low heat can help refresh the fabric if needed. Linen's natural texture is part of its charm—slight variations in color and weave are characteristics of this beautiful material, not flaws.</p>"
      },
      {
        "label": "Certifications",
        "html": "<p>Certified Organic<br>Ethically Sourced<br>Fair Trade Certified<br>Quality Assured<br>Sustainable Materials<br>Cruelty-Free<br>Made with Care<br>Eco-Friendly Production</p>"
      },
      {
        "label": "Shipping & Returns",
        "html": "<p>We ship orders within 2-3 business days. Standard delivery takes 5-7 business days. Express shipping is available at checkout for faster delivery.<br><br>Items can be returned within 30 days of purchase in original condition with tags attached. Return shipping is free on orders over $75. Refunds are processed within 5-7 business days of receiving your return.</p>"
      }
    ]
  },
  "vela-shirt": {
    "title": "The Vela Shirt",
    "material": "Organic cotton",
    "priceCompare": "$130",
    "priceSale": "$118",
    "priceSave": "Save $12",
    "descPara": "The Vela Shirt is a relaxed linen button-up that feels easy, airy, and versatile. Made in a soft warm ivory linen, it has a slightly oversized shape, short sleeves, and a clean collar that gives it just enough structure while still feeling effortless.",
    "bullets": [
      "Relaxed fit",
      "Button-front closure",
      "Short sleeves",
      "Soft linen texture",
      "Easy warm-weather layer"
    ],
    "stylingTip": "Wear it open over a tank or buttoned up with matching trousers for an unfussy summer set.",
    "images": [
      "./assets/images/products/product-vela-shirt.png",
      "./assets/images/products/product-vela-shirt-hover.png",
      "./assets/images/products/product-vela-shirt-alt2.png"
    ],
    "tabs": [
      {
        "label": "Description",
        "html": "<p>Crafted from premium linen, this piece offers natural breathability and a relaxed elegance. Linen's inherent texture creates a beautifully lived-in look that softens with every wear, while its lightweight construction makes it perfect for warm weather. The fabric drapes gracefully, providing comfortable movement throughout your day. Easy to care for and designed to develop character over time, this linen essential is a timeless addition to any wardrobe.</p>"
      },
      {
        "label": "Materials & Care",
        "html": "<p>Our pieces are crafted from premium linen sourced from European mills known for their commitment to quality and sustainable practices. Linen is a natural, breathable fabric that becomes softer and more comfortable with every wear, making it an ideal choice for timeless pieces like this skirt.<br><br>To keep your linen garment looking its best, we recommend gentle machine washing in cool water or hand washing with mild detergent. Lay flat to dry to maintain the fabric's natural drape and integrity. A light iron on low heat can help refresh the fabric if needed. Linen's natural texture is part of its charm—slight variations in color and weave are characteristics of this beautiful material, not flaws.</p>"
      },
      {
        "label": "Certifications",
        "html": "<p>Certified Organic<br>Ethically Sourced<br>Fair Trade Certified<br>Quality Assured<br>Sustainable Materials<br>Cruelty-Free<br>Made with Care<br>Eco-Friendly Production</p>"
      },
      {
        "label": "Shipping & Returns",
        "html": "<p>We ship orders within 2-3 business days. Standard delivery takes 5-7 business days. Express shipping is available at checkout for faster delivery.<br><br>Items can be returned within 30 days of purchase in original condition with tags attached. Return shipping is free on orders over $75. Refunds are processed within 5-7 business days of receiving your return.</p>"
      }
    ]
  },
  "wren-coat": {
    "title": "The Wren Coat",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "$286",
    "priceSave": "",
    "descPara": "The Wren Coat is a clean longline outer layer that brings structure and warmth to cooler days. Designed in a rich camel wool-blend, it has a classic tailored silhouette, notched lapel, and a longer length that instantly sharpens whatever you wear underneath.",
    "bullets": [
      "Longline silhouette",
      "Notched lapel",
      "Wool-blend feel",
      "Clean tailored shape",
      "Cool-weather layer"
    ],
    "stylingTip": "Wear it over fine knits, crisp shirting, or easy trousers for a timeless cold-weather look.",
    "images": [
      "./assets/images/products/product-wren-coat.png",
      "./assets/images/products/product-wren-coat-hover.png",
      "./assets/images/products/product-wren-coat-alt2.png",
      "./assets/images/products/product-wren-coat-alt3.png"
    ],
    "tabs": [
      {
        "label": "Description",
        "html": "<p>This coat is finished with a soft camel wool-blend that holds its shape while staying comfortable to wear all day. The blend resists wrinkling and keeps its structure through repeated wear, making it a dependable outer layer for the whole season.</p>"
      },
      {
        "label": "Materials & Care",
        "html": "<p>Made from a wool-blend fabric chosen for warmth without excess bulk. The blend is milled to hold a clean drape while remaining soft against layers underneath.<br><br>Dry clean only. Store on a wide hanger to help the shoulders keep their shape, and steam rather than iron directly to refresh the fabric between wears.</p>"
      },
      {
        "label": "Certifications",
        "html": "<p>Responsibly Sourced Wool<br>Ethically Sourced<br>Fair Trade Certified<br>Quality Assured<br>Made with Care</p>"
      },
      {
        "label": "Shipping & Returns",
        "html": "<p>We ship orders within 2-3 business days. Standard delivery takes 5-7 business days. Express shipping is available at checkout for faster delivery.<br><br>Items can be returned within 30 days of purchase in original condition with tags attached. Return shipping is free on orders over $75. Refunds are processed within 5-7 business days of receiving your return.</p>"
      }
    ]
  },
  "ceru-knit": {
    "title": "The Ceru Knit",
    "material": "Organic cotton",
    "priceCompare": null,
    "priceSale": "$148",
    "priceSave": "",
    "descPara": "The Ceru Knit is a soft textured sweater with an easy, relaxed shape. Made in a warm ivory knit, it features a classic crew neckline, dropped shoulders, and a slightly cropped length that works beautifully with tailored or relaxed bottoms.",
    "bullets": [
      "Relaxed fit",
      "Crew neckline",
      "Dropped shoulders",
      "Textured knit",
      "Slightly cropped length"
    ],
    "stylingTip": "It’s an effortless knit that adds warmth and softness without overwhelming the rest of the look.",
    "images": [
      "./assets/images/products/product-ceru-knit.png",
      "./assets/images/products/product-ceru-knit-hover.png",
      "./assets/images/products/product-ceru-knit-alt2.png"
    ],
    "tabs": [
      {
        "label": "Description",
        "html": "<p>Crafted from premium linen, this piece offers natural breathability and a relaxed elegance. Linen's inherent texture creates a beautifully lived-in look that softens with every wear, while its lightweight construction makes it perfect for warm weather. The fabric drapes gracefully, providing comfortable movement throughout your day. Easy to care for and designed to develop character over time, this linen essential is a timeless addition to any wardrobe.</p>"
      },
      {
        "label": "Materials & Care",
        "html": "<p>Our pieces are crafted from premium linen sourced from European mills known for their commitment to quality and sustainable practices. Linen is a natural, breathable fabric that becomes softer and more comfortable with every wear, making it an ideal choice for timeless pieces like this skirt.<br><br>To keep your linen garment looking its best, we recommend gentle machine washing in cool water or hand washing with mild detergent. Lay flat to dry to maintain the fabric's natural drape and integrity. A light iron on low heat can help refresh the fabric if needed. Linen's natural texture is part of its charm—slight variations in color and weave are characteristics of this beautiful material, not flaws.</p>"
      },
      {
        "label": "Certifications",
        "html": "<p>Certified Organic<br>Ethically Sourced<br>Fair Trade Certified<br>Quality Assured<br>Sustainable Materials<br>Cruelty-Free<br>Made with Care<br>Eco-Friendly Production</p>"
      },
      {
        "label": "Shipping & Returns",
        "html": "<p>We ship orders within 2-3 business days. Standard delivery takes 5-7 business days. Express shipping is available at checkout for faster delivery.<br><br>Items can be returned within 30 days of purchase in original condition with tags attached. Return shipping is free on orders over $75. Refunds are processed within 5-7 business days of receiving your return.</p>"
      }
    ]
  },
  "hana-overshirt": {
    "title": "The Hana Overshirt",
    "material": "Organic cotton",
    "priceCompare": null,
    "priceSale": "$164",
    "priceSave": "",
    "descPara": "The Hana Overshirt is a lightweight layer that sits perfectly between shirt and jacket. Cut in a soft taupe woven fabric, it has an oversized silhouette, chest pocket detail, and an easy drape that makes it ideal for transitional dressing.",
    "bullets": [
      "Oversized fit",
      "Lightweight woven feel",
      "Chest pocket detail",
      "Relaxed drape",
      "Transitional layer"
    ],
    "stylingTip": "Wear it open over a simple tee or buttoned up as a softer alternative to a jacket.",
    "images": [
      "./assets/images/products/product-hana-overshirt.png",
      "./assets/images/products/product-hana-overshirt-hover.png",
      "./assets/images/products/product-hana-overshirt-alt2.png"
    ],
    "tabs": [
      {
        "label": "Description",
        "html": "<p>Crafted from premium linen, this piece offers natural breathability and a relaxed elegance. Linen's inherent texture creates a beautifully lived-in look that softens with every wear, while its lightweight construction makes it perfect for warm weather. The fabric drapes gracefully, providing comfortable movement throughout your day. Easy to care for and designed to develop character over time, this linen essential is a timeless addition to any wardrobe.</p>"
      },
      {
        "label": "Materials & Care",
        "html": "<p>Our pieces are crafted from premium linen sourced from European mills known for their commitment to quality and sustainable practices. Linen is a natural, breathable fabric that becomes softer and more comfortable with every wear, making it an ideal choice for timeless pieces like this skirt.<br><br>To keep your linen garment looking its best, we recommend gentle machine washing in cool water or hand washing with mild detergent. Lay flat to dry to maintain the fabric's natural drape and integrity. A light iron on low heat can help refresh the fabric if needed. Linen's natural texture is part of its charm—slight variations in color and weave are characteristics of this beautiful material, not flaws.</p>"
      },
      {
        "label": "Certifications",
        "html": "<p>Certified Organic<br>Ethically Sourced<br>Fair Trade Certified<br>Quality Assured<br>Sustainable Materials<br>Cruelty-Free<br>Made with Care<br>Eco-Friendly Production</p>"
      },
      {
        "label": "Shipping & Returns",
        "html": "<p>We ship orders within 2-3 business days. Standard delivery takes 5-7 business days. Express shipping is available at checkout for faster delivery.<br><br>Items can be returned within 30 days of purchase in original condition with tags attached. Return shipping is free on orders over $75. Refunds are processed within 5-7 business days of receiving your return.</p>"
      }
    ]
  },
  "lark-jacket": {
    "title": "The Lark Jacket",
    "material": "Organic cotton",
    "priceCompare": null,
    "priceSale": "$204",
    "priceSave": "",
    "descPara": "The Lark Jacket is a utility-inspired layer with a clean, modern edge. Made in a charcoal woven fabric, it features an oversized shirt-jacket silhouette, a structured collar, and large patch pockets that balance ease with function.",
    "bullets": [
      "Oversized fit",
      "Shirt-jacket silhouette",
      "Structured collar",
      "Patch pocket detail",
      "Charcoal woven texture"
    ],
    "stylingTip": "Style it over a simple tee and trousers for a look that feels grounded, practical, and quietly cool.",
    "images": [
      "./assets/images/products/product-lark-jacket.png",
      "./assets/images/products/product-lark-jacket-hover.png",
      "./assets/images/products/product-lark-jacket-alt2.png",
      "./assets/images/products/product-lark-jacket-alt3.png"
    ],
    "tabs": [
      {
        "label": "Description",
        "html": "<p>Crafted from premium linen, this piece offers natural breathability and a relaxed elegance. Linen's inherent texture creates a beautifully lived-in look that softens with every wear, while its lightweight construction makes it perfect for warm weather. The fabric drapes gracefully, providing comfortable movement throughout your day. Easy to care for and designed to develop character over time, this linen essential is a timeless addition to any wardrobe.</p>"
      },
      {
        "label": "Materials & Care",
        "html": "<p>Our pieces are crafted from premium linen sourced from European mills known for their commitment to quality and sustainable practices. Linen is a natural, breathable fabric that becomes softer and more comfortable with every wear, making it an ideal choice for timeless pieces like this skirt.<br><br>To keep your linen garment looking its best, we recommend gentle machine washing in cool water or hand washing with mild detergent. Lay flat to dry to maintain the fabric's natural drape and integrity. A light iron on low heat can help refresh the fabric if needed. Linen's natural texture is part of its charm—slight variations in color and weave are characteristics of this beautiful material, not flaws.</p>"
      },
      {
        "label": "Certifications",
        "html": "<p>Certified Organic<br>Ethically Sourced<br>Fair Trade Certified<br>Quality Assured<br>Sustainable Materials<br>Cruelty-Free<br>Made with Care<br>Eco-Friendly Production</p>"
      },
      {
        "label": "Shipping & Returns",
        "html": "<p>We ship orders within 2-3 business days. Standard delivery takes 5-7 business days. Express shipping is available at checkout for faster delivery.<br><br>Items can be returned within 30 days of purchase in original condition with tags attached. Return shipping is free on orders over $75. Refunds are processed within 5-7 business days of receiving your return.</p>"
      }
    ]
  },
  "eno-cardigan": {
    "title": "The Eno Cardigan",
    "material": "Organic cotton",
    "priceCompare": null,
    "priceSale": "$188",
    "priceSave": "",
    "descPara": "The Eno Cardigan is an easy oversized layer that brings softness and warmth to everyday dressing. Knit in a light stone yarn, it has an open front, a longer line, and a relaxed shape that feels effortless over shirting, knits, and tees.",
    "bullets": [
      "Oversized fit",
      "Open-front design",
      "Longer length",
      "Soft chunky knit",
      "Easy everyday layer"
    ],
    "stylingTip": "It’s the kind of cardigan you’ll reach for over and over when you want something comfortable, clean, and unfussy.",
    "images": [
      "./assets/images/products/product-eno-cardigan.png",
      "./assets/images/products/product-eno-cardigan-hover.png",
      "./assets/images/products/product-eno-cardigan-alt2.png",
      "./assets/images/products/product-eno-cardigan-alt3.png"
    ],
    "tabs": [
      {
        "label": "Description",
        "html": "<p>Crafted from premium linen, this piece offers natural breathability and a relaxed elegance. Linen's inherent texture creates a beautifully lived-in look that softens with every wear, while its lightweight construction makes it perfect for warm weather. The fabric drapes gracefully, providing comfortable movement throughout your day. Easy to care for and designed to develop character over time, this linen essential is a timeless addition to any wardrobe.</p>"
      },
      {
        "label": "Materials & Care",
        "html": "<p>Our pieces are crafted from premium linen sourced from European mills known for their commitment to quality and sustainable practices. Linen is a natural, breathable fabric that becomes softer and more comfortable with every wear, making it an ideal choice for timeless pieces like this skirt.<br><br>To keep your linen garment looking its best, we recommend gentle machine washing in cool water or hand washing with mild detergent. Lay flat to dry to maintain the fabric's natural drape and integrity. A light iron on low heat can help refresh the fabric if needed. Linen's natural texture is part of its charm—slight variations in color and weave are characteristics of this beautiful material, not flaws.</p>"
      },
      {
        "label": "Certifications",
        "html": "<p>Certified Organic<br>Ethically Sourced<br>Fair Trade Certified<br>Quality Assured<br>Sustainable Materials<br>Cruelty-Free<br>Made with Care<br>Eco-Friendly Production</p>"
      },
      {
        "label": "Shipping & Returns",
        "html": "<p>We ship orders within 2-3 business days. Standard delivery takes 5-7 business days. Express shipping is available at checkout for faster delivery.<br><br>Items can be returned within 30 days of purchase in original condition with tags attached. Return shipping is free on orders over $75. Refunds are processed within 5-7 business days of receiving your return.</p>"
      }
    ]
  },
  "elegant-check-blazer": {
    "title": "Elegant Check Blazer",
    "material": "Wool-blend twill",
    "priceCompare": null,
    "priceSale": "From €895,00",
    "priceSave": "",
    "descPara": "The Elegant Check Blazer pairs a classic check weave with a sharp, tailored cut. Finished with peak lapels and a structured shoulder, it layers easily over tailored trousers for a polished formal look.",
    "bullets": ["Tailored fit", "Peak lapel", "Check wool-blend weave", "Structured shoulder", "Formal tailoring"],
    "stylingTip": "Pair with beige tailored trousers and a crisp white shirt for a refined, eco-friendly formal look.",
    "images": [
      "./assets/images/pollheim/image161_2_1_590x_crop_center.jpg",
      "./assets/images/pollheim/Elegant_Check_Blazer_590x_crop_center.jpg",
      "./assets/images/pollheim/Elegant_Check_Blazer_close_up_on_sleeve_and_buttons_590x_crop_center.png",
      "./assets/images/pollheim/Elegant_Check_Blazer_close_up_on_lapels_and_pockets_590x_crop_center.png",
      "./assets/images/pollheim/Untitleddesign_22_1_1_590x_crop_center.png"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>Checked suit blazer paired beautifully with tailored trousers, showcasing eco-friendly, high-end tailoring perfect for formal elegance.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend twill milled for a clean drape and lasting structure. Dry clean only; store on a wide hanger to keep the shoulders in shape.</p>" },
      { "label": "Certifications", "html": "<p>Responsibly Sourced Wool<br>Ethically Sourced<br>Quality Assured</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "burgundy-blazer": {
    "title": "Casual Blazer & Casual Draw Pant",
    "material": "Cotton-blend",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "A relaxed burgundy blazer matched with a black drawstring trouser — an easy, modern two-piece that moves between casual and smart-casual settings.",
    "bullets": ["Relaxed fit", "Drawstring waist trouser", "Soft cotton-blend", "Two-piece coordinated set", "Smart-casual"],
    "stylingTip": "Wear the blazer open over a plain tee, or the trousers on their own with a knit for a softer everyday look.",
    "images": [
      "./assets/images/pollheim/image161_3_1_590x_crop_center.jpg",
      "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_590x_crop_center.jpg",
      "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_close_up_on_Blazer_590x_crop_center.jpg",
      "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_close_up_on_sleeve_and_button_590x_crop_center.jpg",
      "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_close_up_on_peak_lapels_590x_crop_center.jpg",
      "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_close_up_on_Trousers_590x_crop_center.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A relaxed, comfortable two-piece cut from a soft cotton-blend for easy everyday wear.</p>" },
      { "label": "Materials & Care", "html": "<p>Machine washable cotton-blend. Wash cool, lay flat to dry, and iron on low heat if needed.</p>" },
      { "label": "Certifications", "html": "<p>Ethically Sourced<br>Quality Assured<br>Made with Care</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "classic-mens-shoes": {
    "title": "Lether classic men's shoes",
    "material": "Genuine leather",
    "priceCompare": null,
    "priceSale": "€245,00",
    "priceSave": "",
    "descPara": "A timeless leather derby shoe with a clean round toe and stacked leather sole — built to pair with tailoring from the office to formal evenings.",
    "bullets": ["Genuine leather upper", "Round toe silhouette", "Stacked leather sole", "Classic lace-up", "Formal & versatile"],
    "stylingTip": "Match with wool trousers and a leather belt in the same tone for a coordinated, polished finish.",
    "images": [
      "./assets/images/pollheim/Letherclassicmen_sshoes_4_590x_crop_center.jpg",
      "./assets/images/pollheim/Letherclassicmen_sshoes_3_590x_crop_center.jpg",
      "./assets/images/pollheim/Letherclassicmen_sshoes_2_590x_crop_center.jpg",
      "./assets/images/pollheim/Letherclassicmen_sshoes_1_590x_crop_center.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A classic leather derby shoe finished with a durable stacked sole and clean stitching throughout.</p>" },
      { "label": "Materials & Care", "html": "<p>Genuine leather upper. Wipe clean and condition regularly; use a shoe tree to help the leather keep its shape.</p>" },
      { "label": "Certifications", "html": "<p>Ethically Sourced<br>Quality Assured</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "belt-lace-black": {
    "title": "Women's belt-lace in black",
    "material": "Leather",
    "priceCompare": null,
    "priceSale": "€29,00",
    "priceSave": "",
    "descPara": "A slim black leather belt with a delicate lace-through buckle detail — a simple finishing touch for tailored waists and dresses alike.",
    "bullets": ["Slim silhouette", "Leather construction", "Lace-through buckle", "Versatile black tone"],
    "stylingTip": "Cinch it over a blazer or a dress to add definition at the waist.",
    "images": [
      "./assets/images/pollheim/image161_1_590x_crop_center.jpg",
      "./assets/images/pollheim/img_0047-kopyia-1500x2251_1_590x_crop_center.jpg",
      "./assets/images/pollheim/img_0045-kopyia-1500x2250_1_590x_crop_center.jpg",
      "./assets/images/pollheim/img_0035-kopyia-1500x2250_1_590x_crop_center.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A slim leather belt with a lace-through buckle, designed as an easy finishing accessory.</p>" },
      { "label": "Materials & Care", "html": "<p>Leather construction. Wipe clean with a soft, dry cloth.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "draw-pant-blazer": {
    "title": "Casual Draw Pant & Casual Blazer",
    "material": "Cotton-blend",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "An easy coordinated set built for warm-weather tailoring — a relaxed blazer and drawstring trouser cut from the same breathable cotton-blend.",
    "bullets": ["Coordinated two-piece", "Drawstring waist", "Breathable cotton-blend", "Relaxed tailored fit"],
    "stylingTip": "Wear the set together for a clean, tonal look or split the pieces into the rest of your wardrobe.",
    "images": [
      "./assets/images/pollheim/image164_1_590x_crop_center.jpg",
      "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_close_up_on_Trousers_590x_crop_center.jpg",
      "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_590x_crop_center.jpg",
      "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_close_up_on_Blazer_590x_crop_center.jpg",
      "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_close_up_on_sleeve_and_button_590x_crop_center.jpg",
      "./assets/images/pollheim/Burgundy_Casual_Blazer_Black_Casual_Draw_Pant_close_up_on_peak_lapels_590x_crop_center.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A breathable coordinated set designed for warm-weather tailoring, cut for easy movement.</p>" },
      { "label": "Materials & Care", "html": "<p>Machine washable cotton-blend. Wash cool, lay flat to dry.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "luxe-summer-blazer": {
    "title": "Luxe Summer Blazer",
    "material": "Linen-blend",
    "priceCompare": null,
    "priceSale": "€425,00",
    "priceSave": "",
    "descPara": "A lightweight linen-blend blazer built for warm-weather tailoring, with a soft unstructured shoulder and a breathable open weave.",
    "bullets": ["Unstructured shoulder", "Breathable linen-blend", "Half-lined for summer wear", "Notched lapel"],
    "stylingTip": "Wear open over a plain tee with tailored shorts or trousers for an easy summer look.",
    "images": [
      "./assets/images/pollheim/Luxe_Summer_Blazer_588x_crop_center.jpg",
      "./assets/images/pollheim/POLLHEIM_3_588x_crop_center.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A lightweight, half-lined blazer cut from a breathable linen-blend for warm-weather tailoring.</p>" },
      { "label": "Materials & Care", "html": "<p>Linen-blend weave. Dry clean recommended; steam to refresh between wears.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "classic-navy-blazer": {
    "title": "Classic Navy Blazer",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "€450,00",
    "priceSave": "",
    "descPara": "A wardrobe staple cut from a fine navy wool-blend, with clean lines and a structured shoulder that works equally well dressed up or down.",
    "bullets": ["Structured shoulder", "Notched lapel", "Navy wool-blend", "Single-breasted"],
    "stylingTip": "The easiest layer in the collection — wear it over anything from a shirt to a simple knit.",
    "images": [
      "./assets/images/pollheim/Untitleddesign_17_1_1_588x_crop_center.png",
      "./assets/images/pollheim/Untitleddesign_18_1_1_588x_crop_center.png"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A classic single-breasted navy blazer, tailored from a fine wool-blend for year-round wear.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend fabric. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "green-double-breasted-blazer": {
    "title": "Green Double-Breasted Blazer",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "€495,00",
    "priceSave": "",
    "descPara": "A statement double-breasted blazer in a rich green wool-blend, finished with horn-style buttons and a sharp peak lapel.",
    "bullets": ["Double-breasted front", "Peak lapel", "Horn-style buttons", "Rich green wool-blend"],
    "stylingTip": "Let it be the focal point — pair with neutral trousers and keep the rest of the look simple.",
    "images": [
      "./assets/images/pollheim/Green_Double-Breasted_Blazer_588x_crop_center.png",
      "./assets/images/pollheim/Green_Double-Breasted_Blazer_close_up_on_buttons_588x_crop_center.png"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A statement double-breasted blazer finished with horn-style buttons and a sharp peak lapel.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend fabric. Dry clean only.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "tailored-wool-blazer": {
    "title": "Tailored Wool Blazer",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "€410,00",
    "priceSave": "",
    "descPara": "A refined tailored blazer in a soft wool-blend, cut close to the body with a clean notched lapel for a modern, sharp silhouette.",
    "bullets": ["Close tailored fit", "Notched lapel", "Soft wool-blend", "Single-breasted"],
    "stylingTip": "Wear with matching trousers for a full suited look, or on its own over dark denim.",
    "images": [
      "./assets/images/pollheim/Untitleddesign_20_1_1_588x_crop_center.png",
      "./assets/images/pollheim/Untitleddesign_21_1_1_588x_crop_center.png"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A refined tailored blazer cut from a soft wool-blend for a modern, sharp silhouette.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend fabric. Dry clean only; steam to refresh between wears.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  }
};

  const modal = document.getElementById("quickViewModal");
  const overlay = document.getElementById("quickViewOverlay");
  const closeBtn = document.getElementById("quickViewClose");
  if (!modal || !overlay) return;

  const scrollEl = modal.querySelector(".product-modal__scroll");
  const titleEl = document.getElementById("quickViewTitle");
  const priceEl = document.getElementById("quickViewPrice");
  const galleryEl = document.getElementById("quickViewMainSwiper");
  const galleryWrapperEl = document.getElementById("quickViewGalleryWrapper");
  const galleryPaginationEl = document.getElementById("quickViewGalleryPagination");
  let gallerySwiper = null;
  const galleryMobileMQ = window.matchMedia("(max-width: 1023px)");
  const garmentGroupEl = document.getElementById("quickViewGarmentGroup");
  const garmentOptionsEl = document.getElementById("quickViewGarmentOptions");
  const colorLabelEl = document.getElementById("quickViewColorLabel");
  const swatchesEl = document.getElementById("quickViewSwatches");
  const sizeLabelEl = document.getElementById("quickViewSizeLabel");
  const sizeOptionsEl = document.getElementById("quickViewSizeOptions");
  const stockTextEl = document.getElementById("quickViewStockText");
  const inCartEl = document.getElementById("quickViewInCart");
  const qtyInput = document.getElementById("quickViewQty");
  const addToCartBtn = document.getElementById("quickViewAddToCart");
  const buyNowBtn = document.getElementById("quickViewBuyNow");
  const visitLinkEl = modal.querySelector(".product-modal__visit-link");

  // a photographed fabric swatch where we have one, otherwise a plain color
  // chip standing in for it
  const SWATCH_IMAGES = {
    Camel: "swatch-camel.png", Rose: "swatch-rose.png", Burgundy: "swatch-burgundy.png",
    Black: "swatch-black.png", White: "swatch-white.png", Brown: "swatch-brown.png",
    Beige: "swatch-beige.png", Green: "swatch-green.png", Teal: "swatch-teal.png",
    Jasper: "swatch-jasper.png", Brick: "swatch-brick.png",
  };
  const SWATCH_FALLBACK_COLOR = {
    Navy: "#1f2a44", Grey: "#9a9a9a", Gray: "#9a9a9a", Olive: "#6b6b3a",
    Charcoal: "#3a3a3a", Tan: "#c9a879", Cream: "#f0e6d2", Blue: "#2f4d7a", Red: "#a13a2f",
  };
  // the handful of best-selling cards this site actually merchandises with
  // more than one color (matching their own product-card swatches); every
  // other product just shows the single color its title implies
  const PRODUCT_COLORS = {
    "elegant-check-blazer": ["Camel", "Rose"],
    "burgundy-blazer": ["Burgundy", "Black"],
    "classic-mens-shoes": ["Black", "White"],
    "belt-lace-black": ["Black", "Brown", "Beige"],
    "draw-pant-blazer": ["Black", "Burgundy"],
  };

  // the reference sizes each product with its own real scale — jacket
  // sizing for tailoring, shoe sizing for footwear, a single "one-size" for
  // an accessory — rather than one generic S/M/L run for everything
  function sizeConfigFor(title) {
    if (/blazer|jacket|suit/i.test(title)) {
      return { label: "Size:", sizes: ["44", "46", "48", "50", "52", "54", "56", "58", "60"] };
    }
    if (/shoe/i.test(title)) {
      return { label: "Shoe size:", sizes: ["40", "41", "42", "43", "44", "45", "46"] };
    }
    if (/belt/i.test(title)) {
      return { label: "Size:", sizes: ["One-size"] };
    }
    return { label: "Size:", sizes: ["XS", "S", "M", "L", "XL"] };
  }

  // a stable, per-product stock count rather than the same number everywhere
  function stockCountFor(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    return 20 + (hash % 100);
  }

  function openModal() {
    document.body.classList.add("nav-open");
    overlay.classList.add("is-visible");
    modal.classList.add("is-open");
    if (scrollEl) scrollEl.scrollTop = 0;
  }

  function closeModal() {
    document.body.classList.remove("nav-open");
    overlay.classList.remove("is-visible");
    modal.classList.remove("is-open");
  }

  // rebuilds the gallery for the given photos, then either wires it up as a
  // swipeable Swiper carousel (below 1024px) or leaves it as the plain
  // stacked list the CSS renders by default (1024px+) — whichever this
  // viewport currently calls for
  function buildGallery(images) {
    lastGalleryImages = images;
    if (gallerySwiper) {
      gallerySwiper.destroy(true, true);
      gallerySwiper = null;
    }
    galleryWrapperEl.innerHTML = images
      .map((src) => `<div class="swiper-slide"><img src="${src}" alt=""></div>`)
      .join("");

    if (galleryMobileMQ.matches && typeof Swiper !== "undefined") {
      gallerySwiper = new Swiper(galleryEl, {
        slidesPerView: 1,
        // each photo keeps its own real aspect ratio rather than a fixed
        // box, so the carousel has to resize itself to match whichever
        // slide is currently active instead of sizing for the tallest one
        autoHeight: true,
        pagination: { el: galleryPaginationEl, clickable: true },
      });
    }
  }

  // the drawer can be resized across the 1024px line while still open (a
  // desktop window narrowed, say) — swap the gallery mode to match rather
  // than leaving a carousel stuck in the wrong layout
  let lastGalleryImages = null;
  galleryMobileMQ.addEventListener("change", () => {
    if (modal.classList.contains("is-open") && lastGalleryImages) buildGallery(lastGalleryImages);
  });

  function populateModal(id, cardImage) {
    const data = PRODUCTS[id];
    if (!data) return;

    titleEl.textContent = data.title;

    priceEl.innerHTML = data.priceCompare
      ? `<span class="product-modal__price--compare">${data.priceCompare}</span><span>${data.priceSale}</span><span class="product-modal__price--save">${data.priceSave}</span>`
      : `<span>${data.priceSale}</span>`;

    // below 1024px: a swipeable single-image-at-a-time carousel with dash
    // pagination; at 1024px+: just the photos stacked in one scrolling
    // column, no carousel at all
    buildGallery(data.images);

    // Garment only applies to jacket/blazer/suit items — shoes, belts and
    // other accessories have nothing to choose here
    const showGarment = /blazer|jacket|suit/i.test(data.title);
    garmentGroupEl.hidden = !showGarment;
    if (showGarment) {
      garmentOptionsEl.innerHTML = ["Jacket & Trousers", "Jacket Only"]
        .map((label, i) => `<button type="button" class="${i === 0 ? "is-selected" : ""}">${label}</button>`)
        .join("");
    }

    const colors = PRODUCT_COLORS[id] || [deriveGarmentAndColor(data.title).color];
    colorLabelEl.textContent = colors[0];
    swatchesEl.innerHTML = colors
      .map((color, i) => {
        const file = SWATCH_IMAGES[color];
        const style = file
          ? `background-image:url('./assets/images/pollheim/${file}')`
          : `background-color:${SWATCH_FALLBACK_COLOR[color] || "#ccc"}`;
        return `<button type="button" class="product-modal__swatch${i === 0 ? " is-active" : ""}" data-color="${color}" style="${style}" aria-label="${color}"></button>`;
      })
      .join("");

    const sizeConfig = sizeConfigFor(data.title);
    sizeLabelEl.textContent = sizeConfig.label;
    sizeOptionsEl.innerHTML = sizeConfig.sizes
      .map((size, i) => `<button type="button" class="product-modal__size-option${i === 0 ? " is-selected" : ""}">${size}</button>`)
      .join("");

    stockTextEl.textContent = `${stockCountFor(id)} products in stock`;
    qtyInput.value = 1;
    syncQtyDecrease();

    // only shown once this item is already sitting in the cart from before —
    // a fresh product just reads "Quantity:" with nothing after it
    const inCartQty = window.getCartQty ? window.getCartQty(id) : 0;
    if (inCartQty > 0) {
      inCartEl.textContent = `(In cart: ${inCartQty})`;
      inCartEl.hidden = false;
    } else {
      inCartEl.hidden = true;
    }

    // "From €895,00" uses a comma as its decimal separator; stripping
    // non-digits without accounting for that turns it into 89500 instead of
    // 895 — only treat the comma as a decimal point when it's followed by
    // exactly two digits at the end (the Euro-formatted case), otherwise
    // (the placeholder "$96" entries) just strip separators as usual
    const rawPrice = data.priceSale || "0";
    const cleanedPrice = rawPrice.replace(/[^0-9.,]/g, "");
    const priceNumber = /,\d{2}$/.test(cleanedPrice)
      ? parseFloat(cleanedPrice.replace(/\./g, "").replace(",", "."))
      : parseFloat(cleanedPrice.replace(/,/g, ""));
    addToCartBtn.dataset.id = id;
    addToCartBtn.dataset.name = data.title;
    addToCartBtn.dataset.price = priceNumber;
    addToCartBtn.dataset.image = cardImage;
  }

  // only these dedicated buttons open it — a surrounding card also carries
  // data-quick-view (read via .closest() below, falling back to the button
  // itself for standalone triggers like the trend spotlight's own "Quick
  // view" link) so this button can find its product's data, but a card's
  // own image/title links need their clicks left alone to navigate instead
  // of being swallowed by this handler
  document.querySelectorAll(".product-card__quick-view, .js-quick-view-trigger").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const source = btn.closest("[data-quick-view]") || btn;
      populateModal(source.dataset.quickView, source.dataset.image);
      openModal();
    });
  });

  garmentOptionsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    garmentOptionsEl.querySelectorAll("button").forEach((b) => b.classList.remove("is-selected"));
    btn.classList.add("is-selected");
  });

  swatchesEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".product-modal__swatch");
    if (!btn) return;
    swatchesEl.querySelectorAll(".product-modal__swatch").forEach((s) => s.classList.remove("is-active"));
    btn.classList.add("is-active");
    colorLabelEl.textContent = btn.dataset.color;
  });

  const qtyDecreaseBtn = document.getElementById("quickViewQtyDecrease");
  function syncQtyDecrease() {
    qtyDecreaseBtn.disabled = (parseInt(qtyInput.value, 10) || 1) <= 1;
  }
  modal.querySelectorAll(".product-modal__qty [data-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = btn.dataset.qty === "increase" ? current + 1 : Math.max(1, current - 1);
      syncQtyDecrease();
    });
  });

  function addCurrentToCart() {
    const { id, name, price, image } = addToCartBtn.dataset;
    const selectedSize = modal.querySelector(".product-modal__size-option.is-selected");
    const selectedGarmentBtn = garmentOptionsEl.querySelector("button.is-selected");
    const activeSwatch = swatchesEl.querySelector(".product-modal__swatch.is-active");
    const derived = deriveGarmentAndColor(name);
    const garment = selectedGarmentBtn ? selectedGarmentBtn.textContent.trim() : derived.garment;
    const color = activeSwatch ? activeSwatch.dataset.color : derived.color;
    const size = selectedSize ? selectedSize.textContent.trim() : "";
    const variant = size ? `${garment} | ${color} | ${size}` : "";
    window.dispatchEvent(
      new CustomEvent("quickview:addtocart", {
        detail: {
          id,
          name,
          price: parseFloat(price),
          image,
          variant,
          qty: parseInt(qtyInput.value, 10) || 1,
        },
      })
    );
  }

  addToCartBtn.addEventListener("click", () => {
    addCurrentToCart();
    closeModal();
  });

  // this static build has no real checkout to send "Buy it now" to — it
  // lands in the same place Add to cart does, straight into the cart drawer
  buyNowBtn.addEventListener("click", () => {
    addCurrentToCart();
    closeModal();
  });

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  // the modal's own transparent backdrop area sits above the overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
})();

(function () {
  const triggers = document.querySelectorAll(".product-modal__size-chart");
  const sizeChart = document.getElementById("sizeChartModal");
  const closeBtn = document.getElementById("sizeChartClose");
  if (!triggers.length || !sizeChart) return;

  function open() {
    sizeChart.classList.add("is-open");
    document.body.classList.add("nav-open");
  }

  function close() {
    sizeChart.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });
  });

  closeBtn.addEventListener("click", close);
  sizeChart.addEventListener("click", (e) => {
    if (e.target === sizeChart) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sizeChart.classList.contains("is-open")) close();
  });
})();

(function () {
  document.querySelectorAll(".product-modal__size-options").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".product-modal__size-option");
      if (!btn) return;
      group
        .querySelectorAll(".product-modal__size-option")
        .forEach((el) => el.classList.remove("is-selected"));
      btn.classList.add("is-selected");
    });
  });
})();

// image zoom modal — custom-built with the project's own Swiper instance
(function () {
  const modal = document.getElementById("imageZoomModal");
  const swiperEl = document.getElementById("imageZoomSwiper");
  const wrapperEl = document.getElementById("imageZoomWrapper");
  const closeBtn = document.getElementById("imageZoomClose");
  const prevBtn = document.getElementById("imageZoomPrev");
  const nextBtn = document.getElementById("imageZoomNext");
  const mainContainers = document.querySelectorAll(".product-page__main");
  if (!modal || !swiperEl || !mainContainers.length || typeof Swiper === "undefined") return;

  let zoomSwiper = null;

  function open(images, startIndex) {
    wrapperEl.innerHTML = images
      .map(
        (src) => `
        <div class="swiper-slide">
          <div class="swiper-zoom-container">
            <img src="${src}" alt="">
          </div>
        </div>`
      )
      .join("");

    if (zoomSwiper) zoomSwiper.destroy(true, true);
    zoomSwiper = new Swiper(swiperEl, {
      zoom: { maxRatio: 3 },
      initialSlide: startIndex || 0,
      navigation: { nextEl: nextBtn, prevEl: prevBtn },
      speed: 250,
    });

    zoomSwiper.on("zoomChange", (swiper, scale, imageEl) => {
      const container = imageEl && imageEl.closest(".swiper-zoom-container");
      if (!container) return;
      container.classList.toggle("swiper-zoom-container--zoomed", scale > 1);
    });

    wrapperEl.querySelectorAll(".swiper-zoom-container img").forEach((img) => {
      let downX = 0;
      let downY = 0;
      img.addEventListener("pointerdown", (e) => {
        downX = e.clientX;
        downY = e.clientY;
      });
      img.addEventListener("click", (e) => {
        const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
        if (moved < 10) zoomSwiper.zoom.toggle(e);
      });
    });

    modal.classList.add("is-open");
    document.body.classList.add("nav-open");
  }

  function close() {

    if (zoomSwiper && window.quickViewGallery) {
      window.quickViewGallery.index = zoomSwiper.activeIndex;
      window.dispatchEvent(
        new CustomEvent("zoommodal:close", { detail: { index: zoomSwiper.activeIndex } })
      );
    }

    modal.classList.remove("is-open");
    document.body.classList.remove("nav-open");

    const swiperToDestroy = zoomSwiper;
    zoomSwiper = null;
    setTimeout(() => swiperToDestroy && swiperToDestroy.destroy(true, true), 333);
  }

  mainContainers.forEach((container) => {
    container.addEventListener("click", (e) => {
      if (e.target.tagName !== "IMG") return;
      if (!window.quickViewGallery) return;
      open(window.quickViewGallery.images, window.quickViewGallery.index);
    });
  });

  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) close();
  });
})();

(function () {
  const thumbsEl = document.getElementById("productThumbsSwiper");
  const mainEl = document.getElementById("productMainSwiper");
  if (!thumbsEl || !mainEl || typeof Swiper === "undefined") return;

  window.quickViewGallery = {
    images: [...mainEl.querySelectorAll(".swiper-slide img")].map((img) => img.src),
    index: 0,
  };

  requestAnimationFrame(() => {
    const thumbsSwiper = new Swiper(thumbsEl, {
      direction: "vertical",
      slidesPerView: "auto",
      spaceBetween: 12,
      freeMode: true,
      watchSlidesProgress: true,
      mousewheel: { forceToAxis: true },
    });

    const mainSwiper = new Swiper(mainEl, {
      speed: 300,
      autoHeight: true,
      thumbs: { swiper: thumbsSwiper },
      navigation: {
        prevEl: document.getElementById("productMainPrev"),
        nextEl: document.getElementById("productMainNext"),
      },
      pagination: {
        // the quick-view modal on this page has a pagination element of the same class and comes first in the DOM,
        // so look inside this gallery's own column instead of the whole document
        el: mainEl.closest(".product-page__main-col").querySelector(".product-page__main-pagination"),
        clickable: true,
      },
    });

    mainSwiper.on("slideChange", () => {
      window.quickViewGallery.index = mainSwiper.activeIndex;
    });

    window.addEventListener("zoommodal:close", (e) => {
      mainSwiper.slideTo(e.detail.index);
    });
    const mainColEl = mainEl.closest(".product-page__main-col");
    function syncThumbsHeight() {
      if (!mainColEl) return;
      thumbsEl.style.height = mainColEl.offsetHeight + "px";
      thumbsSwiper.update();
    }
    syncThumbsHeight();
    mainSwiper.on("slideChange", syncThumbsHeight);
    mainSwiper.on("transitionEnd", syncThumbsHeight);
    mainSwiper.on("autoHeight", syncThumbsHeight);
    window.addEventListener("resize", syncThumbsHeight);

    // mobile-only zoom button
    const zoomBtn = document.getElementById("productMainZoom");
    zoomBtn &&
      zoomBtn.addEventListener("click", () => {
        const activeImg = mainEl.querySelector(".swiper-slide-active img");
        if (activeImg) activeImg.click();
      });
  });
})();

(function () {
  const btn = document.getElementById("productAddToCart");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const { id, name, price, image } = btn.dataset;
    window.dispatchEvent(
      new CustomEvent("quickview:addtocart", {
        detail: { id, name, price: parseFloat(price), image },
      })
    );
  });
})();

// testimonials carousel
(function () {
  const el = document.querySelector(".testimonials__slider");
  if (!el || typeof Swiper === "undefined") return;

  new Swiper(el, {
    slidesPerView: "auto",
    centeredSlides: true,
    loop: true,
    grabCursor: true,
    pagination: {
      el: document.querySelector(".testimonials__pagination"),
      clickable: true,
    },
  });
})();

// faq page: category tabs + live search across all questions
(function () {
  const tabs = document.querySelectorAll(".faq-page__tab");
  const panels = document.querySelectorAll(".faq-page__panel");
  const panelsWrap = document.getElementById("faqPanels");
  if (!tabs.length || !panels.length || !panelsWrap) return;

  function activateTab(tab) {
    tabs.forEach((t) => t.classList.remove("is-active"));
    panels.forEach((p) => (p.hidden = true));
    tab.classList.add("is-active");
    document.getElementById(tab.dataset.tab).hidden = false;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
  });

  const searchInput = document.getElementById("faqSearch");
  const tabsWrap = document.getElementById("faqTabs");
  const noResults = document.getElementById("faqNoResults");
  const allItems = document.querySelectorAll(".faq-page__item");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();

      if (!query) {
        tabsWrap.hidden = false;
        panelsWrap.classList.remove("is-filtered");
        const activeTab = document.querySelector(".faq-page__tab.is-active") || tabs[0];
        activateTab(activeTab);
        allItems.forEach((item) => (item.hidden = false));
        noResults.hidden = true;
        return;
      }

      tabsWrap.hidden = true;
      panelsWrap.classList.add("is-filtered");
      panels.forEach((p) => (p.hidden = false));

      let matchCount = 0;
      allItems.forEach((item) => {
        const matches = item.textContent.toLowerCase().includes(query);
        item.hidden = !matches;
        if (matches) matchCount++;
      });
      noResults.hidden = matchCount > 0;
    });
  }
})();

// find a store page: region tabs + live search across all locations
(function () {
  const tabs = document.querySelectorAll(".store-page__tab");
  const panels = document.querySelectorAll(".store-page__panel");
  const panelsWrap = document.getElementById("storePanels");
  if (!tabs.length || !panels.length || !panelsWrap) return;

  function activateTab(tab) {
    tabs.forEach((t) => t.classList.remove("is-active"));
    panels.forEach((p) => (p.hidden = true));
    tab.classList.add("is-active");
    document.getElementById(tab.dataset.tab).hidden = false;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
  });

  const searchInput = document.getElementById("storeSearch");
  const tabsWrap = document.getElementById("storeTabs");
  const noResults = document.getElementById("storeNoResults");
  const allCards = document.querySelectorAll(".store-page__card");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();

      if (!query) {
        tabsWrap.hidden = false;
        panelsWrap.classList.remove("is-filtered");
        const activeTab = document.querySelector(".store-page__tab.is-active") || tabs[0];
        activateTab(activeTab);
        allCards.forEach((card) => (card.hidden = false));
        noResults.hidden = true;
        return;
      }

      tabsWrap.hidden = true;
      panelsWrap.classList.add("is-filtered");
      panels.forEach((p) => (p.hidden = false));

      let matchCount = 0;
      allCards.forEach((card) => {
        const matches = card.textContent.toLowerCase().includes(query);
        card.hidden = !matches;
        if (matches) matchCount++;
      });
      noResults.hidden = matchCount > 0;
    });
  }
})();

// shipping & returns policy page: Shipping / Returns tabs
(function () {
  const tabs = document.querySelectorAll(".policy-page__tab");
  const panels = document.querySelectorAll(".policy-page__panel");
  if (!tabs.length || !panels.length) return;

  function activateTab(tab) {
    tabs.forEach((t) => t.classList.remove("is-active"));
    panels.forEach((p) => (p.hidden = true));
    tab.classList.add("is-active");
    document.getElementById(tab.dataset.tab).hidden = false;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
  });
})();


// welcome popup: shown once, when a visitor lands on the site for the first time (any page)
(function () {
  const STORAGE_KEY = "Tailor-welcome-popup-seen";
  const SHOW_DELAY = 2000;

  // no readable storage (e.g. blocked cookies) means we can't remember the visit, so don't nag
  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
  } catch (err) {
    return;
  }

  const popup = document.createElement("div");
  popup.className = "welcome-popup";
  popup.setAttribute("aria-hidden", "true");
  popup.innerHTML = `
    <div class="welcome-popup__inner" role="dialog" aria-modal="true" aria-labelledby="welcomePopupTitle" tabindex="-1">
      <button type="button" class="welcome-popup__close" aria-label="Close">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m1 1 18 18M19 1 1 19" stroke="currentColor" stroke-width="1.6" />
        </svg>
      </button>
      <h2 class="welcome-popup__title" id="welcomePopupTitle">Welcome to Tailor</h2>
      <p class="welcome-popup__text">Sign up to receive 10% off your first order, plus early access to new arrivals and seasonal edits.</p>
      <form class="welcome-popup__form">
        <input type="email" placeholder="Enter your email" aria-label="Email address" required>
        <button type="submit" class="btn welcome-popup__submit">Subscribe</button>
      </form>
      <a href="look-book.html" class="btn welcome-popup__lookbook">View the lookbook</a>
    </div>`;
  document.body.appendChild(popup);

  const inner = popup.querySelector(".welcome-popup__inner");
  const closeBtn = popup.querySelector(".welcome-popup__close");
  const form = popup.querySelector(".welcome-popup__form");
  let previousFocus = null;

  function open() {
    // another overlay (mobile menu, cart, quick view...) is already open: wait for it to close
    if (document.body.classList.contains("nav-open")) {
      setTimeout(open, 1000);
      return;
    }

    // remembered as soon as it appears, so following the lookbook link or reloading won't show it again
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (err) {}

    previousFocus = document.activeElement;
    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("nav-open");
    inner.focus({ preventScroll: true });
  }

  function close() {
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("nav-open");
    if (previousFocus && document.contains(previousFocus)) previousFocus.focus({ preventScroll: true });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const success = document.createElement("p");
    success.className = "welcome-popup__success";
    success.setAttribute("role", "status");
    success.textContent = "Thanks for subscribing!";
    form.replaceWith(success);
  });

  closeBtn.addEventListener("click", close);
  popup.addEventListener("click", (e) => {
    if (e.target === popup) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!popup.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key !== "Tab") return;

    // keep keyboard focus inside the dialog while it is open
    const focusable = inner.querySelectorAll("button, input, a[href]");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === inner)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  setTimeout(open, SHOW_DELAY);
})();

// footer "back to top" button
(function () {
  const btn = document.getElementById("footerBackToTop");
  if (!btn) return;
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
