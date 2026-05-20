import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Skill, Buff, ClassConfig, TriggerCondition } from '../types'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'game_skill_buff_configs'

export const useSkillStore = defineStore('skill', () => {
  const classConfigs = ref<ClassConfig[]>([])
  const currentConfigId = ref<string | null>(null)
  const selectedSkillId = ref<string | null>(null)

  const currentConfig = computed(() => {
    return classConfigs.value.find(c => c.id === currentConfigId.value) || null
  })

  const selectedSkill = computed(() => {
    if (!currentConfig.value) return null
    return currentConfig.value.skills.find(s => s.id === selectedSkillId.value) || null
  })

  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        classConfigs.value = JSON.parse(data)
      } else {
        loadDefaultConfigs()
      }
    } catch (e) {
      loadDefaultConfigs()
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classConfigs.value))
  }

  function loadDefaultConfigs() {
    classConfigs.value = [
      createDefaultWarriorConfig(),
      createDefaultMageConfig(),
      createDefaultArcherConfig()
    ]
    saveToStorage()
  }

  function createDefaultWarriorConfig(): ClassConfig {
    const configId = uuidv4()
    return {
      id: configId,
      name: '战士',
      description: '高血量高防御的近战职业',
      icon: '🗡️',
      baseStats: {
        maxHp: 1500,
        maxMana: 300,
        attack: 120,
        defense: 80,
        speed: 60
      },
      skills: [
        createSkill('重斩', '对敌人造成150%物理伤害', '⚔️', 'active', 'physical', {
          cooldown: 8,
          damage: 180,
          duration: 0,
          maxStacks: 1
        }),
        createSkill('战吼', '提升自身30%攻击力，持续10秒', '📢', 'active', 'physical', {
          cooldown: 20,
          damage: 0,
          duration: 10,
          maxStacks: 1,
          buffs: [createBuff('攻击提升', 'damage_boost', 30, 10, 1)]
        }),
        createSkill('钢铁之躯', '生命值低于30%时，防御提升50%', '🛡️', 'passive', 'physical', {
          cooldown: 0,
          damage: 0,
          duration: 5,
          maxStacks: 1,
          triggerCondition: { type: 'on_hp_below', threshold: 30, target: 'self' },
          buffs: [createBuff('防御提升', 'defense_boost', 50, 5, 1)]
        }),
        createSkill('斩杀', '对生命值低于20%的敌人造成双倍伤害', '💀', 'passive', 'physical', {
          cooldown: 0,
          damage: 0,
          duration: 0,
          maxStacks: 1,
          triggerCondition: { type: 'on_attack', threshold: 20, target: 'enemy' }
        })
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  function createDefaultMageConfig(): ClassConfig {
    return {
      id: uuidv4(),
      name: '法师',
      description: '高伤害低血量的远程法术职业',
      icon: '🔮',
      baseStats: {
        maxHp: 800,
        maxMana: 1000,
        attack: 150,
        defense: 30,
        speed: 70
      },
      skills: [
        createSkill('火球术', '发射火球造成火焰伤害', '🔥', 'active', 'fire', {
          cooldown: 5,
          damage: 200,
          duration: 0,
          maxStacks: 1,
          buffs: [createBuff('灼烧', 'burn', 20, 5, 3)]
        }),
        createSkill('冰霜新星', '冻结周围敌人3秒', '❄️', 'active', 'water', {
          cooldown: 15,
          damage: 100,
          duration: 3,
          maxStacks: 1,
          buffs: [createBuff('冰冻', 'freeze', 100, 3, 1)]
        }),
        createSkill('奥术护盾', '受到攻击时生成护盾', '✨', 'passive', 'light', {
          cooldown: 0,
          damage: 0,
          duration: 8,
          maxStacks: 1,
          triggerCondition: { type: 'on_defend', threshold: 0, target: 'self' },
          buffs: [createBuff('护盾', 'shield', 200, 8, 1)]
        }),
        createSkill('元素共鸣', '使用技能时伤害提升20%', '⚡', 'passive', 'lightning', {
          cooldown: 0,
          damage: 0,
          duration: 5,
          maxStacks: 3,
          triggerCondition: { type: 'on_skill_use', threshold: 0, target: 'self' },
          buffs: [createBuff('伤害提升', 'damage_boost', 20, 5, 3)]
        })
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  function createDefaultArcherConfig(): ClassConfig {
    return {
      id: uuidv4(),
      name: '弓箭手',
      description: '高速度高暴击的远程物理职业',
      icon: '🏹',
      baseStats: {
        maxHp: 1000,
        maxMana: 500,
        attack: 130,
        defense: 40,
        speed: 95
      },
      skills: [
        createSkill('穿透箭', '造成穿透伤害，无视30%防御', '🎯', 'active', 'physical', {
          cooldown: 6,
          damage: 160,
          duration: 0,
          maxStacks: 1
        }),
        createSkill('多重射击', '连续射击3次', '🏹', 'active', 'physical', {
          cooldown: 12,
          damage: 80,
          duration: 0,
          maxStacks: 3
        }),
        createSkill('致命一击', '生命值高于80%时暴击率提升30%', '💥', 'passive', 'physical', {
          cooldown: 0,
          damage: 0,
          duration: 0,
          maxStacks: 1,
          triggerCondition: { type: 'on_hp_above', threshold: 80, target: 'self' },
          buffs: [createBuff('暴击提升', 'critical_boost', 30, 999, 1)]
        }),
        createSkill('毒箭', '箭矢附带中毒效果', '☠️', 'passive', 'earth', {
          cooldown: 0,
          damage: 0,
          duration: 8,
          maxStacks: 1,
          triggerCondition: { type: 'on_attack', threshold: 0, target: 'enemy' },
          buffs: [createBuff('中毒', 'poison', 30, 8, 3)]
        })
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  function createSkill(
    name: string,
    description: string,
    icon: string,
    type: 'active' | 'passive',
    element: Skill['element'],
    options: Partial<Skill> = {}
  ): Skill {
    return {
      id: uuidv4(),
      name,
      description,
      icon,
      type,
      element,
      cooldown: options.cooldown || 0,
      damage: options.damage || 0,
      duration: options.duration || 0,
      maxStacks: options.maxStacks || 1,
      buffs: options.buffs || [],
      triggerCondition: options.triggerCondition || null,
      counters: options.counters || [],
      cooldownRemaining: 0,
      currentStacks: 0,
      isActive: false
    }
  }

  function createBuff(
    name: string,
    type: Buff['type'],
    value: number,
    duration: number,
    maxStacks: number
  ): Buff {
    return {
      id: uuidv4(),
      name,
      description: '',
      type,
      value,
      duration,
      maxStacks,
      currentStacks: 0,
      remainingDuration: 0,
      icon: '✨'
    }
  }

  function createNewConfig(name: string): ClassConfig {
    const newConfig: ClassConfig = {
      id: uuidv4(),
      name,
      description: '新职业配置',
      icon: '🎭',
      baseStats: {
        maxHp: 1000,
        maxMana: 500,
        attack: 100,
        defense: 50,
        speed: 70
      },
      skills: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    classConfigs.value.push(newConfig)
    saveToStorage()
    return newConfig
  }

  function deleteConfig(configId: string) {
    const index = classConfigs.value.findIndex(c => c.id === configId)
    if (index > -1) {
      classConfigs.value.splice(index, 1)
      if (currentConfigId.value === configId) {
        currentConfigId.value = classConfigs.value[0]?.id || null
      }
      saveToStorage()
    }
  }

  function updateConfig(configId: string, updates: Partial<ClassConfig>) {
    const config = classConfigs.value.find(c => c.id === configId)
    if (config) {
      Object.assign(config, updates, { updatedAt: Date.now() })
      saveToStorage()
    }
  }

  function addSkillToConfig(configId: string, skill: Skill) {
    const config = classConfigs.value.find(c => c.id === configId)
    if (config) {
      config.skills.push(skill)
      config.updatedAt = Date.now()
      saveToStorage()
    }
  }

  function updateSkillInConfig(configId: string, skillId: string, updates: Partial<Skill>) {
    const config = classConfigs.value.find(c => c.id === configId)
    if (config) {
      const skill = config.skills.find(s => s.id === skillId)
      if (skill) {
        Object.assign(skill, updates)
        config.updatedAt = Date.now()
        saveToStorage()
      }
    }
  }

  function deleteSkillFromConfig(configId: string, skillId: string) {
    const config = classConfigs.value.find(c => c.id === configId)
    if (config) {
      const index = config.skills.findIndex(s => s.id === skillId)
      if (index > -1) {
        config.skills.splice(index, 1)
        config.updatedAt = Date.now()
        if (selectedSkillId.value === skillId) {
          selectedSkillId.value = null
        }
        saveToStorage()
      }
    }
  }

  function addBuffToSkill(configId: string, skillId: string, buff: Buff) {
    updateSkillInConfig(configId, skillId, {
      buffs: [...(selectedSkill.value?.buffs || []), buff]
    })
  }

  function updateBuffInSkill(configId: string, skillId: string, buffId: string, updates: Partial<Buff>) {
    const config = classConfigs.value.find(c => c.id === configId)
    if (config) {
      const skill = config.skills.find(s => s.id === skillId)
      if (skill) {
        const buff = skill.buffs.find(b => b.id === buffId)
        if (buff) {
          Object.assign(buff, updates)
          config.updatedAt = Date.now()
          saveToStorage()
        }
      }
    }
  }

  function deleteBuffFromSkill(configId: string, skillId: string, buffId: string) {
    const config = classConfigs.value.find(c => c.id === configId)
    if (config) {
      const skill = config.skills.find(s => s.id === skillId)
      if (skill) {
        const index = skill.buffs.findIndex(b => b.id === buffId)
        if (index > -1) {
          skill.buffs.splice(index, 1)
          config.updatedAt = Date.now()
          saveToStorage()
        }
      }
    }
  }

  function duplicateConfig(configId: string): ClassConfig | null {
    const config = classConfigs.value.find(c => c.id === configId)
    if (config) {
      const duplicated: ClassConfig = JSON.parse(JSON.stringify(config))
      duplicated.id = uuidv4()
      duplicated.name = config.name + ' (副本)'
      duplicated.createdAt = Date.now()
      duplicated.updatedAt = Date.now()
      duplicated.skills.forEach(skill => {
        skill.id = uuidv4()
        skill.buffs.forEach(buff => buff.id = uuidv4())
      })
      classConfigs.value.push(duplicated)
      saveToStorage()
      return duplicated
    }
    return null
  }

  function exportConfig(configId: string): string {
    const config = classConfigs.value.find(c => c.id === configId)
    return config ? JSON.stringify(config, null, 2) : ''
  }

  function importConfig(jsonString: string): ClassConfig | null {
    try {
      const config = JSON.parse(jsonString) as ClassConfig
      config.id = uuidv4()
      config.createdAt = Date.now()
      config.updatedAt = Date.now()
      config.skills.forEach(skill => {
        skill.id = uuidv4()
        skill.buffs.forEach(buff => buff.id = uuidv4())
      })
      classConfigs.value.push(config)
      saveToStorage()
      return config
    } catch (e) {
      return null
    }
  }

  return {
    classConfigs,
    currentConfigId,
    selectedSkillId,
    currentConfig,
    selectedSkill,
    loadFromStorage,
    saveToStorage,
    createNewConfig,
    deleteConfig,
    updateConfig,
    addSkillToConfig,
    updateSkillInConfig,
    deleteSkillFromConfig,
    addBuffToSkill,
    updateBuffInSkill,
    deleteBuffFromSkill,
    duplicateConfig,
    exportConfig,
    importConfig,
    createSkill,
    createBuff
  }
})
