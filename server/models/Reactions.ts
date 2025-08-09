import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const ReactionSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", index: true, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true }, // unique per post
  orgId:  { type: Schema.Types.ObjectId, ref: "Organization", index: true, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

ReactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

export type Reaction = InferSchemaType<typeof ReactionSchema> & { _id: Types.ObjectId };
export default mongoose.models.Reaction || mongoose.model("Reaction", ReactionSchema);
