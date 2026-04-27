'use client';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center w-full mb-8">
            {Array.from({ length: totalSteps }, (_, i) => {
                const step = i + 1;
                const isCompleted = step < currentStep;
                const isActive = step === currentStep;

                return (
                    <div key={step} className="flex items-center">

                        {/* Bolinha */}
                        <div className={`
                            w-9 h-9 rounded-full flex items-center justify-center
                            text-sm font-bold border-2 transition-all duration-300
                            ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' : ''}
                            ${isActive ? 'bg-white border-blue-600 text-blue-600' : ''}
                            ${!isCompleted && !isActive ? 'bg-white border-gray-300 text-gray-400' : ''}
                        `}>
                            {isCompleted ? '✓' : step}
                        </div>

                        {/* Linha conectora (não aparece depois do último step) */}
                        {step < totalSteps && (
                            <div className={`
                                w-16 h-0.5 transition-all duration-300
                                ${isCompleted ? 'bg-blue-600' : 'bg-gray-300'}
                            `} />
                        )}

                    </div>
                );
            })}
        </div>
    );
}