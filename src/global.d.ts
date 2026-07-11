// Enable type-safe messages and format configuration for next-intl.
// Message structure will be inferred from en.json once Phase 3 creates the catalogs.
//
// To enable autocompletion after Phase 3, add:
//   import en from "./messages/en.json";
//   declare module "next-intl" {
//     interface AppConfig {
//       Messages: typeof en;
//     }
//   }
