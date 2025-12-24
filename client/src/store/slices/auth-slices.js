export const createAuthSlice = (set) => ({
  userInfo: undefined,
  authChecked: false,

  setUserInfo: (user) => set({ userInfo: user }),
  setAuthChecked: (value) => set({ authChecked: value }),
});
