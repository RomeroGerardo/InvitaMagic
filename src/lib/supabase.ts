// --- MOCK SUPABASE PARA TRABAJAR SIN BASE DE DATOS ---
// El usuario eliminó la base de datos, así que este archivo simula el comportamiento
// de Supabase utilizando `localStorage` en el navegador para que la app siga funcionando.

const getDB = () => {
  const data = localStorage.getItem('mock_db');
  return data ? JSON.parse(data) : { events: [], guests: [] };
};

const saveDB = (db: any) => {
  localStorage.setItem('mock_db', JSON.stringify(db));
};

const getSession = () => {
  const data = localStorage.getItem('mock_session');
  return data ? JSON.parse(data) : null;
};

const saveSession = (session: any) => {
  if (session) {
    localStorage.setItem('mock_session', JSON.stringify(session));
  } else {
    localStorage.removeItem('mock_session');
  }
};

const createQueryChain = (data: any, error: any = null) => {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    single: async () => ({ data: Array.isArray(data) ? data[0] : data, error }),
    then: (resolve: any) => resolve({ data, error })
  };
  return chain;
};

export const supabase: any = {
  auth: {
    getSession: async () => ({ data: { session: getSession() }, error: null }),
    onAuthStateChange: (callback: any) => {
      setTimeout(() => callback('INITIAL_SESSION', getSession()), 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async ({ email }: any) => {
      const user = { id: 'mock-user-id', email };
      const session = { user, access_token: 'mock-token' };
      saveSession(session);
      return { data: { session }, error: null };
    },
    signUp: async ({ email }: any) => {
      const user = { id: 'mock-user-id', email };
      const session = { user, access_token: 'mock-token' };
      saveSession(session);
      return { data: { user, session }, error: null };
    },
    signOut: async () => {
      saveSession(null);
      return { error: null };
    }
  },
  from: (table: string) => {
    return {
      select: () => {
        const chain: any = {
          eq: (field: string, val: any) => {
            const db = getDB();
            let result = db[table] || [];
            result = result.filter((item: any) => item[field] === val);
            
            const nextChain: any = {
              order: () => nextChain,
              single: async () => ({ data: result[0] || null, error: null }),
              then: (res: any) => res({ data: result, error: null })
            };
            return nextChain;
          },
          order: () => chain,
          single: async () => {
             const db = getDB();
             return { data: (db[table] && db[table][0]) || null, error: null };
          },
          then: (res: any) => {
            const db = getDB();
            res({ data: db[table] || [], error: null });
          }
        };
        return chain;
      },
      insert: (payload: any) => {
        const db = getDB();
        if (!db[table]) db[table] = [];
        
        const records = Array.isArray(payload) ? payload : [payload];
        const newRecords = records.map((record: any) => ({
          id: Math.random().toString(36).substring(2), 
          created_at: new Date().toISOString(), 
          ...record
        }));
        
        db[table].push(...newRecords);
        saveDB(db);
        return createQueryChain(newRecords);
      },
      update: (record: any) => {
        return {
          eq: (field: string, val: any) => {
            const db = getDB();
            if (!db[table]) db[table] = [];
            const index = db[table].findIndex((item: any) => item[field] === val);
            if (index !== -1) {
              db[table][index] = { ...db[table][index], ...record };
              saveDB(db);
            }
            return createQueryChain(null);
          }
        };
      },
      delete: () => {
        return {
          eq: (field: string, val: any) => {
            const db = getDB();
            if (!db[table]) db[table] = [];
            const index = db[table].findIndex((item: any) => item[field] === val);
            if (index !== -1) {
              db[table].splice(index, 1);
              saveDB(db);
            }
            return createQueryChain(null);
          }
        };
      }
    };
  },
  functions: {
    invoke: async (funcName: string, options: any) => {
      const title = options?.body?.title || 'tu evento';
      const theme = options?.body?.theme || 'mágico';
      return { 
        data: { 
          generatedText: `¡Hola! Te invito a ${title}, un evento con temática ${theme}. ¡Será un día inolvidable lleno de sorpresas! (Texto generado por simulación IA local)` 
        }, 
        error: null 
      };
    }
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop' } };
      }
    })
  },
  channel: (name: string) => {
    return {
      on: () => {
        const chain: any = {
          subscribe: () => {}
        };
        return chain;
      }
    };
  },
  removeChannel: () => {}
};
