<template>
  <n-config-provider>
    <n-message-provider>
      <div class="app-container">
        <n-layout style="height: 100vh">
          <n-layout-header bordered class="app-header">
            <div class="header-content">
              <div class="logo-section" @click="$router.push('/')">
                <div class="logo-icon">⚛</div>
                <span class="app-title">物理仿真平台</span>
              </div>
              <n-menu
                mode="horizontal"
                :value="activeMenu"
                @update:value="handleMenuClick"
                :options="menuOptions"
              />
            </div>
          </n-layout-header>
          <n-layout-content>
            <router-view />
          </n-layout-content>
        </n-layout>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuOptions = [
  {
    label: '首页',
    key: '/'
  },
  {
    label: '力学仿真',
    key: 'mechanics',
    children: [
      {
        label: '单摆',
        key: '/pendulum'
      },
      {
        label: '弹簧阻尼',
        key: '/spring-damper'
      },
      {
        label: '自由落体',
        key: '/free-fall'
      }
    ]
  },
  {
    label: '光学仿真',
    key: 'optics',
    children: [
      {
        label: '光波衍射',
        key: '/diffraction'
      }
    ]
  },
  {
    label: '声学仿真',
    key: 'acoustics',
    children: [
      {
        label: '声音频谱',
        key: '/sound-spectrum'
      }
    ]
  },
  {
    label: '电磁学仿真',
    key: 'electromagnetism',
    children: [
      {
        label: '磁场分布',
        key: '/magnetic-field'
      }
    ]
  },
  {
    label: '热学仿真',
    key: 'thermodynamics',
    children: [
      {
        label: '热扩散',
        key: '/heat-diffusion'
      }
    ]
  },
  {
    label: '实验管理',
    key: 'lab',
    children: [
      {
        label: '实验台账',
        key: '/experiment-records'
      },
      {
        label: '实验模板',
        key: '/experiment-templates'
      },
      {
        label: '参数对比',
        key: '/parameter-comparison'
      }
    ]
  }
]

const activeMenu = computed(() => route.path)

function handleMenuClick(key) {
  const parentKeys = ['mechanics', 'optics', 'acoustics', 'electromagnetism', 'thermodynamics', 'lab']
  if (!parentKeys.includes(key)) {
    router.push(key)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
}
</style>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
}

.app-header {
  padding: 0 24px;
  background: #fff;
}

.header-content {
  display: flex;
  align-items: center;
  height: 64px;
  gap: 40px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-icon {
  font-size: 32px;
  background: linear-gradient(135deg, #18a058 0%, #2080f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #18a058 0%, #2080f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
