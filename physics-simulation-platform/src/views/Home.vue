<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="hero-title">物理仿真平台</h1>
      <p class="hero-subtitle">面向教学、科普、自学的全品类物理仿真系统</p>
    </div>
    
    <div class="simulation-cards">
      <n-card
        class="simulation-card"
        hoverable
        @click="$router.push('/pendulum')"
      >
        <template #header>
          <div class="card-header">
            <div class="card-icon" style="background: #18a058;">●</div>
            <span>单摆仿真</span>
          </div>
        </template>
        <p>研究简谐运动规律，探索周期与摆长、重力加速度的关系</p>
        <n-tag type="success" size="small">力学</n-tag>
      </n-card>

      <n-card
        class="simulation-card"
        hoverable
        @click="$router.push('/spring-damper')"
      >
        <template #header>
          <div class="card-header">
            <div class="card-icon" style="background: #2080f0;">◆</div>
            <span>弹簧阻尼仿真</span>
          </div>
        </template>
        <p>分析弹簧振子系统，理解阻尼振动、受迫振动与共振现象</p>
        <n-tag type="primary" size="small">力学</n-tag>
      </n-card>

      <n-card
        class="simulation-card"
        hoverable
        @click="$router.push('/free-fall')"
      >
        <template #header>
          <div class="card-header">
            <div class="card-icon" style="background: #f0a020;">▼</div>
            <span>自由落体仿真</span>
          </div>
        </template>
        <p>探究自由落体运动规律，分析空气阻力对物体下落的影响</p>
        <n-tag type="warning" size="small">力学</n-tag>
      </n-card>

      <n-card
        class="simulation-card"
        hoverable
        @click="$router.push('/diffraction')"
      >
        <template #header>
          <div class="card-header">
            <div class="card-icon" style="background: #722ed1;">◈</div>
            <span>光波衍射仿真</span>
          </div>
        </template>
        <p>研究光的单缝衍射与多缝干涉现象，理解波动光学的基本原理</p>
        <n-tag type="info" size="small">光学</n-tag>
      </n-card>

      <n-card
        class="simulation-card"
        hoverable
        @click="$router.push('/sound-spectrum')"
      >
        <template #header>
          <div class="card-header">
            <div class="card-icon" style="background: #13c2c2;">♪</div>
            <span>声音频谱仿真</span>
          </div>
        </template>
        <p>通过FFT分析声音频谱，理解采样定理、频率分辨率等信号处理概念</p>
        <n-tag type="info" size="small">声学</n-tag>
      </n-card>

      <n-card
        class="simulation-card"
        hoverable
        @click="$router.push('/magnetic-field')"
      >
        <template #header>
          <div class="card-header">
            <div class="card-icon" style="background: #d03050;">◆</div>
            <span>磁场分布仿真</span>
          </div>
        </template>
        <p>可视化电流导线与磁偶极子的磁场分布，研究毕奥-萨伐尔定律</p>
        <n-tag type="error" size="small">电磁学</n-tag>
      </n-card>

      <n-card
        class="simulation-card"
        hoverable
        @click="$router.push('/heat-diffusion')"
      >
        <template #header>
          <div class="card-header">
            <div class="card-icon" style="background: #fa541c;">▲</div>
            <span>热扩散仿真</span>
          </div>
        </template>
        <p>使用有限差分法求解热扩散方程，观察温度场随时间的演变过程</p>
        <n-tag type="warning" size="small">热学</n-tag>
      </n-card>
    </div>

    <div class="features-section">
      <h2 class="section-title">平台特色</h2>
      <div class="features-grid">
        <n-card class="feature-card">
          <template #header>参数调节</template>
          实时调整物理参数，观察不同条件下的运动变化
        </n-card>
        <n-card class="feature-card">
          <template #header>轨迹绘制</template>
          直观展示物体运动轨迹，理解运动过程
        </n-card>
        <n-card class="feature-card">
          <template #header>数据展示</template>
          实时显示位置、速度、加速度、能量等物理量
        </n-card>
        <n-card class="feature-card">
          <template #header>本地存档</template>
          保存仿真参数，方便后续回顾和对比分析
        </n-card>
        <n-card class="feature-card">
          <template #header>自动计算</template>
          自动计算物理量，如周期、频率、波长、磁场强度等
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  margin-bottom: 60px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #18a058 0%, #2080f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: #999;
}

.simulation-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}

.simulation-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.simulation-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
}

.card-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.features-section {
  margin-top: 60px;
}

.section-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 32px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.feature-card {
  text-align: center;
}
</style>
