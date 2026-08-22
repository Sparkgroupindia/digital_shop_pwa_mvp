const API_URL =
  "https://script.google.com/macros/s/AKfycbwbU3NlHVOUCTpSYQoyO-WsqMkd3RyPFKeq1YPh1zlKF3BI_7UlDeIpYuK4TxE15B0uTQ/exec";

const SESSION_KEY = "digital_shop_user";

let dashboardData = {
  user: null,
  products: [],
  categories: []
};

let editingProductId = "";


// ==========================================
// ESCAPE
// ==========================================

function esc(x = "") {

  return String(x).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));

}


// ==========================================
// URL USER ID
// ==========================================

function getUrlUserId() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get("userId") || "";

}


// ==========================================
// SESSION
// ==========================================

function getSession() {

  try {

    const saved =
      localStorage.getItem(
        SESSION_KEY
      );

    if (!saved) return null;

    return JSON.parse(saved);

  } catch (error) {

    console.error(error);

    return null;
  }

}


function saveSession(user) {

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      User_ID: user.User_ID
    })
  );

}


function clearSession() {

  localStorage.removeItem(
    SESSION_KEY
  );

}


// ==========================================
// LOGIN REDIRECT
// ==========================================

function goToLogin() {

  clearSession();

  window.location.replace(
    "./dashboard.html"
  );

}


// ==========================================
// LOGIN PAGE
// ==========================================

function renderLogin() {

  document.body.className = "";

  document.getElementById(
    "dashboardApp"
  ).innerHTML = `

    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:#f5f5f5;
      font-family:system-ui;
    ">

      <div style="
        width:100%;
        max-width:420px;
        background:#fff;
        padding:30px 24px;
        border-radius:20px;
        box-shadow:0 10px 40px rgba(0,0,0,.12);
      ">

        <div style="
          text-align:center;
          margin-bottom:25px;
        ">

          <h1 style="
            margin:0 0 8px;
          ">
            Digital Shop
          </h1>

          <p style="
            margin:0;
            color:#777;
          ">
            User Login
          </p>

        </div>


        <form id="loginForm">

          <label style="
            display:block;
            font-weight:600;
          ">
            User ID
          </label>

          <input
            id="loginUserId"
            type="text"
            placeholder="Example: U001"
            autocomplete="username"
            required
            style="
              width:100%;
              box-sizing:border-box;
              padding:14px;
              margin:7px 0 16px;
              border:1px solid #ddd;
              border-radius:12px;
              font-size:16px;
            "
          >


          <label style="
            display:block;
            font-weight:600;
          ">
            Password
          </label>

          <input
            id="loginPassword"
            type="password"
            placeholder="Enter Password"
            autocomplete="current-password"
            required
            style="
              width:100%;
              box-sizing:border-box;
              padding:14px;
              margin:7px 0 18px;
              border:1px solid #ddd;
              border-radius:12px;
              font-size:16px;
            "
          >


          <button
            id="loginButton"
            type="submit"
            style="
              width:100%;
              padding:15px;
              border:0;
              border-radius:12px;
              background:#111;
              color:#fff;
              font-size:16px;
              font-weight:700;
            "
          >
            LOGIN
          </button>


          <div
            id="loginMessage"
            style="
              margin-top:15px;
              text-align:center;
              color:#d00;
            "
          ></div>

        </form>

      </div>

    </div>
  `;


  document
    .getElementById("loginForm")
    .addEventListener(
      "submit",
      handleLogin
    );

}


// ==========================================
// LOGIN
// ==========================================

async function handleLogin(event) {

  event.preventDefault();

  const userId =
    document
      .getElementById("loginUserId")
      .value
      .trim();

  const password =
    document
      .getElementById("loginPassword")
      .value;

  const button =
    document.getElementById(
      "loginButton"
    );

  const message =
    document.getElementById(
      "loginMessage"
    );


  button.disabled = true;

  button.textContent =
    "LOGGING IN...";

  message.textContent = "";


  try {

    const url =
      API_URL +
      "?action=login" +
      "&userId=" +
      encodeURIComponent(userId) +
      "&password=" +
      encodeURIComponent(password);


    const response =
      await fetch(url);


    const result =
      await response.json();


    if (!result.ok) {

      message.textContent =
        result.error ||
        "Invalid User ID or password";

      button.disabled = false;

      button.textContent =
        "LOGIN";

      return;
    }


    saveSession(
      result.user
    );


    window.location.replace(
      "./dashboard.html?userId=" +
      encodeURIComponent(
        result.user.User_ID
      )
    );


  } catch (error) {

    console.error(error);

    message.textContent =
      "Unable to connect with server";

    button.disabled = false;

    button.textContent =
      "LOGIN";

  }

}


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard(userId) {

  document.getElementById(
    "dashboardApp"
  ).innerHTML = `

    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:system-ui;
    ">
      Loading dashboard...
    </div>

  `;


  try {

    const url =
      API_URL +
      "?action=dashboard" +
      "&userId=" +
      encodeURIComponent(userId);


    const response =
      await fetch(url);


    const result =
      await response.json();


    if (!result.ok) {

      goToLogin();

      return;
    }


    dashboardData = result;


    renderDashboard();


  } catch (error) {

    console.error(error);

    document.getElementById(
      "dashboardApp"
    ).innerHTML = `

      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        text-align:center;
        font-family:system-ui;
      ">

        <div>

          <h2>
            Connection Error
          </h2>

          <p>
            Please check your internet connection.
          </p>

          <button
            onclick="location.reload()"
            style="
              padding:12px 20px;
              border:0;
              border-radius:10px;
              background:#111;
              color:#fff;
            "
          >
            Retry
          </button>

        </div>

      </div>

    `;

  }

}


// ==========================================
// SHOP URL
// ==========================================

