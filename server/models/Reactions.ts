import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const ReactionSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", index: true, required: true },
    authorMembershipId: { type: Schema.Types.ObjectId, ref: "Membership", index: true, required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One like per membership per post
ReactionSchema.index({ postId: 1, authorMembershipId: 1 }, { unique: true });
// Optional: fast “my likes” by membership
ReactionSchema.index({ authorMembershipId: 1, createdAt: -1 });

export type Reaction = InferSchemaType<typeof ReactionSchema> & { _id: Types.ObjectId };
export default mongoose.models.Reaction || mongoose.model("Reaction", ReactionSchema);
