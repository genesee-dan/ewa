// English — source of truth. Each screen contributes a fragment file under
// ./en/. They're loaded automatically, so adding a screen's strings is just a
// new file in ./en/ (and its ./es/ twin) — nothing to wire up here.
const modules = import.meta.glob('./en/*.js', { eager: true })
export const en = Object.assign({}, ...Object.values(modules).map((m) => m.default))
