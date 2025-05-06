/**
 * useMutationObserver hook.
 *
 * @since 4.0.0
 *
 * @param {Node}                 targetNode       Target node
 * @param {MutationCallback}     mutationCallback Callback function
 * @param {MutationObserverInit} config           (Optional) MutationObserverInit
 */
const useMutationObserver = (
    targetNode: Node,
    mutationCallback: MutationCallback,
    config?: MutationObserverInit
) => {
    const observer = new MutationObserver( mutationCallback );
    observer.observe( targetNode, config );

    return observer;
};

export default useMutationObserver;
