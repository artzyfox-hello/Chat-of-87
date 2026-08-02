const SERVER_URL = 'https://chat-of-87.onrender.com/';

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const loginUser = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const authBtn = document.getElementById('auth-btn');
const authStatus = document.getElementById('auth-status');
const currentUserDisplay = document.getElementById('current-user-display');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const statusLog = document.getElementById('status-log');

// 1. Auto-login if they already logged in previously
let currentUser = localStorage.getItem('chat_87_user');
if (currentUser) {
  showChatScreen(currentUser);
}

// 2. Handle Login / Register button click
authBtn.addEventListener('click', async () => {
  const username = loginUser.value.trim();
  const password = loginPassword.value.trim();

  if (!username || !password) {
    authStatus.textContent = 'PLEASE ENTER BOTH USERNAME AND PASSWORD.';
    return;
  }

  try {
    const response = await fetch(`${SERVER_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const data = await response.json();
      authStatus.textContent = data.detail || 'LOGIN FAILED.';
      authStatus.style.color = '#ff3333';
      return;
    }

    // Login successful! Save username and switch screens
    localStorage.setItem('chat_87_user', username);
    showChatScreen(username);

  } catch (err) {
    authStatus.textContent = 'CANNOT REACH PYTHON SERVER.';
    authStatus.style.color = '#ff3333';
  }
});

function showChatScreen(name) {
  currentUser = name;
  currentUserDisplay.textContent = name;
  loginScreen.style.display = 'none';
  chatScreen.style.display = 'block';
}

// 3. Send message tagged with their username
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = messageInput.value.trim();
  if (!content) return;

  statusLog.textContent = 'TRANSMITTING...';

  try {
    const res = await fetch(`${SERVER_URL}/send_message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser,
        content: content
      })
    });

    if (res.ok) {
      statusLog.textContent = 'LOGGED.';
      statusLog.style.color = '#00ff66';
      messageInput.value = '';
    }
  } catch (err) {
    statusLog.textContent = 'TRANSMISSION ERROR.';
    statusLog.style.color = '#ff3333';
  }
});
