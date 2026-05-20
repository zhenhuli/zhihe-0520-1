export interface Skill {
  id: string
  name: string
  description: string
  icon: string
  cooldown: number
  damage: number
  duration: number
  maxStacks: number
  type: 'active' | 'passive'
  element: SkillElement
  buffs: Buff[]
  triggerCondition: TriggerCondition | null
  counters: string[]
  cooldownRemaining: number
  currentStacks: number
  isActive: boolean
}

export type SkillElement = 'fire' | 'water' | 'earth' | 'wind' | 'lightning' | 'light' | 'dark' | 'physical'

export interface Buff {
  id: string
  name: string
  description: string
  type: BuffType
  value: number
  duration: number
  maxStacks: number
  currentStacks: number
  remainingDuration: number
  icon: string
}

export type BuffType = 'damage_boost' | 'defense_boost' | 'speed_boost' | 'health_regen' | 'mana_regen' | 'stun' | 'slow' | 'poison' | 'burn' | 'freeze' | 'shield' | 'critical_boost'

export interface TriggerCondition {
  type: TriggerType
  threshold: number
  target: 'self' | 'enemy' | 'ally'
}

export type TriggerType = 'on_hp_below' | 'on_hp_above' | 'on_attack' | 'on_defend' | 'on_skill_use' | 'on_buff_received' | 'on_teammate_low_hp'

export interface Character {
  id: string
  name: string
  class: string
  level: number
  maxHp: number
  currentHp: number
  maxMana: number
  currentMana: number
  attack: number
  defense: number
  speed: number
  skills: Skill[]
  activeBuffs: Buff[]
  icon: string
}

export interface BattleLog {
  id: string
  timestamp: number
  type: 'attack' | 'skill' | 'buff' | 'trigger' | 'counter' | 'info'
  source: string
  target: string
  message: string
  damage?: number
  skillName?: string
  buffName?: string
}

export interface ClassConfig {
  id: string
  name: string
  description: string
  icon: string
  baseStats: {
    maxHp: number
    maxMana: number
    attack: number
    defense: number
    speed: number
  }
  skills: Skill[]
  createdAt: number
  updatedAt: number
}

export interface BattleState {
  player: Character | null
  enemy: Character | null
  logs: BattleLog[]
  isRunning: boolean
  currentTime: number
  winner: 'player' | 'enemy' | null
}

export const ELEMENT_COLORS: Record<SkillElement, string> = {
  fire: '#F56C6C',
  water: '#409EFF',
  earth: '#E6A23C',
  wind: '#67C23A',
  lightning: '#909399',
  light: '#F0F0F0',
  dark: '#303133',
  physical: '#C0C4CC'
}

export const ELEMENT_NAMES: Record<SkillElement, string> = {
  fire: '火',
  water: '水',
  earth: '土',
  wind: '风',
  lightning: '雷',
  light: '光',
  dark: '暗',
  physical: '物理'
}

export const BUFF_TYPE_NAMES: Record<BuffType, string> = {
  damage_boost: '伤害提升',
  defense_boost: '防御提升',
  speed_boost: '速度提升',
  health_regen: '生命恢复',
  mana_regen: '法力恢复',
  stun: '眩晕',
  slow: '减速',
  poison: '中毒',
  burn: '灼烧',
  freeze: '冰冻',
  shield: '护盾',
  critical_boost: '暴击提升'
}

export const TRIGGER_TYPE_NAMES: Record<TriggerType, string> = {
  on_hp_below: '生命值低于',
  on_hp_above: '生命值高于',
  on_attack: '攻击时',
  on_defend: '防御时',
  on_skill_use: '使用技能时',
  on_buff_received: '受到BUFF时',
  on_teammate_low_hp: '队友低血量时'
}
