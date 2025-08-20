<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.token) {
    try {
      await authStore.fetchMe()
    } catch (e) {
      console.error('فشل جلب بيانات المستخدم:', e)
    }
  }
})
</script>

<template>
  <router-view />
</template>

<style>
/* Global styles with Tajawal font */
* {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

body {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

/* Vuetify components font override */
.v-application,
.v-btn,
.v-card,
.v-card-title,
.v-card-subtitle,
.v-card-text,
.v-text-field,
.v-select,
.v-textarea,
.v-label,
.v-input,
.v-list,
.v-list-item,
.v-list-item-title,
.v-list-item-subtitle,
.v-data-table,
.v-data-table-header,
.v-data-table__td,
.v-data-table__th,
.v-chip,
.v-alert,
.v-dialog,
.v-dialog__content,
.v-toolbar,
.v-toolbar-title,
.v-navigation-drawer,
.v-navigation-drawer__content,
.v-list-group,
.v-list-group__header,
.v-tabs,
.v-tab,
.v-tab__content,
.v-pagination,
.v-pagination__item,
.v-menu,
.v-menu__content,
.v-autocomplete,
.v-combobox,
.v-date-picker,
.v-time-picker,
.v-slider,
.v-switch,
.v-checkbox,
.v-radio,
.v-radio-group,
.v-checkbox-btn,
.v-radio-btn,
.v-file-input,
.v-rating,
.v-progress-linear,
.v-progress-circular,
.v-timeline,
.v-timeline-item,
.v-expansion-panels,
.v-expansion-panel,
.v-expansion-panel-title,
.v-expansion-panel-text,
.v-stepper,
.v-stepper-header,
.v-stepper-step,
.v-stepper-content,
.v-stepper-actions,
.v-bottom-navigation,
.v-bottom-sheet,
.v-speed-dial,
.v-tooltip,
.v-overlay,
.v-snackbar,
.v-sheet,
.v-divider,
.v-spacer,
.v-responsive,
.v-img,
.v-avatar,
.v-badge,
.v-icon,
.v-parallax,
.v-carousel,
.v-carousel-item,
.v-window,
.v-window-item,
.v-tabs-items,
.v-tab-item,
.v-window-container,
.v-window-item__wrapper,
.v-window-item__content,
.v-window-item__placeholder,
.v-window-item__overlay,
.v-window-item__background,
.v-window-item__foreground,
.v-window-item__backdrop,
.v-window-item__border,
.v-window-item__shadow,
.v-window-item__glow,
.v-window-item__pulse,
.v-window-item__ripple,
.v-window-item__wave,
.v-window-item__bounce,
.v-window-item__shake,
.v-window-item__tada,
.v-window-item__jello,
.v-window-item__bounceIn,
.v-window-item__bounceInDown,
.v-window-item__bounceInLeft,
.v-window-item__bounceInRight,
.v-window-item__bounceInUp,
.v-window-item__bounceOut,
.v-window-item__bounceOutDown,
.v-window-item__bounceOutLeft,
.v-window-item__bounceOutRight,
.v-window-item__bounceOutUp,
.v-window-item__fadeIn,
.v-window-item__fadeInDown,
.v-window-item__fadeInDownBig,
.v-window-item__fadeInLeft,
.v-window-item__fadeInLeftBig,
.v-window-item__fadeInRight,
.v-window-item__fadeInRightBig,
.v-window-item__fadeInUp,
.v-window-item__fadeInUpBig,
.v-window-item__fadeOut,
.v-window-item__fadeOutDown,
.v-window-item__fadeOutDownBig,
.v-window-item__fadeOutLeft,
.v-window-item__fadeOutLeftBig,
.v-window-item__fadeOutRight,
.v-window-item__fadeOutRightBig,
.v-window-item__fadeOutUp,
.v-window-item__fadeOutUpBig,
.v-window-item__flipInX,
.v-window-item__flipInY,
.v-window-item__flipOutX,
.v-window-item__flipOutY,
.v-window-item__lightSpeedIn,
.v-window-item__lightSpeedOut,
.v-window-item__rotateIn,
.v-window-item__rotateInDownLeft,
.v-window-item__rotateInDownRight,
.v-window-item__rotateInUpLeft,
.v-window-item__rotateInUpRight,
.v-window-item__rotateOut,
.v-window-item__rotateOutDownLeft,
.v-window-item__rotateOutDownRight,
.v-window-item__rotateOutUpLeft,
.v-window-item__rotateOutUpRight,
.v-window-item__hinge,
.v-window-item__jackInTheBox,
.v-window-item__rollIn,
.v-window-item__rollOut,
.v-window-item__zoomIn,
.v-window-item__zoomInDown,
.v-window-item__zoomInLeft,
.v-window-item__zoomInRight,
.v-window-item__zoomInUp,
.v-window-item__zoomOut,
.v-window-item__zoomOutDown,
.v-window-item__zoomOutLeft,
.v-window-item__zoomOutRight,
.v-window-item__zoomOutUp,
.v-window-item__slideInDown,
.v-window-item__slideInLeft,
.v-window-item__slideInRight,
.v-window-item__slideInUp,
.v-window-item__slideOutDown,
.v-window-item__slideOutLeft,
.v-window-item__slideOutRight,
.v-window-item__slideOutUp {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
}

/* RTL Support */
[dir='rtl'] {
  text-align: right;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Typography improvements for Arabic text */
.text-h1,
.text-h2,
.text-h3,
.text-h4,
.text-h5,
.text-h6 {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
  font-weight: 600;
}

.text-body-1,
.text-body-2,
.text-caption,
.text-overline {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
}

/* Button text improvements */
.v-btn__content {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
  font-weight: 500;
}

/* Input improvements */
.v-field__input {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
}

.v-field__label {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
}

/* Table improvements */
.v-data-table__td,
.v-data-table__th {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
}

/* Card improvements */
.v-card-title {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
  font-weight: 600;
}

.v-card-subtitle {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
  font-weight: 400;
}

.v-card-text {
  font-family:
    'Tajawal',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
}
</style>
