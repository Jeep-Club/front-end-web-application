import { handleVehicleModalEnter } from '@/utils/vehicles/modalEnter';

function setup(options: { outside?: boolean; body?: boolean; button?: boolean; stepTab?: boolean; textarea?: boolean; cropDialog?: boolean } = {}) {
    const body = { closest: () => null };
    const button = { getAttribute: () => options.stepTab ? 'step' : null };
    const target = options.body ? body : {
        closest: (selector: string) => selector === 'button' ? (options.button || options.stepTab ? button : null) : options.textarea ? {} : null,
    };
    const root = {
        ownerDocument: { body, documentElement: {}, querySelector: () => options.cropDialog ? {} : null },
        closest: () => ({ contains: () => !options.outside }),
    } as unknown as HTMLElement;
    const event = { key: 'Enter', target, preventDefault: jest.fn(), repeat: false } as unknown as KeyboardEvent;
    const proceed = jest.fn();
    return { event, root, proceed };
}

it.each([{}, { body: true }, { stepTab: true }])('handles Enter from fields, no focused control, or the active step tab: %j', (options) => {
    const { event, root, proceed } = setup(options);
    handleVehicleModalEnter(event, root, proceed);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(proceed).toHaveBeenCalledTimes(1);
});

it.each([{ outside: true }, { button: true }, { textarea: true }, { cropDialog: true }])('does not hijack other controls or dialogs: %j', (options) => {
    const { event, root, proceed } = setup(options);
    handleVehicleModalEnter(event, root, proceed);
    expect(proceed).not.toHaveBeenCalled();
});

it.each([{ key: 'Escape' }, { isComposing: true }, { ctrlKey: true }, { defaultPrevented: true }, { repeat: true }])('ignores non-action keys and repeated presses: %j', (override) => {
    const { event, root, proceed } = setup();
    Object.assign(event, override);
    handleVehicleModalEnter(event, root, proceed);
    expect(proceed).not.toHaveBeenCalled();
});
