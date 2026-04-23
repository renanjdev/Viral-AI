export interface Project {
  id: string;
  name: string;
  originalVideoPath: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface Clip {
  id: string;
  projectId: string;
  title: string;
  startTime: number;
  endTime: number;
  viralScore: number;
  path?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: string; // JSON string
}

export interface AnalysisResult {
  title: string;
  startTime: number;
  endTime: number;
  viralScore: number;
  reasoning: string;
}
