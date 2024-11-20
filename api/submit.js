import { db } from "../utils";
import {
  CHILDREN,
  KIDS_COMMUNITY,
  KIDS_POSTS,
  NEWS,
  NEWS_CATEGORIES,
  USER_DETAILS,
  KIDS_LIKES,
  USER_ACTIVITIES,
  ACTIVITIES,
} from "../utils/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req) {
    try {
      const { age } = await req.json();
      if (!age) {
        return new Response(
          JSON.stringify({ error: "Age is required." }),
          { status: 400 }
        );
      }
  
      // Check if the community exists for the given age
      const existing_kids_community = await db
        .select()
        .from(KIDS_COMMUNITY)
        .where(eq(KIDS_COMMUNITY.age, age))
        .execute();
  
      if (existing_kids_community.length === 0) {
        return new Response(
          JSON.stringify({ error: "No community found for the given age." }),
          { status: 404 }
        );
      }
  
      return new Response(
        JSON.stringify({ community: existing_kids_community }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error during POST request:", error);
      return new Response(
        JSON.stringify({ error: `Error: ${error.message || error}` }),
        { status: 500 }
      );
    }
  }
  