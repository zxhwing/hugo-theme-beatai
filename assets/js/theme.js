document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var sidebar = document.querySelector("[data-sidebar]");
  var tocLinks = document.querySelectorAll(".page-toc a");
  var articleImages = document.querySelectorAll(".article-body img");

  if (toggle && sidebar) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
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
  }
});
