// ==UserScript==
// @name         Twitch Auto Reward
// @namespace    http://tampermonkey.net/
// @version      1.1.0
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
const targetSelector = '.community-points-summary [class*="ScTransitionBase"]';
let compteur = 0;

let channelInfoEl;

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

function createObserver() {
  // Select the node that will be observed for mutations
  targetNode = document.querySelector(targetSelector);

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true, characterData: true };

  // Callback function to execute when mutations are observed
  const callback = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        // console.log("A child node has been added or removed.");
        // console.log(mutation);

        clickButton();

        // document.querySelector('[class*="ScCoreButtonSuccess"]')?.click();
      } else if (mutation.type === "attributes") {
        // console.log("The " + mutation.attributeName + " attribute was modified.");
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

function clickButton() {
  const rewardBtn = document.querySelector('[class*="ScCoreButtonSuccess"]');
  if (rewardBtn) {
    // const date = new Date();
    // const dateFormatted = `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
    // console.log(`Bouton Cliqué ${compteur++} fois ! ${dateFormatted}`);
    rewardBtn.click();

    displayRecap();
  }
}

function displayRecap() {
  const date = new Date();
  // const dateFormatted = `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
  const dateFormatted = `${date.toLocaleTimeString()}`;

  let recapEl = document.querySelector("#recap-bonus-reward");

  if (!recapEl) {
    recapEl = document.createElement("div");
    recapEl.setAttribute("id", "recap-bonus-reward");

    const htmlEl = /*html*/ `
        <p>Bonus récupéré <strong style="color:var(--color-text-live);">${compteur++}</strong> fois. (${dateFormatted})</p>
    `;
    recapEl.innerHTML = htmlEl;

    channelInfoEl.append(recapEl);
  } else {
    const htmlEl = /*html*/ `
        <p>Bonus récupéré <strong style="color:var(--color-text-live);">${compteur++}</strong> fois. (${dateFormatted})</p>
    `;
    recapEl.innerHTML = htmlEl;
  }
}

// ====================
//        MAIN
// ====================
(function () {
  "use strict";

  console.log("<<<<< Twitch Auto Reward >>>>>");

  // Utilisation version Promise
  waitForElm(targetSelector).then((elm) => {
    console.log("Element is ready :", elm);

    clickButton();

    createObserver();

    // const channelInfoEl = document.querySelector("div.channel-info-content .jUcRho");
    // channelInfoEl.append("Chat ready");
  });

  // Utilisation version Async/Await
  // const elm = await waitForElm('.some-class');

  // const channelInfoEl = document.querySelector('div.channel-info-content .jUcRho')
  waitForElm('[data-a-target="animated-channel-viewers-count"]').then((elm) => {
    // channelInfoEl = document.querySelector("div.channel-info-content .jUcRho");
    channelInfoEl = document.querySelector(".Layout-sc-1xcs6mc-0.dbWoZQ");
    channelInfoEl.style.flexDirection = "column";
    console.log("Viewers count Ready");
    displayRecap();
  });
})();
