<template>
  <div class="battle-simulator">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>对战模拟器</span>
          <div class="header-actions">
            <el-select
              v-model="selectedPlayerConfigId"
              placeholder="选择玩家职业"
              size="small"
              style="width: 150px"
              class="mr-2"
            >
              <el-option
                v-for="config in skillStore.classConfigs"
                :key="config.id"
                :label="config.name"
                :value="config.id"
              >
                <span style="float: left">{{ config.icon }} {{ config.name }}</span>
              </el-option>
            </el-select>
            <span class="vs-text">VS</span>
            <el-select
              v-model="selectedEnemyConfigId"
              placeholder="选择敌人职业"
              size="small"
              style="width: 150px"
              class="ml-2"
            >
              <el-option
                v-for="config in skillStore.classConfigs"
                :key="config.id"
                :label="config.name"
                :value="config.id"
              >
                <span style="float: left">{{ config.icon }} {{ config.name }}</span>
              </el-option>
            </el-select>
            <el-button
              type="primary"
              size="small"
              :disabled="!selectedPlayerConfigId || !selectedEnemyConfigId"
              @click="initBattle"
              class="ml-4"
            >
              <el-icon><RefreshRight /></el-icon>
              初始化战斗
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="!battleStore.player || !battleStore.enemy" class="empty-state">
        <el-empty description="请选择双方职业并初始化战斗" />
      </div>

      <div v-else class="battle-arena">
        <div class="battle-controls">
          <el-button-group>
            <el-button
              type="success"
              :disabled="battleStore.isRunning || battleStore.winner"
              @click="battleStore.startBattle"
            >
              <el-icon><VideoPlay /></el-icon>
              开始
            </el-button>
            <el-button
              type="warning"
              :disabled="!battleStore.isRunning"
              @click="battleStore.pauseBattle"
            >
              <el-icon><VideoPause /></el-icon>
              暂停
            </el-button>
            <el-button
              type="info"
              :disabled="battleStore.isRunning || battleStore.winner"
              @click="battleStore.stepBattle"
            >
              <el-icon><DArrowRight /></el-icon>
              单步
            </el-button>
            <el-button type="danger" @click="battleStore.resetBattle">
              <el-icon><RefreshRight /></el-icon>
              重置
            </el-button>
          </el-button-group>

          <div class="speed-control">
            <span class="speed-label">速度:</span>
            <el-radio-group v-model="battleSpeed" @change="handleSpeedChange" size="small">
              <el-radio-button :value="0.5">0.5x</el-radio-button>
              <el-radio-button :value="1">1x</el-radio-button>
              <el-radio-button :value="2">2x</el-radio-button>
              <el-radio-button :value="4">4x</el-radio-button>
            </el-radio-group>
          </div>

          <div class="battle-time">
            <el-tag type="info">时间: {{ battleStore.currentTime }}s</el-tag>
          </div>
        </div>

        <div v-if="battleStore.winner" class="battle-result">
          <el-result
            :icon="battleStore.winner === 'player' ? 'success' : 'error'"
            :title="battleStore.winner === 'player' ? '战斗胜利！' : '战斗失败！'"
            :sub-title="`${battleStore.winner === 'player' ? battleStore.player?.name : battleStore.enemy?.name} 获胜，用时 ${battleStore.currentTime} 秒`"
          />
        </div>

        <div class="battle-field">
          <div class="character-side player-side">
            <div class="character-card" :class="{ dead: battleStore.playerHpPercent === 0 }">
              <div class="character-avatar">
                {{ battleStore.player?.icon }}
              </div>
              <div class="character-info">
                <div class="character-name">
                  {{ battleStore.player?.name }}
                  <el-tag size="small" type="primary">{{ battleStore.player?.class }}</el-tag>
                </div>
                <div class="hp-bar">
                  <div class="bar-label">
                    <span>HP</span>
                    <span>{{ battleStore.player?.currentHp }} / {{ battleStore.player?.maxHp }}</span>
                  </div>
                  <el-progress
                    :percentage="battleStore.playerHpPercent"
                    :color="getHpColor(battleStore.playerHpPercent)"
                    :stroke-width="12"
                    :show-text="false"
                  />
                </div>
                <div class="mana-bar">
                  <div class="bar-label">
                    <span>MP</span>
                    <span>{{ battleStore.player?.currentMana }} / {{ battleStore.player?.maxMana }}</span>
                  </div>
                  <el-progress
                    :percentage="battleStore.playerManaPercent"
                    color="#409EFF"
                    :stroke-width="8"
                    :show-text="false"
                  />
                </div>
                <div class="character-stats">
                  <span><el-icon><Edit /></el-icon> {{ battleStore.player?.attack }}</span>
                  <span><el-icon><Star /></el-icon> {{ battleStore.player?.defense }}</span>
                  <span><el-icon><Timer /></el-icon> {{ battleStore.player?.speed }}</span>
                </div>
              </div>
            </div>

            <div class="buffs-section">
              <h4>BUFF / DEBUFF</h4>
              <div class="buffs-list">
                <el-tooltip
                  v-for="buff in battleStore.player?.activeBuffs"
                  :key="buff.id"
                  :content="`${buff.name}: ${buff.value}% (${buff.currentStacks}层), 剩余 ${buff.remainingDuration}s`"
                  placement="top"
                >
                  <div class="buff-item" :class="getBuffClass(buff.type)">
                    <span class="buff-icon">{{ buff.icon }}</span>
                    <span class="buff-stacks" v-if="buff.currentStacks > 1">x{{ buff.currentStacks }}</span>
                    <span class="buff-time">{{ buff.remainingDuration }}s</span>
                  </div>
                </el-tooltip>
                <el-empty v-if="!battleStore.player?.activeBuffs.length" description="无BUFF" :image-size="40" />
              </div>
            </div>

            <div class="skills-section">
              <h4>技能冷却</h4>
              <div class="skills-list">
                <div
                  v-for="skill in battleStore.player?.skills"
                  :key="skill.id"
                  class="skill-cooldown-item"
                  :class="{ 'on-cooldown': skill.cooldownRemaining > 0, active: skill.isActive }"
                >
                  <div class="skill-icon">{{ skill.icon }}</div>
                  <div class="skill-info">
                    <span class="skill-name">{{ skill.name }}</span>
                    <el-tag v-if="skill.isActive" size="small" type="success">触发中</el-tag>
                  </div>
                  <div v-if="skill.cooldownRemaining > 0" class="cooldown-time">
                    {{ skill.cooldownRemaining }}s
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="battle-center">
            <div class="vs-badge">VS</div>
          </div>

          <div class="character-side enemy-side">
            <div class="character-card" :class="{ dead: battleStore.enemyHpPercent === 0 }">
              <div class="character-avatar enemy">
                {{ battleStore.enemy?.icon }}
              </div>
              <div class="character-info">
                <div class="character-name">
                  {{ battleStore.enemy?.name }}
                  <el-tag size="small" type="danger">{{ battleStore.enemy?.class }}</el-tag>
                </div>
                <div class="hp-bar">
                  <div class="bar-label">
                    <span>HP</span>
                    <span>{{ battleStore.enemy?.currentHp }} / {{ battleStore.enemy?.maxHp }}</span>
                  </div>
                  <el-progress
                    :percentage="battleStore.enemyHpPercent"
                    :color="getHpColor(battleStore.enemyHpPercent)"
                    :stroke-width="12"
                    :show-text="false"
                  />
                </div>
                <div class="mana-bar">
                  <div class="bar-label">
                    <span>MP</span>
                    <span>{{ battleStore.enemy?.currentMana }} / {{ battleStore.enemy?.maxMana }}</span>
                  </div>
                  <el-progress
                    :percentage="battleStore.enemyManaPercent"
                    color="#409EFF"
                    :stroke-width="8"
                    :show-text="false"
                  />
                </div>
                <div class="character-stats">
                  <span><el-icon><Edit /></el-icon> {{ battleStore.enemy?.attack }}</span>
                  <span><el-icon><Star /></el-icon> {{ battleStore.enemy?.defense }}</span>
                  <span><el-icon><Timer /></el-icon> {{ battleStore.enemy?.speed }}</span>
                </div>
              </div>
            </div>

            <div class="buffs-section">
              <h4>BUFF / DEBUFF</h4>
              <div class="buffs-list">
                <el-tooltip
                  v-for="buff in battleStore.enemy?.activeBuffs"
                  :key="buff.id"
                  :content="`${buff.name}: ${buff.value}% (${buff.currentStacks}层), 剩余 ${buff.remainingDuration}s`"
                  placement="top"
                >
                  <div class="buff-item" :class="getBuffClass(buff.type)">
                    <span class="buff-icon">{{ buff.icon }}</span>
                    <span class="buff-stacks" v-if="buff.currentStacks > 1">x{{ buff.currentStacks }}</span>
                    <span class="buff-time">{{ buff.remainingDuration }}s</span>
                  </div>
                </el-tooltip>
                <el-empty v-if="!battleStore.enemy?.activeBuffs.length" description="无BUFF" :image-size="40" />
              </div>
            </div>

            <div class="skills-section">
              <h4>技能冷却</h4>
              <div class="skills-list">
                <div
                  v-for="skill in battleStore.enemy?.skills"
                  :key="skill.id"
                  class="skill-cooldown-item"
                  :class="{ 'on-cooldown': skill.cooldownRemaining > 0, active: skill.isActive }"
                >
                  <div class="skill-icon">{{ skill.icon }}</div>
                  <div class="skill-info">
                    <span class="skill-name">{{ skill.name }}</span>
                    <el-tag v-if="skill.isActive" size="small" type="success">触发中</el-tag>
                  </div>
                  <div v-if="skill.cooldownRemaining > 0" class="cooldown-time">
                    {{ skill.cooldownRemaining }}s
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="battle-logs">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>战斗日志</span>
                <el-button size="small" text @click="clearLogs">清空</el-button>
              </div>
            </template>
            <div class="logs-container" ref="logsContainer">
              <div
                v-for="log in battleStore.logs"
                :key="log.id"
                class="log-item"
                :class="`log-${log.type}`"
              >
                <span class="log-time">[{{ log.timestamp }}s]</span>
                <span class="log-type" :class="`tag-${log.type}`">
                  {{ getLogTypeName(log.type) }}
                </span>
                <span class="log-message">{{ log.message }}</span>
              </div>
              <el-empty v-if="battleStore.logs.length === 0" description="暂无战斗日志" :image-size="60" />
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useSkillStore } from '../stores/skillStore'
import { useBattleStore } from '../stores/battleStore'
import type { BuffType } from '../types'
import {
  RefreshRight,
  VideoPlay,
  VideoPause,
  DArrowRight,
  Edit,
  Star,
  Timer
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const skillStore = useSkillStore()
const battleStore = useBattleStore()

const selectedPlayerConfigId = ref<string | null>(null)
const selectedEnemyConfigId = ref<string | null>(null)
const battleSpeed = ref(1)
const logsContainer = ref<HTMLElement | null>(null)

watch(
  () => skillStore.classConfigs,
  (configs) => {
    if (configs.length > 0 && !selectedPlayerConfigId.value) {
      selectedPlayerConfigId.value = configs[0].id
    }
    if (configs.length > 1 && !selectedEnemyConfigId.value) {
      selectedEnemyConfigId.value = configs[1]?.id || configs[0].id
    }
  },
  { immediate: true }
)

watch(
  () => battleStore.logs.length,
  () => {
    nextTick(() => {
      if (logsContainer.value) {
        logsContainer.value.scrollTop = 0
      }
    })
  }
)

function initBattle() {
  const playerConfig = skillStore.classConfigs.find(c => c.id === selectedPlayerConfigId.value)
  const enemyConfig = skillStore.classConfigs.find(c => c.id === selectedEnemyConfigId.value)

  if (!playerConfig || !enemyConfig) {
    ElMessage.error('请选择有效的职业配置')
    return
  }

  battleStore.initBattle(playerConfig, enemyConfig)
  ElMessage.success('战斗已初始化')
}

function handleSpeedChange(val: number) {
  battleStore.setBattleSpeed(val)
}

function getHpColor(percent: number): string {
  if (percent > 60) return '#67C23A'
  if (percent > 30) return '#E6A23C'
  return '#F56C6C'
}

function getBuffClass(type: BuffType): string {
  const debuffTypes: BuffType[] = ['stun', 'slow', 'poison', 'burn', 'freeze']
  return debuffTypes.includes(type) ? 'debuff' : 'buff'
}

function getLogTypeName(type: string): string {
  const names: Record<string, string> = {
    attack: '攻击',
    skill: '技能',
    buff: 'BUFF',
    trigger: '触发',
    counter: '克制',
    info: '信息'
  }
  return names[type] || type
}

function clearLogs() {
  battleStore.logs = []
}
</script>

<style scoped>
.battle-simulator {
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
  align-items: center;
}

.vs-text {
  font-weight: bold;
  color: #f56c6c;
}

.empty-state {
  padding: 60px 0;
}

.mr-2 {
  margin-right: 8px;
}

.ml-2 {
  margin-left: 8px;
}

.ml-4 {
  margin-left: 16px;
}

.battle-arena {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.battle-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.speed-label {
  font-size: 13px;
  color: #606266;
}

.battle-result {
  margin: 20px 0;
}

.battle-field {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.character-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.battle-center {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.vs-badge {
  font-size: 32px;
  font-weight: bold;
  color: #f56c6c;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.character-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  background: white;
  transition: all 0.3s;
}

.character-card.dead {
  opacity: 0.5;
  filter: grayscale(1);
}

.player-side .character-card {
  border-color: #409eff;
  background: linear-gradient(135deg, #ecf5ff 0%, white 100%);
}

.enemy-side .character-card {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #fef0f0 0%, white 100%);
}

.character-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.character-avatar.enemy {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.character-info {
  flex: 1;
  min-width: 0;
}

.character-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hp-bar,
.mana-bar {
  margin-bottom: 8px;
}

.bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
  margin-bottom: 2px;
}

.character-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #606266;
  margin-top: 8px;
}

.character-stats span {
  display: flex;
  align-items: center;
  gap: 2px;
}

.buffs-section,
.skills-section {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.buffs-section h4,
.skills-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #606266;
}

.buffs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 40px;
}

.buff-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  background: #e1f3d8;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.buff-item.debuff {
  background: #fde2e2;
  color: #f56c6c;
  border-color: #fbc4c4;
}

.buff-icon {
  font-size: 14px;
}

.buff-stacks {
  font-weight: bold;
}

.buff-time {
  font-size: 10px;
  opacity: 0.8;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 150px;
  overflow-y: auto;
}

.skill-cooldown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  font-size: 12px;
}

.skill-cooldown-item.on-cooldown {
  opacity: 0.6;
  background: #f5f7fa;
}

.skill-cooldown-item.active {
  border-color: #67c23a;
  background: #f0f9eb;
}

.skill-cooldown-item .skill-icon {
  font-size: 16px;
}

.skill-cooldown-item .skill-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cooldown-time {
  font-weight: bold;
  color: #f56c6c;
}

.battle-logs {
  margin-top: 16px;
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  background: #fafafa;
  border-radius: 6px;
}

.log-item {
  padding: 4px 8px;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
  align-items: center;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #909399;
  flex-shrink: 0;
}

.log-type {
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  flex-shrink: 0;
}

.tag-attack {
  background: #ecf5ff;
  color: #409eff;
}

.tag-skill {
  background: #f0f9eb;
  color: #67c23a;
}

.tag-buff {
  background: #fdf6ec;
  color: #e6a23c;
}

.tag-trigger {
  background: #f0f0ff;
  color: #909399;
}

.tag-counter {
  background: #fef0f0;
  color: #f56c6c;
}

.tag-info {
  background: #f4f4f5;
  color: #909399;
}

.log-message {
  color: #303133;
}
</style>
