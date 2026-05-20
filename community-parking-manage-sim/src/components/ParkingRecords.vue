<template>
  <div class="card card-shadow">
    <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0">
        <i class="bi bi-list-ul me-2 text-primary"></i>
        停车记录
      </h5>
      <span class="badge bg-secondary">{{ records.length }} 条记录</span>
    </div>
    <div class="card-body p-0">
      <div v-if="records.length === 0" class="text-center py-5 text-muted">
        <i class="bi bi-inbox display-1 mb-3"></i>
        <p>暂无停车记录</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col">记录ID</th>
              <th scope="col">车位编号</th>
              <th scope="col">车牌号</th>
              <th scope="col">车辆类型</th>
              <th scope="col">入场时间</th>
              <th scope="col">出场时间</th>
              <th scope="col">停车时长</th>
              <th scope="col">费用</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td class="small">#{{ record.id }}</td>
              <td>
                <span class="badge" :class="record.type === 'fixed' ? 'bg-primary' : 'bg-success'">
                  {{ record.slotId }}
                </span>
              </td>
              <td class="fw-bold">{{ record.plateNumber }}</td>
              <td>{{ record.type === 'fixed' ? '业主车辆' : '外来车辆' }}</td>
              <td class="small">{{ formatTime(record.startTime) }}</td>
              <td class="small">{{ formatTime(record.endTime) }}</td>
              <td>{{ record.durationHours }} 小时</td>
              <td>
                <span v-if="record.fee > 0" class="text-warning fw-bold">
                  ¥{{ record.fee }}
                </span>
                <span v-else class="text-muted">免费</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useParkingStore } from '@/utils/parkingStore';

const { state } = useParkingStore();

const records = computed(() => state.parkingRecords);

const formatTime = (time) => {
  if (!time) return '-';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
</script>
