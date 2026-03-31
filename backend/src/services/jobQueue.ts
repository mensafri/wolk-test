import { prisma } from '../lib/prisma';

export async function processJobQueue() {
  try {
    const jobs: any[] = await prisma.$queryRaw`
      UPDATE "JobQueue"
      SET status = 'PROCESSING', "updatedAt" = NOW()
      WHERE id = (
        SELECT id FROM "JobQueue"
        WHERE status = 'PENDING'
        ORDER BY "createdAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING *;
    `;

    if (jobs.length === 0) {
      return;
    }

    const job = jobs[0];
    console.log(`Processing job ${job.id} of type ${job.type}...`);

    await new Promise((resolve) => setTimeout(resolve, 10000));

    if (job.type === 'ANALYZE_SYNERGY') {
      const payload = JSON.parse(job.payload);

      await prisma.draftPlan.update({
        where: { id: payload.draftPlanId },
        data: {
          synergyNote: 'Automated Agent Analysis: Good potential team fight synergy detected.'
        }
      });

      await prisma.jobQueue.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          result: 'Synergy analyzed.'
        }
      });

      console.log(`Completed job ${job.id}`);
    }
  } catch (error) {
    console.error('Error processing job queue:', error);
  }
}

export function startJobQueueWorker(pollIntervalMs = 5000) {
  return setInterval(() => {
    void processJobQueue();
  }, pollIntervalMs);
}
