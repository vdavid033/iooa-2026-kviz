<template>
  <div class="admin-container">
    <div class="gallery-header">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Natrag"
        @click="$router.push('/PregledBiljaka')"
      />
    </div>

    <h3 class="gallery-title">Galerija slika</h3>

    <div class="top-bar">
      <q-btn color="primary" icon="add" label="Dodaj sliku" @click="openAddDialog" />
    </div>

    <div class="filter-row">
      <q-select
        v-model="selectedSpecies"
        :options="speciesOptions"
        label="Filtriraj prema biljnim vrstama"
        outlined
        dense
        clearable
        emit-value
        map-options
        stack-label
        @update:model-value="onSpeciesChange"
      />
    </div>

    <div class="grid">
      <div class="card" v-for="img in images" :key="img.id">
        <div class="image-wrapper">
          <img
            :src="img.image_url"
            class="real-image"
            @click="openImageDetails(img)"
            @error="e => e.target.src='https://via.placeholder.com/120'"
          />
          <q-tooltip v-if="img.description" class="description-tooltip">
            {{ img.description }}
          </q-tooltip>
        </div>

        <div class="meta">
          <div class="image-name">{{ img.name || 'Bez naziva' }}</div>
          <div class="image-source" v-if="img.source">{{ img.source }}</div>
          <div class="species-name" v-if="img.plant_species_names">
            {{ img.plant_species_names }}
          </div>
          <div class="image-description" v-if="img.description">
            {{ img.description }}
          </div>
        </div>

        <div class="actions">
          <span @click="openEditDialog(img)">✏️</span>
          <span @click="confirmDeleteImage(img.id)">🗑️</span>
        </div>
      </div>
    </div>

    <!-- Dialog za uređivanje -->
    <q-dialog v-model="editDialogOpen" persistent>
      <q-card class="edit-dialog">
        <q-card-section>
          <div class="text-h6">Uredi sliku</div>
        </q-card-section>

        <q-card-section class="edit-fields">
          <q-input v-model="editImageName" label="Naziv slike" outlined dense />
          <q-input v-model="editImageUrl" label="URL slike" outlined dense />
          <q-input v-model="editImageSource" label="Izvor slike" outlined dense />
          <q-select
            v-model="editImageSpeciesId"
            :options="speciesOptions"
            label="Biljna vrsta"
            outlined
            dense
            clearable
            emit-value
            map-options
          />
          <q-input
            v-model="editImageDescription"
            label="Opis slike"
            outlined
            dense
            type="textarea"
          />

          <img
            v-if="editImageUrl"
            :src="editImageUrl"
            class="edit-preview"
            @error="e => e.target.src='https://via.placeholder.com/160'"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn label="Spremi" color="primary" @click="updateImage" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog za dodavanje -->
    <q-dialog v-model="addDialogOpen" persistent>
      <q-card class="edit-dialog">
        <q-card-section>
          <div class="text-h6">Dodaj sliku</div>
        </q-card-section>

        <q-card-section class="edit-fields">
          <q-input v-model="newImageName" label="Naziv slike" outlined dense />
          <q-input v-model="newImageUrl" label="URL slike" outlined dense />
          <q-input v-model="newImageSource" label="Izvor slike" outlined dense />
          <q-select
            v-model="newImageSpeciesId"
            :options="speciesOptions"
            label="Biljna vrsta"
            outlined
            dense
            clearable
            emit-value
            map-options
          />
          <q-input
            v-model="newImageDescription"
            label="Opis slike"
            outlined
            dense
            type="textarea"
          />

          <img
            v-if="newImageUrl"
            :src="newImageUrl"
            class="edit-preview"
            @error="e => e.target.src='https://via.placeholder.com/160'"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" @click="closeAddDialog" />
          <q-btn label="Dodaj" color="primary" @click="addImage" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog za pregled slike -->
    <q-dialog v-model="detailsDialogOpen">
      <q-card class="details-dialog">
        <q-card-section class="details-header">
          <div class="text-h6">{{ selectedImage?.name || 'Pregled slike' }}</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="details-body" v-if="selectedImage">
          <img
            :src="selectedImage.image_url"
            class="details-image"
            @error="e => e.target.src='https://via.placeholder.com/420'"
          />

          <div class="details-list">
            <div class="details-row" v-if="selectedImage.plant_species_names">
              <span>Hrvatski naziv vrste</span>
              <strong>{{ selectedImage.plant_species_names }}</strong>
            </div>

            <div class="details-row" v-if="selectedImage.plant_species_latin_names">
              <span>Latinski naziv vrste</span>
              <strong>{{ selectedImage.plant_species_latin_names }}</strong>
            </div>

            <div class="details-row" v-if="selectedImageFileName">
              <span>Naziv datoteke</span>
              <strong>{{ selectedImageFileName }}</strong>
            </div>

            <div class="details-row" v-if="selectedImageDate">
              <span>Datum dodavanja</span>
              <strong>{{ selectedImageDate }}</strong>
            </div>

            <div class="details-row" v-if="selectedImage.source">
              <span>Izvor</span>
              <strong>{{ selectedImage.source }}</strong>
            </div>

            <div class="details-row" v-if="selectedImage.description">
              <span>Opis</span>
              <strong>{{ selectedImage.description }}</strong>
            </div>

            <div class="details-row" v-if="selectedImage.image_url">
              <span>URL slike</span>
              <strong class="details-url">{{ selectedImage.image_url }}</strong>
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
import { useQuasar } from 'quasar'

