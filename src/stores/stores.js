import { writable } from "svelte/store";

export const selected_preset = writable({
    name : "",
    options : "",
    extension : ""
});
export const custom_save_path = writable("C:\\");
export const custom_file_name = writable("");
export const logger_html_string = writable("");

export const default_video = writable("");
export const default_documents = writable("");