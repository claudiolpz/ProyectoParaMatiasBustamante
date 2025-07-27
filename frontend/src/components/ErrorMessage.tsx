type ErrorMessageProps = {
    children: React.ReactNode;
}

const ErrorMessage = ({children} : ErrorMessageProps) => {
  return (
    <p className="bg-red-50 text-red-600 text-sm font-bold text-center">* {children} </p>
  )
}

export default ErrorMessage
