import styles from "./TourExitConfirmation.module.css";

/** Uses the browser's modal top layer so the confirmation stays above driver.js. */
export function confirmTourExit(message: string, signal: AbortSignal, labels = {
    title: "Sair do tutorial?", cancel: "Continuar tutorial", confirm: "Sair do tutorial",
}): Promise<boolean> {
    if (signal.aborted) return Promise.resolve(false);

    return new Promise((resolve) => {
        const dialog = document.createElement("dialog");
        dialog.className = styles.dialog;
        dialog.setAttribute("aria-labelledby", "tour-exit-title");
        dialog.setAttribute("aria-describedby", "tour-exit-description");
        dialog.innerHTML = `
            <div class="${styles.icon}" aria-hidden="true">?</div>
            <h2 id="tour-exit-title">Sair do tutorial?</h2>
            <p id="tour-exit-description"></p>
            <div class="${styles.actions}">
                <button type="button" data-action="continue" autofocus>Continuar tutorial</button>
                <button type="button" data-action="exit">Sair do tutorial</button>
            </div>`;
        dialog.querySelector("p")!.textContent = message;
        dialog.querySelector("h2")!.textContent = labels.title;
        dialog.querySelector('[data-action="continue"]')!.textContent = labels.cancel;
        dialog.querySelector('[data-action="exit"]')!.textContent = labels.confirm;

        const finish = (confirmed: boolean) => {
            signal.removeEventListener("abort", abort);
            dialog.close();
            dialog.remove();
            resolve(confirmed);
        };
        const abort = () => finish(false);
        signal.addEventListener("abort", abort, { once: true });
        dialog.querySelector('[data-action="continue"]')!.addEventListener("click", () => finish(false));
        dialog.querySelector('[data-action="exit"]')!.addEventListener("click", () => finish(true));
        dialog.addEventListener("cancel", (event) => {
            event.preventDefault();
            finish(false);
        });
        // Keep driver.js from interpreting dialog keyboard/click events as tour navigation.
        dialog.addEventListener("keydown", (event) => event.stopPropagation());
        dialog.addEventListener("keyup", (event) => event.stopPropagation());
        dialog.addEventListener("click", (event) => event.stopPropagation());
        document.body.appendChild(dialog);
        dialog.showModal();
    });
}

export function confirmAction(message: string): Promise<boolean> {
    return confirmTourExit(message, new AbortController().signal, {
        title: "Confirmar ação?", cancel: "Cancelar", confirm: "Sim, confirmar",
    });
}
