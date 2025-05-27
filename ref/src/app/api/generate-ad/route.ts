import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const tempId = uuidv4();
  const uploadPath = path.join(process.cwd(), 'public', 'uploads', `${tempId}.png`);
  const outputPath = path.join(process.cwd(), 'public', 'ads', `${tempId}.mp4`);

  // Save uploaded image to disk
  await writeFile(uploadPath, buffer);

  // === MOCK VISION ===
  const adText = `Lavender Bliss\nRelax • Recharge • Rejuvenate`;
  const ctaText = 'Shop Now on Brandwisp.com';

  // === RENDER VIDEO USING REMOTION ===
  const renderProcess = spawn('npx', [
    'remotion',
    'render',
    path.join(process.cwd(), 'remotion', 'index.ts'), // ← entrypoint
    'MyComp',                                          // ← composition ID
    outputPath,
    '--props',
    JSON.stringify({
      productImage: `http://localhost:3000/uploads/${tempId}.png`,
      headline: adText,
      cta: ctaText,
    }),
  ]);
  

  await new Promise((resolve, reject) => {
    renderProcess.stdout.on('data', (data) => console.log(`[Remotion] ${data}`));
    renderProcess.stderr.on('data', (data) => console.error(`[Remotion Error] ${data}`));
    renderProcess.on('close', (code) => (code === 0 ? resolve(null) : reject('Remotion failed')));
  });

  return NextResponse.json({ videoUrl: `/ads/${tempId}.mp4` });
}
