// CarVibes — es language pack (base UI + quiz merged, single lookup).
import { dict as base } from "../base/es";
import { dict as quiz } from "../../quiz/i18n/es";
import type { Dict } from "../dict";

export const pack: Dict = { ...base, ...quiz };

export default pack;
