const API_URL =
  "https://script.google.com/macros/s/AKfycbwbU3NlHVOUCTpSYQoyO-WsqMkd3RyPFKeq1YPh1zlKF3BI_7UlDeIpYuK4TxE15B0uTQ/exec";

const SESSION_KEY = "digital_shop_user";

let dashboardData = {
  user: null,
  products: [],
  categories: []
};


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
// GET URL USER ID
// ==========================================

function getUrlUserId() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get("userId") || "";

}


// ==========================================
// GET SAVED SESSION
// ==========================================

function getSession() {

  try {

    const saved =
      localStorage.getItem(SESSION_KEY);

    if (!saved) return null;

    return JSON.parse(saved);

  } catch (error) {

    console.error(error);

    return null;
  }

}


// ==========================================
// SAVE SESSION
// ==========================================

function saveSession(user) {

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      User_ID: user.User_ID
    })
  );

}


// ==========================================
// CLEAR SESSION
// ==========================================

function clearSession() {

  localStorage.removeItem(
    SESSION_KEY
  );

}


// ==========================================
// REDIRECT TO LOGIN
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
            font-size:28px;
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


        <form
          id="loginForm"
        >

          <label style="
            display:block;
            margin-bottom:7px;
            font-weight:600;
          ">
            User ID
          </label>

          <input
            id="loginUserId"
            type="text"
            placeholder="Enter User ID"
            autocomplete="username"
            required
            style="
              width:100%;
              box-sizing:border-box;
              padding:14px;
              border:1px solid #ddd;
              border-radius:12px;
              font-size:16px;
              margin-bottom:16px;
            "
          >


          <label style="
            display:block;
            margin-bottom:7px;
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
              border:1px solid #ddd;
              border-radius:12px;
              font-size:16px;
              margin-bottom:18px;
            "
          >


          <button
            type="submit"
            id="loginButton"
            style="
              width:100%;
              border:0;
              padding:15px;
              border-radius:12px;
              background:#111;
              color:#fff;
              font-size:16px;
              font-weight:700;
              cursor:pointer;
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
              min-height:20px;
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


  if (!userId || !password) {

    message.textContent =
      "User ID and password required";

    return;
  }


  button.disabled = true;

  button.textContent =
    "LOGINNING...";

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


    // Save login session
    saveSession(result.user);


    // IMPORTANT:
    // Always create clean user dashboard URL
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
        font-family:system-ui;
        text-align:center;
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
              color:white;
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
// RENDER DASHBOARD
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


      <header style="
        background:#111;
        color:#fff;
        padding:16px 20px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:15px;
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
            ${esc(user.Business_Name || "")}
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
            cursor:pointer;
          "
        >
          Logout
        </button>

      </header>


      <main style="
        max-width:1000px;
        margin:auto;
        padding:20px;
      ">


        <div style="
          background:#fff;
          padding:20px;
          border-radius:18px;
          margin-bottom:20px;
          box-shadow:0 5px 20px rgba(0,0,0,.06);
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
                      width:70px;
                      height:70px;
                      object-fit:contain;
                      border-radius:12px;
                      border:1px solid #eee;
                    "
                  >
                `
                : `
                  <div style="
                    width:70px;
                    height:70px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#eee;
                    border-radius:12px;
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
                ${esc(user.Business_Name || "Business")}
              </h2>

              <div style="
                color:#777;
              ">
                User ID:
                <b>${esc(user.User_ID)}</b>
              </div>

            </div>

          </div>

        </div>


        <div style="
          display:grid;
          grid-template-columns:
            repeat(auto-fit,minmax(180px,1fr));
          gap:15px;
        ">


          <div style="
            background:#fff;
            padding:20px;
            border-radius:16px;
          ">

            <div style="
              color:#777;
              font-size:14px;
            ">
              Products
            </div>

            <div style="
              font-size:30px;
              font-weight:800;
            ">
              ${dashboardData.products.length}
            </div>

          </div>


          <div style="
            background:#fff;
            padding:20px;
            border-radius:16px;
          ">

            <div style="
              color:#777;
              font-size:14px;
            ">
              Categories
            </div>

            <div style="
              font-size:30px;
              font-weight:800;
            ">
              ${dashboardData.categories.length}
            </div>

          </div>


        </div>


        <div style="
          margin-top:20px;
          background:#fff;
          padding:20px;
          border-radius:18px;
        ">

          <h3>
            Account
          </h3>

          <p>
            <b>Business:</b>
            ${esc(user.Business_Name || "")}
          </p>

          <p>
            <b>Owner:</b>
            ${esc(user.Owner_Name || "")}
          </p>

          <p>
            <b>Mobile:</b>
            ${esc(user.Mobile || "")}
          </p>

          <p>
            <b>Email:</b>
            ${esc(user.Email || "")}
          </p>

          <p>
            <b>Status:</b>
            ${esc(user.Status || "")}
          </p>

        </div>


      </main>

    </div>
  `;

}


// ==========================================
// LOGOUT
// ==========================================

function logoutUser() {

  // Delete login session
  clearSession();


  // Remove user information from browser
  dashboardData = {
    user: null,
    products: [],
    categories: []
  };


  // IMPORTANT:
  // Remove ?userId=U001 from URL
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
  // CASE 1
  // No userId in URL
  // ----------------------------------------

  if (!urlUserId) {

    // Already logged in?
    if (session && session.User_ID) {

      window.location.replace(
        "./dashboard.html?userId=" +
        encodeURIComponent(
          session.User_ID
        )
      );

      return;
    }


    // Not logged in
    renderLogin();

    return;
  }


  // ----------------------------------------
  // CASE 2
  // URL has userId but no session
  // ----------------------------------------

  if (
    !session ||
    !session.User_ID
  ) {

    goToLogin();

    return;
  }


  // ----------------------------------------
  // CASE 3
  // URL user and session user don't match
  // ----------------------------------------

  if (
    String(session.User_ID).toLowerCase() !==
    String(urlUserId).toLowerCase()
  ) {

    goToLogin();

    return;
  }


  // ----------------------------------------
  // CASE 4
  // Correct logged-in user
  // ----------------------------------------

  loadDashboard(
    session.User_ID
  );

}


// ==========================================
// START
// ==========================================

startDashboard();
