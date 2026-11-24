/* ===========================================================
   validate.js —— 表单本地校验
   只用前端 JavaScript 完成，不提交服务器
   =========================================================== */

var Validate = (function () {

  /* ---------- 单字段校验规则 ---------- */
  var RULES = {
    username: {
      test: function (v) {
        return /^[A-Za-z0-9_]{4,16}$/.test(v);
      },
      msg: '账号需为 4–16 位字母、数字或下划线'
    },
    password: {
      test: function (v) {
        if (v.length < 6 || v.length > 20) {
          return false;
        }
        return /[A-Za-z]/.test(v) && /[0-9]/.test(v);
      },
      msg: '密码需 6–20 位，且同时包含字母和数字'
    },
    email: {
      test: function (v) {
        return /^[\w.+-]+@[\w-]+\.[\w.-]{2,}$/.test(v);
      },
      msg: '邮箱格式不正确，例如 name@example.com'
    },
    phone: {
      test: function (v) {
        return /^1[3-9]\d{9}$/.test(v);
      },
      msg: '请输入 11 位手机号'
    },
    nickname: {
      test: function (v) {
        return v.length >= 2 && v.length <= 12;
      },
      msg: '昵称需为 2–12 个字'
    }
  };

  /* ---------- 显示 / 清除错误 ---------- */
  function showError(input, msg) {
    var row = input.closest('.form-row');
    if (!row) {
      return;
    }
    var tip = row.querySelector('.form-error');
    input.classList.add('is-error');
    if (tip) {
      tip.textContent = msg;
      tip.classList.add('is-show');
    }
  }

  function clearError(input) {
    var row = input.closest('.form-row');
    if (!row) {
      return;
    }
    var tip = row.querySelector('.form-error');
    input.classList.remove('is-error');
    if (tip) {
      tip.classList.remove('is-show');
    }
  }

  /* ---------- 校验一个字段 ---------- */
  function check(input) {
    var ruleName = input.getAttribute('data-rule');
    var value = (input.value || '').trim();

    if (input.hasAttribute('data-required') && value === '') {
      showError(input, '该项为必填');
      return false;
    }
    if (value === '') {
      clearError(input);
      return true;
    }
    if (!ruleName || !RULES[ruleName]) {
      clearError(input);
      return true;
    }
    if (!RULES[ruleName].test(value)) {
      showError(input, RULES[ruleName].msg);
      return false;
    }
    clearError(input);
    return true;
  }

  /* ---------- 校验整张表单 ---------- */
  function checkForm(form) {
    var fields = form.querySelectorAll('[data-rule], [data-required]');
    var ok = true;
    for (var i = 0; i < fields.length; i++) {
      if (!check(fields[i])) {
        ok = false;
      }
    }
    return ok;
  }

  /* ---------- 绑定：失焦即时校验、输入清除错误 ---------- */
  function bind(form) {
    var fields = form.querySelectorAll('[data-rule], [data-required]');
    for (var i = 0; i < fields.length; i++) {
      (function (input) {
        input.addEventListener('blur', function () {
          check(input);
        });
        input.addEventListener('input', function () {
          if (input.classList.contains('is-error')) {
            check(input);
          }
        });
      })(fields[i]);
    }
  }

  return {
    check: check,
    checkForm: checkForm,
    bind: bind,
    showError: showError,
    clearError: clearError
  };
})();
