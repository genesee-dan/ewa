// Español. Each screen contributes a fragment file under ./es/, loaded
// automatically. Any key missing here falls back to English.
const modules = import.meta.glob('./es/*.js', { eager: true })
export const es = Object.assign({}, ...Object.values(modules).map((m) => m.default))
