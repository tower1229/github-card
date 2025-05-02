import { db } from "./index";
import { users, userBehaviors, shareLinks } from "./schema";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";
import { getExpirationDate } from "./index";

dotenv.config({ path: ".env.local" });

async function seed() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  console.log("Seeding database...");

  try {
    // Create sample user
    const [user] = await db
      .insert(users)
      .values({
        githubId: "sample-github-id",
        username: "sample-user",
        avatarUrl: "https://avatars.githubusercontent.com/u/12345678",
        email: "user@example.com",
      })
      .returning();

    console.log("Created sample user:", user);

    // Log user behavior
    await db.insert(userBehaviors).values({
      userId: user.id,
      actionType: "signup",
      performedAt: new Date(),
    });

    // Create sample share link
    const linkToken = uuidv4();
    const expiresAt = getExpirationDate();

    // Sample GitHub card data
    const cardData = {
      username: "sample-user",
      stats: {
        followers: 100,
        following: 50,
        repositories: 30,
        stars: 500,
      },
      languages: {
        JavaScript: 60,
        TypeScript: 25,
        HTML: 10,
        CSS: 5,
      },
      repositories: [
        {
          name: "awesome-project",
          description: "An awesome project",
          stars: 250,
          forks: 50,
        },
        {
          name: "cool-app",
          description: "A really cool app",
          stars: 150,
          forks: 30,
        },
      ],
    };

    const [shareLink] = await db
      .insert(shareLinks)
      .values({
        userId: user.id,
        linkToken,
        cardData,
        expiresAt,
        isActive: true,
      })
      .returning();

    console.log("Created sample share link:", {
      id: shareLink.id,
      linkToken: shareLink.linkToken,
      expiresAt: shareLink.expiresAt,
    });

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
