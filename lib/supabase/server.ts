// Dummy file to replace Supabase server
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
      })
    })
  }
}