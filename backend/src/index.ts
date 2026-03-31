import { app } from './app';
import { PORT } from './config';
import { startJobQueueWorker } from './services/jobQueue';

startJobQueueWorker();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
