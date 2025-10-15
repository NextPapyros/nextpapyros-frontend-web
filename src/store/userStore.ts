import { defineStore } from "pinia";

export type Role = "admin" | "employee";

interface Profile {
  name: string;
  email: string;
}

interface Session {
  token: string;
  role: Role;
  profile: Profile;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    token: null as string | null,
    role: null as Role | null,
    profile: null as Profile | null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
  },
  actions: {
    setSession({ token, role, profile }: Session) {
      this.token = token;
      this.role = role;
      this.profile = profile;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("profile", JSON.stringify(profile));
    },
    hydrateFromStorage() {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role") as Role | null;
      const profileStr = localStorage.getItem("profile");
      const profile = profileStr ? JSON.parse(profileStr) : null;
      if (token && role && profile) {
        this.token = token;
        this.role = role;
        this.profile = profile;
      }
    },
    logout() {
      this.$reset();
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("profile");
    },
  },
});
