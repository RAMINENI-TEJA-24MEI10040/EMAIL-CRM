import mongoose, { Document, Schema } from 'mongoose';

export interface IMail extends Document {
  to: string;
  subject: string;
  body: string;
  status: 'sent' | 'opened' | 'failed';
  trackingId: string;
  openedAt?: Date;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MailSchema: Schema = new Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, enum: ['sent', 'opened', 'failed'], default: 'sent' },
    trackingId: { type: String, required: true, unique: true },
    openedAt: { type: Date },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IMail>('Mail', MailSchema);
