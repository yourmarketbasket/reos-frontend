<template>
  <div class="min-h-screen bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0e6] flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white/80 backdrop-blur-md border border-brand-500/20 rounded-3xl p-8 shadow-xl space-y-6">
      <!-- Header -->
      <div class="text-center">
        <div class="inline-flex items-center gap-2 mb-4 justify-center">
          <img src="/logo.png" class="w-10 h-10 object-contain" alt="REOS Logo" />
          <span class="font-bold text-2xl text-slate-900 tracking-tight font-heading">REOS</span>
        </div>
        <h1 class="text-xl font-bold tracking-tight font-heading text-slate-800">Accept Invitation</h1>
        <p class="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Join the Rental OS Platform</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-slate-500 text-xs">Verifying invitation details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-6 space-y-4">
        <div class="text-red-600 font-semibold text-xs bg-red-50 border border-red-200 rounded-xl p-3">
          {{ error }}
        </div>
        <router-link to="/login" class="inline-block text-xs font-bold text-brand-700 uppercase tracking-wider hover:underline">
          Go to Sign In →
        </router-link>
      </div>

      <!-- Invitation Form Details -->
      <div v-else-if="invite" class="space-y-6">
        <!-- Banner announcement -->
        <div class="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-5 text-slate-800 text-xs space-y-3">
          <div class="font-bold text-brand-800 uppercase tracking-wider text-[10px]">You are invited!</div>
          <p class="leading-relaxed">
            Landlord/Agent <strong class="text-slate-900">{{ invite.landlord_name || 'REOS Partner' }}</strong> has invited you to join
            <strong v-if="invite.property_name" class="text-slate-900"> {{ invite.property_name }}</strong>
            <span v-else> the platform</span>
            <span v-if="invite.unit_label">, Unit <strong class="text-slate-900">{{ invite.unit_label }}</strong></span>
            as a <span class="badge bg-brand-500/20 text-brand-700 border border-brand-500/30 uppercase text-[9px] font-bold py-0.5 px-2 rounded-full inline-block">{{ invite.role }}</span>.
          </p>
          <p class="text-[11px] text-slate-500 leading-tight">
            Please register or sign in below with your invited email (<strong>{{ invite.email }}</strong>) to accept this invitation.
          </p>
        </div>

        <!-- Auth Method Selector Tabs -->
        <div class="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button 
            @click="authMethod = 'password'" 
            :class="['flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors', authMethod === 'password' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800']"
          >
            Password &amp; Phone
          </button>
          <button 
            @click="authMethod = 'google'" 
            :class="['flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors', authMethod === 'google' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800']"
          >
            Google OAuth
          </button>
        </div>

        <!-- Form: Set Phone & Password -->
        <form v-if="authMethod === 'password'" @submit.prevent="handleAccept" class="space-y-4">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Invited Email</label>
            <input 
              :value="invite.email" 
              type="email" 
              disabled 
              class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
            <input 
              v-model="form.phone" 
              type="text" 
              placeholder="+254 700 000 000" 
              required 
              class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Set Account Password</label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="••••••••" 
              required 
              class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <button 
            type="submit" 
            :disabled="submitting" 
            class="w-full bg-brand-500 hover:bg-brand-600 text-dark font-bold py-2.5 px-4 rounded-xl text-xs transition-colors mt-6 flex items-center justify-center shadow-sm"
          >
            <span v-if="submitting">Accepting Invitation...</span>
            <span v-else>Register &amp; Accept</span>
          </button>
        </form>

        <!-- Google Accept -->
        <div v-else class="space-y-4 text-center">
          <p class="text-xs text-slate-500 leading-relaxed">
            Accept instantly using your Google Account details. We will match your Google email to this invitation.
          </p>

          <button 
            @click="handleGoogleAccept" 
            :disabled="submitting"
            class="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-3"
          >
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Accept with Google
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/stores/store';

export default {
  setup() {
    const store = useAppStore();
    const route = useRoute();
    const router = useRouter();

    const invite = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const submitting = ref(false);
    const authMethod = ref('password');

    const form = reactive({
      phone: '',
      password: ''
    });

    const token = route.query.token;

    const fetchDetails = async () => {
      if (!token) {
        error.value = 'Invitation token is missing from the link URL.';
        loading.value = false;
        return;
      }
      try {
        const details = await store.fetchInvitationDetails(token);
        invite.value = details;
      } catch (err) {
        error.value = err.message || 'Invitation is invalid or has expired.';
      } finally {
        loading.value = false;
      }
    };

    const handleAccept = async () => {
      submitting.value = true;
      try {
        await store.acceptInvitation(token, invite.value.email, form.password, form.phone, '');
        router.push('/dashboard');
      } catch (err) {
        error.value = err.message || 'Failed to accept invitation.';
      } finally {
        submitting.value = false;
      }
    };

    const handleGoogleAccept = async () => {
      submitting.value = true;
      try {
        const randomID = Math.floor(1000 + Math.random() * 9000);
        await store.acceptInvitation(token, invite.value.email, '', '', `google_oauth_${randomID}`);
        router.push('/dashboard');
      } catch (err) {
        error.value = err.message || 'Google Auth acceptance failed.';
      } finally {
        submitting.value = false;
      }
    };

    onMounted(fetchDetails);

    return {
      invite,
      loading,
      error,
      submitting,
      authMethod,
      form,
      handleAccept,
      handleGoogleAccept
    };
  }
};
</script>
