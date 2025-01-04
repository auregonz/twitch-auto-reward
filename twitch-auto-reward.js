// ==UserScript==
// @name         Twitch Auto Reward
// @namespace    http://tampermonkey.net/
// @version      2.0.2
// @description  Automatically collect Specials Bonus
// @author       auregonz
// @match        https://www.twitch.tv/*
// @icon         https://assets.help.twitch.tv/article/img/Twitch-Emote-Icons/chest.png
// @grant        none
// ==/UserScript==

// ====================
//      VARIABLES
// ====================
let targetNode;
let compteur = 0;
let channelInfoEl;

/**
 * Selector of the parent of Reward Button which is always visible in DOM
 */
const targetSelector = '.community-points-summary [class*="ScTransitionBase"]';
/**
 * Selector for Reward Button
 */
const rewardBtnSelector = '[class*="ScCoreButton"]';

/**
 * Selector for Channel Viewer Count
 * => Used to trigger displayRecap() for the first time
 */
const subgiftButton = '[data-a-target="animated-channel-viewers-count"]';
/**
 * Selector for Live Channel Stream Information : Viewer Count and Uptime
 * => Will be used to add Auto collect Count
 */
const channelInfosSelector = ".Layout-sc-1xcs6mc-0.llUbgd";

/**
 * Id for Recap bonus Reward element
 */
const recapBonusRewardId = "recap-bonus-reward";

// ====================
//        I18N
// ====================
/**
 * User locale (fr-FR, es-ES, en-GB, en-US, de-DE...)
 * format : langagueCode-regionIdentifier
 */
const locale = navigator.language;
/**
 * User languageCode
 */
const localeShort = locale.split("-")[0];

/**
 * Wording for internationalization
 */
const translations = {
  // French translations
  fr: {
    prefix: "Bonus récupéré",
    suffix: "fois.",
  },
  // English translations
  en: {
    prefix: "Bonus collected",
    suffix: "times.",
  },
};

/**
 * List of available languages for display
 */
const languages = Object.keys(translations);

/**
 * Display language
 * If user's locale is not available for supported translations, display language is set to english
 */
const displayLang = languages.find((lang) => lang === localeShort) ?? "en";

// ====================
//      FUNCTIONS
// ====================
/**
 * Wait for an Element exists
 * @param {*} selector
 * @returns Element
 *
 * https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
 */
function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Create an Oberver
 * @param {string} selector - Selector for the node to observe
 */
function createObserver(selector) {
  // Select the node that will be observed for mutations
  targetNode = document.querySelector(selector);

  // Options for the observer (which mutations to observe)
  const config = {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  };

  // Callback function to execute when mutations are observed
  const callback = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        // console.log(">>> A child node has been added or removed :", mutation);

        collectReward();
        // } else if (mutation.type === "attributes") {
        //   console.log(">>> Attribute modified :", mutation.attributeName);
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);

  // Later, you can stop observing
  // observer.disconnect();
}

/**
 * Click on Reward Button if exist and call displayRecap
 */
function collectReward() {
  /**
   * @type {HTMLButtonElement}
   */
  const btnEl = document.querySelector(`${targetSelector} ${rewardBtnSelector}`);
  if (btnEl) {
    btnEl.click();
    compteur++;

    displayRecap();
  }
}

/**
 * Display Recap for Auto collect count and last collect time
 */
function displayRecap() {
  const date = new Date();
  const dateFormatted = `${date.toLocaleTimeString()}`;

  /**
   * @type {HTMLDivElement}
   */
  let recapEl = document.getElementById(recapBonusRewardId);

  if (!recapEl) {
    recapEl = document.createElement("div");
    recapEl.setAttribute("id", recapBonusRewardId);

    channelInfoEl.append(recapEl);
  }

  const htmlEl = /*html*/ `
        <p>${translations[displayLang].prefix} <strong style="color:var(--color-text-live);">${compteur}</strong> ${translations[displayLang].suffix} (${dateFormatted})</p>`;

  recapEl.innerHTML = htmlEl;
}

// ====================
//        MAIN
// ====================
(function () {
  "use strict";

  console.log("<<<<< Twitch Auto Reward >>>>>");

  // Wait for parent of reward button is loaded to observe it and detect when Reward Button appears
  waitForElm(targetSelector).then((elm) => {
    console.log(">>> Element is ready :", elm);

    // Check to collect reward if reward button is already existing
    collectReward();

    createObserver(targetSelector);
  });

  // Wait for channel viewer count appears to display recap
  waitForElm(subgiftButton).then((elm) => {
    channelInfoEl = document.querySelector(channelInfosSelector);
    channelInfoEl.style.flexDirection = "column";

    console.log(">>> Viewers count Ready");

    // Initialize recap infos
    displayRecap();
  });
})();
