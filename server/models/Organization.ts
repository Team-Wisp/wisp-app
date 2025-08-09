import mongoose, { Schema, InferSchemaType } from "mongoose";

const OrganizationSchema = new Schema({
  slug:      { type: String, unique: true, index: true, required: true },
  name:      { type: String, required: true },
  domain:    { type: String, unique: true, index: true, required: true },
  type:      { type: String, enum: ["corporate","college"], index: true, required: true },
  logoUrl:   { type: String },
}, { timestamps: true });

export type Organization = InferSchemaType<typeof OrganizationSchema>;
export default mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);
