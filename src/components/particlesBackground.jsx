import React, { Suspense } from "react";

const Particles = React.lazy(() =>
    import("react-tsparticles").then(mod => ({ default: mod.default }))
);

const particleOptions = {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#5a5af0" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#5a5af0",
            opacity: 0.4,
            width: 1,
        },
        move: {
            enable: true,
            speed: 6,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
        },
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
            resize: true,
        },
        modes: {
            repulse: { distance: 200, duration: 0.4 },
            push: { particles_nb: 4 },
        },
    },
    retina_detect: true,
};

const ParticlesBackground = () => (
    <Suspense fallback={null}>
        <Particles
            id="particles-js"
            className="absolute inset-0 z-0"
            options={particleOptions}
        />
    </Suspense>
);

export default ParticlesBackground;