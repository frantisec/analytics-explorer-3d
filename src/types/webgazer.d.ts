interface WebGazerApi {
  params: Record<string, any>;
  begin(onFail?: () => void): Promise<any>;
  end(): void;
  pause(): void;
  resume(): Promise<any>;
  setGazeListener(cb: (data: { x: number; y: number } | null, elapsedTime: number) => void): any;
  clearGazeListener(): void;
  showVideoPreview(show: boolean): any;
  showPredictionPoints(show: boolean): any;
  showFaceOverlay(show: boolean): any;
  showFaceFeedbackBox(show: boolean): any;
  recordScreenPosition(x: number, y: number, eventType?: string): void;
  setRegression(type: string): any;
  saveDataAcrossSessions(val: boolean): any;
}

declare const webgazer: WebGazerApi;
