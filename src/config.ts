export interface Config {
  host: string
  port: number

  verbose: boolean

  mongo: {
    uri: string
    verbose: boolean
  }

  log: {
    stackError?: boolean
    file?: {
      name: string,
      level: string,
      datePattern: string
      directory: string
      maxSize: string
      maxFiles: string
    },

    console?: {
      level: string
    }
  }

  saltRounds: number
  secret: string
  expiresIn: string
}
