// CarVibes — nl language pack (base UI + quiz merged, single lookup).
import { dict as base } from "../base/nl";
import { dict as quiz } from "../../quiz/i18n/nl";
import type { Dict } from "../dict";

export const pack: Dict = { ...base, ...quiz };

export default pack;
