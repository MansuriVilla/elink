const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

document.addEventListener("DOMContentLoaded", function () {
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
    const containers = document.querySelectorAll("[data-stagger-container]");

    containers.forEach((container) => {
      gsap.from(container.children, {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container,
          start: "top 95%",
          toggleActions: "play none none none",
          markers: false,
        },
      });
    });
  }
  animateStaggeredSections();


function animateHeroProfile() {
  gsap.registerPlugin(ScrollTrigger);

  const floatingBottom = document.querySelector(".floating-content__bottom");
  const bottomInner = document.querySelector(".bottom__inner");
  const bottomTop = document.querySelector(".bottom_top");
  const contactCtas = document.querySelector(".contact-ctas");
  const contactCtasLinks = document.querySelectorAll(".contact-ctas a");

  // Pin the element when it reaches the top
  ScrollTrigger.create({
    trigger: floatingBottom,
    start: "top 1%",
    end: "+=2000",
    pin: true,
    pinSpacing: false,
    onEnter: () => {
      floatingBottom.classList.add("sticky-active");

      const tl = gsap.timeline();
      tl.to(contactCtasLinks, {
        y: 20,
        scale: 0,
        opacity: 0,
        duration: 0.3,
        stagger: {
          each: 0.05,
          from: "end",
        },
        ease: "power2.in",
      }).to(
        contactCtas,
        {
          height: 0,
          padding: 0,
          margin: 0,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            contactCtas.style.display = "none";
            setTimeout(() => {
              contactCtas.style.display = "";
            }, 0);
          },
        },
        "-=0.2"
      );
    },
    onLeaveBack: () => {
      floatingBottom.classList.remove("sticky-active");

      const tl = gsap.timeline();
      tl.to(contactCtas, {
        height: "auto",
        padding: "initial",
        margin: "initial",
        duration: 0.3,
        ease: "power2.out",
        onStart: () => {
          contactCtas.style.display = "";
        },
      }).to(
        contactCtasLinks,
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.3,
          stagger: {
            each: 0.05,
            from: "end",
          },
          ease: "power2.out",
        },
        "-=0.2"
      );
    },
  });

  gsap.fromTo(
    floatingBottom,
    { opacity: 0, y: -20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: floatingBottom,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    }
  );
}

// Call the function
// animateHeroProfile();


function parallexHero() {
  const videoRefs = document.querySelectorAll(".has_parallex");

  if (!videoRefs.length) {
    console.warn("No elements found: .has_parallex");
    return;
  }

  const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  const handleScroll = throttle(() => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;

    videoRefs.forEach((videoRef, index) => {
      const rect = videoRef.getBoundingClientRect();
      const elementTop = rect.top + scrollPosition;
      const elementBottom = elementTop + rect.height;

      const startScroll = elementTop - windowHeight * 0.5;
      const endScroll = elementBottom - windowHeight * 0.1;

      let progress = (scrollPosition - startScroll) / (endScroll - startScroll);
      progress = Math.max(0, Math.min(1, progress));

      // Ensure initial translateY is 0 when at the top
      const translateY = progress * 100 * (index + 1);
      videoRef.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, ${translateY}, 0, 1)`;
    });
  }, 1);

  const handleResize = throttle(() => {
    handleScroll();
  }, 100);

  // Initialize all elements with translateY: 0 to avoid initial gap
  videoRefs.forEach((videoRef) => {
    videoRef.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`;

    // Add class when image/video is loaded
    const media = videoRef.querySelector("img, video");
    if (media) {
      if (media.complete) {
        videoRef.classList.add("parallax-loaded");
      } else {
        media.addEventListener("load", () => {
          videoRef.classList.add("parallax-loaded");
        });
        media.addEventListener("error", () => {
          videoRef.classList.add("parallax-loaded"); // Add class even if load fails
        });
      }
    }
  });

  // Intersection Observer to add class when in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("parallax-in-view");
        } else {
          entry.target.classList.remove("parallax-in-view");
        }
      });
    },
    {
      root: null, // Use viewport as root
      rootMargin: "0px", // No margin
      threshold: 0.5, // Trigger when 50% of the element is visible
    }
  );

  videoRefs.forEach((videoRef) => {
    observer.observe(videoRef);
  });

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleResize);

  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
    observer.disconnect(); // Clean up observer
  };
}

parallexHero();

function animateHeroProfile() {
  gsap.registerPlugin(ScrollTrigger);

  const floatingBottom = document.querySelector(".floating-content__bottom");

  // Select both the statistics and contact elements to hide
  const contactCtasHide = document.querySelectorAll(".statistics-inner.has_effect, .bottom-contact__ctas .has_effect");
  const contactCtasLinksHide = document.querySelectorAll(".statistics-inner .has_effect_item, .bottom-contact__ctas .has_effect .has_effect_item");

  const contactCtasShow = document.querySelector(".on__header.has_effect_on-scroll");
  const contactCtasLinksShow = document.querySelectorAll(".on__header.has_effect_on-scroll .has_effect_item");

  // Initial state setup: Ensure the elements to show are hidden on page load.
  gsap.set(contactCtasShow, { opacity: 0, height: 0, padding: 0, margin: 0 });
  gsap.set(contactCtasLinksShow, { y: 20, scale: 0, opacity: 0 });

  ScrollTrigger.create({
    trigger: floatingBottom,
    start: "top 1%",
    end: "+=2000",
    pin: true,
    pinSpacing: false,
    onEnter: () => {
      floatingBottom.classList.add("sticky-active");

      const tl = gsap.timeline();
      // Animate the hiding of the original elements
      tl.to(contactCtasLinksHide, {
        y: 20,
        scale: 0,
        opacity: 0,
        duration: 0.3,
        stagger: { each: 0.05, from: "end" },
        ease: "power2.in",
      })
      .to(
        contactCtasHide,
        {
          opacity: 0,
          height: 0,
          padding: 0,
          margin: 0,
          duration: 0.3,
          ease: "power2.out",
          // overflow: 'hidden'
        },
        "-=0.2"
      )
      // Animate the showing of the new elements
      .to(
        contactCtasShow,
        {
          opacity: 1,
          height: "auto",
          padding: "initial",
          margin: "initial",
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.2"
      )
      .to(
        contactCtasLinksShow,
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.3,
          stagger: { each: 0.05, from: "end" },
          ease: "power2.out",
        },
        "<"
      );
    },
    onLeaveBack: () => {
      floatingBottom.classList.remove("sticky-active");

      const tl = gsap.timeline();
      // Animate the hiding of the new elements
      tl.to(contactCtasLinksShow, {
        y: 20,
        scale: 0,
        opacity: 0,
        duration: 0.3,
        stagger: { each: 0.05, from: "end" },
        ease: "power2.in",
      })
      .to(
        contactCtasShow,
        {
          opacity: 0,
          height: 0,
          padding: 0,
          margin: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.2"
      )
      // Animate the showing of the original elements
      .to(
        contactCtasHide,
        {
          opacity: 1,
          height: "auto",
          padding: "initial",
          margin: "initial",
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.2"
      )
      .to(
        contactCtasLinksHide,
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.3,
          stagger: { each: 0.05, from: "end" },
          ease: "power2.out",
        },
        "<"
      );
    },
  });

  gsap.fromTo(
    floatingBottom,
    { opacity: 0, y: -20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: floatingBottom,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    }
  );
}

animateHeroProfile();
});
