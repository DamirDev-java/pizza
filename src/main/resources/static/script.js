
var API_BASE = "/api/v1/pizza";

var PRODUCTS = {
  1: { id: 1, name: "Пепперони", description: "Острая колбаса пепперони, моцарелла, томатный соус.", composition: ["Тесто", "Томатный соус", "Моцарелла", "Пепперони"], price: "9 €", priceNum: 9, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=500&fit=crop" },
  2: { id: 2, name: "4 сыра", description: "Моцарелла, дор блю, пармезан, горгонзола.", composition: ["Тесто", "Сливочный соус", "Моцарелла", "Дор Блю", "Пармезан", "Горгонзола"], price: "11 €", priceNum: 11, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=500&fit=crop" },
  3: { id: 3, name: "Маргарита", description: "Классическая пицца с томатами и базиликом.", composition: ["Тесто", "Томатный соус", "Моцарелла", "Помидоры", "Базилик"], price: "8 €", priceNum: 8, image: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=500&h=500&fit=crop" }
};

var CART_KEY = "pizzaCart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function setCart(arr) {
  localStorage.setItem(CART_KEY, JSON.stringify(arr));
}

function addToCart(pizzaName, quantity, price) {
  var cart = getCart();
  var amount = quantity * price;
  cart.push({ pizzaName: pizzaName, quantity: quantity, price: price, amount: amount });
  setCart(cart);
}

function getCartCount() {
  var cart = getCart();
  return cart.reduce(function (sum, item) { return sum + (item.quantity || 0); }, 0);
}

document.addEventListener("DOMContentLoaded", function () {
  initNavigation();
  initAuth();
  initProductPage();
  initMap();
  initAccountPage();
  initCartPage();
});

function initNavigation() {
  var btn = document.getElementById("btnOrder");
  if (btn) btn.addEventListener("click", function () { window.location.href = "product.html"; });

  document.querySelectorAll(".btn-card[data-href]").forEach(function (btn) {
    btn.addEventListener("click", function () { window.location.href = this.getAttribute("data-href"); });
  });

  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("open");
      navToggle.classList.toggle("open");
    });
  }
}

// Вход/регистрация — только на cabinet.html (есть authForm)
function initAuth() {
  var form = document.getElementById("authForm");
  if (!form) return;

  var user = localStorage.getItem("currentUser");
  if (user) {
    window.location.href = "account.html";
    return;
  }

  var mode = "login";
  var heading = document.getElementById("authHeading");
  var submitBtn = document.getElementById("authSubmit");
  var msg = document.getElementById("authMsg");
  var toggleBtn = document.getElementById("authToggle");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      mode = mode === "login" ? "register" : "login";
      if (msg) msg.textContent = "";
      if (mode === "register") {
        if (heading) heading.textContent = "Регистрация";
        if (submitBtn) submitBtn.textContent = "Зарегистрироваться";
        toggleBtn.textContent = "Уже есть аккаунт? Войти";
      } else {
        if (heading) heading.textContent = "Вход";
        if (submitBtn) submitBtn.textContent = "Войти";
        toggleBtn.textContent = "Нет аккаунта? Зарегистрироваться";
      }
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("authLogin").value.trim();
    var password = document.getElementById("authPass").value;
    if (!msg) return;

    if (mode === "register") {
      var xhrReg = new XMLHttpRequest();
      xhrReg.open("POST", API_BASE + "/register");
      xhrReg.setRequestHeader("Content-Type", "application/json");
      xhrReg.onload = function () {
        if (xhrReg.status >= 200 && xhrReg.status < 300) {
          msg.textContent = "Регистрация успешна. Войдите.";
          msg.style.color = "green";
        } else {
          msg.textContent = xhrReg.responseText || "Ошибка регистрации";
          msg.style.color = "red";
        }
      };
      xhrReg.onerror = function () { msg.textContent = "Сервер недоступен."; msg.style.color = "red"; };
      xhrReg.send(JSON.stringify({ email: email, password: password }));
      return;
    }

    var xhrLogin = new XMLHttpRequest();
    xhrLogin.open("POST", API_BASE + "/login");
    xhrLogin.setRequestHeader("Content-Type", "application/json");
    xhrLogin.onload = function () {
      if (xhrLogin.status >= 200 && xhrLogin.status < 300) {
        localStorage.setItem("currentUser", email);
        try {
          var data = JSON.parse(xhrLogin.responseText);
          if (data != null && data.id != null) {
            localStorage.setItem("currentUserId", String(data.id));
          }
          if (data != null && data.email != null) {
            localStorage.setItem("currentUser", data.email);
          }
        } catch (err) {}
        window.location.href = "account.html";
      } else {
        msg.textContent = xhrLogin.responseText || "Ошибка входа";
        msg.style.color = "red";
      }
    };
    xhrLogin.onerror = function () { msg.textContent = "Сервер недоступен."; msg.style.color = "red"; };
    xhrLogin.send(JSON.stringify({ email: email, password: password }));
  });
}

