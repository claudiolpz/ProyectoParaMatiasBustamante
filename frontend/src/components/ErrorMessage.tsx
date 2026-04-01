import { memo } from "react";
import type { ErrorMessageProps } from "../types";

const ErrorMessage = memo(({ children }: ErrorMessageProps) => (
    <p className="bg-red-50 text-red-600 text-sm font-bold text-center">* {children} </p>
));

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
