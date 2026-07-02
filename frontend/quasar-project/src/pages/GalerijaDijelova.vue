<template>
  <div class="galerija-dijelova q-pa-lg">
    <div class="text-h5 text-weight-bold q-mb-xs">Galerija slika dijelova biljke</div>
    <div class="text-body2 text-grey-7 q-mb-lg">
      Odaberite biljnu vrstu kako biste pregledali slike njezinih dijelova
      (list, cvijet, plod ...).
    </div>

    <div class="row q-col-gutter-md items-start">
      <q-select
        v-model="selectedSpecies"
        :options="speciesOptions"
        label="Biljna vrsta"
        outlined
        dense
        emit-value
        map-options
        class="col-12 col-sm-6"
        style="max-width: 420px"
        @update:model-value="loadPartImages"
      />

      <!-- SI-3 (Krstić) #143: filter po dijelu biljke -->
      <q-select
        v-if="selectedSpecies && partFilterOptions.length"
        v-model="selectedPart"
        :options="partFilterOptions"
        label="Dio biljke"
        outlined
        dense
        clearable
        emit-value
        map-options
        class="col-12 col-sm-6"
        style="max-width: 420px"
      />
    </div>

    <div v-if="loading" class="q-mt-xl text-center">
      <q-spinner color="green-8" size="32px" />
    </div>

    <!-- #143: prazno stanje kad biljka nije odabrana -->
    <div
      v-else-if="!selectedSpecies"
      class="empty-state q-mt-xl text-center text-grey-6"
    >
      <q-icon name="local_florist" size="42px" class="q-mb-sm" />
      <div>Odaberite biljnu vrstu iznad kako bi se prikazali njezini dijelovi.</div>
    </div>

    <!-- #143: prazno stanje kad biljka nema nijednog dijela sa slikama -->
    <div
      v-else-if="!parts.length"
      class="empty-state q-mt-xl text-center text-grey-6"
    >
      <q-icon name="hide_image" size="42px" class="q-mb-sm" />
      <div>Za ovu biljnu vrstu još nema dodanih slika dijelova.</div>
    </div>

    <div v-else class="q-mt-lg">
      <!-- #143: prazno stanje kad filter ne odgovara nijednom dijelu -->
      <div
        v-if="!filteredParts.length"
        class="empty-state q-mt-md text-center text-grey-6"
      >
        <q-icon name="filter_alt_off" size="42px" class="q-mb-sm" />
        <div>Nema dijela biljke koji odgovara odabranom filtru.</div>
      </div>

      <div
        v-for="part in filteredParts"
        :key="part.useful_part_id"
        class="part-block q-mb-xl"
      >
        <div class="row items-baseline q-gutter-sm q-mb-sm">
          <div class="text-h6 text-weight-bold">{{ part.croatian_name }}</div>
          <div class="text-caption text-grey-7" v-if="part.latin_name">
            ({{ part.latin_name }})
          </div>
        </div>

        <div
          v-if="part.description"
          class="part-description text-body2 text-grey-8 q-mb-sm"
        >
          {{ part.description }}
        </div>

        <div v-if="part.images.length" class="images-grid">
          <!-- SI-3 (Krstić) #142: klik na sliku otvara uvećani prikaz (lightbox) s opisom/izvorom/datumom -->
          <div
            v-for="img in part.images"
            :key="img.id"
            class="image-card"
            @click="openLightbox(img, part)"
          >
            <img
              :src="img.image_url"
              class="part-image"
              @error="e => e.target.src='https://via.placeholder.com/160'"
            />
            <div class="image-caption">{{ img.name || 'Bez naziva' }}</div>
          </div>
        </div>

        <div v-else class="empty-part text-grey-6 text-italic">
          Za ovaj dio biljke još nema dodanih slika.
        </div>
      </div>
    </div>

    <!-- SI-3 (Krstić) #142: uvećani prikaz slike (lightbox) -->
    <q-dialog v-model="lightboxOpen">
      <q-card class="lightbox-dialog">
        <q-card-section class="lightbox-header">
          <div class="text-h6">{{ lightboxImage?.name || 'Pregled slike' }}</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="lightbox-body" v-if="lightboxImage">
          <img
            :src="lightboxImage.image_url"
            class="lightbox-image"
            @error="e => e.target.src='https://via.placeholder.com/420'"
          />

          <div class="lightbox-list">
            <div class="lightbox-row" v-if="lightboxPartName">
              <span>Dio biljke</span>
              <strong>{{ lightboxPartName }}</strong>
            </div>

            <div class="lightbox-row" v-if="lightboxImage.description">
              <span>Opis</span>
              <strong>{{ lightboxImage.description }}</strong>
            </div>

            <div class="lightbox-row" v-if="lightboxImage.source">
              <span>Izvor</span>
              <strong>{{ lightboxImage.source }}</strong>
            </div>

            <div class="lightbox-row" v-if="formattedUploadDate">
              <span>Datum dodavanja</span>
              <strong>{{ formattedUploadDate }}</strong>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const API = 'http://localhost:3000'

