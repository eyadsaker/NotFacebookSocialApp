import { Alert } from "@heroui/react";

interface ErrorMessageProps{
    error: string , 
    status : "accent" | "danger" | "default" | "success" | "warning" | undefined
}


export default function ErrorMessage({ error, status }: ErrorMessageProps) {
  return (
    <Alert status={status}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{error}</Alert.Title>
      </Alert.Content>
    </Alert>
  );
}
