import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  ["Doctors", "doctors"],
  ["Chemists", "chemists"],
  ["Nurses", "nurses"],
  ["Caregivers", "caregivers"],
  ["Electricians", "electricians"],
  ["Plumbers", "plumbers"],
  ["Medical Equipment", "medical-equipment"],
  ["Physiotherapists", "physiotherapists"],
  ["Home Services", "home-services"]
];

async function main() {
  for (const [name, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug, description: `Trusted ${name.toLowerCase()} serving Bandra and Khar.` }
    });
  }

  const doctorCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "doctors" } });
  const chemistCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "chemists" } });
  const nurseCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "nurses" } });
  const plumberCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "plumbers" } });

  const vendors = [
    {
      categoryId: doctorCategory.id,
      name: "Dr. Meera Shah",
      phone: "+919820000001",
      whatsapp: "+919820000001",
      address: "Linking Road, Khar West",
      description: "General physician available for senior-friendly home consultations.",
      yearsExperience: 18
    },
    {
      categoryId: chemistCategory.id,
      name: "Noble Chemist Khar",
      phone: "+919820000004",
      whatsapp: "+919820000004",
      address: "Khar West, near Station",
      description: "24/7 medical store offering senior priority home delivery of medicines.",
      yearsExperience: 15
    },
    {
      categoryId: nurseCategory.id,
      name: "Seva Home Nursing",
      phone: "+919820000002",
      whatsapp: "+919820000002",
      address: "Bandra West",
      description: "Day and night nursing support for elderly care.",
      yearsExperience: 11
    },
    {
      categoryId: plumberCategory.id,
      name: "Reliable Plumbing Khar",
      phone: "+919820000003",
      whatsapp: "+919820000003",
      address: "Khar Danda Road",
      description: "Emergency plumbing visits and senior-priority appointments.",
      yearsExperience: 9
    }
  ];

  for (const vendor of vendors) {
    await prisma.vendor.upsert({
      where: { id: `${vendor.phone}-seed` },
      update: {},
      create: {
        ...vendor,
        id: `${vendor.phone}-seed`,
        status: "APPROVED",
        buddhiVerified: true,
        averageRating: 4.8,
        reviewCount: 12,
        checklist: {
          create: {
            identityVerified: "PASSED",
            addressVerified: "PASSED",
            licenseVerified: "PASSED",
            referencesChecked: "PASSED",
            serviceQualityApproved: "PASSED",
            notes: "Seed verified vendor"
          }
        }
      }
    });
  }

  await prisma.supportNumber.upsert({
    where: { id: "primary-support" },
    update: {},
    create: {
      id: "primary-support",
      label: "Buddhi Support Desk",
      phone: process.env.SUPPORT_PHONE || "+912212345678",
      whatsapp: process.env.SUPPORT_WHATSAPP || "+919876543210",
      isPrimary: true
    }
  });

  await prisma.admin.upsert({
    where: { email: "admin@buddhi.local" },
    update: {},
    create: {
      fullName: "Buddhi Admin",
      email: "admin@buddhi.local",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12)
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
