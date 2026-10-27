document.addEventListener('DOMContentLoaded', () => {
  const registeredUserKey = 'sportpathUser';
  const loggedInUserKey = 'sportpathCurrentUser';
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isAuthPage = currentPage === 'login.html';
  const currentUser = JSON.parse(localStorage.getItem(loggedInUserKey) || 'null');

  if (!currentUser && !isAuthPage) {
    window.location.replace(`login.html?returnTo=${encodeURIComponent(currentPage)}`);
    return;
  }

  if (currentUser && isAuthPage) {
    window.location.replace('index.html');
    return;
  }

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');

  const navWrap = document.querySelector('.nav-wrap');
  if (navWrap && currentPage !== 'index.html') {
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.type = 'button';
    backButton.setAttribute('aria-label', 'Go back to the previous page');
    backButton.innerHTML = '<span aria-hidden="true">&#8592;</span> Back';
    backButton.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    });
    navWrap.insertBefore(backButton, nav);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  const yearNode = document.getElementById('year');
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const form = document.getElementById('auth-form');
  const message = document.getElementById('form-message');
  const authTitle = document.getElementById('auth-title');
  const authSubmit = document.getElementById('auth-submit');
  const authSwitch = document.getElementById('auth-switch');
  const nameField = document.getElementById('name');
  let authMode = 'login';

  document.querySelectorAll('.nav-cta').forEach((authLink) => {
    if (currentUser) {
      authLink.href = 'profile.html';
      authLink.classList.remove('nav-cta');
      authLink.classList.add('profile-link');
      authLink.innerHTML = '<span class="profile-icon" aria-hidden="true">&#128100;</span><span>Profile</span>';
    }
  });

  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileForm = document.getElementById('profile-form');
  if (profileName && profileEmail && currentUser) {
    profileName.textContent = currentUser.name;
    profileEmail.textContent = currentUser.email;
  }

  if (profileForm && currentUser) {
    ['phone', 'age', 'sport', 'location', 'bio'].forEach((field) => {
      const input = document.getElementById(`profile-${field}`);
      if (input) input.value = currentUser[field] || '';
    });

    profileForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const updatedUser = { ...currentUser };
      ['phone', 'age', 'sport', 'location', 'bio'].forEach((field) => {
        updatedUser[field] = document.getElementById(`profile-${field}`).value.trim();
      });
      localStorage.setItem(registeredUserKey, JSON.stringify(updatedUser));
      localStorage.setItem(loggedInUserKey, JSON.stringify(updatedUser));
      window.alert('User details saved successfully!');
      window.location.replace('index.html');
    });
  }

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem(loggedInUserKey);
      window.location.replace('login.html');
    });
  }

  if (authSwitch) {
    const registering = authMode === 'register';
    authTitle.textContent = registering ? 'Create your SportPath account' : 'Welcome back to SportPath';
    authSubmit.textContent = registering ? 'Register' : 'Login';
    authSwitch.textContent = registering ? 'Already have an account? Login' : 'New to SportPath? Register';
    nameField.required = registering;
    document.querySelector('label[for="name"]')?.classList.toggle('is-hidden', !registering);
    nameField.classList.toggle('is-hidden', !registering);

    authSwitch.addEventListener('click', () => {
      authMode = authMode === 'register' ? 'login' : 'register';
      const registering = authMode === 'register';
      authTitle.textContent = registering ? 'Create your SportPath account' : 'Welcome back to SportPath';
      authSubmit.textContent = registering ? 'Register' : 'Login';
      authSwitch.textContent = registering ? 'Already have an account? Login' : 'New to SportPath? Register';
      nameField.required = registering;
      document.querySelector('label[for="name"]')?.classList.toggle('is-hidden', !registering);
      nameField.classList.toggle('is-hidden', !registering);
      message.textContent = '';
    });
  }

  if (form && message) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = nameField?.value.trim();
      const email = document.getElementById('email')?.value.trim().toLowerCase();
      const password = document.getElementById('password')?.value;
      const savedUser = JSON.parse(localStorage.getItem(registeredUserKey) || 'null');

      if (authMode === 'register') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name) {
          document.getElementById('details-modal')?.removeAttribute('hidden');
          message.textContent = 'Please enter your name.';
          return;
        }

        if (!email) {
          document.getElementById('details-modal')?.removeAttribute('hidden');
          message.textContent = 'Please enter your email address.';
          return;
        }

        if (!emailPattern.test(email)) {
          message.textContent = 'Please enter a valid email address.';
          return;
        }

        if (!password) {
          document.getElementById('details-modal')?.removeAttribute('hidden');
          message.textContent = 'Please enter your password.';
          return;
        }

        if (password.length < 6) {
          message.textContent = 'Password must be at least 6 characters long.';
          return;
        }

        const user = { name, email, password };
        localStorage.setItem(registeredUserKey, JSON.stringify(user));
        localStorage.setItem(loggedInUserKey, JSON.stringify(user));
        message.textContent = 'Registration complete. Taking you to your profile...';
        window.setTimeout(() => window.location.replace('profile.html'), 350);
        return;
      }

      if (!savedUser || savedUser.email !== email || savedUser.password !== password) {
        message.textContent = 'Email or password is incorrect.';
        return;
      }

      localStorage.setItem(loggedInUserKey, JSON.stringify(savedUser));
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      window.location.replace(returnTo && returnTo !== 'login.html' ? returnTo : 'index.html');
    });
  }

  const detailsModal = document.getElementById('details-modal');
  document.getElementById('details-modal-close')?.addEventListener('click', () => {
    detailsModal?.setAttribute('hidden', '');
    nameField?.focus();
  });
});
