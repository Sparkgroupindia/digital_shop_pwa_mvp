const API_URL =
  "https://script.google.com/macros/s/AKfycbwbU3NlHVOUCTpSYQoyO-WsqMkd3RyPFKeq1YPh1zlKF3BI_7UlDeIpYuK4TxE15B0uTQ/exec";

const themes = {
  T01: ["theme-luxury", "Luxury Black"],
  T02: ["theme-silver", "Silver Premium"],
  T03: ["theme-royal", "Royal Blue"],
  T04: ["theme-minimal", "Minimal White"],
  T05: ["theme-gold", "Dark Gold"],
  T06: ["theme-modern", "Modern Purple"],
  T07: ["theme-emerald", "Emerald Green"],
  T08: ["theme-ruby", "Ruby Red"],
  T09: ["theme-ocean", "Ocean Blue"],
  T10: ["theme-rose", "Rose Pink"],
  T11: ["theme-sunset", "Sunset Orange"],
  T12: ["theme-teal", "Teal"],
  T13: ["theme-mocha", "Mocha Brown"],
  T14: ["theme-midnight", "Midnight Navy"],
  T15: ["theme-blush", "Blush"],
  T16: ["theme-sapphire", "Sapphire"],
  T17: ["theme-burgundy", "Burgundy"],
  T18: ["theme-forest", "Forest Green"]
};

let data = {
  user: null,
  products: [],
  categories: []
};

function esc(x = "") {
  return String(x).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || "";
}

function imageFor(product) {

  const images = String(product.Images || "")
    .split("|")
    .map(x => x.trim())
    .filter(Boolean);

  if (images.length) {
    return images[0];
  }

  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg"
           width="800"
           height="800">
        <rect width="100%" height="100%" fill="#dddddd"/>
        <text x="50%" y="50%"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="36"
              fill="#777">
          ${esc(product.Name || "Product")}
        </text>
      </svg>
    `)
  );
}

async function loadShop() {

  const slug = getSlug();

  if (!slug) {
    showHome();
    return;
  }

  document.getElementById("app").innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:system-ui;
    ">
      Loading shop...
    </div>
  `;

  try {

    const url =
      API_URL +
      "?action=shop&slug=" +
      encodeURIComponent(slug);

    const response = await fetch(url);
    const result = await response.json();

    if (!result.ok) {
      showError(result.error || "Business not found");
      return;
    }

    data = result;
    render();

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load shop. Please check internet connection."
    );
  }
}

function showHome() {

  document.body.className = "";

  document.getElementById("app").innerHTML = `

    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:25px;
      font-family:system-ui;
      text-align:center;
    ">

      <div>

        <h1>Digital Shop</h1>

        <p style="color:#777">
          Please login to manage your shop.
        </p>

        <a
          href="login.html"
          style="
            display:inline-block;
            margin-top:15px;
            padding:12px 20px;
            background:#111;
            color:#fff;
            text-decoration:none;
            border-radius:10px;
          "
        >
          Login
        </a>

      </div>

    </div>
  `;
}

