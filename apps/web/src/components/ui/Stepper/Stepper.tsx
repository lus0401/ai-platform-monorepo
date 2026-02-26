import { Fragment } from "react";
import styles from "./Stepper.module.scss";

export interface StepItem {
  label: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 1부터 시작
  onStepClick?: (step: number) => void;
  clickable?: boolean; // 완료된 스텝을 클릭 가능하게 할지 여부
}

function Stepper({
  steps,
  currentStep,
  onStepClick,
  clickable = false,
}: StepperProps) {
  const handleStepClick = (stepNumber: number) => {
    // clickable이 true이고, 현재 스텝 이하일 때만 클릭 가능
    if (clickable && stepNumber <= currentStep && onStepClick) {
      onStepClick(stepNumber);
    }
  };

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "active";
    return "inactive";
  };

  return (
    <div className={styles.stepper}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const status = getStepStatus(stepNumber);
        const isClickable = clickable && stepNumber <= currentStep;

        return (
          <Fragment key={stepNumber}>
            {/* Step Item */}
            <div
              className={`${styles.stepItem} ${
                isClickable ? styles.clickable : ""
              }`}
              onClick={() => handleStepClick(stepNumber)}
            >
              <div className={`${styles.stepCircle} ${styles[status]}`}>
                {stepNumber}
              </div>
              <span className={`${styles.stepLabel} ${styles[status]}`}>
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={styles.connector}>
                <div
                  className={`${styles.connectorLine} ${
                    stepNumber < currentStep
                      ? styles.completed
                      : styles.inactive
                  }`}
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

export default Stepper;
