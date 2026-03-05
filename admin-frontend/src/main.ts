import { mount } from 'svelte';
import App from './App.svelte';

const target = document.getElementById('admin-root');
if (target) {
    target.innerHTML = '';
    mount(App, { target });
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' }).then((registration) => {
            registration.update();
        });
    });
}
