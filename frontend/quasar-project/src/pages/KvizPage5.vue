<template>
  <div class="relative fixed-center">
    <!-- BODOVI -->
    <div class="q-pa-md">
      <div class="text-h6">Bodovi: {{ state.bodovi }}</div>
    </div>

    <!-- HINTOVI -->
    <div class="q-pa-md">
      <q-banner inline-actions rounded class="bg-grey-2 text-dark hint-banner">
        <div>
          <div class="text-subtitle1 text-weight-medium">
            Hintovi: {{ state.hintoviPreostalo }} / {{ state.ukupnoHintova }}
          </div>
          <div class="text-caption">
            Gumb "Zatraži hint" možeš koristiti tijekom cijelog kviza.
          </div>
        </div>

        <template v-slot:action>
          <q-btn
            color="positive"
            text-color="white"
            label="Zatraži hint"
            :disable="state.hintoviPreostalo <= 0"
            @click="useHint"
          />
        </template>
      </q-banner>

      <q-banner
        v-if="state.hintPoruka"
        rounded
        class="bg-blue-1 text-dark q-mt-sm hint-banner"
      >
        {{ state.hintPoruka }}
      </q-banner>
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

          <span class="tezina"> (Težina: {{ state.tezina }}) </span>
        </div>
      </q-banner>

      <q-img width="700px" height="350px" :src="state.image" :ratio="16 / 9" />
    </div>

    <!-- ODGOVORI -->
    <div class="q-pa-md odgovori">
      <!-- Postojeći radio odgovori (MCQ i True/False) -->
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

      <!-- Novi tip: popunjavanje praznine -->
      <template v-else>
  <div class="crtice-container" @keydown="handleCrticeKeydown">
    <template v-for="(slovo, i) in state.praznina.crticePrikaz" :key="i">
      <!-- Razmak između riječi -->
      <span v-if="slovo === ' '" class="crtice-razmak">&nbsp;&nbsp;</span>

      <!-- Slovo kao input -->
      <input
        v-else
        :ref="el => { if (el) crticaRefs[i] = el }"
        v-model="state.praznina.crticePrikaz[i]"
        class="crtice-input"
        maxlength="1"
        :disabled="state.praznina.odgovorPotvrden"
        @input="onCrticaInput(i)"
        @keydown.delete="onCrticaDelete(i, $event)"
      />
    </template>
  </div>
</template>
    </div>

    <!-- BUTTONS -->
    <div class="q-pa-md q-gutter-sm">
      <q-btn
        color="white"
        text-color="black"
        label="Prihvati odgovor"
        @click="checkAnswer"
      />

      <q-btn
        color="white"
        text-color="black"
        label="Završi"
        @click="state.zavrsniPopup = true"
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
      <q-card :class="state.lastCorrect ? 'bg-positive text-white' : 'bg-negative text-white'">

        <!-- ONLY ONE RESULT -->
        <q-card-section class="q-pt-none">
          <!-- TRUE / FALSE -->
          <div v-if="state.trueFalseMode">
            <div v-if="state.lastCorrect" class="text-h6 q-mt-sm">✓ TOČNO</div>

            

            <div v-else>
              <div class="text-h6 q-mt-sm">✗ NETOČNO</div>
              <div class="q-mt-sm">
                Biljka sa slike je:
                <b>{{ state.plant.croatian_name }}</b>
              </div>
              <div class="q-mt-xs">
                Latinski naziv: <b>{{ state.plant.latin_name }}</b>
              </div>
              <div class="q-mt-xs" v-if="state.trueFalsePorodica">
                Porodica: <b>{{ state.trueFalsePorodica }}</b>
              </div>
            </div>
          </div>

          <!-- MCQ -->
          <div v-else-if="!state.praznina.aktivan">
            <div v-if="state.lastCorrect" class="text-h6 q-mt-sm">✓ TOČNO</div>

            <div v-else>
              <div class="text-h6 q-mt-sm">✗ NETOČNO</div>
              <div class="q-mt-sm">
                Biljka sa slike je:
                <b>{{ state.plant.croatian_name }}</b>
              </div>
              <div class="q-mt-xs">
                Latinski naziv: <b>{{ state.plant.latin_name }}</b>
              </div>
              <div class="q-mt-xs" v-if="state.trueFalsePorodica">
                Porodica: <b>{{ state.trueFalsePorodica }}</b>
              </div>
            </div>
          </div>

          <!-- PRAZNINA -->
          <div v-else>
            <div v-if="state.lastCorrect" class="text-h6 q-mt-sm">✓ TOČNO</div>

            <div v-else>
              <div class="text-h6 q-mt-sm">✗ NETOČNO</div>
              <div class="q-mt-sm">
                Biljka sa slike je:
                <b>{{ state.plant.croatian_name }}</b>
              </div>
              <div class="q-mt-xs">
                Latinski naziv: <b>{{ state.plant.latin_name }}</b>
              </div>
              <div class="q-mt-xs" v-if="state.trueFalsePorodica">
                Porodica: <b>{{ state.trueFalsePorodica }}</b>
              </div>
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
          <div class="text-weight-bold">Zanimljivost:</div>
          <div>{{ state.funFact }}</div>
        </q-card-section>

        <!-- ACTION -->
        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            :color="state.trueFalseMode ? 'white' : 'primary'"
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
          <div class="text-h6">Kraj kviza</div>
        </q-card-section>

        <q-card-section class="text-center">
          <div>Točno: {{ state.brojTocnih }}</div>
          <div>Netočno: {{ state.brojNetocnih }}</div>
          <div>Bodovi: {{ state.bodovi }}</div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn flat label="Početna" color="primary" href="/" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { onMounted, reactive } from "vue";
