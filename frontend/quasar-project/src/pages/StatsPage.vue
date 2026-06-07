<template>
  

    <q-page class="q-pa-md stats-page">

  <div class="text-h4 q-mb-lg">Moja statistika</div>

  <div class="row q-col-gutter-md q-mb-md">

    <!-- STATISTIKA -->
    <div class="col-12 col-md-4">
      <q-card class="q-pa-md full-height dashboard-card fade-in">

        <div class="text-h6 q-mb-md">Pregled</div>

<div class="stat-row">
  <span class="stat-label"> Ukupno kvizova</span>
  <span class="stat-value">{{ stats.total_games || 0 }}</span>
</div>

<div class="stat-row">
  <span class="stat-label"> Najbolji rezultat</span>
  <span class="stat-value">{{ stats.best_score || 0 }}</span>
</div>

<div class="stat-row">
  <span class="stat-label"> Prosjek bodova</span>
  <span class="stat-value">
    {{ Number(stats.avg_score || 0).toFixed(2) }}
  </span>
</div>

<div class="stat-row">
  <span class="stat-label"> Ukupno bodova</span>
  <span class="stat-value">{{ stats.total_points || 0 }}</span>
</div>
<div class="stat-row">
  <span class="stat-label"> Ukupno točnih odgovora</span>
  <span class="stat-value">{{ stats.total_correct || 0 }}</span>
</div>

<div class="stat-row">
  <span class="stat-label"> Ukupno netočnih odgovora</span>
  <span class="stat-value">{{ stats.total_wrong || 0 }}</span>
</div>
<div class="stat-row">
  <span class="stat-label"> Prosječno vrijeme</span>
  <span class="stat-value">{{ stats.avg_time || 0 }} s</span>
</div>

<div class="stat-row">
  <span class="stat-label"> Najbrže rješavanje</span>
  <span class="stat-value">{{ stats.best_time || 0 }} s</span>
</div>

<div class="stat-row">
  <span class="stat-label"> Ukupno igrano</span>
  <span class="stat-value">{{ formatSeconds(stats.total_time || 0) }}
</span>
</div>

<div class="stat-row">
  <span class="stat-label"> Zadnje igranje</span>
  <span class="stat-value small-date">
    {{
      stats.last_played
        ? formatDate(stats.last_played)
        : "Nema podataka"
    }}
  </span>
</div>



      </q-card>
    </div>

    <!-- GRAF -->
    <!-- DESNA STRANA -->
<div class="col-12 col-md-8">

  <q-card class="q-pa-md dashboard-card fade-in delay-1 q-mb-md">
    <div class="text-h6 q-mb-md">Graf rezultata</div>

    <div class="chart-wrapper">

  <div v-if="chartHistory.length">
    <vue-apex-charts
      :key="chartHistory.length + selectedRange"
      type="line"
      height="420"
      :options="chartOptions"
      :series="series"
    />
  </div>

  <div v-else class="no-data-state">
    <q-icon name="insights" size="64px" color="grey-5" />
    <div class="text-h6 q-mt-sm">Nema podataka</div>
    <div class="text-caption text-grey-6">
      Igraj kvizove da vidiš svoj graf napretka
    </div>
    <q-btn
        class="quiz-btn full-width q-mt-md"
        icon="play_arrow"
        label="Pokreni kviz"
        to="/kviz5"
        unelevated
    />



  </div>

</div>

  </q-card>

  <!-- MINI STATISTIKE -->
  <div class="row q-col-gutter-md">

    <div class="col-12 col-sm-6">
      <q-card class="mini-card fade-in delay-2">
        <div class="mini-title">Točnost</div>
        <div class="mini-value">
          {{
            stats.total_correct + stats.total_wrong > 0
              ? Math.round((stats.total_correct / (stats.total_correct + stats.total_wrong)) * 100)
              : 0
          }}%
        </div>
      </q-card>
    </div>

    <div class="col-12 col-sm-6">
      <q-card class="mini-card fade-in delay-2">
        <div class="mini-title">Prosječno vrijeme</div>
        <div class="mini-value">{{ stats.avg_time || 0 }} s</div>
      </q-card>
    </div>

    <div class="col-12 col-sm-6">
      <q-card class="mini-card fade-in delay-2">
        <div class="mini-title">Najbrže</div>
        <div class="mini-value">{{ stats.best_time || 0 }} s</div>
      </q-card>
    </div>

    <div class="col-12 col-sm-6">
      <q-card class="mini-card fade-in delay-2">
        <div class="mini-title">Ukupno igrano</div>
        <div class="mini-value">{{ stats.total_time || 0 }} s</div>
      </q-card>
    </div>

  </div>

