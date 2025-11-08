// Dummy file to replace Supabase client
export const createClient = () => {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: new Error("Not implemented") })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: new Error("Not implemented") })
        })
      }),
      insert: () => Promise.resolve({ data: null, error: new Error("Not implemented") }),
      upsert: () => Promise.resolve({ data: null, error: new Error("Not implemented") })
    })
  }
}