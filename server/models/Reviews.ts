import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const ReviewSchema = new Schema({
  orgId:              { type: Schema.Types.ObjectId, ref: "Organization", index: true, required: true },
  authorMembershipId: { type: Schema.Types.ObjectId, ref: "Membership", index: true, required: true },
  overall:            { type: Number, min: 1, max: 5, required: true },
  workLife:           { type: Number, min: 1, max: 5, required: true },
  compensation:       { type: Number, min: 1, max: 5, required: true },
  culture:            { type: Number, min: 1, max: 5, required: true },
  leadership:         { type: Number, min: 1, max: 5, required: true },
  title:              { type: String },
  pros:               { type: String, required: true },
  cons:               { type: String, required: true },
  isDeleted:          { type: Boolean, default: false, index: true },
}, { timestamps: true });

// Optional: one review per membership per org
// ReviewSchema.index({ orgId: 1, authorMembershipId: 1 }, { unique: true });

export type Review = InferSchemaType<typeof ReviewSchema> & { _id: Types.ObjectId };
export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
