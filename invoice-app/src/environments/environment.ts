export const environment: Environment = {
  production: false,
  // path: 'https://incoice-api.koodev.fr',
  path: 'http://localhost:3333',

}
environment.api = `${environment.path}/api`

export interface Environment {
  production?: boolean
  path?: string
  api?: string
}
