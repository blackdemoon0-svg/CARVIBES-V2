// CarVibes — fr language pack (base UI + quiz merged, single lookup).
import { dict as base } from "../base/fr";
import { dict as quiz } from "../../quiz/i18n/fr";
import type { Dict } from "../dict";

export const pack: Dict = { ...base, ...quiz };

export default pack;
