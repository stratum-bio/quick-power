import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import React from 'react';

export function formatLegend(value: string): React.Component {
  return <InlineMath math={value} />;
};
