import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
export function formatLegend(value: string): React.ReactNode {
  return <InlineMath math={value} />;
};
