<template>
  <div class="card card-shadow h-100">
    <div class="card-header bg-white border-bottom">
      <h5 class="card-title mb-0">
        <i class="bi bi-gear me-2 text-primary"></i>
        停车操作
      </h5>
    </div>
    <div class="card-body">
      <div class="mb-3">
        <label class="form-label">操作类型</label>
        <div class="btn-group w-100">
          <input type="radio" class="btn-check" name="operationType" id="park" v-model="operationType" value="park" autocomplete="off">
          <label class="btn btn-outline-primary" for="park">车辆入场</label>
          <input type="radio" class="btn-check" name="operationType" id="release" v-model="operationType" value="release" autocomplete="off">
          <label class="btn btn-outline-danger" for="release">车辆出场</label>
        </div>
      </div>

      <div v-if="operationType === 'park'" class="mb-3">
        <label class="form-label">车辆类型</label>
        <div class="btn-group w-100">
          <input type="radio" class="btn-check" name="vehicleType" id="owner" v-model="vehicleType" value="owner" autocomplete="off">
          <label class="btn btn-outline-info" for="owner">业主车辆</label>
          <input type="radio" class="btn-check" name="vehicleType" id="visitor" v-model="vehicleType" value="visitor" autocomplete="off">
          <label class="btn btn-outline-warning" for="visitor">外来车辆</label>
        </div>
      </div>

      <div v-if="operationType === 'park' && vehicleType === 'visitor'" class="mb-3">
        <label for="plateNumber" class="form-label">车牌号</label>
        <input type="text" class="form-control" id="plateNumber" v-model="plateNumber" placeholder="请输入车牌号（选填">
      </div>

      <div class="mb-3">
        <label for="slotSelect" class="form-label">选择车位</label>
        <select class="form-select" id="slotSelect" v-model="selectedSlotId">
          <option value="">-- 请选择车位 --</option>
          <optgroup v-if="!isVisitorParking" label="固定车位">
            <option v-for="slot in availableFixedSlots" :key="slot.id" :value="slot.id">
              {{ slot.id }}
            </option>
          </optgroup>
          <optgroup label="临时车位">
            <option v-for="slot in availableTemporarySlots" :key="slot.id" :value="slot.id">
              {{ slot.id }}
            </option>
          </optgroup>
        </select>
        <div v-if="operationType === 'release'" class="form-text text-danger">
          车辆出场请选择已占用的车位
        </div>
        <div v-if="isVisitorParking" class="form-text text-warning">
          <i class="bi bi-info-circle me-1"></i>
          外来车辆仅可使用临时车位
        </div>
      </div>

      <div v-if="selectedSlot" class="mb-3 p-3 bg-light rounded">
        <div class="small text-muted mb-1">车位信息</div>
        <div class="d-flex justify-content-between">
          <span>车位编号:</span>
          <span class="fw-bold">{{ selectedSlot.id }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>车位类型:</span>
          <span :class="selectedSlot.type === 'fixed' ? 'text-primary' : 'text-success'">
            {{ selectedSlot.type === 'fixed' ? '固定车位' : '临时车位' }}
          </span>
        </div>
        <div v-if="selectedSlot.status === 'occupied'" class="d-flex justify-content-between">
          <span>当前车辆:</span>
          <span class="fw-bold">{{ selectedSlot.plateNumber }}</span>
        </div>
        <div v-if="selectedSlot.status === 'occupied' && selectedSlot.type === 'temporary'" class="mt-2 p-2 bg-warning bg-opacity-10 rounded">
          <div class="d-flex justify-content-between small">
            <span>预计费用:</span>
            <span class="fw-bold text-warning">¥{{ currentFee }}</span>
          </div>
          <div class="d-flex justify-content-between small">
            <span>停车时长:</span>
            <span>{{ currentDuration }}小时</span>
          </div>
        </div>
      </div>

      <button class="btn btn-primary w-100" 
              :class="operationType === 'park' ? 'btn-success' : 'btn-danger'"
              :disabled="!canSubmit"
              @click="handleSubmit">
        <i :class="operationType === 'park' ? 'bi bi-arrow-down-circle' : 'bi bi-arrow-up-circle'" class="me-2"></i>
        {{ operationType === 'park' ? '确认入场' : '确认出场' }}
      </button>

      <button class="btn btn-outline-secondary w-100 mt-2"
              @click="handleReset">
        <i class="bi bi-arrow-clockwise me-2"></i>
        重置停车场
      </button>

      <div class="mt-4 p-3 bg-info bg-opacity-10 rounded">
        <h6 class="text-info mb-2">
          <i class="bi bi-info-circle me-1"></i>
          收费标准
        </h6>
        <ul class="list-unstyled small mb-0">
          <li>• 固定车位：业主免费使用</li>
          <li>• 临时车位：{{ hourlyRate }}元/小时</li>
          <li>• 每日最高：{{ dailyMax }}元封顶</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useParkingStore } from '@/utils/parkingStore';

