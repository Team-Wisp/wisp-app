import mongoose, { Schema, InferSchemaType, Model } from "mongoose";
import { OrganizationType } from "./OrganizationType";

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: Object.values(OrganizationType), required: true },
    org_slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

type OrganizationDoc = InferSchemaType<typeof OrganizationSchema>;

export const Organization: Model<OrganizationDoc> =
  mongoose.models.Organization || mongoose.model<OrganizationDoc>("Organization", OrganizationSchema);
