import { defineComponent } from 'vue'

interface RouterMixin{
  goBack(): void;
}

export default defineComponent({
  methods: {
    goBack(){
      this.$router.go(-1)
    }
  }
}) as unknown as RouterMixin;
