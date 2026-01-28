/**
 * Script to assign admin role to a user by email
 * 
 * Usage:
 *   npx tsx scripts/assign-admin.ts <email>
 * 
 * Example:
 *   npx tsx scripts/assign-admin.ts admin@example.com
 */

import { prisma } from "../lib/db";

async function assignAdmin(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (!user) {
      console.error(`❌ User with email "${email}" not found.`);
      process.exit(1);
    }
    
    if (user.role === "admin") {
      console.log(`✅ User "${email}" is already an admin.`);
      await prisma.$disconnect();
      process.exit(0);
    }
    
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { role: "admin" },
    });
    
    console.log(`✅ Successfully assigned admin role to "${email}"`);
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
  console.log("Usage: npx tsx scripts/assign-admin.ts <email>");
  process.exit(1);
}

assignAdmin(email);
