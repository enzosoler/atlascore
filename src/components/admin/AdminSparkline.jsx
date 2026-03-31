import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function AdminSparkline({ data = [], color = 'hsl(var(--brand))' }) {
  if (!data.length) return null;
  return (
    <div className="h-8 w-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="count" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
