<template>
  <n-card>
    <template #header>
      <div class="card-header">
        <n-icon size="20" style="margin-right: 8px; color: #fa8c16;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </n-icon>
        <span>混凝土配合比参考表</span>
        <n-tag type="info" style="margin-left: auto;">
          每立方米用量 (kg/m³)
        </n-tag>
      </div>
    </template>

    <n-alert type="warning" style="margin-bottom: 20px;">
      <template #header>使用说明</template>
      本表数据为参考配合比，实际施工应根据砂石含水率、水泥品种及标号、外加剂等因素进行现场试配调整。
    </n-alert>

    <n-table :single-line="false" bordered>
      <thead>
        <tr>
          <th rowspan="2">强度<br/>等级</th>
          <th colspan="4">材料用量 (kg/m³)</th>
          <th rowspan="2">配合比<br/>(水泥:砂:石:水)</th>
          <th rowspan="2">适用场景</th>
          <th rowspan="2">说明</th>
        </tr>
        <tr>
          <th>水泥</th>
          <th>砂</th>
          <th>石</th>
          <th>水</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(data, grade) in ratioData" :key="grade">
          <td style="font-weight: 600; color: #2080f0;">{{ grade }}</td>
          <td>{{ data.cement }}</td>
          <td>{{ data.sand }}</td>
          <td>{{ data.gravel }}</td>
          <td>{{ data.water }}</td>
          <td style="font-family: monospace; font-weight: 500;">{{ data.ratio }}</td>
          <td>
            <n-space wrap>
              <n-tag
                v-for="scene in getGradeScenes(grade)"
                :key="scene.value"
                size="small"
                type="default"
              >
                {{ scene.label }}
              </n-tag>
            </n-space>
          </td>
          <td style="font-size: 12px; color: #666;">{{ data.description }}</td>
        </tr>
      </tbody>
    </n-table>

    <n-divider style="margin: 24px 0;" />

    <n-grid :cols="2" :x-gap="24" :y-gap="16">
      <n-gi>
        <n-descriptions title="材料密度参考" :column="1" bordered size="small">
          <n-descriptions-item label="水泥">
            3.15 g/cm³
          </n-descriptions-item>
          <n-descriptions-item label="砂子">
            2.65 g/cm³
          </n-descriptions-item>
          <n-descriptions-item label="石子">
            2.70 g/cm³
          </n-descriptions-item>
          <n-descriptions-item label="水">
            1.00 g/cm³
          </n-descriptions-item>
        </n-descriptions>
      </n-gi>
      <n-gi>
        <n-descriptions title="损耗率参考" :column="1" bordered size="small">
          <n-descriptions-item label="水泥">
            2% (运输+储存)
          </n-descriptions-item>
          <n-descriptions-item label="砂子">
            5% (含含水率波动)
          </n-descriptions-item>
          <n-descriptions-item label="石子">
            5% (含含水率波动)
          </n-descriptions-item>
          <n-descriptions-item label="水">
            3% (现场施工损耗)
          </n-descriptions-item>
        </n-descriptions>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup>
import { NCard, NIcon, NTag, NAlert, NTable, NSpace, NDivider, NGrid, NGi, NDescriptions, NDescriptionsItem } from 'naive-ui'
import { mixRatios, strengthGrades, constructionScenes } from '../data/concreteData'

const ratioData = mixRatios

function getGradeScenes(grade) {
  const gradeInfo = strengthGrades.find(g => g.value === grade)
  if (!gradeInfo) return []
  return constructionScenes.filter(s => gradeInfo.scenes.includes(s.value))
}
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

:deep(th), :deep(td) {
  text-align: center;
  padding: 10px 12px;
}

:deep(th) {
  background-color: #fafafa;
  font-weight: 600;
}
</style>
