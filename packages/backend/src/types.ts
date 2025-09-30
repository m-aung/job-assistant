export type HistoryRow = {
  id: number;
  type: string;
  jobDescription: string;
  resume: string;
  output: string;
  createdAt: string;
};

// Representation of a history row as stored in the database (snake_case)
export type DbHistoryRow = {
  id: number;
  type: string;
  job_description: string;
  resume: string;
  output: string;
  created_at: string;
};

export type DbHistoryInsert = Omit<DbHistoryRow, 'id' | 'created_at'>;
export type DbHistoryUpdate = Partial<DbHistoryInsert>;
