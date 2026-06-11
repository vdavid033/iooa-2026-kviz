<template>
  <div
    class="row no-wrap full-width shadow-2"
    style="height: calc(100vh - 50px); overflow: hidden"
  >
    <div class="col-auto bg-green-10 text-white column" style="width: 280px">
      <div class="q-pa-lg q-mb-md row items-center q-gutter-sm">
        <q-avatar
          icon="eco"
          color="green-2"
          text-color="green-10"
          size="40px"
        />
        <div>
          <div class="text-h6 text-weight-bolder" style="line-height: 1.2">
            Biljni Kviz
          </div>
          <div class="text-caption text-green-2">Admin Panel</div>
        </div>
      </div>

      <q-list padding class="col">
        <q-item-label
          header
          class="text-green-2 text-weight-bold text-uppercase"
        >
          Izbornik
        </q-item-label>

        <q-item
          clickable
          class="text-white q-my-sm"
          style="border-radius: 0 30px 30px 0; margin-right: 10px"
          @click="$router.push('/PregledBiljaka')"
        >
          <q-item-section avatar><q-icon name="list_alt" /></q-item-section>
          <q-item-section class="text-weight-bold">Pregled biljaka</q-item-section>
          <q-item-section side><q-icon name="chevron_right" color="white" /></q-item-section>
        </q-item>

        <q-item
          clickable
          class="bg-green-8 text-white q-my-sm"
          style="border-radius: 0 30px 30px 0; margin-right: 10px"
          @click="$router.push('/PregledPorodica')"
        >
          <q-item-section avatar><q-icon name="list_alt" /></q-item-section>
          <q-item-section class="text-weight-bold">Pregled porodica</q-item-section>
          <q-item-section side><q-icon name="chevron_right" color="white" /></q-item-section>
        </q-item>

        <q-item clickable class="text-white q-my-sm" style="border-radius: 0 30px 30px 0; margin-right: 10px;" @click="$router.push('/Uredibiljku')">
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

    <div class="col bg-grey-1 column">
      <div class="q-pa-lg col overflow-auto">
        <div class="row items-center q-mb-md">
          <div class="text-h6 text-weight-bold col">Botaničke porodice</div>
          <q-btn
            color="green-8"
            icon="add"
            label="Dodaj porodicu"
            @click="openDodajPorodicu"
          />
        </div>

        <q-table
          :rows="porodice"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
          class="bg-white shadow-2"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="cursor-pointer"
              @click="toggleExpand(props.row)"
            >
              <q-td key="expand" :props="props" auto-width>
                <q-icon
                  :name="expandedId === props.row.id ? 'expand_less' : 'expand_more'"
                  color="grey-6"
                />
              </q-td>

              <q-td key="id" :props="props">
                {{ props.row.id }}
              </q-td>

              <q-td key="croatian_name" :props="props">
                {{ props.row.croatian_name }}
              </q-td>

              <q-td key="latin_name" :props="props">
                {{ props.row.latin_name }}
              </q-td>

              <q-td key="akcije" :props="props" class="text-center">
                <q-btn
                  flat
                  round
                  color="blue-7"
                  icon="edit"
                  size="sm"
                  @click.stop="openUrediPorodicu(props.row)"
                />
                <q-btn
                  flat
                  round
                  color="red-7"
                  icon="delete"
                  size="sm"
                  @click.stop="openBrisiPorodicu(props.row)"
                />
              </q-td>
            </q-tr>

            <q-tr v-if="expandedId === props.row.id" :props="props" no-hover>
              <q-td colspan="100%" class="q-pa-none">
                <div class="q-pa-md bg-green-1">
                  <div class="row items-center q-mb-md">
                    <div
                      class="text-caption text-weight-bold text-green-9 col"
                      style="letter-spacing: 0.05em; text-transform: uppercase"
                    >
                      Rodovi (genus) u ovoj porodici
                    </div>
                    <q-btn
                      color="green-8"
                      icon="add"
                      label="Dodaj rod"
                      size="sm"
                      @click.stop="openDodajGenus(props.row)"
                    />
                  </div>

                  <div v-if="genusLoading" class="row items-center q-gutter-sm">
                    <q-spinner color="green-7" size="18px" />
                    <span class="text-caption text-grey-6">Učitavanje rodova...</span>
                  </div>

                  <div
                    v-else-if="genusLista.length === 0"
                    class="text-caption text-grey-5"
                  >
                    Nema rodova za ovu porodicu. Dodajte prvi rod klikom na gumb iznad.
                  </div>

                  <q-table
                    v-else
                    :rows="genusLista"
                    :columns="genusColumns"
                    row-key="id"
                    flat
                    dense
                    bordered
                    class="bg-white"
                    hide-bottom
                    :pagination="{ rowsPerPage: 0 }"
                  >
                    <template v-slot:body-cell-akcije="genusProps">
                      <q-td :props="genusProps" class="q-gutter-x-sm text-center">
                        <q-btn
                          flat
                          round
                          color="blue-7"
                          icon="edit"
                          size="sm"
                          @click.stop="openUrediGenus(genusProps.row)"
                        />
                        <q-btn
                          flat
                          round
                          color="red-7"
                          icon="delete"
                          size="sm"
                          @click.stop="openBrisiGenus(genusProps.row)"
                        />
                      </q-td>
                    </template>
                  </q-table>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
  </div>

  <q-dialog v-model="dijalogPorodicaOtvoren" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="bg-green-8 text-white">
        <div class="text-h6">{{ dijalogPorodicaNaslov }}</div>
      </q-card-section>
      <q-card-section class="q-gutter-md q-pt-lg">
        <q-input v-model="formaPorodica.croatian_name" label="Hrvatski naziv" outlined dense :rules="[(val) => !!val || 'Obavezno polje']" />
        <q-input v-model="formaPorodica.latin_name" label="Latinski naziv" outlined dense :rules="[(val) => !!val || 'Obavezno polje']" />
      </q-card-section>
      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn flat label="Odustani" color="grey-7" v-close-popup />
        <q-btn label="Spremi" color="green-8" @click="spremiPorodicu" :loading="spremaPorodicaLoading" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dijalogBrisanjePorodice" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="red-7" text-color="white" />
        <span class="q-ml-sm">Jeste li sigurni da želite obrisati porodicu <strong>{{ odabranaPorodica?.croatian_name }}</strong>?</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Odustani" color="grey-7" v-close-popup />
        <q-btn label="Obriši" color="red-7" @click="obrisiPorodicu" :loading="brisePorodicaLoading" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dijalogGenusOtvoren" persistent>
    <q-card style="min-width: 380px">
      <q-card-section class="bg-green-8 text-white">
        <div class="text-h6">{{ dijalogGenusNaslov }}</div>
        <div class="text-caption text-green-2">Porodica: {{ aktivnaPorodica?.croatian_name }}</div>
      </q-card-section>
      <q-card-section class="q-pt-lg">
        <q-input v-model="formaGenus.name" label="Naziv roda" outlined dense autofocus :rules="[(val) => !!val || 'Obavezno polje']" />
      </q-card-section>
      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn flat label="Odustani" color="grey-7" v-close-popup />
        <q-btn label="Spremi" color="green-8" @click="spremiGenus" :loading="spremaGenusLoading" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dijalogBrisanjeGenusa" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="red-7" text-color="white" />
        <span class="q-ml-sm">Jeste li sigurni da želite obrisati rod <strong>{{ odabraniGenus?.name }}</strong>?</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Odustani" color="grey-7" v-close-popup />
        <q-btn label="Obriši" color="red-7" @click="obrisiGenus" :loading="briseGenusLoading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const BASE_URL = "http://localhost:3000";

