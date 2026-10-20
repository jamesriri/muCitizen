import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import * as bcrypt from "bcryptjs";
import { config as loadEnv } from "dotenv";
import ws from "ws";
import { SEED_CATEGORIES } from "./fixtures";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../src/lib/config/demo-accounts";

loadEnv({ path: [".env.local", ".env"] });
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED is required to run the seed");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function main() {
  console.log("Executing idempotent seed against Neon Database...");

  await prisma.auditLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const admin = await prisma.user.create({
    data: {
      email: DEMO_ACCOUNTS.admin.email,
      fullName: "Purity Mwaura",
      passwordHash: defaultPasswordHash,
      role: "SUPER_ADMIN",
      nationalId: "10238948",
    },
  });

  const officer = await prisma.user.create({
    data: {
      email: DEMO_ACCOUNTS.officer.email,
      fullName: "Martin Rukunga",
      passwordHash: defaultPasswordHash,
      role: "OFFICER",
      nationalId: "27383889",
    },
  });

  const citizen = await prisma.user.create({
    data: {
      email: DEMO_ACCOUNTS.citizen.email,
      fullName: "Jane Wanjiku Mwangi",
      passwordHash: defaultPasswordHash,
      role: "CITIZEN",
      nationalId: "46293794",
    },
  });

  console.log("Personas seeded successfully.");

  for (const cat of SEED_CATEGORIES) {
    await prisma.category.create({ data: cat });
  }
  console.log("Municipal categories seeded.");

  const streetlightCat = await prisma.category.findUniqueOrThrow({
    where: { slug: "broken-streetlight" },
  });
  const waterCat = await prisma.category.findUniqueOrThrow({
    where: { slug: "water-drainage" },
  });

  const now = new Date();
  const slaDueDate = (hours: number) =>
    new Date(now.getTime() + hours * 3600 * 1000);

  await prisma.serviceRequest.create({
    data: {
      referenceNumber: "SR-202610-8A190",
      title: "Broken streetlight pole after thunderstorm",
      description:
        "The pole at Corner 4th Avenue is tilted and flickering violently since last night.",
      status: "PENDING",
      priority: "HIGH",
      locationAddress: "Corner 4th Ave & Mama Ngina st., Murang'a",
      latitude: -1.286389,
      longitude: 36.817223,
      slaDueDate: slaDueDate(48),
      categoryId: streetlightCat.id,
      citizenId: citizen.id,
      attachments: {
        create: [
          {
            fileName: "tilted-lamp-post.jpg",
            fileUrl:
              "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80",
            fileSize: 1048576,
            mimeType: "image/jpeg",
          },
        ],
      },
      auditLogs: {
        create: [
          {
            actorId: citizen.id,
            action: "CREATED",
            toStatus: "PENDING",
            comment: "Request registered by citizen.",
            isInternal: false,
          },
        ],
      },
    },
  });

  await prisma.serviceRequest.create({
    data: {
      referenceNumber: "SR-202610-4B921",
      title: "Burst clean water supply line flooding footpath",
      description:
        "Fresh water gushing from underground pipe near primary school gate.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      locationAddress: "Harambee Avenue, Opposite City Primary",
      latitude: -1.2842,
      longitude: 36.8225,
      slaDueDate: slaDueDate(16),
      categoryId: waterCat.id,
      citizenId: citizen.id,
      assignedToId: officer.id,
      auditLogs: {
        create: [
          {
            actorId: citizen.id,
            action: "CREATED",
            toStatus: "PENDING",
            comment: "Incident reported.",
          },
          {
            actorId: admin.id,
            action: "STATUS_CHANGE",
            fromStatus: "PENDING",
            toStatus: "IN_PROGRESS",
            comment: "Assigned to Rapid Response Unit.",
          },
        ],
      },
    },
  });
}

async function runSeed() {
  try {
    await main();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void runSeed();
