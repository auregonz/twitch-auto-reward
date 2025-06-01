// ==UserScript==
// @name         Twitch Video Loading Handler
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Handles video loading issues on Twitch by interacting with play/pause buttons if a spinner persists, with a configurable delay before starting.
// @author       ChatGPT
// @match        *://*.twitch.tv/*
// @grant        none
// ==/UserScript==

// Source : https://github.com/pixeltris/TwitchAdSolutions/issues/313

(function () {
  "use strict";

  // Configurable delay before script starts (in milliseconds)
  const INITIAL_DELAY = 60000; // 1 minute

  // Delay the script's start by INITIAL_DELAY
  setTimeout(() => {
    let attemptCount = 0; // Track the number of attempts

    const MAX_ATTEMPTS = 5; // Maximum attempts before waiting
    const WAIT_BEFORE_RETRY = 3000; // 3 seconds between attempts
    const WAIT_AFTER_MAX_ATTEMPTS = 60000; // 1 minute after 5 failures

    function isSpinnerVisible() {
      const spinner = document.querySelector(".tw-loading-spinner");
      return spinner && spinner.offsetParent !== null; // Check if the spinner is visible
    }

    function getPlayingButton() {
      const channelPlayer = document.querySelector("#channel-player");
      return channelPlayer?.querySelector('[data-a-player-state="playing"]') || null;
    }

    function clickPlayPauseSequence() {
      const playingButton = getPlayingButton();
      if (playingButton) {
        playingButton.click(); // First click: Pause
        setTimeout(() => {
          playingButton.click(); // Second click: Play after 10ms
        }, 10);
      }
    }

    function checkAndHandleSpinner() {
      if (isSpinnerVisible() && getPlayingButton()) {
        attemptCount++;
        if (attemptCount <= MAX_ATTEMPTS) {
          // console.log(`Spinner visible with playing button. Attempt ${attemptCount}/${MAX_ATTEMPTS}. Retrying...`);
          setTimeout(() => {
            clickPlayPauseSequence();
            setTimeout(checkAndHandleSpinner, WAIT_BEFORE_RETRY);
          }, WAIT_BEFORE_RETRY);
        } else {
          // console.log(`Spinner persisted after ${MAX_ATTEMPTS} attempts. Waiting 1 minute.`);
          attemptCount = 0; // Reset attempt count
          setTimeout(checkAndHandleSpinner, WAIT_AFTER_MAX_ATTEMPTS);
        }
      } else {
        // console.log('No spinner or playing button found. Resetting attempt count.');
        attemptCount = 0; // Reset attempt count if conditions are not met
      }
    }

    // Periodically check for the spinner after the delay
    setInterval(checkAndHandleSpinner, WAIT_BEFORE_RETRY);
  }, INITIAL_DELAY); // Use INITIAL_DELAY for start delay
})();
