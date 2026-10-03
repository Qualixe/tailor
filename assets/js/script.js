// derive variant from title
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
  // word-boundary match
  const match = colors.find((c) => new RegExp(`\\b${c.toLowerCase()}\\b`).test(t));
  return { garment, color: match || "Black" };
}

// close all dropdowns
function closeHeaderDropdowns() {
  document.querySelectorAll(".header-menu__details[open]").forEach((d) => d.removeAttribute("open"));
  ["langList", "currencyList", "langListMobile", "currencyListMobile", "langListFooter", "currencyListFooter"].forEach((id) => {
    const list = document.getElementById(id);
    if (list) list.classList.remove("is-open");
  });
}

// anchor dropdown to header
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

// predictive search
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

  // search product catalog
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
    const matchedArticleCount = 0; // no articles to index

    resultProductsList.innerHTML =
      matchedProducts.map(productCardHTML).join("") ||
      '<p class="predictive-search__result-empty">No matching products.</p>';
    resultPagesList.innerHTML =
      matchedPages.map(pageItemHTML).join("") ||
      '<p class="predictive-search__result-empty">No matching pages.</p>';

    const counts = { product: matchedProducts.length, article: matchedArticleCount, page: matchedPages.length };
    tabsButtons.forEach((btn) => (btn.disabled = !counts[btn.dataset.tab]));

    // open first matching tab
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
      // filter in place
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
    // force header solid
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
    ".nav-drawer__panel, .cart-drawer, .header__currency-list, .header__lang-list, .predictive-search__form, .product-modal__inner";

  const carouselSelector = ".product-row__scroller";

  // per-frame easing multiplier
  const ease = 0.1;
  const LINE_HEIGHT = 34; // px per line
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

  // an inner element (filter list, drawer body...) that can still scroll this way
  function canScrollInside(el, deltaY) {
    for (let node = el; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
      if (node.scrollHeight <= node.clientHeight) continue;
      const overflowY = getComputedStyle(node).overflowY;
      if (overflowY !== "auto" && overflowY !== "scroll") continue;
      const atTop = node.scrollTop <= 0;
      const atBottom = Math.ceil(node.scrollTop + node.clientHeight) >= node.scrollHeight;
      if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) return true;
    }
    return false;
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
      if (canScrollInside(e.target, e.deltaY)) return;
      if (e.target.closest(carouselSelector) && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.ctrlKey) return; // allow pinch zoom

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
        // closing: animate to 0
        const startHeight = content.scrollHeight;
        content.style.height = startHeight + "px";
        if (isFooter) {
          content.style.transition =
            "height .3s cubic-bezier(.25,.46,.45,.94), opacity .3s cubic-bezier(.25,.46,.45,.94)";
          content.style.opacity = "1";
        }
        content.offsetHeight; // force reflow
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
        // opening: animate to height
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

// mobile drawer dropdowns
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
      // CSS opens upward
      if (willOpen) list.classList.add("is-open");
    });

    document.addEventListener("click", (e) => {
      if (!list.contains(e.target)) list.classList.remove("is-open");
    });
  });
})();

// mark selected option
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

    // update roll-hover label
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

// shared off-canvas drawers
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
    // recheck header state
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

  // Man/Women panels
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
        // reset to category list
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

  // mobile category drill-down
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
      // inline-style slide in
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
          // slide back out
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

// shopping cart drawer
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

  // free-shipping threshold
  const FREE_SHIPPING_THRESHOLD = 1000;

  // upsell products
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
    // hide footer on upsell
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

  // expose cart quantity
  window.getCartQty = (id) => cart.filter((item) => item.id === id).reduce((sum, item) => sum + item.qty, 0);

  // quick-view add to cart
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

// cart drawer accordions
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

// About Us dropdown
(function () {
  const items = document.querySelectorAll(".header-menu__details");
  if (!items.length) return;

  const isDesktop = () => window.matchMedia("(min-width: 1200px)").matches;

  // close when mouse leaves
  document.addEventListener("mousemove", (e) => {
    if (!isDesktop()) return;
    const details = document.querySelector(".header-menu__details[open]");
    if (!details) return;

    // sibling hover closes
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
      // desktop: click keeps open
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

// seamless ticker loop
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
(function () {
  const header = document.getElementById("siteHeader");
  const bar = document.getElementById("announcementBar");
  if (!header) return;

  const isSolidPage = header.classList.contains("header--solid");
  const heroEl = document.querySelector(".hero-slideshow, .shoppable-hero, .collection-banner");
  let holder = null;
  let solid = isSolidPage;
  let hovering = false;
  let hidden = false;
  let lastY = window.scrollY;

  // dropdown keeps header solid
  function isHeaderDropdownOpen() {
    return (
      !!document.querySelector(".header-menu__details[open]") ||
      !!document.getElementById("langList")?.classList.contains("is-open") ||
      !!document.getElementById("currencyList")?.classList.contains("is-open")
    );
  }

  // mobile: sticky solid header
  const compactMQ = window.matchMedia("(max-width: 1199px)");

  function updateOffsets() {
    const barHeight = bar ? bar.offsetHeight : 0;
    const root = document.documentElement.style;
    if (compactMQ.matches) {
      // sticks below bar
      const headerBottom = Math.max(barHeight - window.scrollY, 0) + header.offsetHeight;
      root.setProperty("--announcement-bar-height", headerBottom + "px");
      root.setProperty("--header-offset-bottom", headerBottom + "px");
      return;
    }
    // header top offset
    const effectiveGap = solid ? 0 : barHeight;
    root.setProperty("--announcement-bar-height", effectiveGap + "px");
    // drawer below header
    root.setProperty("--header-offset-bottom", effectiveGap + header.offsetHeight + "px");
  }

  // placeholder keeps space
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
    // drawer forces solid
    const drawerOpen = document.body.classList.contains("nav-open");
    const atTop = !isSolidPage && window.scrollY < heroThreshold();
    solid = isSolidPage || compactMQ.matches || drawerOpen || !atTop || isHeaderDropdownOpen();
    // hover shows background
    header.classList.toggle("is-solid", solid || hovering);
    updateOffsets();

    const y = window.scrollY;
    // hide only when solid
    if (drawerOpen) {
      hidden = false;
    } else if (solid && y > lastY && y > (bar ? bar.offsetHeight : 0) + header.offsetHeight) {
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
      // close dropdowns on scroll
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

// scroll reveal animations
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

// hero slideshow
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

  // enable entrance animations
  section.classList.add("is-ready");

  // pre-decode slide images
  section.querySelectorAll(".hero-slideshow__media").forEach((img) => {
    if (img.decode) img.decode().catch(() => {});
  });

  // progress bar timing
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

  // preview next slide
  const previews = [...section.querySelectorAll(".hero-slideshow__preview-item")];
  function syncPreview() {
    const next = (swiper.realIndex + 1) % previews.length;
    previews.forEach((item, i) => item.classList.toggle("is-active", i === next));
  }

  // only active slide focusable
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

// color swatch selection
(function () {
  document.querySelectorAll(".featured-products__slider .product-card__swatches").forEach((group) => {
    group.addEventListener("click", (e) => {
      const swatch = e.target.closest(".product-card__swatch");
      if (!swatch) return;
      group.querySelectorAll(".product-card__swatch").forEach((s) => s.classList.toggle("is-active", s === swatch));
    });
  });
})();

// trend hotspot popups
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

// collections carousel
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

  // logical index from title
  el.querySelectorAll(".collections-carousel__slide-title").forEach((title) => {
    const index = title.dataset.collectionTarget;
    title.addEventListener("mouseenter", () => showImage(index));
    title.addEventListener("click", (e) => {
      if (window.matchMedia("(min-width: 992px)").matches) e.preventDefault();
      showImage(index);
    });
  });

  // realIndex handles clones
  swiper.on("slideChange", () => showImage(swiper.realIndex));
})();

// video ticker loop
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

// video play/pause
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

  // cursor-following play button
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

// product features: hotspot shows its feature
(function () {
  const section = document.querySelector(".product-features");
  if (!section) return;

  const features = section.querySelectorAll(".product-features__feature");
  const hotspots = section.querySelectorAll(".product-features__hotspot");

  hotspots.forEach((hotspot) => {
    hotspot.addEventListener("click", () => {
      const index = hotspot.dataset.pointIndex;
      hotspots.forEach((h) => h.classList.toggle("is-active", h === hotspot));
      features.forEach((f) => f.classList.toggle("visually-hidden", f.dataset.featureIndex !== index));
    });
  });
})();

// ticker banner: clone items to fill the width, then loop by -50%
(function () {
  const section = document.querySelector(".ticker-banner");
  if (!section) return;

  const container = section.querySelector(".ticker-banner__items");
  const originals = [...container.children];
  if (!originals.length) return;

  function fill() {
    container.innerHTML = "";
    originals.forEach((item) => container.appendChild(item));
    const sectionWidth = section.offsetWidth;
    const itemsWidth = originals.reduce((sum, item) => sum + item.offsetWidth, 0);
    let copies = 1;
    if (itemsWidth > 0 && itemsWidth < sectionWidth) copies = 2 * Math.ceil(sectionWidth / itemsWidth) - 1;
    for (let i = 0; i < copies; i++) {
      originals.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        container.appendChild(clone);
      });
    }
  }

  let resizeTimer = null;
  let lastWidth = 0;
  new ResizeObserver(() => {
    if (section.offsetWidth === lastWidth) return;
    lastWidth = section.offsetWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fill, 200);
  }).observe(section);

  const start = () => {
    fill();
    lastWidth = section.offsetWidth;
    section.classList.remove("is-loading");
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();
})();

// our story: images drift up while the section is in view
(function () {
  const section = document.querySelector(".our-story");
  if (!section) return;

  const items = [...section.querySelectorAll(".our-story__item")];
  if (!items.length) return;
  const SPEED = 0.07;

  // layout offset from the document top, ignoring transforms
  const docTop = (el) => {
    let top = 0;
    for (let node = el; node; node = node.offsetParent) top += node.offsetTop;
    return top;
  };

  function update() {
    items.forEach((item) => {
      const distance = window.scrollY - docTop(item) + window.innerHeight;
      item.style.transform = `translateY(-${distance * SPEED}px)`;
    });
  }

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) document.addEventListener("scroll", update, { passive: true });
      else document.removeEventListener("scroll", update);
    });
  }).observe(section);
})();

