// ==========================================
// 0. 설정 (본인의 GitHub 아이디 입력)
// ==========================================
const GITHUB_USERNAME = 'chaewoo25'; // 예: 'octocat' 또는 본인 아이디

// ==========================================
// 1. DOM 요소 선택
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const menuToggleBtn = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const topBtn = document.getElementById('top-btn');
const contactForm = document.getElementById('contact-form');

// Projects 관련 요소
const projectsContainer = document.getElementById('projects-container');
const loadingSpinner = document.getElementById('loading-spinner');
const projectsMessage = document.getElementById('projects-message');

// ==========================================
// 2. 다크 모드 (LocalStorage 연동)
// ==========================================
// 저장된 테마 불러오기
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

// 다크모드 토글 버튼 이벤트
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  const icon = themeToggleBtn.querySelector('i');
  if (theme === 'dark') {
    icon.className = 'fa-solid fa-sun'; // 다크모드일 땐 해 아이콘
  } else {
    icon.className = 'fa-solid fa-moon'; // 라이트모드일 땐 달 아이콘
  }
}

// ==========================================
// 3. 모바일 햄버거 메뉴 토글
// ==========================================
menuToggleBtn.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// 메뉴 링크 클릭 시 모바일 메뉴 닫기
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
  });
});

// ==========================================
// 4. 스크롤 이벤트 (Top 버튼 & 헤더 스타일)
// ==========================================
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    topBtn.classList.remove('hidden');
  } else {
    topBtn.classList.add('hidden');
  }
});

// Top 버튼 클릭 시 상단 이동
topBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// ==========================================
// 5. Contact 폼 유효성 검사
// ==========================================
contactForm.addEventListener('submit', (e) => {
  e.preventDefault(); // 기본 제출 동작 방지
  
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');
  const formResult = document.getElementById('form-result');

  // 에러 초기화
  nameError.textContent = '';
  emailError.textContent = '';
  messageError.textContent = '';
  formResult.textContent = '';

  let isValid = true;

  if (!nameInput.value.trim()) {
    nameError.textContent = '이름을 입력해 주세요.';
    isValid = false;
  }

  if (!emailInput.value.trim()) {
    emailError.textContent = '이메일을 입력해 주세요.';
    isValid = false;
  } else if (!isValidEmail(emailInput.value)) {
    emailError.textContent = '올바른 이메일 형식이 아닙니다.';
    isValid = false;
  }

  if (!messageInput.value.trim()) {
    messageError.textContent = '메시지를 입력해 주세요.';
    isValid = false;
  }

  if (isValid) {
    formResult.style.color = '#198754';
    formResult.textContent = '메시지가 성공적으로 전송되었습니다!';
    contactForm.reset();
  }
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==========================================
// 6. GitHub API 연동 (Projects 가져오기)
// ==========================================
async function fetchGitHubProjects() {
  // 아이디가 수정되지 않은 경우 예외 처리
  if (GITHUB_USERNAME === 'YOUR_GITHUB_USERNAME') {
    loadingSpinner.classList.add('hidden');
    projectsMessage.classList.remove('hidden');
    projectsMessage.textContent = 'main.js 파일 상단의 GITHUB_USERNAME을 본인 계정으로 수정해 주세요.';
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
    
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status}`);
    }

    const repos = await response.json();
    loadingSpinner.classList.add('hidden');

    if (repos.length === 0) {
      projectsMessage.classList.remove('hidden');
      projectsMessage.textContent = '표시할 프로젝트가 없습니다.';
      return;
    }

    renderProjects(repos);
  } catch (error) {
    console.error('Error fetching projects:', error);
    loadingSpinner.classList.add('hidden');
    projectsMessage.classList.remove('hidden');
    projectsMessage.textContent = '프로젝트를 불러올 수 없습니다. 나중에 다시 시도해 주세요.';
  }
}

function renderProjects(repos) {
  projectsContainer.innerHTML = ''; // 초기화

  repos.forEach(repo => {
    const card = document.createElement('div');
    card.className = 'project-card';

    card.innerHTML = `
      <h3>${repo.name}</h3>
      <p>${repo.description ? repo.description : '설명이 없습니다.'}</p>
      <div class="project-meta">
        <span>⭐ ${repo.stargazers_count}</span>
        <span>${repo.language ? repo.language : 'Etc'}</span>
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;">코드 보기</a>
      </div>
    `;

    projectsContainer.appendChild(card);
  });
}

// 페이지 로드 시 API 호출
document.addEventListener('DOMContentLoaded', fetchGitHubProjects);