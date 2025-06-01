// ==UserScript==
// @name         Twitch Video Loading Handler
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Handles video loading issues on Twitch by clicking the play/pause buttons if a spinner persists, with dynamic retry intervals and a startup delay.
// @author       ChatGPT
// @match        *://*.twitch.tv/*
// @grant        none
// ==/UserScript==

// Source : https://github.com/pixeltris/TwitchAdSolutions/issues/313

(function () {
  "use strict";

  let attemptCount = 0; // Track the number of attempts
  let isProcessing = false; // Prevent overlapping executions

  const STARTUP_DELAY = 60000; // Default 1 minute (60000 ms) startup delay after page load
  const MAX_ATTEMPTS = 5; // Maximum attempts before waiting
  const FIRST_RETRY_INTERVAL = 1000; // Default 2 (2000 ms) seconds for the first attempt
  const SUBSEQUENT_RETRY_INTERVAL = 1500; // Default 3 (3000 ms) seconds for later attempts
  const WAIT_AFTER_MAX_ATTEMPTS = 60000; // Default (60000 ms) 1 minute after 5 failures

  function getRetryInterval() {
    return attemptCount === 1 ? FIRST_RETRY_INTERVAL : SUBSEQUENT_RETRY_INTERVAL;
  }

  function clickButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
      button.click();
    }
  }

  function checkAndHandleSpinner() {
    if (isProcessing) return; // Prevent multiple simultaneous executions
    isProcessing = true;

    const inactivePlayer = document.querySelector(".video-player__inactive");
    if (!inactivePlayer) {
      attemptCount = 0; // Reset if no inactive player is found
      isProcessing = false;
      return;
    }

    const spinner = inactivePlayer.querySelector(".tw-loading-spinner");
    if (spinner) {
      attemptCount++;
      if (attemptCount <= MAX_ATTEMPTS) {
        // console.log(`Spinner found. Attempt ${attemptCount}/${MAX_ATTEMPTS}. Retrying play/pause...`);

        // Attempt to click the "pause" and "play" buttons
        clickButton('button[data-a-player-state="playing"]'); // Simulate pause
        setTimeout(() => {
          clickButton('button[data-a-player-state="paused"]'); // Simulate play
        }, 100);

        setTimeout(() => {
          isProcessing = false; // Allow next check after retry wait
          checkAndHandleSpinner();
        }, getRetryInterval());
      } else {
        // console.log(`Spinner persisted after ${MAX_ATTEMPTS} attempts. Waiting 1 minute.`);
        attemptCount = 0; // Reset attempt count
        setTimeout(() => {
          isProcessing = false; // Allow next check after delay
          checkAndHandleSpinner();
        }, WAIT_AFTER_MAX_ATTEMPTS);
      }
    } else {
      // console.log('No spinner found. Resetting attempt count.');
      attemptCount = 0; // Reset attempt count if spinner is gone
      isProcessing = false;
    }
  }

  function initializeScript() {
    // Periodically check for the spinner
    setInterval(checkAndHandleSpinner, SUBSEQUENT_RETRY_INTERVAL);
  }

  // Delay script initialization
  setTimeout(initializeScript, STARTUP_DELAY);
})();
