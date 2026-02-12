/**
 * Script to diagnose admin login issues
 * 
 * This script checks:
 * 1. If any admin users exist in the database
 * 2. User account details (banned status, password hash, etc.)
 * 3. Database connectivity
 * 
 * Usage:
 *   npx tsx scripts/diagnose-admin-login.ts [username-or-email]
 * 
 * Examples:
 *   npx tsx scripts/diagnose-admin-login.ts
 *   npx tsx scripts/diagnose-admin-login.ts admin
 *   npx tsx scripts/diagnose-admin-login.ts admin@example.com
 */

import { prisma } from "../lib/db";
import bcrypt from "bcrypt";

async function diagnoseAdminLogin(identifier?: string) {
  try {
    console.log("🔍 Starting admin login diagnostics...\n");

    // Test 1: Database connectivity
    console.log("📡 Test 1: Database Connectivity");
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("✅ Database connection successful\n");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      console.log("\n💡 Fix: Ensure DATABASE_URL is set correctly in .env or Vercel");
      await prisma.$disconnect();
      process.exit(1);
    }

    // Test 2: Check for admin users
    console.log("👥 Test 2: Admin Users in Database");
    const adminUsers = await prisma.user.findMany({
      where: { role: "admin" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        bannedAt: true,
        password: true,
        createdAt: true,
      },
    });

    if (adminUsers.length === 0) {
      console.log("❌ No admin users found in database\n");
      console.log("💡 Solution: Create an admin user using one of these methods:\n");
      console.log("   Method 1: Assign admin role to existing user");
      console.log("   npx tsx scripts/assign-first-admin.ts <email>\n");
      console.log("   Method 2: Create new user and assign admin role");
      console.log("   1. Register at /auth/register");
      console.log("   2. Run: npx tsx scripts/assign-first-admin.ts <your-email>\n");
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):\n`);
      adminUsers.forEach((user, index) => {
        console.log(`   Admin ${index + 1}:`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Username: ${user.username || "N/A"}`);
        console.log(`   - Email: ${user.email || "N/A"}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Has Password: ${user.password ? "✅ Yes" : "❌ No (OAuth user)"}`);
        console.log(`   - Banned: ${user.bannedAt ? `❌ Yes (since ${user.bannedAt})` : "✅ No"}`);
        console.log(`   - Created: ${user.createdAt}`);
        console.log("");
      });
    }

    // Test 3: Check specific user if provided
    if (identifier) {
      console.log(`🔍 Test 3: Checking specific user: "${identifier}"`);
      
      const normalizedIdentifier = identifier.toLowerCase().trim();
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: normalizedIdentifier },
            { email: normalizedIdentifier },
          ],
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          bannedAt: true,
          password: true,
          createdAt: true,
        },
      });

      if (!user) {
        console.log(`❌ User "${identifier}" not found\n`);
        console.log("💡 Available options:");
        console.log("   1. Check the username/email spelling");
        console.log("   2. Create account at /auth/register");
        console.log("   3. List all users: npx tsx scripts/list-users.ts\n");
      } else {
        console.log(`✅ User found:\n`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Username: ${user.username || "N/A"}`);
        console.log(`   - Email: ${user.email || "N/A"}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Has Password: ${user.password ? "✅ Yes" : "❌ No (OAuth user)"}`);
        console.log(`   - Banned: ${user.bannedAt ? `❌ Yes (since ${user.bannedAt})` : "✅ No"}`);
        console.log(`   - Created: ${user.createdAt}\n`);

        // Diagnose issues
        const issues: string[] = [];
        if (user.role !== "admin") {
          issues.push(`Role is "${user.role}" instead of "admin"`);
        }
        if (!user.password) {
          issues.push("No password set (OAuth user cannot use credentials login)");
        }
        if (user.bannedAt) {
          issues.push(`User is banned since ${user.bannedAt}`);
        }

        if (issues.length > 0) {
          console.log("⚠️  Issues preventing admin login:");
          issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
          });
          console.log("");

          // Provide fixes
          console.log("💡 Fixes:");
          if (user.role !== "admin") {
            console.log(`   - Assign admin role: npx tsx scripts/assign-admin.ts ${user.email || user.username}`);
          }
          if (!user.password) {
            console.log("   - OAuth users cannot use credentials login");
            console.log("   - Create a new account with username/password instead");
          }
          if (user.bannedAt) {
            console.log("   - Unban user from admin dashboard or database");
          }
          console.log("");
        } else {
          console.log("✅ No issues found - user should be able to login as admin\n");
        }
      }
    }

    // Test 4: Environment variables
    console.log("🔐 Test 4: Environment Variables");
    const envVars = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ Missing",
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
    };
    
    console.log(`   - NEXTAUTH_SECRET: ${envVars.NEXTAUTH_SECRET}`);
    console.log(`   - NEXTAUTH_URL: ${envVars.NEXTAUTH_URL}`);
    console.log(`   - DATABASE_URL: ${envVars.DATABASE_URL}\n`);

    console.log("✅ Diagnostics complete!\n");
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during diagnostics:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

const identifier = process.argv[2];
diagnoseAdminLogin(identifier);

