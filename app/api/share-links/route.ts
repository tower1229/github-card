import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { shareLinks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateUserContribution } from "@/lib/leaderboard";
import { withServerAuth } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  return withServerAuth(async (req: NextRequest, userId: string) => {
    try {
      console.log("Processing share link request for userId:", userId);

      let body;
      try {
        body = await req.json();
        console.log("Request body received:", JSON.stringify(body));
      } catch (parseError) {
        console.error("Failed to parse request body:", parseError);
        return NextResponse.json(
          {
            error: "Invalid request body",
            message: "Could not parse request JSON",
          },
          { status: 400 }
        );
      }

      if (!body.cardData) {
        return NextResponse.json(
          { error: "Card data is required" },
          {
            status: 400,
          }
        );
      }

      // 验证 cardData 是有效的 JSON 对象
      try {
        // 通过序列化和反序列化来确保它是有效的 JSON
        const validatedCardData = JSON.parse(JSON.stringify(body.cardData));
        body.cardData = validatedCardData;
        console.log("Validated cardData:", typeof body.cardData);
      } catch (jsonError) {
        console.error("无效的 cardData JSON 格式:", jsonError);
        return NextResponse.json(
          { error: "Invalid card data format", message: String(jsonError) },
          { status: 400 }
        );
      }

      // 提取贡献数据并更新排行榜
      try {
        // 处理可能的不同贡献数据格式
        let contributionScore = null;

        // 检查新格式：contributionScore
        if (
          body.cardData?.contributionScore &&
          typeof body.cardData.contributionScore === "number"
        ) {
          contributionScore = body.cardData.contributionScore;
          console.log("Using contributionScore:", contributionScore);
        }
        // 检查旧格式：contributions.total
        else if (
          body.cardData?.contribution_score &&
          typeof body.cardData.contribution_score === "number"
        ) {
          contributionScore = body.cardData.contribution_score;
          console.log("Using legacy contribution_score:", contributionScore);
        }
        // 检查最旧格式：contributions.total
        else if (body.cardData?.contributions?.total) {
          contributionScore =
            typeof body.cardData.contributions.total === "number"
              ? body.cardData.contributions.total
              : parseInt(body.cardData.contributions.total);
          console.log("Using contributions.total:", contributionScore);
        }

        if (contributionScore !== null) {
          if (isNaN(contributionScore)) {
            console.warn("贡献数据不是有效数字:", contributionScore);
          } else {
            console.log(
              "Updating contribution leaderboard with score:",
              contributionScore
            );
            // 更新贡献排行榜
            await updateUserContribution(userId, contributionScore);
          }
        } else {
          console.log("No contribution data found in the request");
        }
      } catch (error) {
        console.error("更新贡献排行榜失败:", error);
        // 继续处理，不中断主流程
      }

      // 计算过期时间（30天后）
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      console.log("Expiration date set to:", expiresAt);

      // Generate a random token
      const token = uuidv4();
      console.log("Generated token:", token);

      // Check for database URL before attempting insertion
      console.log("Database URL available:", !!process.env.DATABASE_URL);

      try {
        console.log("Preparing to insert data into shareLinks table");
        console.log("Template type:", body.templateType || "contribute");
        console.log(
          "Data to be inserted: userId:",
          userId,
          "templateType:",
          body.templateType || "contribute"
        );

        // Log the database connection object (safely)
        console.log("Database connection exists:", !!db);
        console.log("ShareLinks table exists:", !!shareLinks);

        const result = await db
          .insert(shareLinks)
          .values({
            userId,
            linkToken: token,
            cardData: body.cardData,
            expiresAt,
            templateType: body.templateType || "contribute",
          })
          .returning();

        console.log("Database insertion successful, result:", result);
      } catch (error) {
        // Type assertion for the error object
        const dbError = error as { code?: string; stack?: string };

        console.error("数据库插入失败 - 详细错误:", dbError);

        if (dbError.stack) {
          console.error("错误堆栈:", dbError.stack);
        }

        // Check for specific error types
        if (dbError.code) {
          console.error("Database error code:", dbError.code);
        }

        return NextResponse.json(
          {
            error: "Database insertion failed",
            message: String(error),
            code: dbError.code || "UNKNOWN",
          },
          { status: 500 }
        );
      }

      // 获取baseUrl，确保它包含协议
      const baseUrl = process.env.NEXTAUTH_URL || "";

      return NextResponse.json({
        shareUrl: `${baseUrl}/shared/${token}`,
        expiresAt,
      });
    } catch (error) {
      console.error("创建分享链接失败:", error);
      // 确保返回正确格式的错误响应
      return NextResponse.json(
        { error: "Internal Server Error", message: String(error) },
        {
          status: 500,
        }
      );
    }
  }, request);
}

export async function GET(request: NextRequest) {
  return withServerAuth(async (req: NextRequest, userId: string) => {
    try {
      // Get all share links for the user
      const userShareLinks = await db
        .select()
        .from(shareLinks)
        .where(eq(shareLinks.userId, userId))
        .orderBy(shareLinks.createdAt);

      // 获取baseUrl
      const baseUrl = process.env.NEXTAUTH_URL || "";

      // Return the share links
      return NextResponse.json(
        userShareLinks.map((link) => ({
          id: link.id,
          linkToken: link.linkToken,
          createdAt: link.createdAt,
          expiresAt: link.expiresAt,
          isActive: link.isActive,
          templateType: link.templateType,
          shareUrl: `${baseUrl}/shared/${link.linkToken}`,
        }))
      );
    } catch (error) {
      console.error("Error retrieving share links:", error);
      return NextResponse.json(
        { error: "Failed to retrieve share links", message: String(error) },
        { status: 500 }
      );
    }
  }, request);
}
