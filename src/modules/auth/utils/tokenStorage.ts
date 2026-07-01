let inMemoryToken: string | null = null;

export const tokenStorage = {
  getAccessToken: (): string | null => {
    return inMemoryToken;
  },

  setAccessToken: (token: string | null): void => {
    inMemoryToken = token;
  },

  clearToken: (): void => {
    inMemoryToken = null;
  },
};

export default tokenStorage;
