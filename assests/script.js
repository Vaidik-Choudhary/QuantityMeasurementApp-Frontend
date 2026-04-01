// ================== STATE ==================
let state = {
  authMode: 'login',
  activePage: 'converter',
  measureType: 'LengthUnit',
  mainAction: 'compare',
  arithOperation: 'add'
};

const units = {
  LengthUnit: ['INCHES', 'FEET', 'YARDS', 'CENTIMETERS'],
  WeightUnit: ['GRAM', 'KILOGRAM', 'POUND'],
  VolumeUnit: ['MILLILITRE', 'LITRE', 'GALLON'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT', 'KELVIN']
};

// ================== INIT ==================
window.onload = () => {
  const token = new URLSearchParams(window.location.search).get('token');

  if (token) {
    localStorage.setItem('token', token);
    showDashboard();
    window.history.replaceState({}, document.title, "/");
  } else if (localStorage.getItem('token')) {
    showDashboard();
  }

  initEvents();
  populateUnits();
};

// ================== UI SWITCH ==================
function showDashboard() {
  document.getElementById("authSection").style.display = "none";
  document.getElementById("dashboardSection").style.display = "block";
}

function showAuth() {
  document.getElementById("authSection").style.display = "flex";
  document.getElementById("dashboardSection").style.display = "none";
}

// ================== EVENTS ==================
function initEvents() {

  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const toggleSlider = document.getElementById("toggleSlider");
  const nameField = document.getElementById("nameField");
  const submitBtn = document.querySelector(".submit-btn");

  // Toggle Auth Mode
  loginBtn.onclick = () => {
    state.authMode = 'login';
    toggleSlider.className = "toggle-slider login";
    nameField.style.display = "none";
    submitBtn.innerText = "Sign In";
  };

  signupBtn.onclick = () => {
    state.authMode = 'signup';
    toggleSlider.className = "toggle-slider signup";
    nameField.style.display = "block";
    submitBtn.innerText = "Create Account";
  };

  // Auth Submit
  document.getElementById("authForm").onsubmit = handleAuth;

  // OAuth
  document.getElementById("googleLogin").onclick = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  document.getElementById("githubLogin").onclick = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/github";
  };

  // Logout
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("token");
    showAuth();
  };

  // Toggle Page
  document.getElementById("activityBtn").onclick = () => {
    togglePage();
    fetchCounts();
    fetchHistory();
  };

  // Measurement Type
  document.querySelectorAll(".types button").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".types button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      state.measureType = btn.dataset.type;
      populateUnits();
    };
  });

  // Main Actions
  document.querySelectorAll(".actions button").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".actions button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      state.mainAction = btn.dataset.action;

      document.getElementById("arithBox").style.display =
        state.mainAction === 'arithmetic' ? "flex" : "none";

      document.getElementById("val2").disabled =
        state.mainAction === 'convert';
    };
  });

  // Arithmetic Select
  document.getElementById("arithOperation").onchange = (e) => {
    state.arithOperation = e.target.value;
  };

  // Calculate
  document.getElementById("calculateBtn").onclick = calculate;

  // History Filter
  document.getElementById("historyFilter").onchange = (e) => {
    fetchHistory(e.target.value);
  };
}

// ================== AUTH ==================
async function handleAuth(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    if (state.authMode === 'signup') {
      await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password')
        })
      });

      alert("Registered!");
      document.getElementById("loginBtn").click();

    } else {
      const res = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      });

      const data = await res.json();
      localStorage.setItem('token', data.accessToken);

      showDashboard();
    }
  } catch {
    alert("Auth Failed");
  }
}

// ================== UNITS ==================
function populateUnits() {
  const u1 = document.getElementById("unit1");
  const u2 = document.getElementById("unit2");

  u1.innerHTML = "";
  u2.innerHTML = "";

  units[state.measureType].forEach(u => {
    u1.innerHTML += `<option>${u}</option>`;
    u2.innerHTML += `<option>${u}</option>`;
  });
}

// ================== CALCULATE ==================
async function calculate() {
  const token = localStorage.getItem('token');

  const endpoint =
    state.mainAction === 'arithmetic'
      ? state.arithOperation
      : state.mainAction;

  try {
    const res = await fetch(
      `http://localhost:8080/api/v1/quantities/${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          thisQuantityDTO: {
            value: +document.getElementById("val1").value,
            unit: document.getElementById("unit1").value,
            measurementType: state.measureType
          },
          thatQuantityDTO: {
            value: +document.getElementById("val2").value,
            unit: document.getElementById("unit2").value,
            measurementType: state.measureType
          }
        })
      }
    );

    const data = await res.json();

    document.getElementById("result").innerText =
      data.resultString || data.resultValue || "0";

  } catch {
    document.getElementById("result").innerText = "Error";
  }
}

// ================== PROFILE ==================
function togglePage() {
  const converter = document.getElementById("converterPage");
  const profile = document.getElementById("profilePage");
  const title = document.getElementById("pageTitle");

  if (converter.style.display === "none") {
    converter.style.display = "block";
    profile.style.display = "none";
    title.innerText = "Unit Converter";
  } else {
    converter.style.display = "none";
    profile.style.display = "block";
    title.innerText = "Activity & Stats";
  }
}

// ================== FETCH COUNTS ==================
async function fetchCounts() {
  const token = localStorage.getItem('token');
  const ops = ['COMPARE', 'CONVERT', 'ADD', 'SUBTRACT', 'DIVIDE'];

  const container = document.getElementById("statsContainer");
  container.innerHTML = "";

  for (let op of ops) {
    let value = 0;

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/quantities/count/${op}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      value = await res.json();
    } catch {}

    container.innerHTML += `
      <div class="stat-card">
        <div class="stat-number">${value}</div>
        <div class="stat-label">${op}</div>
      </div>
    `;
  }
}

// ================== FETCH HISTORY ==================
async function fetchHistory(type = 'compare') {
  const token = localStorage.getItem('token');
  const container = document.getElementById("historyContainer");

  container.innerHTML = "";

  try {
    const res = await fetch(
      `http://localhost:8080/api/v1/quantities/history/operation/${type}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = `<div class="empty-state">No history yet</div>`;
      return;
    }

    data.slice(0, 5).forEach((h, i) => {
      container.innerHTML += `
        <div class="history-item">
          <span class="history-number">${i + 1}</span>
          <span class="history-value">
            ${h.resultString || h.resultValue}
          </span>
        </div>
      `;
    });

  } catch {
    container.innerHTML = `<div class="empty-state">Error loading history</div>`;
  }
}