const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Aditya/Desktop/WESTON INTERSHIP 3/client/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
files.forEach(f => {
  let content = fs.readFileSync(path.join(dir, f), 'utf8');
  content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
  content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
  fs.writeFileSync(path.join(dir, f), content);
});
console.log('Replaced all API endpoints successfully.');
