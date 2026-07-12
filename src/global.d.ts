// Enable type-safe messages and format configuration for next-intel.
import en from "./messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof en;
  }
}
