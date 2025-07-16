import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import heic2any from 'heic2any';
import JSZip from 'jszip';

const App = () => {
  const [files, setFiles] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [outputFormat, setOutputFormat] = useState('png');

  const handleDrop = (e) => {
    e.preventDefault();
    const fileList = Array.from(e.dataTransfer.files);
    setFiles(fileList);
  };

  const handleConvert = async () => {
    const zip = new JSZip();
    const output = [];
    for (let file of files) {
      let convertedBlob = file;
      if (file.type === 'image/heic') {
        convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg' });
      } else {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        await new Promise((res) => {
          img.onload = res;
          img.src = URL.createObjectURL(file);
        });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise((res) =>
          canvas.toBlob(res, `image/${outputFormat}`)
        );
        convertedBlob = blob;
      }
      zip.file(file.name.split('.')[0] + '.' + outputFormat, convertedBlob);
      output.push({
        name: file.name.split('.')[0] + '.' + outputFormat,
        blob: convertedBlob,
      });
    }
    setConvertedFiles(output);
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'converted_images.zip');
  };

  return (
    <div className="min-h-screen p-6 transition-colors duration-500" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Image Converter</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <div className="border-4 border-dashed p-6 mb-4 text-center cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(Array.from(e.target.files))}
          className="hidden"
          id="upload"
        />
        <label htmlFor="upload" className="block text-lg cursor-pointer">Click or Drag & Drop images here</label>
      </div>

      <div className="mb-4">
        <label className="mr-2">Convert to:</label>
        <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="border px-2 py-1">
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="webp">WEBP</option>
        </select>
      </div>

      <button
        onClick={handleConvert}
        disabled={files.length === 0}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Convert & Download ZIP
      </button>
    </div>
  );
};

export default App;