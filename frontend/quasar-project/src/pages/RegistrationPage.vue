<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg" style="min-width: 400px;">
      
      <q-card-section>
        <div class="text-h6">Registracija</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">

          <!-- NAME -->
          <q-input
            v-model="form.name"
            label="Korisničko ime"
            outlined
            :rules="[val => !!val || 'Korsiničko ime je obavezno']"
          />

          <!-- EMAIL -->
          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            outlined
           :rules="[
            val => !!val || 'Email je obavezan',
            val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Unesite validnu email adresu'
            ]"
          />

          <!-- PASSWORD -->
          <q-input
            v-model="form.password"
            label="Lozinka"
            :type="showPassword ? 'text' : 'password'"
            outlined
            :rules="[val => val && val.length >= 6 || 'Minimalno 6 znakova']"
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- PASSWORD STRENGTH -->
          <div v-if="passwordStrength.label" class="text-caption q-mt-sm">
            Jačina lozinke:
            <span :class="`text-${passwordStrength.color}`">
              {{ passwordStrength.label }}
            </span>
          </div>

          <!-- CONFIRM PASSWORD -->
          <q-input
            v-model="form.confirmPassword"
            label="Potvrdi lozinku"
            :type="showConfirmPassword ? 'text' : 'password'"
            outlined
            :rules="[val => val === form.password || 'Lozinke se ne podudaraju']"
          >
            <template v-slot:append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>

          <!-- BUTTON -->
          <q-btn
            type="submit"
            label="Registriraj se"
            color="positive"
            unelevated
            :loading="loading"
            :disable="!isFormValid"
            class="register-btn"
          >
            <q-tooltip v-if="!isFormValid">
              Popuni sva polja i provjeri lozinke
            </q-tooltip>
          </q-btn>

        </q-form>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
export default {
  name: 'RegisPage',
  setup() {
    const $q = useQuasar()
    const router = useRouter()
//$q.notify('Test radi!')
    const form = ref({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    const loading = ref(false)

    const showPassword = ref(false)
    const showConfirmPassword = ref(false)

    const isFormValid = computed(() => {
      return (
        form.value.name &&
        form.value.email &&
        form.value.password &&
        form.value.confirmPassword &&
        form.value.password === form.value.confirmPassword
      )
    })


    const passwordStrength = computed(() => {
      const pass = form.value.password

      if (!pass) return { label: '', color: '' }

      let score = 0
      if (pass.length >= 6) score++
      if (/[A-Z]/.test(pass)) score++
      if (/[0-9]/.test(pass)) score++
      if (/[^A-Za-z0-9]/.test(pass)) score++

      if (score <= 1) return { label: 'Slaba', color: 'negative' }
      if (score === 2) return { label: 'Srednja', color: 'warning' }
      return { label: 'Jaka', color: 'positive' }
    })

    const onSubmit = async () => {
  loading.value = true


  try {
    const res = await axios.post('http://localhost:3000/register', {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password
    })

    console.log(res.data)

    $q.notify({
      type: 'positive',
      message: 'Registracija uspješna!',
      position: 'top',
      timeout: 3000
    })
setTimeout(() => {
  router.push('/login')
}, 1500);
  } catch (err) {
    console.log('FULL ERROR:', err)
    console.log('RESPONSE:', err.response)

    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Greška na serveru',
      position: 'top',
      timeout: 4000
    })

  } finally {
    loading.value = false
  }
}


    return {
      form,
      loading,
      onSubmit,
      isFormValid,
      showPassword,
      showConfirmPassword,
      passwordStrength
    }
  }
}

</script>

<style scoped>
.register-btn {
  transition: all 0.3s ease;
}

.register-btn:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}
</style>
