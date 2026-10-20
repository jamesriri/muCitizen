import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    buckets: {
      "service-attachments": {
        access: "public_read",
      },
    },
  },
});
