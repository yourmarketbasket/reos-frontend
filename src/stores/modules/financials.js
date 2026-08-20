export default {
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

  async fetchCommissions() {
    try {
      const list = await this.apiRequest('/api/commissions');
      this.commissions = list || [];
    } catch (err) {
      console.error('Fetch commissions failed:', err);
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
  }
};