const { 
  fixedSlots, 
  temporarySlots, 
  parkOwnerVehicle, 
  parkTemporaryVehicle, 
  releaseSlot, 
  getSlotById, 
  resetParkingLot,
  getCurrentDuration,
  HOURLY_RATE,
  FREE_DAILY_MAX
} = useParkingStore();

const operationType = ref('park');
const vehicleType = ref('owner');
const plateNumber = ref('');
const selectedSlotId = ref('');

const hourlyRate = HOURLY_RATE;
const dailyMax = FREE_DAILY_MAX;

const availableFixedSlots = computed(() => {
  if (operationType.value === 'park') {
    return fixedSlots.value.filter(s => s.status === 'available');
  } else {
    return fixedSlots.value.filter(s => s.status === 'occupied');
  }
});

const availableTemporarySlots = computed(() => {
  if (operationType.value === 'park') {
    return temporarySlots.value.filter(s => s.status === 'available');
  } else {
    return temporarySlots.value.filter(s => s.status === 'occupied');
  }
});

const selectedSlot = computed(() => {
  if (!selectedSlotId.value) return null;
  return getSlotById(selectedSlotId.value);
});

const currentDuration = computed(() => {
  if (!selectedSlotId.value) return 0;
  const info = getCurrentDuration(selectedSlotId.value);
  return info.durationHours || 0;
});

const currentFee = computed(() => {
  if (!selectedSlotId.value) return 0;
  const info = getCurrentDuration(selectedSlotId.value);
  return info.fee || 0;
});

const isVisitorParking = computed(() => {
  return operationType.value === 'park' && vehicleType.value === 'visitor';
});

const canSubmit = computed(() => {
  return !!selectedSlotId.value;
});

const handleSubmit = () => {
  if (!canSubmit.value) return;

  if (operationType.value === 'park') {
    const slot = getSlotById(selectedSlotId.value);
    
    if (vehicleType.value === 'visitor' && slot.type === 'fixed') {
      alert('外来车辆不可停放在固定车位，请选择临时车位');
      return;
    }

    let result;
    if (vehicleType.value === 'owner') {
      result = parkOwnerVehicle(selectedSlotId.value);
    } else {
      result = parkTemporaryVehicle(selectedSlotId.value, plateNumber.value || null);
    }
    if (result.success) {
      alert(result.message);
      resetForm();
    } else {
      alert(result.message);
    }
  } else {
    const result = releaseSlot(selectedSlotId.value);
    if (result.success) {
      if (result.fee > 0) {
        alert(`车辆已驶出，停车时长：${result.durationHours}小时，费用：¥${result.fee}`);
      } else {
        alert('业主车辆已驶出');
      }
      resetForm();
    } else {
      alert(result.message);
    }
  }
};

const handleReset = () => {
  if (confirm('确定要重置整个停车场吗？所有停车记录将被清除。')) {
    resetParkingLot();
    resetForm();
  }
};

const resetForm = () => {
  selectedSlotId.value = '';
  plateNumber.value = '';
};

watch([operationType, vehicleType], () => {
  selectedSlotId.value = '';
});
</script>
