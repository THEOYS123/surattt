import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { execSync } from 'child_process';

async function pack() {
  console.log('--- Step 1: Building production dist ---');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('--- Step 2: Creating Netlify Dist Drop ZIP (suratttt-netlify-dist.zip) ---');
  const distZip = new JSZip();
  const distDir = path.resolve('dist');

  function addDirToZip(zipInstance, dirPath, zipPath = '') {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      const relZipPath = zipPath ? `${zipPath}/${item}` : item;
      if (stat.isDirectory()) {
        const folder = zipInstance.folder(relZipPath);
        addDirToZip(zipInstance, fullPath, relZipPath);
      } else {
        const fileData = fs.readFileSync(fullPath);
        zipInstance.file(relZipPath, fileData);
      }
    }
  }

  // Ensure _redirects is present in dist
  if (fs.existsSync('public/_redirects') && !fs.existsSync('dist/_redirects')) {
    fs.copyFileSync('public/_redirects', 'dist/_redirects');
  }

  addDirToZip(distZip, distDir);

  const distBuffer = await distZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync('suratttt-netlify-dist.zip', distBuffer);
  fs.writeFileSync('public/suratttt-netlify-dist.zip', distBuffer);
  console.log('Successfully generated suratttt-netlify-dist.zip (size: ' + (distBuffer.length / 1024).toFixed(1) + ' KB)');

  console.log('--- Step 3: Creating Full Project Source Code ZIP (suratttt-source-code.zip) ---');
  const srcZip = new JSZip();
  const ignoreList = ['node_modules', '.git', 'dist', 'suratttt-netlify-dist.zip', 'suratttt-source-code.zip', 'dist-netlify-drop.zip', 'surattt-netlify-dist.zip', 'surattt-source-code.zip', '.DS_Store'];

  function addSourceFiles(zipInstance, currentDir, zipPath = '') {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      if (ignoreList.includes(item)) continue;
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      const relZipPath = zipPath ? `${zipPath}/${item}` : item;
      if (stat.isDirectory()) {
        addSourceFiles(zipInstance, fullPath, relZipPath);
      } else {
        const fileData = fs.readFileSync(fullPath);
        zipInstance.file(relZipPath, fileData);
      }
    }
  }

  addSourceFiles(srcZip, process.cwd());
  const srcBuffer = await srcZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync('suratttt-source-code.zip', srcBuffer);
  fs.writeFileSync('public/suratttt-source-code.zip', srcBuffer);
  console.log('Successfully generated suratttt-source-code.zip (size: ' + (srcBuffer.length / 1024).toFixed(1) + ' KB)');
}

pack().catch(console.error);
