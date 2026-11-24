/* ===========================================================
   auth.js —— 注册 / 登录 / 退出（本地校验 + 本地存储）
   页面加载后自动渲染顶部的登录状态
   =========================================================== */

var Auth = (function () {

  /* ---------- 顶部用户区渲染 ---------- */
  function renderHeaderUser() {
    var box = document.querySelector('[data-user-area]');
    if (!box) {
      return;
    }
    var session = Store.getSession();

    if (session && session.name) {
      box.innerHTML =
        '<span class="user-name">' + session.name + '</span>' +
        '<a href="' + box.getAttribute('data-fav-url') + '">我的收藏</a>' +
        '<button class="logout-btn" type="button" data-logout>退出</button>';
    } else {
      box.innerHTML =
        '<div class="guest-links">' +
        '<a href="' + box.getAttribute('data-login-url') + '">登录</a>' +
        '<a href="' + box.getAttribute('data-register-url') + '">注册</a>' +
        '</div>';
    }

    var logout = box.querySelector('[data-logout]');
    if (logout) {
      logout.addEventListener('click', function () {
        Store.clearSession();
        location.reload();
      });
    }
  }

  /* ---------- 注册 ---------- */
  function bindRegister(form) {
    Validate.bind(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');
      var nameInput = form.querySelector('[name="username"]');
      var pwdInput = form.querySelector('[name="password"]');
      var pwd2Input = form.querySelector('[name="password2"]');
      var agree = form.querySelector('[name="agree"]');

      if (!Validate.checkForm(form)) {
        return;
      }

      /* 两次密码必须一致 */
      if (pwdInput.value.trim() !== pwd2Input.value.trim()) {
        Validate.showError(pwd2Input, '两次输入的密码不一致');
        return;
      }
      Validate.clearError(pwd2Input);

      /* 协议必须勾选 */
      if (agree && !agree.checked) {
        if (msg) {
          msg.className = 'form-msg bad is-show';
          msg.textContent = '请先阅读并同意站点使用说明';
        }
        return;
      }

      var name = nameInput.value.trim();

      /* 账号不能重复 */
      if (Store.findUser(name)) {
        Validate.showError(nameInput, '该账号已注册，请直接登录');
        return;
      }

      Store.addUser(name, pwdInput.value.trim());
      Store.setSession({ name: name, loginAt: Date.now() });

      if (msg) {
        msg.className = 'form-msg ok is-show';
        msg.textContent = '注册成功，正在进入站点…';
      }

      setTimeout(function () {
        location.href = form.getAttribute('data-redirect');
      }, 900);
    });
  }

  /* ---------- 登录 ---------- */
  function bindLogin(form) {
    Validate.bind(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');
      var nameInput = form.querySelector('[name="username"]');
      var pwdInput = form.querySelector('[name="password"]');

      if (!Validate.checkForm(form)) {
        return;
      }

      var name = nameInput.value.trim();
      var user = Store.findUser(name);

      if (!user) {
        if (msg) {
          msg.className = 'form-msg bad is-show';
          msg.textContent = '账号不存在，请先注册';
        }
        return;
      }
      if (user.pwd !== pwdInput.value.trim()) {
        if (msg) {
          msg.className = 'form-msg bad is-show';
          msg.textContent = '密码不正确，请重新输入';
        }
        return;
      }

      Store.setSession({ name: name, loginAt: Date.now() });
      if (msg) {
        msg.className = 'form-msg ok is-show';
        msg.textContent = '登录成功，正在跳转…';
      }

      setTimeout(function () {
        location.href = form.getAttribute('data-redirect');
      }, 800);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderHeaderUser();

    var regForm = document.querySelector('[data-form="register"]');
    if (regForm) {
      bindRegister(regForm);
    }

    var loginForm = document.querySelector('[data-form="login"]');
    if (loginForm) {
      bindLogin(loginForm);
    }
  });

  return {
    renderHeaderUser: renderHeaderUser,
    bindRegister: bindRegister,
    bindLogin: bindLogin
  };
})();
