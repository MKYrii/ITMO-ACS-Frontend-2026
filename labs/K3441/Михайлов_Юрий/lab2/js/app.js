const API_URL = 'http://localhost:3000';

function updateAuthNavigation() {
    const signedIn = Boolean(localStorage.getItem('spbRentToken'));
    document.querySelectorAll('[data-auth-link]').forEach((item) => item.classList.toggle('d-none', !signedIn));
    document.querySelectorAll('a[href="login.html"], a[href="register.html"]').forEach((item) => item.classList.toggle('d-none', signedIn));
    document.querySelectorAll('[data-logout]').forEach((item) => item.classList.toggle('d-none', !signedIn));
}

document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('spbRentToken');
    localStorage.removeItem('spbRentUser');
    window.location.href = 'index.html';
}));
updateAuthNavigation();

async function api(path, options = {}) {
    const token = localStorage.getItem('spbRentToken');
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...options.headers
        }
    });
    if (!response.ok) throw new Error('Ошибка запроса к серверу');
    return response.status === 204 ? null : response.json();
}

document.querySelector('#registerForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    try {
        const session = await api('/register', {method: 'POST', body: JSON.stringify(data)});
        localStorage.setItem('spbRentUser', JSON.stringify(session.user));
        localStorage.setItem('spbRentToken', session.accessToken);
        window.location.href = 'account.html';
    } catch (error) { alert(`${error.message}. Запустите JSON Server.`); }
});

document.querySelector('#loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    try {
        const session = await api('/login', {method: 'POST', body: JSON.stringify(data)});
        localStorage.setItem('spbRentUser', JSON.stringify(session.user));
        localStorage.setItem('spbRentToken', session.accessToken);
        window.location.href = 'account.html';
    } catch { alert('Проверьте email и пароль'); }
});

document.querySelector('#filterForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const type = document.querySelector('#typeFilter').value;
    const location = document.querySelector('#locationFilter')?.value || '';
    const max = Number(document.querySelectorAll('#priceFilter')[1]?.value) || Infinity;
    document.querySelectorAll('.property-column').forEach((column) => {
        const card = column.querySelector('[data-type]');
        const locationMatches = !location || location === 'Любой район' || card.dataset.location === location;
        column.classList.toggle('d-none', !((!type || type === 'Любой тип' || card.dataset.type === type) && locationMatches && Number(card.dataset.price) <= max));
    });
});

document.querySelector('#requestForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = [...event.target.querySelectorAll('input')];
    try {
        await api('/requests', {method: 'POST', body: JSON.stringify({name: fields[0].value, phone: fields[1].value, property: 'Светлая квартира у парка', userId: JSON.parse(localStorage.getItem('spbRentUser') || '{}').id})});
        bootstrap.Modal.getInstance(document.querySelector('#requestModal')).hide();
        document.querySelector('#requestResult').textContent = 'Заявка отправлена. Мы свяжемся с вами.';
    } catch { alert('Не удалось отправить заявку. Проверьте, что вы вошли и сервер запущен.'); }
});

document.querySelector('#messageForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.querySelector('#messageText');
    const text = input.value.trim();
    if (!text) return;
    try {
        await api('/messages', {method: 'POST', body: JSON.stringify({recipient: 'Алексей Смирнов', text, date: new Date().toLocaleDateString('ru-RU'), userId: JSON.parse(localStorage.getItem('spbRentUser') || '{}').id})});
        input.value = '';
        renderMessages();
    } catch { alert('Войдите в аккаунт и запустите JSON Server'); }
});

async function renderMessages() {
    const list = document.querySelector('#messageList');
    if (!list) return;
    try {
        const userId = JSON.parse(localStorage.getItem('spbRentUser') || '{}').id;
        const messages = await api(`/messages?userId=${userId}`);
        list.innerHTML = '';
        messages.forEach((message) => {
            const item = document.createElement('div');
            item.className = 'list-group-item p-4';
            const title = document.createElement('h2'); title.className = 'h6 mb-1'; title.textContent = message.recipient;
            const body = document.createElement('p'); body.className = 'mb-1'; body.textContent = message.text;
            const date = document.createElement('small'); date.className = 'text-muted'; date.textContent = message.date;
            item.append(title, body, date); list.appendChild(item);
        });
    } catch { /* API будет доступно после запуска сервера */ }
}

renderMessages();

document.querySelector('#resetFilter')?.addEventListener('click', () => {
    document.querySelector('#filterForm').reset();
    document.querySelectorAll('.property-column').forEach((column) => column.classList.remove('d-none'));
});

document.querySelector('#sortFilter')?.addEventListener('change', (event) => {
    const list = document.querySelector('#filterForm').nextElementSibling;
    const cards = [...list.querySelectorAll('.property-column')];
    cards.sort((a, b) => {
        const first = Number(a.querySelector('[data-price]').dataset.price);
        const second = Number(b.querySelector('[data-price]').dataset.price);
        return event.target.value === 'cheap' ? first - second : event.target.value === 'expensive' ? second - first : 0;
    });
    cards.forEach((card) => list.appendChild(card));
});

for (const button of document.querySelectorAll('[data-toggle-password]')) {
    button.addEventListener('click', () => {
        const input = document.querySelector(button.dataset.togglePassword);
        input.type = input.type === 'password' ? 'text' : 'password';
        button.textContent = input.type === 'password' ? 'Показать' : 'Скрыть';
    });
}
