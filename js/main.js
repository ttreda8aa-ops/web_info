/* ============================================================
   نطاق — موقع التعريف بنظام إدارة المبيعات
   التفاعلات: التمرير، العدادات، التبويبات، الأكورديون، القائمة
   ============================================================ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll margin for sticky header ---------- */
  var sections = document.querySelectorAll('main section[id], section[id]');
  sections.forEach(function (s) { s.style.scrollMarginTop = '84px'; });

  /* ---------- Scroll progress + header + back-to-top ---------- */
  var progressBar = document.getElementById('scroll-progress');
  var header = document.getElementById('site-header');
  var backTop = document.getElementById('back-top');

  function onScroll() {
    var top = window.scrollY || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.transform = 'scaleX(' + (height > 0 ? top / height : 0) + ')';
    if (header) header.classList.toggle('scrolled', top > 10);
    if (backTop) backTop.classList.toggle('show', top > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('.stat-num');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reducedMotion) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { counterObserver.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = (c.getAttribute('data-count') || '0') + (c.getAttribute('data-suffix') || '');
    });
  }

  /* ---------- Active nav link highlighting ---------- */
  var navLinks = document.querySelectorAll('.main-nav .nav-link');
  var linkTargets = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    linkTargets[id] = link;
  });
  if ('IntersectionObserver' in window) {
    var sectionIds = Object.keys(linkTargets).filter(function (id) { return document.getElementById(id); });
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          var active = linkTargets[entry.target.id];
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sectionIds.forEach(function (id) { sectionObserver.observe(document.getElementById(id)); });
  }
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      const menuOpen = drawer.classList.contains('open');
      if (!menuOpen) return;
      closeDrawer();
    });
  });

  /* ---------- Tabs (modules) ---------- */
  var tabButtons = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');
  function activateTab(tabId) {
    tabButtons.forEach(function (btn) {
      var on = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    tabPanels.forEach(function (panel) {
      panel.classList.toggle('active', panel.id === 'tab-' + tabId);
    });
  }
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { activateTab(btn.getAttribute('data-tab')); });
  });
  /* Footer module links → open matching tab then scroll */
  var tabHintLinks = document.querySelectorAll('[data-tab-hint]');
  tabHintLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      activateTab(link.getAttribute('data-tab-hint'));
      document.getElementById('modules').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll('.faq-item');
  function closeFaq(item) {
    var answer = item.querySelector('.faq-a');
    var btn = item.querySelector('.faq-q');
    item.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    if (answer) answer.style.maxHeight = null;
  }
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    btn.addEventListener('click', function () {
      var answer = item.querySelector('.faq-a');
      var isOpen = item.classList.contains('open');
      faqItems.forEach(closeFaq);
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Mobile drawer ---------- */
  var drawer = document.getElementById('nav-drawer');
  var scrim = document.getElementById('drawer-scrim');
  var toggle = document.getElementById('nav-toggle');
  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    scrim.classList.add('show');
    scrim.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (toggle && drawer && scrim) {
    toggle.addEventListener('click', function () {
      if (drawer.classList.contains('open')) closeDrawer(); else openDrawer();
    });
    scrim.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }
})();