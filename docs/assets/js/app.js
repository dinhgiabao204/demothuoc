/* =========================== LC PHARMACY – FRONTEND APP
=========================== */ /* ---------- Cấu hình môi trường ---------- */
// Tự động nhận diện đang chạy ở localhost (XAMPP) hay web thật (GitHub Pages)
const isLocal = location.hostname === "localhost" || location.hostname ===
"127.0.0.1"; // Nếu chạy ở localhost: dùng thư mục /api (PHP) // Nếu chạy online
(GitHub Pages): dùng API từ domain thật const API_BASE = isLocal ? "../api" //
chạy trong XAMPP : "https://nhathuoc.dpdns.org/api"; // chạy trên GitHub Pages
const CART_KEY = "lc_cart"; const AUTH_KEY = "lc_user"; /* ---------- Helpers
---------- */ const $ = (sel, root = document) => root.querySelector(sel); const
$$ = (sel, root = document) => [...root.querySelectorAll(sel)]; const fmt = (n)
=> (Number(n) || 0).toLocaleString("vi-VN") + "₫"; // Curated Unsplash
placeholders for pharmacy context const CURATED_IMAGES = [
"https://images.unsplash.com/photo-1584367369853-8b966cf2235f?q=80&w=900&auto=format&fit=crop",
"https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=900&auto=format&fit=crop",
"https://images.unsplash.com/photo-1582719366709-0f2f3f1d6d9e?q=80&w=900&auto=format&fit=crop",
"https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=900&auto=format&fit=crop",
"https://images.unsplash.com/photo-1583912267550-38b6c205a1a1?q=80&w=900&auto=format&fit=crop",
]; function getPlaceholderImage(seed) { const idx = Math.abs( String(seed)
.split("") .reduce((s, c) => s + c.charCodeAt(0), 0) ) % CURATED_IMAGES.length;
return CURATED_IMAGES[idx]; } async function getJSON(url) { const res = await
fetch(url, { credentials: "same-origin" }); if (!res.ok) throw new Error(await
res.text()); return res.json(); } async function postJSON(url, data) { const res
= await fetch(url, { method: "POST", headers: { "Content-Type":
"application/json" }, body: JSON.stringify(data), }); if (!res.ok) throw new
Error(await res.text()); return res.json(); } /* ---------- AUTH (localStorage)
---------- */ function setUser(u) { localStorage.setItem(AUTH_KEY,
JSON.stringify(u)); } function getUser() { try { return
JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; } } function
isLoggedIn() { return !!getUser(); } function logout() {
localStorage.removeItem(AUTH_KEY); location.reload(); } /* Vẽ khu vực tài khoản
trên navbar (id="authArea") */ function renderAuthNav() { const box =
$("#authArea"); if (!box) return; const user = getUser(); if (user) {
box.innerHTML = `
<li class="nav-item dropdown">
  <a
    class="nav-link dropdown-toggle text-white"
    href="#"
    data-bs-toggle="dropdown"
  >
    <i class="bi bi-person-circle me-1"></i> Xin chào, ${user.name || user.email
    || "Khách"}
  </a>
  <ul class="dropdown-menu dropdown-menu-end">
    <li>
      <a class="dropdown-item" href="profile.html"
        ><i class="bi bi-person-badge"></i> Hồ sơ</a
      >
    </li>
    <li>
      <a class="dropdown-item" href="orders.html"
        ><i class="bi bi-receipt"></i> Đơn hàng</a
      >
    </li>
    <li><hr class="dropdown-divider" /></li>
    <li>
      <a class="dropdown-item text-danger" href="#" id="btnLogout"
        ><i class="bi bi-box-arrow-right"></i> Đăng xuất</a
      >
    </li>
  </ul>
</li>
<li class="nav-item">
  <a class="nav-link text-white" href="cart.html"
    ><i class="bi bi-bag"></i> Giỏ hàng</a
  >
</li>
`; setTimeout(() => { $("#btnLogout")?.addEventListener("click", (e) => {
e.preventDefault(); logout(); }); }, 0); } else { box.innerHTML = `
<li class="nav-item">
  <a class="nav-link text-white" href="login.html"
    ><i class="bi bi-box-arrow-in-right"></i> Đăng nhập</a
  >
</li>
<li class="nav-item">
  <a class="nav-link text-white" href="cart.html"
    ><i class="bi bi-bag"></i> Giỏ hàng</a
  >
</li>
`; } } /* ---------- Cart (localStorage) ---------- */ function getCart() { try
{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return [];
} } function saveCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); }
function addToCart(prod, qty = 1) { const cart = getCart(); const pid = prod.id
?? prod.masp; const i = cart.findIndex((x) => x.id == pid); if (i >= 0)
cart[i].qty += qty; else cart.push({ id: pid, name: prod.tensp, price:
+prod.giaban, img: prod.hinhanh || "", qty, }); saveCart(cart); } function
updateQty(id, qty) { const cart = getCart().map((it) => it.id == id ? { ...it,
qty: Math.max(1, qty) } : it ); saveCart(cart); } function removeItem(id) {
saveCart(getCart().filter((it) => it.id != id)); } /* ---------- Render UI
---------- */ function productCard(p) { return `
<div class="col">
  <a href="product.html?id=${p.masp || p.id}" class="card product-card h-100">
    <img loading="lazy" alt="${p.tensp || "Sản phẩm"}" src="${ p.hinhanh ||
    getPlaceholderImage(p.id || p.masp || Math.random()) }"
    class="card-img-top">
    <div class="card-body">
      <div class="small text-muted">${p.danhmuc_ten || ""}</div>
      <div class="fw-semibold">${p.tensp}</div>
      <div class="fw-bold text-danger mt-1">${fmt(p.giaban)}</div>
    </div>
  </a>
</div>
`; } /* ---------- Các trang ---------- */ // Trang chủ async function
initHome() { const wrap = $("#hot-products"); if (!wrap) return; try { const
data = await getJSON(`${API_BASE}/sanpham.php?action=list&limit=8`); const list
= Array.isArray(data.data || data) ? data.data || data : []; wrap.innerHTML =
list.map(productCard).join("") || `
<div class="text-muted">Chưa có dữ liệu.</div>
`; } catch (e) { wrap.innerHTML = `
<div class="text-danger small">${e.message}</div>
`; } } // Danh mục async function initCatalog() { const grid =
$(".product-grid"); if (!grid) return; const q = new
URLSearchParams(location.search); const cat = q.get("cat") || ""; const search =
q.get("q") || ""; try { const url = `${API_BASE}/sanpham.php?action=list${ cat ?
`&cat=${encodeURIComponent(cat)}` : "" }${search ?
`&q=${encodeURIComponent(search)}` : ""}`; const data = await getJSON(url);
const list = data.data || data || []; grid.innerHTML =
list.map(productCard).join("") || `
<div class="text-muted">Không tìm thấy sản phẩm.</div>
`; } catch (err) { grid.innerHTML = `
<div class="text-danger small">${err.message}</div>
`; } } /* ---------- Khởi tạo ---------- */
document.addEventListener("DOMContentLoaded", renderAuthNav);