const images = ref([])
const plantSpeciesList = ref([])
const selectedSpecies = ref(null)
const $q = useQuasar()

// Dodavanje
const newImageName = ref("")
const newImageUrl = ref("")
const newImageDescription = ref("")
const newImageSource = ref("")
const newImageSpeciesId = ref(null)
const addDialogOpen = ref(false)

// Uređivanje
const editDialogOpen = ref(false)
const editImageId = ref(null)
const editImageName = ref("")
const editImageUrl = ref("")
const editImageDescription = ref("")
const editImageSource = ref("")
const editImageSpeciesId = ref(null)
const detailsDialogOpen = ref(false)
const selectedImage = ref(null)

const speciesOptions = computed(() => {
  const seen = new Set()
  const options = [
    { label: 'Sve biljne vrste', value: null },
  ]

  plantSpeciesList.value.forEach((plant) => {
    const name = plant.croatian_name
    if (!seen.has(name) && name && !/test/i.test(name)) {
      seen.add(name)
      options.push({ label: name, value: plant.id })
    }
  })

  return options
})

const selectedImageFileName = computed(() => {
  if (!selectedImage.value) return ""
  return getImageFileName(selectedImage.value)
})

const selectedImageDate = computed(() => {
  if (!selectedImage.value) return ""
  return formatImageDate(selectedImage.value)
})

function getImageSpeciesIds(img) {
  if (!img.plant_species_ids) return []
  return img.plant_species_ids
    .split(",")
    .map((id) => parseInt(id, 10))
    .filter((id) => !Number.isNaN(id))
}

async function loadPlantSpecies() {
  const res = await axios.get("http://localhost:3000/plant_species")
  plantSpeciesList.value = res.data.data
}

async function loadImages() {
  const speciesId = selectedSpecies.value
  const params = speciesId ? `?plant_species_id=${speciesId}` : ""
  try {
    const res = await axios.get(`http://localhost:3000/images${params}`)
    images.value = res.data.data
  } catch (e) {
    console.error("Error loading images:", e)
  }
}

function onSpeciesChange() {
  loadImages()
}

onMounted(() => {
  loadPlantSpecies()
  loadImages()
})

function confirmDeleteImage(id) {
  $q.dialog({
    title: 'Brisanje slike',
    message: 'Jeste li sigurni da želite izbrisati ovu sliku?',
    cancel: { label: 'Odustani', color: 'primary' },
    ok: { label: 'Izbriši', color: 'negative' },
    persistent: true,
  }).onOk(() => {
    deleteImage(id)
  })
}