</div>


  </div>

    <q-card class="q-pa-md dashboard-card fade-in delay-2">
      <div class="text-h6 q-mb-md">Povijest rezultata</div>
<div class="q-mb-md row q-gutter-sm">

  

  <q-btn
    label="Danas"
    :class="selectedRange === 'today' ? 'filter-active' : 'filter-btn'"
    unelevated
    @click="loadStats('today')"
  />

  <q-btn
    label="Ovaj tjedan"
    :class="selectedRange === 'week' ? 'filter-active' : 'filter-btn'"
    unelevated
    @click="loadStats('week')"
  />

  <q-btn
    label="Ovaj mjesec"
    :class="selectedRange === 'month' ? 'filter-active' : 'filter-btn'"
    unelevated
    @click="loadStats('month')"
  />

  <q-btn
    label="Sve"
    :class="selectedRange === 'all' ? 'filter-active' : 'filter-btn'"
    unelevated
    @click="loadStats('all')"
  />

</div>


      <q-table
  title="Povijest rezultata"
  :rows="tableHistory"
  :columns="columns"
  row-key="created_at"
  flat
  bordered
  dense
  class="q-mt-md"
/>

    </q-card>



  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import VueApexCharts from "vue3-apexcharts";
import { useRouter } from "vue-router";
const vueApexCharts = VueApexCharts;


const stats = ref({});
const tableHistory = ref([]);
const chartHistory = ref([]);
const selectedRange = ref("all");



const router = useRouter();

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  router.push("/login");
}

const loadStats = async (range = "all") => {
  if (!user) return;

  selectedRange.value = range;

  const res = await axios.get(
    `http://localhost:3000/user-stats/${user.id}?range=${range}`
  );

  stats.value = res.data.stats;
  tableHistory.value = res.data.tableHistory;
  chartHistory.value = res.data.chartHistory;
};

onMounted(() => {
  loadStats();
});

const formatDate = (date) => {
  return new Date(date).toLocaleString("hr-HR");
};

