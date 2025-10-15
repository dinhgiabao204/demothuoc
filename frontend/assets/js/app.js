/* ===========================
   LC PHARMACY – FRONTEND APP
   =========================== */

const API_BASE = "../api"; // từ /frontend/ đi lên /api
const CART_KEY = "lc_cart";
const AUTH_KEY = "lc_user";

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const fmt = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "₫";

// Curated Unsplash placeholders for pharmacy context
const CURATED_IMAGES = [
  "https://images.unsplash.com/photo-1584367369853-8b966cf2235f?q=80&w=900&auto=format&fit=crop", // shelves
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=900&auto=format&fit=crop", // pharmacy counter
  "https://images.unsplash.com/photo-1582719366709-0f2f3f1d6d9e?q=80&w=900&auto=format&fit=crop", // pills
  "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=900&auto=format&fit=crop", // vitamins
  "https://images.unsplash.com/photo-1583912267550-38b6c205a1a1?q=80&w=900&auto=format&fit=crop", // equipment
];
function getPlaceholderImage(seed) {
  const idx = Math.abs(String(seed).split("").reduce((s, c) => s + c.charCodeAt(0), 0)) % CURATED_IMAGES.length;
  return CURATED_IMAGES[idx];
}

async function getJSON(url) {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ---------- AUTH (localStorage) ---------- */
function setUser(u) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(u));
}
function getUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}
function isLoggedIn() {
  return !!getUser();
}
function logout() {
  localStorage.removeItem(AUTH_KEY);
  location.reload();
}

/* Vẽ khu vực tài khoản trên navbar (id="authArea") */
function renderAuthNav() {
  const box = $("#authArea");
  if (!box) return;
  const user = getUser();
  if (user) {
    box.innerHTML = `
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle text-white" href="#" data-bs-toggle="dropdown">
          <i class="bi bi-person-circle me-1"></i> Xin chào, ${
            user.name || user.email || "Khách"
          }
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="profile.html"><i class="bi bi-person-badge"></i> Hồ sơ</a></li>
          <li><a class="dropdown-item" href="orders.html"><i class="bi bi-receipt"></i> Đơn hàng</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" id="btnLogout"><i class="bi bi-box-arrow-right"></i> Đăng xuất</a></li>
        </ul>
      </li>
      <li class="nav-item"><a class="nav-link text-white" href="cart.html"><i class="bi bi-bag"></i> Giỏ hàng</a></li>
    `;
    setTimeout(() => {
      $("#btnLogout")?.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    }, 0);
  } else {
    box.innerHTML = `
      <li class="nav-item"><a class="nav-link text-white" href="login.html"><i class="bi bi-box-arrow-in-right"></i> Đăng nhập</a></li>
      <li class="nav-item"><a class="nav-link text-white" href="cart.html"><i class="bi bi-bag"></i> Giỏ hàng</a></li>
    `;
  }
}

/* ---------- Cart (localStorage) ---------- */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}
function saveCart(c) {
  localStorage.setItem(CART_KEY, JSON.stringify(c));
}
function addToCart(prod, qty = 1) {
  const cart = getCart();
  const pid = prod.id ?? prod.masp;
  const i = cart.findIndex((x) => x.id == pid);
  if (i >= 0) cart[i].qty += qty;
  else
    cart.push({
      id: pid,
      name: prod.tensp,
      price: +prod.giaban,
      img: prod.hinhanh || "",
      qty,
    });
  saveCart(cart);
}
function updateQty(id, qty) {
  const cart = getCart().map((it) =>
    it.id == id ? { ...it, qty: Math.max(1, qty) } : it
  );
  saveCart(cart);
}
function removeItem(id) {
  saveCart(getCart().filter((it) => it.id != id));
}

/* ---------- Render UI ---------- */
function productCard(p) {
  return `
  <div class="col">
    <a href="product.html?id=${p.masp || p.id}" class="card product-card h-100">
      <img loading="lazy" alt="${p.tensp || "Sản phẩm"}" src="${
        p.hinhanh || getPlaceholderImage(p.id || p.masp || Math.random())
      }" class="card-img-top" alt="">
      <div class="card-body">
        <div class="small text-muted">${p.danhmuc_ten || ""}</div>
        <div class="fw-semibold">${p.tensp}</div>
        <div class="fw-bold text-danger mt-1">${fmt(p.giaban)}</div>
      </div>
    </a>
  </div>`;
}

/* ---------- Pages ---------- */
// Trang chủ
async function initHome() {
  const wrap = $("#hot-products");
  if (!wrap) return;
  try {
    const data = await getJSON(`${API_BASE}/sanpham.php?action=list&limit=8`);
    const list = Array.isArray(data.data || data) ? data.data || data : [];
    wrap.innerHTML =
      list.map(productCard).join("") ||
      `<div class="text-muted">Chưa có dữ liệu.</div>`;
  } catch (e) {
    wrap.innerHTML = `<div class="text-danger small">${e.message}</div>`;
  }
}

