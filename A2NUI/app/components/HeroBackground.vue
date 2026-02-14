<template>
  <div class="hero-bg" aria-hidden="true">
    <!-- Dot grid -->
    <div class="hero-grid" />

    <!-- Floating glow orbs -->
    <div class="hero-orb hero-orb--1" />
    <div class="hero-orb hero-orb--2" />
    <div class="hero-orb hero-orb--3" />

    <!-- Radial vignette -->
    <div class="hero-vignette" />
  </div>
</template>

<style scoped>
.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

/* Dot matrix grid */
.hero-grid {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  background-image: radial-gradient(circle, var(--ui-primary) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.08;
  animation: grid-drift 30s linear infinite;
  mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 70%);
}

@keyframes grid-drift {
  0% { transform: translate(0, 0) perspective(800px) rotateX(5deg); }
  50% { transform: translate(-24px, -24px) perspective(800px) rotateX(5deg); }
  100% { transform: translate(0, 0) perspective(800px) rotateX(5deg); }
}

/* Floating glow orbs */
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: orb-float 20s ease-in-out infinite;
}

.hero-orb--1 {
  width: 500px;
  height: 500px;
  background: var(--ui-primary);
  top: -10%;
  left: 20%;
  animation-duration: 25s;
}

.hero-orb--2 {
  width: 350px;
  height: 350px;
  background: color-mix(in srgb, var(--ui-primary) 60%, #3b82f6);
  bottom: -5%;
  right: 15%;
  animation-delay: -8s;
  animation-duration: 20s;
}

.hero-orb--3 {
  width: 250px;
  height: 250px;
  background: color-mix(in srgb, var(--ui-primary) 40%, #8b5cf6);
  top: 30%;
  right: 30%;
  animation-delay: -15s;
  animation-duration: 30s;
  opacity: 0.1;
}

@keyframes orb-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -40px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(40px, 30px) scale(1.03); }
}

/* Radial vignette fade */
.hero-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, var(--ui-bg) 80%);
}

@media (max-width: 640px) {
  .hero-grid {
    background-size: 32px 32px;
    opacity: 0.05;
  }
  .hero-orb--1 { width: 250px; height: 250px; }
  .hero-orb--2 { width: 180px; height: 180px; }
  .hero-orb--3 { display: none; }
}
</style>
