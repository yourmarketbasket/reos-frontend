import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    user: null,
    token: '',
    properties: [],
    units: {},
    leases: [],
    ledger: [],
    maintenance: [],
    disputes: [],
    invitations: [],
    systemUsers: [],
    smsLogs: [],
    dashboardStats: null,
    listings: [],
    bookings: [],
    team: [],
    leads: [],
    commissions: [],
    tiers: [],
    regions: [],
    commissionRules: [],
    jurisdictions: [],
    commissionSettings: null,
    notifications: [],
    applications: [],
    inspections: [],
    deductions: [],
    viewings: [],
    redis_status: 'disconnected',
    active_ws_connections: 0,
    socket: null,
    error: null,
    success: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || ''
  },

  actions: {
    // Helper to send HTTP requests with Authorization Header
    async apiRequest(url, method = 'GET', body = null, idempotencyKey = null) {
      this.error = null;
      this.success = null;
      const headers = {
        'Content-Type': 'application/json'
      };
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      if (idempotencyKey) {
        headers['X-Idempotency-Key'] = idempotencyKey;
      }

      const options = { method, headers };
      if (body) {
        options.body = JSON.stringify(body);
      }

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || `Request failed with status ${response.status}`);
        }
        if (response.status === 204) return null;
        return await response.json();
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

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
    },

    // Dashboard Statistics Actions
    async fetchDashboardStats() {
      try {
        const stats = await this.apiRequest('/api/dashboard/stats');
        this.dashboardStats = stats;
      } catch (err) {
        console.error('Fetch dashboard stats failed:', err);
      }
    },

    // Properties Actions
    async fetchProperties() {
      try {
        const list = await this.apiRequest('/api/properties/list');
        this.properties = list || [];
      } catch (err) {
        console.error('Fetch properties failed:', err);
      }
    },

    async createProperty(name, latitude, longitude, jurisdiction, amenities, rules) {
      try {
        const prop = await this.apiRequest('/api/properties/create', 'POST', {
          name, latitude, longitude, jurisdiction, amenities, rules
        });
        this.properties.push(prop);
        this.success = 'Property created successfully';
        return prop;
      } catch (err) {
        console.error('Create property failed:', err);
        throw err;
      }
    },

    async createPropertyDetailed(propertyData) {
      try {
        const prop = await this.apiRequest('/api/properties/create', 'POST', propertyData);
        this.properties.push(prop);
        this.success = 'Property created and submitted for approval';
        return prop;
      } catch (err) {
        console.error('Create property detailed failed:', err);
        throw err;
      }
    },

    async updateProperty(propertyData) {
      try {
        const prop = await this.apiRequest('/api/properties/update', 'POST', propertyData);
        const idx = this.properties.findIndex(p => p.id === prop.id);
        if (idx !== -1) this.properties.splice(idx, 1, prop);
        this.success = 'Property updated and submitted for approval';
        return prop;
      } catch (err) {
        console.error('Update property failed:', err);
        throw err;
      }
    },

    async approveProperty(id, note) {
      try {
        const prop = await this.apiRequest('/api/properties/approve', 'POST', { id, note });
        const idx = this.properties.findIndex(p => p.id === prop.id);
        if (idx !== -1) this.properties.splice(idx, 1, prop);
        this.success = 'Property approved successfully';
        return prop;
      } catch (err) {
        console.error('Approve property failed:', err);
        throw err;
      }
    },

    async rejectProperty(id, note) {
      try {
        const prop = await this.apiRequest('/api/properties/reject', 'POST', { id, note });
        const idx = this.properties.findIndex(p => p.id === prop.id);
        if (idx !== -1) this.properties.splice(idx, 1, prop);
        this.success = 'Property rejected successfully';
        return prop;
      } catch (err) {
        console.error('Reject property failed:', err);
        throw err;
      }
    },

    async submitPropertyReview(reviewData) {
      try {
        const review = await this.apiRequest('/api/properties/review', 'POST', reviewData);
        this.success = 'Property review submitted successfully';
        return review;
      } catch (err) {
        console.error('Submit property review failed:', err);
        throw err;
      }
    },

    async respondToPropertyReview(respondData) {
      try {
        await this.apiRequest('/api/properties/review/respond', 'POST', respondData);
        this.success = 'Response to review posted successfully';
      } catch (err) {
        console.error('Respond to review failed:', err);
        throw err;
      }
    },

    async publishProperty(id) {
      try {
        const prop = await this.apiRequest('/api/properties/publish', 'POST', { id });
        const idx = this.properties.findIndex(p => p.id === prop.id);
        if (idx !== -1) this.properties.splice(idx, 1, prop);
        this.success = 'Property published successfully';
        return prop;
      } catch (err) {
        console.error('Publish property failed:', err);
        throw err;
      }
    },

    async unpublishProperty(id) {
      try {
        const prop = await this.apiRequest('/api/properties/unpublish', 'POST', { id });
        const idx = this.properties.findIndex(p => p.id === prop.id);
        if (idx !== -1) this.properties.splice(idx, 1, prop);
        this.success = 'Property moved back to draft';
        return prop;
      } catch (err) {
        console.error('Unpublish property failed:', err);
        throw err;
      }
    },

    async submitApplication(payload) {
      try {
        const app = await this.apiRequest('/api/applications/create', 'POST', payload);
        this.applications.push(app);
        this.success = 'Application submitted successfully';
        return app;
      } catch (err) {
        console.error('Submit application failed:', err);
        throw err;
      }
    },

    async fetchApplications() {
      try {
        const list = await this.apiRequest('/api/applications/list');
        this.applications = list || [];
      } catch (err) {
        console.error('Fetch applications failed:', err);
      }
    },

    // Units Actions
    async fetchUnits(propertyID) {
      try {
        const list = await this.apiRequest(`/api/units/list?property_id=${propertyID}`);
        this.units[propertyID] = list || [];
        return list;
      } catch (err) {
        console.error('Fetch units failed:', err);
        throw err;
      }
    },

    async createUnit(propertyID, buildingLabel, label, rentAmount, depositAmount, images = []) {
      try {
        const unit = await this.apiRequest('/api/units/create', 'POST', {
          property_id: propertyID, building_label: buildingLabel, label, rent_amount: rentAmount, deposit_amount: depositAmount, images
        });
        if (!this.units[propertyID]) {
          this.units[propertyID] = [];
        }
        this.units[propertyID].push(unit);
        this.success = 'Unit added successfully';
        return unit;
      } catch (err) {
        console.error('Create unit failed:', err);
        throw err;
      }
    },

    // Leases & Payments Actions
    async fetchLeases() {
      try {
        const list = await this.apiRequest('/api/leases/list');
        this.leases = list || [];
      } catch (err) {
        console.error('Fetch leases failed:', err);
      }
    },

    async payRent(leaseID, amount, idempotencyKey) {
      try {
        const entry = await this.apiRequest('/api/payments/pay-rent', 'POST', {
          lease_id: leaseID, amount
        }, idempotencyKey);
        this.ledger.push(entry);
        this.success = 'Payment processed successfully';
        return entry;
      } catch (err) {
        console.error('Pay rent failed:', err);
        throw err;
      }
    },

    async fetchLedger() {
      try {
        const list = await this.apiRequest('/api/payments/ledger');
        this.ledger = list || [];
      } catch (err) {
        console.error('Fetch ledger failed:', err);
      }
    },

    // Invitation Actions
    async createInvitation(email, role, propertyID, unitID) {
      try {
        const inv = await this.apiRequest('/api/invitations/create', 'POST', {
          email, role, property_id: propertyID, unit_id: unitID
        });
        this.invitations.push(inv);
        this.success = `Invitation email sent to ${email}. They will receive a link to accept.`;
        return inv;
      } catch (err) {
        console.error('Create invitation failed:', err);
        throw err;
      }
    },

    async fetchInvitationDetails(token) {
      try {
        return await this.apiRequest(`/api/invitations/detail?token=${token}`);
      } catch (err) {
        console.error('Fetch invitation details failed:', err);
        throw err;
      }
    },

    async acceptInvitation(token, email, password, phone, googleID) {
      try {
        const data = await this.apiRequest('/api/invitations/accept', 'POST', {
          token, email, password, phone, google_id: googleID
        });
        this.token = data.token;
        this.user = data.user;
        return data.user;
      } catch (err) {
        console.error('Accept invitation failed:', err);
        throw err;
      }
    },

    async fetchAllInvitations() {
      try {
        const list = await this.apiRequest('/api/invitations/list');
        this.invitations = list || [];
      } catch (err) {
        console.error('Fetch invitations failed:', err);
      }
    },

    async revokeInvitation(token) {
      try {
        await this.apiRequest('/api/invitations/revoke', 'POST', { token });
        const inv = this.invitations.find(i => i.token === token);
        if (inv) inv.status = 'revoked';
        this.success = 'Invitation revoked successfully.';
      } catch (err) {
        console.error('Revoke invitation failed:', err);
        throw err;
      }
    },

    async resendInvitation(token) {
      try {
        const res = await this.apiRequest('/api/invitations/resend', 'POST', { token });
        const inv = this.invitations.find(i => i.token === token);
        if (inv) inv.status = 'pending';
        this.success = `Invitation resent to ${res.email}.`;
      } catch (err) {
        console.error('Resend invitation failed:', err);
        throw err;
      }
    },

    // Maintenance Actions
    async reportMaintenance(unitID, issueType, description, priority) {
      try {
        const maint = await this.apiRequest('/api/maintenance/report', 'POST', {
          unit_id: unitID, issue_type: issueType, description, priority
        });
        this.maintenance.push(maint);
        this.success = 'Maintenance ticket submitted';
        return maint;
      } catch (err) {
        console.error('Report maintenance failed:', err);
        throw err;
      }
    },

    async fetchMaintenance() {
      try {
        const list = await this.apiRequest('/api/maintenance/list');
        this.maintenance = list || [];
      } catch (err) {
        console.error('Fetch maintenance tickets failed:', err);
      }
    },

    async updateMaintenanceStatus(id, status, priority, caretakerID, costEstimate, finalCost) {
      try {
        const updated = await this.apiRequest('/api/maintenance/update', 'POST', {
          id, status, priority, caretaker_id: caretakerID, cost_estimate: costEstimate, final_cost: finalCost
        });
        const index = this.maintenance.findIndex(m => m.id === id);
        if (index !== -1) {
          this.maintenance[index] = updated;
        }
        this.success = 'Maintenance ticket updated';
        return updated;
      } catch (err) {
        console.error('Update maintenance failed:', err);
        throw err;
      }
    },

    // Dispute Actions
    async createDispute(type, propertyID, leaseID, respondentID, sourceRefEntity, sourceRefID, content, evidence) {
      try {
        const disp = await this.apiRequest('/api/disputes/create', 'POST', {
          type, property_id: propertyID, lease_id: leaseID, respondent_id: respondentID,
          source_ref_entity: sourceRefEntity, source_ref_id: sourceRefID, content, evidence
        });
        this.disputes.push(disp);
        this.success = 'Dispute opened and sent to superadmin arbitration';
        return disp;
      } catch (err) {
        console.error('Create dispute failed:', err);
        throw err;
      }
    },

    async fetchDisputes() {
      try {
        const list = await this.apiRequest('/api/disputes/list');
        this.disputes = list || [];
      } catch (err) {
        console.error('Fetch disputes failed:', err);
      }
    },

    async addDisputeMessage(disputeID, content) {
      try {
        const msg = await this.apiRequest('/api/disputes/message', 'POST', {
          dispute_id: disputeID, content
        });
        const index = this.disputes.findIndex(d => d.id === disputeID);
        if (index !== -1) {
          this.disputes[index].messages.push(msg);
        }
        return msg;
      } catch (err) {
        console.error('Add dispute message failed:', err);
        throw err;
      }
    },

    async resolveDispute(disputeID, resolutionNotes) {
      try {
        const resolved = await this.apiRequest('/api/disputes/resolve', 'POST', {
          dispute_id: disputeID, resolution_notes: resolutionNotes
        });
        const index = this.disputes.findIndex(d => d.id === disputeID);
        if (index !== -1) {
          this.disputes[index] = resolved;
        }
        this.success = 'Dispute resolved successfully';
        return resolved;
      } catch (err) {
        console.error('Resolve dispute failed:', err);
        throw err;
      }
    },

    // Admin Specific Settings Actions
    async updateGatewayConfig(name, isActive) {
      try {
        const list = await this.apiRequest('/api/admin/gateway', 'POST', { name, is_active: isActive });
        if (this.dashboardStats && this.dashboardStats.gateways) {
          this.dashboardStats.gateways = list;
        }
        this.success = `Gateway ${name} configuration updated`;
      } catch (err) {
        console.error('Update gateway config failed:', err);
        throw err;
      }
    },

    async fetchSystemUsers() {
      try {
        const list = await this.apiRequest('/api/admin/users');
        this.systemUsers = list || [];
      } catch (err) {
        console.error('Fetch system users failed:', err);
      }
    },

    async fetchSMSLogs() {
      try {
        const logs = await this.apiRequest('/api/admin/sms-logs');
        this.smsLogs = logs || [];
      } catch (err) {
        console.error('Fetch SMS logs failed:', err);
      }
    },

    async fetchListings() {
      try {
        const list = await this.apiRequest('/api/listings/list');
        this.listings = list || [];
      } catch (err) {
        console.error('Fetch listings failed:', err);
      }
    },

    async createListing(listingData) {
      try {
        const listing = await this.apiRequest('/api/listings/create', 'POST', listingData);
        this.listings.push(listing);
        this.success = 'Listing submitted for review';
        return listing;
      } catch (err) {
        console.error('Create listing failed:', err);
        throw err;
      }
    },

    async updateListing(listingData) {
      try {
        const listing = await this.apiRequest('/api/listings/update', 'POST', listingData);
        const idx = this.listings.findIndex(l => l.id === listing.id);
        if (idx !== -1) this.listings.splice(idx, 1, listing);
        this.success = 'Listing updated and submitted for review';
        return listing;
      } catch (err) {
        console.error('Update listing failed:', err);
        throw err;
      }
    },

    async approveListing(id, note) {
      try {
        const listing = await this.apiRequest('/api/listings/approve', 'POST', { id, note });
        const idx = this.listings.findIndex(l => l.id === listing.id);
        if (idx !== -1) this.listings.splice(idx, 1, listing);
        this.success = 'Listing approved successfully';
        return listing;
      } catch (err) {
        console.error('Approve listing failed:', err);
        throw err;
      }
    },

    async rejectListing(id, note) {
      try {
        const listing = await this.apiRequest('/api/listings/reject', 'POST', { id, note });
        const idx = this.listings.findIndex(l => l.id === listing.id);
        if (idx !== -1) this.listings.splice(idx, 1, listing);
        this.success = 'Listing rejected';
        return listing;
      } catch (err) {
        console.error('Reject listing failed:', err);
        throw err;
      }
    },

    // Regions Actions
    async fetchRegions(activeOnly = false) {
      try {
        const list = await this.apiRequest(`/api/regions?active_only=${activeOnly}`);
        this.regions = list || [];
        return list;
      } catch (err) {
        console.error('Fetch regions failed:', err);
      }
    },

    async createRegion(regionData) {
      try {
        const reg = await this.apiRequest('/api/regions/create', 'POST', regionData);
        this.regions.push(reg);
        this.success = 'Region created successfully';
        return reg;
      } catch (err) {
        console.error('Create region failed:', err);
        throw err;
      }
    },

    async updateRegion(regionData) {
      try {
        const reg = await this.apiRequest('/api/regions/update', 'PUT', regionData);
        const idx = this.regions.findIndex(r => r.id === reg.id);
        if (idx !== -1) this.regions.splice(idx, 1, reg);
        this.success = 'Region updated successfully';
        return reg;
      } catch (err) {
        console.error('Update region failed:', err);
        throw err;
      }
    },

    async toggleRegion(id) {
      try {
        const reg = await this.apiRequest('/api/regions/toggle', 'POST', { id });
        const idx = this.regions.findIndex(r => r.id === reg.id);
        if (idx !== -1) this.regions.splice(idx, 1, reg);
        this.success = `Region status toggled`;
        return reg;
      } catch (err) {
        console.error('Toggle region failed:', err);
        throw err;
      }
    },

    async deleteRegion(id) {
      try {
        await this.apiRequest('/api/regions/delete', 'DELETE', { id });
        this.regions = this.regions.filter(r => r.id !== id);
        this.success = 'Region deleted successfully';
      } catch (err) {
        console.error('Delete region failed:', err);
        throw err;
      }
    },

    // Commission Rules Actions
    async fetchCommissionRules() {
      try {
        const list = await this.apiRequest('/api/commission-rules');
        this.commissionRules = list || [];
        return list;
      } catch (err) {
        console.error('Fetch commission rules failed:', err);
      }
    },

    async createCommissionRule(ruleData) {
      try {
        const rule = await this.apiRequest('/api/commission-rules/create', 'POST', ruleData);
        this.commissionRules.push(rule);
        this.success = 'Commission rule created successfully';
        return rule;
      } catch (err) {
        console.error('Create commission rule failed:', err);
        throw err;
      }
    },

    async updateCommissionRule(ruleData) {
      try {
        const rule = await this.apiRequest('/api/commission-rules/update', 'PUT', ruleData);
        const idx = this.commissionRules.findIndex(cr => cr.id === rule.id);
        if (idx !== -1) this.commissionRules.splice(idx, 1, rule);
        this.success = 'Commission rule updated successfully';
        return rule;
      } catch (err) {
        console.error('Update commission rule failed:', err);
        throw err;
      }
    },

    async deleteCommissionRule(id) {
      try {
        await this.apiRequest('/api/commission-rules/delete', 'DELETE', { id });
        this.commissionRules = this.commissionRules.filter(cr => cr.id !== id);
        this.success = 'Commission rule deleted successfully';
      } catch (err) {
        console.error('Delete commission rule failed:', err);
        throw err;
      }
    },

    // Image Upload Action
    async uploadImage(file) {
      try {
        this.error = null;
        this.success = null;
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/uploads/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: formData
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Upload to Nisoko Object Storage failed');
        }

        const data = await response.json();
        if (data && data.url) {
          return data.url;
        } else {
          throw new Error('Nisoko upload returned invalid download URL');
        }
      } catch (err) {
        this.error = err.message || 'Image upload failed';
        console.error('Upload image to Nisoko failed:', err);
        throw err;
      }
    },

    async fetchBookings() {
      try {
        const list = await this.apiRequest('/api/bookings/list');
        this.bookings = list || [];
      } catch (err) {
        console.error('Fetch bookings failed:', err);
      }
    },

    async createBooking(bookingData) {
      try {
        const booking = await this.apiRequest('/api/bookings/create', 'POST', bookingData);
        this.bookings.push(booking);
        this.success = 'Booking confirmed successfully';
        return booking;
      } catch (err) {
        console.error('Create booking failed:', err);
        throw err;
      }
    },

    async fetchTeam() {
      try {
        const list = await this.apiRequest('/api/team/list');
        this.team = list || [];
      } catch (err) {
        console.error('Fetch team failed:', err);
      }
    },

    async inviteStaff(email, phone, properties, regions) {
      try {
        const sm = await this.apiRequest('/api/team/invite', 'POST', { email, phone, properties, regions });
        this.team.push(sm);
        this.success = 'Staff member invited successfully';
        return sm;
      } catch (err) {
        console.error('Invite staff failed:', err);
        throw err;
      }
    },

    async fetchTiers() {
      try {
        const list = await this.apiRequest('/api/tiers/list');
        this.tiers = list || [];
      } catch (err) {
        console.error('Fetch tiers failed:', err);
      }
    },

    async upgradeTier(targetTierLevel) {
      try {
        const verification = await this.apiRequest('/api/tiers/upgrade', 'POST', { target_tier_level: targetTierLevel });
        if (this.dashboardStats && this.dashboardStats.verification) {
          this.dashboardStats.verification = verification;
        }
        this.success = 'Verification tier upgraded successfully';
        return verification;
      } catch (err) {
        console.error('Upgrade tier failed:', err);
        throw err;
      }
    },

    async fetchLeads() {
      try {
        const list = await this.apiRequest('/api/leads/list');
        this.leads = list || [];
      } catch (err) {
        console.error('Fetch leads failed:', err);
      }
    },

    async fetchCommissions() {
      try {
        const list = await this.apiRequest('/api/commissions/list');
        this.commissions = list || [];
      } catch (err) {
        console.error('Fetch commissions failed:', err);
      }
    },

    // WebSocket Init
    initWebSocket() {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        return;
      }
      if (!this.token) {
        return;
      }

      // Use deployed Nisoko backend for WebSocket
      const isProd = typeof __API_BASE_URL__ !== 'undefined' && __API_BASE_URL__.startsWith('https');
      const wsBase = isProd
        ? __API_BASE_URL__.replace('https://', 'wss://').replace('http://', 'ws://')
        : `ws://${window.location.hostname}:8080`;
      const wsUrl = `${wsBase}/api/ws?token=${this.token}`;
      console.log(`Connecting to WebSocket at: ${wsUrl}...`);

      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connection established!');
        this.redis_status = 'connected';
        this.socket = socket;
        this.error = null;
      };

      socket.onmessage = (event) => {
        try {
          const wsMsg = JSON.parse(event.data);
          if (wsMsg.type === 'system_health') {
            this.redis_status = wsMsg.payload?.status || 'connected';
          } else if (wsMsg.type === 'notification') {
            this.notifications.unshift({
              id: Date.now().toString(),
              title: wsMsg.payload?.title || 'Notification',
              body: wsMsg.payload?.body || '',
              timestamp: new Date()
            });
            // Show inline flash message
            this.success = `${wsMsg.payload?.title}: ${wsMsg.payload?.body}`;
          } else if (wsMsg.type === 'dispute_chat') {
            // Find active dispute and append message
            const payloadMsg = wsMsg.payload;
            if (payloadMsg && payloadMsg.dispute_id) {
              const disp = this.disputes.find(d => d.id === payloadMsg.dispute_id);
              if (disp) {
                if (!disp.messages) disp.messages = [];
                // Check if message is already added
                const exists = disp.messages.some(m => m.sent_at === payloadMsg.sent_at && m.sender_id === payloadMsg.sender_id);
                if (!exists) {
                  disp.messages.push(payloadMsg);
                }
              }
            }
          } else if (wsMsg.type === 'property_sync') {
            console.log('Received property sync request, reloading lists...');
            this.fetchProperties();
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message payload:', err);
        }
      };

      socket.onclose = () => {
        console.warn('WebSocket connection closed. Reconnecting in 3s...');
        this.redis_status = 'disconnected';
        this.socket = null;
        setTimeout(() => this.initWebSocket(), 3000);
      };

      socket.onerror = (err) => {
        console.error('WebSocket encountered an error:', err);
        socket.close();
      };
    },

    // Jurisdictions CRUD
    async fetchJurisdictions() {
      try {
        const list = await this.apiRequest('/api/jurisdictions');
        this.jurisdictions = list || [];
      } catch (err) {
        console.error('Fetch jurisdictions failed:', err);
      }
    },

    async saveJurisdiction(j) {
      try {
        const isEdit = !!j.id;
        const endpoint = isEdit ? '/api/jurisdictions/update' : '/api/jurisdictions/create';
        const res = await this.apiRequest(endpoint, 'POST', j);
        if (isEdit) {
          const idx = this.jurisdictions.findIndex(item => item.id === res.id);
          if (idx !== -1) this.jurisdictions[idx] = res;
        } else {
          this.jurisdictions.push(res);
        }
        this.success = 'Jurisdiction successfully saved!';
        return res;
      } catch (err) {
        console.error('Save jurisdiction failed:', err);
        throw err;
      }
    },

    async deleteJurisdiction(id) {
      try {
        await this.apiRequest('/api/jurisdictions/delete', 'POST', { id });
        this.jurisdictions = this.jurisdictions.filter(j => j.id !== id);
        this.success = 'Jurisdiction deleted successfully';
      } catch (err) {
        console.error('Delete jurisdiction failed:', err);
        throw err;
      }
    },

    async toggleJurisdiction(id) {
      try {
        const res = await this.apiRequest('/api/jurisdictions/toggle', 'POST', { id });
        const idx = this.jurisdictions.findIndex(j => j.id === id);
        if (idx !== -1) this.jurisdictions[idx] = res;
        return res;
      } catch (err) {
        console.error('Toggle jurisdiction status failed:', err);
        throw err;
      }
    },

    // Platform Commission Settings
    async fetchCommissionSettings() {
      try {
        const res = await this.apiRequest('/api/admin/commission-settings');
        this.commissionSettings = res;
      } catch (err) {
        console.error('Fetch commission settings failed:', err);
      }
    },

    async saveCommissionSettings(settings) {
      try {
        const res = await this.apiRequest('/api/admin/commission-settings/save', 'POST', settings);
        this.commissionSettings = res;
        this.success = 'Commission settings updated successfully!';
        return res;
      } catch (err) {
        console.error('Save commission settings failed:', err);
        throw err;
      }
    },

    // Support Actions
    async unpublishListing(id, reason) {
      try {
        const res = await this.apiRequest('/api/support/listings/unpublish', 'POST', { id, reason });
        const idx = this.listings.findIndex(l => l.id === id);
        if (idx !== -1) this.listings[idx] = res;
        this.success = 'Listing has been unpublished successfully!';
        return res;
      } catch (err) {
        console.error('Unpublish listing failed:', err);
        throw err;
      }
    },

    async suspendUser(userId, status) {
      try {
        const res = await this.apiRequest('/api/support/users/suspend', 'POST', { user_id: userId, status });
        const idx = this.systemUsers.findIndex(u => u.id === userId);
        if (idx !== -1) this.systemUsers[idx] = res;
        this.success = `User has been successfully ${status === 'suspended' ? 'suspended' : 'activated'}!`;
        return res;
      } catch (err) {
        console.error('Suspend user failed:', err);
        throw err;
      }
    },

    async verifyKYC(verificationId, status, reason) {
      try {
        const res = await this.apiRequest('/api/support/kyc/verify', 'POST', { verification_id: verificationId, status, reason });
        this.success = `KYC documents have been ${status === 'approved' ? 'approved' : 'rejected'} successfully.`;
        return res;
      } catch (err) {
        console.error('Verify KYC failed:', err);
        throw err;
      }
    },

    // Dispute Escalation
    async escalateDispute(disputeId) {
      try {
        const res = await this.apiRequest('/api/disputes/escalate', 'POST', { dispute_id: disputeId });
        const idx = this.disputes.findIndex(d => d.id === disputeId);
        if (idx !== -1) this.disputes[idx] = res;
        this.success = 'Dispute has been escalated to platform administration!';
        return res;
      } catch (err) {
        console.error('Escalate dispute failed:', err);
        throw err;
      }
    },

    // Lease Transfers & Vacating
    async vacateLease(leaseId, reason, moveOutDate) {
      try {
        const res = await this.apiRequest('/api/leases/vacate', 'POST', { lease_id: leaseId, reason, move_out_date: moveOutDate });
        this.success = 'Notice to vacate registered successfully!';
        return res;
      } catch (err) {
        console.error('Vacate lease failed:', err);
        throw err;
      }
    },

    async transferTenant(currentLeaseId, targetUnitId) {
      try {
        const res = await this.apiRequest('/api/leases/transfer', 'POST', { current_lease_id: currentLeaseId, target_unit_id: targetUnitId });
        this.success = 'Tenant transferred to unit successfully!';
        return res;
      } catch (err) {
        console.error('Transfer tenant failed:', err);
        throw err;
      }
    },

    // Inspections Actions
    async fetchInspections(leaseId) {
      try {
        const list = await this.apiRequest(`/api/inspections/list?lease_id=${leaseId}`);
        this.inspections = list || [];
        return list;
      } catch (err) {
        console.error('Fetch inspections failed:', err);
      }
    },

    async createInspection(leaseId, unitId, type, checklistJson, meterReadings, photos) {
      try {
        const res = await this.apiRequest('/api/inspections/create', 'POST', {
          lease_id: leaseId,
          unit_id: unitId,
          type,
          checklist_json: checklistJson,
          meter_readings: meterReadings,
          photos
        });
        this.inspections.unshift(res);
        this.success = 'Inspection checklist submitted successfully!';
        return res;
      } catch (err) {
        console.error('Create inspection failed:', err);
        throw err;
      }
    },

    // Deductions Actions
    async fetchDeductions() {
      try {
        const list = await this.apiRequest('/api/deductions/list');
        this.deductions = list || [];
        return list;
      } catch (err) {
        console.error('Fetch deductions failed:', err);
      }
    },

    async createDeduction(leaseId, amount, description) {
      try {
        const res = await this.apiRequest('/api/deductions/create', 'POST', {
          lease_id: leaseId,
          amount: parseFloat(amount),
          description
        });
        this.deductions.unshift(res);
        this.success = 'Deduction claim draft generated!';
        return res;
      } catch (err) {
        console.error('Create deduction failed:', err);
        throw err;
      }
    },

    // Applications Actions
    async fetchApplications() {
      try {
        const list = await this.apiRequest('/api/applications/list');
        this.applications = list || [];
        return list;
      } catch (err) {
        console.error('Fetch applications failed:', err);
      }
    },

    async createApplication(listingId, listingTitle, tenantName, email, phone, employment, monthlyIncome, occupants, creditScore) {
      try {
        const res = await this.apiRequest('/api/applications/create', 'POST', {
          listing_id: listingId,
          listing_title: listingTitle,
          tenant_name: tenantName,
          email,
          phone,
          employment,
          monthly_income: parseFloat(monthlyIncome),
          occupants: parseInt(occupants),
          credit_score: parseInt(creditScore)
        });
        this.applications.unshift(res);
        this.success = 'Your rental application has been submitted successfully!';
        return res;
      } catch (err) {
        console.error('Create application failed:', err);
        throw err;
      }
    },

    async updateApplicationStatus(id, status, notes) {
      try {
        const res = await this.apiRequest('/api/applications/update', 'POST', {
          id,
          status,
          notes
        });
        const index = this.applications.findIndex(a => a.id === id);
        if (index !== -1) {
          this.applications[index] = res;
        }
        this.success = `Application status updated to ${status}!`;
        return res;
      } catch (err) {
        console.error('Update application status failed:', err);
        throw err;
      }
    },

    // Viewings Actions
    async fetchViewings() {
      try {
        const list = await this.apiRequest('/api/viewings/list');
        this.viewings = list || [];
        return list;
      } catch (err) {
        console.error('Fetch viewings failed:', err);
      }
    },

    async createViewing(leadId, notes, scheduledTime) {
      try {
        const res = await this.apiRequest('/api/viewings/create', 'POST', {
          lead_id: leadId,
          notes,
          scheduled: scheduledTime
        });
        this.viewings.unshift(res);
        this.success = 'Property viewing event logged successfully!';
        return res;
      } catch (err) {
        console.error('Create viewing failed:', err);
        throw err;
      }
    }
  }
});
