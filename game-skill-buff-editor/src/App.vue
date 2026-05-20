<template>
  <div class="app-container">
    <el-container class="main-container">
      <el-header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <span class="logo-icon">🎮</span>
            <h1 class="app-title">游戏角色技能 BUFF 编辑器</h1>
          </div>
          <div class="header-info">
            <el-tag type="info" size="small">Vue 3 + Vite + Element Plus</el-tag>
          </div>
        </div>
      </el-header>

      <el-container class="content-container">
        <el-aside width="280px" class="sidebar">
          <el-menu
            :default-active="activeTab"
            class="sidebar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="config">
              <el-icon><Collection /></el-icon>
              <span>职业配置</span>
            </el-menu-item>
            <el-menu-item index="skill">
              <el-icon><MagicStick /></el-icon>
              <span>技能详情</span>
            </el-menu-item>
            <el-menu-item index="battle">
              <el-icon><Edit /></el-icon>
              <span>对战模拟</span>
            </el-menu-item>
          </el-menu>

          <div class="sidebar-footer">
            <div v-if="skillStore.currentConfig" class="current-config">
              <div class="config-label">当前职业</div>
              <div class="config-info">
                <span class="config-icon">{{ skillStore.currentConfig.icon }}</span>
                <span class="config-name">{{ skillStore.currentConfig.name }}</span>
              </div>
              <div class="config-skills-count">
                {{ skillStore.currentConfig.skills.length }} 个技能
              </div>
              <div v-if="skillStore.selectedSkill" class="selected-skill">
                <el-divider />
                <div class="config-label">当前编辑技能</div>
                <div class="skill-info-mini">
                  <span class="skill-icon">{{ skillStore.selectedSkill.icon }}</span>
                  <span class="skill-name">{{ skillStore.selectedSkill.name }}</span>
                </div>
              </div>
            </div>
            <el-empty v-else description="未选择职业" :image-size="60" />
          </div>
        </el-aside>

        <el-main class="main-content">
          <div class="tab-content" v-show="activeTab === 'config'">
            <ClassConfigManager />
          </div>
          <div class="tab-content" v-show="activeTab === 'skill'">
            <SkillDetail />
          </div>
          <div class="tab-content" v-show="activeTab === 'battle'">
            <BattleSimulator />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSkillStore } from './stores/skillStore'
import ClassConfigManager from './components/ClassConfigManager.vue'
import SkillDetail from './components/SkillDetail.vue'
import BattleSimulator from './components/BattleSimulator.vue'
import { Collection, MagicStick, Edit } from '@element-plus/icons-vue'

const skillStore = useSkillStore()
const activeTab = ref('config')

onMounted(() => {
  skillStore.loadFromStorage()
  if (skillStore.classConfigs.length > 0) {
    skillStore.currentConfigId = skillStore.classConfigs[0].id
  }
})

function handleMenuSelect(index: string) {
  activeTab.value = index
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
}

.main-container {
  height: 100%;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
}

.app-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.content-container {
  height: calc(100% - 60px);
}

.sidebar {
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}

.current-config {
  text-align: center;
}

.config-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.config-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 4px;
}

.config-icon {
  font-size: 24px;
}

.config-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.config-skills-count {
  font-size: 12px;
  color: #606266;
}

.selected-skill {
  margin-top: 8px;
}

.skill-info-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.skill-info-mini .skill-icon {
  font-size: 18px;
}

.skill-info-mini .skill-name {
  font-size: 13px;
  font-weight: 500;
  color: #409eff;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
  overflow: hidden;
}

.tab-content {
  height: 100%;
  overflow: hidden;
}
</style>
