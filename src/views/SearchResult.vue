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
              Search Result
            </div>
            <div class="d-flex text-caption text-left">
              Here you can view the current search results and click on one of the entries to go to the details page for that compound.
              Clicking on the title in the table header will sort the items in ascending/descending order by that column.
              Click on the drop-down boxes and buttons at the bottom to control the content displayed on each page and switch between pages.
            </div>
          </div>
        </v-card-item>

        <v-card-actions>
          <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="returnToSearchPage">
            Return To Search Page
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card
        class="mt-10 text-left"
        title="Options"
        subtitle="Here are some options that you can use it to reorder data"
      >
        <v-card-actions>
          <v-row no-gutters>
            <v-col
              v-for="key in groupKeys"
              :key="key.key"
              cols="12"
              sm="3"
            >
              <v-checkbox
                :label="key.key"
                v-model="key.isChecked"
                color="primary"
                hide-details
              ></v-checkbox>
            </v-col>
          </v-row>

          <v-btn
            class="ml-8"
            variant="flat"
            prepend-icon="mdi-refresh"
            color="secondary"
            @click="regroup"
          >
            Regroup
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-row justify="center" class="pt-10">
        <v-col cols="12">
          <v-data-table
            v-model:items-per-page="itemsPerPage"
            :group-by="groupBy"
            :headers="headers"
            :items="searchResult"
            item-value="name"
            class="elevation-1"
          >
            <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
              <tr class="text-left">
                <td :colspan="columns.length">
                  <VBtn
                    size="small"
                    variant="text"
                    :icon="isGroupOpen(item) ? '$expand' : '$next'"
                    @click="toggleGroup(item)"
                  ></VBtn>
                  <span v-html="item.value"></span>
                </td>
              </tr>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                rounded="pill"
                color="primary"
                prepend-icon="mdi-share"
                @click="goToDetailPage(item.raw)"
              >
                Detail
              </v-btn>
            </template>
            <template v-slot:[`item.molecular_formula`]="{ item }">
              <div v-html="item.raw.molecular_formula"></div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>

    </v-responsive>
  </v-container>
</template>

<script>
import {searchResultStore} from "@/stores/searchResultStore";
import {useMeta} from "vue-meta";

export default {
  name: "SearchResult",
  setup: () => {
    useMeta({
      title: 'Search Results'
    })
  },
  data: () => ({
    itemsPerPage: 50,
    groupBy: [],
    headers: [
      { title: 'Actions', key: 'actions', sortable: false },
      {
        title: 'Name',
        align: 'start',
        key: 'name',
      },
      { title: 'Ligand Charge', align: 'end', key: 'ligand_charge' },
      { title: 'Metal Charge', align: 'end', key: 'metal_charge' },
      { title: 'Central Element', align: 'end', key: 'central_element' },
      { title: 'Molecular Formula', align: 'end', key: 'molecular_formula' },
      { title: 'Categories', align: 'end', key: 'categories' },
    ],
    searchResult: [],
    groupKeys: []
  }),
  methods: {
    returnToSearchPage(){
      this.$router.go(-1)
    },
    regroup(){
      const temp = []

      for(const state of this.groupKeys){
        if(!state.isChecked) continue
        console.log(state.key)
        temp.push({key: state.key})
      }

      this.groupBy = temp
    },
    goToDetailPage(item){
      const store = searchResultStore()

      store.selectedSearchResult = item

      this.$router.push('/detail-view')
    }
  },
  mounted() {
    const store = searchResultStore()

    this.searchResult = store.searchResult
    this.groupBy = [{key: 'name'}, {key: 'central_element'}]

    this.groupKeys = []
    for(const key of store.getKeys){
      this.groupKeys.push({
        key: key,
        isChecked: (key === "name" || key === "central_element")
      })
    }
  }
}
</script>
