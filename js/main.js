/* ===========================================================
   main.js —— 站点交互脚本
   包含：二级导航、首页轮播、滚动吸顶、回到顶部、
        搜索过滤、滚动显现、收藏按钮、收藏夹渲染、投稿表单
   =========================================================== */

document.addEventListener('DOMContentLoaded', function () {

  initHeader();
  initCarousel();
  initBackTop();
  initSearch();
  initReveal();
  initFavButtons();
  initFavPage();
  initSubmitForm();

  /* ---------------------------------------------------------
     1. 顶部：移动端菜单展开 + 滚动加阴影
     --------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
        toggle.innerHTML = nav.classList.contains('is-open') ? '×' : '☰';
      });
    }

    if (header) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 10) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      });
    }
  }

  /* ---------------------------------------------------------
     2. 首页轮播：自动播放 + 圆点 + 左右箭头
     --------------------------------------------------------- */
  function initCarousel() {
    var hero = document.querySelector('.hero');
    if (!hero) {
      return;
    }

    var slides = hero.querySelectorAll('.slide');
    var dots = hero.querySelectorAll('.dot');
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function go(n) {
      if (n < 0) {
        n = slides.length - 1;
      }
      if (n >= slides.length) {
        n = 0;
      }
      index = n;
      for (var i = 0; i < slides.length; i++) {
        slides[i].classList.remove('is-active');
        if (dots[i]) {
          dots[i].classList.remove('is-active');
        }
      }
      slides[index].classList.add('is-active');
      if (dots[index]) {
        void dots[index].offsetWidth; /* 强制回流，让进度条动画每次都从头走 */
        dots[index].classList.add('is-active');
      }
    }

    function play() {
      timer = setInterval(function () {
        go(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    for (var i = 0; i < dots.length; i++) {
      (function (n) {
        dots[n].addEventListener('click', function () {
          go(n);
        });
      })(i);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        go(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        go(index + 1);
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);

    play();
  }

  /* ---------------------------------------------------------
     3. 回到顶部
     --------------------------------------------------------- */
  function initBackTop() {
    var btn = document.querySelector('.back-top');
    if (!btn) {
      return;
    }

    window.addEventListener('scroll', function () {
      if (window.scrollY > 360) {
        btn.classList.add('is-show');
      } else {
        btn.classList.remove('is-show');
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     4. 搜索：按文字过滤当前页的工具卡片
     --------------------------------------------------------- */
  function initSearch() {
    var input = document.querySelector('[data-search]');
    var noResult = document.querySelector('.no-result');
    if (!input) {
      return;
    }

    var cards = document.querySelectorAll('.tool-card');

    function run() {
      var key = input.value.trim().toLowerCase();
      var shown = 0;

      for (var i = 0; i < cards.length; i++) {
        var text = cards[i].textContent.toLowerCase();
        var hit = !key || text.indexOf(key) > -1;
        cards[i].style.display = hit ? '' : 'none';
        if (hit) {
          shown++;
        }
      }

      if (noResult) {
        noResult.classList.toggle('is-show', key !== '' && shown === 0);
      }
    }

    input.addEventListener('input', run);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        run();
      }
    });

    var form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        run();
        if (!cards.length) {
          location.href = input.getAttribute('data-search-target');
        }
      });
    }
  }

  /* ---------------------------------------------------------
     5. 滚动显现动画
     --------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) {
        items[i].classList.add('is-in');
      }
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    for (var j = 0; j < items.length; j++) {
      io.observe(items[j]);
    }
  }

  /* ---------------------------------------------------------
     6. 工具卡片上的收藏按钮
     --------------------------------------------------------- */
  function initFavButtons() {
    var buttons = document.querySelectorAll('[data-fav-id]');
    if (!buttons.length) {
      return;
    }

    var session = Store.getSession();

    function paint(btn, on) {
      btn.classList.toggle('is-on', on);
      btn.textContent = on ? '已收藏' : '收藏';
    }

    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        var id = btn.getAttribute('data-fav-id');
        var name = session ? session.name : null;
        if (name) {
          paint(btn, Store.isFaved(name, id));
        }

        btn.addEventListener('click', function () {
          if (!Store.isLogin()) {
            var confirmGo = window.confirm('登录后才能收藏，是否现在去登录？');
            if (confirmGo) {
              location.href = btn.getAttribute('data-login-url');
            }
            return;
          }
          var s = Store.getSession();
          var item = {
            id: id,
            name: btn.getAttribute('data-fav-name'),
            url: btn.getAttribute('data-fav-url'),
            desc: btn.getAttribute('data-fav-desc')
          };
          var on = Store.toggleFav(s.name, item);
          paint(btn, on);
          if (window.toastMsg) {
            window.toastMsg(on ? '已收进「我的收藏」，下次直接取货' : '已从收藏架取下');
          }
        });
      })(buttons[i]);
    }
  }

  /* ---------------------------------------------------------
     7. 收藏夹页面渲染
     --------------------------------------------------------- */
  function initFavPage() {
    var box = document.querySelector('[data-fav-list]');
    if (!box) {
      return;
    }

    var session = Store.getSession();
    var emptyBox = document.querySelector('[data-fav-empty]');
    var countBox = document.querySelector('[data-fav-count]');

    function render() {
      if (!session || !session.name) {
        box.innerHTML = '';
        if (emptyBox) {
          emptyBox.classList.add('is-show');
        }
        return;
      }

      var list = Store.getFavs(session.name);
      if (countBox) {
        countBox.textContent = String(list.length);
      }

      if (!list.length) {
        box.innerHTML = '';
        if (emptyBox) {
          emptyBox.classList.add('is-show');
        }
        return;
      }

      if (emptyBox) {
        emptyBox.classList.remove('is-show');
      }

      var html = '';
      for (var i = 0; i < list.length; i++) {
        html +=
          '<div class="tool-card">' +
          '  <div class="tool-head">' +
          '    <div class="tool-icon t-accent">' + (i + 1) + '</div>' +
          '    <div><h3 class="tool-name">' + list[i].name + '</h3>' +
          '      <span class="tool-tag">我的收藏</span></div>' +
          '  </div>' +
          '  <p class="tool-desc">' + (list[i].desc || '已加入收藏，随时可回到这一条。') + '</p>' +
          '  <div class="tool-foot">' +
          '    <a class="mini-link" href="' + list[i].url + '">打开详情 &rsaquo;</a>' +
          '    <button class="fav-btn is-on" type="button" data-remove="' + list[i].id + '">取消收藏</button>' +
          '  </div>' +
          '</div>';
      }
      box.innerHTML = html;

      var removeBtns = box.querySelectorAll('[data-remove]');
      for (var k = 0; k < removeBtns.length; k++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            Store.removeFav(session.name, btn.getAttribute('data-remove'));
            render();
          });
        })(removeBtns[k]);
      }
    }

    render();
  }

  /* ---------------------------------------------------------
     8. 投稿页表单（本地提示，不提交服务器）
     --------------------------------------------------------- */
  function initSubmitForm() {
    var form = document.querySelector('[data-form="submit"]');
    if (!form) {
      return;
    }

    Validate.bind(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');

      if (!Validate.checkForm(form)) {
        return;
      }

      if (msg) {
        msg.className = 'form-msg ok is-show';
        msg.textContent = '投稿已记录在本地，感谢推荐。课程项目中不上传服务器。';
      }
      if (window.toastMsg) {
        window.toastMsg('投稿已记录，柜台收到了');
      }
      form.reset();
    });
  }
});

