#!/usr/bin/env node

/**
 * Test Script for Real-time Blog Updates Setup
 * 
 * This script tests the basic setup of the real-time blog update system
 * by checking if all required services are running and accessible.
 */

const http = require('http');
const net = require('net');

// Configuration
const services = {
  frontend: { host: 'localhost', port: 3000, name: 'Frontend (Next.js)' },
  backend: { host: 'localhost', port: 3002, name: 'Backend (NestJS)' },
  kafka: { host: 'localhost', port: 9092, name: 'Kafka Broker' },
  kafkaUI: { host: 'localhost', port: 8080, name: 'Kafka UI' },
  mysql: { host: 'localhost', port: 3306, name: 'MySQL Database' }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * Check if a TCP port is open
 * @param {string} host - Host to check
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} - True if port is open
 */
function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 3000;

    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

/**
 * Check if an HTTP service is responding
 * @param {string} host - Host to check
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} - True if service is responding
 */
function checkHttpService(host, port) {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      timeout: 3000,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode < 500);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
}

/**
 * Test a single service
 * @param {Object} service - Service configuration
 * @returns {Promise<Object>} - Test result
 */
async function testService(service) {
  const { host, port, name } = service;
  
  console.log(`${colors.blue}Testing ${name}...${colors.reset}`);
  
  let isOnline = false;
  let responseTime = 0;
  
  const startTime = Date.now();
  
  if (port === 3000 || port === 3001 || port === 8080) {
    // HTTP services
    isOnline = await checkHttpService(host, port);
  } else {
    // TCP services
    isOnline = await checkPort(host, port);
  }
  
  responseTime = Date.now() - startTime;
  
  return {
    name,
    host,
    port,
    isOnline,
    responseTime
  };
}

/**
 * Display test results
 * @param {Array} results - Test results
 */
function displayResults(results) {
  console.log(`\n${colors.bold}=== Real-time Blog Updates Setup Test Results ===${colors.reset}\n`);
  
  let allOnline = true;
  
  results.forEach(result => {
    const status = result.isOnline ? 
      `${colors.green}✓ ONLINE${colors.reset}` : 
      `${colors.red}✗ OFFLINE${colors.reset}`;
    
    const time = result.responseTime < 1000 ? 
      `${colors.green}${result.responseTime}ms${colors.reset}` : 
      `${colors.yellow}${result.responseTime}ms${colors.reset}`;
    
    console.log(`${result.name.padEnd(20)} ${status} ${time}`);
    
    if (!result.isOnline) {
      allOnline = false;
    }
  });
  
  console.log(`\n${colors.bold}Overall Status: ${allOnline ? 
    `${colors.green}✓ ALL SERVICES RUNNING${colors.reset}` : 
    `${colors.red}✗ SOME SERVICES OFFLINE${colors.reset}`}`);
  
  if (!allOnline) {
    console.log(`\n${colors.yellow}To start the services:${colors.reset}`);
    console.log(`${colors.blue}1. Start Kafka and dependencies:${colors.reset}`);
    console.log(`   docker-compose up -d`);
    console.log(`${colors.blue}2. Start backend:${colors.reset}`);
    console.log(`   cd backend && npm run start:dev`);
    console.log(`${colors.blue}3. Start frontend:${colors.reset}`);
    console.log(`   cd frontend && npm run dev`);
  } else {
    console.log(`\n${colors.green}🎉 All services are running! You can now test real-time blog updates.${colors.reset}`);
    console.log(`\n${colors.blue}Access URLs:${colors.reset}`);
    console.log(`• Frontend: http://localhost:3000`);
    console.log(`• Backend API: http://localhost:3002`);
    console.log(`• Kafka UI: http://localhost:8080`);
  }
}

/**
 * Main test function
 */
async function main() {
  console.log(`${colors.bold}${colors.blue}Real-time Blog Updates Setup Test${colors.reset}\n`);
  console.log('Testing all required services for real-time blog updates...\n');
  
  const results = [];
  
  for (const service of Object.values(services)) {
    const result = await testService(service);
    results.push(result);
  }
  
  displayResults(results);
}

// Run the test
main().catch(console.error);
