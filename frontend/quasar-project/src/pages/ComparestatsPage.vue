<template>
  <q-page class="q-pa-md comparison-page">

    <div class="text-h4 q-mb-lg">Usporedba statistike</div>
<div class="row q-col-gutter-md q-mt-md">

  <!-- TABLICA -->
  <div class="col-12 col-md-6">
    <q-card class="dashboard-card q-pa-md fade-in full-height">
      <div class="text-h6 q-mb-md">Usporedba statistike</div>

      <q-table
        flat
        bordered
        dense
        :rows="comparisonRows"
        :columns="comparisonColumns"
        row-key="label"
        hide-pagination
      />
    </q-card>
  </div>

  <!-- RADAR -->
  <div class="col-12 col-md-6">
    <q-card class="dashboard-card q-pa-md fade-in delay-1 full-height">
      <div class="text-h6 q-mb-md">Radar usporedba</div>

      <apexchart
        type="radar"
        height="350"
        :options="radarOptions"
        :series="radarSeries"
      />
    </q-card>
  </div>

</div>

    

    <!-- ================= GRAF ================= -->
<div class="row q-col-gutter-md q-mt-md">

  <!-- LIJEVO: BAR GRAF -->
  <div class="col-12 col-md-7">
    <q-card class="dashboard-card q-pa-md fade-in full-height" style="min-height: 600px">
      <div class="text-h6 q-mb-md">Usporedba (ti vs prosjek)</div>

      <apexchart
        type="bar"
        height="100%"
        :options="chartOptions"
        :series="series"
      />
    </q-card>
  </div>

  <!-- DESNO: GAUGEOVI -->
  <div class="col-12 col-md-5 column q-gutter-md ">

    <!-- TOČNI -->
    <q-card class="dashboard-card q-pa-md text-center fade-in delay-1" style="min-height: 300px">
      <div class="text-subtitle1 q-mb-sm">Prosjek točnih odgovora</div>

      <apexchart
        type="radialBar"
        height="220"
        :options="correctGaugeOptions"
        :series="correctGaugeSeries"
      />
    </q-card>

    <!-- NETOČNI -->
    <q-card class="dashboard-card q-pa-md text-center fade-in delay-2" style="min-height: 300px">
      <div class="text-subtitle1 q-mb-sm">Prosjek netočnih odgovora</div>

      <apexchart
        type="radialBar"
        height="220"
        :options="wrongGaugeOptions"
        :series="wrongSeries"
      />
    </q-card>

  </div>

</div>


        

  </q-page>
</template>


<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import ApexChart from "vue3-apexcharts";
import { useRouter } from "vue-router";

const apexchart = ApexChart;

const router = useRouter();

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  router.push("/login");
}

const myStats = ref({
  avg_score: 0,
  best_score: 0,
  total_games: 0,
  avg_time: 0,
  avg_correct: 0,
  avg_wrong: 0
});

const globalStats = ref({
  avg_score: 0,
  best_score: 0,
  total_games: 0,
  avg_time: 0,
  avg_correct: 0,
  avg_wrong: 0
});


const loadStats = async () => {

  if (!user) return;

  const res = await axios.get(
    `http://localhost:3000/compare-stats/${user.id}`
  );

  console.log("RESPONSE:", res.data);

  myStats.value = res.data.my;
  globalStats.value = res.data.global;
};


onMounted(loadStats);

const series = computed(() => [
  {
    name: "Ti",
    data: [
      myStats.value.avg_score,
      myStats.value.best_score,
      myStats.value.avg_time
    ]
  },
  {
    name: "Prosjek",
    data: [
      globalStats.value.avg_score,
      globalStats.value.best_score,
      globalStats.value.avg_time
    ]
  }
]);


const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: false }
  },
  xaxis: {
    categories: ["Prosjek bodova", "Najviše bodova", "Vrijeme (s)" ]
  },
  colors: ["#2e7d32", "#81c784"]
}));

const normalize = (value, max) => {
  if (!max || max === 0) return 0
  return (value / max) * 100
}

