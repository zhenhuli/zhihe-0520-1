import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Character, BattleLog, ClassConfig, Skill, Buff } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const useBattleStore = defineStore('battle', () => {
  const player = ref<Character | null>(null)
  const enemy = ref<Character | null>(null)
  const logs = ref<BattleLog[]>([])
  const isRunning = ref(false)
  const currentTime = ref(0)
  const winner = ref<'player' | 'enemy' | null>(null)
  const battleSpeed = ref(1)
  const playerConfigId = ref<string | null>(null)
  const enemyConfigId = ref<string | null>(null)

  let battleInterval: number | null = null

  const playerHpPercent = computed(() => {
    if (!player.value) return 0
    return Math.max(0, (player.value.currentHp / player.value.maxHp) * 100)
  })

  const enemyHpPercent = computed(() => {
    if (!enemy.value) return 0
    return Math.max(0, (enemy.value.currentHp / enemy.value.maxHp) * 100)
  })

  const playerManaPercent = computed(() => {
    if (!player.value) return 0
    return Math.max(0, (player.value.currentMana / player.value.maxMana) * 100)
  })

  const enemyManaPercent = computed(() => {
    if (!enemy.value) return 0
    return Math.max(0, (enemy.value.currentMana / enemy.value.maxMana) * 100)
  })

  function createCharacterFromConfig(config: ClassConfig, name: string): Character {
    const skills: Skill[] = JSON.parse(JSON.stringify(config.skills))
    skills.forEach(skill => {
      skill.cooldownRemaining = 0
      skill.currentStacks = 0
      skill.isActive = false
      skill.buffs.forEach(buff => {
        buff.currentStacks = 0
        buff.remainingDuration = 0
      })
    })

    return {
      id: uuidv4(),
      name,
      class: config.name,
      level: 1,
      maxHp: config.baseStats.maxHp,
      currentHp: config.baseStats.maxHp,
      maxMana: config.baseStats.maxMana,
      currentMana: config.baseStats.maxMana,
      attack: config.baseStats.attack,
      defense: config.baseStats.defense,
      speed: config.baseStats.speed,
      skills,
      activeBuffs: [],
      icon: config.icon
    }
  }

  function initBattle(playerConfig: ClassConfig, enemyConfig: ClassConfig) {
    player.value = createCharacterFromConfig(playerConfig, '玩家')
    enemy.value = createCharacterFromConfig(enemyConfig, '敌人')
    logs.value = []
    currentTime.value = 0
    winner.value = null
    isRunning.value = false
    playerConfigId.value = playerConfig.id
    enemyConfigId.value = enemyConfig.id

    addLog('info', '系统', '系统', `战斗开始！${player.value.name}(${player.value.class}) VS ${enemy.value.name}(${enemy.value.class})`)
  }

  function addLog(
    type: BattleLog['type'],
    source: string,
    target: string,
    message: string,
    extra: Partial<BattleLog> = {}
  ) {
    logs.value.unshift({
      id: uuidv4(),
      timestamp: currentTime.value,
      type,
      source,
      target,
      message,
      ...extra
    })
    if (logs.value.length > 100) {
      logs.value.pop()
    }
  }

  function calculateDamage(attacker: Character, defender: Character, baseDamage: number, skill?: Skill): number {
    let damage = baseDamage + attacker.attack * 0.5

    const damageBoost = attacker.activeBuffs
      .filter(b => b.type === 'damage_boost')
      .reduce((sum, b) => sum + b.value * b.currentStacks, 0)
    damage *= (1 + damageBoost / 100)

    const criticalBoost = attacker.activeBuffs
      .filter(b => b.type === 'critical_boost')
      .reduce((sum, b) => sum + b.value * b.currentStacks, 0)
    const critChance = 5 + criticalBoost
    let isCrit = Math.random() * 100 < critChance
    if (isCrit) {
      damage *= 1.5
    }

    let defense = defender.defense
    const defenseBoost = defender.activeBuffs
      .filter(b => b.type === 'defense_boost')
      .reduce((sum, b) => sum + b.value * b.currentStacks, 0)
    defense *= (1 + defenseBoost / 100)

    damage = Math.max(1, damage - defense * 0.3)

    if (skill?.counters?.length) {
      const defenderSkills = defender.skills.filter(s => s.isActive)
      if (defenderSkills.some(s => skill.counters?.includes(s.id))) {
        damage *= 0.5
        addLog('counter', attacker.name, defender.name, `技能被克制！伤害减半`)
      }
    }

    return Math.round(damage)
  }

  function applyBuff(target: Character, buffTemplate: Buff, source: string) {
    const existingBuff = target.activeBuffs.find(b => b.name === buffTemplate.name)

    if (existingBuff) {
      if (existingBuff.currentStacks < existingBuff.maxStacks) {
        existingBuff.currentStacks++
      }
      existingBuff.remainingDuration = Math.max(existingBuff.remainingDuration, buffTemplate.duration)
    } else {
      const newBuff: Buff = {
        ...JSON.parse(JSON.stringify(buffTemplate)),
        currentStacks: 1,
        remainingDuration: buffTemplate.duration
      }
      target.activeBuffs.push(newBuff)
    }

    addLog('buff', source, target.name, `${target.name} 获得了 ${buffTemplate.name} (${buffTemplate.value}%)`)
  }

  function checkTriggerConditions(character: Character, opponent: Character, eventType: string, eventData?: any) {
    character.skills.forEach(skill => {
      if (skill.type !== 'passive' || !skill.triggerCondition) return

      const condition = skill.triggerCondition
      let triggered = false

      switch (condition.type) {
        case 'on_hp_below':
          if (condition.target === 'self') {
            const hpPercent = (character.currentHp / character.maxHp) * 100
            triggered = hpPercent <= condition.threshold
          } else if (condition.target === 'enemy') {
            const hpPercent = (opponent.currentHp / opponent.maxHp) * 100
            triggered = hpPercent <= condition.threshold
          }
          break
        case 'on_hp_above':
          if (condition.target === 'self') {
            const hpPercent = (character.currentHp / character.maxHp) * 100
            triggered = hpPercent >= condition.threshold
          }
          break
        case 'on_attack':
          triggered = eventType === 'attack'
          if (triggered && condition.target === 'enemy' && condition.threshold > 0) {
            const hpPercent = (opponent.currentHp / opponent.maxHp) * 100
            triggered = hpPercent <= condition.threshold
          }
          break
        case 'on_defend':
          triggered = eventType === 'defend'
          break
        case 'on_skill_use':
          triggered = eventType === 'skill_use'
          break
      }

      if (triggered && !skill.isActive) {
        skill.isActive = true
        addLog('trigger', character.name, character.name, `被动技能触发: ${skill.name}`)

        skill.buffs.forEach(buff => {
          const target = buff.type === 'shield' || buff.type === 'defense_boost' || buff.type === 'damage_boost'
            ? character
            : opponent
          applyBuff(target, buff, character.name)
        })
      }
    })
  }

  function useSkill(attacker: Character, defender: Character, skill: Skill) {
    if (skill.type !== 'active') return
    if (skill.cooldownRemaining > 0) return

    if (skill.cooldown > 0) {
      skill.cooldownRemaining = skill.cooldown
    }

    if (skill.damage > 0) {
      let totalDamage = 0
      const stacks = skill.maxStacks > 1 ? skill.maxStacks : 1

      for (let i = 0; i < stacks; i++) {
        const damage = calculateDamage(attacker, defender, skill.damage, skill)
        totalDamage += damage
        defender.currentHp = Math.max(0, defender.currentHp - damage)
      }

      addLog('skill', attacker.name, defender.name, `${attacker.name} 使用 ${skill.name} 造成 ${totalDamage} 点伤害`, {
        damage: totalDamage,
        skillName: skill.name
      })

      checkTriggerConditions(attacker, defender, 'attack')
      checkTriggerConditions(defender, attacker, 'defend')
    }

    skill.buffs.forEach(buff => {
      const isDebuff = ['stun', 'slow', 'poison', 'burn', 'freeze'].includes(buff.type)
      const target = isDebuff ? defender : attacker
      applyBuff(target, buff, attacker.name)
    })

    checkTriggerConditions(attacker, defender, 'skill_use')
  }

  function updateBuffs(character: Character, opponent: Character) {
    character.activeBuffs = character.activeBuffs.filter(buff => {
      buff.remainingDuration--

      if (buff.type === 'poison' || buff.type === 'burn' || buff.type === 'health_regen') {
        const value = Math.round(buff.value * buff.currentStacks)
        if (buff.type === 'health_regen') {
          character.currentHp = Math.min(character.maxHp, character.currentHp + value)
          addLog('buff', character.name, character.name, `${character.name} 恢复了 ${value} 点生命`)
        } else {
          character.currentHp = Math.max(0, character.currentHp - value)
          addLog('buff', character.name, character.name, `${character.name} 受到 ${buff.name} 效果，损失 ${value} 点生命`)
        }
      }

      if (buff.type === 'mana_regen') {
        const value = Math.round(buff.value * buff.currentStacks)
        character.currentMana = Math.min(character.maxMana, character.currentMana + value)
      }

      return buff.remainingDuration > 0
    })

    character.skills.forEach(skill => {
      if (skill.type === 'passive' && skill.triggerCondition) {
        const condition = skill.triggerCondition
        let shouldDeactivate = false

        if (condition.type === 'on_hp_below') {
          if (condition.target === 'self') {
            const hpPercent = (character.currentHp / character.maxHp) * 100
            shouldDeactivate = hpPercent > condition.threshold
          }
        } else if (condition.type === 'on_hp_above') {
          if (condition.target === 'self') {
            const hpPercent = (character.currentHp / character.maxHp) * 100
            shouldDeactivate = hpPercent < condition.threshold
          }
        }

        if (shouldDeactivate && skill.isActive) {
          skill.isActive = false
          addLog('info', character.name, character.name, `被动技能失效: ${skill.name}`)
        }
      }

      if (skill.cooldownRemaining > 0) {
        skill.cooldownRemaining--
      }
    })
  }

  function basicAttack(attacker: Character, defender: Character) {
    const damage = calculateDamage(attacker, defender, attacker.attack * 0.5)
    defender.currentHp = Math.max(0, defender.currentHp - damage)

    addLog('attack', attacker.name, defender.name, `${attacker.name} 普通攻击造成 ${damage} 点伤害`, { damage })

    checkTriggerConditions(attacker, defender, 'attack')
    checkTriggerConditions(defender, attacker, 'defend')
  }

  function battleTick() {
    if (!player.value || !enemy.value || winner.value) return

    currentTime.value++

    updateBuffs(player.value, enemy.value)
    updateBuffs(enemy.value, player.value)

    const playerStunned = player.value.activeBuffs.some(b => b.type === 'stun' || b.type === 'freeze')
    const enemyStunned = enemy.value.activeBuffs.some(b => b.type === 'stun' || b.type === 'freeze')

    if (!playerStunned && player.value.currentHp > 0 && enemy.value.currentHp > 0) {
      const availableSkill = player.value.skills.find(
        s => s.type === 'active' && s.cooldownRemaining === 0
      )
      if (availableSkill) {
        useSkill(player.value, enemy.value, availableSkill)
      } else {
        basicAttack(player.value, enemy.value)
      }
    }

    if (enemy.value.currentHp <= 0) {
      winner.value = 'player'
      isRunning.value = false
      addLog('info', '系统', '系统', `战斗结束！${player.value.name} 获胜！`)
      return
    }

    if (!enemyStunned && enemy.value.currentHp > 0 && player.value.currentHp > 0) {
      const availableSkill = enemy.value.skills.find(
        s => s.type === 'active' && s.cooldownRemaining === 0
      )
      if (availableSkill) {
        useSkill(enemy.value, player.value, availableSkill)
      } else {
        basicAttack(enemy.value, player.value)
      }
    }

    if (player.value.currentHp <= 0) {
      winner.value = 'enemy'
      isRunning.value = false
      addLog('info', '系统', '系统', `战斗结束！${enemy.value.name} 获胜！`)
    }
  }

  function startBattle() {
    if (battleInterval) {
      clearInterval(battleInterval)
    }
    isRunning.value = true
    battleInterval = window.setInterval(battleTick, 1000 / battleSpeed.value)
  }

  function pauseBattle() {
    isRunning.value = false
    if (battleInterval) {
      clearInterval(battleInterval)
      battleInterval = null
    }
  }

  function stepBattle() {
    if (!isRunning.value) {
      battleTick()
    }
  }

  function resetBattle() {
    pauseBattle()
    currentTime.value = 0
    winner.value = null
    if (player.value) {
      player.value.currentHp = player.value.maxHp
      player.value.currentMana = player.value.maxMana
      player.value.activeBuffs = []
      player.value.skills.forEach(s => {
        s.cooldownRemaining = 0
        s.isActive = false
        s.buffs.forEach(b => {
          b.currentStacks = 0
          b.remainingDuration = 0
        })
      })
    }
    if (enemy.value) {
      enemy.value.currentHp = enemy.value.maxHp
      enemy.value.currentMana = enemy.value.maxMana
      enemy.value.activeBuffs = []
      enemy.value.skills.forEach(s => {
        s.cooldownRemaining = 0
        s.isActive = false
        s.buffs.forEach(b => {
          b.currentStacks = 0
          b.remainingDuration = 0
        })
      })
    }
    logs.value = []
    if (player.value && enemy.value) {
      addLog('info', '系统', '系统', `战斗已重置！${player.value.name}(${player.value.class}) VS ${enemy.value.name}(${enemy.value.class})`)
    }
  }

  function setBattleSpeed(speed: number) {
    battleSpeed.value = speed
    if (isRunning.value) {
      startBattle()
    }
  }

  return {
    player,
    enemy,
    logs,
    isRunning,
    currentTime,
    winner,
    battleSpeed,
    playerConfigId,
    enemyConfigId,
    playerHpPercent,
    enemyHpPercent,
    playerManaPercent,
    enemyManaPercent,
    initBattle,
    startBattle,
    pauseBattle,
    stepBattle,
    resetBattle,
    setBattleSpeed,
    createCharacterFromConfig
  }
})
