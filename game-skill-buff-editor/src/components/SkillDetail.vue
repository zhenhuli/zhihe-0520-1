<template>
  <div class="skill-detail">
    <el-row :gutter="20" class="h-full">
      <el-col :span="8" class="left-panel">
        <el-card class="skill-list-card">
          <template #header>
            <div class="card-header">
            <span>技能列表</span>
            <el-button type="primary" size="small" @click="handleAddSkill" :disabled="!skillStore.currentConfigId">
              <el-icon><Plus /></el-icon>
              添加技能
            </el-button>
          </div>
          </template>

          <div v-if="!skillStore.currentConfig" class="empty-state">
            <el-empty description="请先在职业配置中选择一个职业" />
          </div>

          <div v-else class="skill-list">
            <div
              v-for="skill in skillStore.currentConfig.skills"
              :key="skill.id"
              class="skill-item"
              :class="{ active: skillStore.selectedSkillId === skill.id }"
              @click="skillStore.selectedSkillId = skill.id"
            >
              <div class="skill-icon" :style="{ backgroundColor: ELEMENT_COLORS[skill.element] }">
                {{ skill.icon }}
              </div>
              <div class="skill-info">
                <div class="skill-name">
                  <el-tag :type="skill.type === 'active' ? 'primary' : 'success'" size="small" class="mr-2">
                    {{ skill.type === 'active' ? '主动' : '被动' }}
                  </el-tag>
                  <span>{{ skill.name }}</span>
                </div>
                <div class="skill-desc">{{ skill.description }}</div>
                <div class="skill-stats">
                  <span v-if="skill.damage > 0" class="stat-item">
                    <el-icon><Edit /></el-icon>
                    {{ skill.damage }}
                  </span>
                  <span v-if="skill.cooldown > 0" class="stat-item">
                    <el-icon><Timer /></el-icon>
                    {{ skill.cooldown }}s
                  </span>
                  <span v-if="skill.maxStacks > 1" class="stat-item">
                    <el-icon><Collection /></el-icon>
                    x{{ skill.maxStacks }}
                  </span>
                </div>
              </div>
              <el-button
                type="danger"
                size="small"
                text
                @click.stop="handleDeleteSkill(skill.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16" class="right-panel">
        <div v-if="!skillStore.selectedSkill" class="empty-state">
          <el-empty description="请从左侧选择一个技能进行编辑" />
        </div>

        <div v-else>
          <el-tabs v-model="activeTab" type="card">
            <el-tab-pane label="基础属性" name="basic">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>{{ skillStore.selectedSkill.icon }} {{ skillStore.selectedSkill.name }}</span>
                  </div>
                </template>
                <el-form :model="skillForm" label-width="120px" @submit.prevent>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="技能名称">
                        <el-input v-model="skillForm.name" @change="updateSkill" />
                      </el-form-item>
                      <el-form-item label="技能图标">
                        <el-select v-model="skillForm.icon" @change="updateSkill">
                          <el-option v-for="icon in iconOptions" :key="icon" :label="icon" :value="icon" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="技能类型">
                        <el-radio-group v-model="skillForm.type" @change="updateSkill">
                          <el-radio-button value="active">主动技能</el-radio-button>
                          <el-radio-button value="passive">被动技能</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item label="元素类型">
                        <el-select v-model="skillForm.element" @change="updateSkill">
                          <el-option
                            v-for="(name, key) in ELEMENT_NAMES"
                            :key="key"
                            :label="name"
                            :value="key"
                          >
                            <span style="float: left">{{ name }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">
                              <span
                                class="color-dot"
                                :style="{ backgroundColor: ELEMENT_COLORS[key as SkillElement] }"
                              ></span>
                            </span>
                          </el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="技能描述">
                        <el-input
                          v-model="skillForm.description"
                          type="textarea"
                          :rows="3"
                          @change="updateSkill"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="冷却时间">
                        <el-input-number
                          v-model="skillForm.cooldown"
                          :min="0"
                          :max="300"
                          :step="1"
                          style="width: 100%"
                          @change="updateSkill"
                        >
                          <template #append>秒</template>
                        </el-input-number>
                      </el-form-item>
                      <el-form-item label="伤害数值">
                        <el-input-number
                          v-model="skillForm.damage"
                          :min="0"
                          :max="10000"
                          :step="10"
                          style="width: 100%"
                          @change="updateSkill"
                        >
                          <template #append>点</template>
                        </el-input-number>
                      </el-form-item>
                      <el-form-item label="持续时长">
                        <el-input-number
                          v-model="skillForm.duration"
                          :min="0"
                          :max="300"
                          :step="1"
                          style="width: 100%"
                          @change="updateSkill"
                        >
                          <template #append>秒</template>
                        </el-input-number>
                      </el-form-item>
                      <el-form-item label="叠加层数">
                        <el-input-number
                          v-model="skillForm.maxStacks"
                          :min="1"
                          :max="10"
                          :step="1"
                          style="width: 100%"
                          @change="updateSkill"
                        >
                          <template #append>层</template>
                        </el-input-number>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </el-card>
            </el-tab-pane>

            <el-tab-pane label="BUFF 效果" name="buff">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>BUFF 效果列表</span>
                    <el-button type="primary" size="small" @click="handleAddBuff">
                      <el-icon><Plus /></el-icon>
                      添加 BUFF
                    </el-button>
                  </div>
                </template>
                <div class="buff-list">
                  <div
                    v-for="buff in skillForm.buffs"
                    :key="buff.id"
                    class="buff-item"
                  >
                    <div class="buff-header">
                      <el-input
                        v-model="buff.name"
                        size="small"
                        style="width: 200px"
                        @change="updateBuff(buff)"
                      />
                      <el-button
                        type="danger"
                        size="small"
                        text
                        @click="handleDeleteBuff(buff.id)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    <el-row :gutter="10" class="buff-form">
                      <el-col :span="6">
                        <el-form-item label="类型" label-width="40px">
                          <el-select v-model="buff.type" @change="updateBuff(buff)" size="small">
                            <el-option
                              v-for="(name, key) in BUFF_TYPE_NAMES"
                              :key="key"
                              :label="name"
                              :value="key"
                            />
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :span="6">
                        <el-form-item label="数值" label-width="40px">
                          <el-input-number
                            v-model="buff.value"
                            :min="1"
                            :max="100"
                            :step="5"
                            size="small"
                            style="width: 100%"
                            @change="updateBuff(buff)"
                          />
                        </el-form-item>
                      </el-col>
                      <el-col :span="6">
                        <el-form-item label="时长" label-width="40px">
                          <el-input-number
                            v-model="buff.duration"
                            :min="1"
                            :max="120"
                            :step="1"
                            size="small"
                            style="width: 100%"
                            @change="updateBuff(buff)"
                          >
                            <template #append>s</template>
                          </el-input-number>
                        </el-form-item>
                      </el-col>
                      <el-col :span="6">
                        <el-form-item label="叠加" label-width="40px">
                          <el-input-number
                            v-model="buff.maxStacks"
                            :min="1"
                            :max="10"
                            :step="1"
                            size="small"
                            style="width: 100%"
                            @change="updateBuff(buff)"
                          >
                            <template #append>层</template>
                          </el-input-number>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>
                  <el-empty v-if="!skillForm.buffs || skillForm.buffs.length === 0" description="暂无BUFF，点击上方按钮添加" :image-size="80" />
                </div>
              </el-card>
            </el-tab-pane>

            <el-tab-pane label="触发条件" name="trigger">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>被动触发条件</span>
                  </div>
                </template>
                <el-alert
                  v-if="skillStore.selectedSkill.type === 'active'"
                  title="主动技能"
                  type="warning"
                  :closable="false"
                  class="mb-4"
                >
                  只有被动技能才能设置触发条件
                </el-alert>

                <div v-else>
                  <el-form label-width="120px">
                    <el-form-item label="触发类型">
                      <el-select
                        v-model="triggerForm.type"
                        placeholder="选择触发条件"
                        style="width: 100%"
                        @change="updateTrigger"
                      >
                        <el-option label="无触发条件" :value="null" />
                        <el-option
                          v-for="(name, key) in TRIGGER_TYPE_NAMES"
                          :key="key"
                          :label="name"
                          :value="key"
                        />
                      </el-select>
                    </el-form-item>
                    <template v-if="triggerForm.type">
                      <el-form-item label="目标">
                        <el-radio-group v-model="triggerForm.target" @change="updateTrigger">
                          <el-radio-button value="self">自身</el-radio-button>
                          <el-radio-button value="enemy">敌人</el-radio-button>
                          <el-radio-button value="ally">队友</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item
                        v-if="thresholdTriggers.includes(triggerForm.type)"
                        label="阈值"
                      >
                        <el-input-number
                          v-model="triggerForm.threshold"
                          :min="1"
                          :max="100"
                          :step="5"
                          style="width: 100%"
                          @change="updateTrigger"
                        >
                          <template #append>%</template>
                        </el-input-number>
                      </el-form-item>
                    </template>
                  </el-form>
                  <el-descriptions
                    v-if="skillStore.selectedSkill.triggerCondition"
                    :column="1"
                    border
                    class="mt-4"
                  >
                    <el-descriptions-item label="当前触发条件">
                      <el-tag type="primary">
                        {{ getTriggerDescription(skillStore.selectedSkill.triggerCondition) }}
                      </el-tag>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </el-card>
            </el-tab-pane>

            <el-tab-pane label="克制关系" name="counter">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>技能克制关系</span>
                  </div>
                </template>
                <el-alert title="设置此技能可以克制的其他技能" type="info" :closable="false" class="mb-4">
                  被克制的技能对此技能的伤害将减半
                </el-alert>
                <div class="counter-section">
                  <h4>可克制的技能</h4>
                  <div class="target-skills">
                    <label
                      v-for="skill in availableSkillsToCounter"
                      :key="skill.id"
                      class="target-skill"
                      :class="{ checked: isCountering(skill.id) }"
                    >
                      <el-checkbox
                        :model-value="isCountering(skill.id)"
                        @change="(val: boolean) => toggleCounter(skill.id, val)"
                      >
                        <span class="skill-icon">{{ skill.icon }}</span>
                        <span>{{ skill.name }}</span>
                        <el-tag size="small" :type="skill.type === 'active' ? 'primary' : 'success'">
                          {{ skill.type === 'active' ? '主动' : '被动' }}
                        </el-tag>
                      </el-checkbox>
                    </label>
                  </div>
                  <el-divider content-position="left">已克制的技能</el-divider>
                  <div v-if="skillStore.selectedSkill.counters.length === 0" class="empty-counters">
                    <el-empty description="暂未克制任何技能" :image-size="60" />
                  </div>
                  <div v-else class="counters-list">
                    <el-tag
                      v-for="counterId in skillStore.selectedSkill.counters"
                      :key="counterId"
                      closable
                      size="large"
                      type="danger"
                      @close="removeCounter(counterId)"
                      class="counter-tag"
                    >
                      {{ getSkillNameById(counterId) }}
                    </el-tag>
                  </div>
                </div>
                <el-divider content-position="left">技能关系图</el-divider>
                <div class="relation-graph">
                  <div class="graph-container">
                    <div
                      v-for="skill in allSkills"
                      :key="skill.id"
                      class="graph-node"
                      :class="{
                        selected: skill.id === skillStore.selectedSkillId,
                        countering: skillStore.selectedSkill?.counters?.includes(skill.id),
                        countered: isCounteredBy(skill.id)
                      }"
                    >
                      <div class="node-icon">{{ skill.icon }}</div>
                      <div class="node-name">{{ skill.name }}</div>
                      <div class="node-type">
                        <el-tag :type="skill.type === 'active' ? 'primary' : 'success'" size="small">
                          {{ skill.type === 'active' ? '主动' : '被动' }}
                        </el-tag>
                      </div>
                      <div v-if="skill.triggerCondition" class="node-trigger">
                        <el-icon><Promotion /></el-icon>
                        触发
                      </div>
                    </div>
                  </div>
                  <div class="graph-legend">
                    <span><span class="legend-dot selected"></span> 当前选中</span>
                    <span><span class="legend-dot countering"></span> 克制他人</span>
                    <span><span class="legend-dot countered"></span> 被他人克制</span>
                  </div>
                </div>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSkillStore } from '../stores/skillStore'
