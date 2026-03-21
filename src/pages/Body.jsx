import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, BarChart3, Camera } from 'lucide-react';
import Progress from './Progress';
import Measurements from './Measurements';
import ProgressPhotos from './ProgressPhotos';

const TABS = [
  { id: 'overview',     label: 'Overview',     icon: TrendingUp  },
  { id: 'measurements', label: 'Measurements', icon: BarChart3   },
  { id: 'photos',       label: 'Photos',       icon: Camera      },
];

export default function Body() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const validTab = TABS.some(t => t.id === tabFromUrl) ? tabFromUrl : 'overview';
  const [activeTab, setActiveTab] = useState(validTab);

  function handleTab(id) {
    setActiveTab(id);
    setSearchParams(id === 'overview' ? {} : { tab: id }, { replace: true });
  }

  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-8 space-y-0">
      {/* Page header */}
      <div className="pb-5 space-y-1">
        <h1 className="t-headline">Body Progress</h1>
        <p className="t-small text-[hsl(var(--fg-2))]">
          Track measurements, progress trends, and photo checkpoints in one place.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-[hsl(var(--border-h))] mb-6">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTab(tab.id)}
              className={`flex items-center gap-2 px-4 pb-3 text-[13px] font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-[hsl(var(--brand))] text-[hsl(var(--fg))]'
                  : 'border-transparent text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[hsl(var(--brand))]' : ''}`} strokeWidth={1.9} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview'     && <Progress />}
      {activeTab === 'measurements' && <Measurements />}
      {activeTab === 'photos'       && <ProgressPhotos />}
    </div>
  );
}
