import type { ButtonHTMLAttributes } from "react";
import "./Button.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ type = "button", ...props }: ButtonProps) => {
  return <button type={type} className="ui-button" {...props} />;
};

export default Button;