/* ===========================================================
   Rare UI 思路的原生实装：滚动进度条
   顶部 3px 工业橙进度条，随页面滚动实时前进；
   prefers-reduced-motion 时不做平滑处理，仅跟随滚动。
   =========================================================== */
(function () {
  'use strict';

  var bar = document.createElement('div');
  bar.id = 'spbar';
  document.body.appendChild(bar);

  function update() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var p = max > 0 ? doc.scrollTop / max : 0;
    bar.style.width = (p * 100) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ===========================================================
   Rare UI 思路交互扩展（dir-3 迁移）：铃铛/toast/重力字母/营业徽章
   - 铃铛注入 .header-tools，点击摇铃 + 左下角 toast
   - toastMsg 挂到 window，收藏、投稿等处可直接调用
   - .page-title / .section-title 逐字落下（纯文本标题才启用）
   - 首页 hero 右上角「柜台营业中」流体球徽章
   - prefers-reduced-motion 时关闭全部动画
   =========================================================== */
(function () {
  'use strict';

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* toast 容器 */
  var box = document.createElement('div');
  box.id = 'toasts';
  document.body.appendChild(box);

  window.toastMsg = function (msg) {
    var d = document.createElement('div');
    d.className = 'toast';
    d.textContent = msg;
    box.appendChild(d);
    requestAnimationFrame(function () {
      d.classList.add('on');
    });
    setTimeout(function () {
      d.classList.remove('on');
      setTimeout(function () { d.remove(); }, 300);
    }, 3200);
  };

  /* 铃铛：注入全站共用的 header 工具区 */
  var tools = document.querySelector('.header-tools');
  if (tools) {
    var bell = document.createElement('button');
    bell.className = 'bell';
    bell.type = 'button';
    bell.setAttribute('aria-label', '讯息通知');
    bell.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>' +
      '<path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><i class="bdg">3</i>';
    tools.insertBefore(bell, tools.firstChild);
    bell.addEventListener('click', function () {
      bell.classList.add('ring');
      setTimeout(function () { bell.classList.remove('ring'); }, 600);
      window.toastMsg('柜台有 3 条新讯息：站点进入联调阶段，评测已上新，收藏别忘了取货');
    });
  }

  /* 营业徽章：只在首页 hero 出现 */
  var hero = document.querySelector('.hero');
  if (hero && !document.querySelector('.live-badge')) {
    var badge = document.createElement('div');
    badge.className = 'live-badge';
    badge.innerHTML = '<span class="orb"></span>柜台营业中';
    hero.appendChild(badge);
  }

  /* 重力字母：主标题逐字落下 */
  if (!RM && 'IntersectionObserver' in window) {
    var titles = document.querySelectorAll('.page-title, .section-title');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('k-drop');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    for (var i = 0; i < titles.length; i++) {
      var t = titles[i];
      if (t.children.length) { continue; /* 只处理纯文本标题 */ }
      var txt = t.textContent;
      t.textContent = '';
      for (var j = 0; j < txt.length; j++) {
        var s = document.createElement('span');
        s.textContent = txt.charAt(j) === ' ' ? '\u00A0' : txt.charAt(j);
        s.style.animationDelay = (j * 45) + 'ms';
        t.appendChild(s);
      }
      t.classList.add('k-armed');
      io.observe(t);
    }
  }
})();
