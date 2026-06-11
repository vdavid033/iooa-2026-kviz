<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-positive text-white" height-hint="98">
      <q-toolbar>
        <q-btn
          href="/"
          label="Početna stranica"
          color="white"
          flat
          icon="directions"
        />
        <q-toolbar-title class="text-weight-medium text-center text-h5">
          <q-avatar>
            <img
              src="https://ichef.bbci.co.uk/news/976/cpsprodpb/C130/production/_123665494_mediaitem123664184.jpg"
            />
          </q-avatar>
          Dobrodošli u kviz o biljnim vrstama
        </q-toolbar-title>
        <q-btn
          v-if="!isLoggedIn"
          label="Prijava"
          color="white"
          flat
          icon="login"
          to="/login"
        />

        <q-btn
          v-else
          label="Odjava"
          color="white"
          flat
          icon="logout"
          @click="logout"
        />
        <q-btn
          flat
          color="white"
          label="Admin"
          icon="admin_panel_settings"
          @click="$router.push('/PregledBiljaka')"
        />

        <q-btn
          href="https://www.agroklub.com/sortna-lista/"
          label="Agro klub"
          color="white"
          flat
          icon="home"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>


<script>
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";



const linksList = [
  {
    title: "Link test",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
];
export default defineComponent({
  name: "MainLayout",

  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);
    const isLoggedIn = ref(false);

    // provjera auth stanja
    const checkAuth = () => {
  const token = localStorage.getItem("token")
  const expiresAt = localStorage.getItem("expiresAt")

  if (!token || !expiresAt) {
    isLoggedIn.value = false
    return
  }

  // provjera isteka tokena
  if (Date.now() > Number(expiresAt)) {
    logout()
    return
  }

  isLoggedIn.value = true
}
let logoutTimer = null

// postavljanje auto logouta
const startAutoLogout = () => {
  const expiresAt = localStorage.getItem("expiresAt")
  if (!expiresAt) return

  const timeLeft = Number(expiresAt) - Date.now()

  if (timeLeft <= 0) {
    logout()
  } else {
    logoutTimer = setTimeout(logout, timeLeft)
  }
}


    //logout funkcija 
    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("expiresAt");
      isLoggedIn.value = false;

      $q.notify({
          type: "positive",
          message: "Uspješno ste se odjavili",
          position: "top",
          timeout: 2500,
        });
      router.push("/");
    };

    //  toggle drawer
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };
// inicijalna provjera auth stanja i postavljanje auto logouta
      onMounted(() => {
      checkAuth()
      startAutoLogout()

      window.addEventListener("storage", () => {
      checkAuth()
      startAutoLogout()
  })
})
      // cleanup
      onBeforeUnmount(() => {
      window.removeEventListener("storage", () => {
      checkAuth()
      startAutoLogout()
  })
      if (logoutTimer) clearTimeout(logoutTimer)
})


    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer,
      isLoggedIn,
      logout,
    };
  },
});
</script>