function initProductPage() {
  var productMenu = document.getElementById("productMenu");
  var productDetail = document.getElementById("productDetail");
  var productContent = document.getElementById("productContent");
  var productLoading = document.getElementById("productLoading");
  if (!productContent || !productLoading) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");

  if (!id && productMenu) {
    productMenu.hidden = false;
    var grid = document.getElementById("menuGrid");
    if (grid) {
      grid.innerHTML = Object.keys(PRODUCTS).map(function (k) {
        var p = PRODUCTS[k];
        return "<article class=\"pizza-card\"><img src=\"" + p.image + "\" alt=\"" + p.name + "\" loading=\"lazy\"><h3>" + p.name + "</h3><p>" + p.description.substring(0, 60) + "…</p><button class=\"btn-card\" data-href=\"product.html?id=" + p.id + "\">Подробнее</button></article>";
      }).join("");
      grid.querySelectorAll(".btn-card[data-href]").forEach(function (btn) {
        btn.addEventListener("click", function () { window.location.href = btn.getAttribute("data-href"); });
      });
    }
    document.title = "Меню — PizzaHouse";
    return;
  }

  if (productMenu) productMenu.hidden = true;
  if (productDetail) productDetail.hidden = false;

  id = parseInt(id, 10) || 1;
  var product = PRODUCTS[id] || PRODUCTS[1];

  productLoading.hidden = true;
  productContent.hidden = false;
  document.getElementById("productTitle").textContent = product.name;
  document.getElementById("productDesc").textContent = product.description;
  document.getElementById("productPrice").textContent = product.price;
  document.getElementById("pizzaImage").src = product.image;
  document.getElementById("pizzaImage").alt = product.name;
  var comp = document.getElementById("productComposition");
  if (comp) comp.innerHTML = product.composition.map(function (c) { return "<li>" + c + "</li>"; }).join("");
  document.title = product.name + " — PizzaHouse";

  var orderForm = document.getElementById("orderForm");
  if (orderForm) {
    var addMsg = document.createElement("p");
    addMsg.className = "add-to-cart-msg";
    addMsg.style.marginTop = "10px";
    orderForm.appendChild(addMsg);

    orderForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var qty = parseInt(document.getElementById("count").value, 10) || 1;
      var price = product.priceNum != null ? product.priceNum : 8;
      addToCart(product.name, qty, price);
      addMsg.innerHTML = "Добавлено в корзину. <a href=\"cart.html\">Перейти в корзину</a>";
      addMsg.style.color = "green";
      orderForm.reset();
      document.getElementById("count").value = 1;
    });
  }
}

function initMap() {
  var iframe = document.getElementById("storeMap");
  if (iframe) iframe.src = "https://maps.google.com/maps?q=БГТУ+Военмех+Санкт-Петербург&t=&z=17&ie=UTF8&iwloc=&output=embed";
}

function initAccountPage() {
  var userNameEl = document.getElementById("userName");
  var ordersEl = document.getElementById("orders");
  if (!userNameEl || !ordersEl) return;

  var email = localStorage.getItem("currentUser");
  var userId = localStorage.getItem("currentUserId");
  if (!email) {
    window.location.href = "cabinet.html";
    return;
  }

  userNameEl.textContent = email;

  if (!userId) {
    ordersEl.innerHTML = "<p class=\"no-orders\">Заказы загружаются по userId. Верните с бэкенда в ответе POST /login JSON: {\"userId\": 1, \"email\": \"ваш@email\"}.</p>";
    var logoutBtn = document.getElementById("btnLogout");
    if (logoutBtn) logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("currentUserId");
      window.location.href = "cabinet.html";
    });
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open("GET", API_BASE + "/orders/user/" + userId);
  xhr.onload = function () {
    if (xhr.status !== 200) {
      ordersEl.innerHTML = "<p class=\"no-orders\">Не удалось загрузить заказы.</p>";
      return;
    }
    var list = [];
    try {
      list = JSON.parse(xhr.responseText);
    } catch (err) {}
    if (!list || list.length === 0) {
      ordersEl.innerHTML = "<p class=\"no-orders\">У вас пока нет заказов.</p>";
      return;
    }
    ordersEl.innerHTML = list.map(function (order) {
      var dateStr = order.date ? new Date(order.date).toLocaleString("ru") : "";
      var total = order.totalAmount != null ? order.totalAmount + " €" : "";
      var itemsHtml = "";
      if (order.orderItems && order.orderItems.length) {
        itemsHtml = order.orderItems.map(function (item) {
          return "<li>" + item.pizzaName + " × " + item.quantity + " — " + (item.amount != null ? item.amount + " €" : "") + "</li>";
        }).join("");
      }
      return (
        "<div class=\"order-card\" data-order-id=\"" + order.id + "\">" +
          "<div class=\"order-header\">" +
            "<span class=\"order-id\">Заказ #" + order.id + "</span>" +
            "<span class=\"order-date\">" + dateStr + "</span>" +
            "<span class=\"order-status\">" + (order.status || "") + "</span>" +
            (total ? "<span class=\"order-total\">" + total + "</span>" : "") +
          "</div>" +
          "<ul class=\"order-items\">" + itemsHtml + "</ul>" +
          "<button type=\"button\" class=\"btn-delete-order\" data-order-id=\"" + order.id + "\">Удалить заказ</button>" +
        "</div>"
      );
    }).join("");

    ordersEl.querySelectorAll(".btn-delete-order").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-order-id");
        if (!id) return;
        var delXhr = new XMLHttpRequest();
        delXhr.open("DELETE", API_BASE + "/orders/" + id);
        delXhr.onload = function () {
          if (delXhr.status >= 200 && delXhr.status < 300) {
            var card = ordersEl.querySelector(".order-card[data-order-id=\"" + id + "\"]");
            if (card) card.remove();
            if (!ordersEl.querySelector(".order-card")) {
              ordersEl.innerHTML = "<p class=\"no-orders\">У вас пока нет заказов.</p>";
            }
          }
        };
        delXhr.send();
      });
    });
  };
  xhr.onerror = function () {
    ordersEl.innerHTML = "<p class=\"no-orders\">Сервер недоступен. Заказы не загружены.</p>";
  };
  xhr.send();

  var logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserId");
    window.location.href = "cabinet.html";
  });
}

