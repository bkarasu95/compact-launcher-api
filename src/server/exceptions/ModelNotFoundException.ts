export default class ModelNotFoundException extends Error {
  message: string

  constructor(message?: string) {
    super(message)
    this.message = message ?? 'Model Not Found'
  }
}
