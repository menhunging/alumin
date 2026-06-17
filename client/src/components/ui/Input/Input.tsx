import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import "./Input.scss";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} className="ui-input" {...props} />;
});

Input.displayName = "Input";

export default Input;