// ===== PORODICA STATE =====
const porodice = ref([]);
const loading = ref(true);
const odabranaPorodica = ref(null);
const dijalogPorodicaOtvoren = ref(false);
const dijalogBrisanjePorodice = ref(false);
const dijalogPorodicaNaslov = ref("");
const formaPorodica = ref({ croatian_name: "", latin_name: "" });
const spremaPorodicaLoading = ref(false);
const brisePorodicaLoading = ref(false);

// ===== EXPAND / GENUS STATE =====
const expandedId = ref(null);
const aktivnaPorodica = ref(null);
const genusLista = ref([]);
const genusLoading = ref(false);
const odabraniGenus = ref(null);
const dijalogGenusOtvoren = ref(false);
const dijalogBrisanjeGenusa = ref(false);
const dijalogGenusNaslov = ref("");
const formaGenus = ref({ name: "" });
const spremaGenusLoading = ref(false);
const briseGenusLoading = ref(false);

// ===== COLUMNS (Popravljeno: ime stupca se mora podudarati s key u TD) =====
const columns = [
  { name: "expand", label: "", field: "expand", align: "left" },
  { name: "id", align: "left", label: "ID", field: "id", sortable: true },
  {
    name: "croatian_name",
    align: "left",
    label: "Hrvatski naziv",
    field: "croatian_name",
    sortable: true,
  },
  {
    name: "latin_name",
    align: "left",
    label: "Latinski naziv",
    field: "latin_name",
    sortable: true,
  },
  { name: "akcije", align: "center", label: "Akcije", field: "akcije" },
];