// featured collection cards: colour swatches switch the card image
(function () {
  document.querySelectorAll(".fc-card").forEach((card) => {
    const wrappers = card.querySelectorAll(".fc-card__image-wrapper");
    const swatches = card.querySelectorAll(".fc-card__swatch");
    swatches.forEach((swatch) => {
      swatch.addEventListener("click", () => {
        const color = swatch.dataset.swatch;
        swatches.forEach((s) => s.classList.toggle("is-active", s === swatch));
        wrappers.forEach((w) => w.classList.toggle("is-active", w.dataset.image === color));
        const active = card.querySelector(".fc-card__image-wrapper.is-active .fc-card__image");
        if (active) card.dataset.image = active.getAttribute("src");
      });
    });
  });
})();

// stores locator: one store open at a time, its image shown
(function () {
  document.querySelectorAll(".stores-locator").forEach((section) => {
    const items = [...section.querySelectorAll(".stores-locator__item")];
    const maps = [...section.querySelectorAll(".stores-locator__map-wrapper")];
    let animating = false;

    const setLinksTabIndex = (body, value) =>
      body.querySelectorAll("a, button").forEach((el) => el.setAttribute("tabindex", value));

    function toggleBody(item) {
      const body = item.querySelector(".stores-locator__item-body");
      if (!body) return;
      const fullHeight = body.scrollHeight;
      if (item.classList.contains("is-active")) {
        animating = true;
        body.style.height = fullHeight + "px";
        item.setAttribute("aria-expanded", "true");
        setLinksTabIndex(body, "0");
        setTimeout(() => {
          body.removeAttribute("style");
          animating = false;
        }, 500);
      } else {
        body.style.height = fullHeight + "px";
        item.setAttribute("aria-expanded", "false");
        setLinksTabIndex(body, "-1");
        requestAnimationFrame(() => {
          body.style.height = "0";
        });
      }
    }

    section.addEventListener("click", (e) => {
      if (animating) return;
      const item = e.target.closest(".stores-locator__item");
      if (!item || item.classList.contains("is-active")) return;
      const index = item.dataset.index;
      maps.forEach((map) => map.classList.toggle("is-active", map.dataset.index === index));
      items.forEach((it) => {
        const wasActive = it.classList.contains("is-active");
        const isActive = it.dataset.index === index;
        it.classList.toggle("is-active", isActive);
        if (wasActive !== isActive) toggleBody(it);
      });
    });
  });
})();

// collection list: slider only while the cards overflow the row
(function () {
  const slider = document.querySelector(".collection-list__slider");
  if (!slider || typeof Swiper === "undefined") return;

  const count = slider.querySelectorAll(".collection-list__slide").length;
  // [media query, cards that fit without a slider]
  const fits = [
    ["(max-width: 373.98px)", 1],
    ["(max-width: 575.98px)", 2],
    ["(max-width: 767.98px)", 3],
    ["(max-width: 991.98px)", 4],
    ["(max-width: 1199.98px)", 5],
    ["(max-width: 1500.98px)", 6],
    ["(min-width: 1501px)", 8],
  ].map(([query, max]) => [window.matchMedia(query), max]);
  let swiper = null;

  function update() {
    const [, max] = fits.find(([mq]) => mq.matches);
    if (count > max) {
      if (!swiper) {
        swiper = new Swiper(slider, {
          slidesPerView: 1.2,
          spaceBetween: 16,
          navigation: {
            prevEl: slider.querySelector(".collection-list__arrow--prev"),
            nextEl: slider.querySelector(".collection-list__arrow--next"),
          },
          breakpoints: {
            374: { slidesPerView: 2.24 },
            576: { slidesPerView: 3.2 },
            768: { slidesPerView: 4.2 },
            992: { slidesPerView: 5.2 },
            1200: { slidesPerView: 6 },
            1501: { slidesPerView: 8 },
          },
        });
      }
    } else if (swiper) {
      swiper.destroy();
      swiper = null;
      slider.classList.remove("swiper-backface-hidden");
    }
  }

  window.addEventListener("resize", update);
  update();
})();

