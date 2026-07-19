import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export function useReducedMotion() {
  const prefersReduced = useFramerReducedMotion();

  // If user prefers reduced motion, return an instant transition object.
  // We can spread this into any motion component's `transition` prop.
  const transition = prefersReduced 
    ? { duration: 0, type: 'tween' } 
    : { type: 'spring', stiffness: 400, damping: 25 };

  return {
    prefersReduced,
    transition,
  };
}
