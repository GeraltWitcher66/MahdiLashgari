(function () {
  'use strict';

  var body = document.body;
  var prefix = body.getAttribute('data-prefix') || '';
  var lang = body.getAttribute('data-lang') || 'fa';

  /* ------------------------------------------------------------------ */
  /* Mobile navigation                                                   */
  /* ------------------------------------------------------------------ */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Gallery lightbox                                                    */
  /* ------------------------------------------------------------------ */

  var links = Array.prototype.slice.call(document.querySelectorAll('.gallery-link'));

  if (links.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML =
      '<button class="lb-close" type="button" aria-label="' +
      (lang === 'fa' ? 'بستن' : 'Close') +
      '">&times;</button>' +
      '<button class="lb-prev" type="button" aria-label="' +
      (lang === 'fa' ? 'تصویر قبلی' : 'Previous image') +
      '">&#8249;</button>' +
      '<img alt="">' +
      '<p class="lb-caption"></p>' +
      '<button class="lb-next" type="button" aria-label="' +
      (lang === 'fa' ? 'تصویر بعدی' : 'Next image') +
      '">&#8250;</button>';
    document.body.appendChild(box);

    var image = box.querySelector('img');
    var caption = box.querySelector('.lb-caption');
    var current = 0;

    function show(index) {
      current = (index + links.length) % links.length;
      var trigger = links[current];
      image.src = trigger.getAttribute('href');
      image.alt = trigger.querySelector('img') ? trigger.querySelector('img').alt : '';
      caption.textContent = trigger.getAttribute('data-caption') || '';
    }

    function open(index) {
      show(index);
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      box.querySelector('.lb-close').focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      links[current].focus();
    }

    links.forEach(function (link, index) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        open(index);
      });
    });

    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function () {
      show(current - 1);
    });
    box.querySelector('.lb-next').addEventListener('click', function () {
      show(current + 1);
    });
    box.addEventListener('click', function (event) {
      if (event.target === box) {
        close();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (!box.classList.contains('is-open')) {
        return;
      }
      if (event.key === 'Escape') {
        close();
      } else if (event.key === 'ArrowRight') {
        show(lang === 'fa' ? current - 1 : current + 1);
      } else if (event.key === 'ArrowLeft') {
        show(lang === 'fa' ? current + 1 : current - 1);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Contact form (presentation only)                                    */
  /* ------------------------------------------------------------------ */

  var form = document.getElementById('contact-form');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = document.getElementById('contact-status');
      if (status) {
        status.textContent =
          lang === 'fa'
            ? 'این فرم در نسخه نمایشی به سرور ارسال نمی‌شود. برای ارتباط از نشانی‌های تماس استفاده کنید.'
            : 'This form is not connected to a server in the static version. Please use the contact details instead.';
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Internal search over data.json                                      */
  /* ------------------------------------------------------------------ */

  var input = document.getElementById('search-input');

  if (input) {
    var resultsBox = document.getElementById('search-results');
    var countBox = document.getElementById('search-count');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
    var labels = {
      fa: { invention: 'اختراع', article: 'مقاله', post: 'مطلب وبلاگ' },
      en: { invention: 'Invention', article: 'Article', post: 'Blog post' }
    };
    var emptyText = {
      fa: 'نتیجه‌ای برای این جست‌وجو پیدا نشد.',
      en: 'No results found for this search.'
    };
    var hint = {
      fa: 'برای جست‌وجو، بخشی از عنوان یا موضوع را وارد کنید.',
      en: 'Type part of a title or topic to search.'
    };
    var allLabel = { fa: 'همه', en: 'All' };
    var countLabel = {
      fa: function (n) {
        return n + ' نتیجه';
      },
      en: function (n) {
        return n + ' result' + (n === 1 ? '' : 's');
      }
    };

    var items = [];
    var activeType = 'all';

    function text(value) {
      return (value || '').toString().toLowerCase();
    }

    function normalize(value) {
      return text(value)
        .replace(/[\u064A]/g, 'ی')
        .replace(/[\u0643]/g, 'ک')
        .replace(/[\u200C]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function render() {
      var query = normalize(input.value);
      var filtered = items.filter(function (item) {
        if (activeType !== 'all' && item.type !== activeType) {
          return false;
        }
        if (!query) {
          return true;
        }
        var haystack = normalize(
          [item.title_fa, item.title_en, item.summary_fa, item.summary_en].join(' ')
        );
        return haystack.indexOf(query) !== -1;
      });

      resultsBox.innerHTML = '';

      if (!query && activeType === 'all') {
        countBox.textContent = '';
        var hintEl = document.createElement('p');
        hintEl.className = 'empty-state';
        hintEl.textContent = hint[lang] || hint.fa;
        resultsBox.appendChild(hintEl);
        return;
      }

      countBox.textContent = countLabel[lang](filtered.length);

      if (!filtered.length) {
        var emptyEl = document.createElement('p');
        emptyEl.className = 'empty-state';
        emptyEl.textContent = emptyText[lang] || emptyText.fa;
        resultsBox.appendChild(emptyEl);
        return;
      }

      filtered.forEach(function (item) {
        var wrap = document.createElement('div');
        wrap.className = 'result';

        var title = document.createElement('h3');
        var link = document.createElement('a');
        var url = lang === 'fa' ? item.url_fa : item.url_en;
        link.href = prefix + url;
        link.textContent = lang === 'fa' ? item.title_fa : item.title_en;
        title.appendChild(link);

        var meta = document.createElement('div');
        meta.className = 'result-type';
        meta.textContent =
          (labels[lang] ? labels[lang][item.type] : item.type) + ' · ' + (item.year || '');

        var summary = document.createElement('p');
        summary.textContent = lang === 'fa' ? item.summary_fa || '' : item.summary_en || '';

        title.insertBefore(meta, title.firstChild);
        wrap.appendChild(title);
        wrap.appendChild(summary);
        resultsBox.appendChild(wrap);
      });
    }

    fetch(prefix + 'data.json')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('data');
        }
        return response.json();
      })
      .then(function (data) {
        items = Array.isArray(data.items) ? data.items : [];
        render();
      })
      .catch(function () {
        countBox.textContent = '';
        resultsBox.innerHTML =
          '<p class="empty-state">' +
          (lang === 'fa'
            ? 'فایل داده جست‌وجو بارگذاری نشد.'
            : 'The search data file could not be loaded.') +
          '</p>';
      });

    input.addEventListener('input', render);

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterButtons.forEach(function (other) {
          other.classList.remove('is-active');
          other.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('is-active');
        button.setAttribute('aria-pressed', 'true');
        activeType = button.getAttribute('data-type');
        render();
      });
    });

    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      input.value = params.get('q');
      render();
    }
  }
})();
