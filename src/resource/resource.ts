export interface Resource {
  Public: () => any
}

export interface Equaler<T> {
  Equals: (t: T) => boolean
}