const speciesOptions = ref([])
const selectedSpecies = ref(null)
const parts = ref([])
const loading = ref(false)

// #143: filter po dijelu biljke
const selectedPart = ref(null)

const partFilterOptions = computed(() =>
  parts.value.map((p) => ({
    label: p.latin_name ? `${p.croatian_name} (${p.latin_name})` : p.croatian_name,
    value: p.useful_part_id,
  }))
)

const filteredParts = computed(() => {
  if (!selectedPart.value) return parts.value
  return parts.value.filter((p) => p.useful_part_id === selectedPart.value)
})

// #142: lightbox
const lightboxOpen = ref(false)
const lightboxImage = ref(null)
const lightboxPartName = ref('')

const formattedUploadDate = computed(() => {
  const raw = lightboxImage.value?.upload_date
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleDateString('hr-HR')
})

function openLightbox(img, part) {
  lightboxImage.value = img
  lightboxPartName.value = part?.croatian_name || ''
  lightboxOpen.value = true
}

async function loadSpecies() {
  try {
    const res = await axios.get(`${API}/plant_species_with_part_images`)
    speciesOptions.value = res.data.data.map((p) => ({
      label: p.latin_name ? `${p.croatian_name} (${p.latin_name})` : p.croatian_name,
      value: p.id,
    }))
  } catch (e) {
    console.error('Greska pri dohvatu biljnih vrsta:', e)
  }
}

async function loadPartImages() {
  selectedPart.value = null
  if (!selectedSpecies.value) {
    parts.value = []
    return
  }
  loading.value = true
  try {
    const res = await axios.get(`${API}/plant_part_images/${selectedSpecies.value}`)
    parts.value = res.data.data
  } catch (e) {
    console.error('Greska pri dohvatu slika dijelova:', e)
    parts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadSpecies)
</script>

<style scoped>
.galerija-dijelova {
  max-width: 1000px;
  margin: auto;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.image-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.part-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  background: #f4f7f2;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.image-card:hover .part-image {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

.image-caption {
  font-size: 12px;
  color: #2c3e2d;
  margin-top: 6px;
  text-align: center;
}

.part-block {
  border-bottom: 1px solid #e0e6de;
  padding-bottom: 16px;
}

.part-description {
  max-width: 720px;
  line-height: 1.4;
}

.empty-state {
  padding: 32px 16px;
}

.empty-part {
  padding: 8px 0;
}

/* #142: lightbox */
.lightbox-dialog {
  width: 720px;
  max-width: 92vw;
}

.lightbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lightbox-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.lightbox-image {
  width: 100%;
  max-height: 480px;
  object-fit: contain;
  border-radius: 8px;
  background: #f4f7f2;
}

.lightbox-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lightbox-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 14px;
  color: #2c3e2d;
  line-height: 1.35;
}

.lightbox-row span {
  color: #666;
}

@media (max-width: 600px) {
  .lightbox-row {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
