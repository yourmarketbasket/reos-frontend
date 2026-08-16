<template>
  <div class="min-h-screen bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0e6] flex flex-col justify-center items-center px-4 py-12 font-sans relative overflow-hidden">
    <!-- Elegant background design accents -->
    <div class="absolute w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-[120px] -top-40 -left-40 pointer-events-none"></div>
    <div class="absolute w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[150px] -bottom-40 -right-40 pointer-events-none"></div>

    <div class="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(201,151,63,0.1)] relative z-10 space-y-6">
      <div class="text-center space-y-2 flex flex-col items-center">
        <img src="/logo.png" class="w-14 h-14 object-contain mb-2" alt="REOS Logo" />
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700 border border-brand-200 uppercase tracking-widest">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
          Admin Console
        </div>
        <h1 class="text-2xl font-bold font-heading text-dark tracking-tight">REOS Admin Portal</h1>
        <p class="text-[11px] text-slate-500">Authorized login for platform administrators</p>
      </div>

      <!-- Feedback notifications -->
      <div v-if="successMsg" class="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl text-center">
        {{ successMsg }}
      </div>
      <div v-if="errorMsg" class="p-3.5 bg-red-50 border border-red-100 text-red-800 text-xs font-semibold rounded-xl text-center">
        {{ errorMsg }}
      </div>

      <!-- Admin Sign In Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
          <input 
            v-model="loginForm.email" 
            type="email" 
            placeholder="admin@reos.io" 
            required
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
          <input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="••••••••" 
            required
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>

        <button 
          type="submit" 
          :disabled="loading" 
          class="w-full bg-brand-500 hover:bg-brand-600 text-dark font-bold py-2.5 rounded-xl text-xs shadow-lg hover:shadow-brand-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4 text-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          <span>{{ loading ? 'Authenticating...' : 'Sign In' }}</span>
        </button>
      </form>

      <div class="text-center pt-2">
        <router-link to="/login" class="text-xs text-slate-500 hover:text-brand-500 transition-colors">
          Return to Portal Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/store';

const ALLOWED_ROLES = ['technical_admin', 'support_admin', 'billing_admin'];

export default {
  name: 'AdminAuth',
  setup() {
    const store = useAppStore();
    const router = useRouter();

    const loading = ref(false);

    const loginForm = reactive({
      email: '',
      password: ''
    });

    const successMsg = computed(() => store.success);
    const errorMsg = computed(() => store.error);

    const handleLogin = async () => {
      loading.value = true;
      store.error = null;
      store.success = null;

      try {
        const user = await store.login(loginForm.email, '', loginForm.password);
        if (!ALLOWED_ROLES.includes(user.role)) {
          store.logout();
          if (user.role === 'superadmin') {
            store.error = 'Superadmins must log in via the Superadmin Console at /superadmin/auth.';
          } else {
            store.error = 'Authorized administrative personnel only.';
          }
          return;
        }
        store.success = 'Authentication successful! Accessing console...';
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err) {
        // Error captured in store
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      loginForm,
      successMsg,
      errorMsg,
      handleLogin
    };
  }
};
</script>
