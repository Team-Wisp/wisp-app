import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const CommentSchema = new Schema({
  postId:              { type: Schema.Types.ObjectId, ref: "Post", index: true, required: true },
  orgId:               { type: Schema.Types.ObjectId, ref: "Organization", index: true, required: true },
  authorMembershipId:  { type: Schema.Types.ObjectId, ref: "Membership", index: true, required: true },
  authorHandleSnapshot:{ type: String, required: true },
  body:                { type: String, required: true },
  isDeleted:           { type: Boolean, default: false, index: true },
}, { timestamps: true });

CommentSchema.index({ postId: 1, createdAt: 1 });

export type Comment = InferSchemaType<typeof CommentSchema> & { _id: Types.ObjectId };
export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
