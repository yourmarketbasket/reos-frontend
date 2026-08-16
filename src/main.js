import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles.css';
import PaginationBar from './components/PaginationBar.vue';

const app = createApp(App);
const pinia = createPinia();

// Centralized Pinia Persistence Plugin
pinia.use(({ store }) => {
  if (store.$id === 'app') {
    // Hydrate state from localStorage on init
    const savedToken = localStorage.getItem('reos_token');
    const savedUser = localStorage.getItem('reos_user');
    if (savedToken) store.token = savedToken;
    if (savedUser) {
      try {
        store.user = JSON.parse(savedUser);
      } catch (err) {
        console.error('Failed to parse persisted user:', err);
      }
    }

    // Subscribe to state changes and persist automatically
    store.$subscribe((mutation, state) => {
      if (state.token) {
        localStorage.setItem('reos_token', state.token);
      } else {
        localStorage.removeItem('reos_token');
      }

      if (state.user) {
        localStorage.setItem('reos_user', JSON.stringify(state.user));
      } else {
        localStorage.removeItem('reos_user');
      }
    });
  }
});

app.use(pinia);
app.use(router);
app.component('PaginationBar', PaginationBar);

app.mount('#app');
