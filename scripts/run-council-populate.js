const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting UK Borough Council population script...');

const scriptPath = path.join(__dirname, 'populate-uk-councils.ts');
const tsxProcess = spawn('npx', ['tsx', scriptPath], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

tsxProcess.on('close', code => {
  if (code === 0) {
    console.log('✅ UK Borough Council data populated successfully!');
  } else {
    console.error(`❌ Script exited with code ${code}`);
  }
});

tsxProcess.on('error', error => {
  console.error('❌ Error running script:', error);
});
