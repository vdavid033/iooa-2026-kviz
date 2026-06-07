<template>
  <q-page class="q-pa-md leaderboard-page">

    <div class="text-h4 q-mb-lg">Leaderboard</div>

    <!--TOP 3 centrirano  -->
    <div
      class="row justify-center q-mb-xl"
      v-if="leaderboard.length >= 3"
    >
      <div class="col-12 col-lg-8">

        <div class="row q-col-gutter-md justify-center">

          <!-- 2. MJESTO -->
          <div class="col-12 col-md-4">
            <q-card class="podium-card silver-card fade-in ">
              <div class="podium-rank">🥈 #2</div>
              <div class="podium-user">{{ leaderboard[1].username }}</div>
              <div class="podium-score">{{ leaderboard[1].best_score }} bodova</div>

              <div class="podium-stat">Kvizovi: {{ leaderboard[1].total_games }}</div>
              <div class="podium-stat">Prosjek: {{ leaderboard[1].avg_score }}</div>
              <div class="podium-stat">Vrijeme: {{ leaderboard[1].best_score_time }} s</div>
            </q-card>
          </div>

          <!-- 1. MJESTO -->
          <div class="col-12 col-md-4">
            <q-card class="podium-card gold-card fade-in delay-1">
              <div class="podium-rank">🥇 #1</div>
              <div class="podium-user">{{ leaderboard[0].username }}</div>
              <div class="podium-score">{{ leaderboard[0].best_score }} bodova</div>

              <div class="podium-stat">Kvizovi: {{ leaderboard[0].total_games }}</div>
              <div class="podium-stat">Prosjek: {{ leaderboard[0].avg_score }}</div>
              <div class="podium-stat">Vrijeme: {{ leaderboard[0].best_score_time }} s</div>
            </q-card>
          </div>

          <!-- 3. MJESTO -->
          <div class="col-12 col-md-4">
            <q-card class="podium-card bronze-card fade-in ">
              <div class="podium-rank">🥉 #3</div>
              <div class="podium-user">{{ leaderboard[2].username }}</div>
              <div class="podium-score">{{ leaderboard[2].best_score }} bodova</div>

              <div class="podium-stat">Kvizovi: {{ leaderboard[2].total_games }}</div>
              <div class="podium-stat">Prosjek: {{ leaderboard[2].avg_score }}</div>
              <div class="podium-stat">Vrijeme: {{ leaderboard[2].best_score_time }} s</div>
            </q-card>
          </div>

        </div>

      </div>
    </div>

    <!-- MAIN CONTENT ROW -->
    <div class="row q-col-gutter-md">

      <!-- STATISTIKA (LIJEVO) -->
      <div class="col-12 col-lg-3">
        <q-card class="dashboard-card q-pa-md fade-in full-height">

          <div class="text-h6 q-mb-md">Top igrači</div>

          <div class="stat-row">
            <span class="stat-label">Ukupno igrača</span>
            <span class="stat-value">{{ leaderboard.length }}</span>
          </div>

          <div class="stat-row">
            <span class="stat-label">Najbolji rezultat</span>
            <span class="stat-value">{{ leaderboard[0]?.best_score || 0 }}</span>
          </div>

          <template v-if="myRank">
            <div class="stat-row">
              <span class="stat-label">Tvoj rank</span>
              <span class="stat-value">#{{ myRank }}</span>
            </div>

            <div class="stat-row">
              <span class="stat-label">Tvoj best score</span>
              <span class="stat-value">{{ myBestScore }}</span>
            </div>
          </template>

          <template v-else>
            <div class="empty-rank-state">
              <div class="text-caption text-grey-6">
                Odigraj kviz da vidiš svoj položaj
              </div>

              <q-btn
                class="quiz-btn full-width q-mt-sm"
                icon="play_arrow"
                label="Zaigraj kviz"
                to="/kviz5"
                unelevated
              />
            </div>
          </template>

        </q-card>
      </div>

      <!-- TABLICA (DESNO) -->
      <div class="col-12 col-lg-9">
        <q-card class="dashboard-card q-pa-md fade-in full-height">

          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Poredak</div>

            <q-input
              dense
              outlined
              v-model="search"
              placeholder="Pretraži igrača"
              style="max-width:260px"
            />
          </div>

          <q-table
            flat
            bordered
            dense
            :rows="filteredRows"
            :columns="columns"
            row-key="user_id"
            :pagination="{ rowsPerPage: 10 }"
          >
            <template #body-cell-rank="props">
              <q-td :props="props">
                <q-badge v-if="props.row.rank === 1" color="amber-8">🥇 #1</q-badge>
                <q-badge v-else-if="props.row.rank === 2" color="grey-6">🥈 #2</q-badge>
                <q-badge v-else-if="props.row.rank === 3" color="deep-orange-5">🥉 #3</q-badge>
                <span v-else>#{{ props.row.rank }}</span>
              </q-td>
            </template>
          </q-table>

        </q-card>
      </div>

    </div>

  </q-page>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// leaderboard rows expected from backend
