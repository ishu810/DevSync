import { Schema, model } from 'mongoose';

const ComplaintSchema = new Schema(
  {
    submitted_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assigned_to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      maxlength: 500,
    },

    category: {
      type: String,
      enum: ['Infrastructure', 'Sanitation', 'Water', 'Electricity', 'Other'],
      default: 'Other',
    },

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },

    status: {
      type: String,
      enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },

    remarks: {
      type: String,
      default: '',
    },

    photo_url: {
      type: String,
      default: '',
    },

    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String, trim: true },
    },

    deadline: {
      type: Date,
      default: null,
    },
    lastDeadlineAlerted: {
      type: Date,
      default: null,
    },

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);




export default model('Complaint', ComplaintSchema);
