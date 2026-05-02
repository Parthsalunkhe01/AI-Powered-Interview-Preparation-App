const fs = require('fs');
const path = require('path');

const corrections = {
  'components/ui/button': 'components/ui/Button',
  'components/ui/badge': 'components/ui/Badge',
  'components/ui/input': 'components/ui/Input',
  'components/ui/label': 'components/ui/Label',
  'components/ui/skeleton': 'components/ui/Skeleton',
  'components/ui/SkeletonCard': 'components/ui/SkeletonCard',
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
        const regex = new RegExp(bad, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, good);
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