import {
  ELEMENT_COLORS,
  ELEMENT_NAMES,
  BUFF_TYPE_NAMES,
  TRIGGER_TYPE_NAMES
} from '../types'
import type { SkillElement, Skill, Buff, TriggerType, TriggerCondition } from '../types'
import { Plus, Delete, Edit, Timer, Clock, Collection, Promotion } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const skillStore = useSkillStore()

const activeTab = ref('basic')

const iconOptions = ['⚔️', '🛡️', '🔥', '❄️', '⚡', '🌊', '🌿', '💫', '💥', '🎯', '🏹', '🔮', '✨', '💀', '☠️', '🗡️', '📢', '🎭']

const skillForm = ref<Partial<Skill>>({
  name: '',
  description: '',
  icon: '⚔️',
  type: 'active',
  element: 'physical',
  cooldown: 5,
  damage: 100,
  duration: 0,
  maxStacks: 1,
  buffs: []
})

const triggerForm = ref<{
  type: TriggerType | null
  threshold: number
  target: 'self' | 'enemy' | 'ally'
}>({
  type: null,
  threshold: 30,
  target: 'self'
})

const thresholdTriggers: TriggerType[] = ['on_hp_below', 'on_hp_above']

watch(
  () => skillStore.selectedSkill,
  (newSkill) => {
    if (newSkill) {
      skillForm.value = JSON.parse(JSON.stringify(newSkill))
      if (newSkill.triggerCondition) {
        triggerForm.value = {
          type: newSkill.triggerCondition.type,
          threshold: newSkill.triggerCondition.threshold,
          target: newSkill.triggerCondition.target
        }
      } else {
        triggerForm.value = {
          type: null,
          threshold: 30,
          target: 'self'
        }
      }
    }
  },
  { immediate: true, deep: true }
)

