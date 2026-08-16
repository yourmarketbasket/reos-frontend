<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex w-12 h-12 bg-blue-600 rounded-lg items-center justify-center text-white font-bold text-2xl font-heading mb-4">
          R
        </div>
        <h1 class="text-2xl font-bold tracking-tight font-heading">Accept Invitation</h1>
        <p class="text-xs text-slate-500 mt-1">Join the REOS Rental Ecosystem</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <p class="text-slate-500 text-sm">Verifying invitation details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-6 space-y-4">
        <div class="text-red-500 font-semibold text-sm">
          {{ error }}
        </div>
        <router-link to="/login" class="inline-block text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline">
          Go to Sign In
        </router-link>
      </div>

      <!-- Invitation Form Details -->
      <div v-else-if="invite" class="space-y-6">
        <!-- Banner announcement -->
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-5 text-slate-800 text-sm space-y-3">
          <div class="font-semibold text-blue-800">You are invited!</div>
          <p>
            Landlord <strong class="text-slate-900">{{ invite.landlord_name }}</strong> has invited you to join the property
            <strong class="text-slate-900">{{ invite.property_name }}</strong>
            <span v-if="invite.unit_label">, Unit <strong class="text-slate-900">{{ invite.unit_label }}</strong></span>
            as a <strong class="text-blue-700 capitalize">{{ invite.role }}</strong>.
          </p>
          <p class="text-xs text-slate-500">
            Please register or sign in below with your invited email (<strong>{{ invite.email }}</strong>) to accept this invitation.
          </p>
        </div>

        <!-- Auth Method Selector Tabs -->
        <div class="flex gap-2 p-1 bg-slate-100 rounded-lg">
          <button 
            @click="authMethod = 'password'" 
            :class="['flex-1 py-1.5 text-xs font-semibold rounded transition-colors', authMethod === 'password' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800']"
          >
            Password & Phone
          </button>
          <button 
            @click="authMethod = 'google'" 
            :class="['flex-1 py-1.5 text-xs font-semibold rounded transition-colors', authMethod === 'google' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800']"
          >
            Google Auth
          </button>
        </div>

        <!-- Form: Set Phone & Password -->
        <form v-if="authMethod === 'password'" @submit.prevent="handleAccept" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Invited Email</label>
            <input 
              :value="invite.email" 
              type="email" 
              disabled 
              class="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
            <input 
              v-model="form.phone" 
              type="text" 
              placeholder="+254 700 000 000" 
              required 
              class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Set Account Password</label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="••••••••" 
              required 
              class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button 
            type="submit" 
            :disabled="submitting" 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors mt-6 flex items-center justify-center"
          >
            <span v-if="submitting">Accepting Invitation...</span>
            <span v-else>Register & Accept</span>
          </button>
        </form>

        <!-- Google Accept -->
        <div v-else class="space-y-4 text-center">
          <p class="text-xs text-slate-500">
            Accept instantly using your Google Account details. We will match your Google email to this invitation.
          </p>

          <button 
            @click="handleGoogleAccept" 
            :disabled="submitting"
            class="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-3"
          >
            <!-- Google G logo -->
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
