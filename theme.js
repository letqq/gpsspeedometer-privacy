(function () {
  var ROLES = ["bg", "on_surface", "on_surface_variant", "primary", "on_primary", "primary_container",
    "on_primary_container", "outline", "outline_variant", "surface_variant", "error"];
  var KEY = "gpsspeedometer-theme";
  var TTL = 30 * 24 * 3600 * 1000;
  var PATTERN = /^[dl][0-9a-fA-F]{66}$/;

  function read(name) {
    var m = new RegExp("[?&]" + name + "=([^&#]*)").exec(location.search);
    return m ? m[1] : null;
  }

  function remembered() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && PATTERN.test(s.v) && Date.now() - s.t < TTL) return s.v;
    } catch (e) {}
    return null;
  }

  function remember(v) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: v, t: Date.now() }));
    } catch (e) {}
  }

  function rgb(h) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function blend(fg, bg, a) {
    var f = rgb(fg), b = rgb(bg), out = "";
    for (var i = 0; i < 3; i++) {
      var c = Math.round(f[i] * a + b[i] * (1 - a));
      out += (c < 16 ? "0" : "") + c.toString(16);
    }
    return out;
  }

  function apply(v) {
    var body = v.slice(1).toLowerCase(), c = {};
    for (var i = 0; i < ROLES.length; i++) c[ROLES[i]] = body.slice(i * 6, i * 6 + 6);
    var box = blend(c.primary, c.bg, 0.1);
    var vars = {
      "--bg": c.bg,
      "--fg": c.on_surface,
      "--fgv": c.on_surface_variant,
      "--pr": c.primary,
      "--onpr": c.on_primary,
      "--prc": c.primary_container,
      "--onprc": c.on_primary_container,
      "--ol": c.outline,
      "--olv": c.outline_variant,
      "--line": blend(c.outline, c.bg, 0.2),
      "--ibox": box,
      "--iglyph": blend(c.primary, box, 0.9)
    };
    var root = document.documentElement;
    for (var k in vars) root.style.setProperty(k, "#" + vars[k]);
    root.style.setProperty("--fg-rgb", rgb(c.on_surface).join(","));
    root.style.setProperty("--onprc-rgb", rgb(c.on_primary_container).join(","));
    root.style.colorScheme = v.charAt(0) === "d" ? "dark" : "light";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#" + c.primary);
  }

  var passed = read("th");
  var value = null;
  if (passed && PATTERN.test(passed)) {
    value = passed;
    remember(value);
    if (history.replaceState) {
      var rest = location.search.replace(/([?&])th=[^&#]*&?/, "$1").replace(/[?&]$/, "");
      history.replaceState(null, "", location.pathname + rest + location.hash);
    }
  } else {
    value = remembered();
  }
  if (value) apply(value);
})();
