<template>
  <q-page class="flex flex-center">
    <div class="fit row wrap justify-center items-start content-center">
      <div class="row">
        <div class="col">
          <img alt="Quasar logo" src="https://i.ibb.co/NZmYGvf/wallpaper.png" />
        </div>
      </div>
      <div class="fit column items-center q-gutter-md">

  <!-- GLAVNI GUMB -->
  <q-btn
    size="large"
    color="positive"
    label="Započnite kviz"
    href="#/kviz5"
    rounded
    class="hover-animate main-btn"
    icon="play_arrow"
  />

  <!-- DODATNI GUMBI -->
  <div class="row q-col-gutter-md justify-center  q-gutter-md">

    <div class="col-auto">
      <q-btn
        color="amber-8"
        label="Leaderboard"
        icon="emoji_events"
        href="#/leaderboard"
        rounded
        unelevated
        class="menu-btn"
      />
    </div>

    <div class="col-auto">
      <q-btn
        color="primary"
        label="Moja statistika"
        icon="bar_chart"
        href="#/stats"
        rounded
        unelevated
        class="menu-btn"
      />
    </div>

    <div class="col-auto">
      <q-btn
        color="deep-purple"
        label="Usporedba"
        icon="compare_arrows"
        href="#/compare-stats"
        rounded
        unelevated
        class="menu-btn"
      />
    </div>

  </div>
</div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "IndexPage",
});
</script>

<style>
.hover-animate {
  transition: all 0.25s ease;
}

.hover-animate:hover {
  transform: translateY(-4px) scale(1.03);
}

.main-btn {
  min-width: 260px;
  font-weight: 700;
  font-size: 18px;
}

.menu-btn {
  min-width: 200px;
  font-weight: 600;
  transition: all 0.25s ease;
}

.menu-btn:hover {
  transform: translateY(-3px);
}
</style>