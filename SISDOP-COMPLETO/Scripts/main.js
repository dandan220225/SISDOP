// Alternar telas
function showSection(id) {
  const target = document.getElementById(id);

  if (!target) return;

  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  target.classList.add("active");
}

// Função para mostrar conteúdo dentro do menu (Dashboard)
function showMenuContent(contentId) {
  document.querySelectorAll('.menu-content').forEach(content => {
    content.classList.remove('active');
  });

  if (contentId !== 'menu-home') {
    const contentToShow = document.getElementById(contentId);
    if (contentToShow) {
      contentToShow.classList.add('active');
    }
  }

  document.querySelectorAll('#sidebar a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(contentId)) {
      link.classList.add('active');
    }
  });
}

// Toggle da sidebar (abrir/fechar)
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
}

// MOSTRAR/ESCONDER SENHA
function togglePasswordVisibility(icon) {
  const wrapper = icon.parentElement;
  const input = wrapper.querySelector('input');
  const eyeOpen = icon.querySelector('.eye-open');
  const eyeClosed = icon.querySelector('.eye-closed');

  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    eyeOpen.style.display = 'none';
    eyeClosed.style.display = 'block';
  } else {
    input.type = 'password';
    eyeOpen.style.display = 'block';
    eyeClosed.style.display = 'none';
  }
}

// LOGIN COM GOOGLE
function handleCredentialResponse(response) {
  const data = JSON.parse(atob(response.credential.split('.')[1]));

  alert(`Bem-vindo, ${data.name}!`);

  showSection('menu');
}

// ANIMAÇÃO DE INTRODUÇÃO
window.addEventListener('load', () => {
  const splash = document.getElementById('splash');
  const loginBox = document.getElementById('loginBox');

  if (!splash || !loginBox) return;

  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
      loginBox.classList.add('show');
    }, 1000);
  }, 3500);
});