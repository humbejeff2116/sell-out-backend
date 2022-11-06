
module.exports = {
  apps : [
    {
      name   : "gateway_service",
      script : "API-gateway/gateway.js",
      env_production: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
      }
    },
    {
      name   : "account_service",
      script : "account-service/loginserver.js",
      env_production: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
      }
    },
    {
      name   : "product_service",
      script : "product-service/productserver.js",
      env_production: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
      }
    },
    {
      name   : "order_service",
      script : "order-service/orderServer.js",
      env_production: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
      }
    },
    {
      name   : "fees_service",
      script : "fees-service/feesServer.js",
      env_production: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
      }
    },
    {
      name   : "data_merger_service",
      script : "data-merger-service/dataMergerServer.js",
      env_production: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
      }
    }
  ]
}


// # Start all applications
// pm2 start ecosystem.config.js

// # Stop all
// pm2 stop ecosystem.config.js

// # Restart all
// pm2 restart ecosystem.config.js

// # Reload all
// pm2 reload ecosystem.config.js

// # Delete all
// pm2 delete ecosystem.config.js

//#specific proccess

// pm2 start   ecosystem.config.js --only api-app
// You can even specify multiple apps to be acted on by specifying each app name separated by a comma:

// pm2 start ecosystem.config.js --only "api-app,worker-app"


//#env

// pm2 start process.json --env production
// pm2 restart process.json --env development