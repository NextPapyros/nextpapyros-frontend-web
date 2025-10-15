import { defineStore } from "pinia";

export type Role = "Admin" | "Employee";

export interface Profile {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}

interface Session {
  token: string;
  profile: Profile;
}

const SessionKeys = {
  TOKEN: "token",
  PROFILE: "profile",
};

export const useUserStore = defineStore("user", {
  state: () => ({
    token: null as string | null,
    profile: null as Profile | null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    role: (s) => s.profile?.roles[0] || null,
    isAdmin: (s) => s.profile?.roles.includes("Admin") || false,
    isEmployee: (s) => s.profile?.roles.includes("Employee") || false,
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem(SessionKeys.TOKEN, token);
    },
    setProfile(profile: Profile) {
      this.profile = profile;
      localStorage.setItem(SessionKeys.PROFILE, JSON.stringify(profile));
    },
    setSession({ token, profile }: Session) {
      this.token = token;
      this.profile = profile;
      localStorage.setItem(SessionKeys.TOKEN, token);
      localStorage.setItem(SessionKeys.PROFILE, JSON.stringify(profile));
    },
    hydrateFromStorage() {
      const token = localStorage.getItem(SessionKeys.TOKEN);
      const profileStr = localStorage.getItem(SessionKeys.PROFILE);
      const profile = profileStr ? JSON.parse(profileStr) : null;
      if (token && profile) {
        this.token = token;
        this.profile = profile;
      }
    },
    logout() {
      this.$reset();
      localStorage.removeItem(SessionKeys.TOKEN);
      localStorage.removeItem(SessionKeys.PROFILE);
    },
  },
});
