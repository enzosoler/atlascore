import React from 'react';
import { useSearchParams } from 'react-router-dom';
import S42_Web_Landing from '@/redesign/v3/screens/S42_Web_Landing.jsx';
import V3IntentFlow from '@/redesign/v3/routes/V3IntentFlow.jsx';

export default function V3Landing() {
  const [searchParams] = useSearchParams();

  if (searchParams.get('quiz') === 'start') {
    return <V3IntentFlow />;
  }

  return <S42_Web_Landing />;
}
