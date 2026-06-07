<template>
  <div class="relative fixed-center">
    <!-- BODOVI -->
    <div class="q-pa-md">
      <div class="text-h6">Bodovi: {{ state.bodovi }}</div>
    </div>

    <!-- PITANJE -->
    <div class="q-pa-md q-gutter-sm">
      <q-banner inline-actions rounded class="bg-positive text-white">
        <div class="text-h5 full-width">
          <span>{{ state.questionNumber }}. </span>

          <span>
            {{ state.trueFalseMode ? state.trueFalsePitanje : state.pitanje }}
            <strong v-if="state.praznina.aktivan"> ________ ?</strong>
          </span>

          <span class="tezina">
            (Težina: {{ state.tezina }})
          </span>
        </div>
      </q-banner>

      <q-img
        width="700px"
        height="350px"
        :src="state.image"
        :ratio="16 / 9"
      />
    </div>

    <!-- ODGOVORI -->
    <div class="q-pa-md odgovori">
      <!-- MCQ / TRUE FALSE -->
      <template v-if="!state.praznina.aktivan">
        <q-radio
          v-for="odgovor in state.odgovori"
          :key="odgovor.id"
          v-model.number="state.odabraniOdgovor"
          :val="odgovor.id"
          :label="getLabel(odgovor)"
          color="teal"
        />
      </template>

      <!-- PRAZNINA -->
      <template v-else>
        <div class="crtice-container">
          <template
            v-for="(slovo, i) in state.praznina.crticePrikaz"
            :key="i"
          >
            <span
              v-if="slovo === ' '"
              class="crtice-razmak"
            >
              &nbsp;&nbsp;
            </span>

            <input
              v-else
              :ref="el => { if (el) crticaRefs[i] = el }"
              v-model="state.praznina.crticePrikaz[i]"
              class="crtice-input"
              maxlength="1"
              :disabled="state.praznina.odgovorPotvrden"
              @input="onCrticaInput(i)"
              @keydown.delete="onCrticaDelete(i)"
            />
          </template>
        </div>
      </template>
    </div>

    <!-- BUTTONS -->
    <div class="q-pa-md q-gutter-sm">
      <q-btn
        v-if="state.questionNumber < 10"
        id="PrihvatiOdgovor"
        color="white"
        text-color="black"
        label="Prihvati odgovor"
        @click="checkAnswer"
      />

      <q-btn
        id="PrihvatiIZavrsi"
        color="white"
        text-color="black"
        label="Prihvati i završi"
        @click="handleFinish"
      />

      <q-btn
        color="white"
        text-color="black"
        label="Restart"
        @click="restartQuiz"
      />
    </div>

    <!-- ALERT -->
    <q-dialog v-model="state.alert" persistent>
      <q-card
        :class="
          state.lastCorrect
            ? 'bg-positive text-white'
            : 'bg-negative text-white'
        "
      >
        <q-card-section class="q-pt-none">
          <div
            v-if="state.lastCorrect"
            class="text-h6 q-mt-sm"
          >
            ✓ TOČNO
          </div>

          <div v-else>
            <div class="text-h6 q-mt-sm">
              ✗ NETOČNO
            </div>

            <div class="q-mt-sm">
              Biljka sa slike je:
              <b>{{ state.plant.croatian_name }}</b>
            </div>

            <div class="q-mt-xs">
              Latinski naziv:
              <b>{{ state.plant.latin_name }}</b>
            </div>

            <div
              class="q-mt-xs"
              v-if="state.trueFalsePorodica"
            >
              Porodica:
              <b>{{ state.trueFalsePorodica }}</b>
            </div>
          </div>
        </q-card-section>

        <q-card-section
          v-if="!state.lastCorrect && state.porukaOhrabrenja"
          class="q-pt-none text-white text-weight-medium"
        >
          {{ state.porukaOhrabrenja }}
        </q-card-section>

        <q-card-section
          v-if="state.funFact"
          class="q-pt-none text-white"
        >
          <div class="text-weight-bold">
            Zanimljivost:
          </div>

          <div>{{ state.funFact }}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            :color="state.lastCorrect ? 'white' : 'primary'"
            @click="nextQuestion"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- END -->
    <q-dialog v-model="state.zavrsniPopup" persistent>
      <q-card>
        <q-card-section class="text-center">
          <div class="text-h6">
            Kraj kviza
          </div>
        </q-card-section>

        <q-card-section class="text-center">
          <div>Točno: {{ state.brojTocnih }}</div>
          <div>Netočno: {{ state.brojNetocnih }}</div>
          <div>Bodovi: {{ state.bodovi }}</div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            flat
            label="Početna"
            color="primary"
            href="/"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { onMounted, reactive } from "vue";
import axios from "axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const porukeOhrabrenja = [
  "Nema veze, sljedeći pokušaj može biti uspješniji!",
  "Pogreške su dio učenja.",
  "Nastavite dalje, svaki pokušaj doprinosi učenju.",
  "Znanje se stječe postupno.",
  "Učenje je proces, a ne savršenstvo.",
  "Trud i upornost vode do rezultata.",
  "Napredak dolazi kroz trud i ponavljanje.",
];