const maxValues = computed(() => ({
  score: Math.max(
    myStats.value.best_score || 0,
    globalStats.value.best_score || 0
  ),

  games: Math.max(
    myStats.value.total_games || 0,
    globalStats.value.total_games || 0
  ),

  correct: Math.max(
    myStats.value.avg_correct || 0,
    globalStats.value.avg_correct || 0
  ),

  wrong: Math.max(
    myStats.value.avg_wrong || 0,
    globalStats.value.avg_wrong || 0
  ),

  time: Math.max(
    myStats.value.avg_time || 0,
    globalStats.value.avg_time || 0
  )
}))
const radarSeries = computed(() => [
  {
    name: "Ti",
    data: [
      normalize(myStats.value.avg_score, maxValues.value.score),
      normalize(myStats.value.best_score, maxValues.value.score),
      normalize(myStats.value.avg_correct, maxValues.value.correct),
      normalize(myStats.value.avg_wrong, maxValues.value.wrong),
      normalize(myStats.value.avg_time, maxValues.value.time)
    ]
  },
  {
    name: "Prosjek",
    data: [
      normalize(globalStats.value.avg_score, maxValues.value.score),
      normalize(globalStats.value.best_score, maxValues.value.score),
      normalize(globalStats.value.avg_correct, maxValues.value.correct),
      normalize(globalStats.value.avg_wrong, maxValues.value.wrong),
      normalize(globalStats.value.avg_time, maxValues.value.time)
    ]
  }
])

const radarOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 800
    }
  },

  labels: [
    "Prosjek bodova",
    "Najbolji rezultat",
    "Točni odgovori",
    "Netočni odgovori",
    "Vrijeme (s)"
  ],

  colors: ["#2e7d32", "#66bb6a"],

  fill: {
    opacity: 0.25
  },

  stroke: {
    width: 2
  },

  markers: {
    size: 4,
    hover: {
      size: 7
    }
  },

  plotOptions: {
    radar: {
      polygons: {
        strokeColors: "#e0e0e0",
        fill: {
          colors: ["#f1f8e9", "#ffffff"]
        }
      }
    }
  },

  yaxis: {
    show: false
  },

  legend: {
    position: "bottom"
  },

tooltip: {
  y: {
    formatter: (val, { seriesIndex, dataPointIndex, w }) => {

      const isMe = w.globals.seriesNames[seriesIndex] === "Ti"

      const data = isMe ? myStats.value : globalStats.value

      const map = [
        data.avg_score ?? 0,
        data.best_score ?? 0,
        data.avg_correct ?? 0,
        data.avg_wrong ?? 0,
        data.avg_time ?? 0
      ]

      const labels = [
        "Prosjek bodova",
        "Najbolji rezultat",
        "Točni odgovori",
        "Netočni odgovori",
        "Vrijeme (s)"
      ]

      return `${labels[dataPointIndex]}: ${map[dataPointIndex]}`
    }
  }
}


}))

const comparisonColumns = [
  {
    name: "label",
    label: "Statistika",
    field: "label",
    align: "left"
  },
  {
    name: "me",
    label: "Ti",
    field: "me",
    align: "center"
  },
  {
    name: "avg",
    label: "Prosjek",
    field: "avg",
    align: "center"
  }
]
const comparisonRows = computed(() => [
  {
    label: "Prosjek bodova",
    me: Number(myStats.value.avg_score || 0).toFixed(2),
    avg: Number(globalStats.value.avg_score || 0).toFixed(2)
  },
  {
    label: "Najbolji rezultat",
    me: myStats.value.best_score || 0,
    avg: globalStats.value.best_score || 0
  },
  {
    label: "Ukupno kvizova",
    me: myStats.value.total_games || 0,
    avg: globalStats.value.total_games || 0
  },
  {
    label: "Točni odgovori",
    me: myStats.value.avg_correct || 0,
    avg: globalStats.value.avg_correct || 0
  },
  {
    label: "Netočni odgovori",
    me: myStats.value.avg_wrong || 0,
    avg: globalStats.value.avg_wrong || 0
  },
  {
    label: "Prosječno vrijeme (s)",
    me: Number(myStats.value.avg_time || 0).toFixed(2),
    avg: Number(globalStats.value.avg_time || 0).toFixed(2)
  }
])

