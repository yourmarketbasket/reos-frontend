export default {
  // Dashboard Statistics Actions
  async fetchDashboardStats() {
    try {
      const stats = await this.apiRequest('/api/dashboard/stats');
      this.dashboardStats = stats;
    } catch (err) {
      console.error('Fetch dashboard stats failed:', err);
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
  }
};
