import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const SalarySchema = new Schema({
  orgId:              { type: Schema.Types.ObjectId, ref: "Organization", index: true, required: true },
  authorMembershipId: { type: Schema.Types.ObjectId, ref: "Membership", index: true, required: true },
  title:              { type: String, required: true },
  level:              { type: String },
  location:           { type: String },
  yoe:                { type: Number, min: 0 },
  base:               { type: Number, min: 0, required: true },
  bonus:              { type: Number, min: 0 },
  stockValue:         { type: Number, min: 0 },
  currency:           { type: String, default: "USD" },
  isDeleted:          { type: Boolean, default: false, index: true },
}, { timestamps: true });

SalarySchema.index({ orgId: 1, title: 1, level: 1 });

export type Salary = InferSchemaType<typeof SalarySchema> & { _id: Types.ObjectId };
export default mongoose.models.Salary || mongoose.model("Salary", SalarySchema);
