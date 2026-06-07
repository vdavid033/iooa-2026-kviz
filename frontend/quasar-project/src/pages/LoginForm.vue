<template>
    <q-page class="flex flex-center">
        <q-card class="q-pa-lg" style="min-width: 400px;">
            <q-card-section>
                <div class="text-h6">Prijava</div>
            </q-card-section>

            
            <q-card-section>
                <q-form @submit="onSubmit" class="q-gutter-md">
                    <q-input
                        v-model="email"
                        label="Email"
                        type="email"
                        outlined
                        class="q-mb-md"
                        :rules="[
                            val => !!val || 'Email je obavezan',
                            val => /.+@.+\..+/.test(val) || 'Neispravan email format',
                            val => val.length <= 150 || 'Email je predugačak'
                        ]"
                    />
                   <q-input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    label="Lozinka"
                    outlined
                    class="q-mb-md"
                    :rules="[val => !!val || 'Lozinka je obavezna']"
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="showPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="showPassword = !showPassword"
                      />
                    </template>
                  </q-input>

                  <div class="row items-center justify-between q-mt-md">
                    <q-btn
                      label="PRIJAVI SE"
                      type="submit"
                      color="positive"
                      unelevated
                      :loading="loading"
                      :disable="!isFormValid"
                      class="register-btn"
                    />

                    <router-link to="/registration" class="text-positive">
                      Registriraj se!
                    </router-link>
                  </div>

                  
                </q-form>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const loading = ref(false)

const isFormValid = computed(() => {
  return (
    email.value &&
    password.value &&
    /.+@.+\..+/.test(email.value)
  )
})

const onSubmit = async () => {
  loading.value = true

  try {
    const res = await axios.post('http://localhost:3000/login', {
      email: email.value,
      password: password.value
    })

    //  spremi token
    const expiresAt = Date.now() + 30 * 60 * 1000 // 30 minuta

    localStorage.setItem('token', res.data.token)
    localStorage.setItem('expiresAt', expiresAt)
    localStorage.setItem('user', JSON.stringify(res.data.user))



    //  user 
    localStorage.setItem('user', JSON.stringify(res.data.user))
    
    window.dispatchEvent(new Event('storage'))

    // login uspješan
    $q.notify({
      type: 'positive',
      message: 'Login uspješan!',
      position: 'top',
      timeout: 2500
    })

    // redirect nakon kratkog delay-a
    setTimeout(() => {
      router.push('/')
    }, 1000)

  } catch (err) {
    console.log('LOGIN ERROR:', err)
    console.log('RESPONSE:', err.response)

    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Greška na serveru, pokušajte ponovo kasnije.',
      position: 'top',
      timeout: 4000
    })

  } finally {
    loading.value = false
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

a {
  text-decoration: none;
  color: #1c581c;
}

a:hover {
  text-decoration: underline;
  color: #1c581c;
}
</style>