// [{ user_id, username, best_score, total_games, avg_score }]
const leaderboard = ref([])
const search = ref('')
const user = JSON.parse(localStorage.getItem('user') || 'null')

const loadLeaderboard = async () => {
  const res = await axios.get('http://localhost:3000/leaderboard')
  leaderboard.value = (res.data || []).map((row, index) => ({
    ...row,
    rank: index + 1
  }))
}

onMounted(loadLeaderboard)

const filteredRows = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return leaderboard.value
  return leaderboard.value.filter(r => (r.username || '').toLowerCase().includes(q))
})

const myRank = computed(() => {
  if (!user) return null
  const found = leaderboard.value.find(r => r.user_id === user.id)
  return found?.rank || null
})

const columns = [
  {
    name: 'rank',
    label: 'Rank',
    field: 'rank',
    sortable: true
  },
  {
    name: 'username',
    label: 'Igrač',
    field: 'username',
    sortable: true
  },
  {
    name: 'best_score',
    label: 'Najbolji rezultat',
    field: 'best_score',
    sortable: true,
    format: val => `${val} bodova`
  },
  {
    name: 'best_score_time',
    label: 'Vrijeme',
    field: 'best_score_time',
    sortable: true,
    format: val => `${val}s`
  },
  {
    name: 'best_score_date',
    label: 'Datum rekorda',
    field: 'best_score_date',
    sortable: true,
    format: val => new Date(val).toLocaleString('hr-HR')
  },
  {
    name: 'avg_score',
    label: 'Prosjek',
    field: 'avg_score',
    sortable: true,
    format: val => Number(val || 0).toFixed(2)
  },
  {
    name: 'total_games',
    label: 'Kvizovi',
    field: 'total_games',
    sortable: true
  }
]
const myBestScore = computed(() => {
  if (!user) return 0

  const found = leaderboard.value.find(r => r.user_id === user.id)
  return found?.best_score || 0
})

</script>

<style>
.leaderboard-page { background:#f1f8e9; min-height:100vh; }
.dashboard-card {
  border-radius:22px; background:white;
  box-shadow:0 10px 30px rgba(0,0,0,.08);
  transition:all .3s ease;
}
.dashboard-card:hover { transform:translateY(-6px); box-shadow:0 18px 40px rgba(0,0,0,.12); }
.text-h4,.text-h6 { color:#1b5e20; font-weight:800; }
.text-h6 { font-weight:700; }
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
.stat-label { color:#1b5e20; font-weight:600; }
.stat-value { color:#1b5e20; font-weight:800; }
.fade-in { opacity:0; transform:translateY(18px); animation:fadeUp .7s ease forwards; }
.delay-1 { animation-delay:.15s; }
@keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
.q-table thead tr th { background:#f1f8e9; color:#1b5e20; font-weight:700; }

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
.empty-rank-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.empty-rank-state .text-caption {
  max-width: 220px;
  line-height: 1.5;
}
/* TOP 3 leaderboard kartice u stilu ostatka stranice */

.podium-card {
  padding: 24px;
  border-radius: 22px;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  transition: all 0.28s ease;
  text-align: center;
  border-top: 5px solid #66bb6a;
  max-width: 400px;
  margin: 0 auto;
}

.podium-card:hover {
  box-shadow: 0 18px 40px rgba(0,0,0,0.12);
}

/* Razlikovanje medalja decentno */
.gold-card {
  border-top-color: #fbc02d;
}

.silver-card {
  border-top-color: #b0bec5;

}

.bronze-card {
  border-top-color: #a1887f;
 
}

.podium-rank {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 12px;
  color: #1b5e20;
}

.podium-user {
  font-size: 22px;
  font-weight: 800;
  color: #1b5e20;
  margin-bottom: 8px;
}

.podium-score {
  font-size: 34px;
  font-weight: 900;
  color: #2e7d32;
  margin-bottom: 16px;
}

.podium-score span {
  font-size: 14px;
  font-weight: 600;
  color: #558b2f;
}

.podium-divider {
  height: 1px;
  background: #edf4ed;
  margin: 14px 0;
}

.podium-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8faf8;
  padding: 10px 12px;
  border-radius: 14px!important;
  margin-bottom: 8px;
  transition: all 0.28s ease;
  font-size: 14px;
}
.podium-stat:hover {
  background: #eef7ee;
  transform: translateX(2px);
}



.full-height {
  height: 100%;
}

.podium-card {
  height: 100%;
}

</style>