<template>
  <div class="card card-shadow">
    <div class="card-header bg-white border-bottom">
      <h5 class="card-title mb-0">
        <i class="bi bi-p-square me-2 text-primary"></i>
        车位分布视图
      </h5>
    </div>
    <div class="card-body">
      <ul class="nav nav-tabs mb-3" id="parkingTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" 
                  id="fixed-tab" 
                  data-bs-toggle="tab" 
                  data-bs-target="#fixed-parking"
                  type="button" 
                  role="tab"
                  aria-controls="fixed-parking" 
                  aria-selected="true">
            固定车位 ({{ statistics.availableFixed }}/{{ statistics.totalFixed }})
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" 
                  id="temporary-tab" 
                  data-bs-toggle="tab" 
                  data-bs-target="#temporary-parking"
                  type="button" 
                  role="tab"
                  aria-controls="temporary-parking" 
                  aria-selected="false">
            临时车位 ({{ statistics.availableTemporary }}/{{ statistics.totalTemporary }})
          </button>
        </li>
      </ul>

      <div class="tab-content" id="parkingTabsContent">
        <div class="tab-pane fade show active" id="fixed-parking" role="tabpanel" aria-labelledby="fixed-tab">
          <div class="d-flex flex-wrap gap-2">
            <div v-for="slot in fixedSlots" 
                 :key="slot.id"
                 class="parking-slot p-3 rounded text-center"
                 :class="getSlotClass(slot)"
                 @click="handleSlotClick(slot)">
              <div class="fw-bold mb-1">{{ slot.id }}</div>
              <div v-if="slot.status === 'occupied'" class="small text-truncate">
                <div class="text-nowrap">{{ slot.plateNumber }}</div>
                <div class="text-muted">{{ slot.ownerName }}</div>
              </div>
              <div v-else class="small text-muted">
                <i class="bi bi-car-front"></i> 空闲
              </div>
            </div>
          </div>
        </div>
        <div class="tab-pane fade" id="temporary-parking" role="tabpanel" aria-labelledby="temporary-tab">
          <div class="d-flex flex-wrap gap-2">
            <div v-for="slot in temporarySlots" 
                 :key="slot.id"
                 class="parking-slot p-3 rounded text-center"
                 :class="getSlotClass(slot)"
                 @click="handleSlotClick(slot)">
              <div class="fw-bold mb-1">{{ slot.id }}</div>
              <div v-if="slot.status === 'occupied'" class="small text-truncate">
                <div class="text-nowrap">{{ slot.plateNumber }}</div>
                <div class="text-muted">已停 {{ getCurrentDuration(slot.id).durationHours }}小时</div>
              </div>
              <div v-else class="small text-muted">
                <i class="bi bi-car-front"></i> 空闲
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 d-flex justify-content-center gap-4">
        <div class="d-flex align-items-center">
          <span class="d-inline-block w-3 h-3 bg-success rounded me-2"></span>
          <small class="text-muted">空闲</small>
        </div>
        <div class="d-flex align-items-center">
          <span class="d-inline-block w-3 h-3 bg-danger rounded me-2"></span>
          <small class="text-muted">已占用</small>
        </div>
        <div class="d-flex align-items-center">
          <span class="d-inline-block w-3 h-3 bg-warning rounded me-2"></span>
          <small class="text-muted">预留</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useParkingStore } from '@/utils/parkingStore';

const emit = defineEmits(['slot-selected']);

const { fixedSlots, temporarySlots, statistics, getCurrentDuration, releaseSlot } = useParkingStore();

const getSlotClass = (slot) => {
  const classes = [];
  if (slot.status === 'available') {
    classes.push('available');
  } else if (slot.status === 'occupied') {
    classes.push('occupied');
  } else {
    classes.push('reserved');
  }
  if (slot.type === 'fixed') {
    classes.push('border-primary');
  } else {
    classes.push('border-success');
  }
  return classes;
};

const handleSlotClick = (slot) => {
  emit('slot-selected', slot);
};
</script>

<style scoped>
.w-3 {
  width: 1rem;
  height: 1rem;
}

.h-3 {
  height: 1rem;
}

.parking-slot {
  min-width: 100px;
  min-height: 80px;
}

.border-primary {
  border-color: #0d6efd !important;
}

.border-success {
  border-color: #198754 !important;
}
</style>