function getShopUrl() {

  const user =
    dashboardData.user || {};

  /*
    IMPORTANT:

    Agar API mein Slug available hai
    to wahi use hoga.

    Example:
    abc-jewellers
  */

  const slug =
    user.Slug ||
    user.slug ||
    user.User_Slug ||
    user.Shop_Slug ||
    "";


  if (!slug) {

    return (
      window.location.origin +
      window.location.pathname
        .replace(
          "dashboard.html",
          "index.html"
        ) +
      "?userId=" +
      encodeURIComponent(
        user.User_ID || ""
      )
    );

  }


  return (
    window.location.origin +
    window.location.pathname
      .replace(
        "dashboard.html",
        "index.html"
      ) +
    "?slug=" +
    encodeURIComponent(slug)
  );

}


// ==========================================
// OPEN SHOP
// ==========================================

function openShop() {

  const url =
    getShopUrl();

  window.open(
    url,
    "_blank"
  );

}


// ==========================================
// COPY SHOP LINK
// ==========================================

async function copyShopLink() {

  const url =
    getShopUrl();

  try {

    await navigator.clipboard.writeText(
      url
    );

    showToast(
      "Shop link copied!"
    );

  } catch (error) {

    const temp =
      document.createElement("input");

    temp.value = url;

    document.body.appendChild(temp);

    temp.select();

    document.execCommand("copy");

    temp.remove();

    showToast(
      "Shop link copied!"
    );

  }

}


// ==========================================
// QR MODAL
// ==========================================