const columns = [
  {
    name: "rezultat",
    label: "Rezultat",
    field: "rezultat",
    sortable: true,
    format: val => `${val} bodova`
  },
    {
    name: "broj_tocnih",
    label: "Broj točnih",
    field: "broj_tocnih",
    sortable: true,
    format: val => `${val} bodova`
  },

  {
    name: "broj_netocnih",
    label: "Broj netočnih",
    field: "broj_netocnih",
    sortable: true,
    format: val => `${val} bodova`
  },
  {
  name: "vrijeme",
  label: "Vrijeme igranja",
  field: "vrijeme",
  sortable: true,
  format: val => `${val} s`
},

  {
    name: "created_at",
    label: "Datum i vrijeme",
    field: "created_at",
    sortable: true,
    format: val => formatDate(val)
  }
];
const formatSeconds = (sec) => {
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min}m ${s}s`;
};

const series = computed(() => [
  {
    name: "Bodovi",
    data: chartHistory.value.map(item => item.rezultat)
  }
]);

const chartOptions = computed(() => ({
  chart: {
    type: "line",
    height: 350,

    toolbar: {
      show: false
    },

    zoom: {
      enabled: false
    },

    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 1200,
      animateGradually: {
        enabled: true,
        delay: 180
      },
      dynamicAnimation: {
        enabled: true,
        speed: 800
      }
    }
  },

  stroke: {
    curve: "smooth",
    width: 4
  },

  colors: ["#1b5e20"],

  fill: {
    type: "gradient",
    gradient: {
      shade: "light",
      type: "vertical",
      shadeIntensity: 0.3,
      gradientToColors: ["#66bb6a"],
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 0.8,
      stops: [0, 100]
    }
  },

  xaxis: {
    categories: chartHistory.value.map(item =>
      new Date(item.created_at).toLocaleDateString("hr-HR")
    ),

    labels: {
      style: {
        fontSize: "12px"
      }
    }
  },

  yaxis: {
    title: {
      text: "Bodovi"
    },

    labels: {
      style: {
        fontSize: "12px"
      }
    }
  },

  tooltip: {
    theme: "light",

    y: {
      formatter: function (val) {
        return val + " bodova";
      }
    }
  },

  markers: {
    size: 6,
    strokeWidth: 2,
    hover: {
      size: 9
    }
  },

  states: {
    hover: {
      filter: {
        type: "lighten",
        value: 0.15
      }
    }
  },
dataLabels: {
  enabled: false
},


  grid: {
    borderColor: "#e0e0e0",
    strokeDashArray: 4
  }
}));



</script>
<style>
.stats-page {
  background: #f1f8e9;
  min-height: 100vh;
}


.q-table {
  border-radius: 16px;
  overflow: hidden;
}

.q-table thead tr th {
  background: #f1f8e9;
  color: #1b5e20;
  font-weight: 700;
}

.filter-btn {
  background: white;
  color: #1b5e20;
 
  min-width: 120px;
  font-weight: 600;
  border-radius: 20px;
}

.filter-btn:hover {
  background: #f1f8f4;
}

.filter-active {
  background: #f1f8f4;
  color: #1b5e20;
  border: 2px solid #1b5e20;
  min-width: 120px;
  font-weight: 600;
  border-radius: 20px;
  transition: all 0.25s ease;
  

}

.apexcharts-marker:hover {
  filter: drop-shadow(0 0 8px #2e7d32);
}
.full-height {
  height: 100%;
}

/* Premium kartice */
.dashboard-card {
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  background: white;
}

/* Hover effect */
.dashboard-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(0,0,0,0.12);
}

/* Fade in animacija */
.fade-in {
  opacity: 0;
  transform: translateY(18px);
  animation: fadeUp 0.7s ease forwards;
}

.delay-1 {
  animation-delay: 0.15s;
}

.delay-2 {
  animation-delay: 0.3s;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Full visina */
.full-height {
  height: 100%;
  min-height: 420px;
}

/* Naslovi */
.text-h6 {
  font-weight: 700;
  color: #1b5e20;
}

/* Page naslov */
.text-h4 {
  font-weight: 800;
  color: #1b5e20;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 12px;
  margin-bottom: 10px;
  background: #f8faf8;
  border-radius: 14px!important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  transition: all 0.25s ease;
}

.stat-row:hover {
  background: #eef7ee;
  transform: translateX(4px);
}

.stat-label {
  font-weight: 600;
  color: #1b5e20;
}

.stat-value {
  color: #1b5e20;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  min-width: 55px;
  text-align: center;
}

.small-date {
  font-size: 12px;
  padding: 6px 10px;
}

.mini-card {
  padding: 22px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 8px 24px rgba(0,0,0,0.07);
  text-align: center;
  transition: all 0.25s ease;
}

.mini-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0,0,0,0.10);
}

.mini-title {
  font-size: 14px;
  color: #558b2f;
  font-weight: 600;
  margin-bottom: 10px;
}

.mini-value {
  font-size: 28px;
  font-weight: 800;
  color: #1b5e20;
}

.chart-wrapper {
  height: 420px; 
  justify-content: center;
}

.no-data-state {
  text-align: center;
  color: #9e9e9e;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quiz-btn {
  background: linear-gradient(135deg, #2e7d32, #66bb6a);
  color: white;
  font-weight: 700;
  border-radius: 18px;
  padding: 10px 18px;
  box-shadow: 0 10px 25px rgba(46, 125, 50, 0.25);
  transition: all 0.25s ease;
  text-transform: none;
  max-width: 400px;
}

.quiz-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 35px rgba(46, 125, 50, 0.35);
}

.quiz-btn .q-icon {
  font-size: 20px;
}

</style>

