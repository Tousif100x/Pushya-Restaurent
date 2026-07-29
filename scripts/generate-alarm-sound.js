const fs = require('fs');
const path = require('path');

// Generates a valid 1-second 880Hz / 440Hz dual-tone alarm WAV file
function generateAlarmWav() {
  const sampleRate = 22050;
  const duration = 1.0; // 1 second
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2; // 16-bit mono
  const fileSize = 44 + dataSize;

  const buffer = Buffer.alloc(fileSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize - 8, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(1, 22);  // mono
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);  // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Fill with dual-tone siren (880Hz alternating with 660Hz every 0.25s)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = (t % 0.5 < 0.25) ? 880 : 660; // alternating tone
    const sample = Math.sin(2 * Math.PI * freq * t) * 0.7; // 70% volume
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

const alarmBuffer = generateAlarmWav();
const targetPath = path.join(__dirname, '..', 'public', 'alarm.mp3');
fs.writeFileSync(targetPath, alarmBuffer);
console.log('✅ Generated public/alarm.mp3 (Size:', alarmBuffer.length, 'bytes)');