function openQR() {

  const url =
    getShopUrl();

  const overlay =
    document.createElement("div");

  overlay.id =
    "qrOverlay";

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.65);
    z-index:99999;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
    font-family:system-ui;
  `;


  overlay.innerHTML = `

    <div style="
      width:100%;
      max-width:380px;
      background:#fff;
      border-radius:22px;
      padding:25px;
      text-align:center;
      box-sizing:border-box;
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">

        <h2 style="
          margin:0;
        ">
          Shop QR Code
        </h2>

        <button
          onclick="closeQR()"
          style="
            border:0;
            background:#eee;
            width:38px;
            height:38px;
            border-radius:50%;
            font-size:20px;
          "
        >
          ×
        </button>

      </div>


      <p style="
        color:#777;
        font-size:14px;
        margin:15px 0;
      ">
        Scan this QR to open your digital shop
      </p>


      <div
        id="qrCode"
        style="
          display:flex;
          justify-content:center;
          padding:15px;
        "
      ></div>


      <div style="
        font-size:12px;
        color:#777;
        word-break:break-all;
        margin:10px 0 18px;
      ">
        ${esc(url)}
      </div>


      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
      ">

        <button
          onclick="downloadQR()"
          style="
            padding:13px;
            border:0;
            border-radius:11px;
            background:#111;
            color:#fff;
            font-weight:700;
          "
        >
          Download QR
        </button>


        <button
          onclick="shareShop()"
          style="
            padding:13px;
            border:0;
            border-radius:11px;
            background:#eee;
            color:#111;
            font-weight:700;
          "
        >
          Share
        </button>

      </div>


      <button
        onclick="copyShopLink()"
        style="
          width:100%;
          margin-top:10px;
          padding:13px;
          border:1px solid #ddd;
          border-radius:11px;
          background:#fff;
          font-weight:700;
        "
      >
        Copy Shop Link
      </button>

    </div>

  `;


  document.body.appendChild(
    overlay
  );


  new QRCode(
    document.getElementById(
      "qrCode"
    ),
    {
      text: url,
      width: 220,
      height: 220,
      correctLevel:
        QRCode.CorrectLevel.H
    }
  );

}


function closeQR() {

  const overlay =
    document.getElementById(
      "qrOverlay"
    );

  if (overlay) {

    overlay.remove();

  }

}


// ==========================================
// DOWNLOAD QR
// ==========================================

function downloadQR() {

  const qr =
    document.querySelector(
      "#qrCode img"
    );

  if (!qr) {

    showToast(
      "QR not ready"
    );

    return;
  }


  const link =
    document.createElement("a");

  link.href =
    qr.src;

  link.download =
    (
      dashboardData.user.Business_Name ||
      "Digital-Shop"
    )
      .replace(
        /[^a-z0-9]/gi,
        "-"
      ) +
    "-QR.png";


  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

}


// ==========================================
// SHARE SHOP
// ==========================================

async function shareShop() {

  const user =
    dashboardData.user;

  const url =
    getShopUrl();

  const text =
    `Visit ${user.Business_Name || "our shop"} digital shop`;

  if (
    navigator.share
  ) {

    try {

      await navigator.share({
        title:
          user.Business_Name ||
          "Digital Shop",

        text:
          text,

        url:
          url
      });

    } catch (error) {

      console.log(
        "Share cancelled"
      );

    }

    return;
  }


  await copyShopLink();

}


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

  const old =
    document.getElementById(
      "dashboardToast"
    );

  if (old) {
    old.remove();
  }


  const toast =
    document.createElement("div");

  toast.id =
    "dashboardToast";

  toast.textContent =
    message;

  toast.style.cssText = `
    position:fixed;
    left:50%;
    bottom:25px;
    transform:translateX(-50%);
    background:#111;
    color:#fff;
    padding:12px 18px;
    border-radius:30px;
    z-index:100000;
    font-family:system-ui;
    font-size:14px;
    box-shadow:0 5px 20px rgba(0,0,0,.25);
  `;

  document.body.appendChild(
    toast
  );


  setTimeout(
    () => toast.remove(),
    2200
  );

}


// ==========================================
// DASHBOARD
// ==========================================

function renderDashboard() {

  const user =
    dashboardData.user;


  document.getElementById(
    "dashboardApp"
  ).innerHTML = `

    <div style="
      min-height:100vh;
      background:#f5f5f5;
      font-family:system-ui;
    ">


      <!-- HEADER -->

      <header style="
        background:#111;
        color:#fff;
        padding:15px 20px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:15px;
        position:sticky;
        top:0;
        z-index:100;
      ">

        <div>

          <div style="
            font-size:20px;
            font-weight:800;
          ">
            Digital Shop
          </div>

          <div style="
            font-size:13px;
            opacity:.75;
          ">
            ${esc(
              user.Business_Name ||
              ""
            )}
          </div>

        </div>


        <button
          onclick="logoutUser()"
          style="
            border:1px solid rgba(255,255,255,.3);
            background:transparent;
            color:#fff;
            padding:9px 14px;
            border-radius:10px;
          "
        >
          Logout
        </button>

      </header>


      <main style="
        max-width:1100px;
        margin:auto;
        padding:20px;
      ">


        <!-- SHOP ACTIONS -->

        <section style="
          background:#fff;
          padding:20px;
          border-radius:18px;
          margin-bottom:20px;
          box-shadow:0 5px 20px rgba(0,0,0,.06);
        ">

          <h2 style="
            margin:0 0 15px;
          ">
            Your Digital Shop
          </h2>


          <div style="
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(150px,1fr));
            gap:10px;
          ">


            <button
              onclick="openShop()"
              style="
                padding:13px;
                border:0;
                border-radius:11px;
                background:#111;
                color:#fff;
                font-weight:700;
              "
            >
              🌐 Open Shop
            </button>


            <button
              onclick="copyShopLink()"
              style="
                padding:13px;
                border:1px solid #ddd;
                border-radius:11px;
                background:#fff;
                font-weight:700;
              "
            >
              🔗 Copy Link
            </button>


            <button
              onclick="openQR()"
              style="
                padding:13px;
                border:1px solid #ddd;
                border-radius:11px;
                background:#fff;
                font-weight:700;
              "
            >
              ▣ Show QR
            </button>


            <button
              onclick="shareShop()"
              style="
                padding:13px;
                border:0;
                border-radius:11px;
                background:#25D366;
                color:#fff;
                font-weight:700;
              "
            >
              📤 Share Shop
            </button>

          </div>


          <div style="
            margin-top:15px;
            padding:12px;
            background:#f7f7f7;
            border-radius:10px;
            font-size:12px;
            color:#666;
            word-break:break-all;
          ">
            ${esc(
              getShopUrl()
            )}
          </div>

        </section>


        <!-- PROFILE -->

        <section style="
          background:#fff;
          padding:20px;
          border-radius:18px;
          margin-bottom:20px;
          box-shadow:0 5px 20px rgba(0,0,0,.06);
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:15px;
            flex-wrap:wrap;
          ">


            <div style="
              display:flex;
              align-items:center;
              gap:15px;
            ">

              ${
                user.Logo

                  ? `

                    <img
                      src="${esc(user.Logo)}"
                      style="
                        width:75px;
                        height:75px;
                        object-fit:contain;
                        border-radius:14px;
                        border:1px solid #eee;
                      "
                    >

                  `

                  :

                  `

                    <div style="
                      width:75px;
                      height:75px;
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      background:#eee;
                      border-radius:14px;
                      font-size:28px;
                    ">
                      🏪
                    </div>

                  `
              }


              <div>

                <h2 style="
                  margin:0 0 5px;
                ">
                  ${esc(
                    user.Business_Name ||
                    "Business"
                  )}
                </h2>

                <div style="
                  color:#777;
                ">
                  User ID:
                  <b>
                    ${esc(
                      user.User_ID
                    )}
                  </b>
                </div>

              </div>

            </div>


            <button
              onclick="openProfileEditor()"
              style="
                border:0;
                background:#111;
                color:#fff;
                padding:12px 18px;
                border-radius:10px;
                font-weight:700;
              "
            >
              ✏️ Edit Profile
            </button>

          </div>

        </section>


        <!-- STATS -->

        <div style="
          display:grid;
          grid-template-columns:
            repeat(auto-fit,minmax(180px,1fr));
          gap:15px;
          margin-bottom:20px;
        ">


          <div style="
            background:#fff;
            padding:20px;
            border-radius:16px;
          ">

            <div style="
              color:#777;
            ">
              Products
            </div>

            <div style="
              font-size:30px;
              font-weight:800;
            ">
              ${
                dashboardData.products.length
              }
            </div>

          </div>


          <div style="
            background:#fff;
            padding:20px;
            border-radius:16px;
          ">

            <div style="
              color:#777;
            ">
              Categories
            </div>

            <div style="
              font-size:30px;
              font-weight:800;
            ">
              ${
                dashboardData.categories.length
              }
            </div>

          </div>


        </div>


        <!-- PRODUCTS -->

        <section style="
          background:#fff;
          padding:20px;
          border-radius:18px;
          margin-bottom:20px;
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:10px;
            flex-wrap:wrap;
          ">

            <h2 style="
              margin:0;
            ">
              Products
            </h2>


            <button
              onclick="openProductEditor()"
              style="
                border:0;
                background:#111;
                color:#fff;
                padding:11px 16px;
                border-radius:10px;
                font-weight:700;
              "
            >
              + Add Product
            </button>

          </div>


          <div style="
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(180px,1fr));
            gap:15px;
            margin-top:20px;
          ">

            ${
              dashboardData.products.length

                ?

                dashboardData.products
                  .map(
                    productDashboardCard
                  )
                  .join("")

                :

                `
                  <div style="
                    color:#777;
                    padding:20px 0;
                  ">
                    No products yet.
                  </div>
                `
            }

          </div>

        </section>


        <!-- CATEGORIES -->

        <section style="
          background:#fff;
          padding:20px;
          border-radius:18px;
          margin-bottom:20px;
        ">


          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:10px;
          ">

            <h2 style="
              margin:0;
            ">
              Categories
            </h2>


            <button
              onclick="openCategoryEditor()"
              style="
                border:0;
                background:#111;
                color:#fff;
                padding:10px 15px;
                border-radius:10px;
                font-weight:700;
              "
            >
              + Add Category
            </button>

          </div>


          <div style="
            display:flex;
            flex-wrap:wrap;
            gap:10px;
            margin-top:18px;
          ">

            ${
              dashboardData.categories.length

                ?

                dashboardData.categories
                  .map(
                    c => `
                      <div style="
                        padding:10px 14px;
                        background:#f1f1f1;
                        border-radius:20px;
                      ">
                        ${esc(c.Name)}
                      </div>
                    `
                  )
                  .join("")

                :

                `
                  <span style="
                    color:#777;
                  ">
                    No categories yet.
                  </span>
                `
            }

          </div>

        </section>


        <!-- ACCOUNT -->

        <section style="
          background:#fff;
          padding:20px;
          border-radius:18px;
        ">

          <h2>
            Account Details
          </h2>


          <p>
            <b>Business:</b>
            ${esc(
              user.Business_Name ||
              ""
            )}
          </p>


          <p>
            <b>Owner:</b>
            ${esc(
              user.Owner_Name ||
              ""
            )}
          </p>


          <p>
            <b>Mobile:</b>
            ${esc(
              user.Mobile ||
              ""
            )}
          </p>


          <p>
            <b>WhatsApp:</b>
            ${esc(
              user.WhatsApp ||
              ""
            )}
          </p>


          <p>
            <b>Email:</b>
            ${esc(
              user.Email ||
              ""
            )}
          </p>


          <p>
            <b>Address:</b>
            ${esc(
              user.Address ||
              ""
            )}
          </p>


          <p>
            <b>Status:</b>
            ${esc(
              user.Status ||
              ""
            )}
          </p>

        </section>


      </main>

    </div>

  `;

}


// ==========================================
// PRODUCT CARD
// ==========================================

function productDashboardCard(
  product
) {

  let image = "";

  if (product.Images) {

    image =
      String(
        product.Images
      )
        .split("|")[0]
        .trim();

  }


  return `

    <div style="
      border:1px solid #eee;
      border-radius:15px;
      overflow:hidden;
      background:#fff;
    ">


      ${
        image

          ?

          `
            <img
              src="${esc(image)}"
              style="
                width:100%;
                aspect-ratio:1;
                object-fit:cover;
                display:block;
              "
            >
          `

          :

          `
            <div style="
              width:100%;
              aspect-ratio:1;
              background:#eee;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:35px;
            ">
              📦
            </div>
          `
      }


      <div style="
        padding:12px;
      ">


        <div style="
          font-weight:700;
          margin-bottom:5px;
        ">
          ${esc(
            product.Name
          )}
        </div>


        ${
          product.Price !== ""

            ?

            `
              <div style="
                color:#555;
                margin-bottom:10px;
              ">
                ₹${esc(
                  product.Price
                )}
              </div>
            `

            :

            ""
        }


        <div style="
          display:flex;
          gap:7px;
        ">


          <button
            onclick='openProductEditor(${JSON.stringify(product).replace(/'/g,"&#039;")})'
            style="
              flex:1;
              padding:9px;
              border:1px solid #ddd;
              background:#fff;
              border-radius:8px;
            "
          >
            Edit
          </button>


          <button
            onclick="removeProduct('${esc(
              product.Product_ID
            )}')"
            style="
              padding:9px;
              border:0;
              background:#fee;
              color:#c00;
              border-radius:8px;
            "
          >
            Delete
          </button>


        </div>

      </div>

    </div>

  `;

}


// ==========================================
// PROFILE EDITOR
// ==========================================

function openProfileEditor() {

  const user =
    dashboardData.user;


  const overlay =
    document.createElement(
      "div"
    );

  overlay.id =
    "editOverlay";


  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.6);
    z-index:9999;
    overflow:auto;
    padding:20px;
  `;


  overlay.innerHTML = `

    <div style="
      max-width:600px;
      margin:20px auto;
      background:#fff;
      border-radius:20px;
      padding:22px;
      font-family:system-ui;
    ">


      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">

        <h2 style="
          margin:0;
        ">
          Edit Profile
        </h2>


        <button
          onclick="closeEditor()"
          style="
            border:0;
            background:#eee;
            width:38px;
            height:38px;
            border-radius:50%;
            font-size:20px;
          "
        >
          ×
        </button>

      </div>


      <!-- LOGO -->

      <div style="
        margin-top:20px;
        text-align:center;
      ">


        ${
          user.Logo

            ?

            `
              <img
                id="logoPreview"
                src="${esc(user.Logo)}"
                style="
                  width:100px;
                  height:100px;
                  object-fit:contain;
                  border:1px solid #ddd;
                  border-radius:15px;
                "
              >
            `

            :

            `
              <div
                id="logoPreview"
                style="
                  width:100px;
                  height:100px;
                  margin:auto;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  background:#eee;
                  border-radius:15px;
                  font-size:35px;
                "
              >
                🏪
              </div>
            `
        }


        <br>


        <div style="
  display:flex;
  justify-content:center;
  gap:8px;
  flex-wrap:wrap;
  margin-top:10px;
">

  <button
    type="button"
    onclick="document.getElementById('logoCameraFile').click()"
    style="
      padding:10px 14px;
      border:1px solid #ddd;
      border-radius:10px;
      background:#fff;
      font-weight:600;
    "
  >
    📷 Camera
  </button>


  <button
    type="button"
    onclick="document.getElementById('logoFile').click()"
    style="
      padding:10px 14px;
      border:1px solid #ddd;
      border-radius:10px;
      background:#fff;
      font-weight:600;
    "
  >
    📁 Choose File
  </button>

</div>


<input
  id="logoCameraFile"
  type="file"
  accept="image/*"
  capture="environment"
  style="display:none;"
>


<input
  id="logoFile"
  type="file"
  accept="image/*"
  style="display:none;"
>


<div
  id="logoSelectedFile"
  style="
    margin-top:8px;
    font-size:12px;
    color:#777;
  "
>
</div>


        <div style="
  color:#777;
  font-size:12px;
  margin-top:8px;
">
  JPG recommended • Any size accepted • Automatically converted to square & compressed below 100 KB
</div>


        <button
          onclick="uploadLogo()"
          style="
            margin-top:10px;
            padding:10px 16px;
            border:0;
            border-radius:10px;
            background:#111;
            color:#fff;
          "
        >
          Upload Logo
        </button>


        <div
          id="logoMessage"
          style="
            margin-top:8px;
            font-size:13px;
          "
        ></div>


      </div>


      <div style="
        margin-top:20px;
      ">


        ${profileInput(
          "Business_Name",
          "Business Name",
          user.Business_Name
        )}


        ${profileInput(
          "Owner_Name",
          "Owner Name",
          user.Owner_Name
        )}


        ${profileInput(
          "Mobile",
          "Mobile",
          user.Mobile
        )}


        ${profileInput(
          "WhatsApp",
          "WhatsApp",
          user.WhatsApp
        )}


        ${profileInput(
          "Email",
          "Email",
          user.Email
        )}


        ${profileInput(
          "Address",
          "Address",
          user.Address
        )}


        ${profileInput(
          "Map_Link",
          "Google Map Link",
          user.Map_Link
        )}


        ${themeSelect(
  user.Theme_ID
)}


      </div>


      <button
        onclick="saveProfileChanges()"
        style="
          width:100%;
          margin-top:15px;
          padding:14px;
          border:0;
          border-radius:12px;
          background:#111;
          color:#fff;
          font-size:16px;
          font-weight:700;
        "
      >
        SAVE PROFILE
      </button>


      <div
        id="profileMessage"
        style="
          text-align:center;
          margin-top:10px;
        "
      ></div>


    </div>

  `;


  document.body.appendChild(
    overlay
  );

}


