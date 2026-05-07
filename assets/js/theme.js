document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var sidebar = document.querySelector("[data-sidebar]");
  var themeToggle = document.querySelector("[data-theme-toggle]");
  var tocLinks = document.querySelectorAll(".page-toc a");
  var articleImages = document.querySelectorAll(".article-body img");
  var sidebarLinks = document.querySelectorAll(".sidebar a");
  var codeBlocks = document.querySelectorAll(".article-body .highlight");
  var searchStatus = document.getElementById("search-status");
  var searchResults = document.getElementById("search-results");
  var searchWatchTimer = null;
  var setSearchStatus = function (message) {
    if (!searchStatus) {
      return;
    }
    searchStatus.hidden = false;
    searchStatus.textContent = message;
  };
  var escapeHtml = function (value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };
  var tokenizeQuery = function (query) {
    return query
      .toLowerCase()
      .split(/[\s,.;:!?()\-_/]+/)
      .map(function (part) {
        return part.trim();
      })
      .filter(Boolean);
  };
  var isCJKQuery = function (query) {
    return /[\u3400-\u9fff]/.test(query);
  };
  var includesToken = function (value, tokens) {
    if (!value) {
      return false;
    }
    var normalized = String(value).toLowerCase();
    return tokens.some(function (token) {
      return normalized.indexOf(token) !== -1;
    });
  };
  var includesQuery = function (value, query) {
    if (!value || !query) {
      return false;
    }
    return String(value).toLowerCase().indexOf(query.toLowerCase()) !== -1;
  };
  var initSearch = function () {
    var pagefindRoot = document.getElementById("search");
    if (!pagefindRoot || !window.FlexSearch || pagefindRoot.dataset.searchInitialized === "true") {
      return;
    }
    var input = pagefindRoot.querySelector("#search-input");
    var indexUrl = pagefindRoot.dataset.searchIndexUrl || "/index.json";
    var limit = Number(pagefindRoot.dataset.searchLimit || 10);
    var documents = new Map();
    var index = new window.FlexSearch.Document({
      tokenize: "full",
      resolution: 9,
      context: true,
      cache: true,
      document: {
        id: "id",
        index: ["title", "summary", "content", "section", "tags"],
        store: ["title", "permalink", "summary", "section", "date", "tags"]
      }
    });

    var renderResults = function (items) {
      if (!searchResults || !searchStatus) {
        return;
      }

      if (!items.length) {
        searchResults.hidden = true;
        searchResults.innerHTML = "";
        setSearchStatus("No results found.");
        return;
      }

      searchResults.hidden = false;
      searchStatus.hidden = false;
      searchStatus.textContent = items.length + " result" + (items.length === 1 ? "" : "s");
      searchResults.innerHTML = items.map(function (item) {
        var summary = item.summary || "";
        var snippet = summary.length > 180 ? summary.slice(0, 180) + "..." : summary;
        var matchSource = item.matchSource || "content";
        return [
          '<a class="search-result-card" href="', escapeHtml(item.permalink), '">',
          '<div class="search-result-meta"><span>', escapeHtml(item.section || "page"), '</span><span>', escapeHtml(item.date || ""), "</span></div>",
          '<strong class="search-result-title">', escapeHtml(item.title), "</strong>",
          '<span class="search-result-match">Matched in ', escapeHtml(matchSource), "</span>",
          '<p class="search-result-snippet">', escapeHtml(snippet), "</p>",
          "</a>"
        ].join("");
      }).join("");
    };

    var performSearch = function (query) {
      if (!query) {
        searchResults.hidden = true;
        searchResults.innerHTML = "";
        setSearchStatus("Start typing to search the site.");
        return;
      }

      var searchLimit = Number.isNaN(limit) ? 10 : limit;
      var tokens = tokenizeQuery(query);
      var normalizedQuery = query.toLowerCase();
      var fieldWeights = {
        title: 8,
        tags: 6,
        summary: 4,
        section: 3,
        content: 1
      };
      var matchLabels = {
        title: "title",
        tags: "tags",
        summary: "summary",
        section: "section",
        content: "content"
      };
      var scores = new Map();

      Object.keys(fieldWeights).forEach(function (field) {
        var fieldResults = index.search(query, {
          index: field,
          limit: searchLimit * 3,
          enrich: true,
          suggest: true
        });

        fieldResults.forEach(function (group) {
          group.result.forEach(function (entry, position) {
            var doc = entry.doc || documents.get(entry.id);
            if (!doc) {
              return;
            }

            var existing = scores.get(doc.id) || {
              doc: doc,
              score: 0,
              matchSource: matchLabels[field]
            };

            var baseScore = fieldWeights[field] * 100;
            var rankScore = Math.max(0, 40 - position);
            var tokenBonus = 0;

            if (field === "tags") {
              tokenBonus = includesToken((doc.tags || []).join(" "), tokens) ? 40 : 0;
            } else {
              tokenBonus = includesToken(doc[field], tokens) ? 20 : 0;
            }

            existing.score += baseScore + rankScore + tokenBonus;

            if (fieldWeights[field] > fieldWeights[existing.matchSource] || existing.matchSource === "content") {
              existing.matchSource = matchLabels[field];
            }

            scores.set(doc.id, existing);
          });
        });
      });

      if (isCJKQuery(query) || normalizedQuery.length <= 2) {
        documents.forEach(function (doc) {
          var manualScore = 0;
          var matchSource = "";

          if (includesQuery(doc.title, normalizedQuery)) {
            manualScore += 900;
            matchSource = "title";
          }
          if (includesQuery((doc.tags || []).join(" "), normalizedQuery)) {
            manualScore += 700;
            matchSource = matchSource || "tags";
          }
          if (includesQuery(doc.summary, normalizedQuery)) {
            manualScore += 450;
            matchSource = matchSource || "summary";
          }
          if (includesQuery(doc.section, normalizedQuery)) {
            manualScore += 300;
            matchSource = matchSource || "section";
          }
          if (includesQuery(doc.content, normalizedQuery)) {
            manualScore += 120;
            matchSource = matchSource || "content";
          }

          if (!manualScore) {
            return;
          }

          var existing = scores.get(doc.id) || {
            doc: doc,
            score: 0,
            matchSource: matchSource || "content"
          };

          existing.score += manualScore;
          if (!existing.matchSource || existing.matchSource === "content") {
            existing.matchSource = matchSource || existing.matchSource;
          }
          scores.set(doc.id, existing);
        });
      }

      var ranked = Array.from(scores.values())
        .sort(function (left, right) {
          if (right.score !== left.score) {
            return right.score - left.score;
          }
          return String(right.doc.date || "").localeCompare(String(left.doc.date || ""));
        })
        .slice(0, searchLimit)
        .map(function (entry) {
          entry.doc.matchSource = entry.matchSource;
          return entry.doc;
        });

      renderResults(ranked);
    };

    fetch(indexUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Search index request failed with " + response.status);
        }
        return response.json();
      })
      .then(function (items) {
        items.forEach(function (item) {
          documents.set(item.id, item);
          index.add(item);
        });

        pagefindRoot.dataset.searchInitialized = "true";
        setSearchStatus("Start typing to search the site.");
        if (searchWatchTimer) {
          window.clearTimeout(searchWatchTimer);
          searchWatchTimer = null;
        }

        if (input) {
          input.addEventListener("input", function () {
            performSearch(input.value.trim());
          });
        }
      })
      .catch(function (error) {
        setSearchStatus("Search index could not be loaded from " + indexUrl + ". Ensure your site outputs /index.json. " + error.message);
      });
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
      if (!pagefindRoot || pagefindRoot.dataset.searchInitialized === "true") {
        return;
      }
      if (!window.FlexSearch) {
        setSearchStatus("FlexSearch did not load. Check network access or vendor the library locally.");
        return;
      }
      setSearchStatus("Search index is not ready. Ensure Hugo outputs /index.json and that the file is reachable.");
    }, 1800);
  }
});
