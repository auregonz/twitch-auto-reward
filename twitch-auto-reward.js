// ==UserScript==
// @name         Twitch Auto Reward
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Automatically collect Specials Bonus
// @author       kyuugeki@gmail.com
// @match        https://www.twitch.tv/*
// @icon         https://assets.help.twitch.tv/article/img/Twitch-Emote-Icons/chest.png
// @grant        none
// ==/UserScript==

// ====================
//      VARIABLES
// ====================

let compteur = 0;

const btnSelector = '[class*="ScCoreButtonSuccess"]';
const idRecap = "recap-bonus-reward";

// ====================
//      FUNCTIONS
// ====================
/**
 * Wait for an Element exists
 * @param {*} selector
 * @returns {Promise<HTMLElement>}
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
 * Create an observer
 * @param {string} selector
 */
function createObserver(selector) {
  // Select the node that will be observed for mutations
  /** @type {HTMLElement | null} */
  const targetNode = document.querySelector(selector);

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true, characterData: true };

  // Callback function to execute when mutations are observed
  const callback = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        // console.log("A child node has been added or removed.");
        // console.log(mutation);

        collectPoints();

        // document.querySelector('[class*="ScCoreButtonSuccess"]')?.click();
      } else if (mutation.type === "attributes") {
        // console.log("The " + mutation.attributeName + " attribute was modified.");
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  if (targetNode) {
    observer.observe(targetNode, config);
  }

  // Later, you can stop observing
  // observer.disconnect();
}

/**
 * Click on channel point Button to collect channel points
 */
function clickButton(btnSelector) {
  /** @type {HTMLButtonElement | null} */
  const rewardBtn = document.querySelector(btnSelector);
  rewardBtn?.click();

  // const date = new Date();
  // const dateFormatted = `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
  // console.log(`Bouton Cliqué ${compteur++} fois ! ${dateFormatted}`);
}

/**
 * Initiate recap information
 * @param {string} idEl
 * @param {HTMLElement} parentEl
 */
function displayRecap(idEl, parentEl) {
  const recapEl = document.createElement("div");
  recapEl.setAttribute("id", idEl);

  parentEl.append(recapEl);

  const date = new Date();
  const dateFormatted = `${date.toLocaleTimeString()}`;

  const htmlEl = /*html*/ `
      <p>Bonus récupéré <strong style="color:var(--color-text-live);">${compteur}</strong> fois. (${dateFormatted})</p>
  `;
  recapEl.innerHTML = htmlEl;
}

/**
 * Update recap information
 * @param {string} selectorId
 */
function updateRecap(selectorId) {
  const date = new Date();
  const dateFormatted = `${date.toLocaleTimeString()}`;

  const htmlEl = /*html*/ `
      <p>Bonus récupéré <strong style="color:var(--color-text-live);">${compteur++}</strong> fois. (${dateFormatted})</p>
  `;

  /** @type {HTMLElement | null} */
  const recapEl = document.getElementById(selectorId);

  if (recapEl) {
    recapEl.innerHTML = htmlEl;
  }
}

/**
 * Collect point by clicking on button and display recap
 */
function collectPoints() {
  clickButton(btnSelector);

  updateRecap(idRecap);
}

// ====================
//        MAIN
// ====================
(function () {
  "use strict";

  console.log("<<<<< Twitch Auto Reward >>>>>");

  // Click on channel points button when it appears and create a new observer
  const targetSelector = '.community-points-summary [class*="ScTransitionBase"]';
  waitForElm(targetSelector).then((elm) => {
    console.log("Element is ready :", elm);

    collectPoints();

    createObserver(targetSelector);
  });

  // Display recap when viewers count area is loaded
  waitForElm('[data-a-target="animated-channel-viewers-count"]').then((elm) => {
    /** @type {HTMLDivElement | null} */
    const channelInfoEl = document.querySelector(".Layout-sc-1xcs6mc-0.dbWoZQ");

    if (channelInfoEl) {
      channelInfoEl.style.flexDirection = "column";
      console.log("Viewers count Ready");

      displayRecap(idRecap, channelInfoEl);
    }
  });
})();
