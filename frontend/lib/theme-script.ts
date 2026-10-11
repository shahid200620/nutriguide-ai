// Runs in <head> BEFORE the page paints, so a saved dark theme never flashes light first.
// Kept in a plain (non-"use client") module so the server layout can inline it as a string.
export const THEME_KEY = "nutriguide_theme";

export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_KEY)},t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var d=document.documentElement;if(t==="dark"){d.classList.add("dark")}d.style.colorScheme=t}catch(e){}})();`;
