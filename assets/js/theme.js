document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var sidebar = document.querySelector("[data-sidebar]");
  var themeToggle = document.querySelector("[data-theme-toggle]");
  var tocLinks = document.querySelectorAll(".page-toc a");
  var articleImages = document.querySelectorAll(".article-body img");
  var sidebarLinks = document.querySelectorAll(".sidebar a");
  var codeBlocks = document.querySelectorAll(".article-body .highlight");
  var searchStatus = document.getElementById("search-status");
  var searchWatchTimer = null;
  var setSearchStatus = function (message) {
    if (!searchStatus) {
      return;
    }
    searchStatus.hidden = false;
    searchStatus.textContent = message;
  };
  var initSearch = function () {
    var pagefindRoot = document.getElementById("search");
    if (!pagefindRoot || !window.PagefindUI || pagefindRoot.dataset.pagefindInitialized === "true") {
      return;
    }

    var parseBoolean = function (value, fallback) {
      if (value === undefined || value === null || value === "") {
        return fallback;
      }
      return value === "true";
    };

    var pageSize = Number(pagefindRoot.dataset.pagefindPageSize || 8);
    var excerptLength = Number(pagefindRoot.dataset.pagefindExcerptLength || 20);

    new window.PagefindUI({
      element: "#search",
      bundlePath: pagefindRoot.dataset.pagefindBundlePath || "/pagefind/",
      showSubResults: parseBoolean(pagefindRoot.dataset.pagefindShowSubResults, true),
      excerptLength: Number.isNaN(excerptLength) ? 20 : excerptLength,
      pageSize: Number.isNaN(pageSize) ? 8 : pageSize,
      resetStyles: false,
      showImages: false,
      translations: {
        placeholder: pagefindRoot.dataset.pagefindPlaceholder || "Search..."
      }
    });

    pagefindRoot.dataset.pagefindInitialized = "true";
    if (searchStatus) {
      searchStatus.hidden = true;
      searchStatus.textContent = "";
    }
    if (searchWatchTimer) {
      window.clearTimeout(searchWatchTimer);
      searchWatchTimer = null;
    }
  };

  window.initBeatAISearch = initSearch;
  window.reportBeatAISearchError = setSearchStatus;

  if (toggle && sidebar) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  if (sidebarLinks.length) {
    sidebarLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    });
  }

  if (themeToggle) {
    var root = document.documentElement;
    var applyTheme = function (theme) {
      root.setAttribute("data-theme", theme);
      themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
    };
    var currentTheme = root.getAttribute("data-theme") || "light";
    applyTheme(currentTheme);
    themeToggle.addEventListener("click", function () {
      var nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem("beatai-theme", nextTheme);
      applyTheme(nextTheme);
    });
  }

  if (tocLinks.length) {
    var headings = Array.prototype.slice.call(
      document.querySelectorAll(".article-body h2, .article-body h3, .article-body h4")
    );

    var syncToc = function () {
      var currentId = "";
      headings.forEach(function (heading) {
        if (window.scrollY + 120 >= heading.offsetTop) {
          currentId = heading.id;
        }
      });

      tocLinks.forEach(function (link) {
        var isCurrent = currentId && link.getAttribute("href") === "#" + currentId;
        link.classList.toggle("is-current", isCurrent);
      });
    };

    syncToc();
    window.addEventListener("scroll", syncToc, { passive: true });
  }

  if (articleImages.length) {
    var lightbox = document.createElement("div");
    var lightboxImage = document.createElement("img");
    lightbox.className = "image-lightbox";
    lightbox.hidden = true;
    lightbox.appendChild(lightboxImage);
    document.body.appendChild(lightbox);

    articleImages.forEach(function (image) {
      image.addEventListener("click", function () {
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt || "";
        lightbox.hidden = false;
      });
    });

    lightbox.addEventListener("click", function () {
      lightbox.hidden = true;
      lightboxImage.removeAttribute("src");
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !lightbox.hidden) {
        lightbox.hidden = true;
        lightboxImage.removeAttribute("src");
      }
    });
  }

  if (codeBlocks.length && document.body.dataset.codeCopy === "true") {
    codeBlocks.forEach(function (container) {
      if (container.querySelector(".code-copy-button")) {
        return;
      }
      var code = container.querySelector("td:last-child pre code, pre code");
      if (!code) {
        return;
      }
      var button = document.createElement("button");
      button.className = "code-copy-button";
      button.type = "button";
      button.textContent = "Copy";
      button.addEventListener("click", function () {
        var text = code.innerText;
        navigator.clipboard.writeText(text).then(function () {
          button.textContent = "Copied";
          window.setTimeout(function () {
            button.textContent = "Copy";
          }, 1200);
        });
      });
      container.appendChild(button);
    });
  }

  initSearch();

  if (document.getElementById("search")) {
    searchWatchTimer = window.setTimeout(function () {
      var pagefindRoot = document.getElementById("search");
      if (!pagefindRoot || pagefindRoot.dataset.pagefindInitialized === "true") {
        return;
      }
      if (!window.PagefindUI) {
        setSearchStatus("Pagefind search assets did not load. Rebuild the site with `hugo`, then run `npx -y pagefind --site public`, and confirm the deployed site contains `/pagefind/pagefind-ui.js`.");
        return;
      }
      setSearchStatus("Pagefind UI loaded, but the search index is not ready. Run `npx -y pagefind --site public` after building Hugo, and deploy the generated `pagefind/` directory with your site.");
    }, 1800);
  }
});
