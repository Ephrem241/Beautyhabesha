/**
 * Script to create a new admin user with username and password
 * 
 * Usage:
 *   npx tsx scripts/create-admin.ts <username> <email> <password>
 * 
 * Example:
 *   npx tsx scripts/create-admin.ts admin admin@example.com SecurePassword123
 */

import { prisma } from "../lib/db";
import bcrypt from "bcrypt";

async function createAdmin(username: string, email: string, password: string) {
  try {
    console.log("🔐 Creating admin user...\n");

    // Validate inputs
    if (!username || !email || !password) {
      console.error("❌ All fields are required: username, email, password");
      process.exit(1);
    }

    if (password.length < 8) {
      console.error("❌ Password must be at least 8 characters long");
      process.exit(1);
    }

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: normalizedUsername },
          { email: normalizedEmail },
        ],
      },
    });

    if (existingUser) {
      console.error(`❌ User already exists with this username or email`);
      console.log(`\n💡 If you want to make this user an admin, use:`);
      console.log(`   npx tsx scripts/assign-admin.ts ${normalizedEmail}`);
      process.exit(1);
    }

    // Hash password
    console.log("🔒 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    console.log("👤 Creating user in database...");
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        role: "admin",
        name: username,
      },
    });

    console.log("\n✅ Admin user created successfully!\n");
    console.log("📋 User Details:");
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Created: ${user.createdAt}\n`);

    console.log("🎉 Next steps:");
    console.log("   1. Go to /auth/login");
    console.log(`   2. Login with username: ${normalizedUsername}`);
    console.log(`   3. Use the password you provided`);
    console.log("   4. Access admin dashboard at /dashboard/admin/users\n");

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

const username = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!username || !email || !password) {
  console.error("❌ Missing required arguments\n");
  console.log("Usage: npx tsx scripts/create-admin.ts <username> <email> <password>\n");
  console.log("Example: npx tsx scripts/create-admin.ts admin admin@example.com SecurePassword123\n");
  console.log("Requirements:");
  console.log("   - Username: lowercase, unique");
  console.log("   - Email: valid email format, unique");
  console.log("   - Password: minimum 8 characters\n");
  process.exit(1);
}

createAdmin(username, email, password);

