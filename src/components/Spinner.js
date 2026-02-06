import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import spinnerFrames from '../data/spinnerFrames';

const LoadingAscii = styled.pre`
  font-family: monospace;
  white-space: pre;
  line-height: 1.2;
  font-size: 16px;
  color: var(--text-primary);
  text-align: center;
  position: relative;
`;

const LoadingText = styled.div`
  position: absolute;
  bottom: -30px;
  right: 20px;
  font-size: 14px;
  color: var(--text-secondary);
  font-family: 'Space Grotesk', sans-serif;
`;

const Spinner = ({ percent }) => {
  const [dots, setDots] = useState(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => (prev >= 3 ? 0 : prev + 1));
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    const frameInterval = setInterval(() => {
      setFrame(prev => (prev >= spinnerFrames.length - 1 ? 0 : prev + 1));
    }, 150);
    return () => clearInterval(frameInterval);
  }, []);

  return (
    <LoadingAscii>
      {spinnerFrames[frame]}
      <LoadingText>loading{'.'.repeat(dots)} {Math.floor(percent)}%</LoadingText>
    </LoadingAscii>
  );
};

export default Spinner;
