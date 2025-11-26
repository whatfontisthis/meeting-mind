export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
  ERROR = 'ERROR'
}

export interface NoteData {
  rawTranscript: string;
  formattedNotes: string;
}

export interface AudioRecording {
  blob: Blob;
  url: string;
  mimeType: string;
}
