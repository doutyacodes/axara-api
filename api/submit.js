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
//   const authResult = await authenticate(req, true);
//   if (!authResult.authenticated) {
//     return new Response(JSON.stringify(authResult.response), {
//       status: authResult.response?.status || 401,
//     });
//   }

//   const userId = authResult.decoded_Data.id;
  const userId = 2;
  const { age } = await req.json();

  if (!age) {
    return new Response(
      JSON.stringify({ error: "Age is required." }),
      { status: 400 }
    );
  }

  const existing_kids_community = await db
    .select()
    .from(KIDS_COMMUNITY)
    .where(eq(KIDS_COMMUNITY.age, age))
    .execute();

  let community_id = null;
  if (existing_kids_community.length > 0) {
    community_id = existing_kids_community[0].id;
  }

  try {
    // Fetch news with category name included
    const news = await db
      .select({
        id: NEWS.id,
        title: NEWS.title,
        description: NEWS.description,
        image_url: NEWS.image_url,
        age: NEWS.age,
        created_at: NEWS.created_at,
        category_name: NEWS_CATEGORIES.name,
      })
      .from(NEWS)
      .leftJoin(NEWS_CATEGORIES, eq(NEWS.news_category_id, NEWS_CATEGORIES.id))
      .where(eq(NEWS.age, age))
      .execute();

    let postsWithLikesAndComments = null;

    const postsWithUserAndChild = await db
      .select({
        postId: KIDS_POSTS.id,
        activity_id: KIDS_POSTS.activity_id,
        activity: ACTIVITIES.title,
        child_id: KIDS_POSTS.child_id,
        content: KIDS_POSTS.content,
        caption: KIDS_POSTS.caption,
        createdAt: KIDS_POSTS.created_at,
        username: USER_DETAILS.name,
        post_type: KIDS_POSTS.post_type,
        slug: KIDS_POSTS.slug,
        childname: CHILDREN.name,
        gender: CHILDREN.gender,
        activity_id: KIDS_POSTS.activity_id,
        image: USER_ACTIVITIES.image,
      })
      .from(KIDS_POSTS)
      .leftJoin(USER_DETAILS, eq(KIDS_POSTS.user_id, USER_DETAILS.id))
      .leftJoin(ACTIVITIES, eq(KIDS_POSTS.activity_id, ACTIVITIES.id))
      .leftJoin(CHILDREN, eq(KIDS_POSTS.child_id, CHILDREN.id))
      .leftJoin(
        USER_ACTIVITIES,
        and(
          eq(KIDS_POSTS.activity_id, USER_ACTIVITIES.activity_id), // match activity_id
          eq(KIDS_POSTS.child_id, USER_ACTIVITIES.child_id) // match child_id
        )
      )
      .where(eq(KIDS_POSTS.community_id, community_id))
      .execute();

    if (userId) {
      postsWithLikesAndComments = await Promise.all(
        postsWithUserAndChild.map(async (post) => {
          const [like] = await db
            .select()
            .from(KIDS_LIKES)
            .where(
              and(
                eq(KIDS_LIKES.post_id, post.postId),
                eq(KIDS_LIKES.user_id, userId)
              )
            )
            .execute();

          return {
            ...post,
            likedByUser: !!like,
          };
        })
      );
    } else {
      postsWithLikesAndComments = postsWithUserAndChild.map((post) => ({
        ...post,
        likedByUser: false,
      }));
    }

    return new Response(
      JSON.stringify({
        news,
        posts: postsWithLikesAndComments ? postsWithLikesAndComments : [],
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching news or categories:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch news data." }),
      { status: 500 }
    );
  }
}
