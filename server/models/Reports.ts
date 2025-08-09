import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const ReportSchema = new Schema({
  orgId:    { type: Schema.Types.ObjectId, ref: "Organization", index: true, required: true },
  targetType:{ type: String, enum: ["post","comment","review","salary"], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  reporterMembershipId: { type: Schema.Types.ObjectId, ref: "Membership", required: true },
  reason:   { type: String, required: true },
  status:   { type: String, enum: ["open","reviewing","resolved","rejected"], default: "open", index: true },
  resolutionNote: { type: String },
}, { timestamps: true });

ReportSchema.index({ targetType: 1, targetId: 1 });

export type Report = InferSchemaType<typeof ReportSchema> & { _id: Types.ObjectId };
export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
