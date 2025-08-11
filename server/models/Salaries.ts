import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const SalarySchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },  // Reference to the company
    authorMembershipId: { type: Schema.Types.ObjectId, ref: "Membership", required: true }, // Reference to the membership who posted the salary
    salary: { type: Number, required: true, min: 0 },  // The salary amount
    jobTitle: { type: String, required: true, maxlength: 200 },  // The job title (e.g., "Software Engineer")
    location: { type: String, required: true, maxlength: 200 },  // Location (e.g., "San Francisco")
    isDeleted: { type: Boolean, default: false, index: true },  // Soft delete flag
  },
  { timestamps: true }
);

// Create an index to quickly filter salaries by company and job title
SalarySchema.index({ companyId: 1, createdAt: -1 });  // Sort by most recent salary first

export type Salary = InferSchemaType<typeof SalarySchema> & { _id: Types.ObjectId };
export default mongoose.models.Salary || mongoose.model("Salary", SalarySchema);
