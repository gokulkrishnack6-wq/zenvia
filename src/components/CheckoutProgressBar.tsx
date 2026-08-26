import React from "react";
import { Check } from "lucide-react";

interface CheckoutProgressBarProps {
  currentStep: 1 | 2;
  onStepClick?: (step: 1 | 2) => void;
  canNavigateToStep2?: boolean;
}

export const CheckoutProgressBar: React.FC<CheckoutProgressBarProps> = ({
  currentStep,
  onStepClick,
  canNavigateToStep2 = false,
}) => {
  return (
    <div className="w-full bg-white border-b border-neutral-200 px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-center space-x-3 text-xs">
        {/* Step 1 Indicator */}
        <button
          type="button"
          onClick={() => onStepClick?.(1)}
          className={`flex items-center space-x-1.5 font-bold transition-colors ${
            currentStep === 1
              ? "text-amber-800 font-black cursor-default"
              : "text-emerald-700 hover:text-emerald-900 cursor-pointer"
          }`}
        >
          {currentStep === 2 ? (
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          ) : (
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
              1
            </span>
          )}
          <span className="tracking-tight text-[13px]">
            {currentStep === 2 ? "✓ Details" : "① Details"}
          </span>
        </button>

        {/* Separator Arrow */}
        <span className="text-neutral-300 font-bold select-none">→</span>

        {/* Step 2 Indicator */}
        <button
          type="button"
          onClick={() => {
            if (canNavigateToStep2 && onStepClick) {
              onStepClick(2);
            }
          }}
          disabled={!canNavigateToStep2}
          className={`flex items-center space-x-1.5 font-bold transition-colors ${
            currentStep === 2
              ? "text-amber-800 font-black cursor-default"
              : "text-neutral-400 cursor-not-allowed"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
              currentStep === 2
                ? "bg-amber-600 text-white"
                : "bg-neutral-200 text-neutral-600"
            }`}
          >
            2
          </span>
          <span className="tracking-tight text-[13px]">② Payment</span>
        </button>
      </div>
    </div>
  );
};