export default {
  setup() {
    
    
    const crticaRefs = {};

    const state = reactive({
      plant: {},

      pitanje: "",
      trueFalsePitanje: "",
      trueFalseMode: false,

      questionNumber: 1,

      odgovori: [],
      odabraniOdgovor: null,

      tocanOdgovor: {},
      trueFalseCorrect: 0,

      brojTocnih: 0,
      brojNetocnih: 0,
      bodovi: 0,

      image: "",

      alert: false,
      zavrsniPopup: false,

      porukaOhrabrenja: "",
      funFact: "",
      tezina: 1,

      lastCorrect: false,
      trueFalsePorodica: "",

      praznina: {
        aktivan: false,
        uneseniOdgovor: "",
        tocniOdgovor: "",
        odgovorPotvrden: false,
        crticePrikaz: [],
      },
    });
    const $q = useQuasar()
    const router = useRouter();
    
    onMounted(async () => {
      await randomPlant();
      await getRandomBotanicalPlant();
      await getImage();
    });
    onMounted(async () => {
      await loadQuestion();
    });

    // ================= LOAD QUESTION =================

    async function loadQuestion() {
      await randomPlant();
      await getImage();

      state.odabraniOdgovor = null;
      state.alert = false;
      state.lastCorrect = false;

      state.praznina.odgovorPotvrden = false;
      state.praznina.uneseniOdgovor = "";
    }

    // ================= RANDOM PLANT =================

    async function randomPlant() {
      const json = await axios.get(
        "http://localhost:3000/plant_species/"
      );

      const plants = json.data.data;

      state.plant =
        plants[Math.floor(Math.random() * plants.length)];

      state.tezina =
        Math.floor(Math.random() * 5) + 1;

      const randomMode = Math.random();

      if (randomMode < 0.33) {
        state.trueFalseMode = true;
        state.praznina.aktivan = false;
      } else if (randomMode < 0.66) {
        state.trueFalseMode = false;
        state.praznina.aktivan = true;
      } else {
        state.trueFalseMode = false;
        state.praznina.aktivan = false;
      }
    }

    // ================= IMAGE =================

    async function getImage() {
      const imageRes = await axios.get(
        `http://localhost:3000/image/${state.plant.id}`
      );

      state.image =
        imageRes.data.data?.image_url || "";

      state.pitanje =
        "Latinski naziv za " +
        state.plant.croatian_name +
        " je";

      state.praznina.tocniOdgovor =
        state.plant.latin_name;

      state.praznina.crticePrikaz =
        state.praznina.tocniOdgovor
          .split("")
          .map((c) => (c === " " ? " " : ""));

      await setupTrueFalse();
      await loadAnswers();
      await getFunFact();
    }

    // ================= TRUE FALSE =================

    async function setupTrueFalse() {
      if (!state.trueFalseMode) return;

      const json = await axios.get(
        "http://localhost:3000/plant_species/"
      );

      const all = json.data.data;

      const showCorrect = Math.random() > 0.5;

      if (showCorrect) {
        state.trueFalseCorrect = 1;

        state.trueFalsePitanje =
          "Biljka sa slike je: " +
          state.plant.croatian_name;
      } else {
        let wrong;

        do {
          wrong =
            all[
              Math.floor(Math.random() * all.length)
            ];
        } while (wrong.id === state.plant.id);

        state.trueFalseCorrect = 0;

        state.trueFalsePitanje =
          "Biljka sa slike je: " +
          wrong.croatian_name;
      }

      try {
        const porodicaRes = await axios.get(
          `http://localhost:3000/botanical_family_plant_species/${state.plant.id}`
        );

        state.trueFalsePorodica =
          porodicaRes.data.data?.croatian_name ||
          "";
      } catch (e) {
        state.trueFalsePorodica = "";
      }
    }

    // ================= FUN FACT =================

    async function getFunFact() {
      try {
        const json = await axios.get(
          `http://localhost:3000/fun_fact/${state.plant.id}`
        );

        const data = json.data.data;

        state.funFact =
          data && data.fun_fact
            ? data.fun_fact
            : "";
      } catch {
        state.funFact = "";
      }
    }

    // ================= ANSWERS =================

    async function loadAnswers() {
      if (state.trueFalseMode) {
        state.odgovori = [
          {
            id: 1,
            croatian_name: "Točno",
          },
          {
            id: 0,
            croatian_name: "Netočno",
          },
        ];

        return;
      }

      if (state.praznina.aktivan) {
        return;
      }

      const json = await axios.get(
        "http://localhost:3000/plant_species/"
      );

      const plants = json.data.data;

      state.tocanOdgovor = {
        id: state.plant.id,
        latin_name: state.plant.latin_name,
        isCorrect: true,
      };

      let list = [state.tocanOdgovor];

      while (list.length < 4) {
        const randomPlant =
          plants[
            Math.floor(Math.random() * plants.length)
          ];

        if (
          !list.some(
            (x) => x.id === randomPlant.id
          )
        ) {
          list.push({
            id: randomPlant.id,
            latin_name: randomPlant.latin_name,
            isCorrect: false,
          });
        }
      }

      state.odgovori = list
        .map((v) => ({
          value: v,
          sort: Math.random(),
        }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    }

    // ================= CRTICE =================

    function onCrticaInput(i) {
      let next = i + 1;

      while (
        next <
          state.praznina.crticePrikaz.length &&
        state.praznina.crticePrikaz[next] === " "
      ) {
        next++;
      }

      if (
        next <
        state.praznina.crticePrikaz.length
      ) {
        crticaRefs[next]?.focus();
      }

      state.praznina.uneseniOdgovor =
        state.praznina.crticePrikaz.join("");
    }

    function onCrticaDelete(i) {
      if (
        state.praznina.crticePrikaz[i] !== ""
      )
        return;

      let prev = i - 1;

      while (
        prev >= 0 &&
        state.praznina.crticePrikaz[prev] === " "
      ) {
        prev--;
      }

      if (prev >= 0) {
        crticaRefs[prev]?.focus();
        state.praznina.crticePrikaz[prev] = "";
      }
    }

    // ================= LABEL =================

    function getLabel(o) {
      return state.trueFalseMode
        ? o.croatian_name
        : o.latin_name;
    }

    // ================= CHECK ANSWER =================

    function checkAnswer() {
      // PRAZNINA
      if (state.praznina.aktivan) {
        const uneseno =
          state.praznina.uneseniOdgovor
            .trim()
            .toLowerCase();

        const tocno =
          state.praznina.tocniOdgovor
            .trim()
            .toLowerCase();

        state.lastCorrect =
          uneseno === tocno;

        state.praznina.odgovorPotvrden =
          true;
      } else {
        // TRUE/FALSE
        if (state.trueFalseMode) {
          state.lastCorrect =
            state.odabraniOdgovor ===
            state.trueFalseCorrect;
        } else {
          // MCQ
          const selected =
            state.odgovori.find(
              (o) =>
                o.id ===
                state.odabraniOdgovor
            );

          state.lastCorrect =
            selected?.isCorrect === true;
        }
      }

      if (state.lastCorrect) {
        state.brojTocnih++;
        state.bodovi += state.tezina;
        state.porukaOhrabrenja = "";
      } else {
        state.brojNetocnih++;

        state.porukaOhrabrenja =
          porukeOhrabrenja[
            Math.floor(
              Math.random() *
                porukeOhrabrenja.length
            )
          ];
      }

      state.alert = true;
    }

    // ================= NEXT =================

    async function nextQuestion() {
      if (state.questionNumber >= 10) {
        state.zavrsniPopup = true;
        return;
      }

      state.questionNumber++;

      await loadQuestion();
    }

    // ================= FINISH =================

async function handleFinish() {
  // logika bodova
  if (state.odabraniOdgovor === state.tocanOdgovor.id) {
    state.brojTocnih += 1;
    state.bodovi += state.tezina;
  } else {
    state.brojNetocnih += 1;
  }

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && user) {
    try {
      await axios.post("http://localhost:3000/save-score", {
        userId: user.id,
        score: state.bodovi,
        brojTocnih: state.brojTocnih,
        brojNetocnih: state.brojNetocnih
      });

      //  SUCCESS NOTIFY
      $q.notify({
        type: "positive",
        message: "Rezultati su spremljeni u bazu!",
        position: "top",
        timeout: 2500,
      });

    } catch (err) {
      console.error("Greška kod spremanja bodova:", err);

      $q.notify({
        type: "negative",
        message: "Greška pri spremanju rezultata",
        position: "top",
        timeout: 3000,
      });
    }
  } else {
    //  USER NIJE LOGIRAN
   $q.notify({
  type: "warning",
  message: "Prijavite se kako bi se rezultati spremili!",
  actions: [
    {
      label: "LOGIN",
      color: "white",
      handler: () => {
        router.push("/login");
      },
    },
  ],
});
  }

  // popup kao i prije
  state.zavrsniPopup = true;
}

    
  


    // ================= RESTART =================

    function restartQuiz() {
      window.location.reload();
    }

    return {
      state,
      crticaRefs,

      onCrticaInput,
      onCrticaDelete,

      checkAnswer,
      nextQuestion,
      restartQuiz,
      handleFinish,

      getLabel,
    };
  },
};
</script>

<style>
.tezina {
  font-size: 20px;
  color: white;
  margin-left: 10px;
}

.odgovori {
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 700px;
}

.crtice-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: flex-end;
}

.crtice-input {
  width: 28px;
  height: 36px;
  text-align: center;
  font-size: 1.2rem;
  border: none;
  border-bottom: 2px solid #333;
  background: transparent;
  outline: none;
  text-transform: uppercase;
}

.crtice-input:focus {
  border-bottom-color: teal;
}

.crtice-razmak {
  width: 16px;
}
</style>