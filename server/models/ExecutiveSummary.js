const mongoose = require('mongoose');

const executiveSummarySchema = new mongoose.Schema({
  greeting: { type: String, required: true },
  summary: { type: String, required: true },
  highlights: [{ type: String }],
  recommendation: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExecutiveSummary', executiveSummarySchema);
