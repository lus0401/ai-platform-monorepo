import styles from "./Divider.module.scss";

interface DividerProps {
  className?: string;
}

const Divider = ({ className }: DividerProps) => {
  return <div className={`${styles.divider} ${className || ""}`} />;
};

export default Divider;

