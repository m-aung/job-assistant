// Shared Supabase mock used by backend tests
const now = new Date().toISOString();

export const supabase = {
  from: () => ({
    insert: (rows: Array<Record<string, unknown>>) => ({
      select: () => ({
        single: async () => ({
          data: {
            id: 1,
            type: (rows[0] as Record<string, unknown>)['type'],
            job_description: (rows[0] as Record<string, unknown>)['job_description'],
            resume: (rows[0] as Record<string, unknown>)['resume'],
            output: (rows[0] as Record<string, unknown>)['output'],
            created_at: now,
          },
          error: null,
        }),
      }),
    }),
    select: () => ({
      limit: () => ({
        order: async () => ({
          data: [
            {
              id: 1,
              type: 'cover',
              job_description: 'JD',
              resume: 'R',
              output: 'O',
              created_at: now,
            },
          ],
          error: null,
        }),
      }),
      single: async () => ({
        data: {
          id: 1,
          type: 'cover',
          job_description: 'JD',
          resume: 'R',
          output: 'O',
          created_at: now,
        },
        error: null,
      }),
      eq: () => ({
        single: async () => ({
          data: {
            id: 1,
            type: 'cover',
            job_description: 'JD',
            resume: 'R',
            output: 'O',
            created_at: now,
          },
          error: null,
        }),
      }),
    }),
    delete: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
    update: () => ({
      select: () => ({
        single: async () => ({
          data: {
            id: 1,
            type: 'cover',
            job_description: 'JD',
            resume: 'R',
            output: 'O',
            created_at: now,
          },
          error: null,
        }),
      }),
    }),
    eq: () => ({
      single: async () => ({
        data: {
          id: 1,
          type: 'cover',
          job_description: 'JD',
          resume: 'R',
          output: 'O',
          created_at: now,
        },
        error: null,
      }),
    }),
  }),
};

export default { supabase };
