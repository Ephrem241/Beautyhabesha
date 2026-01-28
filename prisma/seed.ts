import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env file
config({ path: resolve(__dirname, "../.env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning existing data...");
  await prisma.subscription.deleteMany();
  await prisma.escortProfile.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.user.deleteMany();

  // Create Plans
  console.log("📦 Creating plans...");
  await prisma.plan.create({
    data: {
      name: "Normal",
      price: 0,
      durationDays: 0,
      features: ["Public profile listing", "Up to 3 photos", "Standard listing position", "Basic support"],
      priority: 1,
    },
  });

  await prisma.plan.create({
    data: {
      name: "VIP",
      price: 1500,
      durationDays: 30,
      features: ["Priority listing position", "Up to 10 photos", "Verification badge", "Priority support"],
      priority: 2,
    },
  });

  await prisma.plan.create({
    data: {
      name: "Platinum",
      price: 3500,
      durationDays: 30,
      features: ["Top listing position", "Unlimited photos", "Home page feature", "Dedicated support"],
      priority: 3,
    },
  });

  console.log("✅ Plans created");

  // Hash password for all users
  const defaultPassword = "password123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Create Users
  console.log("👥 Creating users...");
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin One",
      role: "admin",
      currentPlan: "Platinum",
    },
  });

  const escortUser1 = await prisma.user.create({
    data: {
      email: "mimi@example.com",
      password: hashedPassword,
      name: "Mimi",
      role: "escort",
      currentPlan: "VIP",
    },
  });

  const escortUser2 = await prisma.user.create({
    data: {
      email: "hana@example.com",
      password: hashedPassword,
      name: "Hana",
      role: "escort",
      currentPlan: "VIP",
    },
  });

  const escortUser3 = await prisma.user.create({
    data: {
      email: "sara@example.com",
      password: hashedPassword,
      name: "Sara",
      role: "escort",
      currentPlan: "Platinum",
    },
  });

  const basicUser = await prisma.user.create({
    data: {
      email: "user1@example.com",
      password: hashedPassword,
      name: "Basic User",
      role: "user",
      currentPlan: "Normal",
    },
  });

  console.log("✅ Users created");

  // Create Escort Profiles
  console.log("💼 Creating escort profiles...");
  await prisma.escortProfile.create({
    data: {
      userId: escortUser1.id,
      displayName: "Mimi Love",
      bio: "Friendly and professional. Available for companionship and social events.",
      city: "Addis Ababa",
      images: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      ],
      phone: "+251911111111",
      telegram: "mimi_escort",
      whatsapp: "+251911111111",
      status: "approved",
    },
  });

  await prisma.escortProfile.create({
    data: {
      userId: escortUser2.id,
      displayName: "Hana Rose",
      bio: "Discreet, respectful, and easygoing. Professional service with attention to detail.",
      city: "Bahir Dar",
      images: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400",
      ],
      phone: "+251922222222",
      telegram: "hana_rose",
      whatsapp: "+251922222222",
      status: "approved",
    },
  });

  await prisma.escortProfile.create({
    data: {
      userId: escortUser3.id,
      displayName: "Sara Elite",
      bio: "Premium companion for discerning clients. Elegant, sophisticated, and discreet.",
      city: "Addis Ababa",
      images: [
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      ],
      phone: "+251933333333",
      telegram: "sara_elite",
      whatsapp: "+251933333333",
      status: "approved",
    },
  });

  console.log("✅ Escort profiles created");

  // Create Subscriptions
  console.log("💳 Creating subscriptions...");
  const now = new Date();
  const vipEndDate = new Date(now);
  vipEndDate.setDate(vipEndDate.getDate() + 30);

  const platinumEndDate = new Date(now);
  platinumEndDate.setDate(platinumEndDate.getDate() + 30);

  await prisma.subscription.create({
    data: {
      userId: escortUser1.id,
      planId: "VIP",
      status: "active",
      paymentMethod: "bank",
      paymentProofUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      paymentProofPublicId: "payments/proof-001",
      startDate: now,
      endDate: vipEndDate,
    },
  });

  await prisma.subscription.create({
    data: {
      userId: escortUser2.id,
      planId: "VIP",
      status: "active",
      paymentMethod: "mobile_money",
      paymentProofUrl:
        "https://images.unsplash.com/photo-1523287562758-66c7fc58967a?w=800",
      paymentProofPublicId: "payments/proof-002",
      startDate: now,
      endDate: vipEndDate,
    },
  });

  await prisma.subscription.create({
    data: {
      userId: escortUser3.id,
      planId: "Platinum",
      status: "active",
      paymentMethod: "bank",
      paymentProofUrl:
        "https://images.unsplash.com/photo-1518544887688-4e3f7bdff1ab?w=800",
      paymentProofPublicId: "payments/proof-003",
      startDate: now,
      endDate: platinumEndDate,
    },
  });

  // Create a pending subscription
  await prisma.subscription.create({
    data: {
      userId: basicUser.id,
      planId: "VIP",
      status: "pending",
      paymentMethod: "bank",
      paymentProofUrl:
        "https://images.unsplash.com/photo-1522202222206-3f8e5b3e922e?w=800",
      paymentProofPublicId: "payments/proof-004",
    },
  });

  console.log("✅ Subscriptions created");

  console.log("\n✨ Seeding completed successfully!");
  console.log("\n📝 Sample login credentials:");
  console.log("   Admin: admin@example.com / password123");
  console.log("   Escort: mimi@example.com / password123");
  console.log("   User: user1@example.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
