import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { MdClose } from "react-icons/md";
import styles from "./Modal.module.scss";

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) => {
  const contentClasses = [
    styles.modalContent,
    styles[`modalContent--${size}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.modalOverlay} />
        <Dialog.Content
          className={contentClasses}
          onInteractOutside={(e) => {
            if (!closeOnOverlayClick) {
              e.preventDefault();
            }
          }}
        >
          {(title || showCloseButton) && (
            <div className={styles.modalHeader}>
              <div>
                {title && (
                  <Dialog.Title className={styles.modalTitle}>
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className={styles.modalDescription}>
                    {description}
                  </Dialog.Description>
                )}
              </div>
              {showCloseButton && (
                <Dialog.Close className={styles.modalClose}>
                  <MdClose size={24} />
                </Dialog.Close>
              )}
            </div>
          )}

          <div className={styles.modalBody}>{children}</div>

          {footer && <div className={styles.modalFooter}>{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Trigger 컴포넌트도 export
export const ModalTrigger = Dialog.Trigger;

export default Modal;
