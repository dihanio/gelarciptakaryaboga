import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog {
  user?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

export interface AuditLogDocument extends Omit<IAuditLog, 'createdAt'>, Document {
  createdAt: Date;
}

const AuditLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ user: 1, createdAt: -1 });

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);
