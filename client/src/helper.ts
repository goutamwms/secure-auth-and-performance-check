export const getErrorMessage = (
  error: unknown,
  message: string | null = null
): string => {
  return message
    ? message
    : error instanceof Error
      ? error.message
      : 'Something went wrong';
};
