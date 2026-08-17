import React from 'react';

export const Svg: React.FC<any> = ({ children, style, viewBox, ...props }) => (
  <svg viewBox={viewBox} style={{ width: '100%', height: '100%', ...style }} {...props}>
    {children}
  </svg>
);

export const Line: React.FC<any> = (props) => <line {...props} />;
export const Polyline: React.FC<any> = (props) => <polyline {...props} />;
export const Polygon: React.FC<any> = (props) => <polygon {...props} />;
export const Circle: React.FC<any> = (props) => <circle {...props} />;
export const G: React.FC<any> = (props) => <g {...props} />;
export const Text: React.FC<any> = (props) => <text {...props} />;
export const Rect: React.FC<any> = (props) => <rect {...props} />;
export const Path: React.FC<any> = (props) => <path {...props} />;

export default Svg;
