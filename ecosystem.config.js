module.exports = {
  apps : [{
    name: 'checkout',
    script: 'npm run production',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
