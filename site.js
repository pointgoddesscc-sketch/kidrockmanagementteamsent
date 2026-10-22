(function () {
  var KEY = "kr-desk-v1";
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
  function state() {
    var data = load();
    data.products = data.products || [];
    data.cart = data.cart || [];
    data.orders = data.orders || [];
    data.inquiries = data.inquiries || [];
    data.subscribers = data.subscribers || [];
    data.shipping = data.shipping || [];
    data.taxBps = data.taxBps || 0;
    return data;
  }
  function money(cents) {
    return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
  }
  function uid(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 8);
  }
  document.querySelector(".nav-toggle")?.addEventListener("click", function () {
    document.querySelector(".nav-links")?.classList.toggle("open");
  });
  var cartCount = document.querySelector("[data-cart-count]");
  if (cartCount) {
    var qty = state().cart.reduce(function (sum, line) { return sum + line.qty; }, 0);
    cartCount.textContent = qty ? "Cart (" + qty + ")" : "Cart";
  }

  var form = document.querySelector("#contact-form");
  if (form) {
    var params = new URLSearchParams(location.search);
    if (params.get("category")) {
      var sel = form.querySelector("[name=category]");
      if (sel) sel.value = params.get("category");
    }
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      var data = new FormData(form);
      if (String(data.get("company_site") || "").trim()) return;
      var payload = {
        name: String(data.get("name") || "").trim(),
        email: String(data.get("email") || "").trim(),
        organization: String(data.get("organization") || "").trim(),
        category: String(data.get("category") || "general"),
        subject: String(data.get("subject") || "").trim(),
        message: String(data.get("message") || "").trim()
      };
      var status = document.querySelector("#form-status");
      if (!payload.name || !payload.email || !payload.subject || !payload.message) {
        status.textContent = "Name, email, subject, and message are required.";
        return;
      }
      var desk = state();
      desk.inquiries.unshift(Object.assign({ id: uid("inq"), createdAt: new Date().toISOString() }, payload));
      save(desk);
      try {
        var res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        var json = await res.json();
        status.textContent = res.ok && json.ok
          ? "Received. The desk will reply at the email you gave. A copy is also on this browser’s desk."
          : (json.error || "Saved on this browser. Email support@kidrockmanagementteamsent.com if you need a second copy.");
        if (res.ok) form.reset();
      } catch (err) {
        status.textContent = "Saved on this browser. Email support@kidrockmanagementteamsent.com directly if the form could not reach the desk.";
      }
    });
  }

  var news = document.querySelector("#newsletter");
  if (news) {
    news.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = String(new FormData(news).get("email") || "").trim().toLowerCase();
      var consent = news.querySelector("[name=consent]").checked;
      var note = document.querySelector("#news-note");
      if (!consent) { note.textContent = "Consent is required."; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { note.textContent = "Enter a valid email."; return; }
      var desk = state();
      if (desk.subscribers.some(function (item) { return item.email === email; })) {
        note.textContent = "That address is already saved in this browser.";
        return;
      }
      desk.subscribers.unshift({ email: email, at: new Date().toISOString() });
      save(desk);
      note.textContent = "Saved in this browser only. A live mailing service is not connected.";
      news.reset();
    });
  }

  var unsub = document.querySelector("#unsub");
  if (unsub) {
    unsub.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = String(new FormData(unsub).get("email") || "").trim().toLowerCase();
      var desk = state();
      desk.subscribers = desk.subscribers.filter(function (item) { return item.email !== email; });
      save(desk);
      document.querySelector("#unsub-note").textContent = "If that address was stored here, it is removed.";
      unsub.reset();
    });
  }

  function linesOf(desk) {
    return desk.cart.map(function (line) {
      var product = desk.products.find(function (item) { return item.id === line.id; });
      if (!product) return null;
      return { product: product, qty: line.qty, lineCents: product.priceCents * line.qty };
    }).filter(Boolean);
  }

  var catalog = document.querySelector("#catalog");
  if (catalog) {
    var filter = "All";
    function paint() {
      var desk = state();
      var shown = desk.products.filter(function (product) { return filter === "All" || product.category === filter; });
      if (!shown.length) {
        catalog.innerHTML = '<div class="empty"><h2>Nothing is listed' + (filter === "All" ? "." : " in " + filter + ".") + '</h2><p class="muted">Prices are not invented. Publish an authorized item from the desk when price, photo, and stock exist.</p><p><a class="btn" href="/desk">Open the desk</a></p></div>';
        return;
      }
      catalog.innerHTML = '<div class="grid-3">' + shown.map(function (product) {
        return '<article class="card"><img class="frame" alt="' + product.name + '" src="' + (product.image || "/logo.jpg") + '" style="aspect-ratio:1;object-fit:cover"/><p class="kicker">' + product.category + '</p><h3>' + product.name + '</h3><p>' + money(product.priceCents) + '</p><p class="muted">' + product.stock + ' in stock</p><button class="btn btn-gold" data-add="' + product.id + '"' + (product.stock < 1 ? " disabled" : "") + '>' + (product.stock < 1 ? "Out of stock" : "Add to cart") + '</button></article>';
      }).join("") + "</div>";
    }
    document.querySelectorAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        filter = button.getAttribute("data-filter");
        paint();
      });
    });
    catalog.addEventListener("click", function (event) {
      var id = event.target.getAttribute && event.target.getAttribute("data-add");
      if (!id) return;
      var desk = state();
      var product = desk.products.find(function (item) { return item.id === id; });
      var line = desk.cart.find(function (item) { return item.id === id; });
      var next = (line ? line.qty : 0) + 1;
      var note = document.querySelector("#store-note");
      if (!product || next > product.stock) { note.textContent = "Not enough stock."; return; }
      if (line) line.qty = next; else desk.cart.push({ id: id, qty: 1 });
      save(desk);
      note.textContent = product.name + " added.";
      if (cartCount) cartCount.textContent = "Cart (" + desk.cart.reduce(function (s, l) { return s + l.qty; }, 0) + ")";
    });
    paint();
  }

  var cartBox = document.querySelector("#cart-box");
  if (cartBox) {
    function paintCart() {
      var desk = state();
      var lines = linesOf(desk);
      if (!lines.length) {
        cartBox.innerHTML = '<p class="muted">The cart is empty.</p><a class="btn" href="/store">Return to the store</a>';
        return;
      }
      var subtotal = lines.reduce(function (sum, line) { return sum + line.lineCents; }, 0);
      var tax = Math.round(subtotal * desk.taxBps / 10000);
      cartBox.innerHTML = lines.map(function (line) {
        return '<div class="row"><div><strong>' + line.product.name + '</strong><div class="muted">' + money(line.product.priceCents) + '</div></div><label>Qty <input data-qty="' + line.product.id + '" type="number" min="0" max="' + line.product.stock + '" value="' + line.qty + '" style="width:72px"/></label><div>' + money(line.lineCents) + '</div></div>';
      }).join("") + '<div class="row"><span class="muted">Subtotal</span><span>' + money(subtotal) + '</span></div><div class="row"><span class="muted">Tax</span><span>' + money(tax) + '</span></div><p class="muted">Shipping is chosen at checkout.</p><a class="btn btn-gold" href="/checkout">Continue to checkout</a>';
    }
    cartBox.addEventListener("change", function (event) {
      var id = event.target.getAttribute && event.target.getAttribute("data-qty");
      if (!id) return;
      var desk = state();
      var qty = Number(event.target.value);
      if (qty <= 0) desk.cart = desk.cart.filter(function (line) { return line.id !== id; });
      else desk.cart = desk.cart.map(function (line) { return line.id === id ? { id: id, qty: qty } : line; });
      save(desk);
      paintCart();
    });
    paintCart();
  }

  var checkout = document.querySelector("#checkout");
  if (checkout) {
    var shipBox = document.querySelector("#ship-options");
    var summary = document.querySelector("#summary");
    function selectedShip() {
      var picked = checkout.querySelector("input[name=ship]:checked");
      var desk = state();
      return desk.shipping.find(function (item) { return picked && item.id === picked.value; });
    }
    function paintSummary() {
      var desk = state();
      var lines = linesOf(desk);
      if (!lines.length) {
        summary.innerHTML = '<p class="muted">Your cart is empty.</p>';
        return;
      }
      shipBox.innerHTML = desk.shipping.length
        ? desk.shipping.map(function (item, index) {
          return '<label class="row"><span><input type="radio" name="ship" value="' + item.id + '"' + (index === 0 ? " checked" : "") + "/> " + item.name + '</span><span>' + money(item.cents) + "</span></label>";
        }).join("")
        : '<p class="muted">No shipping rate is published. Set one on the desk first.</p>';
      var method = selectedShip();
      var subtotal = lines.reduce(function (sum, line) { return sum + line.lineCents; }, 0);
      var tax = Math.round(subtotal * desk.taxBps / 10000);
      var total = subtotal + (method ? method.cents : 0) + tax;
      summary.innerHTML = lines.map(function (line) {
        return '<div class="row"><span>' + line.product.name + " × " + line.qty + "</span><span>" + money(line.lineCents) + "</span></div>";
      }).join("") + '<div class="row"><span>Shipping</span><span>' + (method ? money(method.cents) : "—") + '</span></div><div class="row"><span>Tax</span><span>' + money(tax) + '</span></div><div class="row"><strong>Total</strong><strong>' + money(total) + "</strong></div>";
    }
    shipBox.addEventListener("change", paintSummary);
    checkout.addEventListener("submit", function (event) {
      event.preventDefault();
      var desk = state();
      var data = new FormData(checkout);
      var method = selectedShip();
      var note = document.querySelector("#check-note");
      var lines = linesOf(desk);
      if (!lines.length) { note.textContent = "Your cart is empty."; return; }
      if (!method) { note.textContent = "No shipping rate is published."; return; }
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].qty > lines[i].product.stock) { note.textContent = "Not enough stock."; return; }
      }
      var subtotal = lines.reduce(function (sum, line) { return sum + line.lineCents; }, 0);
      var tax = Math.round(subtotal * desk.taxBps / 10000);
      var order = {
        id: uid("ord"),
        createdAt: new Date().toISOString(),
        name: String(data.get("name") || "").trim(),
        email: String(data.get("email") || "").trim(),
        address: String(data.get("address") || "").trim(),
        items: lines.map(function (line) { return { id: line.product.id, name: line.product.name, qty: line.qty, priceCents: line.product.priceCents }; }),
        shippingName: method.name,
        shippingCents: method.cents,
        taxCents: tax,
        totalCents: subtotal + method.cents + tax,
        status: "request"
      };
      lines.forEach(function (line) {
        var product = desk.products.find(function (item) { return item.id === line.product.id; });
        if (product) product.stock -= line.qty;
      });
      desk.orders.unshift(order);
      desk.cart = [];
      save(desk);
      checkout.outerHTML = '<section class="section"><div class="wrap"><p class="kicker">Request saved</p><h1>Order ' + order.id + '</h1><p class="lede">No card was collected and no money moved. A payment processor is not connected.</p><p>Total recorded: ' + money(order.totalCents) + '</p></div></section>';
    });
    paintSummary();
  }

  var deskForm = document.querySelector("#publish");
  if (deskForm) {
    var list = document.querySelector("#product-list");
    var shipList = document.querySelector("#ship-list");
    var orderList = document.querySelector("#order-list");
    var inquiryList = document.querySelector("#inquiry-list");
    var subList = document.querySelector("#sub-list");
    function paintDesk() {
      var desk = state();
      list.innerHTML = desk.products.map(function (product) {
        return '<div class="row"><span>' + product.name + " · " + money(product.priceCents) + " · " + product.stock + ' left</span><button type="button" data-remove="' + product.id + '">Remove</button></div>';
      }).join("") || '<p class="muted">No items.</p>';
      shipList.innerHTML = desk.shipping.map(function (method) {
        return '<div class="row"><span>' + method.name + " · " + money(method.cents) + '</span><button type="button" data-ship="' + method.id + '">Remove</button></div>';
      }).join("") || '<p class="muted">No rates.</p>';
      orderList.innerHTML = desk.orders.map(function (order) {
        return '<article class="card"><p>' + order.id + " · " + order.status + " · " + money(order.totalCents) + '</p><p class="muted">' + order.name + " · " + order.email + "</p>" + (order.status === "request" ? '<button type="button" data-cancel="' + order.id + '">Cancel and restock</button>' : "") + "</article>";
      }).join("") || '<p class="muted">None yet.</p>';
      inquiryList.innerHTML = desk.inquiries.map(function (item) {
        return '<article class="card"><p>' + item.subject + " · " + item.category + '</p><p class="muted">' + item.name + " · " + item.email + "</p><p>" + item.message + "</p></article>";
      }).join("") || '<p class="muted">None yet.</p>';
      subList.innerHTML = desk.subscribers.map(function (item) { return "<li>" + item.email + "</li>"; }).join("") || '<li class="muted">None.</li>';
      var tax = document.querySelector("#tax-input");
      if (tax && document.activeElement !== tax) tax.value = (desk.taxBps / 100).toString();
    }
    deskForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(deskForm);
      var dollars = Number(data.get("price"));
      var stock = Number(data.get("stock"));
      var desk = state();
      desk.products.unshift({
        id: uid("sku"),
        name: String(data.get("name") || "").trim(),
        description: String(data.get("description") || "").trim(),
        category: String(data.get("category") || "Apparel"),
        priceCents: Math.round(dollars * 100),
        stock: Math.max(0, Math.floor(stock)),
        image: String(data.get("image") || "").trim() || "/logo.jpg"
      });
      save(desk);
      deskForm.reset();
      paintDesk();
    });
    document.querySelector("#ship-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(event.target);
      var desk = state();
      desk.shipping.push({ id: uid("ship"), name: String(data.get("name") || "").trim(), cents: Math.round(Number(data.get("cents")) * 100) });
      save(desk);
      event.target.reset();
      paintDesk();
    });
    document.querySelector("#tax-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var desk = state();
      desk.taxBps = Math.round(Number(new FormData(event.target).get("percent")) * 100);
      save(desk);
    });
    document.body.addEventListener("click", function (event) {
      var remove = event.target.getAttribute && event.target.getAttribute("data-remove");
      var ship = event.target.getAttribute && event.target.getAttribute("data-ship");
      var cancel = event.target.getAttribute && event.target.getAttribute("data-cancel");
      var desk = state();
      if (remove) {
        desk.products = desk.products.filter(function (item) { return item.id !== remove; });
        desk.cart = desk.cart.filter(function (item) { return item.id !== remove; });
      }
      if (ship) desk.shipping = desk.shipping.filter(function (item) { return item.id !== ship; });
      if (cancel) {
        var order = desk.orders.find(function (item) { return item.id === cancel; });
        if (order && order.status === "request") {
          order.status = "cancelled";
          order.items.forEach(function (item) {
            var product = desk.products.find(function (entry) { return entry.id === item.id; });
            if (product) product.stock += item.qty;
          });
        }
      }
      if (remove || ship || cancel) { save(desk); paintDesk(); }
    });
    paintDesk();
  }
})();
