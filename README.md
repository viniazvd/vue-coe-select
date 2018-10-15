<h1 align="center">vue-coe-select ✅</h1>

<p align="center">
  <a href="#" alt="License" target="_blank"></a>
</p>

<p align="center">
  ✨ <a href="https://codesandbox.io/s/github/viniazvd/vue-coe-select-example">Example</a>✨
</p>

**Install**

`yarn add vue-coe-select`

**Examples**
```vue
<template>
  <div class="container">
    <c-select
      label="single"
      display="slug"
      display-by="name"
      placeholder="Selecione uma opção"
      clear-on-select
      :items="items"
      v-model="data1"
    >
      <div slot="option" slot-scope="{ option }">
        {{ option['slug'] }} - {{ option['name'] }}
      </div>
    </c-select>

    <c-select
      label="multiple"
      display="slug"
      display-by="name"
      placeholder="Selecione uma opção"
      multiple
      hide-selected
      :items="items"
      v-model="data2"
    />

    <c-select
      label="multiple"
      display="slug"
      display-by="name"
      placeholder="Selecione uma opção"
      :validation="data3.length >= 3 && `Máximo de 3 opções selecionadas`"
      multiple
      :items="items"
      v-model="data3"
    />
  </div>
</template>

<script>
import CSelect from 'vue-coe-select'

export default {
  name: 'teste',

  components: { CSelect },

  data () {
    return {
      data1: '',
      data2: [
        { slug: 'slug_boladao2', name: 'coe2' }
      ],
      data3: [],
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
```

<br>

## Props

Name                      |   type            | required | About
-----                     | -------           | -------- | ------
items                     |  Array            |  `true`  | options to display
value                     |  Any              |  `true`  | some pre-set value
placeholder               |  String           |  `false` | -
optionSelectPlaceholder   |  String           |  `false` | -
optionUnselectPlaceholder |  String           |  `false` | -
label                     |  String           |  `false` | title/label of input
required                  |  Boolean          |  `false` | add a * indicating that the field is required
validation                |  String, Boolean  |  `false` | conditional that returns a boolean
display                   |  String           |  `false` | -
displayBy                 |  String           |  `false` | -
multiple                  |  Boolean          |  `false` | -
hideSelected              |  Boolean          |  `false` | -
clearOnSelect             |  Boolean          |  `false` | -
disabled                  |  Boolean          |  `false` | -

**slot-scope**
<ul style='margin: 0; padding: 0; color: red; list-style-type: none;'>
  <li>options</li>
  <li>option</li>
</ul>
