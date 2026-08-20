export default {
  // Authentication Actions
  async login(email, phone, password) {
    try {
      const data = await this.apiRequest('/api/auth/login', 'POST', { email, phone, password });
      this.token = data.token;
      this.user = data.user;
      return data.user;
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  },

  async register(email, phone, password, role, jurisdiction, adminHash = '') {
    try {
      const data = await this.apiRequest('/api/auth/register', 'POST', { 
        email, 
        phone, 
        password, 
        role, 
        jurisdiction, 
        admin_hash: adminHash 
      });
      this.token = data.token;
      this.user = data.user;
      return data.user;
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    }
  },

  async verifyOTP(email, otp) {
    try {
      const data = await this.apiRequest('/api/auth/verify-otp', 'POST', { email, otp });
      this.token = data.token;
      this.user = data.user;
      return data.user;
    } catch (err) {
      console.error('OTP verification failed:', err);
      throw err;
    }
  },

  async loginWithGoogle(googleID, email, name, role, isSignUp) {
    try {
      const data = await this.apiRequest('/api/auth/google', 'POST', {
        google_id: googleID,
        email,
        name,
        role,
        is_signup: isSignUp
      });
      this.token = data.token;
      this.user = data.user;
      return data.user;
    } catch (err) {
      console.error('Google login failed:', err);
      throw err;
    }
  },

  logout() {
    this.token = '';
    this.user = null;
    this.dashboardStats = null;
    this.properties = [];
    this.leases = [];
    this.ledger = [];
    this.maintenance = [];
    this.disputes = [];
  },

  async fetchCurrentUser() {
    if (!this.token) return;
    try {
      const user = await this.apiRequest('/api/auth/me');
      this.user = user;
    } catch (err) {
      this.logout();
    }
  },

  async updateProfile(profileData) {
    try {
      const user = await this.apiRequest('/api/auth/profile/update', 'POST', profileData);
      this.user = user;
      return user;
    } catch (err) {
      console.error('Update profile failed:', err);
      throw err;
    }
  },

  async getWebAuthnRegisterOptions() {
    return await this.apiRequest('/api/auth/webauthn/register/options', 'POST');
  },

  async verifyWebAuthnRegister(credentialId, publicKey) {
    const data = await this.apiRequest('/api/auth/webauthn/register/verify', 'POST', {
      credentialId,
      publicKey
    });
    this.user = data.user;
    return data;
  },

  async getWebAuthnLoginOptions(email, phone) {
    return await this.apiRequest('/api/auth/webauthn/login/options', 'POST', { email, phone });
  },

  async verifyWebAuthnLogin(email, phone, credentialId) {
    const data = await this.apiRequest('/api/auth/webauthn/login/verify', 'POST', {
      email,
      phone,
      credentialId
    });
    this.token = data.token;
    this.user = data.user;
    return data.user;
  },

  async recoverPassword(email, recoveryPhrase, newPassword) {
    try {
      return await this.apiRequest('/api/auth/recover', 'POST', {
        email,
        recovery_phrase: recoveryPhrase,
        new_password: newPassword
      });
    } catch (err) {
      console.error('Recover password failed:', err);
      throw err;
    }
  }
};
