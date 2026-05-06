document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var sidebar = document.querySelector("[data-sidebar]");
  var themeToggle = document.querySelector("[data-theme-toggle]");
  var tocLinks = document.querySelectorAll(".page-toc a");
  var articleImages = document.querySelectorAll(".article-body img");
  var sidebarLinks = document.querySelectorAll(".sidebar a");

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
});
