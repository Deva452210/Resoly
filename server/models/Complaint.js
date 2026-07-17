const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    department: { type: String, required: true },
    priority: { type: String, required: true },
    imageUrl: { type: String, required: true },
    videoUrl: { type: String },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      area: { type: String },
      city: { type: String },
      landmark: { type: String },
    },
    status: {
      type: String,
      enum: ['Reported', 'Assigned', 'In Progress', 'Resolved'],
      default: 'Reported',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    aiGenerated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
