const fs = require('fs');
const path = require('path');

const corrections = {
  '/cards/': '/Cards/',
  '/inputs/': '/Inputs/',
  '/Layouts/': '/layouts/',
  '/Loader/': '/loader/',
  '/ui/button': '/ui/Button',
  '/ui/badge': '/ui/Badge',
  '/ui/input': '/ui/Input',
  '/ui/label': '/ui/Label',
  '/ui/skeleton': '/ui/Skeleton'
};

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [bad, good] of Object.entries(corrections)) {
        if (content.includes(bad)) {
          content = content.split(bad).join(good);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed', fullPath);
      }
    }
  }
}

walk('b:/Mini_Project_SET/frontend/interview-prep-ai/src');