// Danh mục
async function initCatalog() {
  const grid = $(".product-grid");
  if (!grid) return;
  const q = new URLSearchParams(location.search);
  const cat = q.get("cat") || "";
  const search = q.get("q") || "";
  try {
    const url = `${API_BASE}/sanpham.php?action=list${
      cat ? `&cat=${encodeURIComponent(cat)}` : ""
    }${search ? `&q=${encodeURIComponent(search)}` : ""}`;
    const data = await getJSON(url);
    const list = data.data || data || [];
    grid.innerHTML =
      list.map(productCard).join("") ||
      `<div class="text-muted">Không tìm thấy sản phẩm.</div>`;
  } catch (err) {
    grid.innerHTML = `<div class="text-danger small">${err.message}</div>`;
  }
}

// Chi tiết sản phẩm
async function initProduct() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;
  try {
    const res = await getJSON(`${API_BASE}/sanpham.php?action=detail&id=${id}`);
    const p = res.data || res;
    $("#pName") && ($("#pName").textContent = p.tensp);
    $("#pPrice") && ($("#pPrice").textContent = fmt(p.giaban));
    $("#pImg") &&
      ($("#pImg").src =
        p.hinhanh || `https://picsum.photos/seed/p${id}/900/700`);
    $("#btnAddToCart")?.addEventListener("click", () => {
      const qty = +($("#qty")?.value || 1);
      addToCart(
        {
          id: p.masp || id,
          tensp: p.tensp,
          giaban: p.giaban,
          hinhanh: p.hinhanh,
        },
        qty
      );
      alert("Đã thêm vào giỏ.");
    });
  } catch (e) {
    $(".container")?.insertAdjacentHTML(
      "afterbegin",
      `<div class="alert alert-danger">Không tải được sản phẩm: ${e.message}</div>`
    );
  }
}

// Giỏ hàng
function renderCart() {
  const tbody = $("#cart-body");
  if (!tbody) return;
  const cart = getCart();
  let sub = 0;
  tbody.innerHTML =
    cart
      .map((it) => {
        const line = it.price * it.qty;
        sub += line;
        return `<tr>
      <td><div class="d-flex align-items-center">
        <img loading="lazy" alt="${it.name}" src="${
          it.img || getPlaceholderImage(it.id)
        }" class="rounded me-2" width="80" height="60" alt="">
        <div>${it.name}</div></div></td>
      <td>${fmt(it.price)}</td>
      <td style="max-width:120px"><input data-id="${
        it.id
      }" class="form-control cart-qty" type="number" min="1" value="${
          it.qty
        }"></td>
      <td>${fmt(line)}</td>
      <td><button class="btn btn-sm btn-outline-danger btn-del" aria-label="Xóa ${it.name} khỏi giỏ" data-id="${
        it.id
      }"><i class="bi bi-trash"></i></button></td>
    </tr>`;
      })
      .join("") ||
    `<tr><td colspan="5" class="text-center text-muted">Giỏ hàng trống.</td></tr>`;
  $("#subtotal") && ($("#subtotal").textContent = fmt(sub));
  $("#shipping") && ($("#shipping").textContent = fmt(0));
  $("#grandTotal") && ($("#grandTotal").textContent = fmt(sub));
}
function bindCartEvents() {
  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("cart-qty")) {
      const id = e.target.dataset.id;
      updateQty(id, +e.target.value || 1);
      renderCart();
    }
  });
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-del");
    if (!btn) return;
    removeItem(btn.dataset.id);
    renderCart();
  });
}
function initCart() {
  renderCart();
  bindCartEvents();
}

// Checkout
function initCheckout() {
  const sumEl = $("#ck-summary");
  if (sumEl) {
    const cart = getCart();
    let sub = 0;
    sumEl.innerHTML =
      cart
        .map((it) => {
          const line = it.price * it.qty;
          sub += line;
          return `<div class="d-flex justify-content-between"><span>${
            it.name
          } x${it.qty}</span><span>${fmt(line)}</span></div>`;
        })
        .join("") +
      `<hr><div class="d-flex justify-content-between fw-bold"><span>Tổng</span><span>${fmt(
        sub
      )}</span></div>`;
  }
  $("#btnPlaceOrder")?.addEventListener("click", async () => {
    const cart = getCart();
    if (!cart.length) return alert("Giỏ hàng trống.");
    const info = {
      hoten: $("#ckName")?.value || "",
      phone: $("#ckPhone")?.value || "",
      diachi: $("#ckAddr")?.value || "",
      quan: $("#ckDistrict")?.value || "",
      city: $("#ckCity")?.value || "",
      ghichu: "",
    };
    try {
      const rs = await postJSON(`${API_BASE}/donhang.php`, {
        action: "create",
        customer: info,
        items: cart,
      });
      localStorage.removeItem(CART_KEY);
      location.href = "orders.html";
    } catch (e) {
      alert("Tạo đơn thất bại: " + e.message);
    }
  });
}

/* Khởi tạo mặc định */
document.addEventListener("DOMContentLoaded", renderAuthNav);
