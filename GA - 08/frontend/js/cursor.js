 // scroll smoother
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth:1.1,   // higher = smoother
      effects: true  // enable effects like parallax
    });