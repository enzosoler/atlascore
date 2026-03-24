import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileJson, FileSpreadsheet, FileImage, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FORMATS = [
  { id: 'json', label: 'JSON', icon: FileJson, desc: 'Complete data export', size: '2.4 MB' },
  { id: 'csv', label: 'CSV', icon: FileSpreadsheet, desc: 'Spreadsheet format', size: '1.1 MB' },
  { id: 'photos', label: 'Photos Only', icon: FileImage, desc: 'Progress photos zip', size: '156 MB' },
];

export default function DataExport() {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExported(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Export Data</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-[hsl(var(--fg-2))] mb-6">
            Download a copy of your data. Exports include workouts, nutrition logs, measurements, and profile information.
          </p>

          <div className="space-y-2 mb-6">
            {FORMATS.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-colors ${
                  selectedFormat === format.id
                    ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/5'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--border-h))]'
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedFormat === format.id ? 'bg-[hsl(var(--accent-primary))]/20' : 'bg-[hsl(var(--fill))]'}`}>
                  <format.icon className={`w-5 h-5 ${selectedFormat === format.id ? 'text-[hsl(var(--accent-primary))]' : ''}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{format.label}</p>
                  <p className="text-sm text-[hsl(var(--fg-2))]">{format.desc}</p>
                </div>
                <span className="text-xs text-[hsl(var(--fg-3))]">{format.size}</span>
              </button>
            ))}
          </div>

          {exported ? (
            <div className="p-4 rounded-xl bg-green-500/10 text-center">
              <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Export Ready!</p>
              <p className="text-sm text-[hsl(var(--fg-2))] mb-3">Your data export is ready for download</p>
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          ) : (
            <Button onClick={handleExport} disabled={isExporting} className="w-full">
              {isExporting ? 'Preparing Export...' : 'Export My Data'}
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
