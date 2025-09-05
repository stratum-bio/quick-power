import React from "react";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

interface TooltipPayload {
  name: string;
  value: number | number[];
  unit?: string;
  stroke?: string;
  dataKey?: string;
}

interface InlineMathTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
  round?: boolean;
}

export const InlineMathTooltip: React.FC<InlineMathTooltipProps> = ({
  active,
  payload,
  round,
}) => {
  const isVisible = active && payload && payload.length;
  if (!isVisible) {
    return <></>;
  }

  return (
    <div className="border border-black p-4 bg-white rounded-lg opacity-70">
      {payload.map((entry, index) => (
        <p
          key={`item-${index}`}
          className="opacity-100 font-bold"
          style={{ color: entry.stroke }}
        >
          <InlineMath math={entry.name} />:{" "}
          {round
            ? Array.isArray(entry.value)
              ? entry.value.map((val) => val.toFixed(3)).join(", ")
              : entry.value.toFixed(3)
            : Array.isArray(entry.value)
              ? entry.value.join(", ")
              : entry.value}
        </p>
      ))}
    </div>
  );
};
