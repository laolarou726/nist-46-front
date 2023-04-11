<template>
  <v-text-field
    class="pt-10"
    density="compact"
    variant="solo"
    label="Search Ligands"
    append-inner-icon="mdi-magnify"
    single-line
    hide-details
    v-model:model-value="ligandsValue"
    @input="onLigandsUpdate"
    @click:append-inner="searchLigands"
    v-on:keyup.enter="searchLigands"
    :loading="isLoading"
  ></v-text-field>
</template>

<script>
export default {
  name: "SimpleSearchForm",
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    ligands: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    ligandsValue: ''
  }),
  methods: {
    searchLigands(){
      this.$emit('onSearch')
    },
    onLigandsUpdate(){
      this.$emit('update:ligands', this.ligandsValue);
    }
  }
}
</script>

<style scoped>

</style>
