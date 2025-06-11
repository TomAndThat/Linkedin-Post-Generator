// src/utils/cleanup.js
import fs from "fs";
import path from "path";
import cron from "node-cron";

const UPLOADS_DIR = path.resolve("uploads");
const MAX_FILE_AGE_MINUTES = 10;

export default function startCleanupJob() {
  cron.schedule("*/10 * * * *", () => {
    const now = Date.now();

    fs.readdir(UPLOADS_DIR, (err, files) => {
      if (err) {
        console.error("Error reading uploads directory:", err);
        return;
      }

      let deleted = 0;

      files.forEach((file) => {
        const filePath = path.join(UPLOADS_DIR, file);

        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error(`Error getting stats for ${filePath}:`, err);
            return;
          }

          const ageMinutes = (now - stats.mtimeMs) / 1000 / 60;
          if (ageMinutes > MAX_FILE_AGE_MINUTES) {
            fs.unlink(filePath, (err) => {
              if (!err) deleted++;
            });
          }
        });
      });

      console.log(
        `[Cleanup] Checked ${files.length} files, deleted ${deleted}`
      );
    });
  });

  console.log(
    `[Cleanup] Cron job started. Files older than ${MAX_FILE_AGE_MINUTES} minutes will be deleted.`
  );
}
