import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import router from "./router";
import App from "./App.vue";
import "./style.css";

const app = createApp(App);
app.use(createPinia());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});
app.use(VueQueryPlugin, { queryClient });
app.use(router);

app.mount("#app");
