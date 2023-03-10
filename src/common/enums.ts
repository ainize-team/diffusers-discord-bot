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

export enum ModelID {
  STABLE_DIFFUSION_V1_4 = 'stable-diffusion-v1-4',
  STABLE_DIFFUSION_V1_5 = 'stable-diffusion-v1-5',
  STABLE_DIFFUSION_V2 = 'stable-diffusion-v2',
  STABLE_DIFFUSION_V2_768 = 'stable-diffusion-v2-768',
  STABLE_DIFFUSION_V2_1 = 'stable-diffusion-v2-1',
  STABLE_DIFFUSION_V2_1_768 = 'stable-diffusion-v2-1-768',
  OPENJOURNEY_V2 = 'openjourney-v2',
}

export enum ModelName {
  STABLE_DIFFUSION_V1_4 = 'Stable Diffusion v1.4',
  STABLE_DIFFUSION_V1_5 = 'Stable Diffusion v1.5',
  STABLE_DIFFUSION_V2 = 'Stable Diffusion v2',
  STABLE_DIFFUSION_V2_768 = 'Stable Diffusion v2.0-768',
  STABLE_DIFFUSION_V2_1 = 'Stable Diffusion v2.1',
  STABLE_DIFFUSION_V2_1_768 = 'Stable Diffusion v2.1-768',
  OPENJOURNEY_V2 = 'OpenJourney V2.0',
}

export enum SchedulerName {
  DDIM = 'DDIM',
  PNDM = 'PNDM',
  EULER_DISCRETE = 'EULER_DISCRETE',
  EULER_ANCESTRAL_DISCRETE = 'EULER_ANCESTRAL_DISCRETE',
  HEUN_DISCRETE = 'HEUN_DISCRETE',
  K_DPM_2_DISCRETE = 'K_DPM_2_DISCRETE',
  K_DPM_2_ANCESTRAL_DISCRETE = 'K_DPM_2_ANCESTRAL_DISCRETE',
  LMS_DISCRETE = 'LMS_DISCRETE',
}

export enum SchedulerID {
  DDIM = 'ddim',
  PNDM = 'pndm',
  EULER_DISCRETE = 'euler_discrete',
  EULER_ANCESTRAL_DISCRETE = 'euler_ancestral_discrete',
  HEUN_DISCRETE = 'heun_discrete',
  K_DPM_2_DISCRETE = 'k_dpm_2_discrete',
  K_DPM_2_ANCESTRAL_DISCRETE = 'k_dpm_2_ancestral_discrete',
  LMS_DISCRETE = 'lms_discrete',
}