function profileInput(
  id,
  label,
  value
) {

  return `

    <label style="
      display:block;
      margin-top:14px;
      font-weight:600;
    ">

      ${esc(label)}


      <input
        id="profile_${esc(id)}"
        value="${esc(
          value || ""
        )}"
        style="
          display:block;
          width:100%;
          box-sizing:border-box;
          padding:12px;
          margin-top:6px;
          border:1px solid #ddd;
          border-radius:10px;
          font-size:15px;
        "
      >

    </label>

  `;

}

// ==========================================
// THEME DROPDOWN
// ==========================================

function themeSelect(
  currentTheme
) {

  const themes = [

    {
      id:"T01",
      name:"Luxury Black"
    },

    {
      id:"T02",
      name:"Silver Premium"
    },

    {
      id:"T03",
      name:"Royal Blue"
    },

    {
      id:"T04",
      name:"Minimal White"
    },

    {
      id:"T05",
      name:"Dark Gold"
    },

    {
      id:"T06",
      name:"Modern"
    }

  ];


  const options =
    themes
      .map(
        theme => `

          <option
            value="${theme.id}"
            ${
              String(
                currentTheme || ""
              ).toUpperCase() ===
              theme.id

                ? "selected"

                : ""
            }
          >
            ${theme.id} - ${theme.name}
          </option>

        `
      )
      .join("");


  return `

    <label style="
      display:block;
      margin-top:14px;
      font-weight:600;
    ">

      Theme


      <select
        id="profile_Theme_ID"
        style="
          display:block;
          width:100%;
          box-sizing:border-box;
          padding:12px;
          margin-top:6px;
          border:1px solid #ddd;
          border-radius:10px;
          font-size:15px;
          background:#fff;
        "
      >

        ${options}

      </select>

    </label>

  `;

}