// collection page: filters, sort and grid columns (client side)
(function () {
  const section = document.querySelector(".collection");
  if (!section) return;

  const grid = section.querySelector(".collection__grid-wrapper");
  const forms = [...section.querySelectorAll("[data-filter-form]")];
  const emptyTitle = section.querySelector(".collection__title-empty");
  const resetBtn = section.querySelector("[data-filter-reset]");
  const items = [...grid.querySelectorAll(".collection__item")];
  const mediaItem = items.find((item) => item.classList.contains("collection__item--media-card"));
  const productItems = items.filter((item) => item !== mediaItem);
  const mediaIndex = items.indexOf(mediaItem);
  const PRICE_MAX = 1440;

  // accordions: animate height between 0 and content height
  section.querySelectorAll(".product-filters__form-item").forEach((item) => {
    const control = item.querySelector(".accordion__control");
    const content = item.querySelector(".accordion__content");
    control.addEventListener("click", () => {
      const open = !item.classList.contains("is-active");
      content.style.height = content.scrollHeight + "px";
      if (open) {
        item.classList.add("is-active");
        control.setAttribute("aria-expanded", "true");
        setTimeout(() => {
          if (item.classList.contains("is-active")) content.style.height = "auto";
        }, 500);
      } else {
        requestAnimationFrame(() => {
          content.style.height = "0";
          item.classList.remove("is-active");
          control.setAttribute("aria-expanded", "false");
        });
      }
    });
  });

  // grid columns
  section.querySelectorAll(".product-grid-controls__control-input").forEach((input) => {
    input.addEventListener("change", () => {
      const attr = { gridColumnCountDesktop: "desktop", gridColumnCountTablet: "tablet", gridColumnCountMobile: "mobile" }[input.name];
      grid.setAttribute(`data-grid-col-${attr}`, input.value);
    });
  });

  // keep the sidebar form and the drawer form in sync
  function mirror(source) {
    forms.forEach((form) => {
      if (form.contains(source)) return;
      if (source.type === "checkbox") {
        const twin = form.querySelector(`input[type="checkbox"][name="${source.name}"][value="${CSS.escape(source.value)}"]`);
        if (twin) twin.checked = source.checked;
      } else if (source.name) {
        const twin = form.querySelector(`[name="${source.name}"]`);
        if (twin) twin.value = source.value;
      }
    });
  }

  function priceRange() {
    const form = forms[0];
    let min = parseInt(form.querySelector('[name="price-min"]').value, 10);
    let max = parseInt(form.querySelector('[name="price-max"]').value, 10);
    if (isNaN(min)) min = 0;
    if (isNaN(max)) max = PRICE_MAX;
    return [Math.max(0, Math.min(min, max)), Math.min(PRICE_MAX, Math.max(min, max))];
  }

  function paintRange() {
    const [min, max] = priceRange();
    section.querySelectorAll(".filter-price").forEach((box) => {
      box.querySelector(".filter-price__range-input--min").value = min;
      box.querySelector(".filter-price__range-input--max").value = max;
      const track = box.querySelector(".filter-price__range-inputs");
      track.style.setProperty("--range-min", (min / PRICE_MAX) * 100 + "%");
      track.style.setProperty("--range-max", (max / PRICE_MAX) * 100 + "%");
    });
  }

  function selected() {
    const form = forms[0];
    const groups = {};
    form.querySelectorAll('input[type="checkbox"]:checked').forEach((input) => {
      (groups[input.name] = groups[input.name] || []).push(input.value);
    });
    return groups;
  }

  function apply() {
    const groups = selected();
    const [min, max] = priceRange();
    const priceActive = min > 0 || max < PRICE_MAX;
    const field = { availability: "availability", vendor: "vendor", color: "colors", size: "sizes", category: "category" };

    let visible = 0;
    productItems.forEach((item) => {
      const card = item.querySelector(".fc-card");
      const price = parseFloat(card.dataset.price);
      let show = price >= min && price <= max;
      Object.entries(groups).forEach(([name, values]) => {
        const have = (card.dataset[field[name]] || "").split("|");
        if (!values.some((v) => have.includes(v))) show = false;
      });
      item.hidden = !show;
      if (show) visible++;
    });
    if (mediaItem) mediaItem.hidden = visible === 0;
    emptyTitle.hidden = visible > 0;

    // counters
    let total = priceActive ? 1 : 0;
    section.querySelectorAll(".product-filters__form-item").forEach((item) => {
      const key = item.dataset.filter;
      const counter = item.querySelector(".product-filters__form-item-counter");
      if (!counter) return;
      const count = key === "price" ? (priceActive ? 1 : 0) : (groups[key] || []).length;
      counter.textContent = count ? ` (${count})` : "";
    });
    Object.values(groups).forEach((values) => (total += values.length));
    const badge = section.querySelector(".product-filters__open-menu-button-counter");
    badge.textContent = total ? ` (${total})` : "";
    badge.classList.toggle("is-hidden", !total);
    resetBtn.disabled = total === 0;
  }

  function sort(value) {
    const by = {
      "title-ascending": (a, b) => a.dataset.title.localeCompare(b.dataset.title),
      "title-descending": (a, b) => b.dataset.title.localeCompare(a.dataset.title),
      "price-ascending": (a, b) => a.dataset.price - b.dataset.price,
      "price-descending": (a, b) => b.dataset.price - a.dataset.price,
      "created-ascending": (a, b) => a.dataset.created - b.dataset.created,
      "created-descending": (a, b) => b.dataset.created - a.dataset.created,
    }[value];
    const ordered = by
      ? [...productItems].sort((a, b) => by(a.querySelector(".fc-card"), b.querySelector(".fc-card")))
      : productItems;
    const list = [...ordered];
    if (mediaItem) list.splice(mediaIndex, 0, mediaItem);
    list.forEach((item) => grid.appendChild(item));
  }

  section.addEventListener("change", (e) => {
    const input = e.target;
    if (input.classList.contains("sort__select")) {
      section.querySelectorAll(".sort__select").forEach((s) => (s.value = input.value));
      sort(input.value);
      return;
    }
    if (!input.closest("[data-filter-form]")) return;
    mirror(input);
    if (input.classList.contains("filter-price__input")) paintRange();
    apply();
  });

  // dragging the price thumbs updates the number fields
  section.addEventListener("input", (e) => {
    const range = e.target.closest(".filter-price__range-input");
    if (!range) return;
    const box = range.closest(".filter-price");
    const minR = box.querySelector(".filter-price__range-input--min");
    const maxR = box.querySelector(".filter-price__range-input--max");
    if (+minR.value > +maxR.value) range.value = range === minR ? maxR.value : minR.value;
    forms.forEach((form) => {
      form.querySelector('[name="price-min"]').value = minR.value;
      form.querySelector('[name="price-max"]').value = maxR.value;
    });
    paintRange();
    apply();
  });

  resetBtn.addEventListener("click", () => {
    forms.forEach((form) => {
      form.querySelectorAll('input[type="checkbox"]').forEach((input) => (input.checked = false));
      form.querySelector('[name="price-min"]').value = 0;
      form.querySelector('[name="price-max"]').value = PRICE_MAX;
    });
    paintRange();
    apply();
  });

  // mobile: once the filter button scrolls away it floats at the bottom
  const openerWrapper = section.querySelector(".product-filters__open-menu-button-wrapper");
  const opener = openerWrapper && openerWrapper.querySelector(".product-filters__open-menu-button");
  if (opener && "IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const above = openerWrapper.offsetTop + openerWrapper.offsetHeight < window.pageYOffset;
        if (entry.isIntersecting || !above) {
          opener.classList.remove("is-fixed");
          openerWrapper.style.minHeight = "auto";
        } else {
          openerWrapper.style.minHeight = openerWrapper.offsetHeight + "px";
          opener.classList.add("is-fixed");
        }
      });
    }).observe(openerWrapper);
  }

  // the drawer is a mobile/tablet control only
  const desktop = window.matchMedia("(min-width: 1200px)");
  desktop.addEventListener("change", () => {
    if (desktop.matches) document.getElementById("filterDrawerClose")?.click();
  });

  paintRange();
  apply();
})();

