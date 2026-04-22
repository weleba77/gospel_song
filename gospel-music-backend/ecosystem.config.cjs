module.exports = {
  apps: [{
    name: "gospel-music-backend",
    script: "./index.js",
    instances: 2,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
    },
    env_development: {
      NODE_ENV: "development",
    },
    // Optimization: Restart if memory exceeds 1GB
    max_memory_restart: "1G",
    // Performance: Small delay between restarts to prevent crash loops
    exp_backoff_restart_delay: 500
  }]
}
