<template>
  <SpeedInsights />
  <metainfo>
    <template v-slot:title="{ content }">{{ content ? `${content} | WRASCAL` : `WRASCAL` }}</template>
  </metainfo>
  <v-app>
    <v-main>
      <v-app-bar
        color="teal-darken-4"
        image="https://picsum.photos/1920/1080?random"
      >
        <template v-slot:image>
          <v-img
            gradient="to top right, rgba(18, 49, 105,.8), rgba(31, 84, 181,.8)"
          ></v-img>
        </template>

        <template v-slot:prepend>
          <v-app-bar-nav-icon @click="changeDrawerStatus"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>
          <v-btn class="pl-4 pr-4" to="/" variant="flat" color="transparent">
            <div class="text-h6">WRASCAL</div>
          </v-btn>
        </v-app-bar-title>

        <v-spacer></v-spacer>

        <v-btn @click="toggleTheme" icon>
          <v-icon :icon="themeModeSwitchIcon"/>
        </v-btn>
      </v-app-bar>

      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>

      <v-navigation-drawer
        v-model="drawer"
        permanent
        theme="dark"
      >
        <template v-slot:image>
          <v-img class="fill-height" cover src="https://picsum.photos/1920/1080?random" gradient="to top right, rgba(18, 49, 105,.8), rgba(31, 84, 181,.8)"/>
        </template>
        <v-list nav>
          <v-list-item
            v-for="link in links"
            :key="link"
            :to="link.to"
            :prepend-icon="link.icon"
            :title="link.name"
          >
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-footer
        class="bg-grey-darken-4 text-center d-flex flex-column pt-10 pb-10"
      >
        <v-row justify="center" no-gutters>
          <v-btn
            v-for="link in links"
            :key="link"
            :to="link.to"
            color="white"
            variant="text"
            class="mx-2"
            rounded="xl"
            :prepend-icon="link.icon"
          >
            {{ link.name }}
          </v-btn>
        </v-row>

        <div class="pt-8 pb-8">
          The NIST Critically Selected Stability Constants of Metal Complexes
          Database is a reference work covering a tremendous number of
          interactions for aqueous systems of organic and inorganic ligands with
          protons and various metal ions. Over 18,000 papers have been examined,
          representing over 99,000 metal-ligand systems, and only data which meet
          the criterion of well-documented, careful work were considered for
          inclusion.
        </div>

        <v-divider/>

        <div>
          {{ new Date().getFullYear() }} — <strong>WRASCAL</strong>
        </div>
      </v-footer>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { SpeedInsights } from '@vercel/speed-insights/vue';
</script>

<script lang="ts">

import { defineComponent } from 'vue'
import { useTheme } from 'vuetify'

export default defineComponent({
  setup () {
    const theme = useTheme()
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

    theme.global.name.value = isDark ? 'dark' : 'light'

    return {
      theme,
      toggleTheme: () => {
        theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
      }
    }
  },
  data: () => ({
    links: [
      {
        name: 'Home',
        to: '/',
        icon: 'mdi-home-analytics'
      },
      {
        name: 'About Us',
        to: '/about-us',
        icon: 'mdi-information'
      }
    ],
    drawer: false
  }),
  computed: {
    themeModeSwitchIcon(){
      const theme = useTheme()

      return theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-weather-night'
    }
  },
  methods: {
    changeDrawerStatus(){
      this.drawer = !this.drawer
    }
  },
  mounted() {
    this.$loadScript("https://vercel.com/_vercel/insights/script.js")
  }
})

</script>