function showError(message) {

  document.getElementById("app").innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:25px;
      font-family:system-ui;
      text-align:center;
    ">
      <div>
        <h2>Shop Not Found</h2>
        <p>${esc(message)}</p>
      </div>
    </div>
  `;
}

function render() {

  const user = data.user;

  const theme =
    themes[user.Theme_ID]?.[0] ||
    "theme-minimal";

  document.body.className = theme;

  const categories =
    data.categories.length
      ? data.categories.map(x => x.Name)
      : [
          ...new Set(
            data.products
              .map(p => p.Category)
              .filter(Boolean)
          )
        ];

  document.getElementById("app").innerHTML = `

    <div class="app">

      <header class="hero">

        ${
          user.Logo
            ? `
              <img
                class="logo"
                src="${esc(user.Logo)}"
                alt="${esc(user.Business_Name)}"
              >
            `
            : ""
        }

        <div class="brand">

          <h1>${esc(user.Business_Name)}</h1>

          ${
            user.Address
              ? `<p>${esc(user.Address)}</p>`
              : ""
          }

        </div>

      </header>

      <div class="actions">

        ${
          user.WhatsApp
            ? `
              <a
                href="https://wa.me/${esc(user.WhatsApp)}"
                target="_blank"
              >
                WhatsApp
              </a>
            `
            : ""
        }

        ${
          user.Mobile
            ? `
              <a href="tel:${esc(user.Mobile)}">
                Call
              </a>
            `
            : ""
        }

        ${
          user.Map_Link
            ? `
              <a
                href="${esc(user.Map_Link)}"
                target="_blank"
              >
                Directions
              </a>
            `
            : ""
        }

      </div>

      <nav class="nav">

        <button onclick="filterCat('')">
          All
        </button>

        ${categories.map(category => `
          <button onclick="filterCat('${esc(category)}')">
            ${esc(category)}
          </button>
        `).join("")}

      </nav>

      <main id="products" class="grid">

        ${
          data.products.length
            ? data.products
                .sort(
                  (a,b) =>
                    Number(a.Sort_Order || 0) -
                    Number(b.Sort_Order || 0)
                )
                .map(productCard)
                .join("")
            : `
              <div>
                No products available.
              </div>
            `
        }

      </main>

    </div>
  `;
}

function productCard(product) {

  const image = imageFor(product);

  return `

    <article
      class="product"
      data-category="${esc(product.Category || "")}"
      onclick="openViewer('${esc(image)}')"
    >

      <img
        src="${esc(image)}"
        alt="${esc(product.Name)}"
        loading="lazy"
      >

      <div class="pbody">

        <div class="pname">
          ${esc(product.Name)}
        </div>

        ${
          product.Price !== "" &&
          product.Price !== null
            ? `
              <div class="price">
                ₹${esc(product.Price)}
              </div>
            `
            : ""
        }

        ${
          product.Description
            ? `
              <div class="desc">
                ${esc(product.Description)}
              </div>
            `
            : ""
        }

      </div>

    </article>
  `;
}

function filterCat(category) {

  document
    .querySelectorAll(".product")
    .forEach(card => {

      const productCategory =
        card.dataset.category;

      card.style.display =
        !category ||
        productCategory === category
          ? ""
          : "none";
    });
}


// ======================================================
// IMAGE VIEWER
// PC WHEEL + MOBILE PINCH + MOBILE PAN
// ======================================================

let scale = 1;

const MIN_SCALE = 1;
const MAX_SCALE = 5;

let startDistance = 0;
let startScale = 1;

let translateX = 0;
let translateY = 0;

let lastTouchX = 0;
let lastTouchY = 0;

let isDragging = false;
let lastTapTime = 0;


// ------------------------------------------------------
// APPLY TRANSFORM
// ------------------------------------------------------

function applyImageTransform() {

  const image =
    document.getElementById("viewerImg");

  if (!image) return;

  image.style.transform =
    `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
}


// ------------------------------------------------------
// OPEN VIEWER
// ------------------------------------------------------

function openViewer(src) {

  scale = 1;

  startDistance = 0;
  startScale = 1;

  translateX = 0;
  translateY = 0;

  isDragging = false;

  const viewer =
    document.getElementById("viewer");

  const image =
    document.getElementById("viewerImg");

  image.src = src;

  image.style.transformOrigin =
    "center center";

  applyImageTransform();

  viewer.hidden = false;

  document.body.classList.add("viewer-open");
}


// ------------------------------------------------------
// CLOSE VIEWER
// ------------------------------------------------------

function closeViewer() {

  const viewer =
    document.getElementById("viewer");

  viewer.hidden = true;

  const image =
    document.getElementById("viewerImg");

  image.style.transform =
    "translate3d(0,0,0) scale(1)";

  scale = 1;

  translateX = 0;
  translateY = 0;

  startDistance = 0;

  document.body.classList.remove("viewer-open");
}


// ------------------------------------------------------
// PC MOUSE WHEEL ZOOM
// NO CHANGE IN BASIC BEHAVIOUR
// ------------------------------------------------------

