<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex text-center fill-height">
      <v-card
        class="mx-auto"
        variant="outlined"
      >
        <v-card-item>
          <div>
            <div class="d-flex text-overline mb-1">
              OVERVIEW
            </div>
            <div class="d-flex text-h6 mb-1">
              About WRASCAL
            </div>
            <div class="d-flex text-caption text-left">
              The content of this database is taken from the currently discontinued NIST-46 Database of critically selected stability constants of metal complexes: version 8.0
              <br>
              <br>
              WRASCAL is a collaboration between the Chemistry and Computer Science department of Whitman College to provide efficient accessibility to critically selected stability constants of metal complexes.
            </div>
          </div>
        </v-card-item>

        <v-card-actions style="overflow-x: auto; max-width: 470px;">
          <v-btn variant="outlined" prepend-icon="mdi-arrow-left" to="/">
            Return To Home Page
          </v-btn>
          <v-btn variant="outlined" prepend-icon="mdi-link-box-outline" @click="openNistWebsite">
            Original NIST Website
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-container class="pa-0 pt-8">
        <v-row no-gutters>
          <v-col
            v-for="member in teamMembers"
            :key="member.name"
            cols="12"
            sm="4"
          >
            <v-card
              class="mx-auto ml-2 mr-2 mb-4"
              color="primary"
              max-width="400"
              :href="member.link ?? '#'"
            >
              <v-card-text>
                <v-list-item class="w-100">
                  <template v-slot:prepend>
                    <v-avatar
                      v-if="member.src"
                      color="grey-darken-3"
                      :image="member.src"
                    ></v-avatar>
                    <div v-else v-html="getRandomAvatar(member.name)"></div>
                  </template>

                  <v-list-item-title>{{member.name}}</v-list-item-title>

                  <v-list-item-subtitle>{{member.role}}</v-list-item-subtitle>
                </v-list-item>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

    </v-responsive>
  </v-container>
</template>

<script lang="ts">
import { toSvg } from "jdenticon";

declare interface MemberInfo{
  name: string;
  role: string;
  link: string;
  src?: string;
}

export default {
  name: "AboutUs",
  metaInfo: {
    title: 'About Us'
  },
  data: () => ({
    teamMembers: [
      {
        name: 'Paul Luo',
        role: '\'23',
        link: 'https://github.com/laolarou726'
      },
      {
        name: 'Tina Wang',
        role: '\'23',
        link: 'https://github.com/pudding2718'
      },
      {
        name: 'John Stratton',
        role: 'Advisor'
      },
      {
        name: 'Nate Boland',
        role: 'Client'
      }
    ] as MemberInfo[]
  }),
  methods: {
    getRandomAvatar(id: string){
      return toSvg(id, 40)
    },
    openNistWebsite(){
      window.open('https://www.nist.gov/srd/nist46', '_blank', 'noreferrer')
    }
  }
}
</script>
