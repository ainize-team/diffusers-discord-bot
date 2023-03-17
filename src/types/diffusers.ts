import { ModelID, ResponseStatus, SchedulerID } from '../common/enums';

export interface ITextToImageRequest {
  prompt: string;
  negative_prompt: string;
  steps: number;
  seed: number;
  width: number;
  height: number;
  images: number;
  guidance_scale: number;
  model_id: ModelID;
  scheduler_type: SchedulerID;
}

export interface ITextToImageResponse {
  status: ResponseStatus;
  updated_at: number;
  result: {
    [key: string]: {
      url: string;
      origin_url?: string;
      is_filtered: boolean;
    };
  };
}

export interface IImageToImageResponse {
  status: ResponseStatus;
  updated_at: number;
  output: string;
}
