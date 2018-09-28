<template>
  <div id="app" class="container">
    <c-select
      label="single"
      track-by="slug"
      display-by="name"
      placeholder="Selecione uma opção"
      :clear-on-select="false"
      :items="items"
      v-model="data1"
    />

    <c-select
      label="single"
      track-by="slug"
      display-by="name"
      placeholder="Selecione uma opção"
      clear-on-select
      :items="items"
      v-model="data2"
    >
      <div slot="option" slot-scope="{ option }">
        {{ option['slug'] }} - {{ option['name'] }}
      </div>
    </c-select>

    <c-select
      label="multiple"
      track-by="slug"
      display-by="name"
      placeholder="Selecione uma opção"
      multiple
      hide-selected
      :items="items"
      v-model="data3"
    />

    <c-select
      label="multiple"
      track-by="slug"
      display-by="name"
      placeholder="Selecione uma opção"
      :validation="data4.length >= 3 && `Máximo de 3 opções selecionadas`"
      multiple
      :items="items"
      v-model="data4"
    />
  </div>
</template>

<script>
import CSelect from '../index'

export default {
  name: 'teste',

  components: { CSelect },

  data () {
    return {
      data1: '',
      data2: '',
      data3: [
        { slug: 'slug_boladao2', name: 'coe2' }
      ],
      data4: [],
      items: [
        { slug: 'slug_boladao1', name: 'coe1' },
        { slug: 'slug_boladao2', name: 'coe2' },
        { slug: 'slug_boladao3', name: 'coe3' },
        { slug: 'slug_boladao4', name: 'coe4' },
        { slug: 'slug_boladao5', name: 'coe5' },
        { slug: 'slug_boladao6', name: 'coe6' }
      ]
    }
  }
}
</script>

<style scoped>
/* .container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
} */
</style>
