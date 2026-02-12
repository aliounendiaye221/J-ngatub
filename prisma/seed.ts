import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database (PostgreSQL)...');

    // Create levels
    const bfem = await prisma.level.upsert({
        where: { slug: 'bfem' },
        update: {},
        create: {
            slug: 'bfem',
            name: 'BFEM',
        },
    });

    const bac = await prisma.level.upsert({
        where: { slug: 'bac' },
        update: {},
        create: {
            slug: 'bac',
            name: 'BAC',
        },
    });

    console.log('✅ Levels created');

    // Create subjects
    const subjects = [
        { slug: 'mathematiques', name: 'Mathématiques' },
        { slug: 'physique-chimie', name: 'Physique-Chimie' },
        { slug: 'svt', name: 'SVT' },
        { slug: 'francais', name: 'Français' },
        { slug: 'anglais', name: 'Anglais' },
        { slug: 'histoire-geo', name: 'Histoire-Géographie' },
        { slug: 'philosophie', name: 'Philosophie' },
    ];

    for (const subject of subjects) {
        await prisma.subject.upsert({
            where: { slug: subject.slug },
            update: {},
            create: subject,
        });
    }

    console.log('✅ Subjects created');

    // Get subjects for documents
    const maths = await prisma.subject.findUnique({ where: { slug: 'mathematiques' } });
    const pc = await prisma.subject.findUnique({ where: { slug: 'physique-chimie' } });
    const svt = await prisma.subject.findUnique({ where: { slug: 'svt' } });
    const francais = await prisma.subject.findUnique({ where: { slug: 'francais' } });

    // Create sample documents for BFEM
    const bfemDocs = [
        {
            title: 'Mathématiques BFEM 2023',
            year: 2023,
            type: 'SUBJECT',
            pdfUrl: 'https://example.com/bfem-maths-2023.pdf',
            isPremium: false,
            levelId: bfem.id,
            subjectId: maths!.id,
        },
        {
            title: 'Corrigé Mathématiques BFEM 2023',
            year: 2023,
            type: 'CORRECTION',
            pdfUrl: 'https://example.com/bfem-maths-2023-corrige.pdf',
            isPremium: false, // Tous les PDF sont gratuits
            levelId: bfem.id,
            subjectId: maths!.id,
        },
    ];

    // Create sample documents for BAC
    const bacDocs = [
        {
            title: 'Mathématiques BAC S2 2023',
            year: 2023,
            type: 'SUBJECT',
            pdfUrl: 'https://example.com/bac-maths-2023.pdf',
            isPremium: false,
            levelId: bac.id,
            subjectId: maths!.id,
        },
        {
            title: 'Corrigé Mathématiques BAC S2 2023',
            year: 2023,
            type: 'CORRECTION',
            pdfUrl: 'https://example.com/bac-maths-2023-corrige.pdf',
            isPremium: false, // Tous les PDF sont gratuits
            levelId: bac.id,
            subjectId: maths!.id,
        },
    ];

    for (const doc of [...bfemDocs, ...bacDocs]) {
        await prisma.document.create({
            data: doc,
        });
    }

    console.log('✅ Documents created');

    // Create admin user with hashed password
    const adminPassword = await bcrypt.hash('admin123', 12);
    await prisma.user.upsert({
        where: { email: 'admin@jangatub.com' },
        update: {},
        create: {
            email: 'admin@jangatub.com',
            name: 'Admin',
            password: adminPassword,
            role: 'ADMIN',
            isPremium: true,
        },
    });

    console.log('✅ Admin user created');

    // ─── Badges ─────────────────────────────────────────────────
    const badges = [
        {
            name: "first_quiz",
            description: "Premier quiz complété",
            icon: "🎯",
            condition: "Compléter votre premier quiz",
        },
        {
            name: "perfect_score",
            description: "Score parfait !",
            icon: "🏆",
            condition: "Obtenir 100% à un quiz",
        },
        {
            name: "excellent",
            description: "Excellent résultat",
            icon: "⭐",
            condition: "Obtenir 90%+ à un quiz",
        },
        {
            name: "quiz_master",
            description: "Maître des quiz",
            icon: "🧠",
            condition: "Compléter 10 quiz",
        },
        {
            name: "dedicated_learner",
            description: "Apprenant assidu",
            icon: "📚",
            condition: "Compléter 25 quiz",
        },
        {
            name: "multi_subject",
            description: "Polyvalent",
            icon: "🌟",
            condition: "Compléter des quiz dans 3+ matières",
        },
    ];

    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { name: badge.name },
            update: {},
            create: badge,
        });
    }

    console.log('✅ Badges created');
    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
