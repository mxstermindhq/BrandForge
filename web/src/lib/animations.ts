/**
 * Shared animation variants for Framer Motion
 * Follows the motion system specification:
 * - Fast in, slow to settle (150-600ms)
 * - Ease-out-expo for entrances
 * - Respects prefers-reduced-motion
 */

import { Variants } from 'framer-motion';

// Easing curves as specified
const easeOutExpo = [0.16, 1, 0.3, 1];
const easeOutQuart = [0.25, 1, 0.5, 1];
const easeInOut = [0.4, 0, 0.2, 1];

// Durations in seconds
const durationFast = 0.15;
const durationBase = 0.25;
const durationSlow = 0.4;
const durationHero = 0.6;

/**
 * Fade up animation - most common entrance
 * Used for: headlines, cards, section content
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

/**
 * Simple fade in
 * Used for: images, subtle elements
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durationSlow, ease: easeOutQuart },
  },
};

/**
 * Scale in with fade
 * Used for: product previews, modal entrances
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durationHero, ease: easeOutExpo },
  },
};

/**
 * Stagger container for choreographed entrances
 * Used for: hero sections, card grids
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger container with longer delay for hero
 */
export const heroStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * Card stagger for grid layouts
 */
export const cardStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/**
 * Logo/brand stagger
 */
export const logoStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

/**
 * Slide in from left
 * Used for: sidebar elements, left-aligned content
 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durationSlow, ease: easeOutExpo },
  },
};

/**
 * Slide in from right
 * Used for: right-aligned content
 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durationSlow, ease: easeOutExpo },
  },
};

/**
 * Card hover animation config
 */
export const cardHover = {
  y: -4,
  transition: { duration: durationBase, ease: easeInOut },
};

/**
 * Button press animation config
 */
export const buttonPress = {
  scale: 0.98,
  transition: { duration: durationFast, ease: easeInOut },
};

/**
 * Accordion content animation
 */
export const accordionContent: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: durationBase, ease: easeOutExpo },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: durationFast, ease: easeInOut },
  },
};

/**
 * Price morph animation for billing toggle
 */
export const priceMorph: Variants = {
  initial: { y: 8, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -8, opacity: 0 },
};
