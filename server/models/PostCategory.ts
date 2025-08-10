import { z } from "zod";

export enum PostCategory {
  COMPANY = "company",        
  GENERAL = "general",
  CAREER = "career",
  COMPENSATION = "compensation",
  CULTURE = "culture",
}

// Create a Zod schema for validation
export const PostCategorySchema = z.nativeEnum(PostCategory);

// Helper function to get all category values
export function getAllPostCategories(): string[] {
  return Object.values(PostCategory);
}