function openEditDialog(img) {
  editImageId.value = img.id
  editImageName.value = img.name || ""
  editImageUrl.value = img.image_url || ""
  editImageDescription.value = img.description || ""
  editImageSource.value = img.source || ""
  const speciesIds = getImageSpeciesIds(img)
  editImageSpeciesId.value = speciesIds.length ? speciesIds[0] : null
  editDialogOpen.value = true
}

function openImageDetails(img) {
  selectedImage.value = img
  detailsDialogOpen.value = true
}

function openAddDialog() {
  newImageName.value = ""
  newImageUrl.value = ""
  newImageDescription.value = ""
  newImageSource.value = ""
  newImageSpeciesId.value = null
  addDialogOpen.value = true
}

function closeAddDialog() {
  addDialogOpen.value = false
  newImageName.value = ""
  newImageUrl.value = ""
  newImageDescription.value = ""
  newImageSource.value = ""
}

async function updateImage() {
  if (!editImageId.value || !editImageUrl.value) return

  try {
    await axios.put(`http://localhost:3000/image/${editImageId.value}`, {
      name: editImageName.value,
      image_url: editImageUrl.value,
      description: editImageDescription.value,
      source: editImageSource.value,
      plant_species_id: editImageSpeciesId.value,
    })

    editDialogOpen.value = false
    loadImages()
  } catch (e) {
    console.error("Error updating image:", e)
  }
}

async function deleteImage(id) {
  await axios.delete(`http://localhost:3000/image/${id}`)
  loadImages()
}

async function addImage() {
  if (!newImageUrl.value) return

  try {
    await axios.post("http://localhost:3000/image", {
      name: newImageName.value,
      image_url: newImageUrl.value,
      description: newImageDescription.value,
      source: newImageSource.value,
      plant_species_id: newImageSpeciesId.value,
    })

    closeAddDialog()
    loadImages()
  } catch (e) {
    console.error("Error adding image:", e)
  }
}

function getImageFileName(img) {
  const explicitFileName = img.file_name || img.filename || img.original_filename
  if (explicitFileName) return explicitFileName

  if (!img.image_url) return ""

  try {
    const path = new URL(img.image_url).pathname
    return decodeURIComponent(path.split("/").pop() || "")
  } catch {
    return img.image_url.split("/").pop() || ""
  }
}

function formatImageDate(img) {
  const dateValue = img.created_at || img.createdAt || img.date_added || img.added_at || img.created_on
  if (!dateValue) return ""

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return dateValue

  return date.toLocaleDateString("hr-HR")
}
</script>

<style>
.admin-container {
  background: #e7f0e4;
  padding: 30px;
  border-radius: 30px;
  max-width: 900px;
  margin: auto;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.gallery-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.gallery-title {
  margin: 18px 0 28px;
  text-align: center;
}

.filter-row {
  margin-bottom: 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  position: relative;
  z-index: 1;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-wrapper {
  line-height: 0;
}

.real-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  cursor: pointer;
}

.actions {
  margin-top: 5px;
  display: flex;
  gap: 10px;
  font-size: 18px;
  cursor: pointer;
}

.edit-dialog {
  width: 420px;
  max-width: 90vw;
}

.edit-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-preview {
  width: 160px;
  height: 160px;
  object-fit: cover;
  align-self: center;
}

.meta {
  text-align: center;
  margin-top: 6px;
}

.image-name {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e2d;
  line-height: 1.3;
}

.image-source {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.species-name {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
  font-style: italic;
}

.image-description {
  font-size: 11px;
  color: #4f5f50;
  line-height: 1.25;
  margin-top: 4px;
  max-width: 140px;
  overflow-wrap: anywhere;
}

.description-tooltip {
  max-width: 260px;
  font-size: 12px;
  line-height: 1.35;
}

.details-dialog {
  width: 720px;
  max-width: 92vw;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.details-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.details-image {
  width: 100%;
  max-height: 480px;
  object-fit: contain;
  border-radius: 8px;
  background: #f4f7f2;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.details-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 14px;
  color: #2c3e2d;
  line-height: 1.35;
}

.details-row span {
  color: #666;
}

.details-url {
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .details-row {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
