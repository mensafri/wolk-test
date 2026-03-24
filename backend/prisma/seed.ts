import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Sample Draft Plan
  const plan1 = await prisma.draftPlan.create({
    data: {
      name: 'TI 13 Grand Finals Game 1',
      description: 'Test draft plan for the application',
      heroes: {
        create: [
          { heroId: 1, type: 'BAN', note: 'Too strong in current meta' }, // Anti-Mage usually id 1
          { heroId: 2, type: 'PREFERRED', role: 'Carry', priority: 'HIGH', note: 'Good synergy with our mid' }, // Axe usually id 2
        ]
      },
      enemyThreats: {
        create: [
          { heroId: 3, note: 'Bane nightmare sets up too easily' } // Bane usually id 3
        ]
      },
      itemTimings: {
        create: [
          { timing: 'BKB ~18 min', explanation: 'Crucial against their magic burst' }
        ]
      }
    }
  });

  console.log('Seed completed. Created draft plan:', plan1.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
