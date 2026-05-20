import { reactive, computed } from 'vue';

const FIXED_SLOTS_COUNT = 30;
const TEMPORARY_SLOTS_COUNT = 20;
const HOURLY_RATE = 5;
const FREE_DAILY_MAX = 50;

const generatePlateNumber = () => {
  const provinces = ['京', '沪', '粤', '苏', '浙', '川', '湘', '闽', '鲁', '晋'];
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const province = provinces[Math.floor(Math.random() * provinces.length)];
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const numbers = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${province}${letter}${numbers}`;
};

const generateOwnerName = () => {
  const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
  const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋'];
  return surnames[Math.floor(Math.random() * surnames.length)] + names[Math.floor(Math.random() * names.length)];
};

const createParkingSlots = () => {
  const slots = [];
  for (let i = 1; i <= FIXED_SLOTS_COUNT; i++) {
    slots.push({
      id: `F${String(i).padStart(3, '0')}`,
      type: 'fixed',
      status: 'available',
      owner: null,
      plateNumber: null,
      startTime: null,
      ownerName: null
    });
  }
  for (let i = 1; i <= TEMPORARY_SLOTS_COUNT; i++) {
    slots.push({
      id: `T${String(i).padStart(3, '0')}`,
      type: 'temporary',
      status: 'available',
      owner: null,
      plateNumber: null,
      startTime: null,
      ownerName: null
    });
  }
  return slots;
};

const state = reactive({
  slots: createParkingSlots(),
  parkingRecords: [],
  totalIncome: 0,
  todayIncome: 0
});

export const useParkingStore = () => {
  const fixedSlots = computed(() => state.slots.filter(s => s.type === 'fixed'));
  const temporarySlots = computed(() => state.slots.filter(s => s.type === 'temporary'));
  
  const availableFixedSlots = computed(() => fixedSlots.value.filter(s => s.status === 'available'));
  const availableTemporarySlots = computed(() => temporarySlots.value.filter(s => s.status === 'available'));
  const occupiedFixedSlots = computed(() => fixedSlots.value.filter(s => s.status === 'occupied'));
  const occupiedTemporarySlots = computed(() => temporarySlots.value.filter(s => s.status === 'occupied'));
  
  const totalAvailable = computed(() => state.slots.filter(s => s.status === 'available').length);
  const totalOccupied = computed(() => state.slots.filter(s => s.status === 'occupied').length);

  const statistics = computed(() => ({
    totalFixed: FIXED_SLOTS_COUNT,
    totalTemporary: TEMPORARY_SLOTS_COUNT,
    availableFixed: availableFixedSlots.value.length,
    availableTemporary: availableTemporarySlots.value.length,
    occupiedFixed: occupiedFixedSlots.value.length,
    occupiedTemporary: occupiedTemporarySlots.value.length,
    totalAvailable: totalAvailable.value,
    totalOccupied: totalOccupied.value,
    totalSlots: FIXED_SLOTS_COUNT + TEMPORARY_SLOTS_COUNT,
    totalIncome: state.totalIncome,
    todayIncome: state.todayIncome
  }));

  const calculateParkingFee = (startTime, endTime = new Date()) => {
    const durationMs = endTime - new Date(startTime);
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    const fee = Math.min(durationHours * HOURLY_RATE, FREE_DAILY_MAX);
    return {
      durationHours,
      fee
    };
  };

  const parkOwnerVehicle = (slotId) => {
    const slot = state.slots.find(s => s.id === slotId);
    if (!slot || slot.status !== 'available') {
      return { success: false, message: '车位不可用' };
    }
    slot.status = 'occupied';
    slot.plateNumber = generatePlateNumber();
    slot.startTime = new Date();
    slot.ownerName = generateOwnerName();
    return { success: true, message: '业主车辆已停放', slot };
  };

  const parkTemporaryVehicle = (slotId, plateNumber = null) => {
    const slot = state.slots.find(s => s.id === slotId);
    if (!slot || slot.status !== 'available') {
      return { success: false, message: '车位不可用' };
    }
    slot.status = 'occupied';
    slot.plateNumber = plateNumber || generatePlateNumber();
    slot.startTime = new Date();
    slot.ownerName = '外来车辆';
    return { success: true, message: '外来车辆已停放', slot };
  };

  const releaseSlot = (slotId) => {
    const slot = state.slots.find(s => s.id === slotId);
    if (!slot || slot.status !== 'occupied') {
      return { success: false, message: '车位未被占用' };
    }
    
    let fee = 0;
    let durationHours = 0;
    
    if (slot.type === 'temporary') {
      const calculation = calculateParkingFee(slot.startTime);
      fee = calculation.fee;
      durationHours = calculation.durationHours;
      state.totalIncome += fee;
      state.todayIncome += fee;
      
      state.parkingRecords.unshift({
        id: Date.now(),
        slotId: slot.id,
        plateNumber: slot.plateNumber,
        startTime: slot.startTime,
        endTime: new Date(),
        durationHours,
        fee,
        type: 'temporary'
      });
    } else {
      state.parkingRecords.unshift({
        id: Date.now(),
        slotId: slot.id,
        plateNumber: slot.plateNumber,
        startTime: slot.startTime,
        endTime: new Date(),
        durationHours: 0,
        fee: 0,
        type: 'fixed'
      });
    }
    
    slot.status = 'available';
    slot.plateNumber = null;
    slot.startTime = null;
    slot.ownerName = null;
    
    return { success: true, message: '车辆已驶出', fee, durationHours };
  };

  const getSlotById = (slotId) => {
    return state.slots.find(s => s.id === slotId);
  };

  const resetParkingLot = () => {
    state.slots = createParkingSlots();
    state.parkingRecords = [];
    state.totalIncome = 0;
    state.todayIncome = 0;
  };

  const getCurrentDuration = (slotId) => {
    const slot = state.slots.find(s => s.id === slotId);
    if (!slot || !slot.startTime) return { hours: 0, fee: 0 };
    return calculateParkingFee(slot.startTime);
  };

  return {
    state,
    fixedSlots,
    temporarySlots,
    statistics,
    parkOwnerVehicle,
    parkTemporaryVehicle,
    releaseSlot,
    getSlotById,
    resetParkingLot,
    calculateParkingFee,
    getCurrentDuration,
    HOURLY_RATE,
    FREE_DAILY_MAX
  };
};
