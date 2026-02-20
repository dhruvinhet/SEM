import React from 'react';
import { Check } from 'lucide-react';

interface Props {
  currentStep: number;
  steps: string[];
}

export default function BookingStepper({ currentStep, steps }: Props) {
  return (
    <nav aria-label="Booking progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li
              key={step}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500
                    ${isCompleted ? 'bg-accent-500 text-white' : ''}
                    ${isCurrent ? 'bg-primary-500 text-white ring-4 ring-primary-100' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-sand-100 text-dark-400 border border-sand-200' : ''}
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : index + 1}
                </div>
                <span
                  className={`mt-2 text-[11px] font-semibold hidden sm:block transition-colors
                    ${isCurrent ? 'text-primary-600' : isCompleted ? 'text-accent-600' : 'text-dark-400'}
                  `}
                >
                  {step}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 mx-3">
                  <div
                    className={`h-[2px] rounded-full transition-colors duration-500
                      ${isCompleted ? 'bg-accent-500' : 'bg-sand-200'}
                    `}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
