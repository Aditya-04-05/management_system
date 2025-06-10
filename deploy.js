const { spawn } = require('child_process');
const path = require('path');

console.log('Starting deployment process...');

// Run database initialization
console.log('Initializing database...');
const initDb = spawn('node', [path.join(__dirname, 'server', 'init-db.js')]);

initDb.stdout.on('data', (data) => {
  console.log(`DB Init: ${data}`);
});

initDb.stderr.on('data', (data) => {
  console.error(`DB Init Error: ${data}`);
});

initDb.on('close', (code) => {
  console.log(`Database initialization process exited with code ${code}`);
  
  if (code === 0) {
    console.log('Starting server...');
    // Start the server
    const server = spawn('node', [path.join(__dirname, 'server', 'server.js')]);
    
    server.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });
    
    server.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });
    
    server.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });
  } else {
    console.error('Database initialization failed. Server will not start.');
    process.exit(1);
  }
});