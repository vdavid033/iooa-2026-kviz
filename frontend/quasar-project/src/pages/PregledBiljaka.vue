<template>
  <div class="row no-wrap full-width shadow-2" style="height: calc(100vh - 50px); overflow: hidden;">

    <!-- SIDEBAR -->
    <div class="col-auto bg-green-10 text-white column" style="width: 280px;">
      <div class="q-pa-lg q-mb-md row items-center q-gutter-sm">
        <q-avatar icon="eco" color="green-2" text-color="green-10" size="40px" />
        <div>
          <div class="text-h6 text-weight-bolder">Biljni Kviz</div>
          <div class="text-caption text-green-2">Admin Panel</div>
        </div>
      </div>

      <q-list padding class="col">
        <q-item clickable class="bg-green-8 text-white q-my-sm" @click="$router.push('/PregledBiljaka')">
          <q-item-section avatar><q-icon name="list_alt" /></q-item-section>
          <q-item-section class="text-weight-bold">Pregled biljaka</q-item-section>
        </q-item>

        <q-item clickable class="text-white q-my-sm" @click="$router.push('/PregledPorodica')">
          <q-item-section avatar><q-icon name="list_alt" /></q-item-section>
          <q-item-section class="text-weight-bold">Pregled porodica</q-item-section>
        </q-item>

        <q-item clickable class="text-white q-my-sm" @click="$router.push('/Uredibiljku')">
          <q-item-section avatar><q-icon name="edit" /></q-item-section>
          <q-item-section class="text-weight-bold">Uređivanje</q-item-section>
        </q-item>
        <q-item clickable class="text-white q-my-sm" @click="$router.push('/admingallery')">
          <q-item-section avatar><q-icon name="photo_library" /></q-item-section>
          <q-item-section class="text-weight-bold">Galerija</q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- MAIN -->
    <div class="col bg-grey-1 column">

      <div class="q-pa-lg col overflow-auto">

        <!-- HEADER -->
        <div class="row items-center q-mb-md">
          <div class="text-h6 text-weight-bold col">
            Pregled biljaka
          </div>

          <q-btn
            color="green-8"
            icon="add"
            label="Dodaj biljku"
            @click="showDialog = true"
          />
        </div>

        <!-- TABLE -->
        <q-table
          :rows="biljke"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
          class="bg-white shadow-2"
          :pagination="{ rowsPerPage: 10 }"
        >

          <!-- DESCRIPTION -->
          <template v-slot:body-cell-description="props">
            <q-td :props="props">
              <div class="ellipsis" style="max-width: 250px;">
                {{ props.value }}
              </div>
              <q-tooltip>{{ props.value }}</q-tooltip>
            </q-td>
          </template>

          <!-- ACTIONS -->
          <template v-slot:body-cell-akcije="props">
            <q-td :props="props" class="text-center q-gutter-sm">

              <q-btn flat round color="blue-7" icon="edit" size="sm"
              @click="$router.push({ path: '/Uredibiljku', query: { id: props.row.id, croatian_name: props.row.croatian_name, latin_name: props.row.latin_name } })" />

              <q-btn
                flat
                round
                color="red-7"
                icon="delete"
                size="sm"
                @click="obrisiBiljku(props.row.id, props.row.croatian_name)"
              />

            </q-td>
          </template>

        </q-table>
      </div>
    </div>

    <!-- DIALOG -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 500px" class="q-pa-lg">

        <div class="text-h6 q-mb-md">Dodaj novu biljku</div>

        <q-form @submit="dodajBiljku" class="q-gutter-md">

          <q-input v-model="form.croatian_name" label="Hrvatski naziv" outlined dense required />
          <q-input v-model="form.latin_name" label="Latinski naziv" outlined dense required />
          <q-input v-model="form.synonym" label="Sinonim" outlined dense />

          <q-select
            v-model="form.genus_id"
            :options="genusi"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            label="Rod"
            outlined dense
          />

          <q-input v-model="form.description" label="Opis" type="textarea" outlined autogrow />

          <div class="row justify-between q-mt-md">
            <q-btn flat label="Odustani" color="grey" v-close-popup />
            <q-btn type="submit" color="green-8" label="Spremi" />
          </div>

        </q-form>

      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const biljke = ref([])
const loading = ref(false)
const showDialog = ref(false)

const form = ref({
  croatian_name: '',
  latin_name: '',
  synonym: '',
  description: '',
  genus_id: null
})

const genusi = ref([])

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'croatian_name', label: 'Hrvatski naziv', field: 'croatian_name', sortable: true },
  { name: 'latin_name', label: 'Latinski naziv', field: 'latin_name', sortable: true },
  { name: 'synonym', label: 'Sinonim', field: 'synonym' },
  { name: 'description', label: 'Opis', field: 'description' },
  { name: 'genus', label: 'Rod', field: 'genus_name' },
  { name: 'akcije', label: 'Akcije', field: 'akcije' }
]

const fetchBiljke = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:3000/api/PregledBiljaka')
    biljke.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const fetchGenus = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/genus')
    genusi.value = res.data
  } catch (err) {
    console.error(err)
  }
}

const dodajBiljku = async () => {
  try {
    await axios.post('http://localhost:3000/api/dodajBiljku', form.value)

    showDialog.value = false

    form.value = {
      croatian_name: '',
      latin_name: '',
      synonym: '',
      description: '',
      genus_id: null
    }

    fetchBiljke()
  } catch (err) {
    console.error(err)
  }
}

const obrisiBiljku = (id, naziv) => {
  $q.dialog({
    title: 'Potvrda brisanja',
    message: `Jeste li sigurni da želite obrisati biljnu vrstu <strong>${naziv}</strong>?<br><br>
      <span style="color: #c62828;">⚠ Ova radnja je <strong>trajna i nepovratna</strong>. Svi podaci vezani uz ovu biljnu vrstu (opisi, slike, kviz pitanja) bit će trajno izgubljeni.</span>`,
    html: true,
    ok: { label: 'Da, obriši', color: 'red-7', flat: true },
    cancel: { label: 'Odustani', color: 'grey', flat: true },
    persistent: true
  }).onOk(async () => {
    try {
      await axios.delete(`http://localhost:3000/api/obrisiBiljku/${id}`)
      fetchBiljke()
      $q.notify({
        type: 'positive',
        message: `Biljna vrsta "${naziv}" uspješno je obrisana.`,
        position: 'top',
        timeout: 3000
      })
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        icon: 'warning',
        message: 'Brisanje nije uspjelo.',
        caption: 'Mogući razlozi: biljna vrsta koristi se u kviz pitanjima ili galeriji. Najprije uklonite sve povezane zapise, a zatim pokušajte ponovo.',
        position: 'top',
        timeout: 8000,
        actions: [{ label: 'Zatvori', color: 'white', handler: () => {} }]
      })
    }
  })
}

onMounted(() => {
  fetchBiljke()
  fetchGenus()
})
</script>

<style scoped>
.bg-green-10 { background-color: #1b3a1a !important; }
</style>
