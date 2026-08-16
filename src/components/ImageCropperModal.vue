<template>
  <div v-if="visible" class="modal-overlay" style="z-index: 9999;">
    <div class="modal-container max-w-lg">
      <div class="modal-header">
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Crop Your Image</h3>
        <button @click="$emit('close')" class="modal-close">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Interactive Cropping Area -->
        <div 
          class="relative bg-slate-900 rounded-xl overflow-hidden cursor-move flex items-center justify-center select-none"
          style="height: 320px;"
          @mousedown="startDrag"
          @mousemove="drag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
          @touchstart="startDrag"
          @touchmove="drag"
          @touchend="endDrag"
        >
          <!-- Display Image -->
          <img 
            ref="imgRef"
            :src="imageSrc" 
            alt="Source"
            class="absolute pointer-events-none origin-center max-w-none max-h-none"
            :style="{
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }"
            @load="resetImagePosition"
          />

          <!-- Crop Mask Overlay -->
          <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
            <!-- Grid Mask Overlay with round or square selection window -->
            <div 
              :class="[
                'border-2 border-indigo-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.7)]', 
                cropShape === 'round' ? 'rounded-full' : 'rounded-lg'
              ]"
              :style="{
                width: `${cropWidth}px`,
                height: `${cropHeight}px`
              }"
            >
              <!-- Center Guide Lines -->
              <div class="w-full h-full relative opacity-30">
                <div class="absolute top-1/2 left-0 right-0 h-0.5 border-t border-dashed border-white"></div>
                <div class="absolute left-1/2 top-0 bottom-0 w-0.5 border-l border-dashed border-white"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aspect Ratio Selector -->
        <div class="space-y-2">
          <span class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aspect Ratio Preset</span>
          <div class="flex gap-2">
            <button 
              type="button"
              v-for="preset in aspectPresets" 
              :key="preset.value" 
              @click="selectedAspect = preset.value"
              :class="['text-[10px] font-bold px-2.5 py-1 border rounded-lg transition-all', selectedAspect === preset.value ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-slate-200 text-slate-600 hover:bg-slate-50']"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Controls -->
        <div class="space-y-3">
          <div class="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Zoom Scale: {{ scale.toFixed(1) }}x</span>
            <button @click="resetImagePosition" class="text-indigo-600 hover:underline">Reset Position</button>
          </div>
          <input 
            v-model.number="scale" 
            type="range" 
            min="0.5" 
            max="3" 
            step="0.05"
            class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            @click="cropImage" 
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick, computed } from 'vue';

export default {
  props: {
    visible: Boolean,
    imageSrc: String,
    aspectRatio: {
      type: Number,
      default: 1 // Width / Height ratio. 1 = 1:1, 1.33 = 4:3, 1.77 = 16:9
    },
    cropShape: {
      type: String,
      default: 'rect' // 'rect' or 'round'
    }
  },
  emits: ['close', 'crop'],
  setup(props, { emit }) {
    const imgRef = ref(null);
    const scale = ref(1);
    const offsetX = ref(0);
    const offsetY = ref(0);

    const isDragging = ref(false);
    let startX = 0;
    let startY = 0;

    const selectedAspect = ref(props.aspectRatio || 1);
    const aspectPresets = [
      { label: 'Square (1:1)', value: 1 },
      { label: 'Standard (4:3)', value: 1.33 },
      { label: 'Widescreen (16:9)', value: 1.77 }
    ];

    // Crop box width and height based on the container constraints
    const cropWidth = 240;
    const cropHeight = computed(() => cropWidth / selectedAspect.value);

    const resetImagePosition = () => {
      scale.value = 1;
      offsetX.value = 0;
      offsetY.value = 0;
    };

    watch(() => props.visible, (val) => {
      if (val) {
        nextTick(resetImagePosition);
      }
    });

    const startDrag = (e) => {
      isDragging.value = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startX = clientX - offsetX.value;
      startY = clientY - offsetY.value;
    };

    const drag = (e) => {
      if (!isDragging.value) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      offsetX.value = clientX - startX;
      offsetY.value = clientY - startY;
    };

    const endDrag = () => {
      isDragging.value = false;
    };

    const cropImage = () => {
      const img = imgRef.value;
      if (!img) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // High quality target resolutions:
      // 1:1 -> 400x400
      // 4:3 -> 800x600
      // 16:9 -> 1280x720
      const targetWidth = props.aspectRatio === 1 ? 400 : (props.aspectRatio > 1.4 ? 1280 : 800);
      const targetHeight = targetWidth / props.aspectRatio;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calculations:
      // 1. Get the actual scale ratio between HTML container size of the image and the natural source image size
      const naturalRatio = img.naturalWidth / img.width;

      // 2. Center crop mapping coordinates
      // Crop area is centered in 320px high viewport. Offset mapping back to original source coords:
      const viewPortWidth = 480; // container width (max-w-lg is 512px, canvas view is ~480px)
      const viewPortHeight = 320;

      const cropLeft = (viewPortWidth - cropWidth) / 2;
      const cropTop = (viewPortHeight - cropHeight.value) / 2;

      // Image center in view coords
      const imgLeft = (viewPortWidth - img.width) / 2 + offsetX.value;
      const imgTop = (viewPortHeight - img.height) / 2 + offsetY.value;

      // Scale calculations relative to canvas coordinates
      const destScale = targetWidth / cropWidth;

      ctx.save();
      if (props.cropShape === 'round') {
        ctx.beginPath();
        ctx.arc(targetWidth / 2, targetHeight / 2, targetWidth / 2, 0, Math.PI * 2);
        ctx.clip();
      }

      // Draw the image transformed to the destination cropped canvas
      const drawWidth = img.naturalWidth * scale.value * (destScale / naturalRatio);
      const drawHeight = img.naturalHeight * scale.value * (destScale / naturalRatio);

      const drawX = (imgLeft - cropLeft) * destScale;
      const drawY = (imgTop - cropTop) * destScale;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      emit('crop', croppedDataUrl);
      emit('close');
    };

    return {
      imgRef,
      scale,
      offsetX,
      offsetY,
      isDragging,
      selectedAspect,
      aspectPresets,
      cropWidth,
      cropHeight,
      resetImagePosition,
      startDrag,
      drag,
      endDrag,
      cropImage
    };
  }
};
</script>
