<template>
  <n-card title="种苗信息录入" :bordered="false">
    <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top">
      <n-form-item label="畜禽种类" path="type">
        <n-select v-model:value="formValue.type" :options="typeOptions" placeholder="请选择畜禽种类" />
      </n-form-item>
      <n-form-item label="购入日期" path="purchaseDate">
        <n-date-picker v-model:value="formValue.purchaseDate" type="date" placeholder="选择购入日期" style="width: 100%" />
      </n-form-item>
      <n-form-item label="养殖数量" path="quantity">
        <n-input-number v-model:value="formValue.quantity" :min="1" placeholder="请输入养殖数量" style="width: 100%" />
      </n-form-item>
      <n-form-item label="批次名称" path="batchName">
        <n-input v-model:value="formValue.batchName" placeholder="请输入批次名称（可选）" />
      </n-form-item>
      <n-space>
        <n-button type="primary" @click="handleSubmit">生成养殖计划</n-button>
        <n-button @click="handleReset">重置</n-button>
      </n-space>
    </n-form>
  </n-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { livestockTypes } from '../data/livestockData'

const emit = defineEmits(['submit'])

const formRef = ref(null)
const formValue = reactive({
  type: null,
  purchaseDate: null,
  quantity: 100,
  batchName: ''
})

const typeOptions = Object.entries(livestockTypes).map(([key, value]) => ({
  label: value.name,
  value: key
}))

const rules = {
  type: { required: true, message: '请选择畜禽种类', trigger: 'change' },
  purchaseDate: [
    { 
      validator: (rule, value) => {
        if (value === null || value === undefined) {
          return false
        }
        if (Array.isArray(value) && value.length === 0) {
          return false
        }
        let actualValue = value
        if (Array.isArray(value)) {
          actualValue = value[0]
        }
        if (typeof actualValue === 'number' && actualValue > 0) return true
        if (actualValue instanceof Date && !isNaN(actualValue.getTime())) return true
        return false
      },
      message: '请选择购入日期',
      trigger: 'change'
    }
  ],
  quantity: { required: true, type: 'number', min: 1, message: '请输入有效的养殖数量', trigger: 'change' }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    const submitData = { ...formValue }
    let dateValue = submitData.purchaseDate
    if (Array.isArray(dateValue)) {
      dateValue = dateValue[0]
    }
    if (typeof dateValue === 'number') {
      submitData.purchaseDate = new Date(dateValue)
    } else if (dateValue instanceof Date) {
      submitData.purchaseDate = dateValue
    }
    emit('submit', submitData)
  } catch (errors) {
    console.log('表单验证错误:', errors)
  }
}

function handleReset() {
  formRef.value?.restoreValidation()
  formValue.type = null
  formValue.purchaseDate = null
  formValue.quantity = 100
  formValue.batchName = ''
}
</script>