// Корзина — только на cart.html
function initCartPage() {
  var cartList = document.getElementById("cartList");
  var cartEmpty = document.getElementById("cartEmpty");
  var cartFooter = document.getElementById("cartFooter");
  var cartTotalSum = document.getElementById("cartTotalSum");
  var btnSubmitOrder = document.getElementById("btnSubmitOrder");

  if (!cartList || !cartEmpty) return;

  function renderCart() {
    var cart = getCart();
    if (cart.length === 0) {
      cartList.innerHTML = "";
      cartList.hidden = true;
      cartEmpty.hidden = false;
      if (cartFooter) cartFooter.hidden = true;
      return;
    }
    cartEmpty.hidden = true;
    cartList.hidden = false;
    if (cartFooter) cartFooter.hidden = false;

    var totalSum = 0;
    cartList.innerHTML = cart.map(function (item, index) {
      totalSum += item.amount || 0;
      return (
        "<div class=\"cart-row\" data-index=\"" + index + "\">" +
          "<span class=\"cart-item-name\">" + item.pizzaName + "</span>" +
          "<input type=\"number\" class=\"cart-item-qty\" value=\"" + item.quantity + "\" min=\"1\" max=\"20\" data-index=\"" + index + "\">" +
          "<span class=\"cart-item-price\">" + item.price + " €</span>" +
          "<span class=\"cart-item-amount\">" + item.amount + " €</span>" +
          "<button type=\"button\" class=\"cart-item-remove\" data-index=\"" + index + "\">×</button>" +
        "</div>"
      );
    }).join("");

    if (cartTotalSum) cartTotalSum.textContent = totalSum + " €";

    cartList.querySelectorAll(".cart-item-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-index"), 10);
        var c = getCart();
        c.splice(idx, 1);
        setCart(c);
        renderCart();
      });
    });

    cartList.querySelectorAll(".cart-item-qty").forEach(function (input) {
      input.addEventListener("change", function () {
        var idx = parseInt(this.getAttribute("data-index"), 10);
        var qty = parseInt(this.value, 10) || 1;
        if (qty < 1) qty = 1;
        if (qty > 20) qty = 20;
        this.value = qty;
        var c = getCart();
        if (c[idx]) {
          c[idx].quantity = qty;
          c[idx].amount = qty * c[idx].price;
          setCart(c);
          renderCart();
        }
      });
    });
  }

  renderCart();

  if (btnSubmitOrder) {
    btnSubmitOrder.addEventListener("click", function () {
      var userId = localStorage.getItem("currentUserId");
      var email = localStorage.getItem("currentUser");
      if (!email) {
        alert("Войдите в кабинет, чтобы оформить заказ.");
        window.location.href = "cabinet.html";
        return;
      }
      if (!userId) {
        alert("Ошибка: нет userId. Войдите заново.");
        return;
      }
      var cart = getCart();
      if (cart.length === 0) {
        alert("Корзина пуста.");
        return;
      }
      var orderDTO = {
        userId: parseInt(userId, 10),
        orderItems: cart.map(function (item) {
          return {
            pizzaName: item.pizzaName,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount
          };
        })
      };
      var xhr = new XMLHttpRequest();
      xhr.open("POST", API_BASE + "/orders");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          setCart([]);
          alert("Заказ оформлен!");
          window.location.href = "account.html";
        } else {
          alert("Ошибка заказа: " + (xhr.responseText || xhr.status));
        }
      };
      xhr.onerror = function () { alert("Сервер недоступен."); };
      xhr.send(JSON.stringify(orderDTO));
    });
  }
}
