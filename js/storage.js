/* ===========================================================
   storage.js —— 本地存储封装（课程项目，全部数据存浏览器本地）
   1. 用户表：yoro_users
   2. 登录态：yoro_session
   3. 收藏表：yoro_fav_ + 用户名
   =========================================================== */

var Store = (function () {
  var USER_KEY = 'yoro_users';
  var SESSION_KEY = 'yoro_session';
  var FAV_PREFIX = 'yoro_fav_';

  /* ---------- 基础读写（带 JSON 容错） ---------- */
  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- 用户 ---------- */
  function getUsers() {
    return read(USER_KEY, {});
  }

  function findUser(name) {
    var users = getUsers();
    return users[name] || null;
  }

  function addUser(name, pwd) {
    var users = getUsers();
    users[name] = { pwd: pwd, createdAt: new Date().toISOString() };
    return write(USER_KEY, users);
  }

  /* ---------- 登录态 ---------- */
  function getSession() {
    return read(SESSION_KEY, null);
  }

  function setSession(user) {
    return write(SESSION_KEY, user);
  }

  function clearSession() {
    window.localStorage.removeItem(SESSION_KEY);
  }

  function isLogin() {
    var s = getSession();
    return !!(s && s.name);
  }

  /* ---------- 收藏 ---------- */
  function favKey(name) {
    return FAV_PREFIX + name;
  }

  function getFavs(name) {
    if (!name) {
      return [];
    }
    return read(favKey(name), []);
  }

  function isFaved(name, id) {
    var list = getFavs(name);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        return true;
      }
    }
    return false;
  }

  function addFav(name, item) {
    var list = getFavs(name);
    if (isFaved(name, item.id)) {
      return list;
    }
    list.push(item);
    write(favKey(name), list);
    return list;
  }

  function removeFav(name, id) {
    var list = getFavs(name);
    var next = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== id) {
        next.push(list[i]);
      }
    }
    write(favKey(name), next);
    return next;
  }

  function toggleFav(name, item) {
    if (isFaved(name, item.id)) {
      removeFav(name, item.id);
      return false;
    }
    addFav(name, item);
    return true;
  }

  return {
    getUsers: getUsers,
    findUser: findUser,
    addUser: addUser,
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    isLogin: isLogin,
    getFavs: getFavs,
    isFaved: isFaved,
    addFav: addFav,
    removeFav: removeFav,
    toggleFav: toggleFav
  };
})();
