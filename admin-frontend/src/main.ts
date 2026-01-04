import { mount } from 'svelte';
import App from './App.svelte';

const target = document.getElementById('admin-root');
if (target) {
    target.innerHTML = '';
    mount(App, { target });
}