<template>
  <div class="galerija-dijelova q-pa-lg">
    <div class="text-h5 text-weight-bold q-mb-xs">Galerija slika dijelova biljke</div>
    <div class="text-body2 text-grey-7 q-mb-lg">
      Odaberite biljnu vrstu kako biste pregledali slike njezinih dijelova
      (list, cvijet, plod ...).
    </div>

    <q-select
      v-model="selectedSpecies"
      :options="speciesOptions"
      label="Biljna vrsta"
      outlined
      dense
      emit-value
      map-options
      style="max-width: 420px"
      @update:model-value="loadPartImages"
    />

    <div v-if="loading" class="q-mt-xl text-center">
      <q-spinner color="green-8" size="32px" />
    </div>

    <div v-else-if="selectedSpecies" class="q-mt-lg">
      <div
        v-for="part in parts"
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
          <!-- SI-3 (Krstić): klik na sliku otvara uvećani prikaz (lightbox) s opisom/izvorom/datumom -->
          <div v-for="img in part.images" :key="img.id" class="image-card">
            <img
              :src="img.image_url"
              class="part-image"
              @error="e => e.target.src='https://via.placeholder.com/160'"
            />
            <div class="image-caption">{{ img.name || 'Bez naziva' }}</div>
          </div>
        </div>

        <div v-else class="text-grey-6 text-italic">
          Za ovaj dio biljke još nema dodanih slika.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API = 'http://localhost:3000'

const speciesOptions = ref([])
const selectedSpecies = ref(null)
const parts = ref([])
const loading = ref(false)

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
}

.part-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  background: #f4f7f2;
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
</style>
