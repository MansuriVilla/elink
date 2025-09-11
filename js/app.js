
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


 
  function handleVideoPreview() {
    const videoPreviews = document.querySelectorAll(".video-preview");
    const startTime = 0;
    const endTime = 5;
 
    videoPreviews.forEach((preview, index) => {
      // Select all required elements
      const previewVideo = preview.querySelector(".preview-video");
      const playButton = preview.querySelector(".play-button");
      const videoPopup = document.getElementById(`dialog-video__${index + 1}`);
      const popupContent = document.getElementById(
        `dialog-content__${index + 1}`
      );
      const fullVideo = document.getElementById(
        `dialog-full__video-${index + 1}`
      );
      const closeButton = document.getElementById(
        `dialog-close__btn-${index + 1}`
      );
      const loader = document.getElementById(`loader-${index + 1}`);
 
      // Validate all required elements exist
      if (
        !previewVideo ||
        !playButton ||
        !videoPopup ||
        !popupContent ||
        !fullVideo ||
        !closeButton ||
        !loader
      ) {
        console.error(`Missing elements for video block ${index + 1}`, {
          previewVideo: !!previewVideo,
          playButton: !!playButton,
          videoPopup: !!videoPopup,
          popupContent: !!popupContent,
          fullVideo: !!fullVideo,
          closeButton: !!closeButton,
          loader: !!loader,
        });
        return; // Skip this iteration
      }
 
      // Get video URL and determine if it's an iframe (Vimeo/YouTube)
      const videoUrl = preview.dataset.videoUrl;
      const isIframe =
        videoUrl.includes("vimeo.com") || videoUrl.includes("youtube.com");
 
      // Set preview and full video sources
      if (isIframe) {
        previewVideo.src = videoUrl;
        fullVideo.src = videoUrl.replace("autoplay=1", "");
      } else {
        previewVideo.src = videoUrl;
        fullVideo.src = videoUrl;
      }
 
      // Function to hide loader
      const hideLoader = () => {
        loader.style.display = "none";
        preview.classList.add("dialog-video__loading");
      };
 
      // Handle preview video/iframe playback
      if (isIframe && videoUrl.includes("vimeo.com")) {
        const player = new Vimeo.Player(previewVideo);
        player.on("loaded", () => {
          hideLoader(); // Hide loader when Vimeo video is loaded
          player.setCurrentTime(startTime).then(() => {
            player.play().catch((error) => {
              console.log(
                `Autoplay prevented for Vimeo video ${index + 1}:`,
                error
              );
              document.addEventListener(
                "click",
                () => {
                  player.play();
                },
                { once: true }
              );
            });
          });
        });
        player.on("timeupdate", (data) => {
          if (data.seconds >= endTime) {
            player.setCurrentTime(startTime);
          }
        });
        // Hide loader on error to prevent infinite loading
        player.on("error", () => {
          console.error(`Error loading Vimeo video ${index + 1}`);
          hideLoader();
        });
      } else {
        previewVideo.addEventListener("loadedmetadata", () => {
          hideLoader(); // Hide loader when HTML5 video metadata is loaded
          previewVideo.currentTime = startTime;
          previewVideo.play().catch((error) => {
            console.log(`Autoplay prevented for video ${index + 1}:`, error);
            document.addEventListener(
              "click",
              () => {
                previewVideo.play();
              },
              { once: true }
            );
          });
        });
        previewVideo.addEventListener("timeupdate", () => {
          if (previewVideo.currentTime >= endTime) {
            previewVideo.currentTime = startTime;
          }
        });
        // Hide loader on error to prevent infinite loading
        previewVideo.addEventListener("error", () => {
          console.error(`Error loading video ${index + 1}`);
          hideLoader();
        });
      }
 
      // Open popup and play full video
      playButton.addEventListener("click", () => {
        if (isIframe && videoUrl.includes("vimeo.com")) {
          const fullPlayer = new Vimeo.Player(fullVideo);
          if (previewVideo.tagName === "IFRAME") {
            const previewPlayer = new Vimeo.Player(previewVideo);
            previewPlayer.pause();
          } else {
            previewVideo.pause();
          }
          document.body.classList.add("dialog-box__open");
          gsap.to(videoPopup, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
            onStart: () => {
              videoPopup.style.display = "flex";
              videoPopup.style.pointerEvents = "auto";
            },
          });
          gsap.to(popupContent, {
            opacity: 1,
            // scale: 1,
            duration: 0.5,
            ease: "power2.out",
            delay: 0.2,
            onComplete: () => {
              fullPlayer.play();
            },
          });
        } else {
          previewVideo.pause();
          document.body.classList.add("dialog-box__open");
          gsap.to(videoPopup, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
            onStart: () => {
              videoPopup.style.display = "flex";
              videoPopup.style.pointerEvents = "auto";
            },
          });
          gsap.to(popupContent, {
            opacity: 1,
            // scale: 1,
            duration: 0.5,
            ease: "power2.out",
            delay: 0.2,
            onComplete: () => {
              fullVideo.play();
            },
          });
        }
      });
 
      // Close popup and handle video/iframe behavior
      closeButton.addEventListener("click", () => {
        gsap.to(popupContent, {
          opacity: 0,
          // scale: 0.8,
          duration: 0.5,
          ease: "power2.in",
          onStart: () => {
            if (isIframe && videoUrl.includes("vimeo.com")) {
              const fullPlayer = new Vimeo.Player(fullVideo);
              fullPlayer.pause();
              if (fullVideo.dataset.videoBehavior === "restart") {
                fullPlayer.setCurrentTime(0);
              }
              if (previewVideo.tagName === "IFRAME") {
                const previewPlayer = new Vimeo.Player(previewVideo);
                previewPlayer.play();
              } else {
                previewVideo.play();
              }
            } else {
              fullVideo.pause();
              if (fullVideo.dataset.videoBehavior === "restart") {
                fullVideo.currentTime = 0;
              }
              previewVideo.play();
            }
          },
        });
        gsap.to(videoPopup, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          delay: 0.5,
          onComplete: () => {
            videoPopup.style.display = "none";
            videoPopup.style.pointerEvents = "none";
            document.body.classList.remove("dialog-box__open");
          },
        });
      });
 
      // Close popup on ESC key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && videoPopup.style.display !== "none") {
          closeButton.click();
        }
      });
    });
  }
 
  handleVideoPreview();
 



  function animateStaggeredSections() {
    const containers = document.querySelectorAll('[data-stagger-container]');

    containers.forEach((container) => {
      gsap.from(container.children, {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    });
  }
  animateStaggeredSections();