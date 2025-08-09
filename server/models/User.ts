import mongoose, { Schema, InferSchemaType } from "mongoose";
const UserSchema = new Schema({
  emailHash: { type: String, unique: true, index: true, required: true },
  password:  { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
export type User = InferSchemaType<typeof UserSchema>;
export default mongoose.models.User || mongoose.model("User", UserSchema);
