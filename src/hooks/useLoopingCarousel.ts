"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEvent } from "react";

export default function useLoopingCarousel(itemCount: number, mobileOnly = false) {
  const [position, setPosition] = useState(itemCount);
  const [animating, setAnimating] = useState(false);
  const moving = useRef(false);
  const gesture = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const move = useCallback((direction: number) => {
    if (moving.current) return;
    moving.current = true;
    setAnimating(true);
    setPosition((value) => value + direction);
  }, []);

  useEffect(() => {
    if (!animating) return;
    const timer = window.setTimeout(() => {
      setAnimating(false);
      setPosition(itemCount + (position % itemCount));
      moving.current = false;
    }, 750);
    return () => window.clearTimeout(timer);
  }, [animating, position, itemCount]);

  useEffect(() => {
    if (paused || hovered || focused || dragging) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");
    const timer = window.setInterval(() => {
      if (!reducedMotion.matches && document.visibilityState === "visible" && (!mobileOnly || mobile.matches)) move(1);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, dragging, move, mobileOnly]);

  function finishDrag(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const start = gesture.current;
    if (!start || start.pointerId !== event.pointerId) return;
    gesture.current = null;
    const distance = event.clientX - start.x;
    const threshold = Math.min(80, event.currentTarget.clientWidth * 0.15);
    const horizontal = Math.abs(distance) > Math.abs(event.clientY - start.y);
    setDragOffset(0);
    setDragging(false);
    move(!cancelled && horizontal && Math.abs(distance) > threshold ? (distance < 0 ? 1 : -1) : 0);
  }

  const regionProps: HTMLAttributes<HTMLDivElement> = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocusCapture: () => setFocused(true),
    onBlurCapture: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
    },
  };

  const viewportEvents: HTMLAttributes<HTMLDivElement> = {
    tabIndex: 0,
    "aria-live": paused ? "polite" : "off",
    onKeyDown: (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        move(event.key === "ArrowRight" ? 1 : -1);
      } else if (event.key === " ") {
        event.preventDefault();
        setPaused((value) => !value);
      }
    },
    onPointerDown: (event) => {
      if (moving.current || !event.isPrimary || event.button !== 0) return;
      gesture.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      const start = gesture.current;
      if (!start || start.pointerId !== event.pointerId) return;
      const distance = event.clientX - start.x;
      if (Math.abs(distance) > Math.abs(event.clientY - start.y)) {
        const limit = Math.min(400, event.currentTarget.clientWidth * 0.7);
        setDragOffset(Math.max(-limit, Math.min(limit, distance)));
      }
    },
    onPointerUp: (event) => finishDrag(event),
    onPointerCancel: (event) => finishDrag(event, true),
    onLostPointerCapture: (event) => finishDrag(event, true),
  };

  return {
    position,
    regionProps,
    viewportProps: { ...viewportEvents, "data-dragging": dragging },
    trackProps: {
      "data-animate": animating,
      style: { "--position": position, "--drag-offset": `${dragOffset}px` } as CSSProperties,
    },
  };
}