function closeEditor() {

  const overlay =
    document.getElementById(
      "editOverlay"
    );

  if (overlay) {

    overlay.remove();

  }

}


// ==========================================
// SAVE PROFILE
// ==========================================

async function saveProfileChanges() {

  const fields = [

    "Business_Name",
    "Owner_Name",
    "Mobile",
    "WhatsApp",
    "Email",
    "Address",
    "Map_Link",
    "Theme_ID"

  ];


  const payload = {

    action:
      "saveProfile",

    User_ID:
      dashboardData.user.User_ID

  };


  fields.forEach(
    field => {

      const input =
        document.getElementById(
          "profile_" +
          field
        );

      if (input) {

        payload[field] =
          input.value.trim();

      }

    }
  );


  const message =
    document.getElementById(
      "profileMessage"
    );


  message.textContent =
    "Saving...";


  try {

    const response =
      await fetch(
        API_URL,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      message.style.color =
        "#c00";

      message.textContent =
        result.error ||
        "Unable to save profile";

      return;
    }


    message.style.color =
      "green";

    message.textContent =
      "Profile saved successfully";


    await loadDashboard(
      dashboardData.user.User_ID
    );


    setTimeout(
      closeEditor,
      700
    );


  } catch (error) {

    console.error(error);

    message.style.color =
      "#c00";

    message.textContent =
      "Connection error";

  }

}


// ==========================================
// LOGO UPLOAD
// ==========================================

