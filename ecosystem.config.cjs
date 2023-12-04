module.exports = {
  apps: [
    {
      name: "best-store-backend",
      script: "server.js",
      instances: 0,
      max_memory_restart: "300M",
      node_args: "--max-old-space-size=4096",
      // Logging
      out_file: "./out.log",
      error_file: "./error.log",
      merge_logs: true,
      log_date_format: "DD-MM HH:mm:ss Z",
      log_type: "json",

      // Env Specific Config
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
        exec_mode: "cluster_mode",
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 5000,
        watch: true,
        watch_delay: 3000,
        ignore_watch: [
          "./.vscode",
          "./db",
          "./node_modules",
          "./test",
          "./package.json",
          "./yarn.lock",
          "./error.log",
          "./out.log",
          "./.git",
        ],
      },
    },
  ],
};
