(function() {
  const DEBUG = true;
  let interactPanel = null;
  
  function log(...args) {
    if (DEBUG) console.log('[YouTube Interact]', ...args);
  }

  function extractTranscript() {
    // Find the transcript panel
    const transcriptPanel = document.querySelector('ytd-transcript-segment-list-renderer');
    if (!transcriptPanel) {
      log('No transcript panel found');
      return '';
    }

    // Get all transcript segments
    const segments = transcriptPanel.querySelectorAll('ytd-transcript-segment-renderer');
    let transcriptText = '';

    segments.forEach(segment => {
      const timestamp = segment.querySelector('#timestamp')?.textContent?.trim() || '';
      const text = segment.querySelector('#text')?.textContent?.trim() || '';
      transcriptText += `[${timestamp}] ${text}\n`;
    });

    return transcriptText;
  }

  function openTranscriptPanel() {
    // Find and click the "Show transcript" button if it exists
    const buttons = Array.from(document.querySelectorAll('button'));
    const showTranscriptButton = buttons.find(button => 
      button.textContent.toLowerCase().includes('show transcript')
    );

    if (showTranscriptButton) {
      showTranscriptButton.click();
      return true;
    }

    return false;
  }

  async function handleInteractButtonClick() {
    // Pause the video
    const video = document.querySelector('video.html5-main-video');
    if (video) {
      log('Video found, pausing...');
      video.pause();
    }

    // Create panel if it doesn't exist
    if (!interactPanel) {
      interactPanel = new YouTubeInteractPanel();
    }

    // Try to get transcript
    let transcript = extractTranscript();
    if (!transcript) {
      // If no transcript, try opening the transcript panel
      if (openTranscriptPanel()) {
        // Wait a bit for the panel to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        transcript = extractTranscript();
      }
    }

    if (transcript) {
      interactPanel.setTranscript(transcript);
    } else {
      interactPanel.setTranscript('No transcript available for this video.');
    }

    interactPanel.create();
  }

  function injectInteractButton() {
    // Already inserted?
    if (document.querySelector('#my-youtube-interact-button')) {
      log('Button already exists, skipping injection');
      return;
    }

    // Try multiple common selectors
    const buttonContainer = document.querySelector('ytd-watch-metadata #top-level-buttons-computed')
                       || document.querySelector('#top-level-buttons-computed')
                       || document.querySelector('ytd-watch-metadata #top-level-buttons')
                       || document.querySelector('#top-level-buttons');

    log('buttonContainer found:', buttonContainer);

    if (!buttonContainer) {
      log('No button container found, will try again on next mutation');
      return;
    }

    // Create button wrapper to match YouTube's structure
    const buttonWrapper = document.createElement('div');
    buttonWrapper.style.cssText = 'display: inline-flex; margin: 0 8px;';

    const interactButton = document.createElement('button');
    interactButton.id = 'my-youtube-interact-button';
    interactButton.className = 'yt-interact-button';
    interactButton.textContent = 'Interact';
    interactButton.setAttribute('title', 'Open Interact Mode');
    interactButton.setAttribute('aria-label', 'Open Interact Mode');

    // Add click handler
    interactButton.addEventListener('click', handleInteractButtonClick);

    // Append button to wrapper, then wrapper to container
    buttonWrapper.appendChild(interactButton);
    buttonContainer.appendChild(buttonWrapper);
    log('Interact button successfully injected!');

    // Add debug visual if needed
    if (DEBUG) {
      const testDiv = document.createElement('div');
      testDiv.textContent = 'YouTube Interact Extension Active';
      testDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 999999; background: rgba(255,0,0,0.8); color: white; padding: 5px; font-size: 12px; border-radius: 4px;';
      document.body.appendChild(testDiv);
      setTimeout(() => testDiv.remove(), 3000);
    }
  }

  // A small MutationObserver to watch for #top-level-buttons-computed changes
  const observer = new MutationObserver(mutations => {
    log('DOM mutated; trying to inject button.');
    injectInteractButton();
  });

  // Wait for the page to be ready
  function init() {
    log('Initializing YouTube Interact extension...');
    
    // Try to find the watch page container
    const watchFlexy = document.querySelector('ytd-watch-flexy') || document.body;
    
    if (watchFlexy) {
      log('Found watch page container, starting observer');
      observer.observe(watchFlexy, { 
        childList: true, 
        subtree: true 
      });
      
      // Initial injection attempt
      injectInteractButton();
    } else {
      log('Watch page container not found, retrying in 1s...');
      setTimeout(init, 1000);
    }
  }

  // Start the initialization
  init();
})(); 