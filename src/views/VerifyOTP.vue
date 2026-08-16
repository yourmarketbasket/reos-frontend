<template>
  <div class="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white border border-slate-100/90 rounded-2xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(37,99,235,0.08)]">
      <!-- Title header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold tracking-tight font-heading">Verify Your Email</h1>
        <p class="text-xs text-slate-500 mt-1">We sent a 6-digit OTP verification code to your email</p>
      </div>

      <!-- Verification Form -->
      <form @submit.prevent="handleVerify" class="space-y-6">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">Enter 6-Digit Code</label>
          <div class="flex justify-center gap-2">
            <input
              v-for="(digit, idx) in 6"
              :key="idx"
              ref="otpInputs"
              v-model="otpDigits[idx]"
              type="text"
              maxlength="1"
              class="w-12 h-12 text-center text-lg font-bold border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
              @input="onInput(idx, $event)"
              @keydown.delete="onDelete(idx)"
              required
            />
          </div>
        </div>

        <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs text-center">
          {{ errorMsg }}
        </div>

        <div v-if="successMsg" class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs text-center">
          {{ successMsg }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 flex items-center justify-center gap-2 font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          <span v-if="loading">Verifying...</span>
          <span v-else>Verify & Log In</span>
        </button>

        <button
          type="button"
          @click="goBack"
          class="w-full text-center text-xs text-blue-600 hover:underline focus:outline-none"
        >
          ← Back to Sign In
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/stores/store';

export default {
  setup() {
    const store = useAppStore();
    const route = useRoute();
    const router = useRouter();

    const email = ref('');
    const otpDigits = reactive(['', '', '', '', '', '']);
    const otpInputs = ref([]);
    const loading = ref(false);

    const errorMsg = computed(() => store.error);
    const successMsg = computed(() => store.success);

    onMounted(() => {
      email.value = route.query.email || '';
      if (!email.value) {
        router.push('/login');
      }
      nextTick(() => {
        if (otpInputs.value[0]) {
          otpInputs.value[0].focus();
        }
      });
    });

    const onInput = (idx, event) => {
      const val = event.target.value;
      if (val && idx < 5) {
        nextTick(() => {
          otpInputs.value[idx + 1].focus();
        });
      }
    };

    const onDelete = (idx) => {
      if (!otpDigits[idx] && idx > 0) {
        nextTick(() => {
          otpInputs.value[idx - 1].focus();
        });
      }
    };

    const handleVerify = async () => {
      store.error = null;
      store.success = null;
      const otp = otpDigits.join('');
      if (otp.length !== 6) {
        store.error = 'Please enter a complete 6-digit code.';
        return;
      }

      loading.value = true;
      try {
        await store.verifyOTP(email.value, otp);
        store.success = 'Account verified successfully!';
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err) {
        // Error captured by Pinia
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      store.error = null;
      store.success = null;
      router.push('/login');
    };

    return {
      email,
      otpDigits,
      otpInputs,
      loading,
      errorMsg,
      successMsg,
      onInput,
      onDelete,
      handleVerify,
      goBack
    };
  }
};
</script>