const availableSkillsToCounter = computed(() => {
  if (!skillStore.currentConfig || !skillStore.selectedSkillId) return []
  return skillStore.currentConfig.skills.filter(
    s => s.id !== skillStore.selectedSkillId
  )
})

const allSkills = computed(() => {
  return skillStore.currentConfig?.skills || []
})

function updateSkill() {
  if (skillStore.selectedSkillId && skillStore.currentConfigId) {
    skillStore.updateSkillInConfig(
      skillStore.currentConfigId,
      skillStore.selectedSkillId,
      { ...skillForm.value }
    )
  }
}

function updateBuff(buff: Buff) {
  if (skillStore.selectedSkillId && skillStore.currentConfigId) {
    skillStore.updateBuffInSkill(
      skillStore.currentConfigId,
      skillStore.selectedSkillId,
      buff.id,
      buff
    )
  }
}

function handleAddSkill() {
  if (skillStore.currentConfigId) {
    const newSkill = skillStore.createSkill(
      '新技能',
      '技能描述',
      '⚔️',
      'active',
      'physical'
    )
    skillStore.addSkillToConfig(skillStore.currentConfigId, newSkill)
    skillStore.selectedSkillId = newSkill.id
    activeTab.value = 'basic'
  }
}

function handleDeleteSkill(skillId: string) {
  ElMessageBox.confirm('确定要删除这个技能吗？', '删除确认', {
    type: 'warning'
  }).then(() => {
    if (skillStore.currentConfigId) {
      skillStore.deleteSkillFromConfig(skillStore.currentConfigId, skillId)
      ElMessage.success('技能已删除')
    }
  }).catch(() => {})
}

