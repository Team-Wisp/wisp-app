import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const MembershipSchema = new Schema({
  userId:        { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
  orgId:         { type: Schema.Types.ObjectId, ref: "Organization", index: true, required: true },
  displayHandle: { type: String, required: true }, 
  role:          { type: String, enum: ["member","mod","admin"], default: "member" },
}, { timestamps: true });

MembershipSchema.index({ userId: 1, orgId: 1 }, { unique: true });

export type Membership = InferSchemaType<typeof MembershipSchema> & { _id: Types.ObjectId };
export default mongoose.models.Membership || mongoose.model("Membership", MembershipSchema);
