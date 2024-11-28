import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const AddressesController = () => import('#controllers/addresses_controller')
const ClientsController = () => import('#controllers/clients_controller')
const AuthController = () => import('#controllers/auth_controller')
const InvoicesController = () => import('#controllers/invoices_controller')

router
  .group(() => {
    router.post('/login', [AuthController, 'login'])
    router.post('/signup', [AuthController, 'signup'])
    router.get('/check', [AuthController, 'check'])
    router.get('/me', [AuthController, 'me'])

    router.patch('/users/:id', [AuthController, 'update']).use(middleware.auth())

    // router.get('/clients', [ClientsController, 'index']) //todo admin middleware
    router.get('/clients/:id', [ClientsController, 'show']).use(middleware.auth())
    router.post('/clients', [ClientsController, 'store']).use(middleware.auth())
    router.patch('/clients/:id', [ClientsController, 'update']).use(middleware.auth())
    router.delete('/clients/:id', [ClientsController, 'destroy']).use(middleware.auth())

    // router.get('/addresses', [AddressesController, 'index']) //todo admin middleware
    router.get('/addresses/:id', [AddressesController, 'show']).use(middleware.auth())
    router.post('/addresses', [AddressesController, 'store']).use(middleware.auth())
    router.patch('/addresses/:id', [AddressesController, 'update']).use(middleware.auth())
    router.delete('/addresses/:id', [AddressesController, 'destroy']).use(middleware.auth())

    router.get('/invoices', [InvoicesController, 'index']).use(middleware.auth())
    router.get('/invoices/:id', [InvoicesController, 'show']).use(middleware.auth())
    router.post('/invoices', [InvoicesController, 'store']).use(middleware.auth())
    router.patch('/invoices/:id', [InvoicesController, 'update']).use(middleware.auth())
    router.delete('/invoices/:id', [InvoicesController, 'destroy']).use(middleware.auth())
  })
  .prefix('api')
