import {
    int,
    mysqlTable,
    timestamp
} from "drizzle-orm/mysql-core";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
  
  // const connection = await mysql.createConnection({
  //   host: "localhost",
  //   user: "root",
  //   database: "axara2",
  //   password:'',
  //   port:'3306'
  // });
  
  const connection = await mysql.createConnection({
    host: "68.178.163.247",
    user: "devusr_wowfyuser",
    database: "devusr_doutya_website",
    password:'###Wowfy123',
    port:'3306',
  });
  
  const db = drizzle(connection);
  
 const KIDS_COMMUNITY = mysqlTable("kids_community", {
    id: int("id").primaryKey().autoincrement(),
    age: int("age").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  });

import { eq } from "drizzle-orm";

export async function POST(req) {
    try {
      const  age  = 5;
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
  