// product spotlight buy box (home spotlight + product page)
(function () {
  const section = document.querySelector(".product-spotlight");
  if (!section) return;

  const sliderEl = section.querySelector("#spotlightSwiper");
  const relatedEl = section.querySelector("#spotlightRelated");
  const firstSlideImg = section.querySelector(".product-spotlight__slide img");
  const desktopMainImg = section.querySelector("#spotlightMainImg");
  const colorLabel = section.querySelector("#spotlightColorLabel");
  const priceEl = section.querySelector("#spotlightPrice");
  const compareEl = section.querySelector("#spotlightComparePrice");
  const saleBadge = section.querySelector("#spotlightSaleBadge");
  const inventoryEl = section.querySelector("#spotlightInventory");
  const qtyInput = section.querySelector("#spotlightQty");
  const addBtn = section.querySelector("#spotlightAddToCart");
  const buyBtn = section.querySelector("#spotlightBuyNow");
  const variantsEl = section.querySelector("#spotlightVariants");
  // option names in variant order, e.g. "garment,color,size"
  const OPTIONS = (section.dataset.options || "garment,color,size").split(",");
  const N = OPTIONS.length;
  // [...option values, price, compare, available]
  const variants = variantsEl ? JSON.parse(variantsEl.textContent) : [];
  const product = { id: section.dataset.productId || "coloured-safari-back-suit", name: section.dataset.productName || "Coloured Safari Back Suit" };
  let mainSwiper = null;

  if (sliderEl && typeof Swiper !== "undefined") {
    mainSwiper = new Swiper(sliderEl, {
      speed: 300,
      autoHeight: true,
      spaceBetween: 8,
      pagination: {
        el: section.querySelector(".product-spotlight__pagination"),
        clickable: true,
      },
    });
  }

  // you may also like
  if (relatedEl && typeof Swiper !== "undefined") {
    new Swiper(relatedEl, {
      slidesPerView: 1,
      spaceBetween: 16,
      speed: 400,
      navigation: {
        prevEl: section.querySelector("#spotlightRelatedPrev"),
        nextEl: section.querySelector("#spotlightRelatedNext"),
      },
    });
  }

  const selected = (name) => {
    const input = section.querySelector(`input[name="spotlight-${name}"]:checked`);
    return input ? input.value : "";
  };
  const selection = () => OPTIONS.map(selected);
  const findVariant = (values) => variants.find((v) => values.every((value, i) => v[i] === value));

  const formatPrice = (amount) =>
    "€" + amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // a value is available if some in-stock variant matches it and the options chosen before it
  function markUnavailable(values) {
    OPTIONS.forEach((name, i) => {
      section.querySelectorAll(`input[name="spotlight-${name}"]`).forEach((input) => {
        const ok = variants.some(
          (v) => v[N + 2] && v[i] === input.value && values.slice(0, i).every((value, j) => v[j] === value)
        );
        input.nextElementSibling.classList.toggle("is-disabled", !ok);
      });
    });
  }

  function update() {
    const values = selection();
    const variant = findVariant(values);

    if (colorLabel) colorLabel.textContent = selected("color");
    markUnavailable(values);

    if (!variant) return;
    const price = variant[N];
    const compare = variant[N + 1];
    const available = variant[N + 2];
    const onSale = compare > price;

    priceEl.textContent = formatPrice(price);
    compareEl.textContent = onSale ? formatPrice(compare) : "";
    compareEl.hidden = !onSale;
    if (saleBadge) {
      saleBadge.textContent = Math.round(((compare - price) / compare) * 100) + "% Sale";
      saleBadge.hidden = !onSale;
    }
    if (inventoryEl) inventoryEl.hidden = !available;

    const addLabel = available ? "Add to cart" : "Sold out";
    const addText = addBtn.querySelector(".product-spotlight__btn-text");
    addBtn.disabled = !available;
    addText.dataset.text = addLabel;
    addText.firstElementChild.textContent = addLabel;
    buyBtn.hidden = !available;
  }

  section.querySelectorAll('input[name="spotlight-color"]').forEach((input) => {
    input.addEventListener("change", () => {
      const image = input.dataset.image;
      if (!image) return;
      if (firstSlideImg) firstSlideImg.src = image;
      if (desktopMainImg) desktopMainImg.src = image;
      if (mainSwiper) mainSwiper.slideTo(0);
    });
  });

  section.querySelectorAll('input[name^="spotlight-"]').forEach((input) => {
    input.addEventListener("change", update);
  });

  const qtyDecreaseBtn = section.querySelector('[data-qty="decrease"]');
  function syncQtyDecrease() {
    qtyDecreaseBtn.disabled = (parseInt(qtyInput.value, 10) || 1) <= 1;
  }

  section.querySelectorAll("[data-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = btn.dataset.qty === "increase" ? current + 1 : Math.max(1, current - 1);
      syncQtyDecrease();
    });
  });
  qtyInput.addEventListener("input", syncQtyDecrease);

  function addToCart() {
    const variant = findVariant(selection());
    if (!variant || !variant[N + 2]) return;
    window.dispatchEvent(
      new CustomEvent("quickview:addtocart", {
        detail: {
          id: product.id,
          name: product.name,
          price: variant[N],
          image: firstSlideImg ? firstSlideImg.src : "",
          variant: variant.slice(0, N).join(" / "),
          qty: parseInt(qtyInput.value, 10) || 1,
        },
      })
    );
  }

  if (addBtn) addBtn.addEventListener("click", addToCart);
  if (buyBtn) buyBtn.addEventListener("click", addToCart);

  // product page: clicking a gallery image opens the zoom viewer
  if (section.classList.contains("product-spotlight--page")) {
    const galleryImages = () => [...section.querySelectorAll(".product-spotlight__slide img")].map((img) => img.src);
    section.querySelector(".product-spotlight__gallery").addEventListener("click", (e) => {
      const img = e.target.closest(".product-spotlight__media-grid img, .product-spotlight__slide img");
      if (!img || typeof window.openImageZoom !== "function") return;
      const list = galleryImages();
      window.openImageZoom(list, Math.max(0, list.indexOf(img.src)));
    });
  }

  // product page: round zoom cursor that eases after the mouse over gallery images
  const gallery = section.querySelector(".product-spotlight__gallery");
  const cursorEl = gallery && gallery.querySelector(".product-spotlight__custom-cursor");
  if (cursorEl && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const zoomTarget = ".product-spotlight__media-grid img, .product-spotlight__slide";
    const cur = { x: null, y: null, renderX: 0, renderY: 0, active: false, frame: null };
    const setPos = (x, y) => {
      cursorEl.style.setProperty("--cursor-x", x.toFixed(2) + "px");
      cursorEl.style.setProperty("--cursor-y", y.toFixed(2) + "px");
    };
    const hideCursor = () => {
      cur.active = false;
      cur.x = cur.y = null;
      cursorEl.classList.remove("is-active");
      if (cur.frame) cancelAnimationFrame(cur.frame);
      cur.frame = null;
    };
    const render = () => {
      if (!cur.active) {
        cur.frame = null;
        return;
      }
      const rect = gallery.getBoundingClientRect();
      cur.renderX += (cur.x - rect.left - cur.renderX) * 0.3;
      cur.renderY += (cur.y - rect.top - cur.renderY) * 0.3;
      setPos(cur.renderX, cur.renderY);
      cur.frame = requestAnimationFrame(render);
    };
    const moveCursor = (e) => {
      if (!e.target || !e.target.closest(zoomTarget)) {
        hideCursor();
        return;
      }
      if (!cur.active) {
        const rect = gallery.getBoundingClientRect();
        cur.renderX = e.clientX - rect.left;
        cur.renderY = e.clientY - rect.top;
        setPos(cur.renderX, cur.renderY);
      }
      cur.x = e.clientX;
      cur.y = e.clientY;
      cur.active = true;
      cursorEl.classList.add("is-active");
      if (!cur.frame) render();
    };
    gallery.addEventListener("mousemove", moveCursor);
    gallery.addEventListener("mouseleave", hideCursor);
    // page scrolls under a still mouse: re-check what is beneath the pointer
    window.addEventListener("scroll", () => {
      if (cur.x === null) return;
      moveCursor({ clientX: cur.x, clientY: cur.y, target: document.elementFromPoint(cur.x, cur.y) });
    }, { passive: true });
  }

  // info panel taller than the viewport: stick by its bottom edge so the buttons stay reachable
  const infoEl = section.querySelector(".product-spotlight__info");
  function syncInfoSticky() {
    if (!infoEl) return;
    const overflow = window.innerHeight - infoEl.offsetHeight;
    infoEl.style.top = overflow < 0 ? overflow + "px" : "";
  }
  window.addEventListener("resize", syncInfoSticky);
  window.addEventListener("load", syncInfoSticky);
  syncInfoSticky();

  update();
})();

