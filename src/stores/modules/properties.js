export default {
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

  // Listings Actions
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

  // Bookings Actions
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

  // Applications Actions
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

  async fetchPublicProperties() {
    try {
      const list = await this.apiRequest('/api/properties/list/guest');
      this.properties = list || [];
      return list;
    } catch (err) {
      console.error('Fetch public properties failed:', err);
    }
  },

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
};
