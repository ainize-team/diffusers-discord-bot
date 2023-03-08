export enum ResponseStatus {
  PENDING = 'pending',
  ASSIGNED = 'assngiend',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum ErrorTitle {
  UNKNOWN = 'Unknown Error',
  WRONG_TASK_ID = 'Wrong Task ID Error',
}

export enum WarningMessages {
  NSFW = 'Potential NSFW content was detected in one or more images.\nIf you want to see the original image, press the button below.\n',
}

export enum ErrorMessages {
  UNKNOWN = 'Unknown error occurred.\nPlease share the error with our community manager.\n',
}
