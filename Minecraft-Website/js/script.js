const pageName = document.body.dataset.page;
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const menuDetails = document.querySelector(".nav-more");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
document.addEventListener("visibilitychange", () => {
  document.body.classList.toggle("page-hidden", document.hidden);
});

const additionalPages = [
  ["similarities", "Minecraft & Terraria"],
  ["technical", "Technical"]
];

const hero = document.querySelector(".page-hero");

if (hero && !reduceMotion.matches) {
  const atmosphere = document.createElement("div");
  atmosphere.className = "hero-atmosphere";
  atmosphere.setAttribute("aria-hidden", "true");

  for (let index = 0; index < 12; index += 1) {
    const particle = document.createElement("span");
    const seed = (index * 37 + 13) % 100;
    particle.className = "hero-particle";
    particle.style.setProperty("--particle-x", `${seed}%`);
    particle.style.setProperty("--particle-y", `${(index * 61 + 17) % 100}%`);
    particle.style.setProperty("--particle-size", `${index % 4 === 0 ? 5 : 3}px`);
    particle.style.setProperty("--particle-duration", `${9 + (index % 6) * 2}s`);
    particle.style.setProperty("--particle-delay", `${-(index % 9)}s`);
    atmosphere.append(particle);
  }

  hero.prepend(atmosphere);
}

let pageNavigationPending = false;

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");

  if (
    !link
    || event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
    || link.hasAttribute("download")
    || (link.target && link.target !== "_self")
    || link.hasAttribute("data-no-transition")
    || pageNavigationPending
    || reduceMotion.matches
  ) return;

  const destination = new URL(link.href, window.location.href);
  const current = new URL(window.location.href);

  if (
    destination.origin !== current.origin
    || !/\.html?$/i.test(destination.pathname)
    || destination.pathname === current.pathname
  ) return;

  event.preventDefault();
  pageNavigationPending = true;
  document.body.classList.add("is-leaving");

  const transition = document.querySelector(".page-transition");
  const finishNavigation = () => window.location.assign(destination.href);
  const fallback = window.setTimeout(finishNavigation, 1450);

  if (transition) {
    transition.addEventListener("animationend", (animationEvent) => {
      if (animationEvent.target !== transition) return;
      window.clearTimeout(fallback);
      finishNavigation();
    });
  }
});

const moreMenu = document.querySelector(".nav-more-menu");

additionalPages.forEach(([page, label]) => {
  if (!moreMenu || moreMenu.querySelector(`[data-page-link="${page}"]`)) return;
  const link = document.createElement("a");
  link.href = `${page}.html`;
  link.dataset.pageLink = page;
  link.textContent = label;
  moreMenu.append(link);
});

const allPageLinks = [...document.querySelectorAll("[data-page-link]")];

function closeNavigation() {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

allPageLinks.forEach((link) => {
  if (link.dataset.pageLink === pageName) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const footerLinks = document.querySelector(".footer-links");

additionalPages.forEach(([page, label]) => {
  if (!footerLinks || footerLinks.querySelector(`a[href="${page}.html"]`)) return;
  const link = document.createElement("a");
  link.href = `${page}.html`;
  link.textContent = label;
  footerLinks.append(link);
});

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNavigation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (menuButton.getAttribute("aria-expanded") === "true") {
        closeNavigation();
        menuButton.focus();
      }
      if (menuDetails?.open) menuDetails.open = false;
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeNavigation();
  });
}

const readingProgress = document.createElement("div");
readingProgress.className = "reading-progress";
readingProgress.setAttribute("role", "progressbar");
readingProgress.setAttribute("aria-label", "Page reading progress");
readingProgress.setAttribute("aria-valuemin", "0");
readingProgress.setAttribute("aria-valuemax", "100");
readingProgress.innerHTML = "<span></span>";
document.querySelector(".site-header")?.append(readingProgress);

let scrollUpdateQueued = false;