import axios from "axios";
import correctSound from "src/assets/correct.mp3";
import incorrectSound from "src/assets/incorrect.mp3";


const UKUPNO_HINTOVA = 3;

const porukeOhrabrenja = [
  "Nema veze, sljedeći pokušaj može biti uspješniji!",
  "Pogreške su dio učenja.",
  "Nastavite dalje, svaki pokušaj doprinosi učenju.",
  "Znanje se stječe postupno.",
  "Učenje je proces, a ne savršenstvo.",
  "Trud i upornost vode do rezultata.",
  "Napredak dolazi kroz trud i ponavljanje."
];

var clicks = 1; // brojevi idu redom, ne ponavljaju se


export default {
  setup() {
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
      ukupnoHintova: UKUPNO_HINTOVA,
      hintoviPreostalo: UKUPNO_HINTOVA,
      hintPoruka: "",

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

    const crticaRefs = {};
    const correctAudio = new Audio(correctSound);
    const incorrectAudio = new Audio(incorrectSound);

    correctAudio.preload = "auto";
    incorrectAudio.preload = "auto";

    onMounted(async () => {

      await loadQuestion();
    });

    async function handleClose() {
      state.porukaOhrabrenja = "";
      state.funFact = "";
      
      await loadQuestion();

    }

    // ================= QUESTION =================
    async function loadQuestion() {
      state.hintPoruka = "";

      const json = await axios.get("http://localhost:3000/plant_species/");

      state.plant =
        json.data.data[Math.floor(Math.random() * json.data.data.length)];

      state.tezina = Math.floor(Math.random() * 5) + 1;
      state.trueFalseMode = Math.random() < 0.35;

      // Nasumično aktiviraj tip praznine (~33% šansa, samo ako nije true/false)
      state.praznina.aktivan = !state.trueFalseMode && Math.random() < 0.33;
      state.praznina.uneseniOdgovor = "";
      state.praznina.odgovorPotvrden = false;

      if (state.praznina.aktivan) {
        const obrnuto = Math.random() < 0.5;

        if (obrnuto) {
          state.pitanje = "Hrvatski naziv za " + state.plant.latin_name + " je";
          state.praznina.tocniOdgovor = state.plant.croatian_name;
        } else {
          state.pitanje =
            "Latinski naziv za " + state.plant.croatian_name + " je";
          state.praznina.tocniOdgovor = state.plant.latin_name;
        }

        state.praznina.crticePrikaz = state.praznina.tocniOdgovor
    .split("")
    .map(c => (c === " " ? " " : ""));

      } else {
        state.pitanje =
          "Koji je latinski naziv za " + state.plant.croatian_name + "?";
      }

      await setupTrueFalse();
      await loadAnswers();
      await loadImage();
      await getFunFact();

    }

    // ================= TRUE/FALSE =================

    async function setupTrueFalse() {
      if (!state.trueFalseMode) return;

      const json = await axios.get("http://localhost:3000/plant_species/");
      const all = json.data.data;

      const showCorrect = Math.random() > 0.5;

      if (showCorrect) {
        state.trueFalseCorrect = 1;

        state.trueFalsePitanje =
          "Biljka sa slike je: " + state.plant.croatian_name;
      } else {
        let wrong;

        do {
          wrong = all[Math.floor(Math.random() * all.length)];
        } while (wrong.id === state.plant.id);

        state.trueFalseCorrect = 0;

        state.trueFalsePitanje = "Biljka sa slike je: " + wrong.croatian_name;
      }

      try {
        const porodicaRes = await axios.get(
          `http://localhost:3000/botanical_family_plant_species/${state.plant.id}`
        );
        state.trueFalsePorodica = porodicaRes.data.data?.croatian_name || "";
      } catch (e) {
        state.trueFalsePorodica = "";
      }
    }
async function getFunFact() {
  const json = await axios.get(`http://localhost:3000/fun_fact/${state.plant.id}`);
  const data = json.data.data;

  if (data && data.fun_fact) {
    state.funFact = data.fun_fact;
  } else {
    state.funFact = "";
  }
}

    // ================= ANSWERS =================
    async function loadAnswers() {
      if (state.trueFalseMode) {
        state.odgovori = [
          { id: 1, croatian_name: "Točno" },
          { id: 0, croatian_name: "Netočno" },
        ];

        state.odabraniOdgovor = null;
      } else {
        const json = await axios.get("http://localhost:3000/botanical_family");
        const families = json.data.data;

        const correct = await axios.get(
          `http://localhost:3000/plant_species/${state.plant.id}`
        );

        state.tocanOdgovor = correct.data.data;

        let list = [
          {
            id: state.tocanOdgovor.id,
            latin_name: state.tocanOdgovor.latin_name,
            isCorrect: true,
          },
        ];

        while (list.length < 4) {
          let obj = families[Math.floor(Math.random() * families.length)];

          if (!list.some((x) => x.id === obj.id)) {
            list.push({
              id: obj.id,
              latin_name: obj.latin_name,
              isCorrect: false,
            });
          }
        }

        state.odgovori = list
          .map((v) => ({ value: v, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);

        state.odabraniOdgovor = null;
      }
    }

    // ================= IMAGE =================
    async function loadImage() {
      const json = await axios.get(
        `http://localhost:3000/image/${state.plant.id}`
      );

      state.image = json.data.data?.image_url || "";
    }

    // ================= CRTICE =================
function onCrticaInput(i) {
  let next = i + 1;
  while (next < state.praznina.crticePrikaz.length && state.praznina.crticePrikaz[next] === " ") {
    next++;
  }
  if (next < state.praznina.crticePrikaz.length) {
    crticaRefs[next]?.focus();
  }

  state.praznina.uneseniOdgovor = state.praznina.crticePrikaz.join("");
}

function onCrticaDelete(i, event) {
  if (state.praznina.crticePrikaz[i] !== "") return;

  let prev = i - 1;
  while (prev >= 0 && state.praznina.crticePrikaz[prev] === " ") {
    prev--;
  }
  if (prev >= 0) {
    crticaRefs[prev]?.focus();
    state.praznina.crticePrikaz[prev] = "";
  }
}

    // ================= HINTS =================
    function useHint() {
      if (state.hintoviPreostalo <= 0) {
        state.hintPoruka = "Nemaš više dostupnih hintova.";
        return;
      }

      state.hintoviPreostalo -= 1;

      if (state.praznina.aktivan) {
        const revealed = revealNextHintLetter();
        state.praznina.uneseniOdgovor = state.praznina.crticePrikaz.join("");
        state.hintPoruka = revealed
          ? "Hint: Otkriveno je jedno slovo u odgovoru."
          : "Hint: Sva slova u odgovoru su već otkrivena.";
        return;
      }

      if (state.trueFalseMode) {
        state.hintPoruka = `Hint: Točna biljka počinje slovom "${getFirstLetter(
          state.plant.croatian_name
        )}".`;
        return;
      }

      state.hintPoruka = `Hint: Točan latinski naziv počinje slovom "${getFirstLetter(
        state.tocanOdgovor.latin_name
      )}".`;
    }

    function revealNextHintLetter() {
      const letters = state.praznina.tocniOdgovor.split("");

      for (let i = 0; i < letters.length; i++) {
        if (letters[i] !== " " && state.praznina.crticePrikaz[i] === "") {
          state.praznina.crticePrikaz[i] = letters[i];
          return true;
        }
      }

      return false;
    }

    function getFirstLetter(value) {
      return value?.trim().charAt(0).toUpperCase() || "?";
    }

    // ================= LABEL =================
    function getLabel(o) {
      return state.trueFalseMode ? o.croatian_name : o.latin_name;
    }

    // ================= SOUND =================
    function playFeedbackSound(isCorrect) {
      const audio = isCorrect ? correctAudio : incorrectAudio;

      try {
        audio.pause();
        audio.currentTime = 0;
        const playPromise = audio.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } catch (error) {
        console.warn("Zvuk odgovora nije reproduciran.", error);
      }
    }

    // ================= CHECK =================
    function checkAnswer() {
      // Provjera za tip praznine
      if (state.praznina.aktivan) {
        const uneseno = state.praznina.uneseniOdgovor.trim().toLowerCase();
        const tocno = state.praznina.tocniOdgovor.trim().toLowerCase();
        state.lastCorrect = uneseno === tocno;
        state.praznina.odgovorPotvrden = true;

        if (state.lastCorrect) {
          state.brojTocnih++;
          state.bodovi += state.tezina;
          state.porukaOhrabrenja = "";
        } else {
          state.brojNetocnih++;
          state.porukaOhrabrenja =
          porukeOhrabrenja[Math.floor(Math.random() * porukeOhrabrenja.length)];
        }

        playFeedbackSound(state.lastCorrect);
        state.alert = true;
        return;
      }

      if (state.odabraniOdgovor === null) return;

      let isCorrect = false;

      if (state.trueFalseMode) {
        isCorrect = state.odabraniOdgovor === state.trueFalseCorrect;
      } else {
        const selected = state.odgovori.find(
          (o) => o.id === state.odabraniOdgovor
        );

        isCorrect = selected?.isCorrect === true;
      }

      state.lastCorrect = isCorrect;

      if (isCorrect) {
        state.brojTocnih++;
        state.bodovi += state.tezina;
        state.porukaOhrabrenja = "";
      } else {
        state.brojNetocnih++;
        state.porukaOhrabrenja =
        porukeOhrabrenja[Math.floor(Math.random() * porukeOhrabrenja.length)];
      }

      playFeedbackSound(state.lastCorrect);
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

    // ================= RESTART =================
    function restartQuiz() {
      window.location.reload();
    }

    let brojKlikova = 0;

    function provjeriOdgovor() {
      if (state.odabraniOdgovor === state.tocanOdgovor.id) {
        state.brojTocnih += 1;
        state.bodovi += state.tezina;
        state.porukaOhrabrenja = "";
      } else {
        state.brojNetocnih += 1;
        state.porukaOhrabrenja =
          porukeOhrabrenja[Math.floor(Math.random() * porukeOhrabrenja.length)];
      }
    }

    function prihvatiOdgovor() {
      brojKlikova += 1;
      provjeriOdgovor();
      state.alert = true;

      if (brojKlikova >= 8) {
        const button1 = document.getElementById("PrihvatiOdgovor");
        const button2 = document.getElementById("PrihvatiIZavrsi");
        const button3 = document.getElementById("Refresh");

        if (button2) button2.removeAttribute("disabled");
        if (button3) button3.removeAttribute("disabled");
        if (button1) {
          button1.setAttribute("disabled", true);
          button1.style.display = "none";
        }
      }
    }

    function prihvatiIZavrsi() {
      provjeriOdgovor();
      state.zavrsniPopup = true;
    }

    return {
      state,
     
      handleClose,
      prihvatiOdgovor,
      prihvatiIZavrsi,
      crticaRefs,
      onCrticaInput,
      onCrticaDelete,
      checkAnswer,
      nextQuestion,
      restartQuiz,
      getLabel,
      useHint,

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

.hint-banner {
  width: 700px;
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

}</style>
