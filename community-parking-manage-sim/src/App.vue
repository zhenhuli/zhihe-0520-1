<template>
  <div class="min-vh-100 py-4">
    <div class="container">
      <header class="text-center mb-5">
        <h1 class="display-5 fw-bold text-primary mb-2">
          <i class="bi bi-car-front-fill me-2"></i>
          小区车位智能调度模拟系统
        </h1>
        <p class="text-muted">实时监控车位状态 · 智能调度停车资源 · 自动计费管理</p>
      </header>

      <StatisticsPanel />
      
      <div class="row g-4 mt-4">
        <div class="col-lg-8">
          <ParkingVisualization />
        </div>
        <div class="col-lg-4">
          <ParkingForm />
        </div>
      </div>

      <ParkingRecords class="mt-4" />
    </div>
  </div>
</template>

<script setup>
import StatisticsPanel from './components/StatisticsPanel.vue';
import ParkingVisualization from './components/ParkingVisualization.vue';
import ParkingForm from './components/ParkingForm.vue';
import ParkingRecords from './components/ParkingRecords.vue';
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
</style>
