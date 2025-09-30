// CommonJS mock for Supabase used by Vitest hoisted mocks
const now = new Date().toISOString();

module.exports = {
  supabase: {
    from: () => ({
      insert: (rows) => ({
        select: () => ({
          single: async () => ({
            data: {
              id: 1,
              type: rows[0]['type'],
              job_description: rows[0]['job_description'],
              resume: rows[0]['resume'],
              output: rows[0]['output'],
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
  },
};
