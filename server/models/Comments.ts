import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const CommentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    authorMembershipId: { type: Schema.Types.ObjectId, ref: "Membership", required: true },
    body: { type: String, required: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

CommentSchema.index({ postId: 1, createdAt: 1 });

export type Comment = InferSchemaType<typeof CommentSchema> & { _id: Types.ObjectId };
export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
