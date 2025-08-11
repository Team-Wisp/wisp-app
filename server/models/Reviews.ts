import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const ReviewSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },  // Reference to the company
    authorMembershipId: { type: Schema.Types.ObjectId, ref: "Membership", required: true }, // Reference to the membership who wrote the review
    rating: { type: Number, required: true, min: 1, max: 5 },  // Rating (1 to 5)
    comment: { type: String, required: true, maxlength: 1000 },  // Comment about the company
    isDeleted: { type: Boolean, default: false, index: true },  // Soft delete flag
  },
  { timestamps: true }
);

// Create an index to quickly filter reviews for a specific company
ReviewSchema.index({ companyId: 1, createdAt: -1 });  // Sort reviews by most recent first

export type Review = InferSchemaType<typeof ReviewSchema> & { _id: Types.ObjectId };
export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