const correctGaugeOptions = computed(() => ({
  chart: {
    type: 'radialBar'
  },

  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,

      hollow: {
        size: '60%'
      },

      track: {
        background: '#e0e0e0',
        strokeWidth: '100%'
      },

      dataLabels: {
        show: true,

        name: {
          show: true,
          fontSize: '14px',
          offsetY: 30
        },

        value: {
          fontSize: '28px',
          fontWeight: 800,
          offsetY: -10,
          formatter: () => {
            return `${myStats.value.avg_correct?.toFixed(1)}`
          }
        },

        total: {
          show: true,
          label: 'Prosjek',
          formatter: () => globalStats.value.avg_correct?.toFixed(1)
        }
      }
    }
  },

  stroke: {
    lineCap: 'round'
  },

  colors: [
    '#1b5e20', // TI (tamno zelena)
    '#a5d6a7'  // PROSJEK (svijetlo zelena)
  ],

  legend: {
  show: true,
  position: 'bottom',
  offsetY: -10
}
,

  labels: ['Ti', 'Prosjek']
}))


const correctGaugeSeries = computed(() => [
  Math.min(100, (myStats.value.avg_correct / 10) * 100),
  Math.min(100, (globalStats.value.avg_correct / 10) * 100)
])




const wrongGaugeOptions = computed(() => ({
  chart: {
    type: 'radialBar'
  },

  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,

      hollow: {
        size: '60%'
      },

      track: {
        background: '#e0e0e0',
        strokeWidth: '100%'
      },

      dataLabels: {
        show: true,

        name: {
          show: true,
          fontSize: '14px',
          offsetY: 30
        },

        value: {
          fontSize: '28px',
          fontWeight: 800,
          offsetY: -10,
          formatter: () => {
            return `${myStats.value.avg_wrong?.toFixed(1)}`
          }
        },

        total: {
          show: true,
          label: 'Prosjek',
          formatter: () => globalStats.value.avg_wrong?.toFixed(1)
        }
      }
    }
  },

  stroke: {
    lineCap: 'round'
  },

  colors: [
    '#b71c1c', // TI (tamno crvena)
    '#ffcdd2'  // PROSJEK (svijetlo crvena)
  ],

legend: {
  show: true,
  position: 'bottom',
  offsetY: -20
},

  labels: ['Ti', 'Prosjek']
}))

const wrongSeries = computed(() => [
  Math.min(100, (myStats.value.avg_wrong / 10) * 100),
  Math.min(100, (globalStats.value.avg_wrong / 10) * 100)
])

</script>



<style>
.comparison-page {
  background:#f1f8e9; 
  min-height:100vh;
}
.stat-row span:last-child {
  font-weight: 800;
  color: #1b5e20;
}
.text-h4,.text-h6 { 
  color:#1b5e20; 
  font-weight:800;
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
/* Premium kartice */
.dashboard-card {
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  background: white;
  min-height: 260px;
}

/* Hover effect */
.dashboard-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(0,0,0,0.12);
}

.q-table thead tr th {
  background: #f1f8e9;
  color: #1b5e20;
  font-weight: 700;
}

.q-table tbody tr {
  transition: all 0.2s ease;
}

.q-table tbody tr:hover {
  background: #f9fbf9;
}

.q-table td {
  font-weight: 600;
  color: #1b5e20; 
  
}

.full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.full-height .q-table,
.full-height .apexcharts-canvas {
  flex: 1;
}
.dashboard-card {
  border-radius: 22px;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,.08);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-4px);
}
.q-table tbody td {
  padding: 16px 12px;
  font-size: 15px;
  line-height: 2.5;
   
}


</style>