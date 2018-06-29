module.exports = {
  apps: [{
    name: 'gallmond',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'ec2-user',
      host: 'ec2-35-177-127-109.eu-west-2.compute.amazonaws.com',
      key: '~/.ssh/id_rsa.pem',
      ref: 'origin/master',
      repo: 'git@github.com:Gallmond/gallmondnet.git',
      path: '/home/ec2-user/projects/gallmondnet',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