function handleAddBuff() {
  if (!skillStore.selectedSkillId || !skillStore.currentConfigId) {
    ElMessage.warning('请先选择技能')
    return
  }
  const newBuff = skillStore.createBuff('新BUFF', 'damage_boost', 20, 10, 1)
  skillStore.addBuffToSkill(skillStore.currentConfigId, skillStore.selectedSkillId, newBuff)
}

function handleDeleteBuff(buffId: string) {
  ElMessageBox.confirm('确定要删除这个BUFF吗？', '删除确认', {
    type: 'warning'
  }).then(() => {
    if (skillStore.selectedSkillId && skillStore.currentConfigId) {
      skillStore.deleteBuffFromSkill(
        skillStore.currentConfigId,
        skillStore.selectedSkillId,
        buffId
      )
      ElMessage.success('BUFF已删除')
    }
  }).catch(() => {})
}

function updateTrigger() {
  if (!skillStore.selectedSkillId || !skillStore.currentConfigId) return

  let condition: TriggerCondition | null = null
  if (triggerForm.value.type) {
    condition = {
      type: triggerForm.value.type,
      threshold: thresholdTriggers.includes(triggerForm.value.type) ? triggerForm.value.threshold : 0,
      target: triggerForm.value.target
    }
  }

  skillStore.updateSkillInConfig(
    skillStore.currentConfigId,
    skillStore.selectedSkillId,
    { triggerCondition: condition }
  )
}

