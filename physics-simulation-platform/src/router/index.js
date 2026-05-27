import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Pendulum from '../views/Pendulum.vue'
import SpringDamper from '../views/SpringDamper.vue'
import FreeFall from '../views/FreeFall.vue'
import Diffraction from '../views/Diffraction.vue'
import SoundSpectrum from '../views/SoundSpectrum.vue'
import MagneticField from '../views/MagneticField.vue'
import HeatDiffusion from '../views/HeatDiffusion.vue'
import ExperimentRecords from '../views/ExperimentRecords.vue'
import ExperimentTemplates from '../views/ExperimentTemplates.vue'
import ParameterComparison from '../views/ParameterComparison.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/pendulum', name: 'Pendulum', component: Pendulum },
  { path: '/spring-damper', name: 'SpringDamper', component: SpringDamper },
  { path: '/free-fall', name: 'FreeFall', component: FreeFall },
  { path: '/diffraction', name: 'Diffraction', component: Diffraction },
  { path: '/sound-spectrum', name: 'SoundSpectrum', component: SoundSpectrum },
  { path: '/magnetic-field', name: 'MagneticField', component: MagneticField },
  { path: '/heat-diffusion', name: 'HeatDiffusion', component: HeatDiffusion },
  { path: '/experiment-records', name: 'ExperimentRecords', component: ExperimentRecords },
  { path: '/experiment-templates', name: 'ExperimentTemplates', component: ExperimentTemplates },
  { path: '/parameter-comparison', name: 'ParameterComparison', component: ParameterComparison }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