async function uploadLogo() {

  const normalInput =
    document.getElementById(
      "logoFile"
    );

  const cameraInput =
    document.getElementById(
      "logoCameraFile"
    );

  const message =
    document.getElementById(
      "logoMessage"
    );

  const selectedText =
    document.getElementById(
      "logoSelectedFile"
    );


  const file =
    (
      cameraInput &&
      cameraInput.files &&
      cameraInput.files.length
    )
      ? cameraInput.files[0]

      :

      (
        normalInput &&
        normalInput.files &&
        normalInput.files.length
      )
        ? normalInput.files[0]

        : null;


  if (!file) {

    message.style.color =
      "#c00";

    message.textContent =
      "Please select logo first";

    return;
  }


  message.style.color =
    "#555";

  message.textContent =
    "Processing logo...";


  try {

    // Logo = square but preserve full logo
    const processed =
      await processImage(
        file,
        "contain"
      );


    message.textContent =
      "Uploading logo...";


    const payload = {

      action:
        "saveLogo",

      User_ID:
        dashboardData.user.User_ID,

      base64:
        processed.base64

    };


    const response =
      await fetch(
        API_URL,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      message.style.color =
        "#c00";

      message.textContent =
        result.error ||
        "Logo upload failed";

      return;
    }


    message.style.color =
      "green";

    message.textContent =
      "Logo uploaded successfully";


    if (selectedText) {

      selectedText.textContent =
        "Saved image: " +
        Math.round(
          processed.size / 1024
        ) +
        " KB • " +
        processed.width +
        " × " +
        processed.height;

    }


    dashboardData.user.Logo =
      result.imageUrl;


    const preview =
      document.getElementById(
        "logoPreview"
      );


    if (preview) {

      if (
        preview.tagName ===
        "IMG"
      ) {

        preview.src =
          result.imageUrl;

      } else {

        preview.outerHTML = `

          <img
            id="logoPreview"
            src="${esc(
              result.imageUrl
            )}"
            style="
              width:100px;
              height:100px;
              object-fit:contain;
              border:1px solid #ddd;
              border-radius:15px;
            "
          >

        `;

      }

    }


  } catch (error) {

    console.error(error);

    message.style.color =
      "#c00";

    message.textContent =
      error.message ||
      "Logo processing failed";

  }

}


// ==========================================
// IMAGE PROCESSOR
// Square + Compress to <= 100 KB
// ==========================================

const MAX_IMAGE_BYTES = 100 * 1024;
const MAX_IMAGE_SIZE = 1000;

