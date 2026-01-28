/**
 * Script to assign admin role to the first user
 * This is a one-time setup script for the initial admin
 * 
 * Usage:
 *   npx tsx scripts/assign-first-admin.ts <email>
 * 
 * Example:
 *   npx tsx scripts/assign-first-admin.ts admin@example.com
 */

import { prisma } from "../lib/db";

async function assignFirstAdmin(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log(`🔍 Looking for user with email: ${normalizedEmail}...`);
    
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (!user) {
      console.error(`❌ User with email "${email}" not found.`);
      console.log("\n💡 Available options:");
      console.log("   1. Create a new account at /auth/register");
      console.log("   2. Sign in with Google OAuth to auto-create account");
      console.log("   3. Check the email address and try again");
      await prisma.$disconnect();
      process.exit(1);
    }
    
    if (user.role === "admin") {
      console.log(`✅ User "${email}" is already an admin.`);
      console.log("\n🎉 You can now:");
      console.log("   - Log in at /auth/login");
      console.log("   - Access admin dashboard at /dashboard/admin/users");
      console.log("   - Assign roles to other users from there");
      await prisma.$disconnect();
      process.exit(0);
    }
    
    console.log(`📝 Current role: ${user.role}`);
    console.log(`🔄 Updating role to admin...`);
    
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { role: "admin" },
    });
    
    console.log(`\n✅ Successfully assigned admin role to "${email}"`);
    console.log("\n🎉 Next steps:");
    console.log("   1. Log in at /auth/login with this email");
    console.log("   2. Go to /dashboard/admin/users");
    console.log("   3. You can now assign roles to other users from the admin panel");
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error assigning admin role:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address.");
  console.log("\nUsage: npx tsx scripts/assign-first-admin.ts <email>");
  console.log("\nExample: npx tsx scripts/assign-first-admin.ts admin@example.com");
  console.log("\n💡 Tip: Use an email that already exists in the database.");
  console.log("   You can create one by:");
  console.log("   - Registering at /auth/register");
  console.log("   - Or signing in with Google OAuth");
  process.exit(1);
}

assignFirstAdmin(email);
