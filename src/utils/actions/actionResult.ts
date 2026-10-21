/** Only explicitly handled failures are sent across the Server Action boundary. */
export interface ActionFailure {
    message: string;
    code?: string;
    status?: number;
    errors?: ApiProblem['errors'];
}

export type ActionResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: ActionFailure };

/** A message intentionally prepared for display; never includes server stack traces. */
export class ActionError extends Error {
    readonly code?: string;
    readonly status?: number;
    readonly errors?: ApiProblem['errors'];

    constructor(message: string, options?: ErrorOptions & Partial<ActionFailure>) {
        super(message, options);
        this.name = 'ActionError';
        this.code = options?.code;
        this.status = options?.status;
        this.errors = options?.errors;
    }
}

/** Runs in the caller, after the server has returned a plain, serializable result. */
export function unwrapActionResult<T>(result: ActionResult<T>): T {
    if (!result.ok) throw new ActionError(result.error.message, result.error);
    return result.data;
}
