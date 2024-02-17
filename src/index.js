import '@material/web/all';
import {Howl, Howler} from 'howler';
import css from "./index.css";
import "./components/all.js"
import placeholder from "./placeholder.jpg";
import { argbFromHex, themeFromSourceColor, applyTheme } from "@material/material-color-utilities";

var themeColor = localStorage.getItem("configuredThemeColor")
if(themeColor == null || themeColor == undefined || themeColor == "" || themeColor == "null" || themeColor == "undefined"){
  themeColor = "#17496C"
}else if(!themeColor.match("^#(?:[0-9a-fA-F]{3}){1,2}$") || !themeColor.match("^#(?:[0-9a-fA-F]{3,4}){1,2}$")){
  themeColor = "#17496C"
}

// Get the theme from a hex color
const theme = themeFromSourceColor(argbFromHex(themeColor), [
  {
    name: "custom-1",
    value: argbFromHex(themeColor),
    blend: true,
    scheme: true,
    dynamiccolor: true,
  },
]);


// console.log(JSON.stringify(theme, null, 2));
// Check if the user has dark mode turned on via system or switch
const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
var darkMode = localStorage.getItem("configuredDarkMode")
if(darkMode == null || darkMode == undefined || darkMode == "" || darkMode == "null" || darkMode == "undefined"){
  darkMode = systemDark
}

// Apply the theme to the body by updating custom properties for material tokens
applyTheme(theme, {target: document.getElementsByTagName("html")[0], dark: (systemDark || darkMode=="true")});