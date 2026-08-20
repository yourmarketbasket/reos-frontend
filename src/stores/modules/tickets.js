export default {
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
  }
};
