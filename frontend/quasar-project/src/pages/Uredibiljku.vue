<template>
  <div class="row no-wrap full-width shadow-2" style="height: calc(100vh - 50px); overflow: hidden;">

    <!-- Sidebar -->
    <div class="col-auto bg-green-10 text-white column" style="width: 280px;">
      <div class="q-pa-lg q-mb-md row items-center q-gutter-sm">
        <q-avatar icon="eco" color="green-2" text-color="green-10" size="40px" />
        <div>
          <div class="text-h6 text-weight-bolder" style="line-height: 1.2;">Biljni Kviz</div>
          <div class="text-caption text-green-2">Admin Panel</div>
        </div>
      </div>

      <q-list padding class="col">
        <q-item-label header class="text-green-2 text-weight-bold text-uppercase">Izbornik</q-item-label>

        <q-item clickable class="text-white q-my-sm" style="border-radius: 0 30px 30px 0; margin-right: 10px;" @click="$router.push('/PregledBiljaka')">
          <q-item-section avatar><q-icon name="list_alt" /></q-item-section>
          <q-item-section class="text-weight-bold">Pregled biljaka</q-item-section>
          <q-item-section side><q-icon name="chevron_right" color="white" /></q-item-section>
        </q-item>

        <q-item clickable class="text-white q-my-sm" style="border-radius: 0 30px 30px 0; margin-right: 10px;" @click="$router.push('/PregledPorodica')">
          <q-item-section avatar><q-icon name="list_alt" /></q-item-section>
          <q-item-section class="text-weight-bold">Pregled porodica</q-item-section>
          <q-item-section side><q-icon name="chevron_right" color="white" /></q-item-section>
        </q-item>

        <q-item clickable class="bg-green-8 text-white q-my-sm" style="border-radius: 0 30px 30px 0; margin-right: 10px;" @click="$router.push('/Uredibiljku')">
          <q-item-section avatar><q-icon name="edit" /></q-item-section>
          <q-item-section class="text-weight-bold">Uređivanje</q-item-section>
          <q-item-section side><q-icon name="chevron_right" color="white" /></q-item-section>
        </q-item>
        <q-item clickable class="text-white q-my-sm" style="border-radius: 0 30px 30px 0; margin-right: 10px;" @click="$router.push('/admingallery')">
          <q-item-section avatar><q-icon name="photo_library" /></q-item-section>
          <q-item-section class="text-weight-bold">Galerija</q-item-section>
          <q-item-section side><q-icon name="chevron_right" color="white" /></q-item-section>
        </q-item>
      </q-list>

      <div class="q-pa-md">
        <q-item clickable class="rounded-borders text-green-2">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>Odjava</q-item-section>
        </q-item>
      </div>
    </div>

    <!-- Glavni sadržaj -->
    <div class="col bg-grey-1 column overflow-auto">
      <div class="q-pa-lg" style="max-width: 700px; margin: 0 auto; width: 100%;">

        <div class="text-h5 text-green-9 q-mb-lg">Uredi biljku</div>

        <q-select
          v-model="odabranaBiljka"
          :options="rezultatiPretrage"
          option-value="id"
          option-label="croatian_name"
          label="Pretraži biljku po nazivu"
          outlined
          use-input
          input-debounce="300"
          class="q-mb-lg"
          @filter="pretraziBiljke"
          @update:model-value="ucitajBiljku"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.croatian_name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.latin_name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey-6">Nema rezultata</q-item-section>
            </q-item>
          </template>
        </q-select>

        <div v-if="loading" class="flex flex-center q-py-xl">
          <q-spinner-dots color="green-8" size="50px" />
        </div>

        <q-form v-else-if="ucitano" @submit="spremiPromjene">

          <q-input v-model="forma.croatian_name" label="Hrvatski naziv" outlined class="q-mb-md"
            :rules="[val => !!val || 'Obavezno polje']" />

          <q-input v-model="forma.latin_name" label="Latinski naziv" outlined class="q-mb-md" />

          <q-input v-model="forma.synonym" label="Sinonim" outlined class="q-mb-md" />

          <q-input v-model="forma.description" label="Opis" outlined type="textarea" autogrow class="q-mb-md" />

          <q-select
            v-model="forma.genus_id"
            :options="rodovi"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Rod (Genus)"
            outlined
            class="q-mb-md"
            :rules="[val => !!val || 'Obavezno polje']"
          />

          <q-select
            v-model="forma.botanical_family_id"
            :options="porodice"
            option-value="id"
            option-label="croatian_name"
            emit-value
            map-options
            label="Botanička porodica"
            outlined
            class="q-mb-lg"
          />

          <q-btn unelevated type="submit" color="green-8" label="Spremi promjene" :loading="sprema" />

        </q-form>

        <q-banner v-if="poruka" dense rounded class="q-mt-md"
          :class="uspjeh ? 'bg-green-1 text-green-9' : 'bg-red-1 text-red-9'">
          {{ poruka }}
        </q-banner>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'   // ← DODAJ

const BASE = 'http://localhost:3000'
const route = useRoute()

const odabranaBiljka    = ref(null)
const rezultatiPretrage = ref([])
const forma             = ref({})
const rodovi            = ref([])
const porodice          = ref([])
const loading           = ref(false)
const sprema            = ref(false)
const ucitano           = ref(false)
const poruka            = ref('')
const uspjeh            = ref(true)

async function pretraziBiljke(val, update) {
  const data = val?.length >= 2
    ? (await axios.get(`${BASE}/api/pretraga_biljke?naziv=${val}`).catch(() => ({ data: [] }))).data
    : []
  update(() => { rezultatiPretrage.value = data })
}

async function ucitajBiljku(biljka) {
  if (!biljka) return
  loading.value = true
  ucitano.value = false
  try {
    const { data } = await axios.get(`${BASE}/api/plant_species/${biljka.id}`)
    odabranaBiljka.value = biljka
    forma.value = { croatian_name: data.croatian_name ?? '', latin_name: data.latin_name ?? '',
      synonym: data.synonym ?? '', description: data.description ?? '',
      genus_id: data.genus_id ?? null, botanical_family_id: data.botanical_family_id ?? null }
    ucitano.value = true
  } catch {
    poruka.value = 'Greška pri učitavanju.'; uspjeh.value = false
  } finally { loading.value = false }
}

async function spremiPromjene() {
  sprema.value = true
  try {
    await axios.put(`${BASE}/api/plant_species/${odabranaBiljka.value.id}`, forma.value)
    poruka.value = 'Promjene su uspješno spremljene.'; uspjeh.value = true
  } catch {
    poruka.value = 'Greška pri spremanju.'; uspjeh.value = false
  } finally { sprema.value = false }
}

onMounted(async () => {
  const [r, p] = await Promise.all([
    axios.get(`${BASE}/api/genus`),
    axios.get(`${BASE}/api/PregledBotanskihPorodica`)
  ])
  rodovi.value = r.data; porodice.value = p.data

  const { id, croatian_name, latin_name } = route.query
  if (id) ucitajBiljku({ id, croatian_name, latin_name })
})
</script>
<style scoped>
.bg-green-10 { background-color: #1b3a1a !important; }
.bg-green-8  { background-color: #2d5a27 !important; }
</style>
