"use client";

import { useEffect } from "react";

/** Handles shared modals and native dialogs, including content loaded asynchronously. */
export function useModalScrollCorners() {
    useEffect(() => {
        let frame = 0;
        const marked = new Set<HTMLElement>();
        const observed = new Set<HTMLElement>();
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        const resize = new ResizeObserver(schedule);
        function update() {
            frame = 0;
            const nextMarked = new Set<HTMLElement>();
            const nextObserved = new Set<HTMLElement>();
            const panels = document.querySelectorAll<HTMLElement>('[data-modal-content] > *, dialog[open], [role="dialog"], [role="alertdialog"]');
            for (const panel of panels) {
                nextObserved.add(panel);
                for (const element of [panel, ...panel.querySelectorAll<HTMLElement>("*")]) {
                    const overflow = getComputedStyle(element).overflowY;
                    if (overflow !== "auto" && overflow !== "scroll") continue;
                    nextObserved.add(element);
                    if (element.clientHeight > 0 && element.scrollHeight > element.clientHeight + 1) {
                        nextMarked.add(element);
                        nextMarked.add(panel);
                    }
                }
            }
            for (const element of marked) {
                if (!nextMarked.has(element)) element.removeAttribute("data-modal-scroll");
            }
            for (const element of nextMarked) element.setAttribute("data-modal-scroll", "");
            marked.clear();
            nextMarked.forEach(element => marked.add(element));
            for (const element of observed) {
                if (!nextObserved.has(element)) { resize.unobserve(element); observed.delete(element); }
            }
            for (const element of nextObserved) {
                if (!observed.has(element)) { resize.observe(element); observed.add(element); }
            }
        }
        const mutations = new MutationObserver(schedule);
        mutations.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "style", "open"] });
        window.addEventListener("resize", schedule);
        document.addEventListener("load", schedule, true);
        schedule();
        return () => {
            cancelAnimationFrame(frame);
            mutations.disconnect();
            resize.disconnect();
            window.removeEventListener("resize", schedule);
            document.removeEventListener("load", schedule, true);
            marked.forEach(element => element.removeAttribute("data-modal-scroll"));
        };
    }, []);
}
