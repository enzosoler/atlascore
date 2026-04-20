import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import S75_Celebrations from '../screens/S75_Celebrations.jsx';

export default function V3Celebrations() {
  const navigate = useNavigate();
  const { kind } = useParams();
  return (
    <S75_Celebrations
      dark={true}
      kind={kind}
      onShare={() => navigate('/app/workouts/share')}
      onKeepGoing={() => navigate('/app/today')}
    />
  );
}
