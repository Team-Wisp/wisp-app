import mongoose, { Schema, InferSchemaType, Types } from "mongoose";
import { PostCategory, getAllPostCategories } from "./PostCategory";

const PostSchema = new Schema({
  orgId:               { type: Schema.Types.ObjectId, ref: "Organization", index: true, required: true },
  category:            { type: String, enum: getAllPostCategories(), index: true, required: true },
  title:               { type: String, required: true, maxlength: 200 },
  body:                { type: String, required: true },
  authorMembershipId:  { type: Schema.Types.ObjectId, ref: "Membership", index: true, required: true },
  authorHandleSnapshot:{ type: String, required: true },
  likeCount:           { type: Number, default: 0 },
  commentCount:        { type: Number, default: 0 },
  viewCount:           { type: Number, default: 0 },
  tags:                [{ type: String }],
  isDeleted:           { type: Boolean, default: false, index: true },
}, { timestamps: true });

PostSchema.index({ orgId: 1, createdAt: -1 });              // org feed
PostSchema.index({ category: 1, orgId: 1, createdAt: -1 }); // org+category feed
PostSchema.index({ createdAt: -1, _id: -1 });               // global feed cursor

export type Post = InferSchemaType<typeof PostSchema> & { _id: Types.ObjectId };
export default mongoose.models.Post || mongoose.model("Post", PostSchema);
