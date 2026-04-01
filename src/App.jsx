import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [activePage, setActivePage] = useState('converter');

  const [measureType, setMeasureType] = useState('LengthUnit');
  const [mainAction, setMainAction] = useState('compare');
  const [arithOperation, setArithOperation] = useState('add');

  const [val1, setVal1] = useState(1);
  const [unit1, setUnit1] = useState('INCHES');
  const [val2, setVal2] = useState(1);
  const [unit2, setUnit2] = useState('FEET');

  const [result, setResult] = useState('0');

  const [history, setHistory] = useState([]);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');

    if (token) {
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      window.history.replaceState({}, document.title, "/");
    } else if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      if (authMode === 'signup') {
        await axios.post('http://localhost:8080/api/v1/auth/register', {
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password')
        });
        alert("Registered!");
        setAuthMode('login');
      } else {
        const res = await axios.post('http://localhost:8080/api/v1/auth/login', {
          email: formData.get('email'),
          password: formData.get('password')
        });
        localStorage.setItem('token', res.data.accessToken);
        setIsLoggedIn(true);
      }
    } catch {
      alert("Auth Failed");
    }
  };

  const calculate = async () => {
    const token = localStorage.getItem('token');
    const endpoint = mainAction === 'arithmetic' ? arithOperation : mainAction;

    try {
      const res = await axios.post(
        `http://localhost:8080/api/v1/quantities/${endpoint}`,
        {
          thisQuantityDTO: { value: +val1, unit: unit1, measurementType: measureType },
          thatQuantityDTO: { value: +val2, unit: unit2, measurementType: measureType }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(res.data.resultString || res.data.resultValue || "0");
    } catch {
      setResult("Error");
    }
  };

  const fetchCounts = async () => {
    const token = localStorage.getItem('token');
    const ops = ['COMPARE', 'CONVERT', 'ADD', 'SUBTRACT', 'DIVIDE'];

    let data = {};
    for (let op of ops) {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/v1/quantities/count/${op}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data[op] = res.data;
      } catch {
        data[op] = 0;
      }
    }
    setCounts(data);
  };

  const fetchHistory = async (type = 'compare') => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(
        `http://localhost:8080/api/v1/quantities/history/operation/${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(res.data);
    } catch {
      setHistory([]);
    }
  };

  const units = {
    LengthUnit: ['INCHES', 'FEET', 'YARDS', 'CENTIMETERS'],
    WeightUnit: ['GRAM', 'KILOGRAM', 'POUND'],
    VolumeUnit: ['MILLILITRE', 'LITRE', 'GALLON'],
    TemperatureUnit: ['CELSIUS', 'FAHRENHEIT', 'KELVIN']
  };

  return (
    <div className="app">

      {!isLoggedIn ? (
        <div className="auth-wrapper">
          <div className="auth-box">

            <div className="auth-left">
              <img src="/logo3.png" className="auth-logo" alt="QuantityMaster Logo" />
              <h1>Quantity<span>Measurement</span></h1>
              <p>Professional Measurement Tool</p>
            </div>

            <div className="auth-right">

              <div className="toggle-switch">
                <div className={`toggle-slider ${authMode}`}></div>
                <button onClick={() => setAuthMode('login')}>Login</button>
                <button onClick={() => setAuthMode('signup')}>Sign Up</button>
              </div>

              <form onSubmit={handleAuth} className="auth-form">
                {authMode === 'signup' && (
                  <input 
                    name="name" 
                    placeholder="Full Name" 
                    required 
                    autoComplete="name"
                  />
                )}
                <input 
                  name="email" 
                  placeholder="Email Address" 
                  type="email"
                  required 
                  autoComplete="email"
                />
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Password" 
                  required 
                  autoComplete="current-password"
                />
                <button type="submit" className="submit-btn">
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="divider">
                <span>or continue with</span>
              </div>

              <div className="socials">
                <button 
                  className="social-btn google"
                  onClick={() => window.location.href='http://localhost:8080/oauth2/authorization/google'}
                  title="Sign in with Google"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button 
                  className="social-btn github"
                  onClick={() => window.location.href='http://localhost:8080/oauth2/authorization/github'}
                  title="Sign in with GitHub"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard">

          <header>
            <div className="header-left">
              <h2>{activePage === 'profile' ? 'Activity & Stats' : 'Unit Converter'}</h2>
            </div>

            <div className="header-actions">
              <button
                className={`nav-btn ${activePage === 'profile' ? 'active' : ''}`}
                onClick={() => {
                  if (activePage === 'profile') {
                    setActivePage('converter');
                  } else {
                    setActivePage('profile');
                    fetchCounts();
                    fetchHistory();
                  }
                }}
                title={activePage === 'profile' ? 'Back to Converter' : 'View Activity'}
              >
                <span className="icon">📊</span>
                <span className="label">Activity</span>
              </button>

              <button 
                className="logout-btn"
                onClick={() => {
                  localStorage.removeItem('token');
                  setIsLoggedIn(false);
                }}
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          </header>

          {activePage === 'converter' ? (
            <>
              <div className="controls">

                <div className="section-title">Measurement Type</div>
                <div className="types">
                  <button 
                    className={measureType === 'LengthUnit' ? 'active' : ''} 
                    onClick={() => setMeasureType('LengthUnit')}
                  >
                    <span>📏</span>
                    <span>Length</span>
                  </button>
                  <button 
                    className={measureType === 'WeightUnit' ? 'active' : ''} 
                    onClick={() => setMeasureType('WeightUnit')}
                  >
                    <span>⚖️</span>
                    <span>Weight</span>
                  </button>
                  <button 
                    className={measureType === 'TemperatureUnit' ? 'active' : ''} 
                    onClick={() => setMeasureType('TemperatureUnit')}
                  >
                    <span>🌡️</span>
                    <span>Temperature</span>
                  </button>
                  <button 
                    className={measureType === 'VolumeUnit' ? 'active' : ''} 
                    onClick={() => setMeasureType('VolumeUnit')}
                  >
                    <span>🧪</span>
                    <span>Volume</span>
                  </button>
                </div>

                <div className="section-title">Operation</div>
                <div className="actions">
                  {['compare','convert','arithmetic'].map(a => (
                    <button 
                      key={a} 
                      className={mainAction===a?'active':''} 
                      onClick={()=>setMainAction(a)}
                    >
                      {a.charAt(0).toUpperCase() + a.slice(1)}
                    </button>
                  ))}
                </div>

                {mainAction === 'arithmetic' && (
                  <div className="arithmetic-select">
                    <label>Select Operation:</label>
                    <select value={arithOperation} onChange={(e)=>setArithOperation(e.target.value)}>
                      <option value="add">Add (+)</option>
                      <option value="subtract">Subtract (−)</option>
                      <option value="divide">Divide (÷)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="converter">
                <div className="input-group">
                  <label>First Value</label>
                  <div className="card">
                    <input 
                      value={val1} 
                      onChange={(e)=>setVal1(e.target.value)}
                      type="number"
                      placeholder="0"
                    />
                    <select value={unit1} onChange={(e)=>setUnit1(e.target.value)}>
                      {units[measureType].map(u=> <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <button className="equals" onClick={calculate} title="Calculate">
                  <span>=</span>
                </button>

                <div className="input-group">
                  <label>Second Value</label>
                  <div className="card">
                    <input 
                      value={val2} 
                      disabled={mainAction==='convert'} 
                      onChange={(e)=>setVal2(e.target.value)}
                      type="number"
                      placeholder="0"
                    />
                    <select value={unit2} onChange={(e)=>setUnit2(e.target.value)}>
                      {units[measureType].map(u=> <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="result">
                <span className="result-label">Result</span>
                <h1 className="result-value">{result}</h1>
              </div>
            </>
          ) : (
            <div className="profile">

              <div className="stats-section">
                <h3>Operation Statistics</h3>
                <div className="stats">
                  {Object.entries(counts).map(([k,v])=>(
                    <div key={k} className="stat-card">
                      <div className="stat-number">{v}</div>
                      <div className="stat-label">{k}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="history-section">
                <h3>Recent Activity</h3>
                <div className="history-controls">
                  <label>Filter by Operation:</label>
                  <select onChange={(e)=>fetchHistory(e.target.value)}>
                    <option value="compare">Compare</option>
                    <option value="convert">Convert</option>
                    <option value="add">Add</option>
                    <option value="subtract">Subtract</option>
                    <option value="divide">Divide</option>
                  </select>
                </div>

                <div className="history-list">
                  {history.length > 0 ? (
                    history.slice(0,5).map((h,i)=>(
                      <div key={i} className="history-item">
                        <span className="history-number">{i + 1}</span>
                        <span className="history-value">{h.resultString || h.resultValue}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No history yet</div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default App;