function processImage(
  file,
  mode = "cover"
) {

  return new Promise(
    (resolve, reject) => {

      if (!file) {
        reject(
          new Error("No image selected")
        );
        return;
      }

      if (
        !file.type ||
        !file.type.startsWith("image/")
      ) {
        reject(
          new Error("Please select an image file")
        );
        return;
      }

      const reader =
        new FileReader();

      reader.onload = function () {

        const img =
          new Image();

        img.onload = async function () {

          try {

            let size =
              MAX_IMAGE_SIZE;

            let blob =
              null;

            while (size >= 300) {

              const canvas =
                document.createElement(
                  "canvas"
                );

              canvas.width =
                size;

              canvas.height =
                size;

              const ctx =
                canvas.getContext(
                  "2d"
                );

              // White background
              // This also handles transparent PNG logos
              ctx.fillStyle =
                "#ffffff";

              ctx.fillRect(
                0,
                0,
                size,
                size
              );

              const sourceWidth =
                img.naturalWidth ||
                img.width;

              const sourceHeight =
                img.naturalHeight ||
                img.height;


              let drawWidth;
              let drawHeight;
              let offsetX;
              let offsetY;


              // --------------------------------
              // LOGO = CONTAIN
              // PRODUCT = COVER
              // --------------------------------

              if (
                mode === "contain"
              ) {

                const scale =
                  Math.min(
                    size / sourceWidth,
                    size / sourceHeight
                  );

                drawWidth =
                  sourceWidth * scale;

                drawHeight =
                  sourceHeight * scale;

                offsetX =
                  (size - drawWidth) / 2;

                offsetY =
                  (size - drawHeight) / 2;

                ctx.drawImage(
                  img,
                  offsetX,
                  offsetY,
                  drawWidth,
                  drawHeight
                );

              } else {

                const scale =
                  Math.max(
                    size / sourceWidth,
                    size / sourceHeight
                  );

                drawWidth =
                  sourceWidth * scale;

                drawHeight =
                  sourceHeight * scale;

                offsetX =
                  (size - drawWidth) / 2;

                offsetY =
                  (size - drawHeight) / 2;

                ctx.drawImage(
                  img,
                  offsetX,
                  offsetY,
                  drawWidth,
                  drawHeight
                );

              }


              // Try quality from high to low
              for (
                let quality = 0.90;
                quality >= 0.25;
                quality -= 0.05
              ) {

                blob =
                  await new Promise(
                    resolveBlob => {

                      canvas.toBlob(
                        resolveBlob,
                        "image/jpeg",
                        quality
                      );

                    }
                  );


                if (
                  blob &&
                  blob.size <=
                  MAX_IMAGE_BYTES
                ) {

                  const base64 =
                    await blobToBase64(
                      blob
                    );

                  resolve({
                    base64:
                      base64,

                    size:
                      blob.size,

                    width:
                      size,

                    height:
                      size,

                    mimeType:
                      "image/jpeg"
                  });

                  return;

                }

              }

              // Still larger than 100 KB
              // Reduce square size and try again
              size =
                Math.floor(
                  size * 0.80
                );

            }


            reject(
              new Error(
                "Unable to compress image below 100 KB"
              )
            );

          } catch (error) {

            reject(error);

          }

        };


        img.onerror =
          function () {

            reject(
              new Error(
                "Unable to read image"
              )
            );

          };


        img.src =
          reader.result;

      };


      reader.onerror =
        function () {

          reject(
            new Error(
              "Unable to read selected file"
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


// ==========================================
// BLOB TO BASE64
// ==========================================

function blobToBase64(
  blob
) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload =
        function () {

          const result =
            String(
              reader.result
            );

          resolve(
            result.split(",")[1]
          );

        };

      reader.onerror =
        reject;

      reader.readAsDataURL(
        blob
      );

    }
  );

}


// ==========================================
// PRODUCT EDITOR
// ==========================================

function openProductEditor(
  product = null
) {

  editingProductId =
    product
      ? product.Product_ID
      : "";


  const overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "productOverlay";


  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.6);
    z-index:9999;
    overflow:auto;
    padding:20px;
  `;


  const categoryOptions =
    dashboardData.categories
      .map(
        c => `

          <option
            value="${esc(c.Name)}"
            ${
              product &&
              product.Category ===
              c.Name
                ? "selected"
                : ""
            }
          >
            ${esc(c.Name)}
          </option>

        `
      )
      .join("");


  overlay.innerHTML = `

    <div style="
      max-width:550px;
      margin:20px auto;
      background:#fff;
      border-radius:20px;
      padding:22px;
      font-family:system-ui;
    ">


      <div style="
        display:flex;
        justify-content:space-between;
      ">

        <h2 style="
          margin:0;
        ">
          ${
            product
              ? "Edit Product"
              : "New Product"
          }
        </h2>


        <button
          onclick="closeProductEditor()"
          style="
            border:0;
            background:#eee;
            width:38px;
            height:38px;
            border-radius:50%;
            font-size:20px;
          "
        >
          ×
        </button>

      </div>


      ${productInput(
        "productName",
        "Product Name",
        product?.Name
      )}


      <label style="
        display:block;
        margin-top:14px;
        font-weight:600;
      ">

        Category


        <select
          id="productCategory"
          style="
            width:100%;
            padding:12px;
            margin-top:6px;
            border:1px solid #ddd;
            border-radius:10px;
          "
        >

          <option value="">
            Select Category
          </option>

          ${categoryOptions}

        </select>

      </label>


      ${productInput(
        "productCode",
        "Product Code",
        product?.Code
      )}


      ${productInput(
        "productPrice",
        "Price",
        product?.Price
      )}


      ${productInput(
        "productDescription",
        "Description",
        product?.Description
      )}


      <label style="
        display:block;
        margin-top:14px;
        font-weight:600;
      ">

        Product Image


        <div style="
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  margin-top:7px;
">

  <button
    type="button"
    onclick="document.getElementById('productCameraFile').click()"
    style="
      padding:10px 14px;
      border:1px solid #ddd;
      border-radius:10px;
      background:#fff;
      font-weight:600;
    "
  >
    📷 Camera
  </button>


  <button
    type="button"
    onclick="document.getElementById('productImageFile').click()"
    style="
      padding:10px 14px;
      border:1px solid #ddd;
      border-radius:10px;
      background:#fff;
      font-weight:600;
    "
  >
    📁 Choose File
  </button>

</div>


<input
  id="productCameraFile"
  type="file"
  accept="image/*"
  capture="environment"
  style="display:none;"
>


<input
  id="productImageFile"
  type="file"
  accept="image/*"
  style="display:none;"
>


<div
  id="productSelectedFile"
  style="
    margin-top:8px;
    color:#777;
    font-size:12px;
  "
>
</div>


<div style="
  margin-top:6px;
  color:#777;
  font-size:12px;
">
  Any size accepted • Automatically converted to square & compressed below 100 KB
</div>

      </label>


      <button
        onclick="saveProductChanges()"
        style="
          width:100%;
          margin-top:20px;
          padding:14px;
          border:0;
          border-radius:12px;
          background:#111;
          color:#fff;
          font-weight:700;
          font-size:16px;
        "
      >
        SAVE PRODUCT
      </button>


      <div
        id="productMessage"
        style="
          text-align:center;
          margin-top:10px;
        "
      ></div>


    </div>

  `;


  document.body.appendChild(
    overlay
  );

}


function productInput(
  id,
  label,
  value
) {

  return `

    <label style="
      display:block;
      margin-top:14px;
      font-weight:600;
    ">

      ${esc(label)}


      <input
        id="${esc(id)}"
        value="${esc(
          value || ""
        )}"
        style="
          display:block;
          width:100%;
          box-sizing:border-box;
          padding:12px;
          margin-top:6px;
          border:1px solid #ddd;
          border-radius:10px;
        "
      >

    </label>

  `;

}


function closeProductEditor() {

  const overlay =
    document.getElementById(
      "productOverlay"
    );

  if (overlay) {

    overlay.remove();

  }

}


// ==========================================
// SAVE PRODUCT
// ==========================================

async function saveProductChanges() {

  const nameElement =
    document.getElementById(
      "productName"
    );

  const categoryElement =
    document.getElementById(
      "productCategory"
    );

  const codeElement =
    document.getElementById(
      "productCode"
    );

  const priceElement =
    document.getElementById(
      "productPrice"
    );

  const descriptionElement =
    document.getElementById(
      "productDescription"
    );

  const message =
    document.getElementById(
      "productMessage"
    );


  // ------------------------------------------
  // BASIC CHECK
  // ------------------------------------------

  if (!nameElement) {

    alert(
      "Product form not found"
    );

    return;

  }


  const name =
    nameElement.value.trim();


  if (!name) {

    alert(
      "Product name required"
    );

    return;

  }


  if (message) {

    message.style.color =
      "#555";

    message.textContent =
      "Saving product...";

  }


  // ------------------------------------------
  // PRODUCT DATA
  // ------------------------------------------

  const payload = {

    action:
      "saveProduct",

    User_ID:
      dashboardData.user.User_ID,

    Product_ID:
      editingProductId || "",

    Name:
      name,

    Category:
      categoryElement
        ? categoryElement.value
        : "",

    Code:
      codeElement
        ? codeElement.value.trim()
        : "",

    Price:
      priceElement
        ? priceElement.value.trim()
        : "",

    Description:
      descriptionElement
        ? descriptionElement.value.trim()
        : "",

    Status:
      "active"

  };


  try {

    // ----------------------------------------
    // SAVE PRODUCT DATA
    // ----------------------------------------

    const response =
      await fetch(
        API_URL,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      if (message) {

        message.style.color =
          "#c00";

        message.textContent =
          result.error ||
          "Product save failed";

      }

      return;

    }


    // ----------------------------------------
    // PRODUCT ID
    // ----------------------------------------

    const savedProductId =
      result.Product_ID ||
      editingProductId;


    if (!savedProductId) {

      if (message) {

        message.style.color =
          "#c00";

        message.textContent =
          "Product saved but Product ID was not returned.";

      }

      return;

    }


    // ----------------------------------------
    // GET SELECTED IMAGE
    // ----------------------------------------

    const fileInput =
      document.getElementById(
        "productImageFile"
      );


    const cameraInput =
      document.getElementById(
        "productCameraFile"
      );


    const selectedText =
      document.getElementById(
        "productSelectedFile"
      );


    const file =

      (
        cameraInput &&
        cameraInput.files &&
        cameraInput.files.length
      )

        ?

        cameraInput.files[0]

        :

        (
          fileInput &&
          fileInput.files &&
          fileInput.files.length
        )

          ?

          fileInput.files[0]

          :

          null;


    // ----------------------------------------
    // IMAGE UPLOAD ONLY IF SELECTED
    // ----------------------------------------

    if (file) {

      try {

        if (message) {

          message.style.color =
            "#555";

          message.textContent =
            "Processing product image...";

        }


        // ------------------------------------
        // PRODUCT IMAGE
        // Square + <= 100 KB
        // ------------------------------------

        const processed =
          await processImage(
            file,
            "cover"
          );


        if (message) {

          message.textContent =
            "Uploading product image...";

        }


        // ------------------------------------
        // UPLOAD IMAGE TO DRIVE
        // ------------------------------------

        const imageResponse =
          await fetch(
            API_URL,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "text/plain;charset=utf-8"
              },

              body:
                JSON.stringify({

                  action:
                    "saveProductImage",

                  User_ID:
                    dashboardData.user.User_ID,

                  Product_ID:
                    savedProductId,

                  base64:
                    processed.base64

                })
            }
          );


        const imageResult =
          await imageResponse.json();


        if (!imageResult.ok) {

          if (message) {

            message.style.color =
              "#c00";

            message.textContent =
              imageResult.error ||
              "Product image upload failed";

          }

          return;

        }


        // ------------------------------------
        // SHOW IMAGE INFORMATION
        // ------------------------------------

        if (selectedText) {

          selectedText.textContent =
            "Saved image: " +
            Math.round(
              processed.size / 1024
            ) +
            " KB • " +
            processed.width +
            " × " +
            processed.height;

        }

      } catch (imageError) {

        console.error(
          "Product image error:",
          imageError
        );


        if (message) {

          message.style.color =
            "#c00";

          message.textContent =
            imageError.message ||
            "Product image processing failed";

        }

        return;

      }

    }


    // ----------------------------------------
    // SUCCESS
    // ----------------------------------------

    if (message) {

      message.style.color =
        "green";

      message.textContent =
        file
          ? "Product and image saved successfully"
          : "Product saved successfully";

    }


    // ----------------------------------------
    // CLOSE EDITOR
    // ----------------------------------------

    setTimeout(
      async function () {

        closeProductEditor();

        await loadDashboard(
          dashboardData.user.User_ID
        );

      },
      500
    );


  } catch (error) {

    console.error(
      "Save product error:",
      error
    );


    if (message) {

      message.style.color =
        "#c00";

      message.textContent =
        error.message ||
        "Connection error while saving product";

    }

  }

}


// ==========================================
// DELETE PRODUCT
// ==========================================

async function removeProduct(
  productId
) {

  if (
    !confirm(
      "Delete this product?"
    )
  ) {

    return;
  }


  try {

    const response =
      await fetch(
        API_URL,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify({

              action:
                "deleteProduct",

              User_ID:
                dashboardData.user.User_ID,

              Product_ID:
                productId

            })
        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      alert(
        result.error ||
        "Delete failed"
      );

      return;
    }


    await loadDashboard(
      dashboardData.user.User_ID
    );


  } catch (error) {

    console.error(error);

    alert(
      "Connection error"
    );

  }

}


// ==========================================
// CATEGORY
// ==========================================

function openCategoryEditor() {

  const name =
    prompt(
      "Enter new category name:"
    );


  if (
    !name ||
    !name.trim()
  ) {

    return;
  }


  saveCategory(
    name.trim()
  );

}


async function saveCategory(
  name
) {

  try {

    const response =
      await fetch(
        API_URL,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify({

              action:
                "saveCategory",

              User_ID:
                dashboardData.user.User_ID,

              Name:
                name

            })
        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      alert(
        result.error ||
        "Category save failed"
      );

      return;
    }


    await loadDashboard(
      dashboardData.user.User_ID
    );


  } catch (error) {

    console.error(error);

    alert(
      "Connection error"
    );

  }

}


// ==========================================
// LOGOUT
// ==========================================

function logoutUser() {

  clearSession();


  dashboardData = {

    user:null,

    products:[],

    categories:[]

  };


  window.location.replace(
    "./dashboard.html"
  );

}


// ==========================================
// AUTH CHECK
// ==========================================

function startDashboard() {

  const urlUserId =
    getUrlUserId();

  const session =
    getSession();


  // ----------------------------------------
  // NO USER ID
  // ----------------------------------------

  if (!urlUserId) {

    if (
      session &&
      session.User_ID
    ) {

      window.location.replace(
        "./dashboard.html?userId=" +
        encodeURIComponent(
          session.User_ID
        )
      );

      return;
    }


    renderLogin();

    return;
  }


  // ----------------------------------------
  // USER ID BUT NO SESSION
  // ----------------------------------------

  if (
    !session ||
    !session.User_ID
  ) {

    goToLogin();

    return;
  }


  // ----------------------------------------
  // WRONG USER
  // ----------------------------------------

  if (
    String(
      session.User_ID
    ).toLowerCase() !==

    String(
      urlUserId
    ).toLowerCase()
  ) {

    goToLogin();

    return;
  }


  // ----------------------------------------
  // VALID SESSION
  // ----------------------------------------

  loadDashboard(
    session.User_ID
  );

}


// ==========================================
// START
// ==========================================

startDashboard();
