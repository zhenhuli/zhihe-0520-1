<template>
  <div class="class-config-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>职业配置管理</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              新建职业
            </el-button>
            <el-button type="success" size="small" @click="handleImport">
              <el-icon><Upload /></el-icon>
              导入配置
            </el-button>
          </div>
        </div>
      </template>

      <div class="config-list">
        <div
          v-for="config in skillStore.classConfigs"
          :key="config.id"
          class="config-card"
          :class="{ active: skillStore.currentConfigId === config.id }"
          @click="selectConfig(config.id)"
        >
          <div class="config-header">
            <div class="config-icon">{{ config.icon }}</div>
            <div class="config-info">
              <h3 class="config-name">{{ config.name }}</h3>
              <p class="config-desc">{{ config.description }}</p>
            </div>
          </div>

          <el-divider />

          <div class="config-stats">
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>{{ config.baseStats.maxHp }}</span>
            </div>
            <div class="stat-item">
              <el-icon><MagicStick /></el-icon>
              <span>{{ config.baseStats.maxMana }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Edit /></el-icon>
              <span>{{ config.baseStats.attack }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Warning /></el-icon>
              <span>{{ config.baseStats.defense }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Timer /></el-icon>
              <span>{{ config.baseStats.speed }}</span>
            </div>
          </div>

          <div class="config-skills">
            <span class="skills-label">技能 ({{ config.skills.length }})</span>
            <div class="skill-icons">
              <span v-for="skill in config.skills.slice(0, 6)" :key="skill.id" :title="skill.name">
                {{ skill.icon }}
              </span>
              <span v-if="config.skills.length > 6" class="more-skills">+{{ config.skills.length - 6 }}</span>
            </div>
          </div>

          <div class="config-meta">
            <span class="update-time">更新于: {{ formatDate(config.updatedAt) }}</span>
          </div>

          <div class="config-actions">
            <el-button size="small" text @click.stop="handleEdit(config)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" text @click.stop="handleDuplicate(config.id)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button size="small" text @click.stop="handleExport(config.id)">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button size="small" text type="danger" @click.stop="handleDelete(config.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="skillStore.classConfigs.length === 0" description="暂无职业配置，点击上方按钮创建" />
    </el-card>

    <el-dialog
      v-model="showCreateDialog"
      title="新建职业"
      width="500px"
    >
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="职业名称">
          <el-input v-model="createForm.name" placeholder="请输入职业名称" />
        </el-form-item>
        <el-form-item label="职业图标">
          <el-select v-model="createForm.icon">
            <el-option v-for="icon in iconOptions" :key="icon" :label="icon" :value="icon" />
          </el-select>
        </el-form-item>
        <el-form-item label="职业描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-divider content-position="left">基础属性</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生命值">
              <el-input-number v-model="createForm.baseStats.maxHp" :min="100" :max="10000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法力值">
              <el-input-number v-model="createForm.baseStats.maxMana" :min="100" :max="5000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="攻击力">
              <el-input-number v-model="createForm.baseStats.attack" :min="10" :max="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="防御力">
              <el-input-number v-model="createForm.baseStats.defense" :min="10" :max="500" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="速度">
              <el-input-number v-model="createForm.baseStats.speed" :min="10" :max="200" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showEditDialog"
      title="编辑职业"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="职业名称">
          <el-input v-model="editForm.name" placeholder="请输入职业名称" />
        </el-form-item>
        <el-form-item label="职业图标">
          <el-select v-model="editForm.icon">
            <el-option v-for="icon in iconOptions" :key="icon" :label="icon" :value="icon" />
          </el-select>
        </el-form-item>
        <el-form-item label="职业描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-divider content-position="left">基础属性</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生命值">
              <el-input-number v-model="editForm.baseStats.maxHp" :min="100" :max="10000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法力值">
              <el-input-number v-model="editForm.baseStats.maxMana" :min="100" :max="5000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="攻击力">
              <el-input-number v-model="editForm.baseStats.attack" :min="10" :max="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="防御力">
              <el-input-number v-model="editForm.baseStats.defense" :min="10" :max="500" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="速度">
              <el-input-number v-model="editForm.baseStats.speed" :min="10" :max="200" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useSkillStore } from '../stores/skillStore'
import type { ClassConfig } from '../types'
import {
  Plus,
  Upload,
  Star,
  MagicStick,
  Edit,
  Warning,
  Timer,
  CopyDocument,
  Download,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const skillStore = useSkillStore()

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const editingConfigId = ref<string | null>(null)

const iconOptions = ['🗡️', '🛡️', '🔮', '🏹', '⚔️', '🔥', '❄️', '⚡', '🌊', '🌿', '💫', '💀', '☠️', '🎭', '👑', '🧙', '🧝', '🧚', '🦸', '🥷']

const createForm = reactive({
  name: '',
  icon: '🎭',
  description: '',
  baseStats: {
    maxHp: 1000,
    maxMana: 500,
    attack: 100,
    defense: 50,
    speed: 70
  }
})

const editForm = reactive({
  name: '',
  icon: '🎭',
  description: '',
  baseStats: {
    maxHp: 1000,
    maxMana: 500,
    attack: 100,
    defense: 50,
    speed: 70
  }
})

function selectConfig(configId: string) {
  skillStore.currentConfigId = configId
  skillStore.selectedSkillId = null
}

function handleCreate() {
  if (!createForm.name.trim()) {
    ElMessage.warning('请输入职业名称')
    return
  }
  const newConfig = skillStore.createNewConfig(createForm.name)
  skillStore.updateConfig(newConfig.id, {
    icon: createForm.icon,
    description: createForm.description,
    baseStats: { ...createForm.baseStats }
  })
  skillStore.currentConfigId = newConfig.id
  showCreateDialog.value = false
  resetCreateForm()
  ElMessage.success('职业创建成功')
}

function resetCreateForm() {
  createForm.name = ''
  createForm.icon = '🎭'
  createForm.description = ''
  createForm.baseStats = {
    maxHp: 1000,
    maxMana: 500,
    attack: 100,
    defense: 50,
    speed: 70
  }
}

function handleEdit(config: ClassConfig) {
  editingConfigId.value = config.id
  editForm.name = config.name
  editForm.icon = config.icon
  editForm.description = config.description
  editForm.baseStats = { ...config.baseStats }
  showEditDialog.value = true
}

function handleSaveEdit() {
  if (!editingConfigId.value) return
  if (!editForm.name.trim()) {
    ElMessage.warning('请输入职业名称')
    return
  }
  skillStore.updateConfig(editingConfigId.value, {
    name: editForm.name,
    icon: editForm.icon,
    description: editForm.description,
    baseStats: { ...editForm.baseStats }
  })
  showEditDialog.value = false
  editingConfigId.value = null
  ElMessage.success('保存成功')
}

function handleDuplicate(configId: string) {
  const duplicated = skillStore.duplicateConfig(configId)
  if (duplicated) {
    ElMessage.success(`已复制配置: ${duplicated.name}`)
  }
}

function handleDelete(configId: string) {
  ElMessageBox.confirm('确定要删除这个职业配置吗？此操作不可恢复！', '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(() => {
    skillStore.deleteConfig(configId)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleExport(configId: string) {
  const json = skillStore.exportConfig(configId)
  const config = skillStore.classConfigs.find(c => c.id === configId)
  if (json && config) {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.name}_配置.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  }
}

function handleImport() {
  fileInput.value?.click()
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const json = e.target?.result as string
      const imported = skillStore.importConfig(json)
      if (imported) {
        ElMessage.success(`导入成功: ${imported.name}`)
      } else {
        ElMessage.error('导入失败：文件格式不正确')
      }
    } catch (err) {
      ElMessage.error('导入失败：文件解析错误')
    }
  }
  reader.readAsText(file)
  target.value = ''
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.class-config-manager {
  height: 100%;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.config-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.config-card {
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.config-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.config-card.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #ecf5ff 0%, white 100%);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.config-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.config-info {
  flex: 1;
  min-width: 0;
}

.config-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.config-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.config-stats {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
}

.stat-item .el-icon {
  font-size: 18px;
  color: #409eff;
}

.stat-item span {
  font-weight: 600;
  color: #303133;
}

.config-skills {
  padding: 8px 0;
}

.skills-label {
  font-size: 12px;
  color: #909399;
  margin-right: 8px;
}

.skill-icons {
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
}

.skill-icons span {
  font-size: 18px;
}

.more-skills {
  font-size: 12px !important;
  color: #909399;
  font-weight: 500;
}

.config-meta {
  padding: 8px 0;
}

.update-time {
  font-size: 11px;
  color: #c0c4cc;
}

.config-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.config-actions .el-button {
  flex: 1;
}
</style>