// product page: size guide / shipping drawers and share buttons
(function () {
  const triggers = document.querySelectorAll("[data-drawer-open]");
  const overlay = document.getElementById("navOverlay");
  let openDrawer = null;

  function close() {
    if (!openDrawer) return;
    openDrawer.classList.remove("is-open");
    openDrawer = null;
    if (overlay) overlay.classList.remove("is-visible");
    document.body.classList.remove("nav-open");
  }

  triggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const drawer = document.getElementById(btn.dataset.drawerOpen);
      if (!drawer) return;
      close();
      openDrawer = drawer;
      drawer.classList.add("is-open");
      if (overlay) overlay.classList.add("is-visible");
      document.body.classList.add("nav-open");
    });
  });
  document.querySelectorAll("[data-drawer-close]").forEach((btn) => btn.addEventListener("click", close));
  if (overlay) overlay.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // copy the page link
  document.querySelectorAll("[data-share-copy]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const url = window.location.href;
      const done = () => {
        btn.classList.add("is-active");
        setTimeout(() => btn.classList.remove("is-active"), 2000);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done);
      else done();
    });
  });
})();

// product page: recommendations slider
(function () {
  const section = document.querySelector(".product-recommendations");
  if (!section || typeof Swiper === "undefined") return;
  new Swiper(section.querySelector(".product-recommendations__slider"), {
    slidesPerView: 1.25,
    spaceBetween: 12,
    navigation: {
      prevEl: section.querySelector(".product-recommendations__prev"),
      nextEl: section.querySelector(".product-recommendations__next"),
    },
    breakpoints: {
      576: { slidesPerView: 2.2 },
      768: { slidesPerView: 3.2 },
      1200: { slidesPerView: 4 },
    },
  });
})();