document
  .getElementById("viewer")
  .addEventListener(
    "wheel",
    event => {

      event.preventDefault();

      if (event.deltaY < 0) {

        scale += 0.20;

      } else {

        scale -= 0.20;

      }

      scale =
        Math.max(
          MIN_SCALE,
          Math.min(
            MAX_SCALE,
            scale
          )
        );

      applyImageTransform();

    },
    {
      passive:false
    }
  );


// ------------------------------------------------------
// TOUCH DISTANCE
// ------------------------------------------------------

function getTouchDistance(touch1, touch2) {

  const dx =
    touch1.clientX -
    touch2.clientX;

  const dy =
    touch1.clientY -
    touch2.clientY;

  return Math.sqrt(
    dx * dx +
    dy * dy
  );
}


// ------------------------------------------------------
// TOUCH MIDPOINT
// ------------------------------------------------------

function getTouchCenter(touch1, touch2) {

  return {
    x:
      (touch1.clientX + touch2.clientX) / 2,

    y:
      (touch1.clientY + touch2.clientY) / 2
  };
}


// ------------------------------------------------------
// MOBILE TOUCH START
// ------------------------------------------------------

document
  .getElementById("viewer")
  .addEventListener(
    "touchstart",
    event => {

      // TWO FINGER = PINCH
      if (event.touches.length === 2) {

        event.preventDefault();

        startDistance =
          getTouchDistance(
            event.touches[0],
            event.touches[1]
          );

        startScale = scale;

        isDragging = false;

        return;
      }


      // ONE FINGER
      if (event.touches.length === 1) {

        const now =
          Date.now();

        // DOUBLE TAP
        if (
          now - lastTapTime < 300
        ) {

          event.preventDefault();

          if (scale <= 1) {

            scale = 2.5;

          } else {

            scale = 1;

            translateX = 0;
            translateY = 0;

          }

          applyImageTransform();

        }

        lastTapTime = now;


        // PAN ONLY WHEN ZOOMED
        if (scale > 1) {

          lastTouchX =
            event.touches[0].clientX;

          lastTouchY =
            event.touches[0].clientY;

          isDragging = true;

        }

      }

    },
    {
      passive:false
    }
  );


// ------------------------------------------------------
// MOBILE TOUCH MOVE
// ------------------------------------------------------

document
  .getElementById("viewer")
  .addEventListener(
    "touchmove",
    event => {

      // ==========================================
      // TWO FINGER PINCH
      // ==========================================

      if (
        event.touches.length === 2 &&
        startDistance > 0
      ) {

        event.preventDefault();

        const currentDistance =
          getTouchDistance(
            event.touches[0],
            event.touches[1]
          );

        const ratio =
          currentDistance /
          startDistance;

        scale =
          startScale *
          ratio;

        scale =
          Math.max(
            MIN_SCALE,
            Math.min(
              MAX_SCALE,
              scale
            )
          );

        applyImageTransform();

        return;
      }


      // ==========================================
      // ONE FINGER PAN
      // ==========================================

      if (
        event.touches.length === 1 &&
        isDragging &&
        scale > 1
      ) {

        event.preventDefault();

        const currentX =
          event.touches[0].clientX;

        const currentY =
          event.touches[0].clientY;

        const dx =
          currentX - lastTouchX;

        const dy =
          currentY - lastTouchY;

        translateX += dx;
        translateY += dy;

        lastTouchX = currentX;
        lastTouchY = currentY;

        applyImageTransform();

      }

    },
    {
      passive:false
    }
  );


// ------------------------------------------------------
// MOBILE TOUCH END
// ------------------------------------------------------

document
  .getElementById("viewer")
  .addEventListener(
    "touchend",
    event => {

      if (event.touches.length < 2) {
        startDistance = 0;
      }

      if (event.touches.length === 0) {
        isDragging = false;
      }

    },
    {
      passive:false
    }
  );


// ------------------------------------------------------
// ESC KEY
// ------------------------------------------------------

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {
      closeViewer();
    }

  }
);


// ======================================================
// PWA
// ======================================================

if ("serviceWorker" in navigator) {

  navigator.serviceWorker
    .register("./sw.js")
    .catch(error =>
      console.log(
        "Service worker:",
        error
      )
    );
}


// ======================================================
// START
// ======================================================

loadShop();
