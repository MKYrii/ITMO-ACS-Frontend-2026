const users = JSON.parse(localStorage.getItem('spbRentUsers') || '[]');

document.querySelector('#registerForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    users.push(data);
    localStorage.setItem('spbRentUsers', JSON.stringify(users));
    localStorage.setItem('spbRentUser', JSON.stringify(data));
    window.location.href = 'account.html';
});

document.querySelector('#loginForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const user = users.find((item) => item.email === data.email && item.password === data.password);
    if (!user) {
        alert('Проверьте email и пароль');
        return;
    }
    localStorage.setItem('spbRentUser', JSON.stringify(user));
    window.location.href = 'account.html';
});

document.querySelector('#filterForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const type = document.querySelector('#typeFilter').value;
    const max = Number(document.querySelectorAll('#priceFilter')[1]?.value) || Infinity;
    document.querySelectorAll('.property-column').forEach((column) => {
        const card = column.querySelector('[data-type]');
        const visible = (!type || type === 'Любой тип' || card.dataset.type === type) && Number(card.dataset.price) <= max;
        column.classList.toggle('d-none', !visible);
    });
});

document.querySelector('#requestForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    localStorage.setItem('spbRentRequest', 'sent');
    bootstrap.Modal.getInstance(document.querySelector('#requestModal')).hide();
    document.querySelector('#requestResult').textContent = 'Заявка отправлена. Мы свяжемся с вами.';
});