// quick view modal
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
    "priceSale": "From €895,00",
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
    "priceSale": "From €855,00",
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
  },
  "field-jacket-trousers": {
    "title": "Field Jacket & Tailored Trousers",
    "material": "Cotton-blend",
    "priceCompare": "€647,00",
    "priceSale": "From €379,00",
    "priceSave": "Save €268",
    "descPara": "This ivory field jacket redefines smart-casual wear with its clean lines and minimalist design. Sharp pocket detailing and a streamlined silhouette make it a refined choice for both relaxed and semi-formal occasions.",
    "bullets": ["Field jacket silhouette", "Sharp pocket detailing", "Matching tailored trousers", "Soft ivory tone"],
    "stylingTip": "Wear the full set with a crisp white tee for an understated smart-casual look.",
    "images": [
      "./assets/images/pollheim/Ivory_Field_Jacket_Ivory_Tailored_Trousers.jpg",
      "./assets/images/pollheim/Ivory_Field_Jacket.jpg",
      "./assets/images/pollheim/Ivory_Field_Jacket_close_up_top_half.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>This ivory field jacket redefines smart-casual wear with its clean lines and minimalist design. Sharp pocket detailing and a streamlined silhouette make it a refined choice for both relaxed and semi-formal occasions.</p>" },
      { "label": "Materials & Care", "html": "<p>Cotton-blend twill. Dry clean recommended; steam to refresh between wears.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "green-checked-jacket-trousers": {
    "title": "Green Checked Jacket & Beige Trousers",
    "material": "Wool-blend check",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "This combination strikes the perfect balance between smart and casual. A muted green checked jacket meets light beige trousers, ideal for business casual events and weekend outings.",
    "bullets": ["Muted green check", "Peak lapels", "Beige tailored trousers", "Smart-casual pairing"],
    "stylingTip": "Pair with a denim shirt and brown loafers for relaxed weekend tailoring.",
    "images": [
      "./assets/images/pollheim/Green_Checked_Jacket_Beige_Trousers.jpg",
      "./assets/images/pollheim/Green_Checked_Jacket_Beige_Trousers_close_up_on_peak_lapels_and_pocket.jpg",
      "./assets/images/pollheim/Green_Checked_Jacket_Beige_Trousers_close_up_on_buttons_and_sleeves.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>This combination strikes the perfect balance between smart and casual. A muted green checked jacket meets light beige trousers, ideal for business casual events and weekend outings.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend check. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "grey-jacket-trousers": {
    "title": "Grey Jacket & Trousers",
    "material": "Wool-blend",
    "priceCompare": "€768,00",
    "priceSale": "From €379,00",
    "priceSave": "Save €389",
    "descPara": "A grey jacket and trousers designed with a modern aesthetic. The jacket features a pointed collar, buttoned front and two chest flap pockets, cut from a smooth, durable wool blend for business and casual wear.",
    "bullets": ["Pointed collar", "Buttoned front", "Two chest flap pockets", "Smooth wool blend"],
    "stylingTip": "Style with a fine-knit roll neck for a clean, modern tonal look.",
    "images": [
      "./assets/images/pollheim/Grey_Jacket_Grey_Trousers.jpg",
      "./assets/images/pollheim/2316-13-5.jpg",
      "./assets/images/pollheim/2316-13-4_121aa6be-df71-421b-aeaa-ff172c041c89.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A grey jacket and trousers designed with a modern aesthetic. The jacket features a pointed collar, buttoned front and two chest flap pockets, cut from a smooth, durable wool blend for business and casual wear.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend fabric. Dry clean only; steam to refresh between wears.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "grey-modern-elegance-blazer": {
    "title": "Grey Modern Elegance Blazer",
    "material": "Premium wool-blend",
    "priceCompare": null,
    "priceSale": "From €895,00",
    "priceSave": "",
    "descPara": "A perfect fusion of contemporary style and classic sophistication. Tailored from premium fabric in a subtle grey pattern, this blazer is designed to impress in the boardroom or at a weekend gathering.",
    "bullets": ["Subtle grey pattern", "Tailored fit", "Notch lapel", "Boardroom to weekend"],
    "stylingTip": "Pair with tailored trousers for a polished look, or casual chinos for a relaxed vibe.",
    "images": [
      "./assets/images/pollheim/Grey_Modern_Elegance_Blazer.jpg",
      "./assets/images/pollheim/pixelcut-export_3.jpg",
      "./assets/images/pollheim/pixelcut-export_2.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A perfect fusion of contemporary style and classic sophistication. Tailored from premium fabric in a subtle grey pattern, this blazer is designed to impress in the boardroom or at a weekend gathering.</p>" },
      { "label": "Materials & Care", "html": "<p>Premium wool-blend. Dry clean only; store on a wide hanger to keep the shoulders in shape.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "modern-aviator-trousers": {
    "title": "Modern Aviator & Trousers",
    "material": "Cotton-blend",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "A warm ochre aviator jacket with structured pockets and sleek silver buttons, paired with tailored mustard trousers for a refined take on tonal dressing.",
    "bullets": ["Aviator-inspired jacket", "Structured pockets", "Silver buttons", "Tonal mustard trousers"],
    "stylingTip": "Keep the rest neutral: a cream knit and brown suede shoes let the colour lead.",
    "images": [
      "./assets/images/pollheim/Modern_Aviator_Mustard_Trousers.jpg",
      "./assets/images/pollheim/2316-10_4f721a8b-d988-4bd0-9d32-7d4521f3feeb.jpg",
      "./assets/images/pollheim/2316-10-1.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A warm ochre aviator jacket with structured pockets and sleek silver buttons, paired with tailored mustard trousers for a refined take on tonal dressing.</p>" },
      { "label": "Materials & Care", "html": "<p>Cotton-blend. Dry clean recommended; steam to refresh between wears.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "navy-checked-suit": {
    "title": "Navy Checked Suit",
    "material": "Wool-blend check",
    "priceCompare": null,
    "priceSale": "From €1.195,00",
    "priceSave": "",
    "descPara": "This navy check suit exudes a refined, classic charm with a contemporary edge. The subtle check adds texture and dimension, and the tailored silhouette ensures a sharp, polished appearance for business or formal occasions.",
    "bullets": ["Subtle navy check", "Tailored silhouette", "Two-piece suit", "Business and formal wear"],
    "stylingTip": "Wear with a light blue shirt and a dark knitted tie for a modern business look.",
    "images": [
      "./assets/images/pollheim/Navy_Checked_Suit.jpg",
      "./assets/images/pollheim/2324-4-1.jpg",
      "./assets/images/pollheim/2324-4_a4048b67-a76c-4f41-aaae-86b870be17d9.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>This navy check suit exudes a refined, classic charm with a contemporary edge. The subtle check adds texture and dimension, and the tailored silhouette ensures a sharp, polished appearance for business or formal occasions.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend check. Dry clean only; hang the jacket and trousers separately.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "olive-heritage-check-jacket": {
    "title": "Olive Heritage Check Jacket",
    "material": "Breathable wool-blend",
    "priceCompare": null,
    "priceSale": "From €855,00",
    "priceSave": "",
    "descPara": "A timeless jacket that mixes classic charm with contemporary flair. Crafted in a rich olive green check, its soft, breathable fabric makes it ideal for smart-casual outings and more refined occasions.",
    "bullets": ["Rich olive check", "Soft breathable fabric", "Relaxed elegance", "Smart-casual to refined"],
    "stylingTip": "Pair with cream trousers and suede loafers for easy heritage style.",
    "images": [
      "./assets/images/pollheim/Olive_Heritage_Check_Jacket.png",
      "./assets/images/pollheim/Untitleddesign_15.png",
      "./assets/images/pollheim/Untitleddesign_17.png"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A timeless jacket that mixes classic charm with contemporary flair. Crafted in a rich olive green check, its soft, breathable fabric makes it ideal for smart-casual outings and more refined occasions.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend check. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "red-blue-checked-suit": {
    "title": "Red & Blue Checked Suit",
    "material": "Premium wool-blend",
    "priceCompare": null,
    "priceSale": "From €855,00",
    "priceSave": "",
    "descPara": "Make a bold impression with this red and blue checked suit. Tailored from premium fabric in a striking burgundy plaid, its fitted cut is versatile enough for formal events and upscale gatherings.",
    "bullets": ["Burgundy plaid", "Tailored fit", "Statement suiting", "Formal and upscale events"],
    "stylingTip": "Let the pattern lead: wear with a plain white shirt and dark shoes.",
    "images": [
      "./assets/images/pollheim/Red_Blue_Premium_Checked_Suit.jpg",
      "./assets/images/pollheim/Untitled_design_10.png",
      "./assets/images/pollheim/Untitled_design_11.png"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>Make a bold impression with this red and blue checked suit. Tailored from premium fabric in a striking burgundy plaid, its fitted cut is versatile enough for formal events and upscale gatherings.</p>" },
      { "label": "Materials & Care", "html": "<p>Premium wool-blend. Dry clean only; hang the jacket and trousers separately.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "redefined-aviator-checked-jacket": {
    "title": "Redefined Aviator Checked Jacket",
    "material": "Wool-blend check",
    "priceCompare": null,
    "priceSale": "From €895,00",
    "priceSave": "",
    "descPara": "A modern take on the traditional aviation jacket in a luxurious brown check. It features a classic stand-up collar, a sleek zip-up front and flap pockets at the waist for added elegance.",
    "bullets": ["Stand-up collar", "Zip-up front", "Flap pockets at the waist", "Luxurious brown check"],
    "stylingTip": "Wear over a fine-knit roll neck with dark tailored trousers.",
    "images": [
      "./assets/images/pollheim/Redefined_Aviator_Checked_Jacket.jpg",
      "./assets/images/pollheim/2316-18-2.jpg",
      "./assets/images/pollheim/BrownandWhiteCheckedJacketPocketZipDetails.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A modern take on the traditional aviation jacket in a luxurious brown check. It features a classic stand-up collar, a sleek zip-up front and flap pockets at the waist for added elegance.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend check. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "classic-striped-unisex-shirt": {
    "title": "Classic Striped Unisex Shirt",
    "material": "Cotton",
    "priceCompare": null,
    "priceSale": "€250,00",
    "priceSave": "",
    "descPara": "Timeless sophistication meets modern versatility with our Classic Striped Unisex Shirt in soft beige. Designed for effortless style, this wardrobe essential features a relaxed fit, subtle vertical stripes, and a breathable cotton-linen blend for all-day comfort.",
    "bullets": ["Classic collar", "Fine stripe", "Unisex fit", "Breathable cotton"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/image_161_1_439x_crop_center.png"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>Timeless sophistication meets modern versatility with our Classic Striped Unisex Shirt in soft beige. Designed for effortless style, this wardrobe essential features a relaxed fit, subtle vertical stripes, and a breathable cotton-linen blend for all-day comfort. Whether dressed up with tailored trousers or styled casually with denim, this shirt offers a refined yet relaxed look for any occasion.</p>" },
      { "label": "Materials & Care", "html": "<p>Cotton. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "beige-long-over-coat": {
    "title": "Camel Beige Over Coat",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "€1.395,00",
    "priceSave": "",
    "descPara": "80% Wool 20% Cashmere This camel-coloured coat is the epitome of understated elegance. Its soft yet structured silhouette, accented by the wide belt and large pockets, offers a perfect blend of comfort and style.",
    "bullets": ["Long tailored silhouette", "Notch lapel", "Fully lined", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Camel_Beige_Over_Coat_439x_crop_center.jpg",
      "./assets/images/pollheim/Camel_Beige_Over_Coat_close_up_on_peak_lapels_ff39712a-b6a1-44fb-a9e4-22e26d798d61_439x_crop_center.png",
      "./assets/images/pollheim/Teal_Long_Over_Coat_769caa51-71ba-493f-b8d0-01ad87ad4a9d_439x_crop_center.jpg",
      "./assets/images/pollheim/Untitleddesign_29_1_aea13a69-3d7f-4fcf-b829-a091e5a2421c_439x_crop_center.png"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>80% Wool 20% Cashmere This camel-coloured coat is the epitome of understated elegance. Its soft yet structured silhouette, accented by the wide belt and large pockets, offers a perfect blend of comfort and style. The versatile neutral tone makes it a wardrobe staple, pairing effortlessly with any outfit for a polished look.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "belted-jacket-trousers": {
    "title": "Belted Jacket & Trousers",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "An olive belted jacket paired with relaxed beige trousers brings a utilitarian edge to refined tailoring. The cinched waist shapes a clean silhouette while the soft palette keeps the look effortless.",
    "bullets": ["Tailored jacket", "Matching trousers", "Structured shoulders", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Olive_Belted_Jacket_Beige_Trousers.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>An olive belted jacket paired with relaxed beige trousers brings a utilitarian edge to refined tailoring. The cinched waist shapes a clean silhouette while the soft palette keeps the look effortless.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "black-and-white-pattern-suit": {
    "title": "Black and White Pattern Suit",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "From €1.195,00",
    "priceSave": "",
    "descPara": "A bold black and white patterned suit, tailored for a sharp and confident silhouette. Crafted from premium fabric, it is a statement piece for evening events and special occasions.",
    "bullets": ["Tailored jacket", "Matching trousers", "Structured shoulders", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Black_and_White_Pattern_Suit.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A bold black and white patterned suit, tailored for a sharp and confident silhouette. Crafted from premium fabric, it is a statement piece for evening events and special occasions.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "camel-jacket-tailored-trousers": {
    "title": "Camel Jacket & Tailored Trousers",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "100% Wool This camel wool jacket delivers a refined yet understated style, perfect for those who appreciate timeless elegance. The soft wool fabric provides warmth and a comfortable fit, while the minimalist design with sharp pocket detailing makes it a versatile piece for both casual and formal settings.",
    "bullets": ["Tailored jacket", "Matching trousers", "Structured shoulders", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Camel_Jacket_Tailored_Trousers.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>100% Wool This camel wool jacket delivers a refined yet understated style, perfect for those who appreciate timeless elegance. The soft wool fabric provides warmth and a comfortable fit, while the minimalist design with sharp pocket detailing makes it a versatile piece for both casual and formal settings. Paired with matching tailored trousers, this ensemble exudes sophistication and confidence. The trousers are expertly crafted for a sleek silhouette, ensuring a polished look with every wear. Whether for business or leisure, this combination offers the ultimate blend of comfort, style, and refinement.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "grey-houndstooth-blazer-black-trousers": {
    "title": "Grey Houndstooth Blazer & Black Trousers",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "This tailored grey houndstooth blazer paired with sleek black trousers redefines contemporary elegance. The blazer’s intricate pattern, subtle yet eye-catching, offers a distinguished look that’s perfect for both formal and smart-casual settings.",
    "bullets": ["Tailored jacket", "Matching trousers", "Structured shoulders", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Grey_Houndstooth_Blazer_Black_Trousers.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>This tailored grey houndstooth blazer paired with sleek black trousers redefines contemporary elegance. The blazer’s intricate pattern, subtle yet eye-catching, offers a distinguished look that’s perfect for both formal and smart-casual settings. Paired with black tailored trousers, the outfit achieves the right balance of professionalism and effortless style. Whether you're attending a business meeting or an evening event, this ensemble provides a fresh, modern twist on traditional tailoring. Add this to your wardrobe for an effortlessly sharp look.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "womens-luxury-grey-suit": {
    "title": "Women's Luxury Grey Suit",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "From €1.095,00",
    "priceSave": "",
    "descPara": "A luxurious grey suit tailored for the modern woman. The structured blazer and matching trousers create an elegant, polished look that moves seamlessly from the office to evening occasions.",
    "bullets": ["Tailored jacket", "Matching trousers", "Structured shoulders", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Womens_Luxury_Grey_Suit.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A luxurious grey suit tailored for the modern woman. The structured blazer and matching trousers create an elegant, polished look that moves seamlessly from the office to evening occasions.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "wool-bomber-trousers": {
    "title": "Wool Bomber & Trousers",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "A wool bomber jacket paired with khaki trousers offers a contemporary take on smart-casual dressing. Warm, comfortable and refined, it is perfect for cooler days.",
    "bullets": ["Tailored jacket", "Matching trousers", "Structured shoulders", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Wool_Bomber_Khaki_Trousers.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>A wool bomber jacket paired with khaki trousers offers a contemporary take on smart-casual dressing. Warm, comfortable and refined, it is perfect for cooler days.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "camel-jacket-grey-pants": {
    "title": "Camel Jacket & Grey Pants",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "100% Wool The focal point of the outfit is a camel-coloured jacket, expertly tailored to offer both comfort and a sharp silhouette. The jacket features a classic design with a buttoned front, pointed collar, and two chest pockets with flaps, adding a touch of practicality to its refined appearance.",
    "bullets": ["Tailored jacket", "Matching trousers", "Structured shoulders", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Camel_Jacket_Grey_Pants_close_up_on_pockets_and_collar_439x_crop_center.jpg",
      "./assets/images/pollheim/Camel_Jacket_Grey_Pants_close_up_on_buttons_and_sleeve_439x_crop_center.jpg",
      "./assets/images/pollheim/Camel_Jacket_Grey_Pants_close_up_on_pants_439x_crop_center.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>100% Wool The focal point of the outfit is a camel-coloured jacket, expertly tailored to offer both comfort and a sharp silhouette. The jacket features a classic design with a buttoned front, pointed collar, and two chest pockets with flaps, adding a touch of practicality to its refined appearance. The warm camel tone not only exudes a sense of timeless style but also adds versatility, making it a perfect choice for various occasions.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "checked-sports-coat-tailored-chinos": {
    "title": "Checked Sports Coat & Tailored Chinos",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "For the perfect balance of casual sophistication, this checked sports coat paired with tailored chinos is an essential for the modern wardrobe. Ideal for weekend outings or smart-casual workwear, the sports coat features a traditional check pattern with a relaxed yet refined silhouette.",
    "bullets": ["Tailored jacket", "Matching trousers", "Structured shoulders", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Checked_Sports_Coat_Tailored_Chinos_close_up_439x_crop_center.jpg",
      "./assets/images/pollheim/Checked_Sports_Coat_Tailored_Chinos_439x_crop_center.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>For the perfect balance of casual sophistication, this checked sports coat paired with tailored chinos is an essential for the modern wardrobe. Ideal for weekend outings or smart-casual workwear, the sports coat features a traditional check pattern with a relaxed yet refined silhouette. The lightweight design allows for layering, offering both comfort and style throughout the day.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "checked-wool-jacket-olive-trousers": {
    "title": "Checked Wool Jacket & Olive Trousers",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "This checked wool jacket brings a touch of classic British style to any wardrobe, offering a tailored fit and refined design. The subtle check pattern adds texture and depth, making it an excellent choice for both casual and semi-formal settings.",
    "bullets": ["Tailored jacket", "Matching trousers", "Structured shoulders", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Checked_Wool_Jacket_Olive_Trousers_close_up_on_jacket_439x_crop_center.jpg",
      "./assets/images/pollheim/Checked_Wool_Jacket_Olive_Trousers_close_up_on_buttons_and_sleeves_439x_crop_center.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>This checked wool jacket brings a touch of classic British style to any wardrobe, offering a tailored fit and refined design. The subtle check pattern adds texture and depth, making it an excellent choice for both casual and semi-formal settings. Paired with sleek olive green trousers, this combination exudes understated elegance.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "dark-grey-long-over-coat": {
    "title": "Dark Grey Long Over Coat",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "€1.095,00",
    "priceSave": "",
    "descPara": "This beautifully tailored grey overcoat is the epitome of chic sophistication. With its belted waist, wide lapels, and double-breasted design, this coat offers both structure and elegance.",
    "bullets": ["Long tailored silhouette", "Notch lapel", "Fully lined", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Dark_Grey_Long_Over_Coat_439x_crop_center.jpg",
      "./assets/images/pollheim/Dark_Grey_Long_Over_Coat_close_up_top_half_439x_crop_center.png"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>This beautifully tailored grey overcoat is the epitome of chic sophistication. With its belted waist, wide lapels, and double-breasted design, this coat offers both structure and elegance. Crafted from premium fabric, it not only keeps you warm but also ensures you stand out in any setting.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "deep-blue-check-suit": {
    "title": "Deep Blue Check Suit",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "From €1.195,00",
    "priceSave": "",
    "descPara": "Exude confidence and sophistication with this deep blue check suit, tailored to perfection for the modern man. The fine windowpane pattern subtly enhances the classic navy backdrop, making it an exceptional choice for any business meeting or formal occasion.",
    "bullets": ["Tailored jacket", "Matching trousers", "Structured shoulders", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Deep_Blue_Check_Suit_close_up_on_pocket_and_peak_lapels_439x_crop_center.jpg",
      "./assets/images/pollheim/Deep_Blue_Check_Suit_close_up_on_sleeve_and_buttons_439x_crop_center.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>Exude confidence and sophistication with this deep blue check suit, tailored to perfection for the modern man. The fine windowpane pattern subtly enhances the classic navy backdrop, making it an exceptional choice for any business meeting or formal occasion. Paired with a sleek black turtleneck, this ensemble strikes the perfect balance between formal and smart-casual, offering both versatility and style.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "teal-double-breasted-jacket-beige-trousers": {
    "title": "Double-Breasted Jacket & Trousers",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "From €379,00",
    "priceSave": "",
    "descPara": "This teal double-breasted jacket offers a distinctive, modern take on classic tailoring. With its structured fit and rich colour, the jacket exudes confidence and sophistication, making it a standout piece for any wardrobe.",
    "bullets": ["Tailored jacket", "Matching trousers", "Structured shoulders", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/2316-5-2_439x_crop_center.jpg",
      "./assets/images/pollheim/2316-5-1_2e4876de-e47c-4f56-9530-a0eaa1af3887_439x_crop_center.jpg",
      "./assets/images/pollheim/2316-5-2_e8b5033a-ee06-47be-bfe6-9bb531c077e8_439x_crop_center.jpg"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>This teal double-breasted jacket offers a distinctive, modern take on classic tailoring. With its structured fit and rich colour, the jacket exudes confidence and sophistication, making it a standout piece for any wardrobe. The subtle pattern in the fabric adds depth and texture, while the double-breasted design ensures a sharp, elegant silhouette.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "light-tan-long-over-coat": {
    "title": "Light Tan Long Over Coat",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "€1.095,00",
    "priceSave": "",
    "descPara": "This light tan double-breasted overcoat is a timeless piece that brings both style and functionality to your wardrobe. The rich fabric, accentuated by its beautifully crafted buttons and tailored belt, creates a flattering silhouette while ensuring comfort and warmth.",
    "bullets": ["Long tailored silhouette", "Notch lapel", "Fully lined", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Light_Tan_Long_Over_Coat_439x_crop_center.jpg",
      "./assets/images/pollheim/save_as_2024-06-08T01_09_51.017Z_439x_crop_center.png"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>This light tan double-breasted overcoat is a timeless piece that brings both style and functionality to your wardrobe. The rich fabric, accentuated by its beautifully crafted buttons and tailored belt, creates a flattering silhouette while ensuring comfort and warmth. The neutral tone allows this coat to transition effortlessly from casual to formal settings.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
      { "label": "Shipping & Returns", "html": "<p>Standard delivery takes 5-7 business days. Items can be returned within 30 days of purchase in original condition.</p>" }
    ]
  },
  "black-long-over-coat": {
    "title": "Luxury Black Long Over Coat",
    "material": "Wool-blend",
    "priceCompare": null,
    "priceSale": "€1.095,00",
    "priceSave": "",
    "descPara": "This double-breasted black overcoat exudes sophistication and timeless style. With its military-inspired design, including shoulder epaulettes and bold button details, this coat brings an air of authority and confidence to any ensemble.",
    "bullets": ["Long tailored silhouette", "Notch lapel", "Fully lined", "Made to measure"],
    "stylingTip": "Pair with tailored trousers and leather shoes for a refined, modern look.",
    "images": [
      "./assets/images/pollheim/Luxury_Black_Long_Over_Coat_439x_crop_center.jpg",
      "./assets/images/pollheim/save_as_2024-06-08T01_13_40.815Z_439x_crop_center.png"
    ],
    "tabs": [
      { "label": "Description", "html": "<p>This double-breasted black overcoat exudes sophistication and timeless style. With its military-inspired design, including shoulder epaulettes and bold button details, this coat brings an air of authority and confidence to any ensemble. Perfect for those seeking a polished look, the sharp lines and tailored fit will complement formal outfits while adding a refined touch to casual attire.</p>" },
      { "label": "Materials & Care", "html": "<p>Wool-blend. Dry clean only; store on a wide hanger.</p>" },
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

  // fabric swatch or chip
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
  // multi-color products
  const PRODUCT_COLORS = {
    "elegant-check-blazer": ["Camel", "Rose"],
    "burgundy-blazer": ["Burgundy", "Black"],
    "classic-mens-shoes": ["Black", "White"],
    "belt-lace-black": ["Black", "Brown", "Beige"],
    "draw-pant-blazer": ["Black", "Burgundy"],
    "grey-modern-elegance-blazer": ["Grey", "Beige", "Teal"],
    "luxe-summer-blazer": ["Jasper", "Rose", "Brick"],
    "green-double-breasted-blazer": ["Green", "Teal", "Black"],
    "beige-long-over-coat": ["Beige", "Navy", "Blue"],
    "camel-jacket-grey-pants": ["Camel", "Grey"],
    "teal-double-breasted-jacket-beige-trousers": ["Teal", "Beige"],
    "redefined-aviator-checked-jacket": ["Brown", "Green", "Blue", "Black"],
  };

  // per-product size scales
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

  // stable stock count
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

  // build gallery
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
        // auto height per slide
        autoHeight: true,
        pagination: { el: galleryPaginationEl, clickable: true },
      });
    }
  }

  // swap on resize
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

    // carousel or stacked list
    buildGallery(data.images);

    // garment for tailoring only
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

    // show in-cart count
    const inCartQty = window.getCartQty ? window.getCartQty(id) : 0;
    if (inCartQty > 0) {
      inCartEl.textContent = `(In cart: ${inCartQty})`;
      inCartEl.hidden = false;
    } else {
      inCartEl.hidden = true;
    }

    // parse euro prices
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

  // quick view buttons only
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

  // buy now opens cart
  buyNowBtn.addEventListener("click", () => {
    addCurrentToCart();
    closeModal();
  });

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  // backdrop click closes
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

// image zoom modal
(function () {
  const modal = document.getElementById("imageZoomModal");
  const swiperEl = document.getElementById("imageZoomSwiper");
  const wrapperEl = document.getElementById("imageZoomWrapper");
  const closeBtn = document.getElementById("imageZoomClose");
  const prevBtn = document.getElementById("imageZoomPrev");
  const nextBtn = document.getElementById("imageZoomNext");
  if (!modal || !swiperEl || typeof Swiper === "undefined") return;

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
    modal.classList.remove("is-open");
    document.body.classList.remove("nav-open");

    const swiperToDestroy = zoomSwiper;
    zoomSwiper = null;
    setTimeout(() => swiperToDestroy && swiperToDestroy.destroy(true, true), 333);
  }

  // used by the product page gallery
  window.openImageZoom = open;

  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) close();
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

// faq tabs + search
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

// store tabs + search
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

// shipping/returns tabs
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


// welcome popup (first visit)
(function () {
  const STORAGE_KEY = "Tailor-welcome-popup-seen";
  const SHOW_DELAY = 2000;

  // no storage, skip
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
    // wait for overlays
    if (document.body.classList.contains("nav-open")) {
      setTimeout(open, 1000);
      return;
    }

    // remember visit immediately
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

    // trap focus in dialog
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