function isCountering(skillId: string): boolean {
  return skillStore.selectedSkill?.counters?.includes(skillId) || false
}

function isCounteredBy(skillId: string): boolean {
  if (!skillStore.currentConfig || !skillStore.selectedSkillId) return false
  return skillStore.currentConfig.skills.some(
    s => s.id !== skillStore.selectedSkillId && s.counters?.includes(skillId)
  )
}

function getSkillNameById(skillId: string): string {
  return skillStore.currentConfig?.skills.find(s => s.id === skillId)?.name || '未知技能'
}

function toggleCounter(skillId: string, value: boolean) {
  if (!skillStore.selectedSkillId || !skillStore.currentConfigId) return

  const currentCounters = [...(skillStore.selectedSkill?.counters || [])]
  if (value) {
    if (!currentCounters.includes(skillId)) {
      currentCounters.push(skillId)
    }
  } else {
    const index = currentCounters.indexOf(skillId)
    if (index > -1) {
      currentCounters.splice(index, 1)
    }
  }

  skillStore.updateSkillInConfig(
    skillStore.currentConfigId,
    skillStore.selectedSkillId,
    { counters: currentCounters }
  )
}

function removeCounter(skillId: string) {
  toggleCounter(skillId, false)
}

function getTriggerDescription(condition: TriggerCondition): string {
  const typeName = TRIGGER_TYPE_NAMES[condition.type]
  if (thresholdTriggers.includes(condition.type)) {
    return `${typeName} ${condition.threshold}% (${condition.target === 'self' ? '自身' : condition.target === 'enemy' ? '敌人' : '队友'})`
  }
  return `${typeName} (${condition.target === 'self' ? '自身' : condition.target === 'enemy' ? '敌人' : '队友'})`
}
</script>

<style scoped>
.skill-detail {
  height: 100%;
  display: flex;
}

.left-panel,
.right-panel {
  height: 100%;
  overflow: hidden;
}

.left-panel {
  display: flex;
  flex-direction: column;
}

.right-panel {
  overflow-y: auto;
}

.skill-list-card {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.skill-list-card :deep(.el-card__body) {
  flex: 1;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  padding: 40px 0;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.skill-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.skill-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.skill-info {
  flex: 1;
  min-width: 0;
}

.skill-name {
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.skill-desc {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
}

.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.buff-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.buff-item {
  padding: 12px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
}

.buff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.buff-form {
  margin-top: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mr-2 {
  margin-right: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.counter-section {
  padding: 16px 0;
}

.counter-section h4 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
}

.target-skills {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.target-skill {
  display: block;
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.target-skill:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.target-skill.checked {
  border-color: #67c23a;
  background-color: #f0f9eb;
}

.target-skill .skill-icon {
  margin-right: 8px;
}

.empty-counters {
  padding: 20px 0;
}

.counters-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.counter-tag {
  margin-bottom: 8px;
}

.relation-graph {
  padding: 16px 0;
}

.graph-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.graph-node {
  padding: 12px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s;
}

.graph-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.graph-node.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.graph-node.countering {
  border-color: #67c23a;
  background: #f0f9eb;
}

.graph-node.countered {
  border-color: #f56c6c;
  background: #fef0f0;
}

.node-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.node-name {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 13px;
}

.node-type {
  margin-bottom: 4px;
}

.node-trigger {
  font-size: 12px;
  color: #e6a23c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.graph-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  font-size: 12px;
  color: #606266;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}

.legend-dot.selected {
  background: #409eff;
}

.legend-dot.countering {
  background: #67c23a;
}

.legend-dot.countered {
  background: #f56c6c;
}

.h-full {
  height: 100%;
}

:deep(.el-tabs__content) {
  height: calc(100% - 55px);
  overflow-y: auto;
}

:deep(.el-tab-pane) {
  height: 100%;
}
</style>
