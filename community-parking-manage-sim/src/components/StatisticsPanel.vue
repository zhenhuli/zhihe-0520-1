<template>
  <div class="row g-3">
    <div class="col-md-3 col-sm-6">
      <div class="card card-shadow stat-card fixed">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted mb-1">固定车位</h6>
              <h3 class="fw-bold text-primary">{{ statistics.totalFixed }}</h3>
            </div>
            <div class="fs-3 text-primary">
              <i class="bi bi-house-door-fill"></i>
            </div>
          </div>
          <div class="mt-2">
            <span class="badge bg-success">空闲 {{ statistics.availableFixed }}</span>
            <span class="badge bg-danger ms-2">占用 {{ statistics.occupiedFixed }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-3 col-sm-6">
      <div class="card card-shadow stat-card temporary">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted mb-1">临时车位</h6>
              <h3 class="fw-bold text-success">{{ statistics.totalTemporary }}</h3>
            </div>
            <div class="fs-3 text-success">
              <i class="bi bi-car-front"></i>
            </div>
          </div>
          <div class="mt-2">
            <span class="badge bg-success">空闲 {{ statistics.availableTemporary }}</span>
            <span class="badge bg-danger ms-2">占用 {{ statistics.occupiedTemporary }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-3 col-sm-6">
      <div class="card card-shadow stat-card available">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted mb-1">总空闲车位</h6>
              <h3 class="fw-bold text-info">{{ statistics.totalAvailable }}</h3>
            </div>
            <div class="fs-3 text-info">
              <i class="bi bi-check-circle-fill"></i>
            </div>
          </div>
          <div class="mt-2">
            <div class="progress" style="height: 8px;">
              <div class="progress-bar bg-info" 
                   :style="{ width: occupancyRate + '%' }"></div>
            </div>
            <small class="text-muted">使用率: {{ occupancyRate.toFixed(1) }}%</small>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-3 col-sm-6">
      <div class="card card-shadow stat-card income">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted mb-1">今日收入</h6>
              <h3 class="fw-bold text-warning">¥{{ statistics.todayIncome }}</h3>
            </div>
            <div class="fs-3 text-warning">
              <i class="bi bi-currency-yen"></i>
            </div>
          </div>
          <div class="mt-2">
            <small class="text-muted">累计收入: ¥{{ statistics.totalIncome }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useParkingStore } from '@/utils/parkingStore';

const { statistics } = useParkingStore();

const occupancyRate = computed(() => {
  const total = statistics.value.totalSlots;
  const occupied = statistics.value.totalOccupied;
  return total > 0 ? (occupied / total) * 100 : 0;
});
</script>
