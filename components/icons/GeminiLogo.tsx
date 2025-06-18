import * as React from 'react';
import { Path, Svg } from 'react-native-svg';

export function GeminiLogo({ width = 16, height = 16, fill = "#b02372" }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z"
        fill={fill}
      />
    </Svg>
  );
} 