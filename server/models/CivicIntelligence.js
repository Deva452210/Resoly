const mongoose = require('mongoose');

const civicIntelligenceSchema = new mongoose.Schema({
  criticalAlerts: [{ type: String }],
  relatedComplaints: [{
    pattern: { type: String },
    complaints: [{
      id: { type: String },
      title: { type: String }
    }]
  }],
  possibleRootCauses: [{ type: String }],
  recommendations: [{
    action: { type: String },
    linkedComplaints: [{
      id: { type: String },
      title: { type: String }
    }]
  }],
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CivicIntelligence', civicIntelligenceSchema);