function updateScrollEffects() {
  const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableDistance > 0 ? Math.round((window.scrollY / scrollableDistance) * 100) : 0;
  const parallaxShift = window.innerWidth > 820 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? Math.round(window.scrollY * -0.035)
    : 0;
  readingProgress.style.setProperty("--progress", `${progress}%`);
  readingProgress.setAttribute("aria-valuenow", String(progress));
  document.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 12);
  document.documentElement.style.setProperty("--page-scroll", `${Math.min(window.scrollY, 520)}px`);
  document.documentElement.style.setProperty("--parallax-shift", `${parallaxShift}px`);
  scrollUpdateQueued = false;
}

window.addEventListener("scroll", () => {
  if (scrollUpdateQueued) return;
  scrollUpdateQueued = true;
  window.requestAnimationFrame(updateScrollEffects);
}, { passive: true });

window.addEventListener("resize", updateScrollEffects);
updateScrollEffects();

document.addEventListener("click", (event) => {
  if (menuDetails?.open && !menuDetails.contains(event.target)) menuDetails.open = false;
});

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 55}ms`);
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const transitionVeil = document.createElement("div");
transitionVeil.className = "page-transition";
transitionVeil.setAttribute("aria-hidden", "true");
transitionVeil.innerHTML = `
  <div class="transition-fire" aria-hidden="true">
    <span class="fire-glow"></span>
    <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
  </div>
  <div class="transition-water" aria-hidden="true"><span></span></div>
  <div class="transition-character" aria-hidden="true">
    <span class="steve-shadow"></span>
    <span class="steve-head"><i class="steve-hair"></i><i class="steve-eye steve-eye-left"></i><i class="steve-eye steve-eye-right"></i><i class="steve-nose"></i><i class="steve-beard"></i></span>
    <span class="steve-body"></span>
    <span class="steve-arm steve-arm-left"></span>
    <span class="steve-arm steve-arm-right"></span>
    <span class="steve-leg steve-leg-left"></span>
    <span class="steve-leg steve-leg-right"></span>
    <span class="steve-hand-flame steve-hand-flame-left"><i></i></span>
    <span class="steve-hand-flame steve-hand-flame-right"><i></i></span>
  </div>
  <span class="transition-title">DIMENSION SHIFT</span>`;
document.body.append(transitionVeil);

const tiltTargets = document.querySelectorAll(".card, .image-card, .hero-visual, .gallery-item");

if (!reduceMotion.matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  tiltTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const bounds = target.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      target.style.setProperty("--tilt-x", `${(y * -3).toFixed(2)}deg`);
      target.style.setProperty("--tilt-y", `${(x * 3).toFixed(2)}deg`);
    });

    target.addEventListener("pointerleave", () => {
      target.style.setProperty("--tilt-x", "0deg");
      target.style.setProperty("--tilt-y", "0deg");
    });
  });
}

const archivedSections = document.querySelectorAll(".archive-chapter");

if (archivedSections.length) {
  const archive = document.querySelector(".section-source-archive .container");
  const searchWrap = document.createElement("label");
  searchWrap.className = "archive-search";
  searchWrap.innerHTML = '<span>SEARCH THE ORIGINAL DOCUMENT</span><input type="search" autocomplete="off" placeholder="Try “Herobrine”, “redstone”, or “Conclusion”"><span class="archive-search-status" role="status" aria-live="polite"></span>';
  archive.querySelector(".archive-notice")?.after(searchWrap);
  const searchInput = searchWrap.querySelector("input");
  const searchStatus = searchWrap.querySelector(".archive-search-status");
  searchStatus.textContent = "Search every original chapter and subsection.";

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLocaleLowerCase();
    let chapterMatches = 0;
    let sectionMatches = 0;

    archivedSections.forEach((chapter) => {
      const subsections = [...chapter.querySelectorAll(".archive-subsection")];
      const chapterLink = archive.querySelector(`.archive-index a[href="#${chapter.id}"]`);

      if (!query) {
        chapter.hidden = false;
        if (chapterLink) chapterLink.hidden = false;
        subsections.forEach((subsection) => {
          subsection.hidden = false;
          subsection.open = false;
        });
        sectionMatches += 1;
        return;
      }

      const chapterMatchesQuery = chapter.textContent.toLocaleLowerCase().includes(query);
      chapter.hidden = !chapterMatchesQuery;
      if (chapterLink) chapterLink.hidden = !chapterMatchesQuery;
      chapter.open = chapterMatchesQuery;

      if (chapterMatchesQuery) {
        chapterMatches += 1;
        subsections.forEach((subsection) => {
          const match = subsection.textContent.toLocaleLowerCase().includes(query);
          subsection.hidden = !match;
          subsection.open = match;
          if (match) sectionMatches += 1;
        });
      } else {
        subsections.forEach((subsection) => {
          subsection.hidden = false;
          subsection.open = false;
        });
      }
    });

    searchStatus.textContent = query
      ? `${chapterMatches} matching chapter${chapterMatches === 1 ? "" : "s"} · ${sectionMatches} matching section${sectionMatches === 1 ? "" : "s"}`
      : "Search every original chapter and subsection.";
  });
}

if (["story", "updates"].includes(pageName)) {
  document.querySelectorAll(".timeline-item").forEach((item, index) => {
    const paragraph = item.querySelector(".timeline-content p");
    const heading = item.querySelector(".timeline-content h3");
    if (!paragraph || !heading) return;

    const detailId = `timeline-detail-${index + 1}`;
    paragraph.id = detailId;
    const toggle = document.createElement("button");
    toggle.className = "timeline-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-controls", detailId);
    toggle.textContent = "Hide details −";
    heading.after(toggle);
    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isExpanded));
      paragraph.hidden = isExpanded;
      toggle.textContent = isExpanded ? "Read details +" : "Hide details −";
    });
  });
}

const backToTop = document.querySelector(".back-to-top");

if (backToTop) {
  const updateBackToTop = () => backToTop.classList.toggle("is-visible", window.scrollY > 500);
  updateBackToTop();
  window.addEventListener("scroll", updateBackToTop, { passive: true });
}

document.querySelectorAll("[data-filter-group]").forEach((group) => {
  const buttons = [...group.querySelectorAll("[data-filter]")];
  const cards = [...document.querySelectorAll(`[data-filter-card="${group.dataset.filterGroup}"]`)];

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      cards.forEach((card) => {
        const show = selected === "all" || card.dataset.category.split(" ").includes(selected);
        card.hidden = !show;
        if (show) card.classList.remove("is-visible");
      });
    });
  });
});

const editionTabs = [...document.querySelectorAll("[data-edition-tab]")];

editionTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    editionTabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
    });
  });
});

editionTabs.forEach((tab, index) => {
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextTab = editionTabs[(index + direction + editionTabs.length) % editionTabs.length];
    nextTab.focus();
    nextTab.click();
  });
});

const circuitSwitch = document.querySelector("[data-circuit-switch]");
const circuitLamp = document.querySelector("[data-circuit-lamp]");
const circuitStatus = document.querySelector("[data-circuit-status]");

if (circuitSwitch && circuitLamp && circuitStatus) {
  circuitSwitch.addEventListener("click", () => {
    const isPowered = circuitSwitch.getAttribute("aria-pressed") === "true";
    circuitSwitch.setAttribute("aria-pressed", String(!isPowered));
    circuitLamp.classList.toggle("is-lit", !isPowered);
    circuitLamp.setAttribute("aria-label", !isPowered ? "Lamp on" : "Lamp off");
    circuitStatus.textContent = !isPowered ? "Power: on · lamp lit" : "Power: off · lamp unlit";
    circuitSwitch.firstElementChild.textContent = !isPowered ? "Turn off the circuit" : "Power the circuit";
  });
}

const galleryItems = [...document.querySelectorAll("[data-lightbox-image]")];

if (galleryItems.length) {
  const lightbox = document.createElement("dialog");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("aria-label", "Image viewer");
  lightbox.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close image viewer">×</button><img alt=""><p></p>';
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector("p");

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      lightboxImage.src = item.dataset.lightboxImage;
      lightboxImage.alt = item.dataset.lightboxAlt;
      lightboxCaption.textContent = item.dataset.lightboxAlt;
      lightbox.showModal();
    });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      lightbox.close();
    }
  });
}
