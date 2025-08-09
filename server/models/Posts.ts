import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const PostSchema = new Schema({
  orgId:               { type: Schema.Types.ObjectId, ref: "Organization", index: true, required: true },
  companyId:           { type: Schema.Types.ObjectId, ref: "Organization", index: true }, // optional
  category:            { type: String, enum: ["general","career","compensation","culture"], index: true, required: true },
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

PostSchema.index({ orgId: 1, createdAt: -1 });
PostSchema.index({ companyId: 1, createdAt: -1 });
PostSchema.index({ category: 1, orgId: 1, createdAt: -1 });

export type Post = InferSchemaType<typeof PostSchema> & { _id: Types.ObjectId };
export default mongoose.models.Post || mongoose.model("Post", PostSchema);
