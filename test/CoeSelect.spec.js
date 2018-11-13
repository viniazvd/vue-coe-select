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

  test('placeholder', () => {
    const wrapper = shallowMount(CoeSelect, { propsData: { items, placeholder: 'coe' } })

    expect (wrapper.vm.searchableValue[0]).toBe('coe')
  })

  // test('open', () => {
  //   const wrapper = mount(CoeSelect, { propsData: { items } })

  //   wrapper.trigger('click')

  //   expect(wrapper.vm.isOpened).toBe(true)
  // })

  // test('items length', async () => {
  //   const wrapper = shallowMount(CoeSelect, { propsData: { items, value: 'coe1' } })
  //   wrapper.setData({ isOpened: true })
  //   // console.log(wrapper.vm.$data.isOpened)

  //   expect (wrapper.findAll('item')).toHaveLength(items.length)
  // })
})
