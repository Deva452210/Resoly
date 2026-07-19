const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { regex: /bg-purple-500/g, replacement: 'bg-white' },
  { regex: /ring-purple-500/g, replacement: 'ring-gray-400' },
  { regex: /border-purple-800/g, replacement: 'border-gray-700' },
  { regex: /border-blue-800/g, replacement: 'border-gray-700' },
  { regex: /text-purple-500\/70/g, replacement: 'text-gray-400' },
  { regex: /text-purple-200/g, replacement: 'text-gray-300' },
  { regex: /text-blue-100/g, replacement: 'text-gray-300' },
  { regex: /shadow-purple-[0-9]+\/[0-9]+/g, replacement: 'shadow-none' },
  { regex: /rgba\(168,85,247,0\.5\)/g, replacement: 'rgba(255,255,255,0.1)' },
  { regex: /rgba\(59,130,246,0\.5\)/g, replacement: 'rgba(255,255,255,0.1)' },
  { regex: /bg-blue-600/g, replacement: 'bg-white text-black' },
  { regex: /bg-blue-500/g, replacement: 'bg-gray-200' },
  { regex: /bg-purple-600/g, replacement: 'bg-white text-black' },
  { regex: /from-purple-600 to-indigo-600/g, replacement: 'bg-white text-black' },
  { regex: /hover:from-purple-500 hover:to-indigo-500/g, replacement: 'hover:bg-gray-200' },
  { regex: /border-purple-900\/50/g, replacement: 'border-gray-700' },
  { regex: /border-blue-900\/50/g, replacement: 'border-gray-700' },
  { regex: /bg-gradient-to-r /g, replacement: '' }
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      replacements.forEach(({ regex, replacement }) => {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log('Done!');