const genusColumns = [
  { name: "id", align: "left", label: "ID", field: "id", sortable: true },
  { name: "name", align: "left", label: "Naziv roda", field: "name", sortable: true },
  { name: "akcije", align: "center", label: "Akcije", field: "akcije" },
];

// ===== METODE (Nepromijenjene, ali uključene za kompletnost) =====
const fetchPorodice = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${BASE_URL}/api/PregledBotanskihPorodica`);
    porodice.value = response.data;
  } catch (error) {
    console.error("Greška pri dohvatu porodica:", error);
  } finally {
    loading.value = false;
  }
};

const openDodajPorodicu = () => {
  odabranaPorodica.value = null;
  formaPorodica.value = { croatian_name: "", latin_name: "" };
  dijalogPorodicaNaslov.value = "Dodaj porodicu";
  dijalogPorodicaOtvoren.value = true;
};

const openUrediPorodicu = (row) => {
  odabranaPorodica.value = row;
  formaPorodica.value = { croatian_name: row.croatian_name, latin_name: row.latin_name };
  dijalogPorodicaNaslov.value = "Uredi porodicu";
  dijalogPorodicaOtvoren.value = true;
};

const openBrisiPorodicu = (row) => {
  odabranaPorodica.value = row;
  dijalogBrisanjePorodice.value = true;
};

const spremiPorodicu = async () => {
  if (!formaPorodica.value.croatian_name || !formaPorodica.value.latin_name) return;
  spremaPorodicaLoading.value = true;
  try {
    if (odabranaPorodica.value) {
      await axios.put(`${BASE_URL}/api/botanical_family/${odabranaPorodica.value.id}`, formaPorodica.value);
    } else {
      await axios.post(`${BASE_URL}/api/botanical_family`, formaPorodica.value);
    }
    dijalogPorodicaOtvoren.value = false;
    await fetchPorodice();
  } catch (error) { console.error(error); } finally { spremaPorodicaLoading.value = false; }
};

const obrisiPorodicu = async () => {
  brisePorodicaLoading.value = true;
  try {
    await axios.delete(`${BASE_URL}/api/botanical_family/${odabranaPorodica.value.id}`);
    dijalogBrisanjePorodice.value = false;
    if (odabranaPorodica.value?.id === expandedId.value) expandedId.value = null;
    await fetchPorodice();
  } catch (error) { console.error(error); } finally { brisePorodicaLoading.value = false; }
};

const toggleExpand = async (row) => {
  if (expandedId.value === row.id) {
    expandedId.value = null;
    return;
  }
  expandedId.value = row.id;
  aktivnaPorodica.value = row;
  await fetchGenus();
};

const fetchGenus = async () => {
  if (!expandedId.value) return;
  genusLoading.value = true;
  try {
    const res = await axios.get(`${BASE_URL}/api/genus_by_family/${expandedId.value}`);
    genusLista.value = res.data;
  } catch (error) { console.error(error); } finally { genusLoading.value = false; }
};

const openDodajGenus = (porodica) => {
  aktivnaPorodica.value = porodica;
  odabraniGenus.value = null;
  formaGenus.value = { name: "" };
  dijalogGenusNaslov.value = "Dodaj rod";
  dijalogGenusOtvoren.value = true;
};

const openUrediGenus = (row) => {
  odabraniGenus.value = row;
  formaGenus.value = { name: row.name };
  dijalogGenusNaslov.value = "Uredi rod";
  dijalogGenusOtvoren.value = true;
};

const openBrisiGenus = (row) => {
  odabraniGenus.value = row;
  dijalogBrisanjeGenusa.value = true;
};

const spremiGenus = async () => {
  if (!formaGenus.value.name) return;
  spremaGenusLoading.value = true;
  try {
    if (odabraniGenus.value) {
      await axios.put(`${BASE_URL}/api/genus/${odabraniGenus.value.id}`, { name: formaGenus.value.name });
    } else {
      await axios.post(`${BASE_URL}/api/genus`, { name: formaGenus.value.name, botanical_family_id: aktivnaPorodica.value.id });
    }
    dijalogGenusOtvoren.value = false;
    await fetchGenus();
  } catch (error) { console.error(error); } finally { spremaGenusLoading.value = false; }
};

const obrisiGenus = async () => {
  briseGenusLoading.value = true;
  try {
    await axios.delete(`${BASE_URL}/api/genus/${odabraniGenus.value.id}`);
    dijalogBrisanjeGenusa.value = false;
    await fetchGenus();
  } catch (error) { console.error(error); } finally { briseGenusLoading.value = false; }
};

onMounted(fetchPorodice);
</script>

<style scoped>
.bg-green-10 { background-color: #1b3a1a !important; }
.bg-green-8 { background-color: #2d5a27 !important; }
</style>
