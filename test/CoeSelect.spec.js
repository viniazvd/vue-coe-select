import { mount, shallowMount } from '@vue/test-utils'
// import sinon from 'sinon'

import CoeSelect from '../src/index.js'

/* eslint-disable */
describe('CoeSelect', () => {
  const items = [
    { slug: 'slug_boladao1', name: 'coe1' },
    { slug: 'slug_boladao2', name: 'coe2' },
    { slug: 'slug_boladao3', name: 'coe3' },
    { slug: 'slug_boladao4', name: 'coe4' },
    { slug: 'slug_boladao5', name: 'coe5' },
    { slug: 'slug_boladao6', name: 'coe6' }
  ]

  test('is a Vue instance', () => {
    const wrapper = shallowMount(CoeSelect, { propsData: { items } })

    expect (wrapper.isVueInstance()).toBeTruthy()
  })

  test('label', () => {
    const wrapper = shallowMount(CoeSelect, { propsData: { items, label: 'coe' } })

    expect (wrapper.findAll('label').exists()).toBe(true)
  })

  test('required', () => {
    const wrapper = shallowMount(CoeSelect, { propsData: { items, required: true } })

    expect (wrapper.vm.required).toBe(true)
  })

  test('placeholder', () => {
    const wrapper = shallowMount(CoeSelect, { propsData: { items, placeholder: 'coe' } })

    expect (wrapper.vm.searchableValue[0]).toBe('coe')
  })

  // test('display', () => {
  //   const wrapper = shallowMount(CoeSelect, {
  //     propsData: {
  //       items,
  //       display: 'slug',
  //       displayBy: 'name'
  //     }
  //   })

  //   const input = wrapper.find('.input')
  //   input.trigger('click')
  //   input.trigger('keydown.down') // 0
  //   input.trigger('keydown.enter')

  //   expect(wrapper.vm.value).toBe('slug_boladao1')
  // })

  test('optionSelectPlaceholder', () => {
    const wrapper = shallowMount(CoeSelect, { propsData: { items } })

    expect(wrapper.vm.optionSelectPlaceholder).toBe('Press enter to select')
  })

  test('optionUnselectPlaceholder', () => {
    const wrapper = shallowMount(CoeSelect, {
      propsData: {
        items,
        optionUnselectPlaceholder: 'coe'
      }
    })

    expect(wrapper.vm.optionUnselectPlaceholder).toBe('coe')
  })

  test('clearOnSelect false', () => {
    const wrapper = shallowMount(CoeSelect, {
      propsData: {
        items,
        clearOnSelect: false
      }
    })

    wrapper.setData({ isOpened: true })


    expect(wrapper.vm.searchableValue[0]).toBe('Selecione uma opção')
  })

  test('clearOnSelect true (default)', () => {
    const wrapper = shallowMount(CoeSelect, {
      propsData: {
        items,
        clearOnSelect: true
      }
    })

    const input = wrapper.find('.input')
    input.trigger('click')

    expect(wrapper.vm.searchableValue).toBe('')
  })

  test('is opened', () => {
    const wrapper = mount(CoeSelect, { propsData: { items } })

    const input = wrapper.find('.input')
    input.trigger('click')

    expect(wrapper.vm.isOpened).toBe(true)
  })

  test('is focused', () => {
    const wrapper = mount(CoeSelect, { propsData: { items, clearOnSelect: true } })

    const input = wrapper.find('.input')
    input.trigger('click')

    expect(wrapper.vm.focused && wrapper.vm.clearOnSelect).toBe(true)
  })

  test('pointer 1', () => {
    const wrapper = shallowMount(CoeSelect, { propsData: { items } })

    const input = wrapper.find({ ref: 'searchable' })
    // default pointer: -1
    input.trigger('keydown.down') // 0
    input.trigger('keydown.down') // 1
    input.trigger('keydown.down') // 2

    expect(wrapper.vm.pointer).toBe(2)
  })

  test('is multiple', () => {
    const wrapper = shallowMount(CoeSelect, {
      propsData: {
        items,
        value: [],
        multiple: true
      }
    })

    expect(wrapper.props('multiple')).toBe(true)
  })

  test('validation', () => {
    const wrapper = shallowMount(CoeSelect, {
      propsData: {
        items,
        value: [],
        multiple: true,
        validation: items.length && `Máximo de 3 opções selecionadas`
      }
    })

    expect(wrapper.vm.validation).toBe(`Máximo de 3 opções selecionadas`)
  })

  test('searchable value', () => {
    const wrapper = shallowMount(CoeSelect, { propsData: { items } })

    wrapper.setData({ searchQuery: 'coe' })

    expect(wrapper.vm.searchableValue).toBe('coe')
  })

  test('hide selected', () => {
    const wrapper = shallowMount(CoeSelect, {
      propsData: {
        items,
        multiple: true,
        hideSelected: true,
        display: 'slug',
        displayBy: 'name',
        value: [
          { slug: 'slug_boladao1', name: 'coe1' },
          { slug: 'slug_boladao2', name: 'coe2' }
        ]
      }
    })

    expect(wrapper.vm.options.length).toBe(4)
  })
})
