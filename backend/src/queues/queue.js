import { Queue } from "bullmq";

export const taskQueue = new Queue("task-queue", {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});
console.log("QUEUE CONNECTED:"
//   , {
//   host: REDIS_HOST,
//   port: REDIS_PORT,
// }
);
