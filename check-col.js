const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    log: ['error']
});

async function main() {
    console.log('Connecting...');
    console.log('URL prefix:', process.env.DATABASE_URL?.substring(0, 40) + '...');
    try {
        const result = await p.$queryRawUnsafe(
            "SELECT column_name FROM information_schema.columns WHERE table_name='Document'"
        );
        console.log('Columns in Document table:', result.map(r => r.column_name).join(', '));
    } catch (e) {
        console.log('ERROR:', e.message.substring(0, 200));
    } finally {
        await p.$disconnect();
    }
}

main();
